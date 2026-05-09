<script lang="ts">
  import { todayCheckin, isLoading } from '../stores/checkin';
  import type { Location } from '../lib/types';

  const { location, onClockIn, onClockOut }: {
    location: Location;
    onClockIn: () => void;
    onClockOut: () => void;
  } = $props();

  let isClockedIn = $derived($todayCheckin && !$todayCheckin.checked_out_at);
</script>

<div class="action">
  {#if isClockedIn}
    <button class="btn btn-out" onclick={onClockOut} disabled={$isLoading}>
      ⏹ Registrar salida
    </button>
  {:else}
    <button class="btn btn-in" onclick={onClockIn} disabled={$isLoading}>
      ▶ Registrar entrada
    </button>
  {/if}
</div>

<style>
  .action { padding: 11px 16px; border-bottom: 1px solid rgba(0,0,0,0.08); }
  .btn {
    width: 100%; padding: 9px 0; border-radius: 9px; border: none;
    font-size: 13px; font-weight: 500; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    font-family: inherit; transition: background 0.12s;
  }
  .btn:disabled { opacity: 0.6; cursor: default; }
  .btn-in { background: #34c759; color: white; }
  .btn-in:hover:not(:disabled) { background: #2db34a; }
  .btn-out { background: #ff3b30; color: white; }
  .btn-out:hover:not(:disabled) { background: #e0352b; }

  /* Mobile: bigger button */
  @media (min-height: 600px) {
    .action { padding: 16px; }
    .btn { padding: 16px 0; font-size: 16px; border-radius: 12px; }
  }

  /* ── iOS 26: SF Pro, stadium CTA, generous padding ── */
  :global([data-platform="ios"]) .action { padding: 16px 20px; border-bottom: 1px solid rgba(60,60,67,0.18); }
  :global([data-platform="ios"]) .btn {
    border-radius: 14px;
    font-size: 17px;
    font-weight: 600;
    padding: 18px 0;
    letter-spacing: -0.01em;
  }
  :global([data-platform="ios"]) .btn-in  { background: #34C759; box-shadow: 0 2px 8px rgba(52,199,89,0.35); }
  :global([data-platform="ios"]) .btn-out { background: #FF3B30; box-shadow: 0 2px 8px rgba(255,59,48,0.35); }
  :global([data-platform="ios"]) .btn-in:hover:not(:disabled)  { background: #2DB34A; }
  :global([data-platform="ios"]) .btn-out:hover:not(:disabled) { background: #E0352B; }

  /* ── Android Material You: pill button, letter-spacing ── */
  :global([data-platform="android"]) .action { padding: 16px; background: #ECF0FF; border-bottom: none; }
  :global([data-platform="android"]) .btn {
    border-radius: 100px;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.01em;
    padding: 16px 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.20), 0 1px 2px rgba(0,0,0,0.12);
    transition: background 0.12s, box-shadow 0.12s, transform 0.08s;
  }
  :global([data-platform="android"]) .btn:active:not(:disabled) {
    transform: scale(0.98);
    box-shadow: 0 0 0 rgba(0,0,0,0);
  }
  :global([data-platform="android"]) .btn-in  { background: #1E6E35; }
  :global([data-platform="android"]) .btn-out { background: #B71C1C; }
  :global([data-platform="android"]) .btn-in:hover:not(:disabled)  { background: #155228; }
  :global([data-platform="android"]) .btn-out:hover:not(:disabled) { background: #8E1515; }

  /* ── macOS: tighter, more precise ── */
  :global([data-platform="macos"]) .action { padding: 10px 14px; }
  :global([data-platform="macos"]) .btn {
    border-radius: 7px;
    font-size: 13px;
    font-weight: 500;
    padding: 8px 0;
  }
</style>
