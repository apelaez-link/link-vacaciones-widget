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
</style>
