# Architecture: the run config in, the payout out

The whole meta hangs on one split. The sim never reads the profile; it reads a **run config** the
profile made. The profile never reads the sim mid-run; it reads a **finished run**.

```
profile ──runConfig(profile, seed)──▶ run config ──▶ createRun(seed, { run }) ──▶ play ──▶ finished run
   ▲                                                                                        │
   └──────────────── advance(profile, run, payout(profile, run)) ◀──────────────────────────┘
```

## The run config

One plain object, a pure function of (profile, seed). Everything the meta can change in a run goes
through it, and nothing else does:

- `pool`: which units and powerups this run's shop can draw from (the unlocked set, then the luck
  tier's draw of it; the two counters that answer the pack wipe are always in).
- `startMoney`, `cityHp` (the run's hit points), `swarm` (drones per pad, 0-5), `mods` (any
  multipliers the tree owns), `laser` (the weapon's radius and damage).
- `shop`: base and powerup slot counts, rarity odds, the luck price factor, rerolls, the pity
  threshold.
- `fixedShops`: run 1's shops with their own prices, or null.
- `prewave`: whether a shop opens before wave 1.
- `fate`, `tier`, `fated`: the luck roll and whether it exists yet.
- `omens`: the gamble waves and the bag mix by tier, or null.
- `win`: the wave that ends the run as a win (0 = endless, for tools).
- `threat`: the level past the win.
- `start`: the unit already standing.

`fullRun()` returns the shipped game (everything unlocked, shipped numbers) so the title demo, the
bots and the old tests need no profile.

## The sim reads it in a few places

- `createRun`: money, city HP, the weapon, the gamble bag, the threat's rocket multiplier.
- `launcherStats(L, s)`: swarm and mods (`cap = max(1, ceil(shipped × (1 + swarm) / 6))`, so every
  type grows in step and rank 5 restores the shipped count), plus the gamble mods.
- `shopFor(s, wave, roll)`: slots, tier odds with pity, the luck price factor, the fixed early
  shops, the counter guarantee before a debut, at most one duplicate of a unit already standing.
- `startWave` / `startBreather` / the win check: the gamble stage, `closeWave` bookkeeping (clean
  waves, laser waves, curses cleared), the named win.
- Mods: `s.mods = [{ key, k, until }]`, `modK(s, key)` multiplies (rate, reach, cooldown, rocket
  speed and count, wave bonus, city income) or sums (charges, cap penalty, laser off, kill pay).
  Kill-pay bonuses add and cap at ×4; cooldown bonuses never pass ×0.5.

## Everything the player chooses is an input

`{k:"buy"}`, `{k:"done"}`, `{k:"reroll"}`, `{k:"omen", i}`, `{k:"pass"}`, `{k:"strike", x, y}`,
`{k:"end"}`. The log is `[[tick, input], ...]`. A save is `{ sim: SIM_VERSION, seed, cfg, log,
tick }`; a resume replays the log with the saved config and steps a breather up to the saved tick.
`replay` counts inputs the sim refused; a resume with any refused input, or from another
`SIM_VERSION`, is dropped.

Random draws come from named streams keyed by things in the log: `stream(seed, "shop", wave,
roll)`, `stream(seed, "omen", wave, pairIndex)`, `stream(seed, "wave", n)`. Never `Math.random`,
never `Date`, never `**` (it is `Math.pow` in disguise; a test greps for it), never iteration over a
Set or object whose order could differ.

## The profile

```
{ v, runs, deaths, best, reachedBest, cleared: {wave|threat:wave → n}, reached, bought, seen,
  consoled, w, lifetimeW, fragments, tree: {node → rank}, unlocked: [card ids], blueprints,
  wins, threat, fates: [last five rolls], paid: [last fifty seeds], lifetime: {kills, strikes, ...} }
```

`loadProfile(saved)` migrates by version. The client stores it in localStorage and saves after
every change.

## payout(profile, run) → { lines, total, qualifies }

Every line has a name, a value and a category, so the client can fold them. A run ended by hand
or a seed already paid returns zero. Hardship (luck) and Threat multiply the frontier lines only.
`qualifies` says whether this death counts toward Rank: the cities fell, and the run reached the
wave its death number asks for (death N needs wave min(N, 3)).

## advance(profile, run, payout) → opened cards

Applies the payout, moves every counter, marks the seed paid, ticks deaths and fragments when the
death qualifies, and walks the ladder handing out every card whose trigger is now met. Returns the
cards it opened, in order, for the reveal sequence.

## The luck roll

`rollFate(profile)` is keyed to counters a surrender cannot move (deaths, wins, lifetime currency,
best, fragments), not to the run's seed, so ending a run early and launching again rolls the same
luck. Two dice (`floor((u1 + u2) × 50)`) make the middle common and the ends rare; a dice-weight
node nudges it; two bad rolls make the next the better of two.
