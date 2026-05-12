<script lang="ts">
  const { message = 'Cargando tus datos…' }: { message?: string } = $props();
</script>

<div class="loading">
  <div class="spinner" aria-hidden="true"></div>
  <div class="message">{message}</div>
</div>

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 32px 24px;
    height: 100%;
    min-height: 200px;
    text-align: center;
  }
  .spinner {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 2.5px solid rgba(0,0,0,0.10);
    border-top-color: #007aff;
    animation: spin 0.8s linear infinite;
  }
  .message {
    font-size: 13px;
    color: #6e6e73;
    font-weight: 500;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ── iOS: pantalla completa, fondo blanco, SF Pro ─────────────────────── */
  :global([data-platform="ios"]) .loading {
    background: #FFFFFF;
    height: 100%;
    min-height: 100dvh;
    padding: calc(env(safe-area-inset-top) + 48px) 36px calc(env(safe-area-inset-bottom) + 40px);
    gap: 20px;
    justify-content: center;
  }
  :global([data-platform="ios"]) .spinner {
    width: 36px; height: 36px;
    border-width: 3px;
    border-top-color: #007AFF;
  }
  :global([data-platform="ios"]) .message {
    font-size: 17px; font-weight: 500;
    color: #6E6E73;
    letter-spacing: -0.01em;
  }

  /* ── Android Material You ─────────────────────────────────────────────── */
  :global([data-platform="android"]) .loading {
    background: #FFFFFF;
    height: 100dvh;
    padding: calc(env(safe-area-inset-top) + 48px) 28px calc(env(safe-area-inset-bottom) + 40px);
    gap: 18px;
    justify-content: center;
  }
  :global([data-platform="android"]) .spinner {
    width: 36px; height: 36px;
    border-width: 3px;
    border-color: rgba(64,133,247,0.18);
    border-top-color: #4085F7;
  }
  :global([data-platform="android"]) .message {
    font-size: 15px;
    color: #49454F;
    font-family: 'Google Sans', Roboto, system-ui, sans-serif;
  }

  /* ── macOS: compacto ──────────────────────────────────────────────────── */
  :global([data-platform="macos"]) .loading {
    padding: 28px 20px;
    gap: 10px;
    min-height: 120px;
  }
  :global([data-platform="macos"]) .spinner {
    width: 22px; height: 22px;
    border-width: 2px;
  }
  :global([data-platform="macos"]) .message { font-size: 12px; }
</style>
