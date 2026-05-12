// ─────────────────────────────────────────────────────────────────────────────
//  Business icons — paths SVG de los 24 personajes "Link Crew" como strings.
//  Renderizados con {@html} en BusinessIcon.svelte para evitar 24 componentes.
//  Espejo de apps/web/src/components/ui/BusinessIcons.tsx en el repo web.
// ─────────────────────────────────────────────────────────────────────────────

import type { IconKey } from './suite';

// Ojo sólido reutilizable
const eye = (cx: number, cy: number, r = 0.9) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" stroke="none"/>`;

export const BUSINESS_ICONS: Record<IconKey, string> = {
  // ── Contenedores con cara ────────────────────────────────────────────────

  IcoBinSmile: `
    <path d="M5 8h14l-1.5 13h-11z"/>
    <path d="M3 6h18M9 4h6"/>
    ${eye(10, 13)}
    ${eye(14, 13)}
    <path d="M10 16c0.7 1 3.3 1 4 0"/>
  `,

  IcoBinHungry: `
    <path d="M5 8h14l-1.5 13h-11z"/>
    <path d="M3 6h18M9 4h6"/>
    ${eye(10, 12)}
    ${eye(14, 12)}
    <ellipse cx="12" cy="17" rx="2" ry="1.5"/>
  `,

  IcoBinHappy: `
    <path d="M5 8h14l-1.5 13h-11z"/>
    <path d="M3 6h18M9 4h6"/>
    <path d="M9 13c0.5-1 1.5-1 2 0"/>
    <path d="M13 13c0.5-1 1.5-1 2 0"/>
    <path d="M10 16c0.7 1.2 3.3 1.2 4 0"/>
  `,

  IcoBinSleepy: `
    <path d="M5 8h14l-1.5 13h-11z"/>
    <path d="M3 6h18M9 4h6"/>
    <path d="M9 13h2M13 13h2"/>
    <path d="M11 17h2"/>
    <path d="M16 9l1-1.5L18 9"/>
  `,

  // ── Vehículos con cara ──────────────────────────────────────────────────

  IcoTruckBuddy: `
    <path d="M2 17V9h8v8"/>
    <path d="M10 12h6l3 3v2h-9"/>
    <circle cx="6" cy="18.5" r="1.5"/>
    <circle cx="16" cy="18.5" r="1.5"/>
    ${eye(5, 12)}
    ${eye(8, 12)}
    <path d="M5 14.5c0.7 0.8 2.3 0.8 3 0"/>
  `,

  IcoSweeperFace: `
    <path d="M3 18h13l2-7h-3l-1-2H7l-2 9"/>
    <circle cx="8" cy="19" r="1.5"/>
    <circle cx="15" cy="19" r="1.5"/>
    <circle cx="20" cy="17" r="2.5"/>
    <path d="M18.2 15.2l3.6 3.6M18.2 18.8l3.6-3.6"/>
    ${eye(9, 13)}
    ${eye(13, 13)}
    <path d="M9.5 15.5c1 0.5 2 0.5 3 0"/>
  `,

  IcoRobotClean: `
    <path d="M12 3v2"/>
    <circle cx="12" cy="2.5" r="0.5" fill="currentColor"/>
    <rect x="5" y="5" width="14" height="11" rx="2"/>
    <rect x="7" y="8" width="4" height="4" rx="2"/>
    <rect x="13" y="8" width="4" height="4" rx="2"/>
    ${eye(9, 10, 0.6)}
    ${eye(15, 10, 0.6)}
    <path d="M9 14h6"/>
    <path d="M6 16l-1 5M18 16l1 5"/>
    <path d="M4 21h6M14 21h6"/>
  `,

  IcoTankerCaptain: `
    <path d="M2 17v-5h3"/>
    <rect x="5" y="10" width="13" height="7" rx="3.5"/>
    <path d="M18 12h2l1 2v3h-3"/>
    <circle cx="8" cy="18.5" r="1.5"/>
    <circle cx="16" cy="18.5" r="1.5"/>
    <path d="M8 10V8c0-0.5 5-0.5 5 0v2"/>
    <path d="M7 10h7"/>
    <circle cx="10.5" cy="9" r="0.7" fill="currentColor" stroke="none"/>
    ${eye(9, 13.5)}
    ${eye(13, 13.5)}
    <path d="M9 15.5c1 0.8 3 0.8 4 0"/>
  `,

  // ── Herramientas con cara ────────────────────────────────────────────────

  IcoBroomChar: `
    <path d="M12 3v9"/>
    ${eye(10.5, 7, 0.7)}
    ${eye(13.5, 7, 0.7)}
    <path d="M11 9.5c0.4 0.6 1.6 0.6 2 0"/>
    <path d="M7 12h10l-1 4h-8z"/>
    <path d="M8 16l-1 5M11 16l-0.5 5M13 16l0.5 5M16 16l1 5"/>
  `,

  IcoMopChar: `
    <path d="M12 2v6"/>
    <rect x="7" y="8" width="10" height="6" rx="1.5"/>
    ${eye(10, 10.5)}
    ${eye(14, 10.5)}
    <path d="M10 12.5c0.7 1 2.3 1 3 0"/>
    <path d="M8 14l-0.5 6M10 14l-0.3 6M12 14v6M14 14l0.3 6M16 14l0.5 6"/>
  `,

  IcoBucketChar: `
    <path d="M5 7h14l-2 14H7L5 7z"/>
    <path d="M5 7c0-2 3-4 7-4s7 2 7 4"/>
    ${eye(10, 12)}
    ${eye(14, 12)}
    <path d="M10 16c0.7 1.2 3.3 1.2 4 0"/>
  `,

  // ── Residuos personificados ──────────────────────────────────────────────

  IcoBottleChar: `
    <path d="M10 2h4v3"/>
    <path d="M10 5c-0.5 1-2 2-2 4v10a2 2 0 002 2h4a2 2 0 002-2V9c0-2-1.5-3-2-4z"/>
    <path d="M8 11h8"/>
    ${eye(10.5, 14)}
    ${eye(13.5, 14)}
    <path d="M10.5 17c0.7 1 2.3 1 3 0"/>
  `,

  IcoBoxChar: `
    <path d="M4 8l8-4 8 4v10l-8 4-8-4z"/>
    <path d="M4 8l8 4 8-4M12 12v10"/>
    ${eye(9, 13.5)}
    ${eye(15, 13.5)}
    <path d="M9.5 17c0.8 1 4 1 4.5 0"/>
  `,

  IcoCanChar: `
    <ellipse cx="12" cy="5" rx="6" ry="1.8"/>
    <path d="M6 5v14c0 1 2.7 1.8 6 1.8s6-0.8 6-1.8V5"/>
    ${eye(10, 12)}
    ${eye(14, 12)}
    <path d="M10 16c0.7 1 2.3 1 3 0"/>
    <path d="M9 8h6"/>
  `,

  IcoBagChar: `
    <path d="M9 5l-1-2M15 5l1-2M12 5V2.5"/>
    <path d="M9 3h6"/>
    <path d="M6 7h12l-1 13c-0.1 0.5-0.5 1-1 1H8c-0.5 0-0.9-0.5-1-1L6 7z"/>
    ${eye(10, 12)}
    ${eye(14, 12)}
    <path d="M10 16c0.7 1 2.3 1 3 0"/>
  `,

  IcoOilChar: `
    <path d="M11 2h2v3"/>
    <path d="M9 5h6"/>
    <path d="M9 5l-1 2v12a2 2 0 002 2h4a2 2 0 002-2V7l-1-2"/>
    <path d="M8 10h8M8 14h8"/>
    ${eye(10.5, 12)}
    ${eye(13.5, 12)}
    <path d="M10.5 16.5c0.7 1 2.3 1 3 0"/>
  `,

  IcoBatteryChar: `
    <path d="M10 3h4v2"/>
    <rect x="7" y="5" width="10" height="16" rx="1.5"/>
    <path d="M7 9h10"/>
    <path d="M9 7h2M10 6v2"/>
    ${eye(10, 13)}
    ${eye(14, 13)}
    <path d="M10 16c1 1.2 3 1.2 4 0"/>
  `,

  // ── Mascotas urbanas ────────────────────────────────────────────────────

  IcoRaccoon: `
    <path d="M6 6l1 4M18 6l-1 4"/>
    <path d="M6 6l2.5 1M18 6L15.5 7"/>
    <ellipse cx="12" cy="13" rx="8" ry="7"/>
    <path d="M7 11c1 0 2 0.5 2.5 1.5"/>
    <path d="M17 11c-1 0-2 0.5-2.5 1.5"/>
    ${eye(9, 13)}
    ${eye(15, 13)}
    <path d="M11 16.5c0.5 0.5 1.5 0.5 2 0"/>
    <path d="M11 17.5c0.4-0.3 1.2-0.3 1.5 0c0.3 0.4 1 0.4 1.5 0"/>
    <circle cx="12" cy="16" r="0.7" fill="currentColor" stroke="none"/>
  `,

  IcoBoarChar: `
    <path d="M5 8l-1-3 3 1.5"/>
    <path d="M19 8l1-3-3 1.5"/>
    <path d="M8 6l0.5-2 1 1.5 1-2 1 1.5 1-2 1 1.5 0.5-1.5"/>
    <path d="M4 13c0-4 3.5-7 8-7s8 3 8 7c0 4-3 8-8 8s-8-4-8-8z"/>
    <ellipse cx="12" cy="17" rx="3.5" ry="2"/>
    <circle cx="10.8" cy="17" r="0.4" fill="currentColor" stroke="none"/>
    <circle cx="13.2" cy="17" r="0.4" fill="currentColor" stroke="none"/>
    <path d="M9.5 18.5l-1 2"/>
    <path d="M14.5 18.5l1 2"/>
    ${eye(9, 12)}
    ${eye(15, 12)}
  `,

  IcoLeafSmile: `
    <path d="M11 20c5 0 9-4 9-12V4h-4c-8 0-12 4-12 9 0 4 3 7 7 7z"/>
    <path d="M4 21c6-8 9-10 16-13"/>
    ${eye(10, 11)}
    ${eye(14, 11)}
    <path d="M10 14c0.7 1 2.3 1 3 0"/>
  `,

  IcoDropFace: `
    <path d="M12 3c-3 4-6 7-6 11a6 6 0 0012 0c0-4-3-7-6-11z"/>
    ${eye(10, 13)}
    ${eye(14, 13)}
    <path d="M10 16c0.7 1 2.3 1 3 0"/>
  `,

  // ── Conos ────────────────────────────────────────────────────────────────

  IcoConeBuddy: `
    <path d="M13.9 3.5a1.93 1.93 0 00-3.8 0L6.3 19.9a2 2 0 001.8 2.1h7.8a2 2 0 001.8-2L13.9 3.5z"/>
    <path d="M6.5 18.5h11"/>
    ${eye(10.5, 13)}
    ${eye(13.5, 13)}
    <path d="M11 16c0.5 0.5 1.5 0.5 2 0"/>
  `,

  IcoConeWink: `
    <path d="M13.9 3.5a1.93 1.93 0 00-3.8 0L6.3 19.9a2 2 0 001.8 2.1h7.8a2 2 0 001.8-2L13.9 3.5z"/>
    <path d="M6.5 18.5h11"/>
    <path d="M9.5 13c0.5-0.7 1.5-0.7 2 0"/>
    ${eye(13.5, 13)}
    <path d="M11 16c0.5 0.5 1.5 0.5 2 0"/>
  `,

  IcoConeHero: `
    <path d="M16 7l4-1-1 4 3 1-2 3 2 2-4 1"/>
    <path d="M13.9 3.5a1.93 1.93 0 00-3.8 0L6.3 19.9a2 2 0 001.8 2.1h7.8a2 2 0 001.8-2L13.9 3.5z"/>
    <path d="M6.5 18.5h11"/>
    ${eye(10.5, 12)}
    ${eye(13.5, 12)}
    <path d="M11 15c0.5 0.5 1.5 0.5 2 0"/>
    <path d="M11.5 17l0.5 0.8 0.5-0.8"/>
  `,
};
