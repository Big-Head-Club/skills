# Universal polish list

These apply to every app. Each line comes from something Daniel asked for more
than once, in commits, docs or messages. Quotes are Daniel's own words, kept
where they help a critic. Cite items by number (U12).

## A. Words

- U1. No explainer text. "Users don't want to read." Cut sentences about how
  things work, what to do, or why. "If a thing needs explaining, redesign the thing."
- U2. No tooltips of any kind, including the `title` attribute, which Daniel has
  banned outright. No info icons.
- U3. No helper subtext under inputs, headings or buttons: "ugly little subtexts
  below input fields explaining what things are". One short note is allowed only
  when it changes what the user does, such as "all optional".
- U4. No labels a glyph, colour, position, shape or the object itself can carry.
  "No little labels." No legends or axis labels. A graph is lines and nodes.
- U5. Words survive in only four places:
  - the verb on a button;
  - the result or end card;
  - a failure the user must act on;
  - at most one small visual key that folds away, if the app's verbs cannot be
    read off the screen.
- U6. A button says `<verb> <cost>`: "BUY 3g", "UNLOCK 40 XP". The cost goes on
  the button, not beside it. Drop counts in brackets ("(4)") unless the count
  prevents a mistake.
- U7. Keep the one number that prevents a mistake, such as units left to place,
  and cut readouts that repeat what the screen already shows. Don't hide every
  number: a board with no numbers can look broken.
- U8. No odds, percentages or probabilities in play unless they are the game.
  "get rid of the odds".
- U9. One word for each thing, everywhere, in the product's own register:
  - fiction words in games ("companions", not "items"; "recruit", not "buy");
  - plain owner words in tools ("writing, editing, take", never "render,
    enqueue, brief");
  - no internal ids, scores or jargon on screen.
- U10. Copy follows the Orwell rules in `~/.claude/CLAUDE.md`:
  - short words, active voice;
  - no exclamation marks, and no "seamless", "effortless" or "powerful";
  - don't answer objections nobody raised;
  - "one screen, one idea".
- U11. No "You" label on the player. Show the saved name. Default names are
  Player 1, Player 2.
- U12. After cutting, check with the first-time-user critic. If a newcomer
  cannot work out the main job, add back the smallest visual cue (a ring, a lit
  target, a ghost unit, a pulse until acted on), never a paragraph. "Strike a
  balance."

## B. Chrome and flow

- U13. Open the link and you are in: no start screen, lobby, splash, sign-up
  wall or "New game" button. "Anything that stands in the way of me playing the
  game should be minimized." Set a name inline, on the main screen.
- U14. State lives in the URL (room code, filter, date range, tab), so a link
  can be shared and a reload lands in the same place. The URL is the invite, so
  there is no Invite button.
- U15. One screen, one obvious next action: "Your one job should be front and
  center." One primary button per screen.
- U16. No extra pages. Merge pages that hold one idea. Reference pages (stats,
  hands, credits, docs, about) go behind one menu, never beside the main job as
  tabs.
- U17. At most one menu: a single hamburger or identity menu, placed where a
  modern app puts it, and one that actually opens. No toolbar, no bottom nav
  bar, no account chrome for a single-user app.
- U18. No settings the app can decide. If a setting survives, it ships with a
  sensible default and visibly changes something. Dead toggles go.
- U19. Cut dead features, half-built modes, unused buttons and duplicate ways
  to do the same thing. Don't add a feature, a tutorial or a settings page
  during a glow up.
- U20. Clicking the wordmark goes home. The back gesture works. Nothing opens a
  new tab without reason.
- U21. Hide operator and admin surfaces (ops pages, raw logs, debug panels) from
  the customer. Show friendly status at most.
- U22. Undiscovered content shows as a mystery ("?"), not a spoiler list.

## C. Answers and feedback

- U23. Every action answers within a frame: press state, then a result the eye
  can find. No silent failures: "no silent returns", "mysterious, silent
  failures".
- U24. A blocked action says why visually (shake, dim, a lit requirement), never
  with a dead button or a toast of prose. A button shows its state through its
  own brightness: dim when it can't act, normal when it's optional, lit when
  it's the move. Green stays the action colour (Z9). Use a red, yellow and
  green scheme only where the owner set one, as in roll-all-threes.
- U25. Show state with light, colour, dimming and position: glow the dice in the
  best hand, dim what isn't your turn, light the legal targets.
- U26. Work in progress shows signs of life front and centre (a bar, a live
  checklist, a filling ring). The user never has to reload to see progress.
- U27. Errors are pretty and actionable. They say that nothing is lost, offer
  one retry, and never show raw error text. Wait a beat before showing an error
  state, so a quick retry never flashes one.
- U28. Every empty state contains an action.
- U29. Reward what the user did, in proportion to how much it matters. Tools
  get checkmarks that land and progress that fills ("cute little animations to
  reward getting stuff done"). Games get the juice level in BAR.md.
- U30. Toasts never stack and never cover a button. Use one feed: on desktop to
  the side, on mobile below the main area, or nothing.
- U31. A number that changes counts or pops; it never jumps silently.
- U32. Relative times ("5 min ago") update on their own.

## D. Motion

- U33. Still while the user thinks, moving when the user acts. No ambient
  motion on screens where someone plans, reads or types. "Judge motion by what
  it tells the player."
- U34. Nothing pulses or loops, except a prompt that stops once acted on.
  Entrances play once; a repaint never replays them.
- U35. Motion is slow enough to follow. Daniel has asked more than once to slow
  feedback down (by 50%, then another 25%), and to "chill out zoom effects".
  Short but legible: about 200–400 ms for UI, and seconds for a replay the user
  should watch.
- U36. Discrete states snap; continuous things ease out. Nothing teleports, and
  nothing is caught mid-interpolation where it can be misread.
- U37. Reset-free motion: an effect never restarts on the same object (the Ken
  Burns lesson). No twitchy, jittery or resetting animation. Debounce hovers
  and previews.
- U38. `prefers-reduced-motion` removes motion but keeps feedback.

## E. Stability

- U39. Nothing moves under a finger. Reserve space for things that come and go,
  such as a boss row or a badge. Highlights never push buttons below the fold.
- U40. A re-render, poll or state push keeps scroll, focus, drafts, selection,
  in-progress drags and half-built plans. A poll with no news repaints nothing.
- U41. Edge cases don't break layout: long names, huge counts, many items, zero
  items, NaN. Test the extremes ("I have so many rolls that the styling got
  fucked up").
- U42. Images keep their aspect ratio, always. Never squash on either axis.
  Crops are deliberate.
- U43. Nothing touches or overlaps that shouldn't; spacing is consistent.
  Tables use stable columns.
- U44. The run, draft or session survives a reload.

## F. Phone

- U45. Design at 390×844 first, then check 360×640, 844×390 and 1440×900. Test in
  a real touch context (Playwright `hasTouch`, `isMobile`), not a resized desktop
  window. Headless emulation can pass while a real iPhone fails, so tap handlers
  must not depend on synthesized clicks.
- U46. Thumb zone: primary actions sit at the bottom and stay put. Controls are
  44px or more, text 12px or more, inputs 16px or more (so iOS doesn't zoom).
  Nothing is hover-only.
- U47. Use 100dvh and safe-area insets, with no sideways scroll. Modals become
  bottom sheets or inline panels; a modal must never wreck the phone
  experience.
- U48. If the desktop layout fights the phone one, commit to the phone layout
  and constrain the width on desktop. Lock portrait when the app needs it. A
  desktop-only app shows one clean screen saying so.
- U49. Read touch or mouse from each pointer event. A drifting finger still
  counts as a tap (within about 12px). A long-press, drag or hold gets a small
  haptic where the platform allows.

## G. Look

- U50. One material. Build the UI from what the product is already made of
  (paint, pixels, felt, the client's brand), not from a second skin. Measure a
  client's brand from their CSS and use their palette only.
- U51. Tight palette, and one colour means one thing. Keep one action colour.
  A player's colour never changes, and seat colours follow hexsmash's order
  (yellow, red, blue…) when a game needs them.
- U52. Colours stay apart: close hues (blue and cyan) get more distance, and
  colour is never the only cue where it matters.
- U53. Legible at a glance: a clear order of size and weight, tabular numbers,
  contrast 4.5:1 or better. Raise the opacity of a scrim when text sits over
  effects.
- U54. Simpler and flatter beats busy. Cut background textures, heavy borders,
  gratuitous shadows and gradients: "too much visual noise". Leave a gap between
  an object and its border.
- U55. Real art, not typeset placeholders. A retro or pixel skin stays faithful
  to its era, with no modern UI idiom leaking in.

## H. Sound and haptics

- U56. No audio before the first gesture. Keep it quiet: music at about 25%,
  effects under the voice. Mute persists. Use one switch, not a mixer.
- U57. Sound only where it carries meaning. Haptics go on reward and on hold
  confirmations, never on every tap.

## I. Trust and hygiene

- U58. Clean console, no broken links, a correct `<title>`, og and canonical
  tags, and a favicon. Heavy embeds (such as YouTube) load when pressed.
- U59. Keep the plumbing: arcade `cart.json`, the tally tag, the og image, the
  Terms and Privacy footer on public pages, health checks. Don't break analytics
  counting.
- U60. No secrets in the repo or the page. Flag any you find; don't just move
  them.
