// The upgrade bay: between waves the player picks one of three refits. Each refit is a
// small, permanent change to the run's numbers, so the choice shapes how later waves
// play: safety (hull), greed (core value), speed (thrusters) or control (magnet, dash).
// A refit's apply() receives the whole world, so it can touch the ship as well as the run.

export const UPGRADES = [
  {
    id: 'hull',
    name: 'Reinforced Hull',
    blurb: '+1 max hull and repair 1. Survive one more mistake.',
    apply(world) { world.run.maxHull += 1; world.ship.hull = Math.min(world.run.maxHull, world.ship.hull + 1); },
  },
  {
    id: 'magnet',
    name: 'Tractor Magnet',
    blurb: 'Cores are pulled to you from 45% farther away.',
    apply(world) { world.run.magnetRadius *= 1.45; },
  },
  {
    id: 'capacitors',
    name: 'Phase Capacitors',
    blurb: 'Dash recharges 30% faster. Phase through mines more often.',
    apply(world) { world.run.dashCooldownMs *= 0.7; },
  },
  {
    id: 'refinery',
    name: 'Core Refinery',
    blurb: 'Every core is worth 50% more score.',
    apply(world) { world.run.coreValueMult *= 1.5; },
  },
  {
    id: 'thrusters',
    name: 'Ion Thrusters',
    blurb: 'Fly 14% faster. Outrun what hunts you.',
    apply(world) { world.run.speedMult *= 1.14; },
  },
  {
    id: 'plating',
    name: 'Ablative Plating',
    blurb: 'After a hit you are untouchable 60% longer.',
    apply(world) { world.run.invulnerableMs *= 1.6; },
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
