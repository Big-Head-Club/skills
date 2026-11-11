# Generated 3D Assets

Use this reference when a generated model must become an articulated, textured
runtime asset. Preserve the best source geometry and surface detail while making
the parts behave correctly in the game.

## Define the mechanical and visual contract

Inspect the intended camera distance, silhouette, scale, moving parts, attachment
points, and lighting. Choose a mechanically useful source pose: straight wheels
for a vehicle, aligned hinges for a prop, or the rig's required neutral pose for
a character. A dramatic source image can bake steering, asymmetry, or perspective
distortion into geometry that later has to move.

Specify triangle, texture-memory, material, and draw-call budgets against the
actual scene and target hardware. A generator's polygon setting addresses only
one part of that workload. Prove one representative asset before generating the
whole family.

## Preserve masters before splitting or simplifying

Keep the original unsplit model, its full-resolution textures, and the generated
split or segmented exports. Record their provenance and settings in the existing
asset record. Treat simplification, segmentation, rebaking, and runtime exports
as derived artifacts.

Compare the outputs at the intended display size. Segmentation may produce useful
part boundaries while reducing texture resolution or multiplying material slots.
Baking already blurred textures into a larger atlas cannot restore their missing
detail. Recover from the preserved master when it contains the information the
runtime asset needs.

## Use segmentation as part information

When the segmented export has useful labels but worse surfaces:

1. Compare its geometry, transforms, and topology with the textured master.
   Establish face correspondence before transferring labels. Shared origin or
   a similar silhouette does not prove shared triangle indices.
2. Use the segment assignments to select the relevant faces in the master.
   If an export was remeshed or reordered, establish and inspect a valid mapping
   or select the parts in the master directly; do not apply indices blindly.
3. Extract the required moving parts while preserving the master's UVs, normals,
   material assignments, and texture references. Check boundary faces and seams
   for missing or duplicated geometry.
4. Retain compatible shared materials and textures. Consolidate only where the
   surfaces share the same rendering requirements; preserve meaningful material
   differences such as transparency or emission.
5. Set origins and axes to match the motion. A wheel should spin about its axle,
   rather than orbiting an arbitrary segment center. Check steering and spin
   together, including parent transforms.
6. Normalize units, orientation, and scale through the project's existing import
   pipeline, then verify attachments and collision alignment after reimport.

This preserves source quality only when the selected geometry and its texture
mapping remain valid. If the master is missing, document the quality ceiling or
produce a replacement source; a larger output texture is not evidence of repair.

## Validate the exported asset in the game

Inspect the runtime export under representative camera angles and lighting,
including movement through its full intended range. Check silhouette, seams,
UVs, normal direction, texture filtering, pivots, and collisions where relevant.

Measure draw calls, material switches, geometry cost, and texture memory in the
actual renderer. Fewer meshes or a shared texture may help, but neither proves a
particular draw-call count. Compare the same scene before and after preparation
and retain the source-to-export recipe with the accepted asset.

## Documented case: Sky Shift

Playgama's [Sky Shift article](https://playgama.com/blog/main/how-to-make-a-game-with-ai/)
and [companion video, from 2:24](https://www.youtube.com/watch?v=KGID1fQxtxM&t=144s)
describe a generated car whose segmented output contained 55 meshes with 55
mostly tiny textures. Rebaking those textures did not recover the original
detail. Their script used the segmented model to identify wheel triangles, then
extracted the body and four wheels from the original unsplit model, retaining
one shared 2048-pixel texture and placing the wheel origins on their axles.

The second car lacked an unsplit master and remained softer after cleanup. That
failure makes preserving the master part of the production method, rather than
an archival afterthought. The article's 5,000-triangle setting and texture sizes
are case choices, not universal budgets, and the documented visual recovery does
not establish a measured performance improvement in another engine.

Sources reviewed 2026-11-11. The triangle-selection method depends on verified
correspondence between the particular exports; do not assume every generator's
full and segmented outputs preserve it.
