# Big Head Club Skills

Reusable agent skills for building games. Each skill is a set of instructions
that an AI coding agent loads when the task calls for it.

## Install

Requires Git and Node.js 22.20 or later. Run this from your project:

```sh
npx skills add Big-Head-Club/skills
```

The [skills CLI](https://github.com/vercel-labs/skills) lets you choose which
skills and agents to install to. It supports OpenCode, Claude Code, Codex, Cursor,
and other [compatible agents](https://github.com/vercel-labs/skills/blob/main/docs/agents.md).
Installation is project-local by default; add `--global` to use a skill across
projects.

To install only `game-presentation`:

```sh
npx skills add Big-Head-Club/skills --skill game-presentation
```

To install it globally for OpenCode without prompts:

```sh
npx skills add Big-Head-Club/skills --skill game-presentation --agent opencode --global --yes
```

Replace `opencode` with `claude-code` or `codex` to target those agents. Omit
`--global` for a project-local install.

To browse the available skills without installing:

```sh
npx skills add Big-Head-Club/skills --list
```

## Skills

| Skill | What it does |
| --- | --- |
| [game-presentation](skills/game-presentation/SKILL.md) | Makes games look like authored games rather than conventional websites or dashboards. Covers composition, a shared art vocabulary, asset sourcing and preprocessing, materials, rendering, and visual feedback. |

`game-presentation` connects visual direction to the asset pipeline and the
renderer. It covers when to reuse artwork, kitbash parts, simplify detail,
prepare masks, bake stable shading, and retain runtime control. It works with
DOM, SVG, Canvas, and GPU-rendered scenes.

The skill refers to `game-design`, `game-art-assets`, and `image-art-direction`
for adjacent design and asset-production work. Those companion skills are not
bundled in this repository.

## Use

Ask your agent to use the installed skill:

> Use game-presentation to make this game's board, HUD, and menus feel like one
> coherent game. Inspect the current assets and renderer before changing them.

In OpenCode, you can also mention `@game-presentation` directly.

## Update

```sh
npx skills update game-presentation
```

The CLI prompts for the installation scope. Use `--global` or `--project` to
choose it explicitly.

## Add a skill

Place each skill in `skills/<skill-name>/SKILL.md`, with YAML frontmatter
containing `name` and `description`. Keep the name aligned with its directory.
Supporting references, scripts, and assets belong beside that skill's entry
file, with paths relative to its directory.

Check that the installer discovers it from the repository root:

```sh
npx skills add . --list
```
