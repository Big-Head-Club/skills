# fal audio production

Read this when generating game audio through fal, recovering a previous job,
or choosing how to turn a generated clip into an in-game asset. Keep the main
skill's event hierarchy and runtime auditions throughout production.

The case notes below come from October–November 2026 work in `spin-tower`.
Endpoint IDs and numerical settings describe those requests, not universal
presets. The MCP workflow was checked on 2026-11-10; the connected tool contract
governs new work.

## Use the current execution contract

1. When the user has not named an exact endpoint, call `recommend_model` with
   the sound or music task, source media, and actual requirements. Keep the
   user's request verbatim in `user_intent` where that field is exposed; write
   the production prompt separately.
2. For a selected result, call its `next_call.tool` with the returned endpoint
   ID, decision ID, and input built from `input_contract`. Follow `next_step`
   for an unresolved result. The selected path already supplies the contract;
   it does not need separate schema, pricing, or account-status checks first.
3. For an exact endpoint chosen without a selected recommendation, inspect its
   current schema. Copy endpoint IDs exactly, including whether they have a
   `fal-ai/` prefix. Fields, duration limits, and formats differ across models.
4. Keep the original job handles and poll an asynchronous job to completion.
   For independent requested variations, use `submit_jobs` and `wait_for_jobs`
   where available. Review a representative result before expanding a family.
5. Follow the completion response's media-presentation instructions. Provide
   the original media URL where the host has no supported viewer or player.

Keep generation within the requested scope. Look up prices when the user asks
about cost or sets a budget. A billing block supplies its own recovery steps;
do not resubmit an existing request as a way to check its status.

Save the raw source, accepted edit, and production recipe in the project's
existing asset workflow. Downloaded media should remain usable even if a hosted
result URL later expires.

## Recover requests instead of reconstructing them

Retain the endpoint, exact input, ordered references where applicable, request
ID, submission key if used, result URL, and subsequent processing decisions.
Retain seeds and model settings when the tool exposes them, without assuming a
seed alone guarantees reproduction.

After a lost response, `get_submission` can recover a job from its original
submission key. `get_job_recipe` can recover retained input and output using
the endpoint and request ID. Preserve the original account-bound response URL
or receipt in the job journal when required for lookup; keep those handles out
of public reports.

History search can be unavailable, and older payloads can be absent. Exact
request IDs and journal keys recovered this project's recipes even when semantic
history search was disabled. Missing input remains unknown: do not invent a
prompt from the output, and do not turn an uncertain submission into a duplicate
paid generation.

## Write for the event's useful material

For a repeated effect, describe its recognizable attack and body before its
texture adjectives. State the event count, onset, decay, and unwanted material
that would make the clip hard to reuse. A dry source leaves space under runtime
control when the game needs that flexibility.

The recovered plasma request to `elevenlabs/sound-effects/v3` used:

> One isolated game SFX, dry electronic sci-fi synth. Tight transient, restrained
> analog grit, compact clean decay. No reverb, music, voices, ambience or repeated
> shots. Start immediately. Rebel plasma cannon firing one bolt: warm chunky
> resonant pew, fast downward pitch bend, a small ragged electrical edge. Scrappy
> salvaged energy weapon, clean readable attack and 0.22 second tail.

Its request used `duration_seconds: 0.5`, `prompt_influence: 0.75`,
`output_format: "mp3_44100_192"`, and `loop: false`. The requested source duration
and intended playable tail were different. The processor still located the
onset and bounded the final cue.

Request ID: `01a1b730-231a-77d1-b88b-d47c715f0f6b`.
Submission key: `rebel-sfx-20261107-9af37c-plasma`.

Use this structure for a similar repeated one-shot. An ambient bed or distant
explosion has different needs; the dry, immediate, compact requirements are
specific to this use.

## Recorded source-to-asset decisions

| Source | Processing and outcome | Transferable decision |
| --- | --- | --- |
| Reel tick and stop, `fal-ai/elevenlabs/sound-effects/v2`, requested at 0.5 seconds | Isolated 35 ms and 130 ms events from longer sources | Select the intended transient; a one-shot prompt can still return multiple transients |
| Generated installation candidate | Rejected; final cue layered the edited latch with authored D5/A5 tones | Keep useful texture and author the exact pitched resolution |
| Combat effects, `elevenlabs/sound-effects/v3` | Trimmed padding, filtered, bounded tails, and matched short-window levels | A source clip needs preparation for its repetition rate |
| XP and credits, `mirelo-ai/sfx2.0/text-to-audio` | Distinct pickup textures; XP gained a quiet synthesized low/mid rise | Repair a missing body without replacing a useful attack |
| Enemy bolt derived from the plasma source | Two semitones lower and filtered darker | Derive related variants when their shared identity is intentional |

The combat processor used a 5 ms RMS envelope to find activity, allowed a small
lead before the detected onset, and applied event-specific tail limits and
fades. It matched each cue's maximum 70 ms RMS against its assigned target,
subject to a −2 dB estimated true-peak ceiling measured with 4× oversampling.
These are reproducible choices for that set, not a loudness standard for games.

The pickup source can also be recovered through
`space-pickup-xp-20261107-d3bf9`; the explosion revision used
`space-explosion-20261107-2fb13`. Preserve the full inputs returned by recovery
alongside the local recipe when continuing those jobs.

## Music: plan the editable passage

The earlier soundtrack request used `elevenlabs/music/v2.5`, request
`01a17e75-876d-7aa0-884f-02f836f4cfc2`, for a 64,000 ms instrumental.
Its brief specified 120 BPM, D minor, a steady 4/4 groove already established
on entry, dry drums and analog bass, restrained variation, and sparse upper
mids for effects. It excluded breakdowns, tempo changes, a final cadence, and
a fade-out because the source needed an editable continuous passage.

The accepted edit selected 16.02–48.02 seconds and blended the following 20 ms
into the head. The decoded export lasted 32 seconds. That edit demonstrates
finding and preparing a suitable phrase; neither those timestamps nor a 20 ms
blend are general loop settings. Repeated listening and decoded-boundary checks
remain necessary for a new performance.

The later menu/run/boss suite used authored composition rendered with Surge XT
1.3.4, rather than fal music generation. It shared G minor and 180 BPM; menu and
run shared a sixteen-bar harmonic clock. Runtime launch preserved their musical
position, while boss entry restarted on an impact. The renderer wrapped delay
tails, and transition auditions used the runtime timing.

This gives two demonstrated production routes. Choose generated material when
an editable performance serves the brief. Choose composition or aligned stems
when exact harmonic and temporal relationships are necessary. Replacing a
source method is justified by that requirement, not by assuming one method
always sounds better.

## Measure accumulation through the real graph

The October intensity pass found that dense effects alone measured 8.1 LU above
the music before adjustment and 2.3 LU below it afterward. Those were controlled
renders through the actual `createAudio` graph, including master gain, reverb,
and compression, at the same volume setting.

The dense schedule requested 12 shots, 60 surviving hits, 30 lethal-hit/death
pairs, and 20 pickups per second. Those were constructed stress inputs, not
observed player event rates. Runtime voice caps, repetition guards, routing,
and gains affected the audible result. Isolated clip headroom had not prevented
the original accumulation problem.

The recorded checks also exercised failed downloads, synthesized fallbacks,
one continuing music source, mute, pause, and visibility behavior. Their technical
results establish playback and measured intensity. The notes explicitly reject
automated audio descriptions as evidence of musical fit or repetition fatigue;
retain listening as a separate acceptance result.

## Evidence and scope

The following source links are pinned to `spin-tower` commit `046cfcb`. The
audition README describes the earlier October system; its use of “current”
does not identify the later November assets.

- [Audio audition and intensity measurements](https://github.com/Big-Head-Club/spin-tower/blob/046cfcbf1e178577d5397b836b7974347b4a551b/public/audio/audition/README.md): original music and reel provenance, rejected installation, and controlled runtime results.
- [Combat preparation](https://github.com/Big-Head-Club/spin-tower/blob/046cfcbf1e178577d5397b836b7974347b4a551b/trailer/sound/combat.py): later source URLs, journal keys, trimming, layering, filtering, and level matching.
- [Composed score](https://github.com/Big-Head-Club/spin-tower/blob/046cfcbf1e178577d5397b836b7974347b4a551b/trailer/sound/battle.py): authored music, synthesis, loop tails, and transition auditions.
- [Runtime audio](https://github.com/Big-Head-Club/spin-tower/blob/046cfcbf1e178577d5397b836b7974347b4a551b/src/game/audio.ts): consumers, routing, repetition, and lifecycle controls.

Exact plasma and soundtrack inputs were recovered read-only from fal request
history on 2026-11-10. Historical reviews and measurements support these case
notes; they are not a new listening evaluation or a model-quality comparison.
