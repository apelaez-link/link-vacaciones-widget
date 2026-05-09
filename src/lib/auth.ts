import { invoke } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://vacaciones.smartcity.link';

export async function startLogin(): Promise<void> {
  await openUrl(`${API_BASE}/login?widget=1`);
}

export async function loadToken(): Promise<string | null> {
  return invoke<string | null>('load_token');
}

export async function clearToken(): Promise<void> {
  return invoke('delete_token');
}

export async function saveToken(token: string): Promise<void> {
  return invoke('save_token', { token });
}
