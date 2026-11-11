# Playgama Telemetry

Read this for Playgama Bridge instrumentation and Developer Console MCP analytics.
Before implementing or interpreting data, call `get_game_telemetry_guide` and
inspect the current tool schemas. This reference was checked on 2026-11-11 against
guide version 1.1.2, the connected analytics tools, and the
[Bridge analytics documentation](https://wiki.playgama.com/playgama/bridge-sdk/api/analytics.md).
The live guide and schemas govern when they change.

## Instrument through the existing Bridge

Use the game's initialized Bridge and the API for its installed engine/SDK
version. Preserve required `platform.sendMessage` calls, especially `game_ready`.
Bridge already records matching events for platform messages and supplies SDK,
session, ad, and purchase signals; do not duplicate them through `analytics.send`.

Use stable `snake_case` names for game-specific events, with variable information
in a flat object containing string, number, or boolean values. Prefer bounded
`step_id` or `level_id` values and a numeric `step_index` where order is meaningful.
Emit failed or abandoned outcomes only when the game can observe them. Retain the
Bridge session rather than inventing another `session_id`.

Keep names and categorical dimensions bounded. Exclude personal data, platform
user IDs, free-form text, credentials, exception messages, URLs, and stack traces.
Test the exported web runtime: editor or non-web execution does not establish
delivery, and the documented Unity/Godot editor integrations send no events.

## Performance contract

Use the canonical name `performance_sample`. Measure locally during active,
visible gameplay and emit one aggregate approximately every 30 seconds. Exclude
loading, pause, menus that do not exercise gameplay, and background time. Reset
the frame baseline across excluded intervals; do not count a background gap as a
slow frame or send one event per frame.

Read the current guide for the exact required fields. Version 1.1.2 specifies:

| Measurement | Fields |
| --- | --- |
| Target and coverage | `target_fps`, `window_ms`, `active_ms`, `frame_count` |
| FPS | `fps_avg`, `fps_p10` |
| Frame time | `frame_time_p50_ms`, `frame_time_p95_ms`, `frame_time_p99_ms`, `frame_time_max_ms` |
| Slow-frame counts | `frames_over_50ms`, `frames_over_100ms`, `frames_over_250ms`, `frames_over_500ms`, `frames_over_1000ms` |
| Reliable release identity, when exposed | `game_version` or `build_version` |

`window_ms` is wall-clock window length; `active_ms` is included active, visible
gameplay time. Counts describe the current window, not lifetime totals. Optional
long-task, memory, error-count, or device-tier fields require correct runtime
measurements; use only the fields and meanings defined in the live guide. A device
tier needs a documented reproducible rule, not a guess from a device name.

Keep performance emission behind one game-local adapter. Under the reviewed
contract it uses the existing custom-event API until Bridge exposes its system
events API. Check current support before selecting the transport, preserve the
event name and data contract, and never write the same sample to both namespaces.

## Query in response to a question

Use a game ID obtained from `list_applications`. Begin with a bounded date range
and the overview, then request only the detail that could change the conclusion.
The [MCP tools reference](https://wiki.playgama.com/playgama/mcp/tools.md) describes
the workflow; the connected tools' schemas define the accepted arguments.

| Tool | Appropriate use | Limits that affect interpretation |
| --- | --- | --- |
| `get_game_telemetry_analytics` | Event inventory, volume, sessions, users, duration, freshness | Inclusive calendar dates, at most 31 days; event inventory defaults to 50 types, capped at 100 |
| `get_game_telemetry_event_analytics` | One discovered event's field coverage, types, cardinality, and summaries | Use the discovered event kind/name; omit `fieldName` first, then select one field for its bounded categorical distribution |
| `get_game_telemetry_timeseries` | Counts and coverage over time or around a release | Defaults to daily buckets; 30-minute buckets only when useful; contains no FPS or other custom-field value distributions |
| `get_game_telemetry_session_facts` | Ordered product-event facts, such as reward before defeat or retry afterward | Requires an event, field, session, or user filter; start with 20 sessions; excludes `core_ping` and `performance_sample` |

Follow `events_page.next_cursor` or `page.next_cursor` only while more data is
needed for the current question. Preserve returned limits, coverage, warnings,
freshness, period, and `schema_version`. Inspect dynamic fields by their stated
meaning and unit, leaving unfamiliar fields uninterpreted. Missing or null is
unavailable, not zero. Session facts are sanitized, preaggregated chunks rather
than raw events or a complete player history.

Read `performance_sample` through event analytics. Its summaries provide the
available FPS, frame-time, and stutter evidence for the requested period. A
timeseries of that event shows sample volume and coverage, not an FPS trend.
Session facts cannot supply per-session FPS because they exclude those samples.

The reviewed event-detail schema accepts dates, event kind/name, and an optional
field name; it has no arbitrary build-version, field-value, or cohort filters.
Discovering a `build_version` distribution does not filter other numeric summaries
to that build. Compare separate compatible date windows only when their build
populations can be established; otherwise label them as pooled periods. Do not
invent filter arguments or reconstruct a raw export by exhausting every view.

## Interpret coverage before choosing a fix

Read the number of events alongside the contributing sessions and users. For
performance, inspect the number and coverage of sessions that supplied samples,
missing fields, differing sample counts, and the shares of sessions shorter than
30, 60, and 120 seconds when available. Short sessions may end before sampling.

The performance view is sample-weighted: longer sessions can contribute more
samples. It does not expose a session-level FPS distribution or establish which
product events happened in low-FPS sessions. Do not claim that poor FPS caused,
or even correlated with, the observed early exits from these views alone.

The reviewed guide requires an explicit statement that a performance conclusion
is not yet reliable when fewer than 30 unique sessions contributed samples.
Reaching 30 does not establish causality or guarantee adequate coverage; evaluate
the question, spread, population, and missingness as well. A reproduced code or
runtime defect can still justify a narrow fix while telemetry remains uncertain.

Compare compatible measurement definitions, build populations, traffic sources,
device mix, and completed observation windows. A traffic boost can change who
plays. Distinguish that composition change from an effect of the release.

## Continue the development loop

For an authorized improvement, validate the suspected mechanism in the game,
make and test the narrow change, preserve the event contract, and identify the
new build. Follow the launch workflow and each tool's authorization rules for
publishing or traffic actions; an analytics read does not authorize either.

Reread after relevant traffic has accumulated and aggregates are ready. The guide
suggests at most a daily check when there is no better signal; do not poll in a
tight loop or treat the just-uploaded build's incomplete aggregates as a result.
Telemetry is part of Playgama's development workflow, not a publication gate.
If it cannot be added or verified, report exactly what remains rather than
blocking upload or release on that basis.

## Video evidence

[Find Where Players Quit and Fix It in One Afternoon](https://www.youtube.com/watch?v=tgut1u8w-Ho)
demonstrates instrumentation, traffic, inspection, and another release. Its
description explicitly labels all shown numbers as example data. Use it as a
workflow illustration, not evidence of a measured retention improvement or a
guarantee that a few hours of traffic will answer the question.

The [Bridge Analytics tutorial](https://www.youtube.com/watch?v=11IjPxjoEnc)
illustrates stable event names and data fields. Use the current documentation
and live guide for implementation rather than assuming the video captures the
present API or analytics capabilities.
