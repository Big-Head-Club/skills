# Critics and builders

## Standing orders (paste into every critic prompt)

```
You are an independent critic in a polish gauntlet for <APP>. You did not build
it, you have not seen the builder's reasoning, and you will not be shown the
diff. You are rated only on finding real problems; praise is noise and will be
ignored. A false pass is the worst thing you can do: a generous score wastes
the owner's evening. Do not edit any file in the repo. Scratch scripts go in
/tmp and are deleted when you finish.

Judge the real thing: the screenshots, the video, and the live local app at
<URL>. Never judge from code or a description alone. If you cannot see
something, say so; that counts as a finding.

The bar is docs/glow/BAR.md. The owner's rules in it outrank the standards
and your taste; never propose breaking one. The standards are in
~/.claude/skills/glowdropify/references/standards.md, and the polish list is
~/.claude/skills/glowdropify/references/universal.md. Cite criteria by number
(Z3, G11, F2, U24).

Return ONLY a markdown table: issue | severity | confidence | evidence | fix.
Severity: P1 blocks use or breaks the standard; P2 hurts; P3 polish.
Confidence: high, medium or low. Evidence names the screenshot, the video
timestamp, a measurement, or what you did live. At most 15 rows, most severe
first. Then one line: the single biggest gap, as element, property, direction,
and how we would know it is fixed. If a fix would change a rule, number,
price or the owner's copy, mark it NEEDS-DANIEL.
```

Material to hand every critic:
- `docs/glow/shots/<round>/` for this round, and `docs/glow/shots/r0/` for the
  baseline. Files are named `<state>-<view>.png`, where the views are desk
  1440×900, phone 390×844, land 844×390 and small 360×640.
- `audit.json` from the same round.
- `video-<view>.webm` from the same round. Critics pull frames with
  `ffmpeg -i in.webm -vf fps=4 /tmp/crit/f%03d.png`.
- Reference frames: `~/.claude/skills/glowdropify/refs/` and `docs/glow/refs/`.
- The local URL, plus how to reach each state (`docs/glow/states.mjs`, and the
  `window.__game` hook if there is one).
- Playwright lives at `~/.claude/skills/glowdropify/scripts/node_modules`.
  Critics run scratch scripts from that folder or import it by absolute path.
  Never add it to the app's package.json.
- Canvas and WebGL apps need `chromium.launch({ args: ["--use-gl=angle",
  "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })`, or the canvas is
  black. SwiftShader is slow: CSS animations and timers run late in wall-clock
  time, so judge timing from the page's own clock or the CSS, and say which.
- Tell critics never to press a button that posts a real score, spends a daily
  run or creates rooms; block those API routes with `page.route` when in doubt.

## Lenses

Five run every round: first-time user, phone thumb, zen comparator,
outside-bar comparator and before/after. The comparators and before/after each
make blind A/Bs, so every round has at least three. The juice comparator also
runs every round when BAR.md sets juice to medium or full. Add the others when the bucket or the last round calls for them.
Tell each critic to stay in its lens. Findings another lens owns are wasted
tokens, and in the trial run all three lenses led with the same P1.

**First-time user.** You have never seen this app. Using only the screens and
the app itself (no docs, no code), can you do the main job, tell that it
worked, and recover from a mistake? Where do you get stuck, misread, or act by
accident? This lens decides what the cut must give back, as a visual cue
rather than a sentence.

**Phone thumb.** One hand, portrait 390×844 and 360×640, landscape 844×390, in a
touch context. Measure targets under 44px with `getBoundingClientRect`. Find
anything off screen or clipped, anything that jumps under the thumb, anything
that needs two hands or a precise tap, gestures that fight the browser (scroll,
zoom, back-swipe, long-press menus), safe-area problems, and the on-screen
keyboard covering an input (shrink the viewport height to about 450px).

**Stability.** Anything that flickers, reflows, shifts layout, loses focus,
scroll, selection or a draft, or moves when state arrives. Compare the board's
position across consecutive states, and diff video frames at 10–25 fps. For
multiplayer, open two contexts in one room and act in one while the other is
mid-drag or mid-typing. Note frame timing if the page redraws every tick.

**Zen comparator.** Side by side with wire-war-zen (hexsmash.xyz, or the
frames in `refs/`). First read `AGENTS.md` in wire-war-zen (`Big-Head-Club/wire-war-zen`, branch `zen`), the
UI rules the owner settled on after months of stripping clutter. List
everything here that is heavier, noisier or wordier than zen, and every control
here that zen does without. Count the visible strings per screen. Make one
blind composite of our main screen against `refs/zen-phone-3-table.png` (or
`zen-desk-3-table.png`) with `ab.mjs`, and judge it on calm and clarity, not
on genre.

**Juice comparator** (every round when BAR.md sets juice to medium or full).
Check the render layer against `glamour.md` too: depth behind the play, glow,
particles on every contact, glowing heads and trails, the payoff as a light
event. A flat, unlit world with popups on it caps juice at 2. Study
the payoff and the ordinary action, frame by frame from the video, against
glowdrop (`refs/`, or run it locally). Check that every user action gets word,
light and sound; that a meter shows progress; that the payoff is proportionate
and skippable; and that failure is soft. Also check for idle motion on thinking
screens, which is a fault here even though glowdrop has it. Blind A/B the
payoff frame.

**Outside-bar comparator.** Blind A/B against the outside reference in BAR.md,
one composite per key screen:
```
node ~/.claude/skills/glowdropify/scripts/ab.mjs --ours <our.png> --ref <ref.png> --out /tmp/ab/<name>.png
```
Look only at the composite, pick LEFT or RIGHT and say why, and only then run
`--reveal`. Ours wins only when you would genuinely pick it. Back your eye with
numbers where they help:
`node ~/.claude/skills/glowdropify/scripts/imgstats.mjs ours.png ref.png`.

**Before/after (the indistinguishable test).** Runs every round. Build a blind
pair for the three key states (main play mid-action, the player's big move
landing, the result): r0 and this round, same state and view, with `ab.mjs`
(`--ours` this round, `--ref` r0). Before `--reveal`, answer: which is newer,
and is it clearly richer, a little different, or about the same? Then run
`imgstats.mjs` on both. "About the same" or "a little different" on any
key state is a P1 titled "indistinguishable from r0", with what the old
one does better and what the new one lacks (depth, glow, particles, light on
the payoff). Judge the look only; the other lenses own words and flow.

**Owner's words.** Read every quote in BAR.md. For each one, does the app now
do it? This lens catches drift from what Daniel actually asked for.

**Brand fidelity** (client apps). Compare against the client's site, sampling
colours and type from their CSS. Flag anything off-brand, generic, or from a
UI kit.

**Code reviewer** (a cheaper model is fine). Review only the client files the
glow up touched. Look at the rendering strategy (does it rebuild everything on
each state?), event wiring, and the touch/mouse split per pointer event. Check
for dead code, duplicated state, magic numbers that belong in one timing or
colour table, and anything that makes the next change hard. Evidence is
`file:line`.

## Builders

- Verify each finding in the browser before acting. A critic can be wrong.
  Report each one as APPLIED, SKIPPED (with the reason) or PARTIAL.
- Fix P1s first, then P2s. Batch P3s only when they are cheap.
- Prove every fix with a fresh screenshot of the same state and view. If
  the pixels didn't change, it isn't fixed.
- A polish pass doesn't change rules, numbers, prices, balance or the owner's
  copy. Those go in REVIEW.md under "Needs Daniel". Rendering (sky, glow,
  particles, light) is never in that list; change it freely.
- A critic's finding that a screen "lost the A/B for lack of light, depth or
  effects" is never rejected as "the owner's look". Only the requester's quoted
  words can protect a flat look.
- Don't add features, tutorials or settings. "If a thing needs explaining,
  redesign the thing."
- Keep tests, typecheck and lint green. Never quarantine a failing test to get a
  pass. Say plainly which tests fail.
- When builders run in parallel, each one owns a disjoint set of files.
- Commit per slice, with plain messages saying what changed and why, and numbers
  in the body where they help.

## Round log (append to docs/glow/REVIEW.md)

```
## Round N — <slice>
Critics: <lenses>. P1 x, P2 y, P3 z. Blind A/B: <screen> ours LOST|WON vs <ref>.
Fixed: <one line each, with before/after shot names>.
Rejected: <finding> — <why>.
Needs Daniel: <finding> — <the decision needed>.
```
