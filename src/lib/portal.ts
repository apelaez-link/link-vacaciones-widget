/**
 * Acción Svelte que mueve un elemento al destino indicado (por defecto body).
 * Útil para tooltips/bocadillos que necesitan escapar del clipping del padre.
 *
 * Uso:
 *   <div use:portal class="tooltip">…</div>
 */
export function portal(
  node: HTMLElement,
  target: HTMLElement = document.body,
) {
  target.appendChild(node);
  return {
    update(newTarget: HTMLElement = document.body) {
      newTarget.appendChild(node);
    },
    destroy() {
      node.remove();
    },
  };
}
