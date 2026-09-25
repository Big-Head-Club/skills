# Drone Command: the roguelite (design spec, v1)

Daniel's bible (2026-09-24): a Hades/Balatro-style roguelite. No daily, no multiplayer. Every run pays
into meta progression. Unlocks on every facet, in a run and across runs. Start with one base, one Hornet,
a smaller weaker laser at the same cadence. Momentum comes from grinding within a run. Random reward
variance is extreme: some runs are cursed, some touched by god. The core mechanic and the look stay.
Death cadence: run 1 dies on wave 2-3, run 2 on 2-3, run 3 on 2-4, run 4 on 3-4, then runs lengthen.

How this spec was made: 90 sourced claims about Hades and Balatro, each checked by two refuters
(`why-hades-and-balatro-are-addictive.md`); four independent designs (three angles plus one from Codex),
a three-judge panel, a synthesis, then five adversarial refuters and a Codex audit of the arithmetic.
Every fatal and serious hole they found is fixed below. The numbers marked *tune* are set by bots, not
by hand: the acceptance tests in section 11 decide them.

## 0. As built (2026-09-24), where the build differs from the sections below

Two reviews (Codex on the spec, then a 98-agent gauntlet plus Codex on the client) and the bot careers
changed these numbers. The code is the truth; this list says where and why.

- **Start money 50, not 180.** With the chain blasts and one drone, 180 let a first-pick bot clear
  wave 3 at 65%; 50 puts it at 25-35%. The pre-wave card (death 1) comes with 160. War chest is
  +20 a rank. Run 1's fixed shops carry their own prices: Hornet 245 / +1 drone 230 / Faster drones
  190, then 250 / 200 / 240, then 275 / 150 / 260, so after wave 1 (bank 196-223) the choice is
  Faster drones now or a drone next shop.
- **The win is wave 15**, so three Brute waves are the finale. Cities arrive before 4, 7 and 11.
- **Swarm** is the felt vertical: every type grows in step (`ceil(cap × (1 + swarm) / 6)`), 80/120/
  180/260/360 W. The +2% nodes, Fate lens and Scrapyard are cut: nothing a player could feel, and
  they drained what Swarm needs. Left: War chest, Extra reroll, Dice weight, Sharp pity, Curse eater.
- **A surrendered run pays nothing** and moves nothing (no death, no fragment, no Fate streak);
  closing the tab keeps the run. A death counts toward Rank only if the run reached wave
  min(N, 3). Fate is rolled from the profile's counters, not the seed, so ending early re-rolls
  nothing. A seed is paid once.
- **Hardship and Threat pay on the frontier lines only** (first clears, reaching further, the win):
  ×1.25 under Fate 35, ×1.5 under 15, +25% per Threat level. First clears are per Threat level, so a
  won profile keeps finding them. Every 500 lifetime kills pays a fragment; with nothing left to
  open, three fragments are 30 W.
- **Fate touches the fight:** Touched flies one more drone per pad, starts +80 with a wider laser;
  Favored +40; Cursed −20; Forsaken −40 with a narrower laser. Rockets never change.
- **Ladder:** death 1 = pre-wave shop, Omens, Fate, Kite; death 2 = shop 2+2, Hangar, Faster
  launch, Heavier shots, Split targets, laser 12, uncommon, Reroll; death 3 = Warden, Quicker
  strike, Blast-hardened, shop 3+2; death 4 = Picket, Second charge, shop 3+3; death 5 = Weaver;
  death 8 = Plating; wave 3 = Mint, Bigger strike; wave 4 = laser 15; wave 5 = Ram, rare tier;
  wave 7 = laser damage 4; wave 8 = Flak; the win = Threat. Cut from v1: Manifest, Wager and Dare,
  Loadouts, Tempt Fate, Pass and Tags, Mastery deeds and their items, mythic, skins.
- **Omens:** pass pays 60. Open Sky and Black Market only enter a bag that can use them (three base
  types; a tier above common). Overclock takes its drone from the type's base count, not a bought
  one. Salvo Warning pays double. Second Wind never passes three charges.
- Rockets have 2 HP, a Hornet shot is 1.25 (one Heavier shots makes it one hit), the strike
  recharges only during a wave, base prices climb 25% per copy standing, the Mint is 650 for 90 a
  wave.

## 1. The first run

**Starting kit.** One city (3 HP), one Hornet pad beside it holding **one drone** (the bible: "one
hornet drone above it"), **180 money**, and the **Sidearm** laser: radius 10, damage 2, the same 6 s
cooldown, 1 charge. (The shipped 15/3 laser is the Command laser; the ladder gives it back.) Run 1's
Fate is fixed at 50 and hidden; no Omens; no rarity above common.

**Swarm.** Every pad's drone count is `max(1, shipped cap - 5 + swarm)`; `swarm` is a profile stat,
0 in run 1 and raised by the tree (section 4), so a Hornet holds 1, 2, 3 ... 6 drones as the profile
grows and the shipped game is the ceiling, not the floor. Bots showed why: a six-drone Hornet clears
wave 3 at 93% with first-pick buys and no laser, and one drone lands on the bible's cadence.

**Run 1's shops are fixed, not rolled**, so a first-timer is never handed a shop with no damage:
shop 1 (after wave 1): Hornet 220, +1 drone 240, Faster drones 220; shop 2: Hornet, Spread out, Longer
reach; shop 3: Hornet, Lowest first, Longer reach. With 180 + wave 1's ~170 = ~350, the first shop buys
one thing. That is the point: wave 2 outruns the kit unless the laser is aimed at salvos.

**Waves.** Wave 1 is 9 rockets (`WAVES.count(1)` is 9; the ramp from wave 2 on is as shipped: 14/17/21
over 18-20 s), the shipped rocket schedule (dart, zigzag, decoy from wave 1; lob 4; needle 7; splitter
10; brute 13), and the **second city arrives before wave 4**, not 3 (`newCityWaves [4, 7, 11, 15]`):
with it at 3, wave 3 was death-free for every bot because the new city is 3 spare HP. Measured with
the run-1 kit over 150 seeds: a first-pick bot that never fires the laser clears wave 2 at 56% and
wave 3 at 25%; one that fires it lazily 79% and 50%; random buys with a lazy laser 69% and 36%; a
smart bot with good laser aim reaches wave 5-7. The acceptance test (section 11) holds the casual
mix at wave 2 cleared 55-80%, wave 3 20-50%, wave 4 under 45%.

**Rockets have 2 HP**, and every drone shot and blast doubles, so damage steps are real (a Hornet's
0.5 shot becomes 1.0: two hits to kill; Heavier shots makes it 1.6: still two; two copies 2.56: one).
Brute 6 HP. This is a pure rescale: nothing else in the sim changes.

**At death.** A cause line built from every leak, not just the last: "Wave 2 took 2 HP: your laser hit
rockets one at a time. Wave 3 took the last." Then the post-death screen (section 9).

## 2. Meta currency: Wreckage (W)

Paid at run end. Frontier-weighted so pushing beats farming; a cursed run pays more.

| Line | W |
|---|---|
| Participation: cleared wave 1 (a suicide run pays nothing) | 3 |
| First-ever clear of wave n | 6 + 2n |
| Clear of a wave already cleared | 20% of that, rounded |
| First time reaching wave n | 5 |
| First-ever purchase of an item (fills a "?") | 1 |
| First sighting of a rocket type | 2 |
| Clean wave (no city hit), only within 2 of best wave | 1 |
| Laser wave (strike killed 5+), only within 2 of best wave | 1 |
| Curse taken and its next wave cleared (any wave; forced cards don't pay) | 4 (max 3 per run) |
| Fate multiplier, on the ROLLED Fate, never a Dared one | x1.25 below 35, x1.5 below 15 |
| The win (clear wave 12) | 40, and the run ends |

No floor line. Consolation is paid once per best-wave value: the first time you die at your best wave N
pays 5, never again for that N. Abandon = surrender: it counts as a death at the current wave, pays every
banked line and the Fate multiplier, and ticks Rank. Closing the tab keeps the run (the existing
resume). All W rounding is floor.

Farm check (bots): a wave 1-3 farm with best 6 pays 3 + 2 + 2 + 2 = 9 W in ~70 s (7.7 W/min); a frontier
push from best 5 that clears 1-5 and dies in 6 pays ~40 W in ~3.6 min (11 W/min). The test requires
the push to pay at least 1.4x the farm per minute, and any farm loop found to pay more is a failing test.

## 3. The unlock ladder (three tracks, every run moves at least one)

**Rank**: guaranteed cards by qualifying death count. A death qualifies only if the run cleared wave 1,
and death N only if the run reached wave min(N, 3). **Blueprints**: the Hangar; every unlocked item not
yet bought shows as a "?"; 3 fragments buy any locked Blueprint item (never a Rank card). Every
qualifying death pays 1 fragment; a rolled Forsaken death pays 2. **Mastery**: eight deeds with live
counters, plus lifetime counters (every 500 kills: a fragment).

| Trigger | Guaranteed |
|---|---|
| Death 1 | **Pre-wave shop** (run 2's first act is spending 180 before wave 1); **Omens** and the **Fate dial** (Fate now means something); shop 2 bases + 2 powerups (base slots draw from the unlocked base set, tier odds apply to powerup slots only) |
| Death 2 | **Kite**; the **Hangar**; Faster launch, Heavier shots, Split targets; Sidearm radius 10→12; uncommon tier; **Reroll** (1 free per shop, then 60/100/140, 3 per shop; one reroll = one pity miss) |
| Death 3 | **Warden**; **Manifest** (pre-run: +60 money, or name one unlocked common/uncommon the first shop must hold); Quicker strike, Blast-hardened; shop 3+2 |
| Death 4 | **Picket**; **Wager** (once per run: reroll Fate for 25% of your W, min 10; the reroll caps at 84 and counts in the streak) or **Dare** (Fate −20 for +15% W, no fragment, no hardship multiplier); rare tier; shop 3+3 |
| Death 5 | **Weaver**; **Loadouts** (start with any unlocked COMMON base) |
| Death 7 | **Tempt Fate** (replaces the pick: a third card you must take; never two curses; 2x per run) |
| Death 10 | **Pass** (skip a shop for a Tag) |
| Death 14 | Plating (+1 start city HP, the only permanent forgiveness) |
| Wave 3 first clear | **Mint**; Bigger strike; Afterburner |
| Wave 4 first clear | Laser radius 12→15 (the Command laser) |
| Wave 5 first clear | **Ram**; Second charge; Beacon |
| Wave 7 first clear | Laser damage 2→3 (five waves before brutes) |
| Wave 8 first clear | Flak; mythic tier |
| Wave 12 first clear | **The win**: the run ends, 40 W, **Threat 1** opens |

After death 5 the Rank bar counts first clears too, so it always names the next card. The two rocket
debuts ahead show on the breather HUD.

**Mastery deeds** (each shows its condition and counter): clear wave 4 with only Hornet pads → Queen
Hornet; lose 5 qualifying runs → Dead Man's Switch; fire the laser 150 times lifetime → Prism; own 3
Mints in one run → Ledger; 3 untouched waves in a row → Bounty Board; 40 strike kills in one run →
Chain Reactor; a Warden's city untouched 5 waves in one run → Warden's Oath; reach wave 8 with 2 pad
types or fewer → Twin Pad.

## 4. The permanent tree (the Firmware Grid)

Vertical nodes are bought with W but **equipped** into a 20-point grid; a preset may not exceed 20
points. Buying everything is a collection goal; wearing everything is impossible. Bot test: the
strongest preset improves the smart bot's median wave by at most 25% over a bare profile.

| Node | Per rank | Ranks | Points each | Costs (W) |
|---|---|---|---|---|
| Sharpened shots (drone `shot`) | +2% | 5 | 2 | 8/12/18/26/36 |
| Quick pads (`rate`) | +2% | 4 | 2 | 10/16/24/34 |
| Salvage (kill and wave money, never city income) | +2% | 4 | 2 | 12/20/30/44 |
| War chest (start money) | +90 first rank, +10 after | 4 | 3 | 20/10/16/24 |
| **Swarm** (drones per pad, every type) | +1 | 5 | 0 (not on the grid; it restores the shipped game) | 15/30/50/80/120 |
| Faster reload (drone `reload` −2%) | −2% | 4 | 2 | 10/16/24/34 |

Horizontal nodes, not on the grid (14): Reroll +1 (3 ranks 15/30/50); Fate Lens, see the first Omen
pair before launch (25); Sharp pity, 4→3 misses (35); Suppress, blacklist 2 items, never split/reach
(30), Suppress II 3 items (50); Loadout+, also a starting common powerup (20); Wager Ledger, Tempt Fate
3x (40); Curse Eater, curse W 4→6 (35); Second Manifest (40); Long Memory, one unbought item carries to
the next shop at −20% (40); Dice Weight +1 to the roll (5 ranks 10/14/18/24/30); Scrapyard, sell-back
50% (15); Fourth powerup slot (45).

## 5. Fate

**Roll.** `stream(seed, "fate")`: Fate = clamp(floor((u1 + u2) x 50) + Dice Weight, 0, 100). Run 1 is
50 and hidden. Tiers: Forsaken 0-14 (4.5% of runs), Cursed 15-34 (20%), Unsteady 35-59 (43.5%),
Favored 60-84 (27.5%), Touched 85-100 (4.5%). Streaks (on the rolled score): two rolls under 35 in a
row make the next the better of two; two Touched make the next the worse of two.

**What Fate changes** (rockets never change):
1. **The run's pool.** Touched draws 6 drones and 10 powerups from the unlocked set, with a guaranteed
   multiplier (Heavier shots, Faster launch, or a rare) and every owned category represented; Favored
   5 and 9; Unsteady 4-6 and 8-10 (the shipped draw); Cursed 4 and 8; Forsaken 4 and 7. Split and
   Longer reach are always in.
2. Rare odds +(Fate − 50)/8 pp (mythic +(Fate − 50)/25 once mythic is unlocked; before that it folds
   into rare), the rest to common. On the rank-4 table 72/22/6: Fate 10 shows rare 1%, Fate 90 11%.
3. Prices x (1.15 − 0.3 x Fate/100), rounded to 5.
4. Omen bag mix, curse/mixed/blessing: Forsaken 50/35/15, Cursed 40/35/25, Unsteady 30/40/30,
   Favored 20/40/40, Touched 10/35/55.
5. W multiplier x1.25 below 35, x1.5 below 15 (rolled Fate only).

The Fate Forecast (from death 1) shows the dial with the tier name, the run's pool with "?" for locked
items, the exact shop odds, the price factor, and the streak meter. A roll log lists every shop roll.

**Pity.** A miss is a shop roll (a reroll counts once) that lands below the best tier in the table.
After 4 misses, +4 pp per further miss to that tier, capped at +20; a hit resets it. Per run.

**Omens** (from death 1). After waves 1, 3, 6, 9 and 12, before the shop: reveal 2, take 1, or pass for
40 money. One bag of 12 per run, drawn without replacement. A pair never holds two curses or two cards
touching the same thing. A Forsaken run still sees a blessing in its first two pairs; after two
non-blessing picks the next pair holds a pure blessing. No curse that touches a counter lands on the
breather before that counter's rocket debuts (`day.debut` check in `startBreather`); Salvo Warning's
extra rockets never use a debuting type.

Blessings: **Tailwind** (pads launch 15% faster, all run); **Windfall** (+200); **Open Sky** (next shop
shows 5 bases, one guaranteed unowned); **Second Wind** (+1 laser charge for 3 waves).
Mixed: **Overclock** (rate x0.7 all run; pads with cap 4+ lose 1 cap); **Clear Skies** (laser cooldown
x0.6 all run; rockets 10% faster); **Black Market** (next shop guarantees a rare, or an uncommon before
rank 4; prices there x1.25); **War Bonds** (+400; city income x0.5 for 3 waves).
Curses, each a debt then momentum, paid 2 W on taking and 2 W on clearing the next wave: **Dust**
(reach x0.8 for 1 wave; then x1.15 for 3 waves); **Jammed Sky** (no laser next wave; then, if no city
was hit that wave, laser cooldown x0.75 for 3 waves); **Salvo Warning** (next wave x1.3 rockets; kills
that wave pay double); **Levy** (wave bonus 0 for 1 wave; then x1.5 for 3 waves). Every "then" is
bounded at 3 waves so a curse is a trade, not a strict win for long runs.

## 6. The shop over time

| Rank | Slots (bases + powerups) | Powerup odds C/U/R/M at Fate 50 |
|---|---|---|
| 0 (run 1) | 1+2, fixed | 100 |
| 1 | 2+2 | 100 |
| 2 | 3+2 | 85/15 |
| 3 | 3+3 | 85/15 |
| 4+ | 3+3 | 72/22/6 |
| Wave 8 first clear | 3+3 | 65/25/8/2 |
| Wave 12 first clear | 3+3 | 60/27/10/3 |

Run 1's shops show the rank-2 slots greyed and locked, so the grid the meta will fill is visible
before the meta exists. Prices: config x Fate factor; escalation x1.5 per copy stays. Base slots never
roll tiers; at most 1 duplicate of an owned base; at least 2 of 6 offers match an owned category or
drone type; no `once` powerup every pad already has; a new unlock gets 2x weight for 3 runs; before the
needle, splitter and brute debuts the shop before each **guarantees an unlocked counter** from
{Faster drones, Lowest first, laser}, {Split targets, Spread out, Flak}, {Heavier shots, Kite, Ram}.
Dead shop failsafe: if nothing is affordable and nothing was bought, +100 money once.

**Pass** (death 10): skip a shop for a Tag: Investor (+250 after the next wave, once per run), Rare
(next shop's first powerup slot is rare), Coupon (next shop's bases half price, no stacking), Double
(copies the next Tag, never Double).

## 7. In-run momentum

Income compounds on the shipped curves (kills climb with the wave, cities pay 60 + 40 untouched, the
Mint pays 85 from wave 3). No interest on held money. Damage compounds as drones x laser: +1 drone is
additive, Heavier shots x1.6 per copy, Faster launch x1.43, two Heavier shots x2.56. Kill-money bonuses
(Bounty Board, Beacon, Salvo Warning) are additive (+100% each) and cap at x4. Laser cooldown
reduction caps at x0.5 across Quicker strike, Clear Skies and Jammed Sky's then; Quicker strike is
`once`. A run that finds a multiplier by wave 6 goes vertical; a run stuck on additive picks is the
cursed one. Every cleared wave locks its W at the shop.

**The win.** Clearing wave 12 ends the run, pays 40 W, and opens the next Threat level. **Threats**
(one rule each, opened by winning on the current one): T1 wave bonus 0; T2 +10% rockets; T3 prices
+15%; T4 one powerup offer per shop is Rental (60 a wave); T5 cities have 2 HP. Threat pays +25% W per
level on first-clear, frontier and win lines only (additive with Fate). The completion grid (bases you
have won with x threats) is the closure screen; skins are the late W sink.

## 8. Rarity and synergy

Bases: Common Hornet, Weaver, Picket; Uncommon Kite, Warden; Rare Ram, Mint. Powerups: Common Lowest
first, Spread out, +1 drone, Faster drones, Longer reach; Uncommon Faster launch, Heavier shots, Split
targets, Blast-hardened, Quicker strike, Bigger strike; Rare Second charge, Flak. Share is measured by
kills in the bot test: removing any one item drops a build's clear wave by at most 20%.

New items: **Queen Hornet** (Rare base 400: cap 8, reload 0.25); **Chain Reactor** (Rare strike 500:
rockets the laser kills blast at brute size; those blast kills are owned by the strike but do not
trigger Afterburner); **Prism** (Rare strike 540: 3 shells in a fan, each 60% radius); **Afterburner**
(Uncommon strike 350: each direct shell kill refunds 1 s of cooldown, max 3 s per strike); **Beacon**
(Rare launcher once 420: this pad's kills pay +100%); **Ledger** (Rare run-wide 450: each Mint pays +15
per other Mint); **Bounty Board** (Rare run-wide 400: kills pay +100% while no city has been hit this
wave); **Warden's Oath** (Rare Warden-only 480: a guarded city takes 0 from the first blast each wave);
**Dead Man's Switch** (Rare run-wide 500: once per run a city that would die stays at 1); **Twin Pad**
(Mythic base 700: launches the type and first two powerups of your most-upgraded pad, ties by pad id).

## 9. The post-death screen (staggered with the ladder)

Any tap jumps to the final state. Death 1: the cause line, a three-line tally (waves cleared, first
sightings, total W), the card, Launch. Death 2 adds the three bars and the Fate dial. Death 3 adds
Manifest; death 4 Wager. Order, always: cause, tally, bars, Fate, card, Launch, so the card is the
last beat. A **Spend** step sits between the card and Launch, showing the grid with affordable nodes
lit; War chest rank 1 (+90 for 20 W) is what a first death buys, and it is felt: a second pad before
wave 1 next run. Back in wave 1 in 12 s.

## 10. Determinism

The sim stays a pure function of (seed, profile snapshot, inputs). Every meta choice is an input:
`{k:"manifest"}`, `{k:"wager"}`, `{k:"dare"}`, `{k:"omen", i}`, `{k:"pass", tag}`, `{k:"loadout"}`,
`{k:"sell", pad}`. The profile snapshot (unlocks, grid preset, best wave, first clears, lifetime
counts, streaks, suppression) is stored with the run's log. Seeds come from
hash(profile.runs, profile.lifetimeW, wall clock) so no run repeats; W is paid once per seed, and a
replayed log pays nothing. Named PRNG streams: fate, omen:wave, shop:wave, glow.

## 11. Acceptance tests (bots decide the tuned numbers)

1. Run-1 kit + fixed shops, 150 seeds each of the three casual bots (first/no laser, first/lazy laser, random/lazy laser), pooled: wave 2 cleared 55-80%, wave 3 20-50%, wave 4 under 45%; the smart bot's median at least 2 waves higher.
2. Profiles after deaths 1-4 (their ladders, 180 + War chest 1): median death wave 2-3, 2-3, 2-4, 3-4.
3. Frontier push pays ≥1.4x a wave 1-3 farm per minute; no discovered loop pays more per minute than
   the push.
4. Strongest 20-point preset beats a bare profile by at most 25% on median wave.
5. Any single item removed drops its build's clear wave by at most 20%.
6. Fate: Touched vs Forsaken median wave gap is 2-4 waves at rank 4 (variance in route, not
   competence); a Forsaken run with the counter guarantees never faces a debut with no counter offered.
7. Replays of every bot run reproduce tick and result exactly with the profile snapshot.
