<script lang="ts">
  import { todayCheckin } from '../stores/checkin';
  import { LOCATION_ICONS } from '../lib/types';

  function fmt(iso: string) {
    return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function fmtMinutes(m: number | null) {
    if (!m) return '–';
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h}h ${min}m` : `${min}m`;
  }

  let elapsed = $derived.by(() => {
    const c = $todayCheckin;
    if (!c || c.checked_out_at || !c.checked_in_at) return null;
    const ms = Date.now() - new Date(c.checked_in_at).getTime();
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return h * 60 + m;
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://vacaciones.smartcity.link';
</script>

<div class="log">
  <div class="section-label">Hoy</div>

  {#if $todayCheckin}
    <div class="log-row">
      <div class="log-type">
        <span class="dot dot-green"></span>
        {LOCATION_ICONS[$todayCheckin.location as keyof typeof LOCATION_ICONS] ?? ''} Entrada
      </div>
      <div class="log-time">{fmt($todayCheckin.checked_in_at)}</div>
    </div>

    {#if $todayCheckin.checked_out_at}
      <div class="log-row">
        <div class="log-type"><span class="dot dot-red"></span> Salida</div>
        <div class="log-time">{fmt($todayCheckin.checked_out_at)}</div>
      </div>
    {:else}
      <div class="log-row muted">
        <div class="log-type"><span class="dot dot-gray"></span> Salida estimada</div>
        <div class="log-time">–</div>
      </div>
    {/if}

    <div class="log-total">
      <div class="log-total-label">Acumulado hoy</div>
      <div class="log-total-val">
        {$todayCheckin.checked_out_at
          ? fmtMinutes($todayCheckin.total_minutes)
          : fmtMinutes(elapsed)}
      </div>
    </div>
  {:else}
    <div class="log-row muted">
      <div class="log-type">Sin registros todavía</div>
    </div>
    <div class="log-total">
      <div class="log-total-label">Acumulado hoy</div>
      <div class="log-total-val">0h 00m</div>
    </div>
  {/if}
</div>

<style>
  .log { padding: 10px 16px; border-bottom: 1px solid rgba(0,0,0,0.08); }
  .section-label {
    font-size: 10px; font-weight: 600; color: #999; text-transform: uppercase;
    letter-spacing: 0.07em; margin-bottom: 8px;
  }
  .log-row {
    display: flex; align-items: center; justify-content: space-between; padding: 3px 0;
  }
  .log-row.muted .log-type { color: #aaa; }
  .log-type { font-size: 12px; color: #666; display: flex; align-items: center; gap: 5px; }
  .log-time { font-size: 12px; font-weight: 500; color: #1c1c1e; }
  .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
  .dot-green { background: #34c759; }
  .dot-red { background: #ff3b30; }
  .dot-gray { background: #aeaeb2; }
  .log-total {
    display: flex; justify-content: space-between; margin-top: 8px;
    padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.07);
  }
  .log-total-label { font-size: 11px; color: #888; }
  .log-total-val { font-size: 12px; font-weight: 500; color: #1c1c1e; }
</style>
