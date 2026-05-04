<script lang="ts">
  import { todayCheckin, pendingList } from '../stores/checkin';
  import { settings } from '../stores/settings';

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://vacaciones.smartcity.link';

  let show = $derived.by(() => {
    const c = $todayCheckin;
    if (!c || c.checked_out_at) return false;
    const [inRefH, inRefM] = $settings.refIn.split(':').map(Number);
    const [outRefH, outRefM] = $settings.refOut.split(':').map(Number);
    const shiftMs = ((outRefH - inRefH) * 60 + (outRefM - inRefM)) * 60_000;
    const elapsed = Date.now() - new Date(c.checked_in_at).getTime();
    return elapsed > shiftMs;
  });

  let minutesLate = $derived.by(() => {
    const c = $todayCheckin;
    if (!c || c.checked_out_at) return null;
    const [inRefH, inRefM] = $settings.refIn.split(':').map(Number);
    const [outRefH, outRefM] = $settings.refOut.split(':').map(Number);
    const shiftMs = ((outRefH - inRefH) * 60 + (outRefM - inRefM)) * 60_000;
    const elapsed = Date.now() - new Date(c.checked_in_at).getTime();
    const extra = Math.floor((elapsed - shiftMs) / 60_000);
    return extra > 0 ? extra : null;
  });

  // Also show warning if not checked in and past refIn
  let lateCheckin = $derived.by(() => {
    if ($todayCheckin) return false;
    const [h, m] = $settings.refIn.split(':').map(Number);
    const ref = new Date(); ref.setHours(h, m + $settings.graceMinutes, 0, 0);
    return Date.now() > ref.getTime();
  });
</script>

{#if $pendingList.length > 0}
  <a class="warn warn-pending" href="{API_BASE}/checkins" target="_blank">
    🔴 {$pendingList.length === 1 ? '1 fichaje abierto' : `${$pendingList.length} fichajes abiertos`} de días anteriores — ajústalos en la web →
  </a>
{/if}

{#if show}
  <div class="warn">
    <span>⚠️ Llevas {minutesLate ? `${minutesLate} min` : ''} más de tu jornada habitual</span>
  </div>
{:else if lateCheckin}
  <div class="warn">
    <span>⚠️ Tu horario de referencia empezó hace un rato</span>
  </div>
{/if}

<style>
  .warn {
    padding: 8px 16px;
    border-bottom: 1px solid rgba(0,0,0,0.08);
    background: #fff9e6;
  }
  .warn span { font-size: 11px; color: #7a4f00; }
  .warn-pending {
    display: block;
    background: #fff0f0;
    font-size: 11px;
    color: #b22222;
    text-decoration: none;
    cursor: pointer;
  }
  .warn-pending:hover { background: #ffe0e0; }
</style>
