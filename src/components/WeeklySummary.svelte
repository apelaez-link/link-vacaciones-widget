<script lang="ts">
  import { weeklyMinutes } from '../stores/checkin';

  const WEEKLY_LIMIT_MIN = 40 * 60; // 40h in minutes
  const WEEKLY_WARN_MIN  = 38 * 60; // warn at 38h

  let hours = $derived(Math.floor($weeklyMinutes / 60));
  let mins  = $derived($weeklyMinutes % 60);
  let pct   = $derived(Math.min(Math.round(($weeklyMinutes / WEEKLY_LIMIT_MIN) * 100), 100));
  let over  = $derived($weeklyMinutes >= WEEKLY_LIMIT_MIN);
  let warn  = $derived($weeklyMinutes >= WEEKLY_WARN_MIN && !over);
  let color = $derived(over ? '#ff3b30' : warn ? '#ff9500' : '#34c759');
</script>

{#if $weeklyMinutes > 0}
<div class="weekly">
  <div class="weekly-row">
    <span class="weekly-label">Acumulado semana</span>
    <span class="weekly-value" style="color: {color}">
      {hours}h {mins > 0 ? `${mins}m` : ''}{over ? ' ⚠️' : ''}
    </span>
  </div>
  <div class="bar-bg">
    <div class="bar-fill" style="width: {pct}%; background: {color};"></div>
  </div>
  {#if over}
    <div class="weekly-sub over">Has superado las 40h semanales</div>
  {:else if warn}
    <div class="weekly-sub warn">Te acercas al límite semanal (40h)</div>
  {/if}
</div>
{/if}

<style>
  .weekly {
    padding: 8px 16px 10px;
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }
  .weekly-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 5px;
  }
  .weekly-label { font-size: 11px; color: #888; }
  .weekly-value { font-size: 12px; font-weight: 600; }
  .bar-bg {
    height: 4px; background: rgba(0,0,0,0.08); border-radius: 2px; overflow: hidden;
  }
  .bar-fill {
    height: 100%; border-radius: 2px; transition: width 0.4s ease, background 0.3s;
  }
  .weekly-sub {
    font-size: 10px; margin-top: 4px;
  }
  .over { color: #ff3b30; }
  .warn { color: #ff9500; }
</style>
