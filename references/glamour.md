# Glamour: the render layer

A glow up that only cuts text and adds UI feedback fails. On 2026-09-23 Daniel played the Drone Command
glow up after five rounds of cuts, touch fixes and +N popups and said: "this looks almost
indistinguishable … we added no glamor and no juice". After one render pass (sky, bloom, particles) he
called it "the BARE MINIMUM of improvement that i expect from the glowup skill". So this pass is the
floor, not the ceiling.

This file covers how the world is drawn, where `juice-kit.md` covers how single events answer.
Apply both whenever `BAR.md` sets juice to medium or full.

Reference implementation: `references/rich-example.js` in this skill (sky, bloom, particles, about
230 lines of WebGL2), copied from the Drone Command fork. Wire it like this: the renderer takes an
`opts.rich` flag; `begin()` before drawing, `end()` after; a `spray(event)` function maps each game
event to a particle recipe below; particles step on the game clock. Read it before writing your own.

## What "glamour" means (all five, every game)

1. **Depth behind the play.** No flat background colour. A gradient with a horizon, haze or light
   source, and one quiet texture layer (stars, dust, far terrain, a grid in perspective). Static:
   it never moves while the player thinks.
2. **Glow.** Bright things bleed light: a bloom pass (WebGL) or layered soft halos (Canvas/DOM).
   Hot cores are white; the colour lives in the halo (G8).
3. **Particles with physics on every contact.** Not rings alone. Sparks that start white-hot and cool
   to the object's colour, embers that drift and fall, debris with gravity, dust on ground hits,
   a shockwave on big hits. Different events get different shapes.
4. **Moving things leave light.** Heads glow, trails glow, engines shed embers.
5. **The payoff is a light event**, not a text card: the screen brightens, the field answers
   (cities light, a sweep crosses the ground), then the number lands.

A game whose art style is flat or thin-line keeps its palette, shapes and identity. Its flatness is
not a rule. Only the requester's own words can forbid glow.

## Recipes (numbers that worked)

### Sky
- Full-screen triangle before anything else. `t` = 0 at the horizon row, 1 at the top.
- `col = mix(low, top, pow(t, 0.55)) + warm * exp(-7t) * 0.55`. For a dark theme: top ≈ bg × 0.55,
  low ≈ (0.07, 0.10, 0.19), warm ≈ (0.11, 0.06, 0.035).
- Stars: one per 9 px cell with 7% chance, placed at a random point inside the cell (a per-pixel hash
  makes visible rows; don't), brightness 0.35–1 × 0.7, fading out toward the horizon. No twinkle.

### Bloom (WebGL)
- Render the scene into an RGBA8 texture the size of the canvas.
- Bright pass into half size: `c * smoothstep(0.22, 0.75, max(r,g,b))`.
- Separable 9-tap Gaussian (linear-sampled offsets 1.385, 3.231; weights 0.227, 0.316, 0.070):
  H then V at half size; H then V into quarter size; one more H/V at quarter with 2× spread.
- Composite: `scene + half × 0.9 + quarter × 1.25`, then a vignette (`1 − 0.28 × smoothstep(0.45,
  1.05, r)`).
- Plain renderers stay plain: share images, thumbnails and small panels don't need bloom.
- Canvas 2D: draw glow sprites with `globalCompositeOperation = "lighter"` and a pre-rendered radial
  gradient; avoid `shadowBlur` per frame on phones. DOM: `text-shadow`/`box-shadow` in currentColor,
  `mix-blend-mode: screen` for overlays.

### Particles
- One pool, cap about 1600, updated on the **game clock**, so pause and hitstop freeze them and
  replays stay in step. Render-only: the sim never sees them.
- Speeds, gravity and sizes in **screen pixels**, converted to world units by the camera scale, so a
  spray reads the same when the camera zooms out.
- Spark: a streak from `p − v·0.085 s` to `p`, width 1.7× the stroke thinning to half, alpha
  `1 − u³`, white for its first 0.05–0.18 s then the object's colour. Drag 3.5–5 /s, gravity
  150–300 px/s².
- Ember: soft disc (4.5 × size, alpha 0.7) plus a hard core (1.1 × size). Drag 2–2.5, gravity
  ±30–160 px/s² (negative rises, for fire and magic).
- Recipes per event (speeds px/s):
  - ordinary kill: 12 sparks 140–380 + 4 embers 30–110 in the object's colour; big kill ×1.8.
  - chain: 16 white sparks 260–520.
  - ground hit: 14 debris sparks upward cone (±1.1 rad) 120–320, gravity 900, plus rising embers.
  - structure hit: 16 debris (gravity 700) + 10 rising embers; destroyed: 30 debris + 22 embers.
  - player's big move (strike, bomb, combo): 44 sparks 260–720 white for 0.18 s, 18 embers, a
    shockwave ring to 2.4 r over 0.45 s, a white core disc 0.25 s, and a 70 ms hitstop.
  - placing or building: 16 rising embers + 12 upward sparks in the piece's colour.
  - moving heads: 55% chance per frame of one ember shed backwards, life 0.2–0.45 s.
- Glow halos: heads 3.4 × size at alpha 0.32, units 2.4 × at 0.16, structures a faint wide disc at
  0.07 that brightens when hit.

### Performance
- Budget on a mid phone: 60 fps, ≤ 8 ms per frame. Bloom at half and quarter size costs about 7
  full-screen passes; if a phone stutters, drop to quarter-only or skip the 2× pass first.
- Say plainly in the report that phone frame rate was not measured when it wasn't.

## Past the floor (aim here)

The five items above are the minimum. A glow up worth showing reaches for these too, picking what fits
the game:

- **Impact light.** A blast lights the ground and structures under it for a moment (an additive glow
  laid on the terrain line and the buildings), so the world reacts, not just the sky.
- **Heat on trails.** Hot at the head, cooling along the tail (white to colour to dim), so speed and
  danger read without words.
- **The payoff lights the whole field.** On a wave clear or level win: cities or goals light one by
  one, a sweep runs along the ground, the stars brighten for a beat, the count lands last.
- **Atmosphere with the camera.** Far parallax ridges or cloud bands that move only when the camera
  moves (never idle), and haze that thickens toward the horizon.
- **Smoke and dust that darken.** A second, alpha-over particle pass (not additive) for smoke, so
  big hits leave a brief dark plume against the glow.
- **Grading per moment.** A slightly cooler, tenser grade during an attack, warmer on a clear, a
  desaturated beat on failure; changes ease over about 0.5 s.
- **One rationed screen effect** on the biggest hit only: a 60–120 ms chromatic split or radial
  shock distortion, off under reduced motion.
- **Sound that matches the light:** the biggest light event is also the loudest, with the silence
  before it (`juice-kit.md`).

By the last round, the gameplay frame should win or tie the blind A/B against the outside reference,
not only beat r0.

## Checks

- **The indistinguishable test** (critics.md): a fresh critic sees r0 and the newest round of the same
  state, blind. They must pick the newer one at a glance and call it clearly richer. "Almost the same"
  is a P1 that blocks the stop rule.
- `imgstats.mjs` on the key gameplay frame, r0 against now: top-1% brightness and colourfulness must
  rise, and near-black share must fall, unless the requester asked for a darker look.
- Frame-step the player's big move at 1/30 s with the page's debug hook and look at every frame: sparks
  must read as streaks, not dashes; the core must be white; nothing may stay white-hot past 0.3 s.
