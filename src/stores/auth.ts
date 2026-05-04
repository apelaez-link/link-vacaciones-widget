import { writable, derived } from 'svelte/store';

export const sessionToken = writable<string | null>(null);
export const userName = writable<string | null>(null);
export const isAuthenticated = derived(sessionToken, t => t !== null);
