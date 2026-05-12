<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { openUrl } from '@tauri-apps/plugin-opener';
  import { portal } from '../lib/portal';
  import { getUserBadge } from '../lib/badge/selector';
  import BusinessIcon from './BusinessIcon.svelte';

  type Side = 'top' | 'bottom' | 'right' | 'left';
  interface QuoteState { badgeCx: number; badgeCy: number; side: Side }

  const {
    userId,
    userName,
    size = 36,
  }: { userId: string; userName: string; size?: number } = $props();

  const badge = $derived(getUserBadge({ id: userId, name: userName }));

  let wrapperEl: HTMLDivElement | undefined = $state();
  let quoteEl:   HTMLDivElement | undefined = $state();
  let quote:     QuoteState | null          = $state(null);

  let clickTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  onDestroy(() => {
    if (clickTimer) clearTimeout(clickTimer);
    if (closeTimer) clearTimeout(closeTimer);
  });

  // Auto-cierre tras 3.5s
  $effect(() => {
    if (!quote) return;
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { quote = null; }, 3500);
    return () => { if (closeTimer) clearTimeout(closeTimer); };
  });

  // Reposicionar bocadillo tras render (equivalente a useLayoutEffect)
  $effect(() => {
    if (!quote || !quoteEl) return;
    const q  = quoteEl;
    const qw = q.offsetWidth;
    const qh = q.offsetHeight;
    const margin = 10;
    const gap    = 12;
    const half   = size / 2;
    const { badgeCx, badgeCy, side } = quote;

    let left = 0, top = 0;
    if (side === 'top') {
      left = badgeCx - qw / 2;
      top  = badgeCy - half - gap - qh;
    } else if (side === 'bottom') {
      left = badgeCx - qw / 2;
      top  = badgeCy + half + gap;
    } else if (side === 'right') {
      left = badgeCx + half + gap;
      top  = badgeCy - qh / 2;
    } else {
      left = badgeCx - half - gap - qw;
      top  = badgeCy - qh / 2;
    }

    left = Math.max(margin, Math.min(window.innerWidth  - qw - margin, left));
    top  = Math.max(margin, Math.min(window.innerHeight - qh - margin, top));

    q.style.left = left + 'px';
    q.style.top  = top  + 'px';
    q.style.setProperty('--arrow-x', `${badgeCx - left}px`);
    q.style.setProperty('--arrow-y', `${badgeCy - top}px`);
    q.style.opacity = '1';
  });

  function handleClick() {
    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      if (!wrapperEl) return;
      const r  = wrapperEl.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;

      const TOOLTIP_W = 200, TOOLTIP_H = 56;
      const spaceTop    = r.top;
      const spaceBottom = window.innerHeight - r.bottom;
      const spaceRight  = window.innerWidth  - r.right;
      const spaceLeft   = r.left;

      let side: Side;
      if (spaceTop >= TOOLTIP_H + 12)        side = 'top';
      else if (spaceRight >= TOOLTIP_W + 12) side = 'right';
      else if (spaceBottom >= TOOLTIP_H + 12) side = 'bottom';
      else if (spaceLeft >= TOOLTIP_W + 12)  side = 'left';
      else side = 'bottom';

      quote = { badgeCx: cx, badgeCy: cy, side };
    }, 250);
  }

  function handleDoubleClick() {
    if (clickTimer) clearTimeout(clickTimer);
    openUrl('https://vacaciones.smartcity.link/admin/icons').catch(() => {});
  }

  const inner = $derived(Math.round(size * 0.6));
</script>

<div
  bind:this={wrapperEl}
  class="badge-flip"
  style="width: {size}px; height: {size}px;"
  onclick={handleClick}
  ondblclick={handleDoubleClick}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
  title="{badge.character.label} · Click: frase · Doble click: catálogo"
  role="button"
  tabindex="0"
>
  <div class="badge-face front" style="background: {badge.color}; font-size: {Math.round(size * 0.45)}px;">
    {badge.initial}
  </div>
  <div class="badge-face back" style="background: {badge.color};">
    <div class="icon-wrap anim-{badge.character.anim}">
      <BusinessIcon name={badge.character.key} size={inner} />
    </div>
  </div>
</div>

{#if quote}
  <div
    bind:this={quoteEl}
    use:portal
    class="user-badge-quote side-{quote.side}"
    style="opacity: 0;"
  >
    <span class="quote-name">{badge.character.label}</span>
    <span class="quote-text">{badge.character.quote}</span>
  </div>
{/if}

<style>
  /* ── Flip card 3D (letra ↔ personaje) ──────────────────────────────────── */
  .badge-flip {
    position: relative;
    perspective: 700px;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }
  .badge-face {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transition: transform 0.55s cubic-bezier(.4, 0, .2, 1);
    transform-style: preserve-3d;
    color: #fff;
    font-weight: 700;
    flex-shrink: 0;
  }
  .badge-face.front { transform: rotateY(0deg);   z-index: 2; }
  .badge-face.back  { transform: rotateY(180deg); z-index: 1; overflow: hidden; }
  .badge-flip:hover .badge-face.front { transform: rotateY(-180deg); }
  .badge-flip:hover .badge-face.back  { transform: rotateY(0deg); }
  .icon-wrap {
    transition: transform 200ms ease;
    transform-origin: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── 24 keyframes (uno por personaje) ──────────────────────────────────── */
  @keyframes ico-bin-wave     { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
  @keyframes ico-bin-pleading { 0%,100% { transform: translateY(0); } 20% { transform: translateY(-4px); } 40% { transform: translateY(0); } 60% { transform: translateY(-3px); } 80% { transform: translateY(0); } }
  @keyframes ico-bin-twirl    { 0% { transform: rotate(0) scale(1); } 50% { transform: rotate(180deg) scale(1.08); } 100% { transform: rotate(360deg) scale(1); } }
  @keyframes ico-bin-breathe  { 0%,100% { transform: scale(1) rotate(-2deg); } 50% { transform: scale(1.06) rotate(2deg); } }
  @keyframes ico-truck-drive   { 0% { transform: translateX(-10px); } 50% { transform: translateX(0) translateY(-1px); } 100% { transform: translateX(10px); } }
  @keyframes ico-sweeper-sweep { 0%,100% { transform: translateX(-5px) rotate(-4deg); } 50% { transform: translateX(5px) rotate(4deg); } }
  @keyframes ico-robot-glitch  { 0%,100% { transform: translate(0,0); filter: brightness(1); } 20% { transform: translate(-1.5px,1px); filter: brightness(1.4); } 40% { transform: translate(1.5px,-1px); filter: brightness(0.7); } 60% { transform: translate(-1px,0); filter: brightness(1.3); } 80% { transform: translate(1px,1px); filter: brightness(1); } }
  @keyframes ico-captain-sail  { 0%,100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-4px) rotate(6deg); } }
  @keyframes ico-broom-sweep   { 0%,100% { transform: rotate(-18deg) translateX(-3px); } 50% { transform: rotate(18deg) translateX(3px); } }
  @keyframes ico-mop-circular  { 0% { transform: translate(0,0); } 25% { transform: translate(4px,-2px); } 50% { transform: translate(0,-4px); } 75% { transform: translate(-4px,-2px); } 100% { transform: translate(0,0); } }
  @keyframes ico-bucket-wobble { 0%,100% { transform: scale(1,1) rotate(0); } 25% { transform: scale(1.08,0.92) rotate(-4deg); } 50% { transform: scale(0.94,1.06) rotate(0); } 75% { transform: scale(1.06,0.94) rotate(4deg); } }
  @keyframes ico-bottle-roll   { 0% { transform: translateX(-14px) rotate(-200deg); } 100% { transform: translateX(14px) rotate(200deg); } }
  @keyframes ico-box-squash    { 0%,100% { transform: scaleY(1) scaleX(1); } 30% { transform: scaleY(0.78) scaleX(1.15); } 60% { transform: scaleY(1.08) scaleX(0.94); } }
  @keyframes ico-can-crush     { 0%,100% { transform: scaleY(1); } 25% { transform: scaleY(0.6); } 45% { transform: scaleY(0.6); } 75% { transform: scaleY(1.1); } }
  @keyframes ico-bag-breathe   { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
  @keyframes ico-oil-pour      { 0%,100% { transform: rotate(0) translateX(0); } 35% { transform: rotate(-30deg) translateX(-2px); } 65% { transform: rotate(-35deg) translateX(-2px); } }
  @keyframes ico-battery-zap   { 0%,100% { transform: scale(1) translate(0,0); filter: drop-shadow(0 0 0 transparent); } 20% { transform: scale(1.08) translate(-1px,0); filter: drop-shadow(0 0 4px gold); } 40% { transform: scale(1) translate(1px,0); filter: drop-shadow(0 0 0 transparent); } 60% { transform: scale(1.06) translate(-1px,0); filter: drop-shadow(0 0 3px gold); } 80% { transform: scale(1) translate(0,0); filter: drop-shadow(0 0 0 transparent); } }
  @keyframes ico-raccoon-sniff { 0%,100% { transform: translate(0,0); } 25% { transform: translate(3px,-2px) rotate(4deg); } 50% { transform: translate(0,0); } 75% { transform: translate(-3px,-2px) rotate(-4deg); } }
  @keyframes ico-boar-charge   { 0% { transform: translateX(0) rotate(0); } 20% { transform: translateX(-7px) rotate(-4deg); } 65% { transform: translateX(10px) rotate(4deg); } 100% { transform: translateX(0) rotate(0); } }
  @keyframes ico-leaf-fall     { 0% { transform: translateY(-10px) rotate(-25deg); } 50% { transform: translateY(0) rotate(25deg); } 100% { transform: translateY(-10px) rotate(-25deg); } }
  @keyframes ico-drop-bounce   { 0% { transform: translateY(-14px) scale(1,1); } 55% { transform: translateY(0) scale(1.25,0.65); } 75% { transform: translateY(-4px) scale(0.92,1.08); } 100% { transform: translateY(-14px) scale(1,1); } }
  @keyframes ico-cone-peek       { 0%,100% { transform: rotate(0) translateY(0); } 30% { transform: rotate(-15deg) translateY(-2px); } 70% { transform: rotate(15deg) translateY(-2px); } }
  @keyframes ico-cone-wink-pulse { 0%,100% { transform: scale(1) rotate(0); } 25% { transform: scale(1.1) rotate(-3deg); } 50% { transform: scale(1) rotate(0); } 75% { transform: scale(1.08) rotate(3deg); } }
  @keyframes ico-cone-fly        { 0% { transform: translate(-10px,6px) rotate(-25deg); } 50% { transform: translate(10px,-12px) rotate(25deg); } 100% { transform: translate(-10px,6px) rotate(-25deg); } }

  /* Aplican solo cuando se hace hover del badge */
  .badge-flip:hover .icon-wrap.anim-bin-wave        { animation: ico-bin-wave        1.0s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-bin-pleading    { animation: ico-bin-pleading    0.7s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-bin-twirl       { animation: ico-bin-twirl       1.8s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-bin-breathe     { animation: ico-bin-breathe     2.6s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-truck-drive     { animation: ico-truck-drive     1.5s ease-in-out infinite alternate; }
  .badge-flip:hover .icon-wrap.anim-sweeper-sweep   { animation: ico-sweeper-sweep   0.9s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-robot-glitch    { animation: ico-robot-glitch    0.35s steps(3)   infinite; }
  .badge-flip:hover .icon-wrap.anim-captain-sail    { animation: ico-captain-sail    1.6s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-broom-sweep     { animation: ico-broom-sweep     0.5s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-mop-circular    { animation: ico-mop-circular    1.2s linear      infinite; }
  .badge-flip:hover .icon-wrap.anim-bucket-wobble   { animation: ico-bucket-wobble   0.9s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-bottle-roll     { animation: ico-bottle-roll     1.6s ease-in-out infinite alternate; }
  .badge-flip:hover .icon-wrap.anim-box-squash      { animation: ico-box-squash      1.2s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-can-crush       { animation: ico-can-crush       1.4s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-bag-breathe     { animation: ico-bag-breathe     2.0s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-oil-pour        { animation: ico-oil-pour        1.8s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-battery-zap     { animation: ico-battery-zap     0.8s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-raccoon-sniff   { animation: ico-raccoon-sniff   0.7s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-boar-charge     { animation: ico-boar-charge     1.2s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-leaf-fall       { animation: ico-leaf-fall       2.4s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-drop-bounce     { animation: ico-drop-bounce     1.4s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-cone-peek       { animation: ico-cone-peek       1.2s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-cone-wink-pulse { animation: ico-cone-wink-pulse 1.0s ease-in-out infinite; }
  .badge-flip:hover .icon-wrap.anim-cone-fly        { animation: ico-cone-fly        1.8s ease-in-out infinite; }

  /* La animación del personaje arranca DESPUÉS del flip (0.55s) */
  .badge-flip:hover .icon-wrap[class*="anim-"] {
    animation-delay: 0.55s;
  }

  /* ── Bocadillo (renderizado vía portal en document.body) ─────────────── */
  :global(.user-badge-quote) {
    position: fixed;
    background: #1d1d1f;
    color: #fff;
    padding: 7px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    pointer-events: none;
    z-index: 9999;
    box-shadow: 0 6px 22px rgba(0,0,0,0.25);
    text-align: center;
    line-height: 1.3;
    max-width: calc(100vw - 24px);
    transition: opacity 0.18s ease;
    font-family: inherit;
  }
  :global(.user-badge-quote .quote-name) { display: block; font-weight: 700; font-size: 12px; letter-spacing: 0.2px; }
  :global(.user-badge-quote .quote-text) { display: block; font-weight: 400; font-size: 11px; opacity: 0.88; margin-top: 1px; font-style: italic; }
  :global(.user-badge-quote::after) {
    content: '';
    position: absolute;
    width: 0; height: 0;
    border: 6px solid transparent;
  }
  :global(.user-badge-quote.side-top::after) {
    bottom: -12px;
    left: var(--arrow-x, 50%);
    margin-left: -6px;
    border-top-color: #1d1d1f;
  }
  :global(.user-badge-quote.side-bottom::after) {
    top: -12px;
    left: var(--arrow-x, 50%);
    margin-left: -6px;
    border-bottom-color: #1d1d1f;
  }
  :global(.user-badge-quote.side-right::after) {
    left: -12px;
    top: var(--arrow-y, 50%);
    margin-top: -6px;
    border-right-color: #1d1d1f;
  }
  :global(.user-badge-quote.side-left::after) {
    right: -12px;
    top: var(--arrow-y, 50%);
    margin-top: -6px;
    border-left-color: #1d1d1f;
  }
</style>
