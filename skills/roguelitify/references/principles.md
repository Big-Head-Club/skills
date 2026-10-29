# Why Hades and Balatro are addictive, and what any game can take from them

## Thesis

Both games keep one promise: no run is wasted. Hades pays it through seven currencies, a permanent stat tree priced so the first death buys a rank, and a story that only moves when you die. Balatro pays it with no currency at all: 75 unlockables that fire on deeds a losing run can do, and a collection full of blanks that any purchase fills. Both keep randomness high but readable, sell the player tools to tilt the dice, and put the first wall early so the first loss teaches instead of stings. The pull is not a calendar hook or a slot trick. It is that every run ends with something bought, something new to try, and a next goal the player can name.

## The principles, ranked by how hard they drive "one more run"

### 1. Every run pays, and death pays most

Each run must bank something permanent before it ends, whatever the outcome. Pay through several channels at once so the death screen reads as a reward screen.

**Hades.** Kasavin's mantra: "every run counts" (Tom's Guide). The room generator steers toward meta-currency doors at a target of 45% in Tartarus, 40% in Asphodel and 33% in Elysium, with a feedback weight of 10, so a string of Darkness doors makes a boon door near certain next (HeroData.lua, RoomManager.lua; wiki Chamber_Reward). Nearly every death plays new dialogue from a pool of over 300,000 words and 21,000 lines (Supergiant infographic via Nintendo Wire). Kasavin: "take the sting out of failure" (Inlander).

**Balatro.** 75 unlockables (45 Jokers, 14 decks, 16 vouchers) tied to deeds, not currency (balatrowiki Unlockables). Mr. Bones unlocks by losing 5 runs. Four decks unlock at 20/50/75/100 items discovered, win or lose. Lifetime counters (play 2,500 cards, spend $2,500) move on every run.

### 2. Make failure cheap and restart instant

Losing should cost time and nothing else. A cursed run must be cheap to abandon, and the restart the easiest button on screen.

**Balatro.** No character, health or enemies; LocalThunk wanted it "as low stakes as a crossword or a sudoku puzzle" (localthunk.com/blog/solitaire). A loss shows stats and keeps every counter.

**Hades.** Bosses sit at fixed chambers 14, 24 and 36 (wiki Chambers_and_Encounters); fan guides put a full escape at 20-60 minutes. God Mode is an opt-in setting: 20% damage resistance, +2% per run that ends in death, cap 80%, kept when toggled off (TheGamer; Fandom God_Mode). Failure itself becomes a stat.

### 3. Price the first upgrade below one lost run

The first meta purchase must be affordable from the first death. Then ramp costs so the list never runs dry.

**Hades.** Mirror talents open at 10-30 Darkness: Shadow Presence 10, Chthonic Vitality 10, Death Defiance 30. A normal room pays 10 Darkness, so three rooms fund an extra life. Death Defiance ranks 2-3 cost 500 and 1,000; Fated Authority tops out at 2,250 a rank; fan tallies put everything maxed near 35,000 (Fextralife Mirror_of_Night; Questline Hero). Rogue Legacy did the same move harder: all spending happens right after death, and Charon takes leftover gold on entry, so every run ends in a purchase (Lee, GDC 2014 transcript, pp. 10-31).

**Balatro** has no currency layer; see principle 7.

### 4. Score with a product and sell momentum

Score should be two stats multiplied. Sell cheap additive pieces everywhere, gate the multipliers, and ship pieces that pay nothing now and more each turn.

**Balatro.** Chips x Mult from the first prototype (LocalThunk timeline). +chips and +mult grow linear, Planet levels quadratic, stacked xMult exponential (mattgreer.dev). Hologram: +x0.25 per card added to the deck; Blueprint copies a neighbour. Joker odds: 70% Common, 25% Uncommon, 5% Rare; the five Legendaries come only from The Soul, a 0.3% roll per pack card (balatrowiki Jokers, The_Soul). Five Joker slots, so a Rare pull means selling something.

**Hades.** Duo boons need one boon from each of two gods; 28 duos across 8 gods (wiki Duo_Boons). The Legendary roll is 12% per offered option, but only fires once prerequisites are held (HeroData.lua). Once boons from four gods are held, later doors draw only from those four (RunManager.lua, maxLootTypes = 4).

### 5. Keep randomness bounded and readable

Show three choices, not thirty. Draw from a shuffled bag so no category starves, and cap each modifier's text so the player can compose builds in their head.

**Hades.** Doors and boons offer at most 3 options (Intermittent Mechanism). Chamber rewards draw without replacement from a bag of 2 hearts, 2 gold, 3 boons, 2 Poms, 2 Hammers, 1 Hermes, 1 Trial, refilled when empty (LootData.lua). Hammers cap at two per run, one early, one in Elysium (wiki Daedalus_Hammer). Bosses are the same characters every time.

**Balatro.** LocalThunk's development rule: no Joker text over four lines and 20 words (Game Informer, March 2024). Bosses rotate by fewest appearances, so none repeats before all 28 have shown (balatrowiki Blinds_and_Antes). The shop has 2 card slots; reroll starts at $5 and rises $1 each time (balatrowiki Shop).

### 6. Let the player pick their variance

Offer a sure small reward against a random big one at fixed points. The player who feels cursed gambles, the one who feels blessed banks, and either way they chose.

**Balatro.** Skip a Small or Big Blind for one of 24 Tags (Investment: +$25 after the boss; Negative: next Joker free and Negative), forfeiting the blind's cash, interest and the shop (balatrowiki Tags). Interest pays $1 per $5 held, cap $5, so $25 is a savings target that competes with buying now (balatrowiki Interest). Stakes stack eight tiers of opt-in penalties per deck.

**Hades.** Chaos gates cost health, curse you for 3-4 fights, then bless you for the run; spawn odds 15% per room in Tartarus, 7.5% Asphodel, 5% Elysium (TraitData.lua, room data). Skull doors preview a harder fight with doubled rewards (wiki Chambers_and_Encounters). The Pact of Punishment unlocks after the first win: 15 named conditions, 63 Heat, built a la carte (TheGamer).

### 7. Meta buys options and luck; cap raw power

Unlocks should widen the pool and tilt the dice. Raw stat growth should be small and capped so difficulty tiers still bite.

**Hades.** Olympian Favor: +1% Rare per rank, 40 ranks; Gods' Legacy: +1% Legendary per rank, 10 ranks; Fated Authority and Fated Persuasion sell rerolls (Fextralife Mirror_of_Night). A god keepsake forces that god's next boon.

**Balatro.** Zero stat buffs. Every run starts with $4, 4 hands and 52 cards; the biggest starting edge is the Yellow deck's +$10 (balatrowiki Decks). A Steam thread asked for Isaac-style permanent power; players defended the design as what keeps runs a real test (Steam thread 596263009070937123). Both models hold. A game that wants both must cap the vertical side.

### 8. Show the ladder and the next rung

Every gate should be visible and every counter should tick where the player can see it. A losing run should advance something they can point to.

**Balatro.** Locked Collection entries print the condition; cumulative ones show progress (balatrowiki Unlockables; playbalatro FAQ). 105 Jokers are unlocked from run one but show as "?" until bought. 15 decks x 8 stakes make a 120-win grid. LocalThunk: unlocks exist "to force players to get out of their comfort zone" and to give fans "a sort of checklist" (localthunk.com/blog/solitaire).

**Hades.** The Fated List: about 60 prophecies, bought for 20 Gemstones in the first few runs, paying rare currencies for "do X once" tasks (Screen Rant; TheGamer). Slay the Spire scores every run and spends the total on five unlock tiers per character (slaythespire.info).

### 9. Reward variety with first-time drops

Tie the rarest rewards to "first time with X." Variety then becomes the only farm.

**Hades.** Titan Blood drops once per boss, per weapon, per Heat level; six weapons, four Aspects each, 306 Titan Blood in total (GamesRadar; TheGamer). Dark Thirst marks one random weapon per run, never the one you just used, for +20% Darkness (GameRant).

**Balatro.** Win without a Pair to unlock The Duo (X2 Mult with a Pair); The Trio X3, The Family X4 (TheGamer; balatrowiki Jokers). The reward is the thing you were denied.

### 10. Tune the wall on real deaths

Put the first wall at a fixed early point so a new player dies on schedule. Then move it by watching where real runs die.

**Balatro.** Base chips by ante: 300, 800, 2,000, 5,000, 11,000, 20,000, 35,000, 50,000; the early ratios are 2.67x, 2.5x, 2.5x, 2.2x (balatrowiki Blinds_and_Antes). Patch 1.0.1c cut ante 3 from 2,800 to 2,000 and ante 4 from 6,000 to 5,000 at White Stake (balatrowiki Update_1.0.1c). Steam: 89.9% reach ante 4, 74.6% reach ante 8, 71.7% win, 12.2% win at Gold (Steam stats, 2026-09-24).

**Hades.** 21 months of Early Access (Dec 2018 to Sept 2020). Steam: 81.9% clear Tartarus, 72.4% Asphodel, 59.0% Elysium, 46.9% escape. The biggest single drop, 18 points, comes before the first boss.

## Cursed vs blessed: the levers

The bible is that some runs feel cursed and some feel touched by god. Both games get there the same way: several independent gates that must line up, so the result is fat-tailed, and the player can name which gate failed.

**Multiply gates, don't roll once.** In Hades a blessed run needs the god pool to fill with allies, a duo prerequisite to land, a 12% per-option roll to fire on an eligible slot, and the bag to hand you a boon door when you need it. One player's estimate: a targeted Legendary about 86% of the time by late Elysium with Gods' Legacy and rerolls, "every other run or so" without (Steam thread, player figures). Most runs are ordinary; a few are cursed; a few are golden.

**Make growth classes differ.** Balatro's cursed run is the one with no scaling or copy piece by ante 4, stuck linear against a 2.5x curve. The blessed run is two x3 Jokers (x9), a Polychrome and a Blueprint: exponential against a fixed schedule, so the score passes 50,000 and keeps climbing to the ante 39 overflow (mattgreer.dev; Wikipedia).

**Narrow the pool as the run goes.** Hades' four-god cap turns early picks into a commitment. Lock in four gods that do not combine and the run cannot recover its offers. That is what "cursed" feels like when it is fair: you can point at chamber 3.

**Make the top tier loud.** Larche et al. (2019): Legendary drops produced arousal 3.39 vs 1.46 for rare, and an urge to open more of 44.2 vs 25.4. Give the jackpot its own colour, sound and delay.

**Sell debt.** Chaos gates let a run with no momentum buy some: a 3-4 fight curse for a permanent buff. Balatro's Spectral cards do the same in one card: Ankh copies a Joker and destroys the rest; Wraith gives a Rare and sets money to $0.

**Keep it fair with three rails.** First, draw-without-replacement caps droughts. Second, pity rotation on the punishing side: no Balatro boss repeats before all have shown. Third, rerolls and rarity odds are purchasable, so meta lets the player tame luck without removing it.

**Randomize when, not whether.** Variable-ratio schedules produce a steady, rapid response rate and the most resistance to extinction (Ferster and Skinner 1957, via Wikipedia). The good drop must always be coming; only its timing should vary.

**Trace every near-miss to a choice.** Clark et al. (2009, Neuron): near-misses feel worse than plain losses but raise the urge to play again, only when the player picked the icon; computer-chosen near-misses cut the urge. Meier (GDC 2010): a 3:1 edge (1.5 vs 0.5) feels like certainty, and his fix in Civilization Revolution was to skew results toward the player and break loss streaks. A blessed run should be tilted harder than its label; a cursed run must show a choice the player could have made.

**Hide the roll, show the plan.** Balatro shows the hand type and base chips, then hides the final score until the machine fires. LocalThunk refused an optional preview because "people are just going to click on it" (GMTK; Aftermath).

## The first hour: early deaths as progress

**Hades.** The first wall is Megaera at chamber 14, a recurring character who talks about beating you. Fan accounts put the first escape at run 20-50, most saying 20-30. Before that, each death does four things: the Mirror opens and a 10-Darkness rank is affordable; Death Defiance costs 30, three rooms' worth; the Codex arrives after attempt 3; Hypnos greets you with one of 75 lines keyed to how you died. The alternate Mirror talents unlock at 300 Darkness collected, one more beat inside the first few runs. The Fated List appears within the first few runs and starts short. God Mode is there for the player who keeps dying, ratcheting up 2% per death.

**Balatro.** Ante 1 costs the same 300 chips at every stake, so a hard mode starts like easy mode. The first shop always holds a Buffoon pack. Showman unlocks at ante 4 and Flower Pot at ante 8 whether you win or lose, so the two milestones most first-hour players hit each drop a Joker. Every purchase turns a "?" into a card; there are 105 of them from run one. The first win then pays on every axis at once: Blueprint, a new deck, Red Stake for that deck, and the Heads Up achievement.

**The neighbours agree.** Slay the Spire's Neow offers 2 options if your last run missed the Act 1 boss and 4 if it reached him, so the menu itself grows with progress (wiki Neow). Vampire Survivors fires unlocks on minutes alive and levels reached: 97.8% survive one minute, 84% reach twenty, and each threshold drops a weapon (Steam stats; VS wiki). Rogue Legacy moved all spending to the moment after death, which Lee says "gave that one more time feel" (GDC 2014).

**Frame the loss as an unbanked gain.** Losses weigh about twice equal gains (Kahneman-Tversky lineage; Engelstein 2020). The end screen should say "you banked X," never "you lost Y." Permanent unlocks are never revoked.

## Checklist: what a game must do to earn "one more run"

Each item is testable. Pass or fail.

1. The first death can afford at least one permanent purchase.
2. A run that dies in wave 2 changes at least two persistent things (currency, counter, line, blank filled).
3. At least one unlock only losing can trigger.
4. The spend step sits between death and the next run, and the whole gap takes under 30 seconds.
5. No permanent progress is ever revoked outside a mode the player opted into.
6. Every locked item shows its condition; cumulative ones show live progress.
7. Score is a product of two stats, and at least one piece class grows exponentially with copies.
8. Every modifier reads in one sentence, under 20 words.
9. Offers show at most three options.
10. Per-run rewards draw without replacement, so no category is absent for a whole cycle.
11. Threats rotate with pity: no boss or hazard repeats before all have appeared.
12. The jackpot tier sits at 3-5% per offer, with a rarer top tier under 1%, and looks and sounds different.
13. The jackpot is gated on state the player built, not on luck alone.
14. Each run holds at least one opt-in gamble: a sure small reward against a random big one.
15. Each run holds at least one debt item: a bounded penalty now for a permanent buff later.
16. Meta progression sells luck (rarity odds, rerolls, forced faction) as well as stats.
17. Vertical stat growth is capped so the top difficulty tier still bites in wave 1.
18. The first wall sits at a fixed early point, and death-by-stage is logged so it can be moved.
19. Every near-miss traces back to a choice the player made, and the game shows how close they came.
20. The plan is fully visible before it fires; the result is hidden until it does.
21. A difficulty ladder above the base adds one constraint per tier and unlocks by winning the tier below.
22. A matrix of first-time-with-X rewards lasts at least 100 runs.
23. A rotating per-run bonus loadout steers the player off their comfort pick.
24. An opt-in assist ramps per death, visibly, and keeps its value when toggled off.
