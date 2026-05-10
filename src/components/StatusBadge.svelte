<script lang="ts">
  import { todayCheckin, elapsedTime, isPaused } from '../stores/checkin';
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
    {#if $isPaused && $todayCheckin}
      <div class="badge badge-paused">
        <span class="dot dot-orange pulse"></span>
        En pausa · desde las {timeHHMM($todayCheckin.checked_in_at)}
      </div>
      <div class="time-since">{$elapsedTime ?? ''}</div>
    {:else if $todayCheckin && !$todayCheckin.checked_out_at}
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
  .badge-in     { background: #d4f5e2; color: #1a6b3a; }
  .badge-out    { background: #ffe5e5; color: #b22222; }
  .badge-closed { background: #f0f0f0; color: #666; }
  .badge-paused { background: #fff3e0; color: #b45309; }
  .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
  .dot-green  { background: #34c759; }
  .dot-red    { background: #ff3b30; }
  .dot-gray   { background: #aeaeb2; }
  .dot-orange { background: #ff9500; }
  .dot.pulse  { animation: pulse-dot 1.4s ease-in-out infinite; }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  .time-since { font-size: 11px; color: #888; }
  .time-since.late { color: #b22222; }

  /* ── iOS 26: SF-style pill badges, larger text, more padding ── */
  :global([data-platform="ios"]) .status-section { padding: 14px 20px 0; }
  :global([data-platform="ios"]) .badge {
    font-size: 14px; font-weight: 500;
    padding: 6px 14px; border-radius: 100px;
    gap: 7px;
  }
  :global([data-platform="ios"]) .dot { width: 8px; height: 8px; }
  :global([data-platform="ios"]) .time-since { font-size: 13px; color: #8E8E93; }
  :global([data-platform="ios"]) .time-since.late { color: #FF3B30; }

  /* ── Android Material You: tonal chip style ── */
  :global([data-platform="android"]) .status-section {
    padding: 14px 16px 0;
    background: #ECF0FF;
  }
  :global([data-platform="android"]) .badge {
    font-size: 14px; font-weight: 500;
    padding: 8px 16px; border-radius: 100px;
    gap: 8px;
    font-family: 'Google Sans', Roboto, system-ui, sans-serif;
  }
  :global([data-platform="android"]) .badge-in { background: #C8E6C9; color: #1B5E20; }
  :global([data-platform="android"]) .badge-out { background: #FFCDD2; color: #B71C1C; }
  :global([data-platform="android"]) .badge-closed { background: #E8EAF6; color: #3949AB; }
  :global([data-platform="android"]) .dot-green { background: #2E7D32; }
  :global([data-platform="android"]) .dot-red   { background: #C62828; }
  :global([data-platform="android"]) .dot-gray  { background: #5C6BC0; }
  :global([data-platform="android"]) .time-since { font-size: 13px; }

  /* ── macOS: compact, minimal ── */
  :global([data-platform="macos"]) .status-section { padding: 8px 14px 0; }
  :global([data-platform="macos"]) .badge { font-size: 11px; padding: 3px 8px; }
  :global([data-platform="macos"]) .time-since { font-size: 10px; }
</style>
