<script lang="ts">
  import UserHeader from './UserHeader.svelte';
  import StatusBadge from './StatusBadge.svelte';
  import WarningBanner from './WarningBanner.svelte';
  import WeeklySummary from './WeeklySummary.svelte';
  import LocationPicker from './LocationPicker.svelte';
  import ClockButton from './ClockButton.svelte';
  import TodayLog from './TodayLog.svelte';
  import FeedbackModal from './FeedbackModal.svelte';
  import { todayCheckin, isLoading } from '../stores/checkin';
  import { clockIn, clockOut, pauseCheckin, resumeCheckin } from '../lib/api';
  import { syncTrayIcon } from '../lib/tray';
  import { openUrl } from '@tauri-apps/plugin-opener';
  import type { Location } from '../lib/types';
  import Icon from './Icon.svelte';

  const { onSettings, onSignOut, onRefresh }: {
    onSettings: () => void;
    onSignOut: () => void;
    onRefresh: () => Promise<void>;
  } = $props();

  let selectedLocation = $state<Location>('REMOTE');
  let apiError = $state<string | null>(null);
  let showFeedback = $state(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://vacaciones.smartcity.link';

  async function handleClockIn() {
    isLoading.set(true);
    apiError = null;
    try {
      const result = await clockIn(selectedLocation);
      todayCheckin.set(result);
      await syncTrayIcon(result);
    } catch (e) {
      apiError = (e as Error).message;
    } finally {
      isLoading.set(false);
    }
  }

  async function handleClockOut() {
    const checkin = $todayCheckin;
    if (!checkin) return;
    isLoading.set(true);
    apiError = null;
    try {
      const result = await clockOut(checkin.id);
      todayCheckin.set(result);
      await syncTrayIcon(result);
    } catch (e) {
      apiError = (e as Error).message;
    } finally {
      isLoading.set(false);
    }
  }

  async function handlePause() {
    const checkin = $todayCheckin;
    if (!checkin) return;
    isLoading.set(true);
    apiError = null;
    try {
      const result = await pauseCheckin(checkin.id);
      todayCheckin.set(result);
      await syncTrayIcon(result);
    } catch (e) {
      apiError = (e as Error).message;
    } finally {
      isLoading.set(false);
    }
  }

  async function handleResume() {
    const checkin = $todayCheckin;
    if (!checkin) return;
    isLoading.set(true);
    apiError = null;
    try {
      const result = await resumeCheckin(checkin.id);
      todayCheckin.set(result);
      await syncTrayIcon(result);
    } catch (e) {
      apiError = (e as Error).message;
    } finally {
      isLoading.set(false);
    }
  }

  let showLocationPicker = $derived(!$todayCheckin || !!$todayCheckin.checked_out_at);
</script>

<div class="popover">
  <div class="scroll-content">
    <UserHeader {onSettings} {onSignOut} {onRefresh} />
    <StatusBadge />
    <WarningBanner />
    <WeeklySummary />

    {#if showLocationPicker}
      <LocationPicker selected={selectedLocation} onSelect={(l) => selectedLocation = l} />
    {/if}

    <ClockButton location={selectedLocation} onClockIn={handleClockIn} onClockOut={handleClockOut} onPause={handlePause} onResume={handleResume} />
    <TodayLog />

    {#if apiError}
      <div class="error">{apiError}</div>
    {/if}
  </div>

  <div class="footer">
    <button class="footer-link" onclick={() => openUrl(`${API_BASE}/checkins`)}><Icon name="history" size={13} /> Historial</button>
    <button class="feedback-fab" onclick={() => showFeedback = true} title="Enviar feedback"><Icon name="chat" size={14} /></button>
    <button class="footer-link" onclick={onSettings}><Icon name="settings" size={13} /> Ajustes</button>
  </div>
</div>


{#if showFeedback}
  <FeedbackModal onClose={() => showFeedback = false} />
{/if}

<style>
  /* ── Base layout: flex column so footer sticks to bottom ── */
  .popover { display: flex; flex-direction: column; height: 100%; }
  /* scroll-content: takes all available space, scrolls internally */
  .scroll-content { flex: 1; overflow-y: auto; min-height: 0; }
  .error { padding: 6px 16px; font-size: 11px; color: #cc3333; background: #fff0f0; }
  .footer {
    flex-shrink: 0;
    padding: 6px 12px; display: flex; justify-content: space-between; align-items: center;
    border-top: 1px solid rgba(0,0,0,0.06);
    gap: 4px;
  }
  .footer-link {
    font-size: 12px; color: #007aff; cursor: pointer;
    background: none; border: none; font-family: inherit; text-decoration: none;
    padding: 2px 4px; display: flex; align-items: center; gap: 4px;
  }
  .footer-link:hover { text-decoration: underline; }
  .feedback-fab {
    width: 26px; height: 26px; border-radius: 50%;
    background: #007aff; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: white;
    box-shadow: 0 2px 6px rgba(0,122,255,0.4);
    transition: background 0.15s, transform 0.1s;
    padding: 0; flex-shrink: 0;
  }
  .feedback-fab:hover { background: #0065d4; transform: scale(1.08); }
  .feedback-fab:active { transform: scale(0.96); }

  /* Mobile: fill exact screen height */
  @media (min-height: 600px) {
    .popover { height: 100dvh; overflow: hidden; }
    .scroll-content { overflow-y: auto; -webkit-overflow-scrolling: touch; }
    .footer { padding: 12px; padding-bottom: calc(12px + env(safe-area-inset-bottom)); }
    .footer-link { font-size: 14px; padding: 8px 6px; }
    .feedback-fab { width: 40px; height: 40px; }
  }

  /* ── iOS: flex layout — footer always at screen bottom ──
     .popover = full-screen flex column (100dvh).
     .scroll-content = flex:1, scrolls internally.
     .footer = flex-shrink:0, last child → sits at the very bottom. */
  :global([data-platform="ios"]) .popover {
    display: flex !important;
    flex-direction: column !important;
    height: 100dvh !important;
    overflow: hidden !important;
    background: #F2F2F7 !important;
    overscroll-behavior: none;
  }
  :global([data-platform="ios"]) .scroll-content {
    flex: 1 !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
  :global([data-platform="ios"]) .footer {
    flex-shrink: 0 !important;
    background: rgba(249,249,249,0.94);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    backdrop-filter: blur(40px) saturate(180%);
    border-top: 0.5px solid rgba(60,60,67,0.29);
    padding: 14px 20px;
    padding-bottom: calc(14px + var(--ios-safe-bottom, env(safe-area-inset-bottom)));
  }
  :global([data-platform="ios"]) .footer-link {
    font-size: 15px; color: #007AFF; font-weight: 500;
    padding: 10px 8px;
  }
  :global([data-platform="ios"]) .feedback-fab {
    background: #007AFF; width: 42px; height: 42px;
    box-shadow: 0 4px 12px rgba(0,122,255,0.45);
    color: white;
  }

  /* ── Android Material You: surface container footer, FAB ── */
  :global([data-platform="android"]) .popover { background: #ECF0FF !important; }
  :global([data-platform="android"]) .footer {
    background: #FFFFFF;
    border-top: none;
    box-shadow: 0 -1px 4px rgba(0,0,0,0.08);
    padding: 14px 16px;
    padding-bottom: calc(14px + env(safe-area-inset-bottom));
    border-radius: 0;
    font-family: 'Google Sans', Roboto, system-ui, sans-serif;
  }
  :global([data-platform="android"]) .footer-link {
    font-size: 14px; color: #4085F7; font-weight: 500;
    padding: 10px 8px; letter-spacing: 0.01em;
  }
  :global([data-platform="android"]) .feedback-fab {
    background: #4085F7; width: 44px; height: 44px;
    border-radius: 14px; /* M3 FAB medium shape */
    box-shadow: 0 3px 8px rgba(64,133,247,0.40), 0 1px 3px rgba(0,0,0,0.15);
    color: white;
  }
  :global([data-platform="android"]) .error {
    margin: 8px 16px; border-radius: 12px; font-size: 13px;
    font-family: Roboto, system-ui, sans-serif;
  }

  /* ── macOS: tight footer ── */
  :global([data-platform="macos"]) .footer { padding: 5px 10px; }
  :global([data-platform="macos"]) .footer-link { font-size: 11px; color: #0071E3; }
  :global([data-platform="macos"]) .feedback-fab {
    width: 24px; height: 24px; background: #0071E3; color: white;
  }
</style>
