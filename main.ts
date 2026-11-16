// VOID HARVEST's hand-in program (Node 22, standard library only). The game is the game/
// folder beside this file: plain static files a desktop browser plays offline. This
// program copies game/ and screenshots/ to the output directory and writes
// dossier.json last, with the kit's buildDossier, so the dossier the judge reads is
// rebuilt from exactly the files handed in. Outside the grader, MAKEFUN_OUTPUT_DIR
// stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const IMAGE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.(png|jpe?g)$/i;

function fail(message: string): never {
  throw new Error(`void harvest: ${message}`);
}

mkdirSync(out, { recursive: true });

// The game itself, byte for byte as it sits in the repository.
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
if (!existsSync(join(out, 'game', 'index.html'))) fail('game/index.html is missing: the game cannot open');

// The screenshots: 3 or 4 real renders, each within the scorer's size cap, so what the
// judge sees is the game at its best and nothing the scorer would refuse.
const shotDir = join(here, 'screenshots');
if (!existsSync(shotDir)) fail('screenshots/ is missing: hand in 3 or 4 screenshots of the game');
const shots = readdirSync(shotDir).filter((n) => !n.startsWith('.')).sort();
if (shots.length < 3 || shots.length > 4) fail(`screenshots/ holds ${shots.length} images: hand in 3 or 4`);
for (const name of shots) {
  if (!IMAGE_NAME.test(name)) fail(`screenshot name ${name} is not a plain image file name`);
  const size = statSync(join(shotDir, name)).size;
  if (size > 262144) fail(`screenshot ${name} is ${size} bytes: the cap is 262144`);
}
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotDir, join(out, 'screenshots'), { recursive: true });

// The dossier, written last, from the output as it now stands.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`void harvest: wrote game/, screenshots/ (${shots.length} images) and dossier.json under ${out}`);
