// The world of VOID HARVEST: the ship, the cores it harvests, the void mines hunting it,
// and the particles everything bursts into. This file owns the simulation: spawning,
// movement, collisions and scoring. Drawing lives in render.js; the run's state machine
// lives in main.js.

import { ARENA, SHIP, DASH, CORE, MINE, COMBO, WAVE } from './config.js';

const rand = (min, max) => min + Math.random() * (max - min);
const dist2 = (a, b) => {
  const dx = a.x - b.x, dy = a.y - b.y;
  return dx * dx + dy * dy;
};

export class World {
  constructor(sfx) {
    this.sfx = sfx;
    this.reset();
  }

  reset() {
    this.ship = {
      x: ARENA.width / 2, y: ARENA.height / 2, vx: 0, vy: 0,
      angle: -Math.PI / 2, hull: SHIP.startHull, invulnerableUntil: 0,
      dashUntil: 0, dashReadyAt: 0, trail: [],
    };
    this.run = {
      maxHull: SHIP.startHull,
      magnetRadius: 92,
      dashCooldownMs: DASH.cooldownMs,
      coreValueMult: 1,
      speedMult: 1,
      invulnerableMs: SHIP.invulnerableMs,
    };
    this.cores = [];
    this.mines = [];
    this.particles = [];
    this.score = 0;
    this.combo = 0;
    this.bestComboMult = 1;
    this.comboUntil = 0;
    this.wave = 1;
    this.harvestedThisWave = 0;
    this.coreTimer = 0;
    this.mineTimer = 1500;
    this.shake = 0;
    this.flash = 0;
  }

  get hull() { return this.ship.hull; }
  get maxHull() { return this.run.maxHull; }
  get quota() { return WAVE.quotaBase + (this.wave - 1) * WAVE.quotaPerWave; }
  get comboMult() { return 1 + Math.min(this.combo, COMBO.maxMultiplier * 2) * 0.25; }

  spawnCore() {
    const edge = Math.floor(Math.random() * 4);
    const pos = [
      { x: rand(40, ARENA.width - 40), y: 30 },
      { x: rand(40, ARENA.width - 40), y: ARENA.height - 30 },
      { x: 30, y: rand(40, ARENA.height - 40) },
      { x: ARENA.width - 30, y: rand(40, ARENA.height - 40) },
    ][edge];
    const speed = rand(CORE.driftMin, CORE.driftMax);
    const dir = Math.atan2(ARENA.height / 2 - pos.y, ARENA.width / 2 - pos.x) + rand(-0.7, 0.7);
    this.cores.push({ ...pos, vx: Math.cos(dir) * speed, vy: Math.sin(dir) * speed, pulse: rand(0, Math.PI * 2) });
  }

  spawnMine() {
    // Mines arrive away from the ship, so a spawn is a threat, never a cheap hit.
    let pos;
    do {
      const edge = Math.floor(Math.random() * 4);
      pos = [
        { x: rand(30, ARENA.width - 30), y: 24 },
        { x: rand(30, ARENA.width - 30), y: ARENA.height - 24 },
        { x: 24, y: rand(30, ARENA.height - 30) },
        { x: ARENA.width - 24, y: rand(30, ARENA.height - 30) },
      ][edge];
    } while (dist2(pos, this.ship) < 260 * 260);
    this.mines.push({ ...pos, vx: 0, vy: 0, spin: rand(0, Math.PI * 2), pulse: rand(0, Math.PI * 2) });
  }

  burst(x, y, color, count, speed) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(speed * 0.2, speed);
      this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(260, 640), born: performance.now(), color, size: rand(1.5, 3.5) });
    }
  }

  tryDash(now, axis) {
    const ship = this.ship;
    if (now < ship.dashReadyAt || now < ship.dashUntil) return false;
    let dx = axis.x, dy = axis.y;
    if (dx === 0 && dy === 0) { dx = Math.cos(ship.angle); dy = Math.sin(ship.angle); }
    const len = Math.hypot(dx, dy);
    ship.vx = (dx / len) * DASH.speed;
    ship.vy = (dy / len) * DASH.speed;
    ship.dashUntil = now + DASH.durationMs;
    ship.dashReadyAt = now + this.run.dashCooldownMs;
    this.sfx.dash();
    this.burst(ship.x, ship.y, '#57f7e0', 10, 190);
    return true;
  }

  /** Advance the simulation one step. Returns an event string when the run changes state. */
  update(dtMs, now, input) {
    const dt = Math.min(dtMs, 50) / 1000;
    const ship = this.ship;

    // Steering: thrust toward the held direction, drag everywhere else.
    const axis = input.axis();
    if (input.dashHeld()) this.tryDash(now, axis);
    ship.vx += axis.x * SHIP.accel * dt;
    ship.vy += axis.y * SHIP.accel * dt;
    const dragK = Math.exp(-SHIP.drag * dt);
    if (axis.x === 0) ship.vx *= dragK;
    if (axis.y === 0) ship.vy *= dragK;
    const speed = Math.hypot(ship.vx, ship.vy);
    const cap = (now < ship.dashUntil ? DASH.speed : SHIP.maxSpeed * this.run.speedMult);
    if (speed > cap) { ship.vx = (ship.vx / speed) * cap; ship.vy = (ship.vy / speed) * cap; }
    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;
    ship.x = Math.max(SHIP.radius, Math.min(ARENA.width - SHIP.radius, ship.x));
    ship.y = Math.max(SHIP.radius, Math.min(ARENA.height - SHIP.radius, ship.y));
    if (speed > 24) ship.angle = Math.atan2(ship.vy, ship.vx);
    ship.trail.push({ x: ship.x, y: ship.y, at: now });
    ship.trail = ship.trail.filter((p) => now - p.at < 220);

    // Spawning.
    this.coreTimer -= dtMs;
    if (this.coreTimer <= 0 && this.cores.length < CORE.maxAlive) { this.spawnCore(); this.coreTimer = CORE.spawnEveryMs * rand(0.7, 1.3); }
    this.mineTimer -= dtMs;
    const mineCap = MINE.maxAliveBase + (this.wave - 1) * MINE.maxAlivePerWave;
    const mineEvery = Math.max(1400, MINE.spawnEveryMs + (this.wave - 1) * MINE.spawnEveryPerWaveMs);
    if (this.mineTimer <= 0 && this.mines.length < mineCap) { this.spawnMine(); this.mineTimer = mineEvery * rand(0.75, 1.25); }

    // Cores drift, lean toward the ship inside the magnet, and are harvested on touch.
    const magnet2 = this.run.magnetRadius * this.run.magnetRadius;
    for (const core of this.cores) {
      const d2 = dist2(core, ship);
      if (d2 < magnet2) {
        const d = Math.sqrt(d2) || 1;
        core.vx += ((ship.x - core.x) / d) * CORE.magnetSpeed * dt * 3.2;
        core.vy += ((ship.y - core.y) / d) * CORE.magnetSpeed * dt * 3.2;
      }
      core.x += core.vx * dt;
      core.y += core.vy * dt;
      core.vx *= 0.995; core.vy *= 0.995;
      core.pulse += dt * 4;
    }
    const touchCore = (SHIP.radius + CORE.radius) * (SHIP.radius + CORE.radius);
    this.cores = this.cores.filter((core) => {
      if (dist2(core, ship) > touchCore) return true;
      this.combo = now < this.comboUntil ? this.combo + 1 : 1;
      this.comboUntil = now + COMBO.windowMs;
      this.bestComboMult = Math.max(this.bestComboMult, this.comboMult);
      const value = Math.round(CORE.baseValue * this.run.coreValueMult * this.comboMult);
      this.score += value;
      this.harvestedThisWave += 1;
      this.sfx.collect(this.combo);
      this.burst(core.x, core.y, '#ffd94d', 12, 240);
      return false;
    });

    // Mines hunt slowly; a dash phases through them and breaks them, a plain touch costs hull.
    const mineSpeed = MINE.maxSpeedBase + (this.wave - 1) * MINE.maxSpeedPerWave;
    const touchMine = (SHIP.radius + MINE.radius) * (SHIP.radius + MINE.radius);
    const dashing = now < ship.dashUntil;
    for (const mine of this.mines) {
      const d = Math.hypot(ship.x - mine.x, ship.y - mine.y) || 1;
      mine.vx += ((ship.x - mine.x) / d) * MINE.seekAccel * dt;
      mine.vy += ((ship.y - mine.y) / d) * MINE.seekAccel * dt;
      const ms = Math.hypot(mine.vx, mine.vy);
      if (ms > mineSpeed) { mine.vx = (mine.vx / ms) * mineSpeed; mine.vy = (mine.vy / ms) * mineSpeed; }
      mine.x += mine.vx * dt;
      mine.y += mine.vy * dt;
      mine.spin += dt * 1.4;
      mine.pulse += dt * 3;
    }
    this.mines = this.mines.filter((mine) => {
      if (dist2(mine, ship) > touchMine) return true;
      if (dashing) {
        this.score += DASH.mineScore;
        this.sfx.explode();
        this.shake = Math.max(this.shake, 7);
        this.burst(mine.x, mine.y, '#ff3b6b', 22, 320);
        return false;
      }
      if (now < ship.invulnerableUntil) return true;
      ship.hull -= 1;
      ship.invulnerableUntil = now + this.run.invulnerableMs;
      this.combo = 0;
      this.sfx.hurt();
      this.shake = Math.max(this.shake, 11);
      this.flash = 1;
      this.burst(ship.x, ship.y, '#ff5470', 18, 280);
      return false;
    });

    this.particles = this.particles.filter((p) => now - p.born < p.life);
    this.shake *= 0.88;
    this.flash *= 0.9;

    if (ship.hull <= 0) return 'gameover';
    if (this.harvestedThisWave >= this.quota) return 'waveclear';
    return null;
  }

  /** Start the next wave: field swept, quota and pressure up. */
  nextWave() {
    this.wave += 1;
    this.harvestedThisWave = 0;
    this.cores = [];
    this.mines = [];
    this.coreTimer = 0;
    this.mineTimer = 1200;
  }
}
