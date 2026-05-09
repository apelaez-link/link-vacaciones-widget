<script lang="ts">
  import { startLogin, saveToken } from '../lib/auth';

  const { onTokenSaved }: { onTokenSaved?: () => void } = $props();

  let loading = $state(false);
  let loginError = $state('');
  let devToken = $state('');
  let devSaving = $state(false);

  async function handleLogin() {
    loading = true;
    try {
      await startLogin();
    } catch (e) {
      loginError = String(e);
      console.error('[login] openUrl failed:', e);
    } finally {
      loading = false;
    }
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
  <p class="subtitle-desktop">Registra tu jornada desde la barra de menú</p>
  <p class="subtitle-mobile">Registra tu jornada de trabajo</p>
  <button onclick={handleLogin} disabled={loading}>
    {#if loading}Abriendo navegador…{:else}Iniciar sesión con Google{/if}
  </button>
  <div class="hint">Usarás tu cuenta <strong>@smartcity.link</strong></div>
  {#if loginError}<div class="err">{loginError}</div>{/if}

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
  /* Show correct subtitle per platform */
  .subtitle-mobile { display: none; }
  @media (min-height: 600px) {
    .subtitle-desktop { display: none; }
    .subtitle-mobile { display: block; }
    .login { gap: 16px; padding: 48px 32px; }
    .logo { font-size: 64px; }
    h2 { font-size: 24px; }
    p { font-size: 15px; }
    .hint { font-size: 13px; }
  }
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
  @media (min-height: 600px) {
    button { padding: 16px 20px; font-size: 17px; border-radius: 14px; margin-top: 8px; }
  }
  .hint { font-size: 11px; color: #aaa; }
  .err { font-size: 10px; color: red; word-break: break-all; margin-top: 8px; padding: 6px; background: #fff0f0; border-radius: 6px; text-align: left; }
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

  /* ── iOS 26: large centered card, SF Pro Display title, stadium button ── */
  :global([data-platform="ios"]) .login {
    background: #FFFFFF;
    margin: 24px 16px;
    border-radius: 20px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    min-height: unset;
    height: auto;
    padding: 40px 28px 36px;
    gap: 14px;
  }
  :global([data-platform="ios"]) h2 {
    font-size: 28px; font-weight: 700;
    letter-spacing: -0.02em; color: #000;
  }
  :global([data-platform="ios"]) p { font-size: 16px; color: #6E6E73; }
  :global([data-platform="ios"]) button {
    border-radius: 14px;
    font-size: 17px; font-weight: 600;
    padding: 18px 20px;
    background: #007AFF;
    box-shadow: 0 4px 14px rgba(0,122,255,0.40);
    letter-spacing: -0.01em;
  }
  :global([data-platform="ios"]) button:not(:disabled):active { transform: scale(0.97); }
  :global([data-platform="ios"]) .hint { font-size: 14px; color: #8E8E93; }

  /* ── Android Material You: tonal card, pill button, Roboto ── */
  :global([data-platform="android"]) .login {
    background: #FFFFFF;
    margin: 24px 16px;
    border-radius: 28px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06);
    padding: 40px 24px 36px;
    gap: 12px;
    height: auto;
    min-height: unset;
  }
  :global([data-platform="android"]) h2 {
    font-size: 24px; font-weight: 500;
    font-family: 'Google Sans', Roboto, system-ui, sans-serif;
    letter-spacing: 0; color: #1A1A2E;
  }
  :global([data-platform="android"]) p {
    font-size: 15px; color: #49454F;
    font-family: Roboto, system-ui, sans-serif;
  }
  :global([data-platform="android"]) button {
    border-radius: 100px;
    font-size: 16px; font-weight: 500;
    padding: 16px 20px;
    background: #4085F7;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.12);
    letter-spacing: 0.01em;
    font-family: 'Google Sans', Roboto, system-ui, sans-serif;
  }
  :global([data-platform="android"]) button:not(:disabled):active {
    transform: scale(0.98);
    box-shadow: 0 0 0 rgba(0,0,0,0);
  }
  :global([data-platform="android"]) .hint {
    font-size: 13px; color: #79747E;
    font-family: Roboto, system-ui, sans-serif;
  }

  /* ── macOS: precise, compact menu bar style ── */
  :global([data-platform="macos"]) .login { padding: 28px 20px; gap: 8px; }
  :global([data-platform="macos"]) h2 { font-size: 15px; }
  :global([data-platform="macos"]) button {
    padding: 8px 18px; border-radius: 7px;
    font-size: 13px; background: #0071E3;
    box-shadow: none;
  }
  :global([data-platform="macos"]) button:hover:not(:disabled) { background: #005BB5; }
</style>
