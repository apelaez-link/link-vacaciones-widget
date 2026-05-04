<script lang="ts">
  import { startLogin, saveToken } from '../lib/auth';

  const { onTokenSaved }: { onTokenSaved?: () => void } = $props();

  let loading = $state(false);
  let devToken = $state('');
  let devSaving = $state(false);

  async function handleLogin() {
    loading = true;
    await startLogin();
    loading = false;
  }

  async function handleDevToken() {
    if (!devToken.trim()) return;
    devSaving = true;
    await saveToken(devToken.trim());
    onTokenSaved?.();
    devSaving = false;
  }
</script>

<div class="login">
  <div class="logo">⏱</div>
  <h2>Link Fichajes</h2>
  <p>Registra tu jornada desde la barra de menú</p>
  <button onclick={handleLogin} disabled={loading}>
    {#if loading}Abriendo navegador…{:else}Iniciar sesión con Google{/if}
  </button>
  <div class="hint">Usarás tu cuenta <strong>@smartcity.link</strong></div>

  {#if import.meta.env.DEV}
    <div class="dev-section">
      <div class="dev-label">DEV — pega el token de la URL</div>
      <input
        class="dev-input"
        type="text"
        placeholder="next-auth.session-token"
        bind:value={devToken}
        onkeydown={(e) => e.key === 'Enter' && handleDevToken()}
      />
      <button class="dev-btn" onclick={handleDevToken} disabled={devSaving || !devToken.trim()}>
        {devSaving ? 'Guardando…' : 'Entrar'}
      </button>
    </div>
  {/if}
</div>

<style>
  .login {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 32px 24px;
    text-align: center;
    height: 100%;
  }
  .logo { font-size: 40px; }
  h2 { font-size: 16px; font-weight: 600; color: #1c1c1e; margin: 0; }
  p { font-size: 12px; color: #888; margin: 0; }
  button {
    margin-top: 12px;
    padding: 9px 20px;
    border-radius: 9px;
    border: none;
    background: #007aff;
    color: white;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    width: 100%;
  }
  button:disabled { opacity: 0.6; cursor: default; }
  .hint { font-size: 11px; color: #aaa; }
  .dev-section {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px dashed #e0e0e0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .dev-label { font-size: 10px; color: #f59e0b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .dev-input {
    font-size: 11px; padding: 6px 8px;
    border: 1px solid #d0d0d0; border-radius: 7px;
    background: white; color: #333; width: 100%;
    font-family: 'SF Mono', monospace;
  }
  .dev-btn {
    margin-top: 0;
    padding: 7px 12px;
    background: #f59e0b;
  }
  .dev-btn:hover:not(:disabled) { background: #d97706; }
</style>
