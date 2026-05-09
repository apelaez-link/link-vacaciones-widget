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
      {hours}h {mins > 0 ? `${mins}m` : ''}
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

  /* ── iOS 26: card-style section, larger type ── */
  :global([data-platform="ios"]) .weekly {
    margin: 12px 20px 0;
    padding: 14px 16px;
    background: #FFFFFF;
    border-radius: 16px;
    border-bottom: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  :global([data-platform="ios"]) .weekly-label { font-size: 13px; color: #8E8E93; }
  :global([data-platform="ios"]) .weekly-value { font-size: 15px; }
  :global([data-platform="ios"]) .bar-bg { height: 5px; border-radius: 3px; }
  :global([data-platform="ios"]) .bar-fill { border-radius: 3px; }
  :global([data-platform="ios"]) .weekly-sub { font-size: 12px; }
  :global([data-platform="ios"]) .over { color: #FF3B30; }
  :global([data-platform="ios"]) .warn { color: #FF9F0A; }

  /* ── Android Material You: tonal card ── */
  :global([data-platform="android"]) .weekly {
    margin: 12px 16px 0;
    padding: 16px;
    background: #FFFFFF;
    border-radius: 20px;
    border-bottom: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    font-family: Roboto, system-ui, sans-serif;
  }
  :global([data-platform="android"]) .weekly-label { font-size: 13px; color: #49454F; }
  :global([data-platform="android"]) .weekly-value { font-size: 15px; }
  :global([data-platform="android"]) .bar-bg { height: 6px; border-radius: 3px; background: rgba(0,0,0,0.10); }
  :global([data-platform="android"]) .bar-fill { border-radius: 3px; }
  :global([data-platform="android"]) .weekly-sub { font-size: 12px; }

  /* ── macOS: compact ── */
  :global([data-platform="macos"]) .weekly { padding: 7px 14px 9px; }
  :global([data-platform="macos"]) .weekly-label { font-size: 10px; }
  :global([data-platform="macos"]) .weekly-value { font-size: 11px; }
</style>
