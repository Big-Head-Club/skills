---
name: game-presentation
description: >
  Make games and interactive experiences look like authored games rather than
  conventional websites or dashboards. Load when creating or improving game
  screens, boards, HUDs, menus, inventories, rewards, visual effects, or their
  asset/rendering pipeline; especially for requests to make something more
  game-like, less web-like, visually cohesive, or production-ready. Covers
  composition, art vocabulary, asset sourcing and preprocessing, generated-3D
  preparation, materials, rendering, and visual state changes. Complements
  game-design and game-art-assets.
---

# Game Presentation

Create a coherent visual world across the playable scene, interface, assets,
and effects. Make its character apparent in a still frame, then reinforce it
through motion and interaction.

“Game-like” is a target established by the brief and relevant game references,
not a universal collection of bevels, particles, textures, or elaborate fonts.
A flat typographic puzzle can be fully realized game presentation.

Own presentation decisions. Preserve the intended mechanics and content unless
the user requests changes. Use game-design when a presentation proposal would
change player decisions or rules. Use game-art-assets for asset production and
image-art-direction before generating or editing imagery.

## 1. Establish the visual target

Inspect the actual screens, assets, styles, and renderer before proposing work.
Identify what already establishes the game's visual identity.

For a new direction, choose a small set of relevant game references. Describe
the properties being borrowed: composition, proportions, silhouettes, edge
treatment, lighting, typography, detail density, or motion. Theme alone is not
a useful reference.

Define the presentation change in concrete terms:

- Weak: “Make the interface polished and game-y.”
- Strong: “Make the board dominate the screen, give pieces distinct silhouettes,
  unify their outlines with the controls, and move secondary readouts into
  compact perimeter instruments.”

Name the affected surfaces and asset families. Do not turn a local presentation
task into an engine rewrite or complete visual redesign.

## 2. Compose the game, then its supporting interface

Identify the screen's visual subject: board, hand, formation, character,
inventory, environment, playable object, or choice.

Make its relationships legible. Position, grouping, scale, overlap, and spacing
should communicate the activity or selection being presented.

- Give the primary subject enough area and contrast.
- Place immediate state near its relevant object where practical.
- Put persistent orientation information in stable supporting positions.
- Let interruption and decision states establish their own hierarchy.
- Preserve recognizable object identity across play, selection, ownership,
  upgrades, and results.
- Keep menus in the same visual language, while allowing a different layout.
- Recompose for narrow screens rather than merely shrinking the desktop frame.

A decorative background behind generic application panels does not establish
a game composition. Cards remain appropriate when they are the game's objects
or genuinely support its decisions.

Preserve the information and actions needed to use the screen. Removing them
is not evidence of improved presentation.

## 3. Define a shared art vocabulary

Specify only the rules needed for the work:

- Shape: proportions, silhouettes, corner and contour treatment.
- Edges: outline weight, contrast, antialiasing, and separation.
- Surfaces: flat graphic, painted, printed, carved, soft, metallic, or another
  coherent treatment.
- Light: direction, highlights, shadows, and emissive behavior where applicable.
- Color: background, bodies, affordances, selection, danger, and reward.
- Detail: where texture and fine structure belong, and where they must recede.
- Type: display labels, readable explanations, and stable numeric readouts.
- Motion: how objects press, settle, slide, strike, unfold, or disappear.

Apply these rules across scene art, symbols, controls, panels, and effects.
Different rendering technologies must still appear to belong together.

Use surface effects to explain construction. A highlight can describe a raised
edge; an inset shadow can describe a recess. Decorative depth without a coherent
construction model adds noise.

Flat styles need equally deliberate rules for shape, negative space, borders,
color blocks, and state changes. Do not add dimensionality against the brief.

## 4. Treat source assets as material

Choose the source method by the visual requirement:

- Reuse compatible existing artwork.
- Kitbash modular parts when shared construction supports distinct silhouettes.
- Author SVG or geometry for exact symbols and scalable graphic forms.
- Use illustration or reference-led generation when the subject needs authored
  visual detail.
- Use procedural construction where repetition, variation, or geometry makes it
  appropriate.

Do not default to generic icon-library glyphs for identity-bearing game objects.
Do not generate or redraw assets that already meet the visual target.

Before transforming an asset family, establish its consumer contract:

- Intended on-screen size and required zoom range.
- Aspect ratio, pivot, bounds, padding, and alignment.
- Required palettes, states, rotations, and lighting behavior.
- Which properties are artwork and which are numerical material data.
- Renderer expectations for alpha, color space, filtering, and packing.

Inspect the source against this contract. Unchanged reuse is a valid outcome.

For generated or illustrated state families that need stable pivots, attachments,
recoloring, or runtime lighting, read
[Registered, relightable assets](references/relightable-assets.md). It covers
reference roles, shared framing, controlled repairs, channel processing, and
separate technical and visual acceptance.

For generated 3D models that need movable parts, usable pivots, or texture and
material cleanup, read [Generated 3D assets](references/generated-3d-assets.md).
It covers neutral source poses, preserved masters, segmentation correspondence,
and validation in the actual renderer.

## 5. Preprocess for presentation, selectively

Preprocessing is an art-direction tool, not just file optimization. Apply only
the operations needed by the asset contract.

| Observed need | Suitable operation |
|---|---|
| Compatible pieces need a new identity | Compose parts using controlled placement, rotation, mirroring, and uniform scale |
| Scale or alignment differs across a set | Normalize canvas, pivots, bounds, or optical size without stretching |
| Fine detail disappears or creates noise | Simplify or downsample for actual display size |
| Background detail competes with moving foreground | Remove competing high-frequency detail while retaining useful broad structure |
| Runtime color changes must preserve neutral regions | Derive a paint/recolor mask |
| Stable surface construction needs richer appearance | Bake compatible shading, bevels, contact detail, or contour information |
| Appearance changes with state or lighting | Preserve the masks or material information needed at runtime |
| Renderer or workload benefits from packing | Use its existing atlas pipeline with appropriate gutters and metadata |

Do not run every asset through every stage.

### Bake only what remains valid

“Static” is not enough. Check the required transforms and views.

- Directional shading baked into a rotating sprite rotates with that sprite.
  Use that only when it matches the art direction.
- When lighting must remain scene-relative, retain suitable material information
  and compute the changing response at runtime.
- Detail appropriate to a large preview may fail at gameplay size.
- Mirroring may reverse lighting, markings, or asymmetry that should be preserved.

A useful pattern is to separate shape and surface information from final color.
For example, a prepared atlas can encode contour distance, baked surface light,
paint regions, emission, and coverage. Runtime shading then unifies coloration,
outlines, and state effects.

Use this pattern when those controls are needed; ordinary sprites and vectors
remain valid finished assets.

### Preserve data meaning

Numerical texture channels are not ordinary color artwork. Account for color
conversion, premultiplication, filtering, compression, and mip generation so
the renderer receives the intended values.

Keep originals and the reproducible transformation recipe. Prefer the project's
existing tools or a small purpose-built processor over a new asset framework.

## 6. Choose rendering by requirement

Use the existing renderer when it supports the intended result.

- DOM/CSS: semantic controls, text, menus, and many board or card interfaces.
- SVG: exact shapes, scalable symbols, diagrams, and modest object counts.
- Canvas 2D: sprite composition and drawing workloads suited to it.
- GPU rendering: workloads or effects that benefit from batching, shaders,
  material processing, or extensive compositing.

Escalate only for a demonstrated visual or workload requirement. A custom
renderer is not a prerequisite for game-like presentation.

For hybrid scenes, define shared coordinates, scale, clipping, and input bounds.
Rendered objects and their interactive regions must stay aligned across resize,
zoom, and layout changes.

Separate persistent bodies, readable information, and transient effects.
Keep silhouettes intact under overlapping effects. If using bloom, define what
emits light and what occludes it rather than washing the entire image.

Move stable expensive work into preprocessing where appropriate. Retain runtime
control over properties that genuinely vary.

## 7. Author visible states and consequences

Give important objects and controls distinguishable states. Choose differences
appropriate to the art vocabulary: position, shape, fill, border, illumination,
pose, or surrounding marks.

For a consequential action, specify:

- Immediate acknowledgment.
- Visible consequence and its location.
- Intensity relative to other events.
- Duration, overlap, and persistent state afterward.
- Interruption, skip, and reduced-motion behavior where relevant.

Use motion to express the object's apparent behavior and the event's meaning.
Do not use a universal bounce or particle burst as a substitute for state design.

Keep outcome authority separate from presentation. A reveal should present a
decided result, not accidentally resolve it again.

Preserve semantic controls, focus behavior, readable text, and deliberate input
handoff. Visual character does not require abandoning standard interaction
reliability.

## 8. Prove a representative slice before expanding

Build the smallest representative slice that can establish the approach:
usually a real screen containing a signature asset, a control family, and one
meaningful state change. For a narrower task, prove only the changed surface.

Inspect it before producing the complete asset set.

Compare revisions using the same content, state, viewport, and information
density. Judge against the visual target and relevant game references.

Check:

1. Composition: the play or selection structure is visually apparent.
2. Coherence: assets, controls, typography, and effects share an intentional
   visual language.
3. Readability: important silhouettes, states, labels, and choices survive at
   actual display size and representative backgrounds.
4. Integration: alpha edges, pivots, filtering, palettes, and required transforms
   behave correctly.
5. Responsiveness: narrow layouts retain discoverable, reachable choices and
   aligned hit areas. Scrolling is acceptable when its availability is clear.
6. Motion: effects explain events without obscuring persistent state; reduced
   motion preserves meaning.
7. Runtime: representative activity meets the project's performance target.

Use evidence suited to each claim. Screenshots and video establish appearance
and visual readability; state inspection and input-driven checks establish
behavior; real-time profiling on target hardware establishes runtime performance.
Record whether footage used wall-clock play or fixed simulation steps captured
one frame at a time. Offline capture can look smooth even when each frame takes
too long to render interactively, so its playback FPS is not a runtime benchmark.
Use game-telemetry when the question concerns actual-player progression or
performance distributions rather than the captured slice alone.

Do not remove labels or theme-specific artwork to decide whether a game looks
like a game. Those may be essential parts of its visual language.

Perform a bounded review of representative states, fix observed defects, and
stop when the agreed target passes. Broaden work only when new evidence requires
it. Distinguish inspected results from untested assumptions.

## Contrasting applications

- Typographic puzzle: live text, deliberate board geometry, occupied-state
  contrast, and crisp transitions. Asset baking or an atlas may add nothing.
- Illustrated tabletop: normalized cutouts, consistent anchors and edges,
  restrained surface shadows, and reusable object identities across play and
  selection.
- Dense action scene: prepared material assets, batched sprites, quiet background
  structure, strong silhouettes, and event-driven effects with controlled
  compositing.

These are different implementations of the same principle:

Art direction must survive the entire path from source assets through rendering
to the actual screen the player uses.
