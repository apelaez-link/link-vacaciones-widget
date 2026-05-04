<script lang="ts">
  import { todayCheckin, elapsedTime } from '../stores/checkin';
  import { settings } from '../stores/settings';

  function timeHHMM(iso: string) {
    return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function estimatedOut(checkedInAt: string, refOut: string) {
    const [h, m] = refOut.split(':').map(Number);
    const inDate = new Date(checkedInAt);
    const out = new Date(inDate);
    // estimate: refOut - refIn + actual checkin time
    const [inRefH, inRefM] = $settings.refIn.split(':').map(Number);
    const shiftMs = ((h - inRefH) * 60 + (m - inRefM)) * 60_000;
    return new Date(inDate.getTime() + shiftMs);
  }

  let minutesLate = $derived.by(() => {
    if ($todayCheckin) return null;
    const [h, m] = $settings.refIn.split(':').map(Number);
    const ref = new Date(); ref.setHours(h, m, 0, 0);
    const diff = Math.floor((Date.now() - ref.getTime()) / 60_000);
    return diff > 0 ? diff : null;
  });
</script>

<div class="status-section">
  <div class="status-row">
    {#if $todayCheckin && !$todayCheckin.checked_out_at}
      <div class="badge badge-in">
        <span class="dot dot-green"></span>
        Fichado desde las {timeHHMM($todayCheckin.checked_in_at)}
      </div>
      <div class="time-since">{$elapsedTime ?? ''}</div>
    {:else if $todayCheckin && $todayCheckin.checked_out_at}
      <div class="badge badge-closed">
        <span class="dot dot-gray"></span>
        Jornada cerrada
      </div>
    {:else}
      <div class="badge badge-out">
        <span class="dot dot-red"></span>
        Sin fichar
      </div>
      {#if minutesLate}
        <div class="time-since late">{minutesLate} min tarde</div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .status-section { padding: 10px 16px 0; }
  .status-row { display: flex; align-items: center; justify-content: space-between; }
  .badge {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 20px;
  }
  .badge-in { background: #d4f5e2; color: #1a6b3a; }
  .badge-out { background: #ffe5e5; color: #b22222; }
  .badge-closed { background: #f0f0f0; color: #666; }
  .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
  .dot-green { background: #34c759; }
  .dot-red { background: #ff3b30; }
  .dot-gray { background: #aeaeb2; }
  .time-since { font-size: 11px; color: #888; }
  .time-since.late { color: #b22222; }
</style>
