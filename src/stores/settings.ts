import { writable } from 'svelte/store';
import type { WidgetSettings } from '../lib/types';

export const settings = writable<WidgetSettings>({
  refIn: '09:00',
  refOut: '18:00',
  notifyCheckin: true,
  notifyCheckout: true,
  graceMinutes: 15,
});
