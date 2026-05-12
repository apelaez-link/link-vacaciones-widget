import { fetch } from '@tauri-apps/plugin-http';
import { loadToken, clearToken } from './auth';
import type { TodayStatus, CheckIn, Location, WidgetSettings } from './types';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://vacaciones.smartcity.link';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await loadToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    await clearToken();
    throw new Error('UNAUTHENTICATED');
  }
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function fetchTodayStatus(): Promise<TodayStatus> {
  return apiFetch<TodayStatus>('/api/checkin/today');
}

export async function clockIn(location: Location, notes?: string): Promise<CheckIn> {
  return apiFetch<CheckIn>('/api/checkin', {
    method: 'POST',
    body: JSON.stringify({ location, notes }),
  });
}

export async function clockOut(id: string): Promise<CheckIn> {
  return apiFetch<CheckIn>(`/api/checkin/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'checkout' }),
  });
}

export async function pauseCheckin(id: string): Promise<CheckIn> {
  return apiFetch<CheckIn>(`/api/checkin/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'pause' }),
  });
}

export async function resumeCheckin(id: string): Promise<CheckIn> {
  return apiFetch<CheckIn>(`/api/checkin/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'resume' }),
  });
}

export async function fetchUserProfile(): Promise<{ id: string; name: string; email: string; role: string }> {
  return apiFetch('/api/auth/me');
}

export async function fetchUserSettings(): Promise<WidgetSettings | null> {
  try {
    const data = await apiFetch<{
      checkin_ref_in: string | null;
      checkin_ref_out: string | null;
      notify_checkin: boolean;
      notify_checkout: boolean;
      notify_grace_minutes: number;
    }>('/api/users/me/settings');
    if (!data.checkin_ref_in || !data.checkin_ref_out) return null;
    return {
      refIn:          data.checkin_ref_in,
      refOut:         data.checkin_ref_out,
      notifyCheckin:  data.notify_checkin,
      notifyCheckout: data.notify_checkout,
      graceMinutes:   data.notify_grace_minutes,
    };
  } catch {
    return null;
  }
}

export async function saveUserSettings(s: WidgetSettings): Promise<void> {
  await apiFetch('/api/users/me/settings', {
    method: 'PATCH',
    body: JSON.stringify({
      checkin_ref_in: s.refIn,
      checkin_ref_out: s.refOut,
      notify_checkin: s.notifyCheckin,
      notify_checkout: s.notifyCheckout,
      notify_grace_minutes: s.graceMinutes,
    }),
  });
}

/**
 * Returns true when today is a day the user is expected to work.
 *
 * Fast path: weekends (Saturday/Sunday) return false immediately.
 *
 * Slow path: calls /api/users/me/working-day?date=YYYY-MM-DD, which the
 * backend can implement to check public holidays and approved vacation requests.
 * Falls back to true (working day assumed) when the endpoint is unavailable so
 * notifications are never silenced without certainty.
 */
export async function fetchIsWorkingDay(): Promise<boolean> {
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false; // Sun = 0, Sat = 6

  try {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const data = await apiFetch<{ working_day: boolean }>(`/api/users/me/working-day?date=${dateStr}`);
    return data.working_day;
  } catch {
    // Endpoint not available or request failed — assume working day to avoid
    // silencing notifications when we can't confirm the user is off.
    return true;
  }
}

export async function fetchWeekSummary(): Promise<{ total_minutes: number }> {
  try {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const data = await apiFetch<{ days: Array<{ check_in: { total_minutes: number | null; checked_out_at: string | null; checked_in_at: string } | null }> }>(`/api/checkin/week?date=${dateStr}`);
    const total = data.days.reduce((sum, d) => {
      if (!d.check_in) return sum;
      if (d.check_in.checked_out_at) return sum + (d.check_in.total_minutes ?? 0);
      // For today's open check-in, add elapsed time
      const elapsed = Math.floor((Date.now() - new Date(d.check_in.checked_in_at).getTime()) / 60_000);
      return sum + elapsed;
    }, 0);
    return { total_minutes: total };
  } catch {
    return { total_minutes: 0 };
  }
}
