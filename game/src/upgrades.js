// The upgrade bay: between waves the player picks one of three refits. Each refit is a
// small, permanent change to the run's numbers, so the choice shapes how later waves
// play: safety (hull), greed (core value), speed (thrusters) or control (magnet, dash).

export const UPGRADES = [
  {
    id: 'hull',
    name: 'Reinforced Hull',
    blurb: '+1 max hull and repair 1. Survive one more mistake.',
    apply(run) { run.maxHull += 1; run.hull = Math.min(run.maxHull, run.hull + 1); },
  },
  {
    id: 'magnet',
    name: 'Tractor Magnet',
    blurb: 'Cores are pulled to you from 45% farther away.',
    apply(run) { run.magnetRadius *= 1.45; },
  },
  {
    id: 'capacitors',
    name: 'Phase Capacitors',
    blurb: 'Dash recharges 30% faster. Phase through mines more often.',
    apply(run) { run.dashCooldownMs *= 0.7; },
  },
  {
    id: 'refinery',
    name: 'Core Refinery',
    blurb: 'Every core is worth 50% more score.',
    apply(run) { run.coreValueMult *= 1.5; },
  },
  {
    id: 'thrusters',
    name: 'Ion Thrusters',
    blurb: 'Fly 14% faster. Outrun what hunts you.',
    apply(run) { run.speedMult *= 1.14; },
  },
  {
    id: 'plating',
    name: 'Ablative Plating',
    blurb: 'After a hit you are untouchable 60% longer.',
    apply(run) { run.invulnerableMs *= 1.6; },
  },
];

/** Three distinct refits offered after a wave, drawn from the pool without repeats. */
export function offerThree(rng) {
  const pool = UPGRADES.slice();
  const offer = [];
  for (let i = 0; i < 3; i++) {
    offer.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return offer;
}
