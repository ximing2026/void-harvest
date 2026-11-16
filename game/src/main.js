// VOID HARVEST, the run itself: a small state machine over the world simulation.
// title -> playing -> upgrade (between waves) -> playing -> gameover -> title again.
// This file wires input, sound, simulation and drawing together and owns the clock.

import { ARENA } from './config.js';
import { Input } from './input.js';
import { SoundFX } from './audio.js';
import { World } from './world.js';
import { drawWorld } from './render.js';
import { drawHUD, drawTitle, drawUpgrade, drawGameOver, upgradeCards } from './ui.js';
import { offerThree } from './upgrades.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = ARENA.width;
canvas.height = ARENA.height;

const input = new Input(canvas);
const sfx = new SoundFX();
const world = new World(sfx);

let state = 'title';
let offer = [];
let best = 0;
try { best = Number(localStorage.getItem('void-harvest-best') || 0) || 0; } catch { best = 0; }
let isBest = false;

function saveBest() {
  if (world.score > best) {
    best = world.score;
    isBest = true;
    try { localStorage.setItem('void-harvest-best', String(best)); } catch { /* private mode: the run still counts */ }
  }
}

function launch() {
  world.reset();
  isBest = false;
  state = 'playing';
  sfx.unlock();
  sfx.launch();
  sfx.startMusic();
}

function toGameOver() {
  state = 'gameover';
  saveBest();
  sfx.gameOver();
  sfx.stopMusic();
}

function toUpgrade() {
  world.nextWave();
  offer = offerThree(Math.random);
  state = 'upgrade';
  sfx.upgrade();
}

function pickUpgrade(index) {
  if (index < 0 || index >= offer.length) return;
  offer[index].apply(world);
  state = 'playing';
  sfx.launch();
}

let last = performance.now();

// A small handle for automated playtests and screenshot runs: it changes nothing about
// the game, it only lets a test driver see the state it is in and steer by the same
// keyboard events a player sends.
window.__voidHarvest = { world, get state() { return state; } };

function frame(now) {
  const dtMs = now - last;
  last = now;

  if (input.tapped('m')) {
    sfx.unlock();
    sfx.toggleMute();
    if (!sfx.muted && state === 'playing') sfx.startMusic();
  }

  if (state === 'title') {
    drawWorld(ctx, world, now);
    drawTitle(ctx, best);
    if (input.tapped('enter') || input.clicked()) launch();
  } else if (state === 'playing') {
    const event = world.update(dtMs, now, input);
    drawWorld(ctx, world, now);
    drawHUD(ctx, world, now, sfx.muted);
    if (event === 'gameover') toGameOver();
    else if (event === 'waveclear') toUpgrade();
  } else if (state === 'upgrade') {
    drawWorld(ctx, world, now);
    drawUpgrade(ctx, world, offer, input.mouse);
    if (input.clicked()) {
      const cards = upgradeCards();
      const hit = cards.findIndex((c) => input.mouse.x >= c.x && input.mouse.x <= c.x + c.w && input.mouse.y >= c.y && input.mouse.y <= c.y + c.h);
      if (hit >= 0) pickUpgrade(hit);
    }
    for (const n of ['1', '2', '3']) if (input.tapped(n)) pickUpgrade(Number(n) - 1);
  } else if (state === 'gameover') {
    drawWorld(ctx, world, now);
    drawGameOver(ctx, world, best, isBest);
    if (input.tapped('r') || input.tapped('enter') || input.clicked()) launch();
  }

  input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
