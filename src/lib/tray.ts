import { invoke } from '@tauri-apps/api/core';
import type { CheckIn } from './types';

export type TrayState = 'clocked_in' | 'paused' | 'clocked_out' | 'closed';

export function checkinToTrayState(today: CheckIn | null): TrayState {
  if (!today) return 'clocked_out';
  if (today.checked_out_at) return 'closed';
  // Jornada abierta: si hay una pausa activa (sin ended_at), está en pausa
  if ((today.breaks ?? []).some(b => !b.ended_at)) return 'paused';
  return 'clocked_in';
}

export async function syncTrayIcon(today: CheckIn | null, elapsedLabel?: string): Promise<void> {
  const state = checkinToTrayState(today);
  await invoke('set_tray_state', { state, label: elapsedLabel ?? null });
}
