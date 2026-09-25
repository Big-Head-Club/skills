# Numbers: set by bots, not by hand

Every number below was first a guess in the spec, then moved by a bot until the cadence held. Do
the same: never tune by reasoning alone, run the career bot after every change, and write the
measured result next to the number in the code comment.

## The cadence test

Pool three casual bots (first-pick buys with no weapon use, first-pick with a lazy weapon, random
buys with a lazy weapon), 50-150 seeds each, on a fresh profile. Report the share that cleared
waves 2, 3 and 4. Drone Command's target from the bible "die on wave 2 or 3": wave 2 cleared
55-80%, wave 3 20-50%, wave 4 under 45%. Then a career bot: N runs on one profile, currency spent
by a policy (save for the big node first). Report the median waves cleared per run number; the
bible's shape was 2-3, 2-3, 2-4, 3-4, then longer.

What moved the cadence, in order of effect:
1. **Drones per pad.** One drone on the starting pad (not one pad of six). Six drones cleared wave
   3 at 93% with no weapon and first-pick buys.
2. **The wave a spare city arrives.** A new city is spare hit points; the wave after it is
   death-free. Move the second city to the wave after the target death wave.
3. **Start money and the first shop's prices.** A bought drone before wave 2 made wave 3 easy at
   any price under 230. The bank after wave 1 (start + wave bonus + city income + kills) sets the
   band; put one affordable non-power item in it and the power items just above.
4. **Chain blasts.** Rescaled damage must keep chains killing neighbours, or the calibration is
   against a game that no longer exists.
5. **The first felt tree node.** If it arrives on run 2 (cheap, or the first payout is big), strong
   players jump three waves. Price it for run 3-4 of a hoarder.
6. **Pre-wave money.** The pre-wave shop card comes with enough for a switch (a behaviour toggle),
   not a unit. War chest adds +20 a rank so a unit before wave 1 needs four ranks.

## Pacing rules that held (2026-09-25)

- One ladder step per death; at most two wave steps per run, the rest held. Ladder to death 23.
- A fragment every second counted death and every 750 kills; a Blueprint costs 3 + the number
  already bought; a citation's item costs double; fragments become 10 Wreckage each only when
  nothing is left to open.
- Citations: five tiers (×2 to ×2.5 apart); level 1 opens the item, later levels pay 20 × level.
  Mastery per unit type at 100 / 300 / 800 / 2,000 / 5,000 lifetime kills, 15 × level each.
  Rank past the ladder: a level every second death, a fragment each.
- No cap: bosses every fifth wave cycling three types, HP ×1.5 each cycle; cities to wave 19; a
  first clear past wave 15 grows by one a wave.
- Sinks a maxed profile still wants: Garrison 600 (a second pad from the start), Overwatch 500 /
  900 (laser charges), Armoury 200 / 400 / 800 (a starting powerup by tier), Provisions 150-560
  (+10 city income a rank), Reserve (+15 wave bonus, ×1.4 a rank, 20 ranks), Stake (+40 start
  money, ×1.35 a rank, 30 ranks). A strong career buying everything earned 4,600 over 14 runs and
  ended with 21 in hand.
- Laser recharge is a family the owner wants more of: Quicker strike, Capacitor (common, in the
  starting pool), Hot swap, Overcharge, Afterburner, all rolling at 1.6× weight, recharge floor 35%.

## Drone Command's numbers (v1, 2026-09-24), as a starting point

**First run.** One city (3 HP), one Hornet pad holding one drone, 50 money, Sidearm laser (radius
10, damage 2, 6 s cooldown, 1 charge). Wave 1 is 9 rockets; the ramp from wave 2 is the shipped
one (14/17/21 over 18-20 s). Second city before wave 4, then 7 and 11. Rockets 2 HP (brute 6),
Hornet shot 1.25 (two hits; one Heavier shots makes it one). Fixed shops: Hornet 245 / +1 drone
230 / Faster drones 190, then 250 / 200 / 240, then 275 / 150 / 260. Base prices climb 25% per
copy standing; powerups 50% per copy bought. The strike recharges only during a wave (idling in the
shop earned charges). Clearing wave 15 wins.

**Currency (Wreckage).** Cleared wave 1: 3. First clear of wave n: 6 + 2n. A wave cleared before:
max(1, floor(0.2 × (6 + 2n))), doubled within two of the best. Reached a new wave: 5. First
purchase of an item: 1. First sighting of a rocket type: 2. Clean wave and laser wave (5+ strike
kills): 1 each, only within two of the best. A curse taken and its wave cleared: 4 (6 with a node),
max 3 a run. The win: 40. Dying at your best wave: 5, once per value. Luck: ×1.25 under 35, ×1.5
under 15, on the frontier lines only. Threat: +25% per level on the frontier lines. Every 500
lifetime kills: a fragment. First clears are per Threat level. A surrender pays nothing.

Measured: run 1 pays ~35 W for a death on wave 3, ~65 for wave 5; later runs 15-50 W; a run that
opens a Threat level pays 250-560.

**Ladder.** Death 1: pre-wave shop, Omens, Fate, Kite. Death 2: shop 2+2, Hangar, Faster launch,
Heavier shots, Split targets, laser 12, uncommon tier, Reroll. Death 3: Warden, Quicker strike,
Blast-hardened, shop 3+2. Death 4: Picket, Second charge, shop 3+3. Death 5: Weaver. Death 8:
Plating. Wave 3: Mint, Bigger strike. Wave 4: laser 15. Wave 5: Ram, rare tier. Wave 7: laser
damage 4. Wave 8: Flak. The win: Threat. A death counts if the run reached wave min(N, 3).

**Tree.** Swarm 80/120/180/260/360 (the felt step). War chest +20 a rank, 20/30/45/60. Extra
reroll 30/50/80. Dice weight 15/20/25/30/40. Sharp pity 35. Curse eater 35. Nothing else.

**Luck.** Tiers Forsaken 0-14, Cursed 15-34, Unsteady 35-59, Favored 60-84, Touched 85-100 (4.5 /
20 / 43.5 / 27.5 / 4.5%). Pool draw sizes by tier 4+7 / 4+8 / 5+9 / 5+9 / 6+10; Touched always
holds a multiplier. Rare odds +(fate − 50)/8 pp. Prices ×(1.15 − 0.3 × fate/100). Gamble bag
curse/mixed/bless 6/4/2, 5/4/3, 4/5/3, 2/5/5, 1/4/7. The fight: Touched +1 drone per pad, +80
money, laser +1; Favored +40; Cursed −20; Forsaken −40 and laser −2. Pity: after 4 shop rolls
without the top tier, +4 pp per miss, cap +20.

**Gambles (Omens).** After waves 1, 3, 6, 9 and 12. Pass pays 60. Blessings: Tailwind (pads
launch 15% sooner all run), Windfall (+200), Open Sky (every base type in the next shop), Second
Wind (+1 charge for 3 waves). Mixed: Overclock (30% sooner; big pads lose a drone), Clear Skies
(laser 40% sooner; rockets 10% faster), Black Market (best tier guaranteed; prices +25%), War
Bonds (+400; city income halved 3 waves). Curses, a debt then momentum: Dust (reach ×0.8 one wave,
then ×1.15 for 3), Jammed Sky (no laser one wave; then, if clean, cooldown ×0.75 for 3), Salvo
Warning (30% more rockets; kills pay double), Levy (no wave bonus; then ×1.5 for 3).

**Shop by rank.** Run 1 fixed 1+2; then 1+2, 2+2, 3+2, 3+3. Powerup odds common/uncommon/rare
100 → 85/15 → 72/22/6. Base slots never roll a tier. Before needle, splitter and brute debut, the
shop before guarantees a counter from {Faster drones, Lowest first}, {Split targets, Spread out,
Flak}, {Heavier shots, Kite, Ram}. A shop that opened with nothing affordable and closed with
nothing bought pays 100, once a run.
