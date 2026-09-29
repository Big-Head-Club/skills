# Pitfalls: what the reviews found in a build that had passed its tests

Each of these was real in Drone Command. Check every one before shipping.

## Exploits

- **The idle death.** If any run that clears wave 1 counts as a death, a player who presses Go
  and touches nothing climbs the whole ladder in nine minutes. Gate death N on reaching wave
  min(N, 3), and pay fragments on the same test.
- **The surrender loop.** If a surrendered run pays its banked lines, clearing wave 1 and ending
  the run is the best income per minute on a developed profile. Pay a surrendered run nothing and
  move nothing (no death, no fragment, no luck streak). Closing the tab keeps the run.
- **Luck fishing.** If the luck roll comes from the run's seed and ending early costs nothing,
  the player re-rolls until Touched. Key the roll to counters a surrender cannot move.
- **The best tier is the worst luck.** A ×1.5 multiplier on every line plus two fragments and a
  bag of curses that each pay made Forsaken the tier to want. Multiply the frontier lines only,
  pay one fragment, and make the tier touch the fight (fewer drones, less money, a narrower
  weapon), not just the receipt.
- **Winning ratchets the threat for nothing.** If a win raises every later run's difficulty and
  pays nothing extra, the play is to win once and never again. Pay the threat (+25% per level on
  frontier lines) and make first clears per level.
- **Paid twice.** A saved log restored after payout paid again. Keep the last fifty paid seeds in
  the profile and pay a seed once. Clear the stored run the moment the run ends, not after the
  result screen's delay.
- **Breather idling.** Charges and drones that fill during the shop make sitting in the shop the
  best move. Recharge the weapon only during a wave.
- **Reaching a wave by surrendering in its shop.** The wave counter has already advanced in the
  breather; use the waves cleared, not the current wave, for a surrendered run (moot if surrender
  pays nothing).

## Arithmetic

- **The starting unit prices the second.** A per-copy price escalation counts the unit already
  standing, so run 1's shop could never sell the unit its fixed shop promised. Fixed shops carry
  their own prices.
- **+2% is nothing.** Kill pay of 3-14 rounded stays the same at +2%, +4%, +6%. Nodes that change
  no hit count and no rounded number are a tax on what the felt node needs. Cut them.
- **The felt node priced for the spec's income, not the measured one.** Compute runs-to-rank-1
  from the career bot's actual currency per run, not from the table.
- **A per-type cap formula that floors everything but one type at 1.** `cap − 5 + swarm` gave
  the Hornet a drone per rank and every other unit nothing until rank 3. Use a proportional
  formula (`ceil(cap × (1 + swarm) / 6)`).
- **Shop-size cards off by one.** Map each card to the slots it adds and check that every card
  changes something; a rarity tier that opens before any item of that tier exists opens on an
  empty pool.
- **The win wave vs the debut schedule.** A win at 12 with a threat that debuts at 13 means the
  threat, its counter shop and a later city never happen. Put the win past the last debut.
- **Three repayment claims for one item.** One number in one place (the Mint: price, income, and
  the bot's cutoff computed from them and the win wave).
- **`**` is `Math.pow`.** It escapes a no-engine-Math grep unless the pattern includes it, and
  `/**` doc comments must be excluded from the check.

## Determinism and replay

- **Silent rejection.** A replay that drops inputs the sim refuses (because a number changed)
  carries on to a different state and gets paid. Count rejections; drop the save if any; store a
  SIM_VERSION with the save.
- **Resume rewinds the breather.** A replay that stops at the first breather tick with no more
  inputs loses the time spent in the shop; step to the saved tick when one is given.
- **Pairs drawn by id from a bag with duplicates.** `indexOf` on a duplicated id pushed the same
  index twice and skipped the pair rules from pair 2 on. Draw by index, apply every rule to every
  pair, test every pair of a long run.
- **A mod applied after bought copies.** "Big pads lose a drone" applied to base + bought made a
  bought drone a dead buy. Apply penalties to the base count, then add copies.
- **Charges past the cap.** A temporary +1 charge on top of bought charges passed the maximum the
  purchase gate enforced. Clamp where charges are recomputed.
- **The win path skips the bookkeeping.** Clean waves, laser waves and curse clears lived in the
  breather; the win called finish directly. Factor `closeWave` and call it on both paths.
- **The event batch.** Client handlers that scan the batch for "was there also an X" work only
  while events happen to flush together. Handle each event.

## The second day (2026-09-25)

- **A win wave in an endless game.** Clearing it ended the run mid-momentum; the owner called it a
  rug pull. If the fiction is "go until you die", never end a run on a clear.
- **Cards fire all at once.** A strong first run cleared waves 3-9 and opened ten cards in one
  screen. Cap wave cards per run and hold the rest.
- **A death that opens nothing is fine; a death that doesn't count is not.** Gating the count
  made some deaths invisible. Gate the cards, count every death.
- **Fragments with nothing to open.** A citation's item was excluded from Blueprints, so fragments
  piled up. Let them open anything at a premium, and convert only when nothing at all is left.
- **Kill credit through a proxy.** Flak clouds credited the strike whatever laid them; a rocket
  that blew up on the Lure was a "landing". Every kill path needs an owner: a cloud carries its
  layer, a lured rocket credits the Lure's pad, and the balloon it takes is not a loss.
- **A mid-flight turn looks broken.** The Lure pulled rockets that were already flying; they
  turned sharply. Anything that redirects a threat does it at launch, so the path is straight.
- **A station off the top of the view.** Altitudes are relative to the pad; a hilltop pad put the
  gunship above the frame. Cap hover heights to the view.
- **A city that is all rubble but still alive.** Damage art keyed to a fixed hit count broke when
  HP grew. Key it to the share of HP lost and keep a third standing while it lives.
- **A shake that outlives its animation.** The rejection class was never removed; a hidden then
  shown element replays every animation it wears, so every legit buy shook the row. Remove
  feedback classes at animationend and in every rebuild.
- **The shop that closes itself.** Auto-closing after the last affordable buy took away undo and
  a look around. The shop stays open until Go.
- **Overlays that outlive the run.** Badges, popups, hints and chips stayed over the title after
  Home. Home clears everything a run put on screen.
- **A ground unit that idles.** With nothing in reach it waited; the owner wants it to spam. A
  barrage sweep when there is no target.
- **The end replay, three times.** A time-compressed replay stepped and dragged; a top-down wipe
  invented paths from the wrong view; a kill-by-kill sequence was still "sick of it". What shipped:
  no replay, only the rockets that hurt a city, drawn at once in red, and a big red YOU DIED. Do not
  draw what the player did not see: a short fading tail, never a run-back along a guessed line.
- **Trails sampled too coarsely** read as sawtooth; sample twice as often.
- **The shader's type table** was hand-numbered; adding types shifted every id. Compute it from the
  lists.

## The third day (2026-09-28)

- **Tiers sized for the first week.** A long run crosses every tier of every track at once. Size
  the top tier to a great run times ten; make open-ended tracks geometric.
- **A per-track cap is not a budget.** Two per track over seventeen tracks is thirty cards. Budget
  the run.
- **The menu that is hidden only in the HTML.** Every screen that plays a sequence must hide its
  chrome at the start of every sequence, not once at load.
- **The counter settles into a hidden menu.** Moving the currency button into the menu while the
  menu is still hidden makes it vanish mid-sequence. Move it when the menu shows.
- **A guard longer than the animation.** A 350 ms guard plus a 950 ms flourish made a 1.3 s dead
  zone on the cards. Guard from when the thing appears, for as long as a stray tap can arrive.
- **Short screens that hide the line.** A card with no line says nothing. Shrink the line; never
  hide it.
- **The hit test that skips ineligible targets.** The tap falls through to a neighbour and nothing
  explains itself. Answer on the ineligible target.
- **Lifetime counters that a long run outruns.** A run started under an older script showed sixty
  cards; the owner blamed the numbers. Both were true: hard-reload after a deploy, and the numbers
  were too small.

## Feel

- **A dead first shop.** The pre-wave shop at 60 money with the cheapest item at 150 is a screen
  with nothing to buy on the first run that has it. The card that opens the shop brings the money
  to use it, and the dead-shop failsafe applies to it too.
- **One affordable item is not a decision.** After wave 1 the bank is a band; put one cheap
  non-power item inside it and the power items just above, so the choice is buy now or save.
- **Gamble cards that are blank for a new profile.** "The next shop shows five bases" with one
  base type unlocked; "a rare guaranteed" before the rare tier exists. Filter the bag by what the
  profile can use.
- **Cards whose line lies about the number.** An interval ×0.85 is 17.6% more launches, not 15%
  faster; say "15% sooner". An additive kill bonus of 2 on a 1 + sum formula is triple, not
  double.
- **Progression that stops.** After the ladder's last card, fragments buy nothing and the bars say
  "complete". Add lines that never run out: first clears per Threat level, a fragment every N
  kills, fragments worth currency when nothing is locked.
- **The result screen as a report.** See `ui.md`. The owner's words: "Entirely too much data
  here", "please don't just throw shit at me".
