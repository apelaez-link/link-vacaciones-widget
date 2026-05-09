<script lang="ts">
  import { userName } from '../stores/auth';
  import { clearToken } from '../lib/auth';
  import { sessionToken } from '../stores/auth';

  import { isLoading } from '../stores/checkin';
  import Icon from './Icon.svelte';

  const { onSettings, onSignOut, onRefresh }: {
    onSettings: () => void;
    onSignOut: () => void;
    onRefresh: () => Promise<void>;
  } = $props();

  let refreshing = $state(false);

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  async function handleSignOut() {
    await clearToken();
    sessionToken.set(null);
    userName.set(null);
    onSignOut();
  }

  async function handleRefresh() {
    refreshing = true;
    await onRefresh();
    refreshing = false;
  }
</script>

<div class="header">
  <div class="user-row">
    <div class="avatar">{$userName ? initials($userName) : '?'}</div>
    <div class="user-info">
      <div class="name">{$userName ?? 'Usuario'}</div>
    </div>
    <div class="actions">
      <button class="icon-btn {refreshing ? 'spinning' : ''}" title="Actualizar" onclick={handleRefresh} disabled={refreshing || $isLoading}><Icon name="refresh" size={16} /></button>
      <button class="icon-btn" title="Ajustes" onclick={onSettings}><Icon name="settings" size={16} /></button>
      <button class="icon-btn" title="Cerrar sesión" onclick={handleSignOut}><Icon name="logout" size={16} /></button>
    </div>
  </div>
</div>

<style>
  .header { padding: 14px 16px 12px; border-bottom: 1px solid rgba(0,0,0,0.08); }
  .user-row { display: flex; align-items: center; gap: 10px; }
  .avatar {
    width: 34px; height: 34px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600;
    background: #d1e8ff; color: #0051a8; flex-shrink: 0;
  }
  .user-info { flex: 1; min-width: 0; }
  .name { font-weight: 500; font-size: 13px; color: #1c1c1e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .actions { display: flex; gap: 2px; }
  .icon-btn {
    background: none; border: none; cursor: pointer;
    font-size: 15px; padding: 4px 6px; border-radius: 6px;
    color: #888; font-family: inherit; transition: transform 0.3s;
  }
  .icon-btn:hover:not(:disabled) { background: rgba(0,0,0,0.06); color: #1c1c1e; }
  .icon-btn:disabled { opacity: 0.4; cursor: default; }
  .spinning { animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── iOS 26: frosted glass header, larger avatar, SF Pro Display name ── */
  :global([data-platform="ios"]) .header {
    /* padding-top = design padding + status bar height */
    padding: calc(18px + env(safe-area-inset-top)) 20px 14px;
    background: rgba(255,255,255,0.82);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    backdrop-filter: blur(40px) saturate(180%);
    border-bottom: 0.5px solid rgba(60,60,67,0.29);
  }
  :global([data-platform="ios"]) .avatar {
    width: 40px; height: 40px; border-radius: 50%;
    font-size: 15px; font-weight: 700;
    background: #D1E8FF; color: #0051A8;
  }
  :global([data-platform="ios"]) .name { font-size: 16px; font-weight: 600; letter-spacing: -0.01em; }
  :global([data-platform="ios"]) .icon-btn {
    font-size: 18px; padding: 6px 8px; border-radius: 8px;
    color: #007AFF;
  }
  :global([data-platform="ios"]) .icon-btn:hover:not(:disabled) { background: rgba(0,122,255,0.10); color: #005EC4; }

  /* ── Android Material You: card-style header, tonal avatar ── */
  :global([data-platform="android"]) .header {
    /* padding-top = design padding + status bar height */
    padding: calc(16px + env(safe-area-inset-top)) 16px 12px;
    background: #FFFFFF;
    border-bottom: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  :global([data-platform="android"]) .avatar {
    width: 40px; height: 40px; border-radius: 50%;
    font-size: 15px; font-weight: 600;
    background: #D3E2FF; color: #1A3A7A;
  }
  :global([data-platform="android"]) .name {
    font-size: 16px; font-weight: 500;
    font-family: 'Google Sans', Roboto, system-ui, sans-serif;
  }
  :global([data-platform="android"]) .icon-btn {
    font-size: 17px; padding: 6px 8px; border-radius: 50%;
    color: #4085F7;
  }
  :global([data-platform="android"]) .icon-btn:hover:not(:disabled) { background: rgba(64,133,247,0.12); }

  /* ── macOS: compact toolbar style ── */
  :global([data-platform="macos"]) .header { padding: 10px 14px 9px; }
  :global([data-platform="macos"]) .avatar { width: 28px; height: 28px; font-size: 11px; }
  :global([data-platform="macos"]) .name { font-size: 12px; }
  :global([data-platform="macos"]) .icon-btn { font-size: 13px; padding: 3px 5px; border-radius: 5px; }
</style>
