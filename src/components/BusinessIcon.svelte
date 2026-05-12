<script lang="ts">
  import { BUSINESS_ICONS } from '../lib/badge/business-icons';
  import type { IconKey } from '../lib/badge/suite';

  const { name, size = 24 }: { name: IconKey; size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {@html BUSINESS_ICONS[name]}
</svg>
