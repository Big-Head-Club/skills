# The client: what the player sees

The game's own UI rules come first (the repo's docs, `~/.claude/CLAUDE.md`). Then these, which
came from the owner playing the first build.

## The result screen is a sequence

What failed: the number, a paragraph naming every wave that hurt, fifteen line items, three track
bars, a luck dial and eleven unlock cards, all at once. The owner: "Entirely too much data here.
this should be legible at a glance via symbols or charts", "if it's essential, we need to start it
hidden in a closed menu", "they look like buttons but I can't click them", "if those are things I
unlocked, there should be a staged unlocks experience".

What passed, in beats, a tap anywhere moving it on and a timer moving it for someone who does not
tap:

1. **The number** ("6 waves"), the game's one line of stats, and one short line on how it ended
   ("Fell on wave 7", "Ended on wave 7", "Threat 1 opens"). No cause paragraph: the drawing of
   the run behind the screen shows the leaks.
2. **One counter**: the currency glyph and "+102" counting up, then "102 in hand".
3. **Each unlock alone**, in the middle of the screen, in a panel with no button chrome: a small
   "NEW" tag, a glyph, the name, a few words, dots for how many are coming. 2.6 s or a tap each.
   The glyphs are drawn in the game's own line style (`cardIcon`: an item draws as itself, a
   system as a glyph).
4. **The buttons**: Launch, Spend, "…" (opens the line items), Home. Nothing else. Share, Video
   and Credits went on request.

The track bars and the luck dial moved to the meta screen (the Hangar). The luck line in numbers
(roll, tier, price factor, top-tier odds, pool size) sits in the pause panel.

A run that opens many cards at once (a strong first run fires every first-clear card) is many
taps. If the owner minds, hand out at most two or three per death and hold the rest.

## Cards say what they do, in a few words

"too many words, most of them don't make sense to me". A card line is what the thing does for the
player in under ten everyday words: "Shop before the first wave", "Roll the shop again", "Cities
take one more hit". Never the rule ("After waves 1, 3, 6, 9 and 12: two cards, take one or pass
for 40"). Item cards keep the game's own name and line.

## The shop

Bases over powerups, prices on each card, a thin stripe on the left edge for a tier above common
(uncommon cool, rare gold). Reroll sits left of Go once the profile has it, priced on the button
("Reroll 60"), the first one free. Locked slots are not shown; a small pool just shows fewer cards.
Run 1's shops are fixed so no first-timer sees a shop with no damage in it.

## Gambles

The pair takes the shop's place: two wide cards with a kind stripe (blessing cool, mixed gold,
curse red), no icon, the name and one line; a Pass button with its money ("Pass +60") where Go
was. Picking one opens the shop with no second wave-clear flourish.

## The meta screen (the Hangar)

A closed menu: hidden from the title until the first death, opened from the result screen by
Spend (and it ends in Launch when opened from there). Top: the tracks (Rank, Frontier,
Blueprints, the next rank of the felt node with "64 of 80"). Then the tree: name, pips for ranks,
one line and the step per rank ("+1 on a Hornet a rank"), a buy button showing the cost. Then
every item as a tile: unlocked ones by icon and name (a "?" after the name until bought once),
locked ones a "?" that three fragments open. The item grid waits for its own card.

## Chrome appears when it means something

The Hangar button, the Spend button, the reroll button, the luck toast at launch: each is hidden
until the profile has the thing. A bar that would read "complete" is cut.

## Anything timed fires from a fixed, visible place

The weapon fired "from the start city, or the nearest one standing"; the owner could not time
shots. It now fires from its own emplacement right of the start city, a small dome with a barrel
that follows the reticle and brightens as the charge returns. Upgrades to it target the
emplacement, which breathes a ring while one is picked.
