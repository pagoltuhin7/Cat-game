export type ChickenType = 'DRUMSTICK' | 'HOT_WING' | 'ROAST_CHICKEN' | 'NUGGET';

export interface Chicken {
  id: string;
  type: ChickenType;
  x: number;
  y: number;
  radius: number;
  points: number;
  weight: number; // bites needed to finish (1 for drumstick, 3 for roast)
  bitesLeft: number;
  angle: number;
  isHeld: boolean;
  isSaved: boolean;
  isEaten: boolean;
  spawnTime: number;
  hotness: number; // 0 to 1 (emits steam particles when hot)
  scale: number;
}

export type CatBreed = 'TABBY' | 'CALICO' | 'SHADOW' | 'BOSS_CHONK';

export type CatState = 
  | 'IDLE' 
  | 'STALKING' 
  | 'TELEGRAPH' 
  | 'POUNCING' 
  | 'EATING' 
  | 'DISTRACTED' 
  | 'RETREAT';

export interface Cat {
  id: string;
  name: string;
  breed: CatBreed;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  speed: number;
  state: CatState;
  stateTimer: number;
  targetChickenId: string | null;
  targetToyId: string | null;
  telegraphDuration: number;
  eatTimer: number;
  angle: number;
  tailWiggle: number;
  eyeGlow: number;
  color: string;
  stripeColor: string;
  bellyFullness: number;
  pounceProgress: number;
  pounceStart: { x: number; y: number };
}

export type ToyType = 'YARN_BALL' | 'CATNIP' | 'BELL_RATTLE';

export interface Toy {
  id: string;
  type: ToyType;
  x: number;
  y: number;
  radius: number;
  duration: number; // remaining seconds
  maxDuration: number;
  angle: number;
  bouncesLeft: number;
  vx: number;
  vy: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'CRUMB' | 'STEAM' | 'SPARKLE' | 'HEART' | 'SWEAT' | 'FIRE' | 'CLAW';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  alpha: number;
  vy: number;
  life: number;
}

export interface SafeBasket {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameLevelConfig {
  levelNumber: number;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  targetRescues: number;
  maxAllowedEaten: number;
  catsConfig: {
    breed: CatBreed;
    nameBn: string;
    nameEn: string;
    speed: number;
    telegraphTime: number;
  }[];
  spawnInterval: number; // ms
  maxSimultaneousChickens: number;
}

export type GameMode = 'LEVELS' | 'ENDLESS';

export type GameStatus = 'TITLE' | 'PLAYING' | 'PAUSED' | 'LEVEL_CLEAR' | 'GAME_OVER';

export interface GameStats {
  score: number;
  rescuedCount: number;
  eatenCount: number;
  combo: number;
  maxCombo: number;
  level: number;
  mode: GameMode;
  toys: {
    yarn: number;
    catnip: number;
    bell: number;
  };
}
