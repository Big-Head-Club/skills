---
name: game-audio
description: >
  Produce and integrate game sound effects, music, and ambience from generated,
  synthesized, composed, recorded, or existing sources. Load when creating or
  improving game audio, using fal for sounds or soundtracks, preparing one-shots
  or seamless loops, designing adaptive music and transitions, mixing repeated
  events, or fixing delayed, fatiguing, overlapping, or overpowering cues. Covers
  source selection, editing, layering, loudness, playback budgets, overlapping
  mute states, platform audio constraints, and listening through the actual game
  audio system.
---

# Game Audio

Make sounds communicate the game's actions and sustain the intended atmosphere
under real play. Treat generated clips and recordings as source material;
editing and playback rules determine what the player actually hears.

Inspect the existing assets, audio routing, event producers, and music states.
Preserve the game's audio identity and mechanics unless the brief changes them.
Use game-design when a proposal changes the information or decisions available
to the player. Work through the engine's existing audio and asset facilities.

For fal generation, request recovery, or worked production examples, read
[fal production](references/fal-production.md). Its historical settings explain
specific decisions; select settings for the current brief and tool contract.

## 1. Define the listening situation

Start with the cue's purpose and its competing sounds. Record only what the
change needs in the project's existing production notes or asset manifest:

- Event and meaning: acknowledgment, danger, impact, reward, transition, or bed.
- Expected timing: onset, useful body, tail, and synchronization with animation.
- Frequency: isolated, repeated, simultaneous, sustained, or interruptible.
- Priority: what must remain audible when the scene becomes crowded.
- Character: source material, pitch movement, texture, register, and space.
- Music relationship: key or rhythm where relevant, plus room for other cues.
- Runtime needs: routing, spatialization, variations, loop points, and formats.

Listen to the baseline in an ordinary scene and a demanding one. Choose a
reference for a specific property: a readable impact, sparse arrangement,
transition, or restrained pickup hierarchy. Separate source-file measurements
from the reference game's final mix; unknown playback gains remain unknown.

For example, a rapid-fire weapon needs a recognizable attack that survives
repetition. A rare installation reward can spend more time on a pitched
resolution. Giving both the same loudness and long tail erases that hierarchy.

## 2. Choose the source by the control required

Check the destination's current audio-source and export requirements before
choosing a production method. Keep those constraints alongside the listening
brief; a suitable sound can still be unsuitable for its publishing destination.

| Requirement | Useful starting point |
| --- | --- |
| An existing sound already fits | Reuse it and adjust only the demonstrated mismatch |
| Particular physical texture or performed variation | Recording, library asset, or generated source |
| Exact pitch, envelope, rhythm, or parameter response | Synthesis |
| A musical performance that can be edited into a bed | Generated or existing music |
| Shared harmony, precisely aligned sections, or adaptive arrangements | Authored composition, stems, or synthesis with explicit timing |
| Useful texture but weak timing or body | Edit the source and add a controlled layer |

Retain source provenance and applicable usage terms. Preserve accepted source
files so another processing pass does not require another generation.

For Playgama, read the current
[sound requirements](https://wiki.playgama.com/playgama/game-requirements/user-experience-requirements.md#3.3-sound)
and [sound guide](https://wiki.playgama.com/playgama/guides/game-development/sound.md).
As checked on 2026-11-11, requirement 3.3.2 calls for recorded or audio-tool-produced
sound shipped as compressed OGG/MP3 files and rejects sound synthesized in code,
including procedural Web Audio tones. This is a destination policy, not a general
judgment about synthesis quality. Do not assume exporting code-generated tones
as a compressed file changes their eligibility.

For generated one-shots, describe one event with an onset, body, and decay.
Specify dry sound, immediate onset, or exclusions when the playback situation
requires them. Ambience and distant impacts can legitimately need space and
long tails. Request enough material to edit, then verify the returned event
count and timing rather than trusting the requested duration.

Produce a representative cue or short passage and audition it in context before
expanding the family. Reject a source whose identity or structure is wrong;
processing is useful when the material worth preserving is identifiable.

## 3. Prepare effects for their playback pattern

1. Decode and inspect the source. Locate the intended transient and useful decay;
   generated files may contain leading padding or several events.
2. Trim around that event without cutting its attack. Use short boundary fades
   where needed to avoid clicks; do not soften a deliberate transient away.
3. Bound the tail according to repetition and meaning. Keep useful decay rather
   than treating file duration as the duration of its audible energy.
4. Shape the spectrum and add layers only for an observed need. A quiet body can
   give a thin pickup weight; a separate click can clarify a slow impact.
5. Set relative levels with comparable playback schedules. Short-window RMS or
   energy measurements help compare attacks; integrated loudness is more useful
   for sustained material or a controlled sequence of repeated cues.
6. Export, decode the exported file, and check timing, finite samples, clipping,
   peak headroom, and the format expected by the consumer.

Peak normalization alone does not establish perceived loudness. A sustained
tail and a brief transient with equal peaks occupy the mix differently. Keep
music and effects levels subordinate to the listening hierarchy, rather than
normalizing everything to one target.

Derive related variants through pitch, filtering, or small source changes when
they should sound related. Keep variation bounded so warnings and reward cues
retain their identity. Use distinct material when a different event needs a
different character; pitch-shifting one source cannot supply every role.

## 4. Build loops and transitions together

For a music brief, specify the gameplay role, arrangement density, pulse,
harmonic behavior, entry, and exit. A continuously running bed may need an
established groove and room for effects; a boss arrival may need a deliberate
impact. Describe those requirements before choosing a source.

Find loop boundaries in the actual performance. Check the beat and harmonic
position rather than assuming a requested tempo was followed exactly. Preserve
phrase length and pulse while blending the boundary where needed. When rendering
authored music, wrap or otherwise account for delay and reverb tails.

Listen across several repetitions of the exported, decoded file. Check for a
click, gap, doubled attack, timing drift, or conspicuous harmonic reset. A long
crossfade can hide a discontinuity while creating a rhythmic smear.

Define each transition in terms of the musical clock:

- Preserve position when aligned arrangements should continue the same phrase.
- Quantize to a beat or bar when waiting serves the action.
- Restart on an authored entry when the event needs an immediate impact.
- Set fade timing around the actual relationship between the passages.

Audition the same entry, exit, and interruption timings used by the game.
Crossfading arbitrary sections does not establish harmonic compatibility. Use
existing music-state controls; add stems or synchronization machinery only when
the requested behavior needs them.

## 5. Control accumulation at runtime

Read the event path before changing the asset. One gameplay action can emit
several requests: a fan of projectiles, a lethal hit plus a death, or several
simultaneous pickups. Decide which constitute one audible event.

Choose controls for the observed accumulation:

- Group simultaneous requests representing one action.
- Bound starts over time and concurrent voices where repetition obscures cues.
- Define which sound is kept, skipped, replaced, or faded when a budget is full.
- Protect important warnings and milestones from routine-event saturation.
- Shorten or attenuate accumulating tails and effect sends where appropriate.
- Apply ducking only when the event hierarchy benefits from it; a compressor
  cannot decide which sounds matter.

Keep music and effects independently adjustable under one controller that derives
audibility from all applicable reasons for silence: user mute, platform mute,
platform pause, an open ad, and a hidden page. Each producer changes only its own
reason; clearing one reason cannot clear another. Derive the effective output
from those reasons and the saved volume settings rather than letting callbacks
independently restore the master gain.

Read initial platform audio state before playback, then subscribe to changes;
an event listener alone misses a game loaded while the platform is already muted.
For Playgama this initial value is `platform.isAudioEnabled`. Initialize the other
relevant reasons from their current state as well. Browser audio unlock or context
resume does not override the mute policy.

Exercise pause, backgrounding, resume, scene changes, and teardown through the
engine's documented lifecycle. Apply the destination's gameplay-pause rules
alongside silence during ads and platform pauses. Avoid duplicate music starts
and repeated asset decodes. If the project uses loading fallbacks, verify their
levels and budgets too; bound retries through its existing loading policy.

## 6. Verify playback and listening separately

Use the actual audio routing, including buses, sends, master controls, and
compression. An offline render is useful when it exercises that same graph;
also verify the live loading and lifecycle behavior it cannot reproduce.

Review the scenarios affected by the change:

- An isolated cue, then a representative repeated sequence.
- Ordinary gameplay and a dense scene with music, pickups, impacts, and warnings.
- Music boundaries, transitions, and interruptions.
- Volume, mute, pause, resume, and missing assets where applicable.

Test overlapping silence reasons in both clearing orders. Closing an ad while
user mute remains active, returning to a visible tab while the platform remains
paused, and unmuting while an ad is open must all remain silent. After the final
reason clears, restore the intended volume without a duplicate music start.
Also start and reload with the platform muted to check initialization.

Record whether event schedules were observed in play or constructed as stress
inputs. Use the same schedule and controls for before/after measurements. When
comparing timbre, level-match the audition so louder does not win by default;
then test the intended production gains.

Report technical and listening results independently. Measurements can establish
onset, headroom, overlap, and loop duration. Listening establishes identity,
musical fit, masking, and repetition fatigue. Automated audio descriptions do
not substitute for hearing the result. If listening is unavailable, provide
playable auditions and leave perceptual acceptance unresolved.

Fix the observed failure at its source: edit a delayed onset, change an unclear
texture, or reduce excessive requests. Recheck the affected scenario and stop
when the brief passes.

## Handoff

Keep the handoff in the existing asset record. Include the accepted source and
provenance, reproducible edits, exported file, event route, relevant playback
limits, audition, and separate technical/listening results. Retain rejection
reasons so later work does not revive a failed candidate as an accepted asset.

Where the destination permits synthesis, a quiet puzzle may need only a few
synthesized cues and one restrained confirmation. A dense action game may need
edited samples and strict repetition budgets. An exploration game may need long
spatial textures and careful loop transitions. Let the listening situation choose
the production method and the amount of machinery.
