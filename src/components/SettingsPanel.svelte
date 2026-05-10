<script lang="ts">
  import { settings } from '../stores/settings';
  import { invoke } from '@tauri-apps/api/core';
  import { saveUserSettings } from '../lib/api';
  import { enable as enableAutostart, disable as disableAutostart, isEnabled as isAutostartEnabled } from '@tauri-apps/plugin-autostart';
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';

  const { onBack }: { onBack: () => void } = $props();

  // Detect iOS synchronously — used for inline layout styles that bypass CSS scoping
  const isIos = typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  let refIn = $state($settings.refIn);
  let refOut = $state($settings.refOut);
  let notifyCheckin = $state($settings.notifyCheckin);
  let notifyCheckout = $state($settings.notifyCheckout);
  let graceMinutes = $state($settings.graceMinutes);
  let autostart = $state(false);
  let saving = $state(false);
  let saved = $state(false);
  let error = $state('');

  onMount(async () => {
    autostart = await isAutostartEnabled();
  });

  async function toggleAutostart() {
    if (autostart) {
      await disableAutostart();
      autostart = false;
    } else {
      await enableAutostart();
      autostart = true;
    }
  }

  // Validate HH:MM format
  function isValidTime(v: string): boolean {
    return /^\d{2}:\d{2}$/.test(v) && Number(v.split(':')[0]) < 24 && Number(v.split(':')[1]) < 60;
  }

  async function handleSave() {
    error = '';
    if (!isValidTime(refIn))  { error = 'Hora de entrada inválida (usa HH:MM)';  return; }
    if (!isValidTime(refOut)) { error = 'Hora de salida inválida (usa HH:MM)'; return; }
    saving = true;
    const s = { refIn, refOut, notifyCheckin, notifyCheckout, graceMinutes };
    settings.set(s);
    await invoke('save_settings', { settings: {
      ref_in: refIn, ref_out: refOut,
      notify_checkin: notifyCheckin, notify_checkout: notifyCheckout,
      grace_minutes: graceMinutes,
    }});
    try { await saveUserSettings(s); } catch (_) { /* endpoint may not be live yet */ }
    saving = false;
    saved = true;
    setTimeout(() => { saved = false; }, 1500);
  }
</script>

<div class="panel" style={isIos ? 'display:grid;grid-template-rows:auto 1fr auto;height:100dvh;overflow:hidden' : ''}>
  <div class="header">
    <button class="back-btn" onclick={onBack}><Icon name="arrow-back" size={16} /></button>
    <span>Ajustes de fichajes</span>
  </div>

  <div class="scroll-content">
  <div class="section">
    <div class="section-label">Horario de referencia</div>
    <div class="row">
      <div>
        <div class="label">Entrada</div>
        <div class="sub">formato 24h — ej. 09:00</div>
      </div>
      <input
        class="time-input"
        type="text"
        inputmode="numeric"
        placeholder="09:00"
        maxlength="5"
        bind:value={refIn}
        oninput={(e) => {
          // Auto-insert colon after 2 digits
          const v = (e.target as HTMLInputElement).value.replace(/[^0-9:]/g, '');
          if (v.length === 2 && !v.includes(':')) refIn = v + ':';
          else refIn = v;
        }}
      />
    </div>
    <div class="row">
      <div>
        <div class="label">Salida</div>
        <div class="sub">formato 24h — ej. 18:00</div>
      </div>
      <input
        class="time-input"
        type="text"
        inputmode="numeric"
        placeholder="18:00"
        maxlength="5"
        bind:value={refOut}
        oninput={(e) => {
          const v = (e.target as HTMLInputElement).value.replace(/[^0-9:]/g, '');
          if (v.length === 2 && !v.includes(':')) refOut = v + ':';
          else refOut = v;
        }}
      />
    </div>
  </div>

  <div class="section">
    <div class="section-label">Notificaciones</div>
    <div class="row">
      <div>
        <div class="label">Recordar fichaje entrada</div>
        <div class="sub">Avisa si no has fichado tras la hora ref.</div>
      </div>
      <button class="toggle {notifyCheckin ? 'on' : 'off'}" aria-label="Activar recordatorio de entrada" onclick={() => notifyCheckin = !notifyCheckin}>
        <div class="thumb"></div>
      </button>
    </div>
    <div class="row">
      <div>
        <div class="label">Margen de aviso</div>
        <div class="sub">minutos después de la hora ref.</div>
      </div>
      <input class="number-input" type="number" min="0" max="60" bind:value={graceMinutes} />
    </div>
    <div class="row">
      <div>
        <div class="label">Recordar fichaje salida</div>
        <div class="sub">Avisa al superar la jornada habitual</div>
      </div>
      <button class="toggle {notifyCheckout ? 'on' : 'off'}" aria-label="Activar recordatorio de salida" onclick={() => notifyCheckout = !notifyCheckout}>
        <div class="thumb"></div>
      </button>
    </div>
  </div>

  <div class="section">
    <div class="section-label">Sistema</div>
    <div class="row">
      <div>
        <div class="label">Iniciar al arrancar</div>
        <div class="sub">Abrir automáticamente al iniciar sesión</div>
      </div>
      <button class="toggle {autostart ? 'on' : 'off'}" aria-label="Activar inicio automático" onclick={toggleAutostart}>
        <div class="thumb"></div>
      </button>
    </div>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}
  </div><!-- end scroll-content -->

  <div class="footer">
    <button class="save-btn" onclick={handleSave} disabled={saving}>
      {#if saving}Guardando…{:else if saved}Guardado{:else}Guardar cambios{/if}
    </button>
  </div>
</div>

<style>
  .panel { display: flex; flex-direction: column; height: 100%; }
  .scroll-content { flex: 1; overflow-y: auto; min-height: 0; }
  .footer { flex-shrink: 0; }
  .header {
    padding: 12px 16px; border-bottom: 1px solid rgba(0,0,0,0.08);
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 500; color: #1c1c1e;
  }
  .back-btn {
    background: none; border: none; cursor: pointer; font-size: 16px;
    padding: 2px 6px; border-radius: 6px; color: #007aff; font-family: inherit;
  }
  .back-btn:hover { background: rgba(0,0,0,0.06); }
  .section { padding: 10px 16px; border-bottom: 1px solid rgba(0,0,0,0.08); }
  .section-label {
    font-size: 10px; font-weight: 600; color: #999; text-transform: uppercase;
    letter-spacing: 0.07em; margin-bottom: 8px;
  }
  .row { display: flex; align-items: center; justify-content: space-between; padding: 5px 0; }
  .label { font-size: 12px; color: #1c1c1e; }
  .sub { font-size: 11px; color: #888; margin-top: 1px; }
  .toggle {
    width: 36px; height: 20px; border-radius: 10px;
    display: flex; align-items: center; cursor: pointer;
    padding: 2px; flex-shrink: 0; transition: background 0.2s; border: none;
  }
  .toggle.on { background: #34c759; justify-content: flex-end; }
  .toggle.off { background: #ccc; justify-content: flex-start; }
  .thumb { width: 16px; height: 16px; border-radius: 50%; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .time-input {
    font-size: 13px; padding: 4px 8px;
    border: 1px solid #d0d0d0; border-radius: 7px;
    background: white; color: #1c1c1e; width: 72px; text-align: center;
    font-family: -apple-system, monospace; letter-spacing: 0.05em;
  }
  .time-input:focus { outline: none; border-color: #007aff; box-shadow: 0 0 0 3px rgba(0,122,255,0.15); }
  .number-input {
    font-size: 13px; padding: 4px 8px;
    border: 1px solid #d0d0d0; border-radius: 7px;
    background: white; color: #1c1c1e; width: 56px; text-align: center;
    font-family: inherit;
  }
  .error {
    margin: 0 16px 4px; padding: 6px 10px;
    background: #fff0f0; border-radius: 7px;
    font-size: 11px; color: #b22222;
  }
  .footer { padding: 10px 16px; }
  .save-btn {
    width: 100%; padding: 8px; border-radius: 8px;
    background: #007aff; color: white; border: none;
    font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit;
  }
  .save-btn:hover:not(:disabled) { background: #0065d4; }
  .save-btn:disabled { opacity: 0.6; cursor: default; }

  /* ── Mobile safe areas ── */
  @media (min-height: 600px) {
    .panel { height: 100dvh; overflow: hidden; }
    .scroll-content { overflow-y: auto; -webkit-overflow-scrolling: touch; }
    .header { padding-top: calc(12px + env(safe-area-inset-top)); }
    .footer { padding-bottom: calc(10px + env(safe-area-inset-bottom)); }
    .save-btn { padding: 14px; font-size: 15px; border-radius: 12px; }
  }

  /* ── iOS: CSS Grid — header/scroll/footer in 3 explicit rows ── */
  :global([data-platform="ios"]) .panel {
    display: grid !important;
    grid-template-rows: auto 1fr auto !important;
    height: 100dvh !important;
    overflow: hidden !important;
    background: #F2F2F7;
    overscroll-behavior: none;
  }
  :global([data-platform="ios"]) .scroll-content {
    overflow-y: auto !important;
    min-height: 0 !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    padding-bottom: 16px;
  }
  :global([data-platform="ios"]) .header {
    background: rgba(255,255,255,0.82);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: calc(8px + env(safe-area-inset-top)) 20px 14px;
    font-size: 17px; font-weight: 600;
    flex-shrink: 0;
  }
  :global([data-platform="ios"]) .section {
    background: #fff;
    border-radius: 12px;
    margin: 8px 16px 0;
    padding: 0 16px;
    border-bottom: none;
  }
  :global([data-platform="ios"]) .section-label {
    font-size: 13px; color: #6E6E73; text-transform: none;
    letter-spacing: 0; font-weight: 400; padding: 8px 0 4px;
  }
  :global([data-platform="ios"]) .row {
    padding: 11px 0;
    border-bottom: 0.5px solid rgba(60,60,67,0.18);
    min-height: 44px;
  }
  :global([data-platform="ios"]) .row:last-child { border-bottom: none; }
  :global([data-platform="ios"]) .label { font-size: 17px; color: #000; }
  :global([data-platform="ios"]) .sub { font-size: 13px; color: #6E6E73; }
  :global([data-platform="ios"]) .toggle {
    width: 51px; height: 31px; border-radius: 15.5px;
    padding: 2px;
  }
  :global([data-platform="ios"]) .toggle.on { background: #34C759; }
  :global([data-platform="ios"]) .toggle.off { background: rgba(120,120,128,0.36); }
  :global([data-platform="ios"]) .thumb {
    width: 27px; height: 27px;
    box-shadow: 0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.06);
  }
  :global([data-platform="ios"]) .footer {
    flex-shrink: 0 !important;
    margin-top: 0 !important;
    background: #F2F2F7;
    padding: 12px 16px calc(12px + var(--ios-safe-bottom, env(safe-area-inset-bottom)));
  }
  :global([data-platform="ios"]) .save-btn {
    border-radius: 14px; padding: 16px; font-size: 17px; font-weight: 600;
    background: #007AFF;
    box-shadow: 0 4px 14px rgba(0,122,255,0.35);
  }
  :global([data-platform="ios"]) .time-input,
  :global([data-platform="ios"]) .number-input {
    font-size: 17px; padding: 6px 10px; border-radius: 9px;
    border-color: rgba(60,60,67,0.18);
  }

  /* ── Android: Material Switch (52×32px, tonal track, elevated thumb) ── */
  :global([data-platform="android"]) .panel {
    background: #ECF0FF;
    font-family: 'Google Sans', Roboto, system-ui, sans-serif;
  }
  :global([data-platform="android"]) .header {
    background: #FFFFFF;
    padding: calc(14px + env(safe-area-inset-top)) 16px 14px;
    font-size: 16px; font-weight: 500;
    font-family: 'Google Sans', Roboto, system-ui, sans-serif;
  }
  :global([data-platform="android"]) .section {
    background: #fff;
    border-radius: 20px;
    margin: 8px 16px 0;
    padding: 0 16px;
    border-bottom: none;
  }
  :global([data-platform="android"]) .section-label {
    font-size: 12px; color: #49454F; letter-spacing: 0.05em;
    padding: 10px 0 4px;
  }
  :global([data-platform="android"]) .row {
    padding: 12px 0;
    border-bottom: 0.5px solid rgba(0,0,0,0.08);
    min-height: 48px;
  }
  :global([data-platform="android"]) .row:last-child { border-bottom: none; }
  :global([data-platform="android"]) .label {
    font-size: 16px; color: #1C1B1F;
    font-family: 'Google Sans', Roboto, system-ui, sans-serif;
  }
  :global([data-platform="android"]) .sub {
    font-size: 13px; color: #49454F;
    font-family: Roboto, system-ui, sans-serif;
  }
  :global([data-platform="android"]) .toggle {
    width: 52px; height: 32px; border-radius: 16px;
    padding: 3px;
  }
  :global([data-platform="android"]) .toggle.on { background: #4085F7; }
  :global([data-platform="android"]) .toggle.off { background: #79747E; }
  :global([data-platform="android"]) .thumb {
    width: 26px; height: 26px;
    background: #FFFFFF;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.12);
  }
  :global([data-platform="android"]) .footer {
    padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
  }
  :global([data-platform="android"]) .save-btn {
    border-radius: 100px; padding: 16px; font-size: 16px; font-weight: 500;
    background: #4085F7;
    font-family: 'Google Sans', Roboto, system-ui, sans-serif;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.12);
  }
  :global([data-platform="android"]) .time-input,
  :global([data-platform="android"]) .number-input {
    font-size: 16px; padding: 8px 10px; border-radius: 12px;
    font-family: Roboto, system-ui, sans-serif;
  }
</style>
