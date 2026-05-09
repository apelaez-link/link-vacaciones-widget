<script lang="ts">
  import type { Location } from '../lib/types';
  import { LOCATION_LABELS, LOCATION_ICONS } from '../lib/types';

  const LOCATIONS: Location[] = ['REMOTE', 'OFFICE', 'CLIENT', 'TRAVEL'];

  const { selected, onSelect }: { selected: Location; onSelect: (l: Location) => void } = $props();
</script>

<div class="picker">
  {#each LOCATIONS as loc}
    <button
      class:active={selected === loc}
      onclick={() => onSelect(loc)}
      title={LOCATION_LABELS[loc]}
    >
      <span class="icon">{LOCATION_ICONS[loc]}</span>
      <span class="label">{LOCATION_LABELS[loc]}</span>
    </button>
  {/each}
</div>

<style>
  .picker {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    padding: 8px 16px;
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }
  button {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 7px 4px; border-radius: 8px; border: 1px solid transparent;
    background: #f5f5f5; cursor: pointer; font-family: inherit; transition: all 0.12s;
  }
  button:hover { background: #ebebeb; }
  button.active { background: #e8f0fe; border-color: #007aff; }
  .icon { font-size: 16px; }
  .label { font-size: 10px; color: #444; font-weight: 500; }
  button.active .label { color: #007aff; }

  /* ── iOS 26: pill-shaped chips, more spacing ── */
  :global([data-platform="ios"]) .picker {
    padding: 12px 20px 8px; gap: 8px;
    background: #F2F2F7; border-bottom: none;
  }
  :global([data-platform="ios"]) button {
    border-radius: 12px; padding: 12px 6px;
    background: rgba(255,255,255,0.90);
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    border-color: transparent;
  }
  :global([data-platform="ios"]) button:hover { background: #FFFFFF; }
  :global([data-platform="ios"]) button.active {
    background: rgba(0,122,255,0.12); border-color: #007AFF;
  }
  :global([data-platform="ios"]) .icon { font-size: 20px; }
  :global([data-platform="ios"]) .label { font-size: 11px; color: #3C3C43; }
  :global([data-platform="ios"]) button.active .label { color: #007AFF; font-weight: 600; }

  /* ── Android Material You: tonal filter chips ── */
  :global([data-platform="android"]) .picker {
    padding: 12px 16px 8px; gap: 8px;
    background: #ECF0FF; border-bottom: none;
  }
  :global([data-platform="android"]) button {
    border-radius: 100px; padding: 10px 6px;
    background: #E8EDFF;
    border: 1.5px solid transparent;
    font-family: 'Google Sans', Roboto, system-ui, sans-serif;
  }
  :global([data-platform="android"]) button:hover { background: #D8E3FF; }
  :global([data-platform="android"]) button.active {
    background: #D3E2FF; border-color: #4085F7;
  }
  :global([data-platform="android"]) .icon { font-size: 18px; }
  :global([data-platform="android"]) .label { font-size: 11px; color: #1A3A7A; }
  :global([data-platform="android"]) button.active .label { color: #1A3A7A; font-weight: 600; }

  /* ── macOS: compact ── */
  :global([data-platform="macos"]) .picker { padding: 6px 14px; gap: 4px; }
  :global([data-platform="macos"]) button { padding: 5px 4px; border-radius: 6px; }
  :global([data-platform="macos"]) .icon { font-size: 14px; }
  :global([data-platform="macos"]) .label { font-size: 9px; }
  :global([data-platform="macos"]) button.active { background: #e0eeff; border-color: #0071E3; }
  :global([data-platform="macos"]) button.active .label { color: #0071E3; }
</style>
