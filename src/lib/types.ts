export type Location = 'REMOTE' | 'OFFICE' | 'CLIENT' | 'TRAVEL';

export interface CheckIn {
  id: string;
  date: string;
  checked_in_at: string;
  checked_out_at: string | null;
  location: Location;
  notes: string | null;
  total_minutes: number | null;
  auto_closed: boolean;
  confirmed: boolean;
  is_edited: boolean;
}

export interface TodayStatus {
  today: CheckIn | null;
  pending: CheckIn[];
  ref_time: string | null;
}

export interface WidgetSettings {
  refIn: string;
  refOut: string;
  notifyCheckin: boolean;
  notifyCheckout: boolean;
  graceMinutes: number;
}

export const LOCATION_LABELS: Record<Location, string> = {
  REMOTE: 'Casa',
  OFFICE: 'Oficina',
  CLIENT: 'Cliente',
  TRAVEL: 'Viaje',
};

// Maps each location to the Icon component name (no emojis)
export const LOCATION_ICON_NAMES: Record<Location, string> = {
  REMOTE: 'home',
  OFFICE: 'office',
  CLIENT: 'people',
  TRAVEL: 'flight',
};
