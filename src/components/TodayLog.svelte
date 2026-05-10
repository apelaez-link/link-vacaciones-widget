<script lang="ts">
  import { todayCheckin, isPaused, elapsedTime } from '../stores/checkin';
  import { LOCATION_ICON_NAMES } from '../lib/types';
  import Icon from './Icon.svelte';

  function fmt(iso: string) {
    return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function fmtMinutes(m: number | null) {
    if (m == null || m <= 0) return '0h 0m';
    const h   = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h}h ${min}m` : `${min}m`;
  }

  // breaks cerradas (para mostrar en el log)
  let closedBreaks = $derived(
    ($todayCheckin?.breaks ?? []).filter(b => b.ended_at)
  );

  // pausa activa
  let activeBreak = $derived(
    ($todayCheckin?.breaks ?? []).find(b => !b.ended_at) ?? null
  );

  // minutos de pausa total (cerradas)
  let totalBreakMinutes = $derived(
    closedBreaks.reduce((sum, b) => sum + (b.minutes ?? 0), 0)
  );
</script>

<div class="log">
  <div class="section-label">Hoy</div>

  {#if $todayCheckin}
    <!-- Entrada -->
    <div class="log-row">
      <div class="log-type">
        <span class="dot dot-green"></span>
        <Icon name={LOCATION_ICON_NAMES[$todayCheckin.location as keyof typeof LOCATION_ICON_NAMES] ?? 'home'} size={14} /> Entrada
      </div>
      <div class="log-time">{fmt($todayCheckin.checked_in_at)}</div>
    </div>

    <!-- Pausas cerradas -->
    {#each closedBreaks as brk}
      <div class="log-row break-row">
        <div class="log-type"><span class="dot dot-orange"></span> Pausa · {fmtMinutes(brk.minutes)}</div>
        <div class="log-time">{fmt(brk.started_at)} – {fmt(brk.ended_at!)}</div>
      </div>
    {/each}

    <!-- Pausa activa -->
    {#if activeBreak}
      <div class="log-row break-row">
        <div class="log-type"><span class="dot dot-orange pulse"></span> En pausa desde</div>
        <div class="log-time">{fmt(activeBreak.started_at)}</div>
      </div>
    {/if}

    <!-- Salida -->
    {#if $todayCheckin.checked_out_at}
      <div class="log-row">
        <div class="log-type"><span class="dot dot-red"></span> Salida</div>
        <div class="log-time">{fmt($todayCheckin.checked_out_at)}</div>
      </div>
    {:else if !$isPaused}
      <div class="log-row muted">
        <div class="log-type"><span class="dot dot-gray"></span> Salida estimada</div>
        <div class="log-time">–</div>
      </div>
    {/if}

    <!-- Total -->
    <div class="log-total">
      <div class="log-total-label">
        {$isPaused ? 'En pausa' : 'Acumulado hoy'}
        {#if totalBreakMinutes > 0 && !$todayCheckin.checked_out_at}
          <span class="break-note">({fmtMinutes(totalBreakMinutes)} pausa)</span>
        {/if}
      </div>
      <div class="log-total-val">
        {#if $todayCheckin.checked_out_at}
          {fmtMinutes($todayCheckin.total_minutes)}
        {:else}
          {$elapsedTime ?? '0h 0m'}
        {/if}
      </div>
    </div>
  {:else}
    <div class="log-row muted">
      <div class="log-type">Sin registros todavía</div>
    </div>
    <div class="log-total">
      <div class="log-total-label">Acumulado hoy</div>
      <div class="log-total-val">0h 0m</div>
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
  .dot-green  { background: #34c759; }
  .dot-red    { background: #ff3b30; }
  .dot-gray   { background: #aeaeb2; }
  .dot-orange { background: #ff9500; }
  .dot.pulse  { animation: pulse-dot 1.4s ease-in-out infinite; }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  .break-row .log-type { color: #ff9500; }
  .break-note { font-size: 10px; color: #aaa; margin-left: 4px; }
  .log-total {
    display: flex; justify-content: space-between; margin-top: 8px;
    padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.07);
  }
  .log-total-label { font-size: 11px; color: #888; }
  .log-total-val { font-size: 12px; font-weight: 500; color: #1c1c1e; }

  /* ── iOS 26: card-style section ── */
  :global([data-platform="ios"]) .log {
    margin: 12px 20px;
    padding: 14px 16px;
    background: #FFFFFF;
    border-radius: 16px;
    border-bottom: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  :global([data-platform="ios"]) .section-label { font-size: 12px; color: #8E8E93; letter-spacing: 0.05em; }
  :global([data-platform="ios"]) .log-type { font-size: 14px; color: #3C3C43; gap: 7px; }
  :global([data-platform="ios"]) .log-time { font-size: 14px; font-weight: 500; color: #000; }
  :global([data-platform="ios"]) .dot { width: 8px; height: 8px; }
  :global([data-platform="ios"]) .log-total { margin-top: 10px; padding-top: 10px; border-top: 0.5px solid rgba(60,60,67,0.18); }
  :global([data-platform="ios"]) .log-total-label { font-size: 13px; color: #8E8E93; }
  :global([data-platform="ios"]) .log-total-val { font-size: 15px; font-weight: 600; color: #000; }

  /* ── Android Material You: card ── */
  :global([data-platform="android"]) .log {
    margin: 12px 16px;
    padding: 16px;
    background: #FFFFFF;
    border-radius: 20px;
    border-bottom: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    font-family: Roboto, system-ui, sans-serif;
  }
  :global([data-platform="android"]) .section-label { font-size: 12px; color: #49454F; letter-spacing: 0.06em; }
  :global([data-platform="android"]) .log-type { font-size: 14px; color: #49454F; }
  :global([data-platform="android"]) .log-time { font-size: 14px; font-weight: 500; color: #1C1B1F; }
  :global([data-platform="android"]) .log-total { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.08); }
  :global([data-platform="android"]) .log-total-label { font-size: 13px; color: #49454F; }
  :global([data-platform="android"]) .log-total-val { font-size: 15px; font-weight: 600; color: #1C1B1F; }

  /* ── macOS: compact table ── */
  :global([data-platform="macos"]) .log { padding: 8px 14px; }
  :global([data-platform="macos"]) .section-label { font-size: 9px; margin-bottom: 6px; }
  :global([data-platform="macos"]) .log-type { font-size: 11px; }
  :global([data-platform="macos"]) .log-time { font-size: 11px; }
  :global([data-platform="macos"]) .log-row { padding: 2px 0; }
  :global([data-platform="macos"]) .log-total-label { font-size: 10px; }
  :global([data-platform="macos"]) .log-total-val { font-size: 11px; }
</style>
