// The meta game (roguelite, 2026-09-24): the profile that outlives a run, the ladder of guaranteed
// unlocks, the tree, the Fate roll, what a run pays and what it unlocks. Pure: no DOM, no clock, no
// Math.random. The client stores the profile; `runConfig` turns it into the `run` option that
// createRun reads, and `payout` + `advance` turn a finished run back into a profile.
//
// Design: docs/design/roguelite-spec.md

import { DRONE_ORDER, UPGRADE_ORDER, UPGRADES, ECONOMY, RARITY, STRIKE, SPEC, OMEN_WAVES, OMEN_MIX } from "./config.js"
import { stream, hash } from "./rng.js"

const floor = Math.floor, max = Math.max, min = Math.min, round = Math.round
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)

export const PROFILE_V = 1

// ---- the profile -----------------------------------------------------------------------------------

export function newProfile() {
  return {
    v: PROFILE_V,
    runs: 0, // runs started
    deaths: 0, // qualifying deaths (the run cleared wave 1); the Rank track
    best: 0, // best wave cleared
    reachedBest: 1, // highest wave reached
    cleared: {}, // wave -> times cleared
    reached: {}, // wave -> times reached
    bought: {}, // item id -> times bought over all runs (the first fills a "?")
    seen: {}, // rocket type -> times seen
    consoled: {}, // best-wave value -> the once-only consolation was paid
    w: 0, // Wreckage in hand
    lifetimeW: 0,
    fragments: 0, // Blueprint fragments: 3 buy any locked Blueprint item
    tree: {}, // node id -> rank bought
    unlocked: [], // ladder card ids taken, in order
    blueprints: [], // items bought with fragments
    wins: 0,
    threat: 0, // the Threat level the next run plays at (opened by wins)
    fates: [], // the last rolled Fates, newest last (streaks)
    paid: [], // the last seeds paid, so a run pays once
    lifetime: { kills: 0, strikes: 0, struck: 0, waves: 0, seconds: 0, cursesCleared: 0 },
    settings: {},
  }
}

export function loadProfile(saved) {
  if (!saved || saved.v !== PROFILE_V) return newProfile()
  return { ...newProfile(), ...saved, lifetime: { ...newProfile().lifetime, ...(saved.lifetime || {}) } }
}

// ---- the ladder --------------------------------------------------------------------------------------
// Every trigger hands out its cards the first time it fires; a card is a drone, a powerup, a system
// or a stat. `at` says what the trigger is: { death: n } the n-th qualifying death, { wave: n } the
// first clear of wave n.

export const LADDER = [
  { at: { death: 1 }, cards: ["prewave", "omens", "fate", "kite"] },
  { at: { death: 2 }, cards: ["shop2x2", "hangar", "rate", "shot", "split", "laser12", "tierU", "reroll"] },
  { at: { death: 3 }, cards: ["warden", "cooldown", "hardened", "shop3x2"] },
  { at: { death: 4 }, cards: ["picket", "charge", "shop3x3"] },
  { at: { death: 5 }, cards: ["weaver"] },
  { at: { death: 8 }, cards: ["plating"] },
  { at: { wave: 3 }, cards: ["mint", "radius"] },
  { at: { wave: 4 }, cards: ["laser15"] },
  { at: { wave: 5 }, cards: ["ram", "tierR"] },
  { at: { wave: 7 }, cards: ["laser4"] },
  { at: { wave: 8 }, cards: ["flak"] },
  { at: { wave: SPEC.winWave }, cards: ["threat"] },
]
// later content, cut from v1 on review: Manifest, Wager and Dare, Loadouts, Tempt Fate, Pass and its
// Tags, the Mastery deeds and their items, the mythic tier, skins
// what each card is, for the screens
export const CARDS = {
  prewave: { kind: "system", name: "Pre-wave shop", line: "Shop before the first wave." },
  omens: { kind: "system", name: "Omens", line: "Two cards between waves. Take one, or pass." },
  fate: { kind: "system", name: "Fate", line: "Every run rolls its luck." },
  shop2x2: { kind: "stat", name: "Bigger shop", line: "A second base to choose from." },
  shop3x2: { kind: "stat", name: "Wider shop", line: "A third base to choose from." },
  shop3x3: { kind: "stat", name: "Full shop", line: "A third powerup to choose from." },
  hangar: { kind: "system", name: "The Hangar", line: "Everything you have, and everything you don't yet." },
  reroll: { kind: "system", name: "Reroll", line: "Roll the shop again." },
  plating: { kind: "stat", name: "Plating", line: "Cities take one more hit." },
  laser12: { kind: "stat", name: "Wider laser", line: "The laser blast grows." },
  laser15: { kind: "stat", name: "Command laser", line: "The laser blast at full size." },
  laser4: { kind: "stat", name: "Heavy laser", line: "The laser hits twice as hard." },
  tierU: { kind: "stat", name: "Uncommon finds", line: "Uncommon items can show in the shop." },
  tierR: { kind: "stat", name: "Rare finds", line: "Rare items can show in the shop." },
  threat: { kind: "system", name: "Threat", line: "A harder sky, and more Wreckage for holding it." },
}
for (const id of [...DRONE_ORDER, "mint"]) CARDS[id] = { kind: "launcher", name: id[0].toUpperCase() + id.slice(1), line: "" }
for (const id of UPGRADE_ORDER) CARDS[id] = { kind: "upgrade", name: UPGRADES[id].name, line: UPGRADES[id].line }

export const has = (p, card) => p.unlocked.includes(card) || p.blueprints.includes(card)

// what run 1 holds before any card: one drone, five common powerups (the starter kit)
const KIT = { launchers: ["hornet"], upgrades: ["cap", "speed", "spread", "reach", "swap"] }
// run 1's three shops are fixed, not rolled: no first-timer gets a shop with no damage in it
// bots set these (2026-09-24): after wave 1 the bank is 196-223, so shop 1 is Faster drones now or save
// for a drone next shop; a bought drone before wave 2 made wave 3 too easy at any price under 230
const FIXED_SHOPS = [["hornet:245", "cap:230", "speed:190"], ["hornet:250", "spread:200", "reach:240"], ["hornet:275", "swap:150", "reach:260"]]

// the items a profile can be offered
export function unlockedPool(p) {
  const launchers = [...KIT.launchers, ...DRONE_ORDER.filter((id) => !KIT.launchers.includes(id) && has(p, id))]
  const upgrades = [...KIT.upgrades, ...UPGRADE_ORDER.filter((id) => !KIT.upgrades.includes(id) && has(p, id))]
  return { launchers, upgrades, mint: has(p, "mint") }
}
// the "?" grid: every item, and whether it is unlocked and whether it has ever been bought
export function hangar(p) {
  const pool = unlockedPool(p)
  const row = (id, kind) => ({ id, kind, unlocked: kind === "launcher" ? pool.launchers.includes(id) || (id === "mint" && pool.mint) : pool.upgrades.includes(id), bought: (p.bought[id] || 0) > 0, tier: RARITY[id] })
  return [...DRONE_ORDER.map((id) => row(id, "launcher")), row("mint", "launcher"), ...UPGRADE_ORDER.map((id) => row(id, "upgrade"))]
}

// ---- the tree ------------------------------------------------------------------------------------------
// Vertical nodes are small and capped; Swarm restores the shipped drone counts and is the one big
// felt step; the rest are horizontal (they change decisions, not numbers).

// Cut on review (2026-09-24): the +2% nodes (shots, pads, salvage, reload) changed nothing a player
// could feel and drained what Swarm needs; Fate lens and Scrapyard were sold before they existed.
export const TREE = {
  swarm: { name: "Swarm", line: "Pads hold more drones: a Hornet one more each rank, the rest in step.", per: "+1 on a Hornet", costs: [80, 120, 180, 260, 360] },
  chest: { name: "War chest", line: "Start with more money.", per: "+20", costs: [20, 30, 45, 60] },
  reroll: { name: "Extra reroll", line: "One more reroll per shop.", per: "+1", costs: [30, 50, 80] },
  dice: { name: "Dice weight", line: "Fate rolls one higher.", per: "+1", costs: [15, 20, 25, 30, 40] },
  pity: { name: "Sharp pity", line: "Pity starts after 3 misses, not 4.", per: "", costs: [35] },
  eater: { name: "Curse eater", line: "A cleared curse pays 6 Wreckage, not 4.", per: "", costs: [35] },
}
export const treeRank = (p, id) => p.tree[id] || 0
export const treeCost = (p, id) => TREE[id].costs[treeRank(p, id)] ?? null // null: maxed
export const canBuyNode = (p, id) => treeCost(p, id) != null && p.w >= treeCost(p, id)
export function buyNode(p, id) {
  const cost = treeCost(p, id)
  if (cost == null || p.w < cost) return false
  p.w -= cost
  p.tree[id] = treeRank(p, id) + 1
  return true
}
const chestMoney = (n) => 20 * n

// ---- fate ------------------------------------------------------------------------------------------------

export const FATE_TIERS = [["forsaken", 0], ["cursed", 15], ["unsteady", 35], ["favored", 60], ["touched", 85]]
export const fateTier = (f) => FATE_TIERS.reduce((t, [name, lo]) => (f >= lo ? name : t), "forsaken")
export const FATE_NAMES = { forsaken: "Forsaken", cursed: "Cursed", unsteady: "Unsteady", favored: "Favored", touched: "Touched" }

// the roll: two dice, so the middle is common and the ends are rare (4.5% each end); the profile's
// dice weight nudges it; two bad rolls in a row make the next the better of two, two Touched the worse
// Keyed to the profile's progress, not the run's seed: ending a run before wave 1 and launching again
// rolls the same Fate, so there is nothing to fish for.
export function rollFate(p, seed) {
  const r = stream("fate", p.deaths, p.wins, p.lifetimeW, p.best, p.fragments)
  const one = () => clamp(floor((r.next() + r.next()) * 50) + treeRank(p, "dice"), 0, 100)
  let f = one()
  const last = p.fates.slice(-2)
  if (last.length === 2 && last.every((x) => x < 35)) f = max(f, one())
  else if (last.length === 2 && last.every((x) => x >= 85)) f = min(f, one())
  return f
}
// how Fate shapes a run: pool size, odds shift, prices, the omen bag, and the hardship multiplier
const POOL_BY_TIER = { forsaken: [4, 7], cursed: [4, 8], unsteady: [5, 9], favored: [5, 9], touched: [6, 10] }
export const fatePriceK = (f) => 1.15 - 0.3 * f / 100
export const fateHardship = (f) => (f < 15 ? 1.5 : f < 35 ? 1.25 : 1)
// what the tier does to the fight itself: a Touched run flies one more drone per pad and starts richer;
// a Forsaken run has a narrower laser and starts poorer. Rockets never change.
const FATE_FIGHT = { forsaken: { swarm: 0, money: -40, radius: -2 }, cursed: { swarm: 0, money: -20, radius: 0 }, unsteady: { swarm: 0, money: 0, radius: 0 }, favored: { swarm: 0, money: 40, radius: 0 }, touched: { swarm: 1, money: 80, radius: 1 } }

// ---- the run config -----------------------------------------------------------------------------------
// The one object the sim reads. Everything in it is a pure function of the profile and the seed.

export const rankOf = (p) => (has(p, "shop3x3") ? 4 : has(p, "shop3x2") ? 3 : has(p, "shop2x2") ? 2 : has(p, "prewave") ? 1 : 0)
// slots by rank: run 1 fixed, then 1+2, 2+2, 3+2, 3+3: every card adds a slot
const SHOP_SLOTS = [[1, 2], [1, 2], [2, 2], [3, 2], [3, 3]]
function shopOdds(p, fate) {
  const tiers = has(p, "tierR") ? 3 : has(p, "tierU") ? 2 : 1
  let odds = tiers === 4 ? { c: 60, u: 27, r: 10, m: 3 } : tiers === 3 ? { c: 72, u: 22, r: 6, m: 0 } : tiers === 2 ? { c: 85, u: 15, r: 0, m: 0 } : { c: 100, u: 0, r: 0, m: 0 }
  if (has(p, "fate")) {
    // rare odds move with Fate; mythic a little, once it exists; the rest comes from common
    const dr = tiers >= 3 ? (fate - 50) / 8 : 0
    const dm = tiers >= 4 ? (fate - 50) / 25 : 0
    odds = { c: odds.c - dr - dm, u: odds.u, r: odds.r + dr, m: odds.m + dm }
    for (const k in odds) odds[k] = max(0, odds[k])
  }
  return odds
}

export function runConfig(p, seed) {
  const pool = unlockedPool(p)
  const fated = has(p, "fate")
  const fate = fated ? rollFate(p, seed) : 50
  const tier = fateTier(fate)
  // Fate draws the run's pool from the unlocked set; Split targets and Longer reach are always in
  const r = stream(seed, "pool")
  const [nL, nU] = POOL_BY_TIER[tier]
  const launchers = fated ? r.shuffle(pool.launchers).slice(0, nL) : pool.launchers
  if (!launchers.includes("hornet")) launchers.unshift("hornet")
  const must = pool.upgrades.filter((u) => u === "split" || u === "reach")
  const upgrades = fated ? [...must, ...r.shuffle(pool.upgrades.filter((u) => !must.includes(u))).slice(0, max(0, nU - must.length))] : pool.upgrades
  // Touched runs always hold a multiplier
  if (fated && tier === "touched" && !upgrades.some((u) => u === "shot" || u === "rate")) { const m = pool.upgrades.find((u) => u === "shot" || u === "rate"); if (m) upgrades.push(m) }
  const rank = rankOf(p)
  const fight = fated ? FATE_FIGHT[tier] : FATE_FIGHT.unsteady
  const laser = { radius: max(8, (has(p, "laser15") ? 15 : has(p, "laser12") ? 12 : 10) + fight.radius), dmg: has(p, "laser4") ? STRIKE.dmg : 2 }
  return {
    v: 1, rank, fate, tier, fated,
    pool: { launchers, upgrades, mint: pool.mint },
    // 50: with wave 1's pay the first shop can buy Faster drones, or save. The pre-wave shop comes
    // with 160, so its first shop can buy a switch or save for a Hornet
    startMoney: max(40, (has(p, "prewave") ? 160 : 50) + chestMoney(treeRank(p, "chest")) + fight.money),
    cityHp: SPEC.cityHp + (has(p, "plating") ? 1 : 0),
    swarm: min(5, treeRank(p, "swarm") + fight.swarm),
    mods: { shot: 1, rate: 1, salvage: 1, reload: 1 },
    laser,
    shop: { bases: SHOP_SLOTS[rank][0], ups: SHOP_SLOTS[rank][1], odds: shopOdds(p, fate), priceK: fated ? fatePriceK(fate) : 1, rerolls: has(p, "reroll") ? ECONOMY.rerolls.free + treeRank(p, "reroll") + ECONOMY.rerolls.prices.length : 0, pityAt: treeRank(p, "pity") ? 3 : 4 },
    fixedShops: rank === 0 ? FIXED_SHOPS : null,
    prewave: has(p, "prewave"),
    omens: has(p, "omens") ? { waves: OMEN_WAVES, mix: OMEN_MIX[tier] } : null,
    win: SPEC.winWave,
    threat: p.threat,
    start: "hornet",
  }
}

// the full game, for the title's demo, the bots and the tests: everything unlocked, shipped numbers
export function fullRun() {
  return {
    v: 1, rank: 4, fate: 50, tier: "unsteady", fated: false,
    pool: { launchers: DRONE_ORDER.slice(), upgrades: UPGRADE_ORDER.slice(), mint: true },
    startMoney: ECONOMY.startMoney, cityHp: SPEC.cityHp, swarm: 5,
    mods: { shot: 1, rate: 1, salvage: 1, reload: 1 },
    laser: { radius: STRIKE.radius, dmg: STRIKE.dmg },
    shop: { bases: 3, ups: 3, odds: { c: 60, u: 27, r: 10, m: 3 }, priceK: 1, rerolls: 0, pityAt: 4 },
    fixedShops: null, prewave: false, omens: null, win: 0, threat: 0, start: "hornet",
  }
}

// ---- what a run pays -----------------------------------------------------------------------------------
// Frontier-weighted: first clears pay most, a wave already cleared pays a fifth, and the once-only
// lines (consolation, first sightings, first buys) can't be farmed. Hardship pays on the rolled Fate.

export function payout(p, s) {
  const lines = []
  let cat = "waves"
  const add = (name, w) => { if (w > 0) lines.push({ name, w, cat }) }
  const waves = s.wavesDone
  const st = s.stats
  // a run ended by hand pays nothing, and a run already paid pays nothing again
  if (waves < 1 || s.result?.surrendered || p.paid.includes(s.seed)) return { lines, total: 0, qualifies: false }
  // the frontier lines: first clears at this Threat, reaching further; hardship and Threat multiply these only
  const T = s.run.threat || 0
  const key = (n) => (T ? `${T}:${n}` : String(n))
  let frontier = 0
  add("Cleared wave 1", 3)
  for (let n = 1; n <= waves; n++) {
    const first = !(p.cleared[key(n)] > 0)
    // a wave already cleared pays a fifth, twice that within two of the best: the push pays, the farm doesn't
    const again = max(1, floor((6 + 2 * n) * 0.2)) * (n >= p.best - 1 ? 2 : 1)
    add(first ? `First clear of wave ${n}` : `Wave ${n} again`, first ? 6 + 2 * n : again)
    if (first) frontier += 6 + 2 * n
  }
  if (s.wave > p.reachedBest) { add(`Reached wave ${s.wave}`, 5); frontier += 5 }
  cat = "firsts"
  for (const id of Object.keys(st.bought || {})) if (!(p.bought[id] > 0)) add(`First ${CARDS[id]?.name || id}`, 1)
  for (const t of Object.keys(st.seen || {})) if (!(p.seen[t] > 0)) add(`First ${t}`, 2)
  cat = "play"
  const near = (n) => n >= max(1, p.best - 1)
  add("Clean waves", (st.cleanWaves || []).filter(near).length)
  add("Laser waves", (st.laserWaves || []).filter(near).length)
  const curses = (st.curses || []).filter((c) => c.cleared && !c.forced).length
  add("Curses cleared", min(3, curses) * (treeRank(p, "eater") ? 6 : 4))
  cat = "waves"
  if (s.result?.won) { add("The win", 40); frontier += 40 }
  if (!s.result?.won && waves === p.best && waves > 0 && !p.consoled[waves]) add("Held the line", 5)
  cat = "fate"
  let total = lines.reduce((a, l) => a + l.w, 0)
  const k = s.run.fated ? fateHardship(s.run.fate) : 1
  if (k > 1 && frontier) { const extra = floor(frontier * (k - 1)); add(k === 1.5 ? "Forsaken" : "Cursed", extra); total += extra }
  if (T && frontier) { const extra = floor(frontier * 0.25 * T); add(`Threat ${T}`, extra); total += extra }
  // a death counts toward Rank only when the run reached the wave its number asks for (death N: wave min(N, 3))
  const qualifies = !s.result?.won && s.wave >= min(p.deaths + 1, 3)
  return { lines, total, qualifies, frontier }
}

// ---- what a run unlocks -----------------------------------------------------------------------------
// Applies the payout, moves the tracks, and returns the cards this run opened, in order.

export function advance(p, s, pay) {
  const st = s.stats
  const waves = s.wavesDone
  const opened = []
  p.runs++
  if (s.result?.surrendered) return opened // nothing moves: no pay, no death, no Fate streak
  p.w += pay.total
  p.lifetimeW += pay.total
  p.paid = [...p.paid.slice(-49), s.seed]
  const T = s.run.threat || 0
  for (let n = 1; n <= waves; n++) { const k = T ? `${T}:${n}` : String(n); p.cleared[k] = (p.cleared[k] || 0) + 1 }
  for (let n = 1; n <= s.wave; n++) p.reached[n] = (p.reached[n] || 0) + 1
  for (const id of Object.keys(st.bought || {})) p.bought[id] = (p.bought[id] || 0) + st.bought[id]
  for (const t of Object.keys(st.seen || {})) p.seen[t] = (p.seen[t] || 0) + st.seen[t]
  if (!s.result?.won && waves === p.best && waves > 0) p.consoled[waves] = true
  p.best = max(p.best, waves)
  p.reachedBest = max(p.reachedBest, s.wave)
  const L = p.lifetime
  // every 500 lifetime kills pays a fragment, so the Blueprint track never stops moving
  const before = floor(L.kills / 500)
  L.kills += st.kills; L.strikes += st.strikes; L.struck += st.struck; L.waves += waves; L.seconds += floor(s.t)
  L.cursesCleared += (st.curses || []).filter((c) => c.cleared).length
  p.fragments += floor(L.kills / 500) - before
  if (s.run.fated) p.fates = [...p.fates.slice(-4), s.run.fate]
  if (s.result?.won) { p.wins++; p.threat = p.wins }
  // Rank: a death counts if the run reached the wave its number asks for (death N: wave min(N, 3)) and the cities fell
  if (pay.qualifies && !s.result?.won) { p.deaths++; p.fragments++ }
  // with nothing left to open, three fragments are worth 30 Wreckage
  if (p.fragments >= 3 && !hangar(p).some((h) => !h.unlocked)) { p.w += 30 * floor(p.fragments / 3); p.fragments = p.fragments % 3 }
  const take = (cards) => { for (const c of cards) if (!has(p, c)) { p.unlocked.push(c); opened.push(c) } }
  for (const step of LADDER) {
    if (step.at.death && p.deaths >= step.at.death) take(step.cards)
    if (step.at.wave && p.best >= step.at.wave) take(step.cards)
  }
  return opened
}

// the next card on each track, for the bars
export function nextOn(p) {
  const death = LADDER.find((l) => l.at.death && p.deaths < l.at.death)
  const wave = LADDER.find((l) => l.at.wave && p.best < l.at.wave)
  return {
    rank: death ? { at: death.at.death, have: p.deaths, cards: death.cards } : null,
    frontier: wave ? { at: wave.at.wave, have: p.best, cards: wave.cards } : null,
    blueprints: { have: min(3, p.fragments), at: 3, fragments: p.fragments, locked: hangar(p).filter((h) => !h.unlocked).map((h) => h.id) },
    swarm: treeCost(p, "swarm") != null ? { have: min(p.w, treeCost(p, "swarm")), at: treeCost(p, "swarm"), rank: treeRank(p, "swarm") } : null,
  }
}
// three fragments buy any locked item
export function buyBlueprint(p, id) {
  if (p.fragments < 3 || has(p, id) || !CARDS[id] || (CARDS[id].kind !== "launcher" && CARDS[id].kind !== "upgrade")) return false
  p.fragments -= 3
  p.blueprints.push(id)
  return true
}

// a run's seed: never the same twice for one profile, and never the last run's
export const seedFor = (p, clock) => `r${p.runs}-${p.lifetimeW}-${(clock >>> 0).toString(36)}`
