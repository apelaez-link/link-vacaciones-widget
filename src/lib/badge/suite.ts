// ─────────────────────────────────────────────────────────────────────────────
//  Suite "Link Crew" — datos puros de los personajes para el UserBadge.
//  Espejo del archivo lib/badge/suite.ts en el repo web link-vacaciones.
//  Cualquier cambio aquí debe propagarse al otro repo (y viceversa) para
//  mantener la consistencia entre plataformas.
// ─────────────────────────────────────────────────────────────────────────────

export type AnimKey =
  | 'bin-wave' | 'bin-pleading' | 'bin-twirl' | 'bin-breathe'
  | 'truck-drive' | 'sweeper-sweep' | 'robot-glitch' | 'captain-sail'
  | 'broom-sweep' | 'mop-circular' | 'bucket-wobble'
  | 'bottle-roll' | 'box-squash' | 'can-crush' | 'bag-breathe' | 'oil-pour' | 'battery-zap'
  | 'raccoon-sniff' | 'boar-charge' | 'leaf-fall' | 'drop-bounce'
  | 'cone-peek' | 'cone-wink-pulse' | 'cone-fly';

export type IconKey =
  | 'IcoBinSmile' | 'IcoBinHungry' | 'IcoBinHappy' | 'IcoBinSleepy'
  | 'IcoTruckBuddy' | 'IcoSweeperFace' | 'IcoRobotClean' | 'IcoTankerCaptain'
  | 'IcoBroomChar' | 'IcoMopChar' | 'IcoBucketChar'
  | 'IcoBottleChar' | 'IcoBoxChar' | 'IcoCanChar' | 'IcoBagChar' | 'IcoOilChar' | 'IcoBatteryChar'
  | 'IcoRaccoon' | 'IcoBoarChar' | 'IcoLeafSmile' | 'IcoDropFace'
  | 'IcoConeBuddy' | 'IcoConeWink' | 'IcoConeHero';

export interface BadgeCharacter {
  key:   IconKey;
  label: string;
  group: string;
  quote: string;
  anim:  AnimKey;
}

export const BADGE_SUITE: BadgeCharacter[] = [
  { key: 'IcoBinSmile',      group: 'Contenedores',  label: 'Cubo Sonriente',     quote: '¡Recíclame, que estoy de buen rollo!',     anim: 'bin-wave' },
  { key: 'IcoBinHungry',     group: 'Contenedores',  label: 'Cubo Hambriento',    quote: '¡Más basura, por favor!',                   anim: 'bin-pleading' },
  { key: 'IcoBinHappy',      group: 'Contenedores',  label: 'Cubo Encantado',     quote: '¡Otro envase bien tirado, yuju!',           anim: 'bin-twirl' },
  { key: 'IcoBinSleepy',     group: 'Contenedores',  label: 'Cubo Dormilón',      quote: 'Zzz… mañana sigo separando.',                anim: 'bin-breathe' },
  { key: 'IcoTruckBuddy',    group: 'Vehículos',     label: 'Camión Amigo',       quote: '¡Voy a por la siguiente esquina!',         anim: 'truck-drive' },
  { key: 'IcoSweeperFace',   group: 'Vehículos',     label: 'Barredora Sonriente',quote: 'Dejo el suelo como un espejo.',             anim: 'sweeper-sweep' },
  { key: 'IcoRobotClean',    group: 'Vehículos',     label: 'Robot Limpiador',    quote: 'Beep boop. Limpieza en curso.',             anim: 'robot-glitch' },
  { key: 'IcoTankerCaptain', group: 'Vehículos',     label: 'Capitán Cisterna',   quote: '¡A toda agua, marineros!',                  anim: 'captain-sail' },
  { key: 'IcoBroomChar',     group: 'Herramientas',  label: 'Escobita',           quote: 'Una pasada y todo brilla.',                 anim: 'broom-sweep' },
  { key: 'IcoMopChar',       group: 'Herramientas',  label: 'Fregonita',          quote: 'El suelo ya está chuli.',                   anim: 'mop-circular' },
  { key: 'IcoBucketChar',    group: 'Herramientas',  label: 'Cubito',             quote: 'Soy pequeño pero matón.',                    anim: 'bucket-wobble' },
  { key: 'IcoBottleChar',    group: 'Residuos',      label: 'Sra. Botella',       quote: 'Devuélveme al iglú verde, por favor.',      anim: 'bottle-roll' },
  { key: 'IcoBoxChar',       group: 'Residuos',      label: 'Sr. Cartón',         quote: 'Aplástame antes de tirarme.',                anim: 'box-squash' },
  { key: 'IcoCanChar',       group: 'Residuos',      label: 'Latín',              quote: 'Una latita más al amarillo.',                anim: 'can-crush' },
  { key: 'IcoBagChar',       group: 'Residuos',      label: 'Bolsita',            quote: 'No me dejes fuera del contenedor.',          anim: 'bag-breathe' },
  { key: 'IcoOilChar',       group: 'Residuos',      label: 'Sr. Aceite',         quote: 'Yo voy al punto limpio, ¿eh?',               anim: 'oil-pour' },
  { key: 'IcoBatteryChar',   group: 'Residuos',      label: 'Pilín',              quote: '¡Al contenedor de pilas SIEMPRE!',           anim: 'battery-zap' },
  { key: 'IcoRaccoon',       group: 'Mascotas',      label: 'Mapache',            quote: 'Yo soy el responsable original de la basura.', anim: 'raccoon-sniff' },
  { key: 'IcoBoarChar',      group: 'Mascotas',      label: 'Jabalí',             quote: 'Si dejas el contenedor abierto… yo voy.',    anim: 'boar-charge' },
  { key: 'IcoLeafSmile',     group: 'Mascotas',      label: 'Hojita Feliz',       quote: 'Compóstame y vuelvo en primavera.',          anim: 'leaf-fall' },
  { key: 'IcoDropFace',      group: 'Mascotas',      label: 'Gotita',             quote: '¡Splash! Sin agua no hay limpieza.',         anim: 'drop-bounce' },
  { key: 'IcoConeBuddy',     group: 'Conos',         label: 'Conito Curioso',     quote: '¡Cuidado, obras en curso!',                  anim: 'cone-peek' },
  { key: 'IcoConeWink',      group: 'Conos',         label: 'Conito Pícaro',      quote: 'Psst… te estoy mirando.',                    anim: 'cone-wink-pulse' },
  { key: 'IcoConeHero',      group: 'Conos',         label: 'Súper Conito',       quote: 'Salvando aceras desde 1985.',                anim: 'cone-fly' },
];

export const BADGE_COLORS: string[] = [
  '#7C3AED', '#1E6FDB', '#D97706', '#059669', '#DC2626', '#0E8AB8', '#9333EA', '#0891B2',
];
