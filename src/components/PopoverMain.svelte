<script lang="ts">
  import UserHeader from './UserHeader.svelte';
  import StatusBadge from './StatusBadge.svelte';
  import WarningBanner from './WarningBanner.svelte';
  import WeeklySummary from './WeeklySummary.svelte';
  import LocationPicker from './LocationPicker.svelte';
  import ClockButton from './ClockButton.svelte';
  import TodayLog from './TodayLog.svelte';
  import FeedbackModal from './FeedbackModal.svelte';
  import { todayCheckin, isLoading } from '../stores/checkin';
  import { clockIn, clockOut } from '../lib/api';
  import { syncTrayIcon } from '../lib/tray';
  import type { Location } from '../lib/types';

  const { onSettings, onSignOut, onRefresh }: {
    onSettings: () => void;
    onSignOut: () => void;
    onRefresh: () => Promise<void>;
  } = $props();

  let selectedLocation = $state<Location>('REMOTE');
  let apiError = $state<string | null>(null);
  let showFeedback = $state(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://vacaciones.smartcity.link';

  async function handleClockIn() {
    isLoading.set(true);
    apiError = null;
    try {
      const result = await clockIn(selectedLocation);
      todayCheckin.set(result);
      await syncTrayIcon(result);
    } catch (e) {
      apiError = (e as Error).message;
    } finally {
      isLoading.set(false);
    }
  }

  async function handleClockOut() {
    const checkin = $todayCheckin;
    if (!checkin) return;
    isLoading.set(true);
    apiError = null;
    try {
      const result = await clockOut(checkin.id);
      todayCheckin.set(result);
      await syncTrayIcon(result);
    } catch (e) {
      apiError = (e as Error).message;
    } finally {
      isLoading.set(false);
    }
  }

  let showLocationPicker = $derived(!$todayCheckin || !!$todayCheckin.checked_out_at);
</script>

<div class="popover">
  <UserHeader {onSettings} {onSignOut} {onRefresh} />
  <StatusBadge />
  <WarningBanner />
  <WeeklySummary />

  {#if showLocationPicker}
    <LocationPicker selected={selectedLocation} onSelect={(l) => selectedLocation = l} />
  {/if}

  <ClockButton location={selectedLocation} onClockIn={handleClockIn} onClockOut={handleClockOut} />
  <TodayLog />

  {#if apiError}
    <div class="error">{apiError}</div>
  {/if}

  <div class="footer">
    <a class="footer-link" href="{API_BASE}/checkins" target="_blank">Ver historial →</a>
    <button class="feedback-fab" onclick={() => showFeedback = true} title="Enviar feedback">💬</button>
    <button class="footer-link" onclick={onSettings}>Ajustes</button>
  </div>
</div>

{#if showFeedback}
  <FeedbackModal onClose={() => showFeedback = false} />
{/if}

<style>
  .popover { display: flex; flex-direction: column; height: 100%; }
  .error { padding: 6px 16px; font-size: 11px; color: #cc3333; background: #fff0f0; }
  .footer {
    padding: 6px 12px; display: flex; justify-content: space-between; align-items: center;
    margin-top: auto; border-top: 1px solid rgba(0,0,0,0.06);
  }
  .footer-link {
    font-size: 12px; color: #007aff; cursor: pointer;
    background: none; border: none; font-family: inherit; text-decoration: none;
    padding: 2px 4px;
  }
  .footer-link:hover { text-decoration: underline; }
  .feedback-fab {
    width: 26px; height: 26px; border-radius: 50%;
    background: #007aff; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; box-shadow: 0 2px 6px rgba(0,122,255,0.4);
    transition: background 0.15s, transform 0.1s;
    padding: 0; flex-shrink: 0;
  }
  .feedback-fab:hover { background: #0065d4; transform: scale(1.08); }
  .feedback-fab:active { transform: scale(0.96); }

  /* Mobile: allow content to grow beyond fixed height */
  @media (min-height: 600px) {
    .popover { height: auto; min-height: 100dvh; }
    .footer { padding: 12px; }
    .footer-link { font-size: 14px; padding: 8px 6px; }
    .feedback-fab { width: 40px; height: 40px; font-size: 18px; }
  }
</style>
