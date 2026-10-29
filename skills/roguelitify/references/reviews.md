# Reviews: what found the holes

Two kinds, in this order, before shipping. Both found things the tests and the bots had not.

## Codex (an outside model) on the spec, then on the client

Run with `codex exec --skip-git-repo-check -s read-only -o <file> "<prompt>"`; always write to a
file with `-o` (piping the output through grep or sed lost it once). The prompts that worked:

**On the spec.** "You are reviewing a finished design spec for a roguelite overhaul of a small
deterministic web game. Read <spec>, <research doc>, and skim <sim entry points>. Give a ruthless
review: (1) any remaining exploit, farm loop or dominant strategy; (2) any place the numbers
contradict each other (do the arithmetic); (3) whether the run-1 death cadence is plausible given
<wave counts> and <the starting kit>; (4) the top five things you would cut from v1 to ship faster
without hurting the bible; (5) the order you would implement it in so the game is playable and
testable at every step. Cite section numbers and numbers. No praise."

What it found: breather idling, surrender farming Rank, unit spam through a flat duplicate price,
chains under the rescale, curse cards that were strict wins, the failsafe being farmable through
rerolls, a heavier-shot node that was a no-op at the new HP, five arithmetic contradictions, the
first felt node buying a unit before wave 1, and five cuts (bets, deeds, tags, pre-run picks,
threat tiers).

**On the client.** "Review the roguelite client after the overhaul. Read <main.js: the run
lifecycle, the offer builders, the result screen, the meta screen>, <meta.js>, <index.html>,
<style.css>. Find: (1) bugs and wrong states in the flow (resume mid-gamble, resume after a
reroll, the result screen when the run was won or surrendered, Spend then Launch, keyboard on the
gamble cards, event ordering); (2) anything in the result screen that fails the spec's sequence or
the research doc's 'the player can name what changed'; (3) any place the UI text lies about the
sim; (4) the five cheapest changes that would most improve what a player feels in runs 1-5. Cite
file:line. No praise."

What it found: Enter/Space hitting Pass instead of the focused card, a reload during the death
pause resurrecting the run, the resume clock losing shop time, a stale dead-shop flag after a
reroll, three card lines that overstated their numbers, no staged reveal, Spend not leading to
Launch, the meta screen exposed before it meant anything.

## The gauntlet workflow

`example/gauntlet.js` is the script (the Workflow tool, "ultracode"). Six attack lenses read the
code and the spec, each returning up to eight findings with a claim, evidence and a fix; two
refuters per finding try to disprove it from the code or a computation, defaulting to refuted;
a finding survives unless both refute it. Ninety-eight agents, 46 findings, 39 kept, 25 minutes.

The lenses: **exploit** (a min-maxer: farm loops, idle exploits, currency without playing well),
**arithmetic** (recompute every number, every contradiction between spec, code and comments),
**determinism** (every random draw a named stream, replay with the saved config, no engine Math),
**bible** (the owner's advocate: judge the code, not the spec, against each clause; is the variance
large in play; is progression visible every run), **edge** (crashes and wrong states, with tiny
scripts to reproduce), **feel** (a shipped-roguelite designer on runs 1-10: is the first shop a
decision, does the death screen explain, do the gambles tempt, does anything feel like a tax).

Read the kept findings with a script (the result file is JSON with `result.kept` and
`result.refuted`), group them, and fix in one batch; then re-run the career bot and the tests
before shipping. The refuters are worth reading too: they correct the finders' numbers.

## The bots are a review too

`example/careers.mjs` after every change: run-1 cadence, medians per run for casual and strong
policies, and the replay check on profile 0 (compare money, pads, mods, picks and stats, not just
the tick). The random bot rerolls when it can so the reroll path has replay coverage.

## The legibility audit (2026-09-28)

`example/legible.mjs`. Every visible element on every screen, judged by Jev as a stranger. The
state Jev sees: one sentence about the game, the screen's name, the element's shape and text,
the text around it, and everything else readable on the screen. Four questions: is (a button, a
label, a count, a meter), does, links (what it counts, opens, costs), jargon (yes/no), plus a
kind. Scores 0-3; flag under 2. What it found on the first run: the Hangar's blueprint sentence
(1.4 across), "Command laser", pad badges "5 −2" (kills and losses, no name), tally lines "First
decoy" and "Wave 1 again", the pause line of raw numbers, a bar that restated the bank. What it
does not do: write the fix (Jev does not write), or see drawings (a canvas is judged by its label).
It found two tool bugs of its own on the way: elements under a panel counted as visible until
the collector checked what `elementFromPoint` hit and whether that thing paints a background, and
a shop driven by the dev hook never closed because only the Go button hides the overlay.
