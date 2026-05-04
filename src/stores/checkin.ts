import { writable, derived } from 'svelte/store';
import type { CheckIn } from '../lib/types';

export const todayCheckin = writable<CheckIn | null>(null);
export const pendingList = writable<CheckIn[]>([]);
export const refTime = writable<string | null>(null);
export const isLoading = writable(false);
export const lastError = writable<string | null>(null);

export const weeklyMinutes = writable<number>(0);

export const elapsedTime = derived(todayCheckin, $c => {
  if (!$c || $c.checked_out_at || !$c.checked_in_at) return null;
  const ms = Date.now() - new Date($c.checked_in_at).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
});
