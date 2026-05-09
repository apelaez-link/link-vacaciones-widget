<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { listen } from '@tauri-apps/api/event';
  import LoginView from './components/LoginView.svelte';
  import PopoverMain from './components/PopoverMain.svelte';
  import SettingsPanel from './components/SettingsPanel.svelte';
  import { sessionToken, userName, isAuthenticated } from './stores/auth';
  import { todayCheckin, pendingList, refTime, isLoading, weeklyMinutes } from './stores/checkin';
  import { settings } from './stores/settings';
  import { loadToken, clearToken } from './lib/auth';
  import { fetchTodayStatus, fetchUserProfile, fetchUserSettings, fetchWeekSummary } from './lib/api';
  import { syncTrayIcon } from './lib/tray';
  import { scheduleNotifications } from './lib/notifications';
  import { isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';
  import { invoke } from '@tauri-apps/api/core';
  import { get } from 'svelte/store';
  import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
  import { LogicalSize } from '@tauri-apps/api/window';

  type View = 'login' | 'popover' | 'settings';
  let view = $state<View>('login');

  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let tickInterval: ReturnType<typeof setInterval> | null = null;
  let unlisten: (() => void) | null = null;
  let unlistenSleep: (() => void) | null = null;
  let unlistenFocus: (() => void) | null = null;
  let resizeObserver: ResizeObserver | null = null;

  // ── Platform detection ───────────────────────────────────────────────
  function detectPlatform(): 'macos' | 'ios' | 'android' {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) return 'android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    return 'macos';
  }

  onMount(async () => {
    document.documentElement.dataset.platform = detectPlatform();
    // Pedir permiso de notificaciones al arrancar (solo la primera vez)
    const granted = await isPermissionGranted();
    if (!granted) await requestPermission();

    // Ajustar altura de la ventana al contenido (dinámica)
    const appEl = document.querySelector('.app') as HTMLElement | null;
    if (appEl) {
      const win = getCurrentWebviewWindow();
      const updateHeight = () => {
        const h = appEl.offsetHeight + 18; // 18 = 9px padding top + bottom
        win.setSize(new LogicalSize(320, h)).catch(() => {});
      };
      resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(appEl);
      updateHeight();
    }

    await initAuth();

    // Listen for deep link auth token from Rust
    unlisten = await listen<string>('auth:token-received', async (event) => {
      const token = event.payload;
      sessionToken.set(token);
      await loadUserAndStatus();
      view = 'popover';
      startPolling();
    });

    // Refrescar datos al abrir el widget desde el tray
    unlistenFocus = await listen('widget-focused', async () => {
      if (get(isAuthenticated)) {
        await loadUserAndStatus();
      }
    });

    // Listen for system sleep — notificar fichajes abiertos (sin cerrarlos automáticamente)
    unlistenSleep = await listen('system:will-sleep', async () => {
      const checkin = get(todayCheckin);
      if (checkin && !checkin.checked_out_at) {
        const { isPermissionGranted: isPG, sendNotification } = await import('@tauri-apps/plugin-notification');
        if (await isPG()) {
          sendNotification({
            title: 'Fichaje abierto',
            body: 'Tienes un fichaje sin cerrar. Recuerda ajustarlo en Link Vacaciones.',
          });
        }
      }
    });

    // Load persisted settings
    try {
      const saved = await invoke<{
        ref_in: string; ref_out: string;
        notify_checkin: boolean; notify_checkout: boolean; grace_minutes: number;
      }>('get_settings');
      if (saved) {
        settings.set({
          refIn: saved.ref_in, refOut: saved.ref_out,
          notifyCheckin: saved.notify_checkin, notifyCheckout: saved.notify_checkout,
          graceMinutes: saved.grace_minutes,
        });
      }
    } catch (_) {}

    // Tick elapsed time every 30s
    tickInterval = setInterval(() => {
      todayCheckin.update(c => c ? { ...c } : c);
    }, 30_000);
  });

  onDestroy(() => {
    if (pollInterval) clearInterval(pollInterval);
    if (tickInterval) clearInterval(tickInterval);
    unlisten?.();
    unlistenSleep?.();
    unlistenFocus?.();
    resizeObserver?.disconnect();
  });

  async function initAuth() {
    const token = await loadToken();
    if (!token) {
      view = 'login';
      return;
    }
    sessionToken.set(token);
    await loadUserAndStatus();
    view = 'popover';
    startPolling();
  }

  async function loadUserAndStatus() {
    isLoading.set(true);
    try {
      const [profile, status, remoteSettings] = await Promise.all([
        fetchUserProfile(),
        fetchTodayStatus(),
        fetchUserSettings(),
      ]);
      userName.set(profile.name);
      todayCheckin.set(status.today);
      pendingList.set(status.pending);
      refTime.set(status.ref_time);
      // Preferencias de la web tienen prioridad; si no hay, se mantienen las locales
      if (remoteSettings) {
        settings.set(remoteSettings);
        invoke('save_settings', { settings: {
          ref_in: remoteSettings.refIn, ref_out: remoteSettings.refOut,
          notify_checkin: remoteSettings.notifyCheckin, notify_checkout: remoteSettings.notifyCheckout,
          grace_minutes: remoteSettings.graceMinutes,
        }}).catch(() => {});
      }
      const weekData = await fetchWeekSummary();
      weeklyMinutes.set(weekData.total_minutes);
      await syncTrayIcon(status.today);
      await scheduleNotifications(get(settings), status.today);
    } catch (e) {
      if ((e as Error).message === 'UNAUTHENTICATED') {
        await clearToken();
        sessionToken.set(null);
        view = 'login';
      }
    } finally {
      isLoading.set(false);
    }
  }

  function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(async () => {
      if (!get(isAuthenticated)) return;
      try {
        const status = await fetchTodayStatus();
        todayCheckin.set(status.today);
        pendingList.set(status.pending);
        await syncTrayIcon(status.today);
        await scheduleNotifications(get(settings), status.today);
      } catch (_) {}
    }, 60_000);
  }
</script>

<div class="app">
  {#if view === 'login'}
    <LoginView onTokenSaved={async () => {
      const token = await loadToken();
      if (token) {
        sessionToken.set(token);
        await loadUserAndStatus();
        view = 'popover';
        startPolling();
      }
    }} />
  {:else if view === 'settings'}
    <SettingsPanel onBack={() => view = 'popover'} />
  {:else}
    <PopoverMain
      onSettings={() => view = 'settings'}
      onSignOut={() => { view = 'login'; if (pollInterval) { clearInterval(pollInterval); pollInterval = null; } }}
      onRefresh={loadUserAndStatus}
    />
  {/if}
</div>

<style>
  :global(*) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(html) { background: transparent; }
  :global(body) {
    background: transparent;
    padding: 9px;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
    color: #1c1c1e;
    -webkit-font-smoothing: antialiased;
    user-select: none;
  }
  .app {
    background: #ffffff;
    border-radius: 13px;
    overflow: hidden;
    /* CSS shadow (macOS shadow disabled — avoids the tight black outline artifact) */
    box-shadow:
      0 0 0 0.5px rgba(0, 0, 0, 0.08),   /* subtle ring, respects border-radius */
      0 4px 6px  rgba(0, 0, 0, 0.07),
      0 12px 24px rgba(0, 0, 0, 0.12),
      0 24px 48px rgba(0, 0, 0, 0.08);
  }

  /* ── Mobile (iOS / Android) ── */
  /* macOS window is fixed 320×~480px; mobile is full-screen (min-height > 600px) */
  @media (min-height: 600px) {
    :global(html), :global(body) {
      background: #ffffff;
      height: 100%;
    }
    :global(body) {
      padding: 0;
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
      overflow-y: auto;
    }
    .app {
      border-radius: 0;
      box-shadow: none;
      min-height: 100dvh;
      overflow: visible;
    }
  }

  /* ── Touch target enlargement on mobile ── */
  @media (pointer: coarse) {
    :global(button), :global(a) {
      min-height: 44px;
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     PLATFORM TOKENS — set as CSS custom properties on <html>
     Each platform overrides these; components reference var(--pt-*)
     ══════════════════════════════════════════════════════════════════════ */

  /* macOS: compact, precise, system material */
  :global([data-platform="macos"]) {
    --pt-accent:        #0071E3;
    --pt-accent-hover:  #005BB5;
    --pt-radius-btn:    7px;
    --pt-radius-card:   10px;
    --pt-font-btn:      13px;
    --pt-weight-btn:    500;
    --pt-pad-section:   10px 16px;
    --pt-bg-body:       transparent;
    --pt-bg-header:     rgba(246, 246, 246, 0.96);
    --pt-shadow-card:   0 1px 3px rgba(0,0,0,0.12);
    --pt-divider:       rgba(0,0,0,0.10);
  }

  /* iOS 26: spacious, frosted, SF Pro, stadium CTAs */
  :global([data-platform="ios"]) {
    --pt-accent:        #007AFF;
    --pt-accent-hover:  #005EC4;
    --pt-radius-btn:    14px;
    --pt-radius-card:   16px;
    --pt-font-btn:      17px;
    --pt-weight-btn:    600;
    --pt-pad-section:   16px 20px;
    --pt-bg-body:       #F2F2F7;
    --pt-bg-header:     rgba(255,255,255,0.82);
    --pt-shadow-card:   0 2px 8px rgba(0,0,0,0.08);
    --pt-divider:       rgba(60,60,67,0.18);
  }
  :global([data-platform="ios"] body) {
    background: #F2F2F7 !important;
  }
  /* .app is scoped — use selector outside :global() so Svelte adds the hash */
  :global([data-platform="ios"]) .app {
    background: #F2F2F7 !important;
  }

  /* Android Material You: Roboto, pill CTAs, tonal surfaces */
  :global([data-platform="android"]) {
    --pt-accent:        #4085F7;
    --pt-accent-hover:  #2D6FE8;
    --pt-radius-btn:    100px;
    --pt-radius-card:   20px;
    --pt-font-btn:      16px;
    --pt-weight-btn:    500;
    --pt-pad-section:   14px 16px;
    --pt-bg-body:       #ECF0FF;
    --pt-bg-header:     #FFFFFF;
    --pt-shadow-card:   0 2px 6px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06);
    --pt-divider:       rgba(0,0,0,0.08);
  }
  :global([data-platform="android"] body) {
    background: #ECF0FF !important;
    font-family: 'Google Sans', Roboto, system-ui, sans-serif;
  }
  :global([data-platform="android"]) .app {
    background: #ECF0FF !important;
  }
</style>
