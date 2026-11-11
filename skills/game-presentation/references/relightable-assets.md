# Registered, relightable assets

Read this when illustrated or generated sprite families must retain stable
pivots, attachments, recoloring, or scene-relative lighting across states.
Establish those consumer requirements before generating the family. Keep only
the material channels the existing renderer needs.

## Establish the mechanical frame

Record the view, native display size, canvas, pivot, occupied bounds, padding,
attachment landmarks, and required states. Decide which parts move independently.
A traversing gun needs an assembly with a stable socket; painting it into every
hull image makes independent motion harder to preserve.

For state swaps intended to remain registered, reserve room for the largest
state while keeping the base chassis at a shared scale. Damage, growth, or
equipment should not make the hull shrink because each image was fitted to its
own bounding box.

Choose landmarks on structure that must persist, such as a deck, collar, or
socket. Compare them in overlays after every edit. Correct framing with a shared
transform where possible; return a structurally distorted candidate for repair
rather than stretching it to make the bounding boxes match.

## Give references distinct roles

| Role | What it governs |
| --- | --- |
| Identity | Silhouette, proportions, and recognizable landmarks |
| Construction | Planes, overlaps, recesses, sockets, and independent parts |
| Ink | Stroke weight, pressure, contour hierarchy, seams, and selected blacks |
| Palette | Local pigment and material relationships |
| Finish | Surface treatment and how much lighting is already painted |
| Previous accepted state | Continuity of the particular asset being edited |

Name each supplied reference's role in the prompt and preserve its order in the
recipe. State which reference governs when they conflict. Supply references
that demonstrate the requested property; a heavily shaded style reference can
bring its lighting into a supposedly flat asset.

Distinguish local color, ink, and stable contact accents from directional
illumination. Describe which of them belong in the source and which the renderer
will supply. For a flat finish, prefer a compatible flat-color benchmark over
repeatedly asking the model to disregard the shadows in its examples.

Retain the approved drawing and line character. In a brush-pen style, uniform
vector borders or aggressive color quantization can destroy the feature the
reference was meant to preserve. Other styles have different edge requirements;
derive them from the actual benchmark.

## Prove a state family before multiplying it

Start with a representative asset and its most demanding state or attachment.
Inspect the assembly at gameplay size and under the intended lighting. Resolve
framing, line treatment, and material ownership before generating a whole roster.

Use the accepted clean asset and, where useful, the accepted preceding state as
references for later edits. Check every stage against the original landmarks as
well as its immediate parent; incremental drift can accumulate across a chain.

Preserve an accepted parent's files. Record the generation input, reference
roles and order, source identity, processing transform, selected output, and
rejection reason in the existing asset recipe. A successful tool response only
establishes that a candidate exists.

## Make narrow repairs actually narrow

Image edits can alter unrelated pixels even when the prompt asks to preserve
them. Define the repair region in the parent's coordinate system, align the
candidate, and composite only the intended change into the preserved parent.
Include any feathered edge in the declared repair support. Verify pixel equality
outside that support and inspect the join visually.

Composite exact insignia, lettering, and other canonical marks from their
approved source when pixel or geometric fidelity matters. Regenerating them in
each variant introduces unnecessary identity changes.

Avoid broad palette flattening to remove a local shading defect. It can erase
fine ink, merge distinct surfaces, and add noise at antialiased boundaries.
Preserve useful generated color and repair the affected shading region or
request a targeted de-shading edit, then review its collateral changes.

## Separate material meaning

Define each channel in terms of its consumer before packing it. Possible fields
include:

- Albedo: local color and the ink treatment chosen by the style.
- Coverage: the actual visible shape, including legitimate new protrusions.
- Paint masks: regions eligible for palette, ownership, or rank changes.
- Contact or occlusion: stable relationships that remain valid as the object moves.
- Normals: constructed surface directions used for relighting.
- Emission: the parts that generate light, with intensity kept controllable.
- Phase or direction: data for travelling circuits or other animated materials.

These are semantic roles, not a prescribed RGBA layout. Ordinary sprites remain
appropriate when the game does not need independent controls.

Build normals from the intended planes, bevels, recesses, or authored geometric
guides. Image brightness mixes pigment, ink, painted light, and shape; treating
it directly as height can turn pale paint into a bulge and black ink into a cut.
Check that geometry guides still match the accepted generated construction.

Similarly, classify emitting parts by their role rather than by saturation or
brightness alone. A crimson panel can remain dark under low light while an
adjacent circuit emits. Recolor masks should preserve ink and neutral hardware
where the brief requires them.

## Extract and filter for the real consumer

Extract coverage from the accepted image. A construction guide can anchor the
frame without defining every final silhouette pixel; using it as a hard cutout
can amputate generated growth or attachments.

For a paper-background source, distinguish exterior paper from pale paint and
enclosed holes. Edge-connected removal helps protect enclosed paint, but it does
not decide whether an enclosed light region is a hole. Inspect those regions
and repair narrowly. Check edge contamination against both light and dark
backgrounds before packing.

Filter according to the meaning of the data:

- Decode color to linear light, filter premultiplied color and coverage, then
  encode for the renderer's expected alpha and color-space convention. Remove
  background contamination rather than carrying a pale fringe into the atlas.
- Decode normal vectors, filter with appropriate coverage, and renormalize them.
  Treat them as numerical data rather than color-managed artwork.
- Preserve discrete IDs as categories. Average mask coverage only when the
  consumer expects weights; interpolated identifiers do not become valid IDs.
- Average cyclic phase through sine/cosine components so values around the wrap
  remain neighbors. Ordinary averaging can create a false opposite phase.
- Match gutters and mip generation to the existing atlas layout and required
  sampling range. Check that neighboring cells cannot bleed into the asset.

Review the exported sizes and mip levels actually used in play. A clean large
preview can still lose its seams, produce halos, or collapse into noise when
rotated or reduced.

## Track technical and visual acceptance independently

Technical checks cover files, channel interpretation, coverage, registration,
sockets, atlas completeness, decoding, and actual consumer selection. Visual
review covers construction, line character, palette, silhouette, state
progression, and readability in the real scene.

Capture the normal game path as well as any proof scene. Show the changed asset
at its real size, on representative backgrounds, through relevant rotations,
lights, recolors, and state swaps. Check independently moving assemblies in the
assembled object. Include important UI consumers when they share the assets.

Keep a visually rejected asset marked as rejected even if it packs and renders
correctly. Complete atlas coverage is a technical result; a whole-fleet artistic
acceptance claim needs review of the corresponding assets. Report exactly which
family and conditions were inspected.

Two useful review tasks:

- **Four damage states under a moving light:** the chassis and sockets remain
  registered, state changes stay legible, and pigment, normals, and emission
  respond independently.
- **Repair one defective panel:** pixels outside the declared repair support
  remain identical, the join survives native-size inspection, and the original
  accepted parent remains recoverable.

## Production evidence

These techniques were extracted from the `spin-tower` fleet work, including
reference-led edits through `google/nano-banana-2.1/edit`. Early recipes used
1K PNG outputs and high thinking; later work also used medium thinking. The
records do not establish a quality advantage for either setting.
Use the current tool contract and a representative visual proof for a new job.

Sources pinned to commit `046cfcb`:

- [Flat-color recipe](https://github.com/Big-Head-Club/spin-tower/blob/046cfcbf1e178577d5397b836b7974347b4a551b/analysis/fleet-fal-flat/recipe.json): five approved variants, shading contamination, and the rejected palette-flattening approach.
- [Registered-state recipe](https://github.com/Big-Head-Club/spin-tower/blob/046cfcbf1e178577d5397b836b7974347b4a551b/analysis/fleet-fal-pairs/recipe.json): shared framing, sequential edits, selective compositing, and canonical markings.
- [Channel processor](https://github.com/Big-Head-Club/spin-tower/blob/046cfcbf1e178577d5397b836b7974347b4a551b/analysis/fleet-production/process.py): coverage extraction, registration, color filtering, normals, and cyclic phase.

The case's brush-pen finish and infection stages are examples. Apply the
registration, material, and acceptance principles to the requested art direction.
