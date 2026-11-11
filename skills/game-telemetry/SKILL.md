---
name: game-telemetry
description: >
  Instrument and interpret game telemetry to investigate progression, failure,
  early exits, retention, and runtime performance. Load when adding analytics or
  funnels, asking where players quit, reading Playgama analytics, comparing
  releases, or choosing an improvement from player data. Covers event contracts,
  performance sampling, denominators, coverage, cohort compatibility, hypothesis
  validation, and remeasurement after a narrow change. Includes a Playgama Bridge
  and MCP reference; the core workflow is provider-neutral.
---

# Game Telemetry

Use player evidence to choose an investigation, validate a mechanism in the game,
and measure the effect of a bounded change. A drop-off identifies where progress
stops being observed; its cause still needs investigation.

Inspect the actual core loop, progression, failure states, existing telemetry,
and performance target before adding events or interpreting counts. Reuse the
initialized analytics integration and its session model. Read the documentation
for the installed SDK and the live query contract before relying on either.

For Playgama instrumentation or analytics, read
[Playgama telemetry](references/playgama.md) and fetch the current telemetry guide.
Use game-design when a proposed change affects player decisions, balance, or
progression, and the engine's own tooling for implementation and profiling.

## 1. Define the question and denominator

Choose a question that can change the next development action: whether players
reach the first meaningful decision, retry after a defeat, finish a particular
section, or encounter sustained frame-time problems during active play.

Define the measure before collecting or comparing it:

- Entity: attempt, session, player, or performance sample.
- Eligible population: who could reach the step or experience the behavior.
- Outcome and denominator: what counts as completion, failure, retry, or return.
- Observation window: dates, time basis, and enough follow-up for the outcome.
- Build and event definitions, including any changes between periods.
- Relevant traffic source, device group, and coverage when available.
- Desired direction and the companion measure that must not deteriorate.

Repeated attempts make event counts differ from session or player counts. A
completion count divided by start count is not a player conversion rate unless
the data actually establishes that relationship. For return retention, define
the eligible starting cohort and return window; exclude or label cohorts that
have not yet had time to return.

Match the question to the available query surface. A field in an event does not
guarantee that the analytics service can filter by it, join it to another event,
or compute a cohort distribution. State an unavailable comparison explicitly.

## 2. Instrument meaningful state transitions

Start with the smallest event set that exposes the relevant part of the loop:
step started, completed, and failed or abandoned when that outcome is observable.
Add milestones, rewards, or retries only when they answer the chosen question.

For each event, record its authoritative producer, emission condition, fields,
units, and allowed categorical values in the project's existing event record.
Emit when the game commits the transition, rather than whenever its UI renders.
Use stable semantic names such as `progression_started`; place the bounded step
identity and numeric position in data. Reuse automatic platform events instead
of emitting a second copy.

Count a failure when the game observes a failure. Count an abandonment when an
observable action ends the attempt, such as returning to the menu. A missing
completion event can also mean an unfinished session, lost delivery, a crash, or
missing instrumentation; it does not identify a particular outcome by itself.

Keep categorical vocabularies bounded and collect only fields needed for the
question. Do not send personal data, free-form player text, authentication
material, full URLs, stack traces, or a new custom player/session identifier.
Use the provider's existing identity and session contract.

Verify representative start, completion, failure, retry, and interruption paths
in the exported runtime. Check that one transition emits once, required fields
retain their types and units, and scene re-entry does not add duplicate listeners.
Distinguish local emission, transport acceptance, and appearance in aggregates;
one does not establish all three.

## 3. Measure performance during active play

Aggregate frame measurements locally over bounded windows and send summaries at
the provider's documented cadence. Exclude loading, pause, inactive menus, and
hidden-page time; reset the frame-timing baseline across those gaps so a resumed
tab does not create a fictitious frozen frame. Do not send an event per frame.

Include the intended FPS target, measurement duration, active time, frame count,
and supported frame-time/FPS distributions. Use window-local counts for stutters
or errors. Add memory or device classifications only when the runtime can measure
them correctly. Preserve a reliable build version with the measurement.

Inspect distributions and their contributing population. A stable mean can hide
rare long stalls. A percentile of per-window percentiles is not the percentile
of all frames, and long sessions can contribute more windows than short sessions.
State the aggregation unit and coverage rather than describing every summary as
a player or session distribution. Early exits before the first sample can leave
the shortest sessions unmeasured.

Use real-time profiling to reproduce a suspected performance mechanism. Smooth
offline footage, a configured FPS target, or a missing performance sample cannot
establish healthy real-time performance.

## 4. Read the smallest useful evidence set

Start with the provider's overview: event inventory, sessions, players, dates,
duration, coverage, and freshness. Inspect its schema version and warnings. Then
select the event, distribution, time series, or sequence view needed for the
question instead of exporting everything.

Preserve the returned units, sample sizes, limits, and pagination scope. Treat
missing or null values as unavailable. A partial page of selected sessions can
illustrate a sequence without representing the whole population. Check whether
a breakdown is exhaustive or contains an unlisted remainder.

For a release comparison, establish compatible definitions, build populations,
traffic sources, device mix, and mature observation windows. New promotional or
boosted traffic can change the population. If builds overlap and the query cannot
separate them, report the pooled period rather than labelling it a build-specific
result. A before/after association alone does not establish causality.

Separate the evidence from its interpretation. For example, an observed drop in
section completion motivates checking controls, camera behavior, difficulty, or
performance. It does not select one of those explanations without further evidence.
Do not claim that low-FPS sessions are the sessions quitting unless the available
data actually supports that linkage.

## 5. Validate a mechanism and make a narrow change

State a testable explanation and the observation that would contradict it. Inspect
the relevant code and reproduce the affected path with representative inputs,
state, viewport, or hardware. Use instrumentation or a bounded playtest to resolve
the specific uncertainty.

Within an authorized improvement task, choose and implement the smallest change
that addresses the validated mechanism. Preserve the game's intent: investigate
rendering or allocation costs before reducing content, and localize a progression
change to the implicated step. Ask about unresolved product decisions rather than
making the developer choose an internal optimization technique.

A request to read statistics authorizes analysis, not changes to the game. Follow
the existing authorization for deployment and the destination's publishing rules.
Low telemetry coverage does not prevent fixing a separately reproduced defect;
report that engineering evidence without claiming a population-level result.

## 6. Remeasure the changed build

Verify the affected behavior locally, assign a new build version, and preserve
the measurement contract. If an event's meaning must change, record the change
and do not silently compare incompatible definitions.

After enough relevant traffic and follow-up time, compare the original measure
and its companion measure under compatible conditions. Let the outcome determine
whether to retain, revise, or revert the change. Report insufficient coverage or
an immature window as unresolved; shipping a fix is not evidence that retention
or performance improved. Use the provider's freshness information to choose when
to read again rather than polling incomplete aggregates.

## Handoff

Keep a compact record in the project's existing development notes:

1. Question, metric definition, build, and observation window.
2. Observed values with denominators, coverage, and source/query scope.
3. Hypothesis, reproduction evidence, and remaining uncertainty.
4. Narrow change and verification, or the next measurement needed.
5. Post-change result when available; otherwise the remeasurement conditions.

Keep tutorial examples, local stress tests, real-player observations, and measured
release effects identifiable as different evidence. Never present illustrative
video numbers as the game's results.
