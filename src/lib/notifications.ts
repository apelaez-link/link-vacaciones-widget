import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import type { CheckIn, WidgetSettings } from './types';

let refInTimer: ReturnType<typeof setTimeout> | null = null;
let longShiftTimer: ReturnType<typeof setTimeout> | null = null;

// Minimum interval between repeat notifications (30 min)
const REPEAT_INTERVAL_MS = 30 * 60_000;

// Track last fire time per notification type
const lastFired: Record<string, number> = {};

// Track day to reset state on new day
let lastDayKey = '';

function todayKey(): string {
  return new Date().toDateString();
}

function canFire(key: string): boolean {
  const now = Date.now();
  const day = todayKey();

  // Reset on new day
  if (day !== lastDayKey) {
    Object.keys(lastFired).forEach((k) => delete lastFired[k]);
    lastDayKey = day;
  }

  const last = lastFired[key] ?? 0;
  return now - last >= REPEAT_INTERVAL_MS;
}

function markFired(key: string): void {
  lastFired[key] = Date.now();
}

export async function scheduleNotifications(cfg: WidgetSettings, today: CheckIn | null): Promise<void> {
  clearScheduled();

  const now = Date.now();

  // ── Notification 1: no check-in yet, past refIn + graceMinutes ──────────
  if (!today && cfg.notifyCheckin) {
    const [h, m] = cfg.refIn.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m + cfg.graceMinutes, 0, 0);
    const ms = target.getTime() - now;

    if (ms > 0) {
      // Schedule for the future (first fire — no repeat interval needed)
      refInTimer = setTimeout(() => {
        markFired('checkin');
        fire('¿Has empezado la jornada?', 'No hay fichaje de entrada registrado todavía.');
      }, ms);
    } else if (canFire('checkin')) {
      // Already past refIn+grace — fire now (respects 30-min repeat interval)
      markFired('checkin');
      await fire('¿Has empezado la jornada?', 'No hay fichaje de entrada registrado todavía.');
    }
  }

  // ── Notification 2: shift duration exceeded, still checked in ───────────
  if (today && !today.checked_out_at && cfg.notifyCheckout) {
    const [inH, inM] = cfg.refIn.split(':').map(Number);
    const [outH, outM] = cfg.refOut.split(':').map(Number);
    const shiftMs = ((outH - inH) * 60 + (outM - inM)) * 60_000;
    const checkedInAt = new Date(today.checked_in_at).getTime();
    const ms = checkedInAt + shiftMs - now;

    if (ms > 0) {
      // Schedule for when shift ends
      longShiftTimer = setTimeout(() => {
        markFired('checkout');
        fire('Jornada extensa detectada', 'Llevas más tiempo del habitual fichado. ¿Fichamos salida?');
      }, ms);
    } else if (canFire('checkout')) {
      // Already exceeded — fire now (respects 30-min repeat interval)
      markFired('checkout');
      await fire('Jornada extensa detectada', 'Llevas más tiempo del habitual fichado. ¿Fichamos salida?');
    }
  }
}

export function clearScheduled(): void {
  if (refInTimer)    { clearTimeout(refInTimer);    refInTimer    = null; }
  if (longShiftTimer){ clearTimeout(longShiftTimer); longShiftTimer = null; }
}

async function fire(title: string, body: string): Promise<void> {
  let granted = await isPermissionGranted();
  if (!granted) granted = (await requestPermission()) === 'granted';
  if (granted) sendNotification({ title, body });
}
