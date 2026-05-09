<script lang="ts">
  import { fetch } from '@tauri-apps/plugin-http';
  import { loadToken } from '../lib/auth';
  import Icon from './Icon.svelte';

  const BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://vacaciones.smartcity.link';
  const { onClose }: { onClose: () => void } = $props();

  let type = $state<'BUG' | 'SUGGESTION'>('BUG');
  let title = $state('');
  let description = $state('');
  let saving = $state(false);
  let saved = $state(false);
  let error = $state('');

  async function handleSubmit() {
    if (!title.trim()) { error = 'El título es obligatorio'; return; }
    if (!description.trim()) { error = 'La descripción es obligatoria'; return; }
    if (title.length > 120) { error = 'El título no puede superar 120 caracteres'; return; }

    saving = true;
    error = '';
    try {
      const token = await loadToken();
      const res = await fetch(`${BASE}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type,
          title:       title.trim(),
          description: description.trim(),
          source:      'WIDGET',
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      saved = true;
      setTimeout(() => onClose(), 1500);
    } catch (e) {
      error = 'Error al enviar el feedback. Inténtalo de nuevo.';
    } finally {
      saving = false;
    }
  }
</script>

<div class="overlay" onclick={onClose}>
  <div class="modal" onclick={(e) => e.stopPropagation()}>
    <div class="modal-header">
      <span>Enviar feedback</span>
      <button class="close-btn" onclick={onClose}><Icon name="close" size={16} /></button>
    </div>

    <div class="type-row">
      <button class="type-btn {type === 'BUG' ? 'active-bug' : ''}" onclick={() => type = 'BUG'}><Icon name="bug" size={14} /> Bug</button>
      <button class="type-btn {type === 'SUGGESTION' ? 'active-sug' : ''}" onclick={() => type = 'SUGGESTION'}><Icon name="lightbulb" size={14} /> Sugerencia</button>
    </div>

    <div class="field">
      <input
        class="input"
        type="text"
        placeholder="Título (máx. 120 caracteres)"
        maxlength="120"
        bind:value={title}
      />
    </div>
    <div class="field">
      <textarea
        class="textarea"
        placeholder="Describe el problema o sugerencia…"
        rows="4"
        bind:value={description}
      ></textarea>
    </div>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    <button class="submit-btn" onclick={handleSubmit} disabled={saving || saved}>
      {#if saved}Enviado{:else if saving}Enviando…{:else}Enviar{/if}
    </button>
  </div>
</div>

<style>
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: flex-end; justify-content: center;
    z-index: 100;
  }
  .modal {
    background: white; border-radius: 14px 14px 0 0;
    width: 100%; padding: 16px; box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
  }
  .modal-header {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 14px; font-weight: 600; color: #1c1c1e; margin-bottom: 12px;
  }
  .close-btn {
    background: none; border: none; font-size: 14px; color: #888;
    cursor: pointer; padding: 2px 6px; border-radius: 6px;
  }
  .close-btn:hover { background: rgba(0,0,0,0.06); }
  .type-row { display: flex; gap: 8px; margin-bottom: 10px; }
  .type-btn {
    flex: 1; padding: 6px; border-radius: 8px; border: 1px solid #d0d0d0;
    font-size: 12px; cursor: pointer; background: white; font-family: inherit;
    transition: all 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 5px;
  }
  .active-bug  { background: #fff0f0; border-color: #ff3b30; color: #c0392b; font-weight: 600; }
  .active-sug  { background: #fffbe6; border-color: #ff9500; color: #7a4f00; font-weight: 600; }
  .field { margin-bottom: 8px; }
  .input, .textarea {
    width: 100%; padding: 8px 10px; border: 1px solid #d0d0d0; border-radius: 8px;
    font-size: 12px; font-family: inherit; color: #1c1c1e; background: white;
    box-sizing: border-box; resize: none;
  }
  .input:focus, .textarea:focus {
    outline: none; border-color: #007aff; box-shadow: 0 0 0 3px rgba(0,122,255,0.12);
  }
  .error {
    padding: 6px 10px; background: #fff0f0; border-radius: 7px;
    font-size: 11px; color: #b22222; margin-bottom: 8px;
  }
  .submit-btn {
    width: 100%; padding: 10px; border-radius: 10px;
    background: #007aff; color: white; border: none;
    font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
  }
  .submit-btn:hover:not(:disabled) { background: #0065d4; }
  .submit-btn:disabled { opacity: 0.6; cursor: default; }
</style>
