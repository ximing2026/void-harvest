# void-harvest

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/ximing2026/void-harvest/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/ximing2026/void-harvest/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

VOID HARVEST is a small arcade game that runs entirely in a desktop browser from the static files in `game/` — no build step, no libraries, no network. You pilot the last harvester over a collapsing void: fly into drifting energy cores to score and chain combos, and beware the void mines that hunt you. Touching one costs hull, but a phase dash (Shift, Space, or hold the mouse) passes straight through a mine and breaks it for bonus points. Clear each wave's harvest quota to reach the refit bay and choose one of three permanent upgrades — more hull, a stronger tractor magnet, faster dash recharge, richer cores, hotter thrusters, thicker plating — while every wave hunts harder than the last. Every sound, from the harvest chime to the bass pulse under play, is synthesised live with WebAudio; the game ships no audio files at all.

## Run it

```sh
node serve.ts
```

then open http://localhost:8080 — or serve the `game/` folder with any static file server and open its `index.html`. To hand the entry in the way the grader does, run `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`, which copies `game/` and `screenshots/` to `out/` and writes its `dossier.json`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=sz0e39g7&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
