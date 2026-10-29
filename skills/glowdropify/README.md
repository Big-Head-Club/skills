# glowdropify

A Claude Code skill. Say "give this app a glow up" (or "glowdropify this") and Claude runs a
gauntlet on the app: it cuts explainer text, labels and extra screens, makes every action answer
visually, adds a render layer (sky, glow, particles) to games, and loops with independent critics
against two house standards (Wire War Zen for minimal, Glowdrop for juice) plus one outside
reference, until a blind before/after test shows the result is clearly richer.

## Install

Requires Git and Node.js 22.20 or later. Install from the shared
[Big Head Club skills repository](https://github.com/Big-Head-Club/skills):

```bash
npx skills add Big-Head-Club/skills --skill glowdropify --agent claude-code --global
cd ~/.claude/skills/glowdropify/scripts
npm ci
npx playwright install chromium
```

Restart Claude Code (or start a new session) so it picks the skill up. It also needs `gh` and
`ffmpeg` on the PATH (the capture script uses it for motion checks). The commands in the skill
use the global Claude Code path above; adjust it to the installed directory for another agent
or a project-local installation.

If you installed by cloning the old standalone repository, move that clone outside your agent's
skills directory before installing from this collection, preserving any local edits.

## Update

```bash
npx skills update glowdropify --global
cd ~/.claude/skills/glowdropify/scripts
npm ci
npx playwright install chromium
```

## What's in it

- `SKILL.md`: the loop Claude follows.
- `references/`: the standards, the polish list, app buckets, critic briefs, the juice kit, and
  `glamour.md` (the render layer) with `rich-example.js`, a working WebGL2 sky, bloom and particles.
- `refs/`: reference frames from Wire War Zen and Glowdrop.
- `scripts/`: `shots.mjs` (captures every state at four sizes and audits it), `ab.mjs` (blind A/B
  composites), `imgstats.mjs`.

The `scripts/dd-*.mjs` captures are Drone Command worked examples. Adapt their project paths,
URLs, and game hooks before using them elsewhere; see [README-dd.md](scripts/README-dd.md).

The skill reads the Wire War Zen and Glowdrop repos from GitHub (`Big-Head-Club/wire-war-zen`,
`Big-Head-Club/glowdrop`), so you need read access to both.
