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
</style>
