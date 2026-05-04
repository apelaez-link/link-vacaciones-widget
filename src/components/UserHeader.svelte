<script lang="ts">
  import { userName } from '../stores/auth';
  import { clearToken } from '../lib/auth';
  import { sessionToken } from '../stores/auth';

  import { isLoading } from '../stores/checkin';

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
      <button class="icon-btn {refreshing ? 'spinning' : ''}" title="Actualizar" onclick={handleRefresh} disabled={refreshing || $isLoading}>↻</button>
      <button class="icon-btn" title="Ajustes" onclick={onSettings}>⚙</button>
      <button class="icon-btn" title="Cerrar sesión" onclick={handleSignOut}>↩</button>
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
</style>
