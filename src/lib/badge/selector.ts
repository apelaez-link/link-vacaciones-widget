// ─────────────────────────────────────────────────────────────────────────────
//  Selector de UserBadge — determinista, rotación semanal, sin repetir
//  Mismo algoritmo que el repo web link-vacaciones para que el mismo
//  usuario+semana → mismo personaje en todas las plataformas.
// ─────────────────────────────────────────────────────────────────────────────

import { BADGE_SUITE, BADGE_COLORS, type BadgeCharacter } from './suite';

/** Hash determinista tipo djb2 — suficiente para reparto pseudo-aleatorio */
function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** ISO 8601 week number (1-53). Lunes inicio de semana, jueves "regla" */
export function isoWeek(date: Date = new Date()): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

export interface BadgeData {
  initial:    string;
  color:      string;
  character:  BadgeCharacter;
  yearWeek:   string;
}

export interface BadgeInput {
  id:    string;
  name:  string;
  date?: Date;
}

/** Selección estable: misma respuesta en todos los clientes para mismo input */
export function getUserBadge({ id, name, date = new Date() }: BadgeInput): BadgeData {
  const n = BADGE_SUITE.length;

  const { year: y0, week: w0 } = isoWeek(date);
  const prev = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
  const { year: y1, week: w1 } = isoWeek(prev);

  const seedCurrent  = `${id}::${y0}-W${w0}`;
  const seedPrevious = `${id}::${y1}-W${w1}`;

  const idxCurrent  = hashStr(seedCurrent)  % n;
  const idxPrevious = hashStr(seedPrevious) % n;

  const idx = idxCurrent === idxPrevious ? (idxCurrent + 1) % n : idxCurrent;

  const color   = BADGE_COLORS[hashStr(id) % BADGE_COLORS.length];
  const initial = (name.trim().charAt(0) || '?').toUpperCase();

  return {
    initial,
    color,
    character: BADGE_SUITE[idx],
    yearWeek:  `${y0}-W${String(w0).padStart(2, '0')}`,
  };
}
