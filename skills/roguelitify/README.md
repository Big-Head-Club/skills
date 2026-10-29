# roguelitify

A Claude Code skill. Say "roguelitify this game" (or "add meta progression", "make it like
Hades/Balatro") and Claude turns a game with runs into a roguelite: a profile that outlives runs, a
currency every run pays into, a ladder of guaranteed unlocks on deaths and first clears, a small
tree the player feels, a per-run luck roll that makes some runs cursed and some blessed, gambles
between rounds, a named win, and a result screen that reveals one thing at a time. It sets every
number with bots against the owner's death cadence and runs an adversarial review before shipping.

Built from the Drone Command overhaul (Big-Head-Club/drone-defense-glow, 2026-09-24), which is the
worked example in `example/`.

## Install

Requires Git and Node.js 22.20 or later. Install from the shared
[Big Head Club skills repository](https://github.com/Big-Head-Club/skills):

```bash
npx skills add Big-Head-Club/skills --skill roguelitify --agent claude-code --global
```

Restart Claude Code (or start a new session) so it picks the skill up. The review step uses the
Codex CLI if it is installed, and the Workflow tool for the gauntlet.

If you installed by cloning the old standalone repository, move that clone outside your agent's
skills directory before installing from this collection, preserving any local edits.

## Update

```bash
npx skills update roguelitify --global
```

## What's in it

- `SKILL.md`: the steps Claude follows.
- `references/principles.md`: why Hades and Balatro pull (ten ranked principles with numbers, the
  cursed-vs-blessed toolkit, the first hour, a checklist).
- `references/architecture.md`: the run config in, the payout out; determinism.
- `references/numbers.md`: how the numbers get set, and Drone Command's as a start.
- `references/pitfalls.md`: the exploits and traps two reviews found.
- `references/ui.md`: the result screen, the shop, the gambles, the meta screen.
- `references/reviews.md`: the review prompts and the gauntlet.
- `example/`: `meta.js` (the pure meta module), `careers.mjs` (the career bot), `tests.mjs`,
  `spec.md`, `gauntlet.js`.

The examples come from Drone Command and depend on its simulator, game hooks, local paths,
and review tooling. Adapt those dependencies to the target game before running them.
