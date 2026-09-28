---
name: roguelitify
description: Turn a game with runs into a Hades/Balatro-style roguelite. Adds a profile that outlives runs, a currency every run pays into, a ladder of guaranteed unlocks on deaths and first clears, a small felt tree, a per-run luck roll that makes some runs cursed and some blessed, between-wave gambles, a named win, and a result screen that reveals one thing at a time. Sets every number with bots against the owner's death cadence, and runs an adversarial review before shipping. Use when asked to "roguelitify" a game, add meta progression, add unlocks or a tech tree across runs, make runs pay into the next, or make a game "like Hades/Balatro".
---

# Roguelitify a game

The promise a roguelite keeps: **no run is wasted.** Every run ends with something banked, something
new to try, and a next goal the player can name. This skill adds that to a game that already has
runs (waves, rounds, levels, hands) and a core mechanic worth repeating. It does not touch the core
mechanic or the look; the owner's game stays the owner's game.

Read as you reach them:
- `references/principles.md`: why Hades and Balatro pull, as ten ranked principles with numbers, a
  cursed-vs-blessed toolkit, the first hour, and a 16-item checklist. Read it whole, once.
- `references/architecture.md`: the code shape (run config in, payout out), determinism rules, the
  input log, what the profile holds.
- `references/numbers.md`: how every number gets set, by bots, and the worked numbers from Drone
  Command as a starting point.
- `references/pitfalls.md`: the exploits and traps two reviews found in a build that looked done.
  Check every one before shipping.
- `references/ui.md`: the result screen, the shop, the cards, the meta screen; what the owner
  said when it was wrong.
- `references/reviews.md`: the gauntlet workflow and the Codex prompts that found the holes.
- `example/`: the Drone Command build as a worked example: `meta.js` (the pure meta module),
  `careers.mjs` (the career bot), `tests.mjs`, `spec.md`, `gauntlet.js`.

Do the steps in order. Decide, write the decision down, and ask only when a choice changes the
owner's rules, numbers or copy.

## 1. Take the bible

Write `docs/design/brief.md` with the owner's words, verbatim, and turn each clause into a testable
target. The clauses to extract, and what they mean in numbers:

- **The starting kit**: what run 1 has. Take it literally ("one hornet drone" meant one drone, not
  one launcher of six). The kit is deliberately crippled; the meta restores the shipped game, and
  the shipped game is the ceiling, not the floor.
- **The death cadence**: where runs 1, 2, 3, 4 die and when runs lengthen ("wave 2-3, then 2-3,
  then 2-4, then 3-4, then longer"). This is the acceptance test for every number.
- **Variance**: how far apart a cursed run and a blessed run must feel.
- **What stays**: the core mechanic and the look. Name them so no review argues for changing them.
- **What goes**: the daily, the leaderboard, multiplayer, sharing, whatever the owner named.

If the owner points at games (Hades, Balatro, Slay the Spire, Rogue Legacy), read `principles.md`
and any links they sent before designing. Add each new framing to the brief as a line.

## 2. Design, in competition, then attack the winner

Do not design alone. Run three or four designs from different angles (one from each named game's
frame, one from the owner's own words, one from an outside model such as Codex), a judge panel, a
synthesis, and then five refuters and an arithmetic audit of the synthesis. Every fatal or serious
hole gets a fix in the spec before any code. `example/spec.md` is the shape: the bible at the top,
then the first run, the currency, the ladder, the tree, luck, the shop over time, momentum, the
result screen, determinism, and the acceptance tests, each with numbers. Section 0 of that file
lists what the build changed and why; keep such a section current.

The design must cover every facet the owner named. The full set, from `principles.md`:

1. **Currency paid at run end**, weighted to the frontier: first clears pay most, a wave already
   cleared pays a fifth, deaths on the frontier pay a once-only consolation. A cursed run pays more
   on the frontier lines. A surrendered run pays nothing.
2. **Three visible tracks** that each move on every run: Rank (guaranteed cards by qualifying
   deaths), Frontier (cards by first clears), Blueprints (fragments that open anything locked).
   Never end a run with every bar stuck at 90%.
3. **A ladder** of guaranteed cards: each of the first deaths opens something that changes
   decisions (a new unit, a system), never just a stat. Death 1 must change run 2.
4. **A small tree** the player feels. One node that is the big vertical step (drones per pad,
   restoring the shipped count over five ranks), priced so a hoarder gets rank 1 around run 3-4.
   No +2% nodes: they change nothing a player can feel and drain what the big node needs.
5. **Luck as a character**: a 0-100 roll per run with named tiers (4.5% at each end), shown, that
   shapes the pool, prices, the gamble bag, and the fight itself (a Touched run flies more, a
   Forsaken run starts poorer with a narrower weapon). Rockets (the threat) never change with luck.
6. **Gambles between rounds**: two cards, take one or pass for a little money; blessings, mixed
   cards, and curses that are a debt then momentum. Bounded to a few waves; never two curses in a
   pair; never the same card twice.
7. **The shop over ranks**: slots and rarity tiers that grow with the ladder; a counter guaranteed
   before each new threat debuts; run 1's shops fixed, not rolled.
8. **A named win** (a wave that ends the run with the biggest payout) and something past it
   (a Threat level that adds one rule and pays more).
9. **Determinism**: the run is a pure function of (seed, run config, input log). Every meta choice
   in a run is an input. A reload replays; a seed pays once.

Cut for v1 what reviewers cut for Drone Command: pre-run bets and loadouts, deeds with live
counters, a fourth rarity, skins. List them as later content in the spec.

## 3. Build the sim side first, with bots

Order, each step shippable and tested:

1. **Strip** what the owner named (daily, multiplayer, share). Grep for boot calls inside the
   blocks you delete.
2. **Rescale** if a damage step must be real: rockets to 2 HP with every shot doubled made one
   "heavier shots" a real hit-count change. A pure rescale changes nothing else; check blast
   chains, children, flak, the strike, every hard-coded 1.
3. **Run config in.** `createRun(seed, { run })` reads one object the profile made: pool, start
   money, swarm, mods, weapon, shop slots and odds, fixed early shops, the pre-wave shop, luck,
   gambles, the win wave, the threat. No config = the full game, for the title demo and the tools.
4. **meta.js**, pure: profile, ladder, tree, luck roll, `runConfig`, `payout`, `advance`. See
   `architecture.md` and `example/meta.js`.
5. **The career bot** (`example/careers.mjs`): N runs on one profile, payout and ladder applied,
   currency spent by a policy. This is what sets the numbers. Run it at every change.
6. **Tests**: replay with a profile, the run-1 cadence (three casual bots pooled), a lengthening
   career, shop guarantees, gamble pair rules, luck tiers, payout rules, the no-engine-Math rule
   including `**`. `example/tests.mjs`.

Then calibrate against the cadence with `numbers.md`. Expect surprises: a second city arriving
before wave 3 made wave 3 death-free; the chain blasts made one drone stronger than the spec
assumed; the first felt tree node arriving on run 2 jumped strong players three waves.

## 4. Build the client

The result screen is a sequence, not a report; the shop shows tiers with a stripe; gambles take
the shop's place; the meta screen is a closed menu. `ui.md` has the pattern and the owner's words
that shaped it. Keep the game's own UI rules (`~/.claude/CLAUDE.md`, the repo's docs) above this.

## 5. Review before shipping, twice

1. Codex (or another outside model) on the spec, then on the client, with the prompts in
   `reviews.md`. Take every arithmetic contradiction and every exploit.
2. The gauntlet workflow (`example/gauntlet.js`): six lenses (exploit, arithmetic, determinism,
   the owner's advocate, edge cases, feel), two refuters per finding, keep what survives. Fix the
   fatal and serious ones, re-run the career bot and the tests, then ship.

Check `pitfalls.md` item by item; each one was found in a build that had passed its tests.

## 6. The second day: what the owner asks for once they play

Every one of these came within a day of the first ship. Build them in from the start next time.

- **More of everything, slower.** "Add more unlocks, more progressions, more powerups, more stuff"
  and, in the same breath, "the meta progress happens way too fast, I've got almost everything
  unlocked". The fix is structural, not a price: one ladder step per death, at most two wave cards
  per run with the rest held (shown as "next run"), a ladder that runs to death 23, fragments every
  second death. A strong player must still have things locked after fifteen runs.
- **Levels on everything.** "I should always have made-up goals to strive toward, even if it
  doesn't unlock something." Five tiers per citation, mastery levels per unit type from lifetime
  kills, Rank levels past the ladder, and every level a card on the end screen. Bars never read
  "complete": they name the next level.
- **No cap.** "I should go until I die, always." A win wave is a rug pull; bosses recur every fifth
  wave and toughen, cities keep arriving, first clears keep paying (cooled past the old cap).
- **Never reward death.** The first Rank track counted deaths; the owner read "Every death
  counts" in the Hangar and rejected it outright: "we shouldn't be directly rewarding death at
  all. we should be rewarding defense successfully executed." Rank now moves on rockets shot down
  over all runs (the ladder's steps sit where the death steps did: ~75 kills a run for a casual
  career), blueprint pieces come every 125, and an idle run opens nothing because it shoots
  nothing. Deaths stay a counter for the luck roll and history, never a trigger.
- **The meta must show in play.** "All this stuff about deeds and fates and curses and pity is
  totally invisible to me in the game." A dial in the HUD, a chip per card in force with waves
  left, the nearest citation under the wave clear, pity pips in the shop. `references/ui.md`.
- **The words must fit the fiction.** "Omen, curse, fate, these are all high fantasy terms. This is
  a war game." Rename before the owner sees them: Supply, Dispatches, Support / Gambit / Setback.
- **Weak items get named.** "Spread out and Lowest first and Bigger blast are all unappealing." Give
  every switch a little power and weight the families the owner wants (range, recharge) up in the
  shop. Expect a request for a whole family ("more powerups that let me charge the laser faster").
- **A maxed profile with money is a bug report.** Deep sinks (a second pad from the start, extra
  charges, a starting powerup, income), a node that climbs thirty ranks, fragments that can open
  anything and turn into currency only when nothing is left, pay that cools at depth.
- **Reset everyone.** Profiles live in the browser; a version bump is the reset. Say that it's gone
  for good.
- **A big threat's reach must be visible.** "A boss that lands takes every city" ended a run from
  one hit on one city; the owner: "it can't magically reach over." Either the blast is drawn wide
  enough to touch every city it takes (a nuke ring the width of the field) or it takes only the
  city it hit.
- **Every sentence in the meta screen is read by a stranger.** "Blueprints are fragments. You get
  one every second counted death..." and a Swarm bar that restated the money in hand drew "am I
  having a stroke?". Run the legibility audit (below) after every copy change; a card name must
  say what it is ("Widest laser", never "Command laser"); a track's note says what moves it, what
  it opens next, and who chooses ("you pick which").

Use the bots for each mechanic as it lands (a script that places one Lure and counts what it
kills), the career bot for pacing, and a browser probe that clicks around every target and reports
any rejection while the target was lit (that found a shake bug two days of play had not named).

**The legibility audit** (`example/legible.mjs`): a script that drives every screen through the
dev hook and the real buttons, lists every visible element (own text, or a control or drawing with
none, skipping anything under a painted panel), and asks Jev (TypeSafe's System One model: typed
scores, no prose, a fraction of a cent a question) how well a first-time visitor who knows only one
sentence about the game could tell what the element is, what it does, and what it connects to.
Flag anything under 2 of 3. Read the worst first; the numbers with no name (pad badges, tally
amounts, a bank total) and the meta screen's sentences are where it bites. Run it after every copy
change, and before showing the owner.

## 7. Ship and report

Commit on the owner's branch, push, deploy with the repo's command, after every fix, and tell the
owner to hard-reload (a resumed run replays under the cached script, and they will report the old
behaviour as still broken). Report in plain sentences:
what is live, what the bots say about the cadence (run by run), what was cut and why, and the one
open design gap. Give the owner a way to start from run 1 (a fresh profile).
