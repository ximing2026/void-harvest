// The words of VOID HARVEST: the HUD the player reads while flying, and the three
// screens around the loop (title, the upgrade bay, game over). Pure canvas text, so a
// screenshot of the game shows the whole state of play at a glance.

import { ARENA, DASH, COLORS } from './config.js';

function text(ctx, str, x, y, size, color, align = 'left', weight = 600) {
  ctx.font = `${weight} ${size}px "Segoe UI", system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function panel(ctx, x, y, w, h, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();
}

export function drawHUD(ctx, world, now, muted) {
  const ship = world.ship;
  // Hull pips.
  text(ctx, 'HULL', 28, 30, 13, COLORS.dim);
  for (let i = 0; i < world.maxHull; i++) {
    ctx.fillStyle = i < world.hull ? COLORS.good : 'rgba(255,255,255,0.13)';
    ctx.beginPath();
    ctx.roundRect(76 + i * 26, 21, 20, 17, 4);
    ctx.fill();
  }
  // Score and combo.
  text(ctx, String(world.score), ARENA.width / 2, 32, 30, COLORS.text, 'center', 800);
  if (world.combo > 1 && now < world.comboUntil) {
    text(ctx, `COMBO ×${world.comboMult.toFixed(2).replace(/\.?0+$/, '')}`, ARENA.width / 2, 62, 15, COLORS.core, 'center', 700);
  }
  text(ctx, `WAVE ${world.wave}`, ARENA.width - 28, 30, 16, COLORS.text, 'right', 700);
  // Quota progress.
  const qw = 210;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.roundRect(ARENA.width - 28 - qw, 48, qw, 9, 4); ctx.fill();
  ctx.fillStyle = COLORS.core;
  ctx.beginPath(); ctx.roundRect(ARENA.width - 28 - qw, 48, qw * Math.min(1, world.harvestedThisWave / world.quota), 9, 4); ctx.fill();
  text(ctx, `harvest ${world.harvestedThisWave}/${world.quota}`, ARENA.width - 28, 70, 12, COLORS.dim, 'right');
  // Dash charge.
  const ready = now >= ship.dashReadyAt;
  const frac = ready ? 1 : 1 - (ship.dashReadyAt - now) / world.run.dashCooldownMs;
  text(ctx, 'DASH', 28, 62, 13, ready ? COLORS.ship : COLORS.dim);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.roundRect(76, 56, 90, 10, 4); ctx.fill();
  ctx.fillStyle = COLORS.ship;
  ctx.beginPath(); ctx.roundRect(76, 56, 90 * frac, 10, 4); ctx.fill();
  if (muted) text(ctx, 'MUTED (M)', ARENA.width - 28, ARENA.height - 24, 12, COLORS.dim, 'right');
}

export function drawTitle(ctx, best) {
  ctx.fillStyle = 'rgba(4,5,14,0.55)';
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);
  text(ctx, 'VOID HARVEST', ARENA.width / 2, 218, 84, COLORS.text, 'center', 800);
  text(ctx, 'The void is full of light. Bring it home before it brings you down.', ARENA.width / 2, 282, 21, COLORS.core, 'center', 500);
  panel(ctx, ARENA.width / 2 - 330, 330, 660, 176, 'rgba(13,17,34,0.92)', 'rgba(124,92,255,0.55)');
  text(ctx, 'FLY', 250, 362, 15, COLORS.ship, 'left', 800);
  text(ctx, 'WASD or arrow keys — your ship follows at once', 330, 362, 16, COLORS.text);
  text(ctx, 'HARVEST', 250, 398, 15, COLORS.core, 'left', 800);
  text(ctx, 'Fly into energy cores to score. Chain them for a combo.', 330, 398, 16, COLORS.text);
  text(ctx, 'DASH', 250, 434, 15, COLORS.ship, 'left', 800);
  text(ctx, 'SHIFT, SPACE or hold the mouse — phase through a mine to break it (+25).', 330, 434, 16, COLORS.text);
  text(ctx, 'SURVIVE', 250, 470, 15, COLORS.danger, 'left', 800);
  text(ctx, 'A mine that touches you costs 1 hull. Clear the wave quota to refit.', 330, 470, 16, COLORS.text);
  text(ctx, 'CLICK OR PRESS ENTER TO LAUNCH', ARENA.width / 2, 566, 22, COLORS.good, 'center', 800);
  if (best > 0) text(ctx, `best score ${best}`, ARENA.width / 2, 606, 15, COLORS.dim, 'center');
  text(ctx, 'M mutes · every sound is synthesised live, no audio files', ARENA.width / 2, ARENA.height - 30, 13, COLORS.dim, 'center');
}

export function drawUpgrade(ctx, world, offer, mouse) {
  ctx.fillStyle = 'rgba(4,5,14,0.72)';
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);
  text(ctx, `WAVE ${world.wave - 1} CLEARED`, ARENA.width / 2, 196, 40, COLORS.text, 'center', 800);
  text(ctx, `score ${world.score} — choose one refit to fly on`, ARENA.width / 2, 240, 18, COLORS.dim, 'center');
  const cards = upgradeCards();
  offer.forEach((u, i) => {
    const c = cards[i];
    const hover = mouse.x >= c.x && mouse.x <= c.x + c.w && mouse.y >= c.y && mouse.y <= c.y + c.h;
    panel(ctx, c.x, c.y, c.w, c.h, hover ? 'rgba(38,30,80,0.97)' : 'rgba(13,17,34,0.95)', hover ? COLORS.accent : 'rgba(124,92,255,0.4)');
    text(ctx, String(i + 1), c.x + 26, c.y + 30, 15, COLORS.accent, 'left', 800);
    text(ctx, u.name, c.x + c.w / 2, c.y + 62, 22, COLORS.text, 'center', 800);
    wrapText(ctx, u.blurb, c.x + c.w / 2, c.y + 104, c.w - 44, 16, COLORS.dim);
    text(ctx, 'click or press ' + (i + 1), c.x + c.w / 2, c.y + c.h - 24, 12, COLORS.dim, 'center');
  });
}

export function upgradeCards() {
  const w = 340, h = 196, gap = 26;
  const x0 = (ARENA.width - (w * 3 + gap * 2)) / 2;
  return [0, 1, 2].map((i) => ({ x: x0 + i * (w + gap), y: 300, w, h }));
}

function wrapText(ctx, str, x, y, maxWidth, size, color) {
  ctx.font = `500 ${size}px "Segoe UI", system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const words = str.split(' ');
  let line = '', ly = y;
  for (const word of words) {
    const trial = line ? line + ' ' + word : word;
    if (ctx.measureText(trial).width > maxWidth && line) {
      ctx.fillText(line, x, ly);
      line = word;
      ly += size + 6;
    } else line = trial;
  }
  if (line) ctx.fillText(line, x, ly);
}

export function drawGameOver(ctx, world, best, isBest) {
  ctx.fillStyle = 'rgba(10,3,10,0.68)';
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);
  text(ctx, 'THE VOID KEEPS YOU', ARENA.width / 2, 262, 54, COLORS.danger, 'center', 800);
  text(ctx, `final score ${world.score}`, ARENA.width / 2, 336, 30, COLORS.text, 'center', 800);
  text(ctx, `you reached wave ${world.wave} with a best combo of ×${world.bestComboMult.toFixed(2).replace(/\.?0+$/, '')}`, ARENA.width / 2, 380, 17, COLORS.dim, 'center');
  if (isBest) text(ctx, 'NEW BEST SCORE', ARENA.width / 2, 416, 17, COLORS.core, 'center', 800);
  else text(ctx, `best score ${best}`, ARENA.width / 2, 416, 17, COLORS.dim, 'center');
  text(ctx, 'PRESS R OR CLICK TO FLY AGAIN', ARENA.width / 2, 486, 21, COLORS.good, 'center', 800);
}
