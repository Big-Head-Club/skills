# Buckets by app type

Pick every bucket that fits. For each one, the juice level goes into `BAR.md`,
the outside reference is chosen from its list, and its tasks are added to the
universal list. Each outside reference must be something a critic can look at
(the live product, or saved store and press shots).

| Bucket | Zen | Juice | Examples in Daniel's work |
|---|---|---|---|
| 1. Arcade, physics and puzzle games | full | full | glowdrop, paintsplash, flycast |
| 2. Turn-based strategy and board games, multiplayer rooms | full | medium | hex smash, territory harvest, qwaxx/quintago/shut-the-baxx web |
| 3. Roguelites and progression economies | full | full on payoffs | roll-all-threes / dice-rolling-roguelite |
| 4. Party, social and word games | full | medium | semantic centering, Go Find It, Mack's Relay dailies |
| 5. Retro and pixel skins | full | medium | gravel-pit, roll-all-threes-crt, booster-pack fork |
| 6. Tools and studios for a non-technical owner | full | light | Gravel & Gas 3000, CLA 3000, firehose, shoebox |
| 7. Dashboards, admin and analytics | full | none | tally admin, arcade admin |
| 8. Catalogs, calendars and landing pages | full | light | arcade, rack, hundred-days, tally-demo |
| 9. Native iOS and personal utilities | full | light | jacked |

## 1. Arcade, physics and puzzle games

**Outside bars:** Peggle for the reward economy and Tetris Effect for the look
(glowdrop's own bars). Also Threes!, Mini Motorways and Monument Valley, and the
genre leader on the App Store.

- Run the full glowdrop kit (`juice-kit.md`) on user-caused moments: aim, launch,
  contact, goal, count-up, result, share.
- Every power-up either stacks with a visible effect or can't be taken again. Check
  each upgrade against each unit type: a switch (on/off) goes on once and its card
  greys out when nothing can take it; a stat that a unit ignores is a dead pick and
  must be made to mean something or refused. A pick that does nothing is a P1
  (Daniel, Drone Command, 2026-09-23: "make sure that I'm not fruitlessly stacking
  powerups").
- Build the render layer (`glamour.md`) in round 2: sky with depth, bloom,
  particles on every contact, glowing heads and trails, the big move as a light
  event with a hitstop. The game's palette and shapes stay; its flatness goes.
- Keep the playfield still while the player arranges. Motion starts when they
  commit.
- Targets react when satisfied: they fill, light and animate. A goal the player
  met never looks the same as one still open.
- Each level has one new idea. Five minutes or less per level, and it resolves
  quickly: a level that takes too long to finish is a bug.
- Physics must look right. Balls that move wrong read as broken.
- Failure is soft, and retry is instant with the board kept.
- Cap zoom and Z-axis moves ("chill out zoom effects by at least 50%").
- Meet a frame budget on a mid phone, keep a particle cap, and support a
  capture mode for critics.

## 2. Turn-based strategy and board games, multiplayer rooms

**Outside bars:** chess.com (playing a bot, and its tutorial), Lichess, and for
ports, the original app ("as the iOS app does"). For a port, get real frames
of the original: run it in the simulator from its repo, or save its App Store
screenshots to `docs/glow/refs/`. With no frames, the original can't be the
bar, so use chess.com.

- Land in a game against a bot within a second. A friend takes a bot's seat
  from the link. Bots fill empty seats and cover idle players.
- The URL holds a room code, and going to the root gives a fresh room. A seat
  token in localStorage resumes you, and "that party has gone" becomes a new
  party, not an error.
- Gestures on the board give orders. Tapping a tile never "preselects" in a way
  that fights a drag, and a long press moves the stack.
- Whose turn it is shows through the board and seat chips (brightness, a
  ring), not a sentence. The other player's move animates on your screen.
- Motion lives in the resolve or replay, slow enough to follow, with a still
  beat before the result.
- Pips and marks instead of numerals where the rules don't need numerals. No
  text on the board beyond what the rules need; a roll-and-write sheet keeps its
  numbers.
- Light the legal moves once the dice or cards allow them, and dim the rest. A
  tap on a dimmed spot does nothing and never reaches the server.
- One minimal row shows the party or players. Status reads from that row, not
  from a banner.
- In games with seat colours, they follow hexsmash's order and you are always
  the same colour.
- Everyone sees shared actions (holds, picks) live. Any player can do
  administrative actions, such as rolling, where there is no decision to make.
- Board ports stay faithful to the original's rules and look. Dim what can't be
  touched right now. The AI opponent should be fierce, not a pushover.
- Check balance with bots and a sim, never by feel alone.

## 3. Roguelites and progression economies

**Outside bars:** Balatro for how numbers land and the run loop; Hades for the
skill tree; Slay the Spire for drafts; Marvel Snap or Clash Royale for mobile
layout.

- Scores land like Balatro's: the count-up, companions lighting as they
  score, the multiplier as its own beat. Use one timing table for the whole
  reward.
- Price and verb sit on the button ("UNLOCK 40 XP", "BUY 3g"). The level of an
  upgrade is conspicuous.
- Upgrades stack visibly or stop being offered: a switch can't be bought twice, a
  maxed upgrade greys out, and every upgrade does something for every unit it can
  target (see bucket 1).
- A shop: the price on every card, the bank's balance above it, the price in red when
  you can't afford it, a clear bought state, a visible cap on buys per round (pips), and
  one primary button to move on. Group kinds in rows (units above, powerups below).
- One shared shop/choice policy module drives every bot, time-out pick and demo, so a
  rules change can't leave one of them buying the old way. Retune with bots after any
  economy change and report the medians.
- Introduce enemy or threat types gradually on a fixed schedule (a few to start, one
  more every few rounds), and open with the gentlest ones: check the weakest starting
  loadout survives round 1 with bots.
- One vocabulary for the fiction, used everywhere.
- Undiscovered hands, companions and artifacts show as "?".
- After the run recap, a celebratory screen shows anything newly unlocked.
- A failed run gets a brief, big "YOU DIED" and a quick restart.
- Reference pages (hands, companions, stats) live in the menu, not as tabs
  beside Play. Stats pages are just numbers.
- The skill tree is spatial and readable at a glance: a bare centre orb, smooth
  colour fields rather than wedges, and hidden tiers that appear only when
  reachable.
- Show the spend-versus-bank trade-off visually (for example "pay 1g to roll
  again"). Explain nothing in prose.
- Balance happens in `sim.js`, not in a look pass. Flag number changes as
  "Needs Daniel".

## 4. Party, social and word games

**Outside bars:** Jackbox, Gartic Phone, NYT Games (Connections, Wordle), and
Google Meet for camera grids.

- Everyone goes to one shared link. Names are set on the main screen. The game
  starts without a lobby screen when it can.
- Progress toward the end is always visible ("gotta be able to see an end
  coming"). A race bar beats a round counter.
- Timers are a shrinking pie or ring, never digits.
- Give real-time feedback on what counts as good, so players can adapt as they
  play.
- Offer to play again the moment someone wins.
- Pace reveals slowly enough that the room laughs together. Fire reveals from a
  server timestamp so every screen hits the beat at once.
- Friends' voices come first: game sound stays quiet and short and never ducks
  a call.
- Scores show as human words ("roughish"), not raw numbers or probabilities.

## 5. Retro and pixel skins

**Outside bars:** the source console game at its native size, such as Harvest
Moon GBC, Genesis-era titles, or an itch.io reference the user names.

- Render menus and speech bubbles in the era's style: canvas, not modern HTML
  chrome. "Modern UI idiom" breaking the skin is the most common critic finding.
- Sample colours from reference frames. Use fewer colours, fewer effects and
  squarer corners, and use integer pixel scaling.
- A reskin changes only the skin: rules, numbers and copy stay the same.
- Sprites must be legible and charming at game size, never squashed. Use real
  art, not placeholders.
- Music is low (about 25%) with a mute switch. Don't open with a minigame; start
  with the core loop.

## 6. Tools and studios for a non-technical owner

**Outside bars:** the client's own site for the look (measured from their CSS);
Linear or Things for clarity; Google's product for the same job when unsure
(Google Photos for a library, Gmail for review queues).

- It should feel like a toy, not work. The new-user experience is short and
  asks only what can't be inferred from the owner's existing footprint.
- The home view is "your one job", front and centre. The owner always knows
  what is expected of them next and when it is due.
- Use checklists, progress bars and small reward animations when the owner
  finishes something.
- Upload is obvious: a real drop zone and a button. Processing shows signs of
  life right away, without a reload.
- Automatic decisions are never binding. Every one can be overridden, and the
  override is one tap from where the decision shows.
- Keep the owner's material (uploads) visibly apart from filler the system
  pulled in.
- Every setting ships with a sensible default. Connecting accounts is part of
  onboarding, not a buried settings row.
- Ops pages, logs and pipeline states stay hidden from the owner; show friendly
  status only. Use the owner's plain vocabulary.
- A docs section may exist, but the app must not need it.
- Rejecting something asks for an optional note, and the note feeds the next
  run.
- Errors are pretty, say what to do, and fix the root cause where possible.

## 7. Dashboards, admin and analytics

**Outside bars:** Plausible, the Stripe dashboard, Linear insights. For
spirit, bettermotherfuckingwebsite.com.

- One server-rendered page is fine. Put the range and filters in the URL. The
  date picker must actually work; check it in a browser.
- Tiles, tables and totals. No charts unless asked, and a chart has no chrome
  (no axis titles, no legends).
- Dense is fine; decoration is not. Surface anomalies and silent failures.
  Hide empty sections.
- Admin pages may be dark monospace with one accent. Public-facing numbers stay
  faint: analytics must not pollute the main view.
- Cut explanatory definitions ("A play is a run where…"). The number stands
  alone, or it gets one plain word.

## 8. Catalogs, calendars and landing pages

**Outside bars:** Apple Arcade or the itch.io front page for game catalogs;
Google Calendar for calendars (a grid on desktop, a list on the phone); Linear's
site or Stripe's for landing pages.

- The product is front and centre: for games, "a place you go to play games
  above all else". One headline, one primary button.
- Every line of marketing copy passes the swap test in `~/.claude/CLAUDE.md`.
- On the phone, a calendar becomes a list that lands on today. On desktop it's
  a grid.
- Filters are chips that fit the thumb, with no tooltips on them. Sort order
  and filters live in the URL.
- Cartridge labels, plates and thumbnails fit exactly (no overhang, no leftover
  original label) and are never squashed.
- Every public page has a Terms and Privacy footer. og and canonical tags are
  correct. Video embeds load on press and are centred.

## 9. Native iOS and personal utilities

**Outside bars:** Apple's own apps (Fitness, Reminders, Health), Things 3, and
Apple's Human Interface Guidelines.

- One screen. Enter data in the fewest taps possible: one tap per common
  action, no submenu when a default works ("just add .5L").
- Actions sit bottom-aligned in the thumb zone. No nav title, no account
  menu, and no name chrome in a two-person app.
- Emoji and pictures serve as data where they read faster than words.
- Relative times refresh on their own. Haptics mark success; failures show as
  one quiet line and roll back.
- A demo or seeded mode runs in the simulator, so it can be checked before it
  goes on a phone.
