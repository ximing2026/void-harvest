// Everything VOID HARVEST draws of the world itself: the starfield and grid the arena
// floats in, the ship with its engine trail, the cores, the mines and the bursts.
// Screens and the HUD live in ui.js; this file never draws text.

import { ARENA, SHIP, CORE, MINE, COLORS } from './config.js';

const STARS = Array.from({ length: 130 }, (_, i) => ({
  x: (i * 373.7) % ARENA.width,
  y: (i * 211.3) % ARENA.height,
  r: 0.6 + ((i * 29) % 10) / 6,
  depth: 0.25 + ((i * 13) % 10) / 14,
}));

export function drawBackground(ctx, ship, now) {
  ctx.fillStyle = COLORS.void;
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);

  // Grid, drifting a little against the ship for a sense of motion.
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  const ox = -(ship.x * 0.04) % 64, oy = -(ship.y * 0.04) % 64;
  ctx.beginPath();
  for (let x = ox; x < ARENA.width; x += 64) { ctx.moveTo(x, 0); ctx.lineTo(x, ARENA.height); }
  for (let y = oy; y < ARENA.height; y += 64) { ctx.moveTo(0, y); ctx.lineTo(ARENA.width, y); }
  ctx.stroke();

  for (const s of STARS) {
    const tw = 0.55 + 0.45 * Math.sin(now / 700 + s.x);
    ctx.globalAlpha = 0.28 + 0.5 * s.depth * tw;
    ctx.fillStyle = '#cfe6ff';
    ctx.beginPath();
    ctx.arc(s.x - ship.x * 0.03 * s.depth, s.y - ship.y * 0.03 * s.depth, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Arena frame.
  ctx.strokeStyle = 'rgba(124,92,255,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, ARENA.width - 12, ARENA.height - 12);
}

export function drawCores(ctx, world) {
  for (const core of world.cores) {
    const glow = 0.75 + 0.25 * Math.sin(core.pulse);
    const g = ctx.createRadialGradient(core.x, core.y, 1, core.x, core.y, CORE.radius * 2.6);
    g.addColorStop(0, 'rgba(255,217,77,0.85)');
    g.addColorStop(0.4, 'rgba(255,157,46,0.35)');
    g.addColorStop(1, 'rgba(255,157,46,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(core.x, core.y, CORE.radius * 2.6 * glow, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.core;
    ctx.beginPath();
    ctx.arc(core.x, core.y, CORE.radius * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff7d6';
    ctx.beginPath();
    ctx.arc(core.x - 2, core.y - 2, CORE.radius * 0.24, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawMines(ctx, world) {
  for (const mine of world.mines) {
    const spikes = 8;
    ctx.save();
    ctx.translate(mine.x, mine.y);
    ctx.rotate(mine.spin);
    ctx.fillStyle = COLORS.mineSpike;
    ctx.beginPath();
    for (let i = 0; i < spikes; i++) {
      const a = (i / spikes) * Math.PI * 2;
      const a2 = a + Math.PI / spikes;
      ctx.lineTo(Math.cos(a) * MINE.radius * 1.25, Math.sin(a) * MINE.radius * 1.25);
      ctx.lineTo(Math.cos(a2) * MINE.radius * 0.72, Math.sin(a2) * MINE.radius * 0.72);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = COLORS.mine;
    ctx.beginPath();
    ctx.arc(0, 0, MINE.radius * 0.78, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const pulse = 0.7 + 0.3 * Math.sin(mine.pulse);
    ctx.fillStyle = COLORS.mineHeart;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.arc(mine.x, mine.y, MINE.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export function drawShip(ctx, world, now) {
  const ship = world.ship;
  // Engine trail.
  for (const p of ship.trail) {
    const age = 1 - (now - p.at) / 220;
    ctx.globalAlpha = age * 0.3;
    ctx.fillStyle = COLORS.ship;
    ctx.beginPath();
    ctx.arc(p.x, p.y, SHIP.radius * 0.55 * age + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // A hit just taken leaves the ship blinking while it is untouchable.
  if (now < ship.invulnerableUntil && Math.floor(now / 90) % 2 === 0 && now >= ship.dashUntil) ctx.globalAlpha = 0.35;

  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  const dashing = now < ship.dashUntil;
  ctx.fillStyle = dashing ? '#b8fff3' : COLORS.ship;
  ctx.beginPath();
  ctx.moveTo(SHIP.radius * 1.35, 0);
  ctx.lineTo(-SHIP.radius * 0.9, SHIP.radius * 0.85);
  ctx.lineTo(-SHIP.radius * 0.45, 0);
  ctx.lineTo(-SHIP.radius * 0.9, -SHIP.radius * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.shipCore;
  ctx.beginPath();
  ctx.arc(SHIP.radius * 0.25, 0, SHIP.radius * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;

  // Magnet ring: the reach the player actually has, faint until a core is inside it.
  ctx.strokeStyle = 'rgba(87,247,224,0.10)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(ship.x, ship.y, world.run.magnetRadius, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawParticles(ctx, world, now) {
  for (const p of world.particles) {
    const age = 1 - (now - p.born) / p.life;
    ctx.globalAlpha = Math.max(0, age);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x + p.vx * ((now - p.born) / 1000), p.y + p.vy * ((now - p.born) / 1000), p.size * age + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawWorld(ctx, world, now) {
  ctx.save();
  if (world.shake > 0.3) {
    ctx.translate((Math.random() - 0.5) * world.shake, (Math.random() - 0.5) * world.shake);
  }
  drawBackground(ctx, world.ship, now);
  drawCores(ctx, world);
  drawMines(ctx, world);
  drawParticles(ctx, world, now);
  drawShip(ctx, world, now);
  ctx.restore();
  if (world.flash > 0.02) {
    ctx.fillStyle = `rgba(255,60,90,${(world.flash * 0.16).toFixed(3)})`;
    ctx.fillRect(0, 0, ARENA.width, ARENA.height);
  }
}
