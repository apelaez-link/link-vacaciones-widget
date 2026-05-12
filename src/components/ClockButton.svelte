<script lang="ts">
  import { todayCheckin, isLoading, isPaused } from '../stores/checkin';
  import type { Location } from '../lib/types';
  import Icon from './Icon.svelte';

  const { location, onClockIn, onClockOut, onPause, onResume }: {
    location: Location;
    onClockIn: () => void;
    onClockOut: () => void;
    onPause: () => void;
    onResume: () => void;
  } = $props();

  let isClockedIn = $derived($todayCheckin && !$todayCheckin.checked_out_at);
</script>

<div class="action">
  {#if $isPaused}
    <!-- En pausa: solo mostrar botón de reanudar -->
    <button class="btn btn-resume" onclick={onResume} disabled={$isLoading}>
      <Icon name="play" size={16} /> Reanudar
    </button>
  {:else if isClockedIn}
    <!-- Trabajando: salida + pausa -->
    <div class="btn-row">
      <button class="btn btn-pause" onclick={onPause} disabled={$isLoading}>
        <Icon name="pause" size={15} /> Pausa
      </button>
      <button class="btn btn-out" onclick={onClockOut} disabled={$isLoading}>
        <Icon name="stop" size={15} /> Registrar salida
      </button>
    </div>
  {:else}
    <button class="btn btn-in" onclick={onClockIn} disabled={$isLoading}>
      <Icon name="play" size={16} /> Registrar entrada
    </button>
  {/if}
</div>

<style>
  .action { padding: 11px 16px; border-bottom: 1px solid rgba(0,0,0,0.08); }
  .btn-row { display: flex; gap: 8px; }
  .btn {
    flex: 1; padding: 9px 0; border-radius: 9px; border: none;
    font-size: 13px; font-weight: 500; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    font-family: inherit; transition: background 0.12s;
    box-sizing: border-box;
  }
  /* Botón único (Reanudar / Registrar entrada): ocupa el ancho completo
     igual que los dos botones (Pausa+Salir) juntos */
  .action > .btn { width: 100%; }
  .btn:disabled { opacity: 0.6; cursor: default; }
  .btn-in     { background: #34c759; color: white; }
  .btn-in:hover:not(:disabled)     { background: #2db34a; }
  .btn-out    { background: #ff3b30; color: white; }
  .btn-out:hover:not(:disabled)    { background: #e0352b; }
  .btn-pause  { background: #ff9500; color: white; flex: 0 0 auto; padding: 9px 14px; }
  .btn-pause:hover:not(:disabled)  { background: #e08600; }
  .btn-resume { background: #007aff; color: white; }
  .btn-resume:hover:not(:disabled) { background: #0065d4; }

  /* Mobile: bigger button */
  @media (min-height: 600px) {
    .action { padding: 16px; }
    .btn { padding: 16px 0; font-size: 16px; border-radius: 12px; }
    .btn-pause { padding: 16px 18px; }
    .btn-row { gap: 10px; }
  }

  /* ── iOS 26: SF Pro, stadium CTA, generous padding ── */
  :global([data-platform="ios"]) .action { padding: 16px 20px; border-bottom: 1px solid rgba(60,60,67,0.18); }
  :global([data-platform="ios"]) .btn {
    border-radius: 14px; font-size: 17px; font-weight: 600;
    padding: 18px 0; letter-spacing: -0.01em;
  }
  :global([data-platform="ios"]) .btn-pause  { padding: 18px 20px; flex: 0 0 auto; }
  :global([data-platform="ios"]) .btn-in     { background: #34C759; box-shadow: 0 2px 8px rgba(52,199,89,0.35); }
  :global([data-platform="ios"]) .btn-out    { background: #FF3B30; box-shadow: 0 2px 8px rgba(255,59,48,0.35); }
  :global([data-platform="ios"]) .btn-pause  { background: #FF9500; box-shadow: 0 2px 8px rgba(255,149,0,0.35); }
  :global([data-platform="ios"]) .btn-resume { background: #007AFF; box-shadow: 0 2px 8px rgba(0,122,255,0.35); }
  :global([data-platform="ios"]) .btn-in:hover:not(:disabled)     { background: #2DB34A; }
  :global([data-platform="ios"]) .btn-out:hover:not(:disabled)    { background: #E0352B; }
  :global([data-platform="ios"]) .btn-pause:hover:not(:disabled)  { background: #E08600; }
  :global([data-platform="ios"]) .btn-resume:hover:not(:disabled) { background: #0065D4; }

  /* ── Android Material You: pill button, letter-spacing ── */
  :global([data-platform="android"]) .action { padding: 16px; background: #ECF0FF; border-bottom: none; }
  :global([data-platform="android"]) .btn-row { gap: 10px; }
  :global([data-platform="android"]) .btn {
    border-radius: 100px; font-size: 16px; font-weight: 500;
    letter-spacing: 0.01em; padding: 16px 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.20), 0 1px 2px rgba(0,0,0,0.12);
    transition: background 0.12s, box-shadow 0.12s, transform 0.08s;
  }
  :global([data-platform="android"]) .btn-pause { padding: 16px 18px; flex: 0 0 auto; }
  :global([data-platform="android"]) .btn:active:not(:disabled) {
    transform: scale(0.98); box-shadow: 0 0 0 rgba(0,0,0,0);
  }
  :global([data-platform="android"]) .btn-in     { background: #1E6E35; }
  :global([data-platform="android"]) .btn-out    { background: #B71C1C; }
  :global([data-platform="android"]) .btn-pause  { background: #E65100; }
  :global([data-platform="android"]) .btn-resume { background: #1565C0; }
  :global([data-platform="android"]) .btn-in:hover:not(:disabled)     { background: #155228; }
  :global([data-platform="android"]) .btn-out:hover:not(:disabled)    { background: #8E1515; }
  :global([data-platform="android"]) .btn-pause:hover:not(:disabled)  { background: #BF360C; }
  :global([data-platform="android"]) .btn-resume:hover:not(:disabled) { background: #0D47A1; }

  /* ── macOS: tighter, more precise ── */
  :global([data-platform="macos"]) .action { padding: 10px 14px; }
  :global([data-platform="macos"]) .btn {
    border-radius: 7px; font-size: 12px; font-weight: 500; padding: 7px 0;
  }
  :global([data-platform="macos"]) .btn-pause { padding: 7px 12px; }
  :global([data-platform="macos"]) .btn-row { gap: 6px; }
</style>
