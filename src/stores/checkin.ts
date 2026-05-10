import { writable, derived } from 'svelte/store';
import type { CheckIn } from '../lib/types';

export const todayCheckin = writable<CheckIn | null>(null);
export const pendingList = writable<CheckIn[]>([]);
export const refTime = writable<string | null>(null);
export const isLoading = writable(false);
export const lastError = writable<string | null>(null);

export const weeklyMinutes = writable<number>(0);

/** true cuando hay una pausa activa (sin ended_at) */
export const isPaused = derived(todayCheckin, $c => {
  if (!$c || $c.checked_out_at) return false;
  return ($c.breaks ?? []).some(b => !b.ended_at);
});

/** Tiempo neto trabajado en minutos (descontando pausas) */
export const elapsedTime = derived(todayCheckin, $c => {
  if (!$c || !$c.checked_in_at) return null;
  if ($c.checked_out_at) return null; // ya cerrado — usar total_minutes

  const breaks = $c.breaks ?? [];

  // Suma de pausas ya cerradas
  const closedBreakMs = breaks
    .filter(b => b.ended_at)
    .reduce((sum, b) => sum + (new Date(b.ended_at!).getTime() - new Date(b.started_at).getTime()), 0);

  // Si hay pausa activa, no contamos tiempo desde que empezó la pausa
  const activeBreak = breaks.find(b => !b.ended_at);
  const effectiveNow = activeBreak ? new Date(activeBreak.started_at).getTime() : Date.now();

  const grossMs = effectiveNow - new Date($c.checked_in_at).getTime();
  const netMs   = Math.max(0, grossMs - closedBreakMs);

  const h = Math.floor(netMs / 3_600_000);
  const m = Math.floor((netMs % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
});
