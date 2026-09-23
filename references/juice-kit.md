# Juice kit (from glowdrop)

Numbers and recipes from glowdrop's source, for apps whose `BAR.md` sets juice to
medium or full. Read the source for anything not here. The files are all under
`src/` in `Big-Head-Club/glowdrop` (see "Getting the reference repos" in SKILL.md):
- `audio/synth.js`: voices and envelopes;
- `audio/cues.js`: one recipe per event;
- `audio/mix.js`: buses and headroom;
- `audio/audio.js`: unlock and haptics;
- `fx/forces.js`: shake, hitstop, punch, flash;
- `fx/popups.js`;
- `ui/dom.js`: easings;
- `ui/cards.js`: the reward timeline.

The rules behind them are in `LOOK.md` sections 5b, 6, 7 and 9.

Scale all of it down for anything that isn't an arcade game. For a tool, one
checkmark that lands is the whole kit.

This file is about how single events answer. How the world itself is drawn (sky,
bloom, particles, glow) is in `glamour.md`, and a medium or full juice level
needs both.

## Why it works and stays restrained

1. Proportion. Feedback scales with how much the event matters. Ordinary events
   get no shake and no hitstop. The payoff sits about 9 dB above everything
   else and clears the room first.
2. Three channels on each event: a word or number, light, sound.
3. One key and one scale, so nothing sounds wrong and progress climbs.
4. Layered transients: click, pitched body and sub tap all start at the same
   instant, which reads as a physical contact.
5. Small random variation on every repeat, so nothing sounds stamped out.
6. Failure is one soft sound and an instant retry: no red, no shake, no modal.
7. One accent colour. Everything else is white at 100/88/62/34% alpha.
8. Budgets are written down: shake ceiling, hitstop per second, popup count,
   voice count.
9. Reduced motion is built into the primitives. Sound never changes with it.

## Sound (WebAudio, no files)

- **Unlock.** Create the AudioContext with `latencyHint: 'interactive'`. Listen
  for `pointerdown`, `touchstart`, `keydown` and `mousedown` in the capture
  phase, then call `resume()` and remove the listeners. Suspend when the tab is
  hidden. Before unlock, drop cues silently.
- **Envelopes.** Linear attack of 1–6 ms, an exponential fall to 1e-4, then a
  hard 0. Never ramp exponentially to 0.
- **Voices:**
  - bell: FM sine, ratio 3.01 for glassy or 2.01 for softer, about 0.45 s;
  - click: bandpassed noise at 1.8–5.2 kHz, 12–30 ms, which is what makes a
    contact feel physical;
  - sub: sine gliding 120–215 Hz down to 40–60 Hz over 50–90 ms, through tanh;
  - riser: noise plus a saw sweeping upward, peaking at 92% of its length and
    cut in 60 ms;
  - bloom: detuned triangle and saw chord through a filter opening from 700 Hz
    to 11 kHz;
  - tick: 7–9 kHz noise for 40 ms, adding air on top of big hits.
- **Key.** Root MIDI 57 on the lydian pentatonic `[0,2,6,7,9]`. A streak climbs
  one degree per success, starting on the fifth. After 14 steps, stop raising
  pitch and add weight and layers instead.
- **Ordinary hit.** click 0.14 + bell or pluck 0.24 + sub 0.16–0.34 + tick 0.03,
  all at the same time `t`.
- **Anti-fatigue.** Rotate timbre on a cycle of 7. Add ±11 cents of detune,
  length ×0.86–1.14, and click band ×0.82–1.22. The same note repeated within
  90 ms drops 3.5 dB and jumps an octave.
- **UI cues:**
  - move: click 0.07 + bell 0.055;
  - select: two bells 45 ms apart, panned ∓0.25;
  - back: the same pair falling;
  - lock-in: click 3.2 kHz, then a 420 Hz noise thunk 6 ms later, then a short
    upward blip.
- **Success:** three bells 35 ms apart on degrees 0, 2, 4, plus a sub from 170
  to 70 Hz.
- **Soft failure:** two triangle plucks a semitone apart, gain 0.13–0.16. No
  buzzer and no thud, because a thud reads as a verdict.
- **Payoff.** A riser, then 40 ms of silence, then the impact: sub 165 to 31 Hz,
  crashes and three blooms at +0.03, +0.73 and +1.58 s. Duck every other bus by
  13 dB for 3.4 s. The gap before the hit is what makes it land.
- **Mix.** Master 0.9, music 0.75, sfx 1.0. Headroom: sfx −18.5 dB, big −19,
  music −16.5, fever −9.5. The limiter is a safety net, not a mix decision.
- For social or call games, game sound goes only to the local output, stays
  short, and never ducks a friend's voice.

## Motion

- **Easings** (`ui/dom.js`):
  - out: cubic;
  - outQuint: for count-ups, "slams then settles";
  - inOut: cubic;
  - back: s = 1.70158;
  - elastic: for stars.

  `span(t, start, dur, ease)` drives everything from one clock, which gives
  free skipping and free reduced motion.
- **CSS tokens.** fast 0.14 s, base 0.34 s, slow 0.7 s. Each becomes 0.001 s
  under reduced motion. CSS transitions are for hover and press only.
- **Reward timeline** (`ui/cards.js`):
  - the verdict word at 0.12 s, scaling 0.86 to 1 over 0.5 s with back easing;
  - the score counts from 0.55 s over 1.15 s with outQuint;
  - stars start at 1.75 s, 0.42 s apart, each elastic with a flare ring from
    1 to 2.9 scale while fading from alpha 0.8;
  - rows at 3.1 s, 70–100 ms apart;
  - buttons last, at 3.7 s.

  The card waits for the payoff to finish.
- **Press feel.** Scale 0.985 on buttons, 0.978 on the primary, 0.9 on icons.
- **Shake.** A trauma model: callers add trauma, the offset is trauma² over
  three noise streams at 26 Hz, and it decays by 1.9 per second. Translation
  only. Ladder: ordinary hit 0, goal 2.5 px, final goal 6, big moment 11,
  cap 14.
- **Hitstop.** Goal 45 ms, final goal 110, big moment 130. At most 150 ms in
  any rolling second, never on ordinary hits.
- **Zoom punch.** A damped spring `e^(-9t)·cos(38t)` at a few percent.
- **Flash.** 40–120 ms, falling as (1−u)^2.2. Never a long white hold.
- **Popups.** Fade in over 60 ms, scale from 1.25 to 1 over 120 ms, rise over
  620 ms, fade over the last 220 ms. A nearby second popup merges into the first
  and re-punches it. At most 12 on screen.
- **Particles.** 6–14 sparks per contact, living 240–520 ms. Different events
  get different shapes, not the same burst scaled up. Recency wins: each new
  burst dims older ones.
- **Big payoff** (4.1 s, skippable, cross-fades to the final state in 180 ms):
  1. freeze for 130 ms while everything but the hero dims to 35%;
  2. a white ring, then time at 0.25×;
  3. a shockwave, with elements going off in order of distance, so it reads as
     a wave;
  4. the stage clears;
  5. the title wipes in over 240 ms;
  6. the number counts, then stars, then buttons.

## Haptics

Only after the first gesture, and behind a setting. 8 ms for a snap, 10 for a
button, 12 by default, 14 per star, 18 on commit, and `[40,30,90]` for the
payoff. iOS Safari has no `navigator.vibrate`, so treat haptics as an Android
extra.

## Reduced motion

Shake ×0.12, punch ×0.25, hitstop halved, flashes capped at 0.3 alpha and
stretched 1.8×, and words cross-fade. Sound doesn't change.
