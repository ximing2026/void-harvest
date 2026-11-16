// VOID HARVEST tuning: every number that shapes how the game feels lives here, so the
// balance can be changed in one place without touching the logic that reads it.

export const ARENA = { width: 1280, height: 800 };

export const SHIP = {
  radius: 14,
  accel: 2600,
  maxSpeed: 340,
  drag: 4.2,
  startHull: 3,
  invulnerableMs: 1400,
};

export const DASH = {
  speed: 980,
  durationMs: 170,
  cooldownMs: 2200,
  mineScore: 25,
};

export const CORE = {
  radius: 11,
  baseValue: 10,
  spawnEveryMs: 900,
  maxAlive: 9,
  driftMin: 24,
  driftMax: 62,
  magnetSpeed: 520,
};

export const MINE = {
  radius: 16,
  seekAccel: 26,
  maxSpeedBase: 62,
  maxSpeedPerWave: 7,
  spawnEveryMs: 3400,
  spawnEveryPerWaveMs: -160,
  maxAliveBase: 4,
  maxAlivePerWave: 1,
};

export const COMBO = {
  windowMs: 2500,
  maxMultiplier: 8,
};

export const WAVE = {
  quotaBase: 8,
  quotaPerWave: 3,
};

export const COLORS = {
  void: '#070812',
  grid: '#1b2140',
  ship: '#57f7e0',
  shipCore: '#eafffb',
  core: '#ffd94d',
  coreGlow: '#ff9d2e',
  mine: '#2a0f22',
  mineSpike: '#571d3f',
  mineHeart: '#ff3b6b',
  text: '#dfe9ff',
  dim: '#8fa3c8',
  accent: '#7c5cff',
  danger: '#ff5470',
  good: '#4ade80',
};
