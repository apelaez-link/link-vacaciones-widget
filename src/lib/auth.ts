import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://vacaciones.smartcity.link';

export async function startLogin(): Promise<void> {
  await open(`${API_BASE}/login?widget=1`);
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
