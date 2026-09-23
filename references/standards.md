# The two house standards

Both come from Daniel's own games, and both were built by gauntlet. Cite the
criterion number (Z3, G11, F2) when a critic or builder refers to one.

## Minimal: Wire War Zen

- Source: `Big-Head-Club/wire-war-zen`, branch `zen`. Live at hexsmash.xyz.
- The rules are in `AGENTS.md` and `README.md` lines 1–47, and the look is in
  `src/web/style.css`.
- **`DESIGN.md` is stale.** It describes the parent game, Barbarian Forts: cream
  ground, Impact type, hard shadows. Do not follow its sections 2–4.
- Siblings with the same rules: `hex-smash-clusters` and `hex-smash-global`.

The live game shows about eight strings in total:
- the one button: Submit, Submitted, Game over;
- the end card: You won, You lost, Draw, Play again;
- Hand seat to a bot;
- Reconnecting… (only after four failed polls);
- Opening ABCD… while booting;
- player names.

That is the scale to aim at.

| # | Criterion | Evidence |
|---|---|---|
| Z1 | Zero taps to play. Opening the link deals a table and puts the room code in the URL. The URL is the invite. First-time visitors may get a short playable tutorial; returning players and invite links land in play. | `8358bec`, `ui.ts` enterFreshRoom, `965f8ac` |
| Z2 | No labels, help text, tooltips, toasts, legends or toolbars, and no text on the board. An illegal action simply does nothing, or shakes. | AGENTS.md, `dc0cbc4`, `2565309` |
| Z3 | A sparse HUD of three or so items. A graph has icon tabs and no axes, numbers, legend or tooltip. Primary button with a badge for the one count that prevents a mistake. | `c078834`, `585bf7c`, `83d4486` |
| Z4 | State is drawn, not written: die-face pips instead of numerals, a stitch per unit, one ring as the only marking on a base. | `e7e4cb4`, `1b3e48f`, `ed7d5c4` |
| Z5 | Gestures do the work: tap to place, drag moves one, hold 380 ms moves the stack (12 ms buzz), right-click clears. Touch or mouse is read from each pointer event, never guessed. | `c42c1d7`, `6a4695f`, `ui.ts` 2517–2620 |
| Z6 | The drag is the animation. The unit lifts onto the target, or walks home on a miss; target changes are debounced by 90 ms. Nothing teleports. | `4bebdb8`, `b9cb21f`, `b221a16` |
| Z7 | Motion lives in the turn replay. Units keep their identity, the board takes no input while it plays (about 2.1 s), and there is a still beat before the result. | `8673468`, `62b6af7`, `961e088` |
| Z8 | Nothing pulses, except a prompt that stops once you act. Entrances play once and never replay on a repaint. | `bfa17e9`, `c14f909`, `0d6aa82` |
| Z9 | Feedback is brightness, not extra strokes. Green means action and nothing else. | `ed7d5c4`, `b3d8628` |
| Z10 | A small palette: `--bg #262421`, `--ink #e4e1dd`, `--green #81b64c`, contrast audited. Seat colours stay fixed, in a fixed order, and yours never changes. | `style.css` 31–41, `e93475b` |
| Z11 | Motion is short and eases out: pips 200 ms, deal 340 ms, end card after 1.5 s of stillness. | `6536536`, `0d6aa82` |
| Z12 | Sound is rare: a two-note chime when a goal is met, falling notes on a wasteful submit ("warned, not blocked"). | `ui.ts` 562–640, `64e0ce1` |
| Z13 | Nothing twitches. Polls keep scroll, focus, drafts and selection; a poll with no news repaints nothing; outages stay quiet; reloads wait until the tab is hidden. | `62b6af7`, `8f855ea`, `299eccd` |
| Z14 | Mobile first: 100dvh, sidebar below the board, a fixed primary bar with safe-area insets, tested in a real 390×844 iframe or context, never a resized window. | `style.css` 635, DESIGN §8 |
| Z15 | No ceremony: no Invite button, no hamburger, no lobby; exit shows only when another human is present. Default names are Player 1, Player 2; saved names instead of "You". | `e724ae5`, `a745f16`, `266a73f` |

Zen's gaps: it has no `prefers-reduced-motion` handling and almost no sound.
Don't copy those gaps.

## Maximal: Glowdrop

- Source: the GitHub repo
  **Big-Head-Club/glowdrop**. Live at glowdrop.fly.dev.
- The contract is `BAR.md`, the rules are `LOOK.md`, and critics follow
  `CRITIC.md`.
- Its own bars are Tetris Effect for look and sound and Peggle for the reward
  economy.
- Glowdrop is a neon pachinko puzzle: you flip switches, drop balls, and fill
  goals.

| # | Criterion | Evidence |
|---|---|---|
| G1 | Every contact the user causes pays out a +N popup, light, sparks and one audio step. A silent contact is a bug. | LOOK §5b, §9.17, `src/fx/impacts.js` |
| G2 | Hit notes climb one pentatonic scale as the streak grows, so the user hears progress before reading it. Nothing can sound sour. | `src/audio/cues.js` 45–115 |
| G3 | A visible meter fills toward the payoff, with notches, and pulses when full. | LOOK §5b.2 |
| G4 | The payoff takes the whole screen and can be skipped: freeze, ring, shockwave, a wave of lights, a title wiped in, the score counting up, elastic stars. It lasts 4.1 s; Daniel called 6.2 s oversized. | LOOK §7, `53f7a26` |
| G5 | Named easings and durations. Continuous things ease; discrete states snap within 90 ms behind a 40 ms flash. | LOOK §6, `src/ui/dom.js` |
| G6 | Hitstop and shake are rationed: hitstop only on goal, final goal and fever (45/110/130 ms, at most 150 ms per second). Shake is translation only, with a ladder capped at 14 px. Ordinary hits get neither. | LOOK §6, `src/fx/forces.js` |
| G7 | One accent number or colour on screen at a time; two is an automatic fail. Everything else is white at 100/88/62/34% alpha. | LOOK §5 |
| G8 | Hot cores go white and the colour lives in the halo. Glow is a hard core plus a soft body, never blur alone. | LOOK §3, `post.js` |
| G9 | Type is light (weight 500 or less), wide-tracked and tabular. Popups merge rather than stack, 12 at most. | LOOK §5, `src/fx/popups.js` |
| G10 | No panels behind text, no drop shadows, no grain, no banding. | LOOK §8–9 |
| G11 | Failure is soft: one soft falling sound, a dimmed screen, one word, instant retry, the board kept. No red, no buzzer, no lecture, no modal. | LOOK §5b.4, `739bfcd` |
| G12 | Effects never cost legibility. The settled result card gets a scrim that lifts contrast to 4.5:1 or better. | `246d882` |
| G13 | Teaches by pointing: a ring and at most four words ("TAP"), with the word budget held by a test. | `src/ui/tutorial.js` |
| G14 | Accessibility reaches the canvas: reduced motion (shake ×0.12, punch ×0.25, hitstop halved, flashes capped), high contrast, live volume, haptics only after a gesture. | `2ea8cbc`, `5c93fea` |
| G15 | Settings do what they say. Tests check the effect, not the stored value. Credits were cut from 700 words to 212. | `5c93fea` |
| G16 | Performance: 60 fps, 8 ms or less per frame on a mid phone, fixed timestep, pooled buffers, particle caps. Runs offline from one file with no CDN. | BAR.md hard requirements |
| G17 | Three channels on every event: word or number, light, sound. Ordinary sound sits about 10 dB under the payoff, and the payoff clears the room first with a short silence before the hit. | `src/audio/mix.js`, cues `fever_blow` |
| G18 | Small random variation on every repeat (±11 cents, length ×0.86–1.14), so nothing loops audibly. | `src/audio/cues.js` |
| G19 | The world is lit: depth behind the play (gradient, horizon, one quiet texture), and bright things bloom or carry halos. No flat single-colour background in a game. | `glamour.md`, drone-defense-glow `rich.js` |
| G20 | Every contact throws particles with physics: sparks that start white and cool to colour, embers, debris with gravity, shockwaves on big hits. Rings alone don't count. | `glamour.md` |

**Do not carry glowdrop's idle motion to other apps.** Glowdrop's background
moves 40–50% of its pixels at rest; that is the game's identity. When the
paintsplash gauntlet chased that number, Daniel rejected it on 2026-09-15
(`paintsplash/LESSONS.md`, first-thirty-seconds):

> Judge motion by what it tells the player, not by the share of pixels that
> change. Keep the screen still while the player thinks; spend motion on the
> shot they chose to fire. A critic's score cannot overrule the owner's design goal.

Also from paintsplash: translate glowdrop's grammar, don't copy its neon. And
when an app already has a material that works (paint, pixels, felt), the
interface is made of that material. Don't bolt on a second one.

## Shared floor (pass or fail, every app)

| # | Rule |
|---|---|
| F1 | Every input gets a visible answer within one frame. |
| F2 | Touch targets are 44px or more; mouse targets 24px or more; no text under 12px. |
| F3 | Text contrast is 4.5:1 or better, including over effects. |
| F4 | The console is clean on every state. |
| F5 | `prefers-reduced-motion` gives a calmer version that keeps the feedback. |
| F6 | No sideways scroll at 360px, and nothing off screen at 844×390. |
| F7 | No layout shift when state arrives (CLS about 0). Nothing moves under a finger. |
| F8 | State survives a re-render and a reload: scroll, focus, drafts, selection, the run in progress. |
| F9 | Discrete states snap; entrances play once; nothing loops unless it asks for an action. |
| F10 | Claims are measured. A fix is proven with a fresh screenshot, and a number with a script. |

## Rubric (1–5, score each axis separately, then check the floor)

**Minimal**
- 1: sign-up or lobby before use; instructions needed.
- 2: two or more taps to start; labels on objects; rule toasts; more than five readouts.
- 3: one tap or a tutorial first; a toolbar or nav bar survives; some pulsing or flicker.
- 4: zero or one tap; the job is readable from the screen; gestures carry the verbs; three readouts or fewer; one or two stray words.
- 5: meets 13 or more of Z1–Z15. Open and use; illegal moves do nothing; nothing twitches; thumb-friendly at 390px.

Caps: a tooltip the app needs, a hamburger or nav bar hiding the main job, or
state lost on repaint limits the score to 3.

**Juice** (judge only at the level `BAR.md` sets)
- 1: flat; no feedback.
- 2: uniform brightness; no sound; a static win modal.
- 3: feedback plus a win celebration, but missing two of: escalating sound, a meter, white cores, rationed shake, a skippable payoff.
- 4: light and sound on every user action, a full payoff, one accent, reduced motion honoured; one or two cheap tells.
- 5: meets 15 or more of G1–G18 that apply, and holds up in a blind A/B against glowdrop.

Caps: a silent contact, two accents, blur-only glow, idle motion on a thinking
screen, or a payoff over 5 s limits it to 3. A flat, unlit world (G19) or
contacts without particles (G20) limits it to 2. A frame-budget breach or
console errors limits it to 2. Failing the before/after test (critics.md)
limits the whole glow up, on both axes, to 2.
