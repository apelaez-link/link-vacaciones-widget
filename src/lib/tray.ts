import { invoke } from '@tauri-apps/api/core';
import type { CheckIn } from './types';

export type TrayState = 'clocked_in' | 'clocked_out' | 'closed';

export function checkinToTrayState(today: CheckIn | null): TrayState {
  if (!today) return 'clocked_out';
  if (!today.checked_out_at) return 'clocked_in';
  return 'closed';
}

export async function syncTrayIcon(today: CheckIn | null, elapsedLabel?: string): Promise<void> {
  const state = checkinToTrayState(today);
  await invoke('set_tray_state', { state, label: elapsedLabel ?? null });
}
