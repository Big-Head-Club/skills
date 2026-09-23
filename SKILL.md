---
name: glowdropify
description: Give an app a glow up. Run a gauntlet loop that strips explainer text, labels, tooltips, extra pages and extra options, makes the app answer visually, makes it visibly richer (for games and canvases, a render layer of sky, bloom, glow and physics particles, so nobody can call the result "indistinguishable"), and polishes it against Daniel's two house standards (wire-war-zen for minimal, glowdrop for juice) plus one outside reference picked for the app's type. Use when asked to "give this app a glow up", "glow up" or "glowdropify" something, polish or clean up a UI, make an app feel like hexsmash or glowdrop, or run a polish gauntlet with critics.
---

# Give an app a glow up

A glow up does two things, and it has failed if it does only the first:

1. **Less on screen.** Same job, fewer words, labels, pages and controls; nothing jumps, nags or
   lectures.
2. **Visibly richer.** Someone who saw the before must see at a glance that the after is new, and
   better looking. For games and anything with a canvas, that means the render layer in
   `references/glamour.md`: depth behind the play, glow, particles with physics on every contact,
   and a payoff that is a light event. Daniel's words, 2026-09-23, after a run that only did (1):
   "this looks almost indistinguishable … we added no glamor and no juice", and of the render pass
   that fixed it: "the BARE MINIMUM of improvement that i expect".

It is not a feature pass: rules, game numbers, data and flows stay as they are unless the owner says
otherwise. How things are drawn is not a rule.

Two house standards set the bar. Every glow up judges against both, weighted by
the kind of app:

- **Wire War Zen** (GitHub `Big-Head-Club/wire-war-zen`, branch `zen`, live at hexsmash.xyz) is the
  minimal bar: open the link and you are playing, gestures do the work, feedback
  is visual, there is almost no text, and nothing twitches.
- **Glowdrop** (GitHub `Big-Head-Club/glowdrop`, live at glowdrop.fly.dev) is the
  juice bar: every action the user causes answers in light, sound and number,
  and the payoff is out of proportion.
- A third, **outside reference** is the best product of this type that the
  user already knows. It is chosen in step 2.

**Getting the reference repos.** Use a local clone if one exists (on Daniel's Mac:
`~/Desktop/stuff/wire-war-zen` and `~/Desktop/stuff/BHC/neondrop`). Otherwise clone them
into a scratch folder: `gh repo clone Big-Head-Club/wire-war-zen <dir>/wire-war-zen -- -b zen`
and `gh repo clone Big-Head-Club/glowdrop <dir>/glowdrop`. If you can't reach them, judge
against the frames in `refs/` and say so in the report.

When they conflict: the owner's written rules win, then this skill, then any
critic. A critic's score never overrules the owner's design goal.

Do these steps in order. Do not ask the user questions the steps answer. Decide,
write the decision down, and ask only when blocked or when a change would alter
rules, numbers, pricing, data or copy the owner wrote.

Read these as you reach them:
- `references/standards.md`: both standards as checkable criteria, the floor
  they share, and the 1–5 rubric.
- `references/universal.md`: the polish list that applies to every app (U1–U60).
- `references/buckets.md`: extra tasks, juice level and outside bars by app type.
- `references/critics.md`: critic briefs, lenses, output format, builder rules.
- `references/juice-kit.md`: glowdrop's sound, easing, shake and reward recipes.
- `references/glamour.md`: the render layer (sky, bloom, particles, glow), with numbers and a
  reference implementation. Required reading for any app with a canvas or a game loop.

## 1. Learn the app and the owner

1. Work on a branch: `git switch -c glow-up` (reuse it if it exists). That keeps
   the starting point intact. Leave any uncommitted work you found alone, and
   stage only your own files by path.
2. Read the repo's `CLAUDE.md`, `AGENTS.md`, `README.md` and any DESIGN, LOOK,
   BAR, HANDOFF, QUEUE or UX-REVIEW docs. Then run
   `git log --format='%h %as %an %s' -60`. Write down every UI rule the owner
   stated, including anything they asked to keep: a key panel, a badge, a
   number, a colour. **Those rules outrank everything in this skill.** Check
   `~/.claude/CLAUDE.md` for app-specific rules too, such as the Hex Smash HUD.
   - A rule counts when a person wrote it: Daniel, or the named client. Quotes
     and QUEUE entries count. Commit messages and docs an agent wrote on its
     own are history, not rules.
   - "Faithful to the original" (a port, a reskin) binds the rules and the
     look. It does not protect explainer text, legends or chrome the original
     never had.
   - **A fork belongs to the person who asked for it.** The upstream author's
     picks (palette, art, commit messages that say "the look X picked") are the
     starting point, not rules. Keep their palette and shapes for identity, but
     their flat or plain rendering is never a reason to skip glamour. Only the
     requester's own words bind.
   - Never write "the look is fixed" into BAR.md unless you can quote the
     requester saying so. That one line is what made the Drone Command run fail.
3. Pick the bucket or buckets from `references/buckets.md`. Take each bucket
   item only where it fits the app.
4. Find the dev command and run the app locally. Send save files and data to a
   temp dir. Never create rooms, plays or accounts on production. If the app is
   only live, read it and ask before touching it.
5. Use it the way its user would, on desktop and at 390×844 touch: do the main
   job end to end three times, and for a game play three full rounds against
   bots. Clicking by hand in a Playwright browser is fine. If you script it,
   give every wait a timeout of a few seconds, because a stalled wait is the
   biggest time sink. If a debug hook such as `window.__game` exists, use it.
   If it doesn't, add one now; you'll need it for capture.

## 2. Set the bar

Write `docs/glow/BAR.md`. After this step the builder does not edit it; only the
owner can.

- **Minimal (zen):** the bar for words, chrome, controls, start flow and
  stability. It always applies in full.
- **Juice (glowdrop):** the bar for the moments the user causes. Set the level
  from the bucket: full, medium, light or none. Juice never goes on a screen
  where the user is thinking or reading. **Still while they think, loud when
  they act.** Medium or full juice includes the render layer in
  `glamour.md`, not just popups and sounds: +N labels over a flat, unlit world
  is light juice at best.
- **Glamour:** list the five glamour items from `glamour.md` in BAR.md with
  what each will be in this app. A static screen that needs no glamour
  (a tool, a dashboard) says so in one line.
- **Outside reference:** pick one from the bucket's list. It must be something
  a critic can actually look at: live pages, the app itself, or store and press
  screenshots saved to `docs/glow/refs/`. If the app belongs to a client with a
  brand, their site is the look bar. If nothing fits, use Google's product for
  the same job.
- **The owner's words:** quote what the owner has said about this app, if
  anything. Critics judge against these first. Add to this section during the
  run; it is the only part of BAR.md that changes.

## 3. Capture the baseline and write the review

1. Write `docs/glow/states.mjs`. It lists states that drive the app from a
   fresh load to each important screen:
   - landing;
   - the main action, mid-action, success and failure;
   - empty, error and loading;
   - end or result;
   - settings, if they survive;
   - for multiplayer, a second player's view.

   The format is in `scripts/states.example.mjs`. Keep the states fixed from
   round to round, so the shots compare.
2. Pick the three key states for the before/after test (main play mid-action,
   the player's big move landing, the result) and make sure `states.mjs`
   reaches each one with the effect on screen, not before it lands. Then run
   round 0:

   ```bash
   node ~/.claude/skills/glowdropify/scripts/shots.mjs --url http://localhost:PORT \
     --out docs/glow/shots --round r0 --states docs/glow/states.mjs --video --seed 7
   ```

   This shoots every state in four views at once: desk 1440×900 (mouse), and
   phone 390×844, landscape 844×390 and small 360×640 (touch). It takes about
   two minutes for seven states. `--seed` pins `Math.random` in the page so
   dice and deals repeat between rounds; drop it if player ids come from
   `Math.random`. Each screen gets audited for:
   - words, numbers, sentences, tooltips (including `title`) and helper text;
   - text under 12px, and controls whose hit area is under 44px (touch) or
     24px (mouse);
   - low contrast and off-screen controls;
   - sideways scroll, layout shift and idle motion;
   - console errors, and states that failed to load.

   Results go to `audit.json`, and `docs/glow/shots/index.html` (the progress
   page) updates. The audit points at problems; the pictures decide. Give the
   user the progress page path once. Add `docs/glow/shots/` to `.gitignore`
   unless the repo already commits screenshots.
3. Shoot the references at the same sizes. `refs/` in this skill holds standing
   zen and glowdrop frames. For live frames, run zen locally with
   `cd <wire-war-zen clone> && DATA_DIR=$(mktemp -d) bun src/server/index.ts`
   and glowdrop with `cd <glowdrop clone> && npm run serve`
   (port 8123). Save the outside reference's frames to `docs/glow/refs/`.
4. Write `docs/glow/REVIEW.md` **before changing a line**:
   - an inventory of every string on screen, every control, page, menu, setting,
     modal, toast and tooltip, with a keep or cut decision and a reason for each;
   - what is janky, and where;
   - the owner's rules from step 1.2.

## 4. The cut (round 1)

Round 1 always builds the cut. Build it here, then run the rest of round 1
(capture, critics, verify, log, check) as step 5 describes. Go through `references/universal.md`
sections A and B, plus the bucket's list, and cut:

- every explainer sentence, helper subtext, tooltip, legend and label that a
  glyph, colour, position or the object itself can carry;
- every page, tab, menu, setting and control that stands between the user and
  the job, along with dead features;
- start screens, lobbies and confirmation steps the user did not ask for.

Cut about a quarter past where it feels right. The first-time-user critic
decides what comes back, and it comes back as a picture, a lit target or a
glyph, not a sentence. If a game's verbs cannot be read off the board, one
small visual key that folds away is allowed. That is the only labelled place.
Keep ARIA names on everything you strip. Keep the one number that stops a
mistake.

When the cut lands, and again when the glamour pass lands, tell the user in
one line where to look, so they can react early. Give them something they can
play: the local URL and the progress page, and a live URL when one exists that
they own for this purpose (see step 7). Anything they say during the run goes
into BAR.md with the owner's words and counts as a P1. It beats every critic.

## 4b. Glamour (round 2, required when juice is medium or full)

Round 2 always builds the render layer from `glamour.md`: depth behind the
play, glow (bloom or halos), particles on every contact, glowing heads and
trails, and the player's big move as a light event with a hitstop. Do it
before any polish round. Five rounds of floor fixes on a flat world is the
failure this skill exists to prevent.

Prove it the way `glamour.md` says: frame-step the big move, run `imgstats`
r0 against r2 on the gameplay frame, and run the indistinguishable test.

## 5. Rounds

Each round:

1. **Build** one coherent slice. After the cut and the glamour pass, a typical
   order is:
   - state kept across re-renders, and no layout shift;
   - the main gesture or action, and legal moves made visible;
   - feedback and juice on each event (`juice-kit.md`);
   - more glamour where the before/after critic still sees little change;
   - the phone layout;
   - look, palette and contrast;
   - edge cases.

   For a big app, give builders disjoint files and run them in parallel.
2. **Capture** with `--round rN` and the same states, views and seed.
3. **Floor.** Read `audit.json` yourself: failed states, console errors, low
   contrast, small hit areas, sideways scroll, layout shift. Every hit on the
   shared floor (F1–F10) is a P1 whether or not a critic mentions it.
4. **Critics.** Spawn fresh-context subagents in one message, one per lens,
   using the briefs in `references/critics.md`. Five run every round:
   - first-time user;
   - phone thumb;
   - zen comparator, with a blind A/B against a zen frame;
   - outside-bar comparator, with a blind A/B against the outside reference;
   - before/after, the indistinguishable test: a blind A/B of r0 against this
     round on the key states. "About the same" is a P1.

   Add the juice, owner's-words, brand, stability or code lenses when the
   bucket or the last round calls for them. When juice is medium or full, the
   juice lens runs every round. Give each critic the screenshots,
   videos, local URL, reference frames and `BAR.md`. Never give them the diff
   or what you changed. Merge duplicate findings across lenses.
5. **Verify** every P1 and P2 yourself in the browser; a critic can be wrong.
   Fix the ones that hold. Prove each fix with a fresh screenshot of the same
   state and view before calling it fixed. "Looks the same" means it did not land.
6. **Log** the round in `docs/glow/REVIEW.md`: findings, fixes, and rejections
   with the reason for each. Anything that would change a rule, number, price or
   the owner's copy goes under "Needs Daniel", not into the code.
7. **Check** that tests, typecheck and lint pass, then commit with a plain
   message: what changed and why.

Stop when two rounds in a row turn up no P1 or P2 from any critic, the outside
reference no longer wins the blind A/B on the lenses it judges, and the
before/after critic picks the new build at a glance and calls it clearly
richer. Also stop after six rounds, or when the owner says so. Stopping at six
rounds without passing the before/after test is a failure to report plainly,
not a finish.

## 6. Smooth and question

1. Send one fresh agent through the whole app as a single piece, to catch
   slices that clash (two motion styles, two button styles, a colour that means
   two things).
2. Ask four questions and act only on answers that remove or clarify: How could
   this be simpler? Easier? Better looking? More trustworthy?
3. Capture a final round and walk every state yourself at 390×844 and 1440×900.
   Confirm the console is clean and reduced motion works.

## 7. Report

At the top of `docs/glow/REVIEW.md`, and to the user in a few plain sentences:

- lead with a before/after pair of the key screen (r0 and the final round, the same
  state), so the change is seen, not described;
- what changed;
- what the critics still flag, and what failed or went untested (for example
  a real phone, or sound on iOS);
- what needs Daniel's decision;
- where the before-and-after shots are, which is the progress page.

Do not push or deploy to someone else's production, or to a live app with real
players, unless the user asked in this request. A preview the user owns for
this work (a fork's own app created in the same request, a preview URL) is
different: deploy the `glow-up` branch there after the cut and after the
glamour pass, so they judge the real thing on their own device. Say which
build is live; never let them test the old one by mistake. Say how to ship:
merge `glow-up`, then the repo's deploy command. If the app is registered with
the arcade, keep `cart.json`, the tally tag, the og image and the legal footer
working.

## Running it

- One lead runs the loop. Visual critics need the strongest model. The code
  reviewer, capture work and mechanical fixes can use a cheaper one.
- If the user says "ultracode" or asks for a workflow, encode the rounds (steps 4–5) as a
  Workflow script. `.claude/workflows/gauntlet.js` in `Big-Head-Club/semantic-centering`
  is a working model with judge, fixer and verify phases. Copy it to the
  scratchpad before running it from another repo.
- For a long run, keep `docs/glow/HANDOFF.md` current so another session or
  model can pick it up.
