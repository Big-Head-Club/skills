// The meta game (roguelite, 2026-09-24): the profile that outlives a run, the ladder of guaranteed
// unlocks, the tree, the Fate roll, what a run pays and what it unlocks. Pure: no DOM, no clock, no
// Math.random. The client stores the profile; `runConfig` turns it into the `run` option that
// createRun reads, and `payout` + `advance` turn a finished run back into a profile.
//
// Design: docs/design/roguelite-spec.md

import { DRONE_ORDER, UPGRADE_ORDER, UPGRADES, ECONOMY, RARITY, STRIKE, SPEC, OMEN_WAVES, OMEN_MIX, THREATS } from "./config.js"
import { stream, hash } from "./rng.js"

const floor = Math.floor, max = Math.max, min = Math.min, round = Math.round
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)

export const PROFILE_V = 3 // 3 (2026-09-25): everyone starts from run 1 again, on Daniel's ask

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
    deeds: [], // deeds done (their cards are in `unlocked`)
    ledgerBest: {}, // the best of each per-run counter a deed watches
    deedLevels: {}, // citation id -> level reached (1 opens its item; every level after pays)
    mastery: {}, // drone type -> lifetime kills by that type's drones
    masteryLevels: {}, // drone type -> level reached
    rankLevel: 0, // Rank levels past the ladder
    lifetime: { kills: 0, strikes: 0, struck: 0, waves: 0, seconds: 0, cursesCleared: 0 },
    settings: {},
  }
}

export function loadProfile(saved) {
  if (!saved) return newProfile()
  // an older profile starts over: the reset of 2026-09-25 (the team plays from scratch)
  if (saved.v !== PROFILE_V) return newProfile()
  return { ...newProfile(), ...saved, lifetime: { ...newProfile().lifetime, ...(saved.lifetime || {}) } }
}

// ---- the ladder --------------------------------------------------------------------------------------
// Every trigger hands out its cards the first time it fires; a card is a drone, a powerup, a system
// or a stat. `at` says what the trigger is: { death: n } the n-th qualifying death, { wave: n } the
// first clear of wave n.

// Every death opens one step; a strong run that clears many waves at once opens at most two wave
// steps per run and holds the rest (Daniel, 2026-09-25: "the meta progress happens way too fast")
export const WAVE_CARDS_PER_RUN = 2
export const LADDER = [
  { at: { death: 1 }, cards: ["prewave", "omens", "fate"] },
  { at: { death: 2 }, cards: ["kite", "hangar"] },
  { at: { death: 3 }, cards: ["shop2x2", "rate"] },
  { at: { death: 4 }, cards: ["reroll", "flakgun"] },
  { at: { death: 5 }, cards: ["warden", "tierU", "hotswap"] },
  { at: { death: 6 }, cards: ["split", "laser12", "shot"] },
  { at: { death: 7 }, cards: ["picket", "cooldown"] },
  { at: { death: 8 }, cards: ["shop3x2", "hardened"] },
  { at: { death: 9 }, cards: ["eye"] },
  { at: { death: 10 }, cards: ["weaver", "charge"] },
  { at: { death: 12 }, cards: ["gunship"] },
  { at: { death: 13 }, cards: ["shop3x3"] },
  { at: { death: 16 }, cards: ["reaper"] },
  { at: { death: 18 }, cards: ["beacon"] },
  { at: { death: 20 }, cards: ["refund"] },
  { at: { death: 23 }, cards: ["ap"] },
  { at: { wave: 3 }, cards: ["mint"] },
  { at: { wave: 4 }, cards: ["radius"] },
  { at: { wave: 5 }, cards: ["laser15"] },
  { at: { wave: 6 }, cards: ["ram"] },
  { at: { wave: 7 }, cards: ["tierR"] },
  { at: { wave: 8 }, cards: ["laser4"] },
  { at: { wave: 9 }, cards: ["flak"] },
  { at: { wave: 10 }, cards: ["chain", "overcharge"] },
  { at: { wave: 11 }, cards: ["hive"] },
  { at: { wave: 12 }, cards: ["prism"] },
  { at: { wave: 13 }, cards: ["dms"] },
  { at: { wave: 15 }, cards: ["laser6"] },
]
// deeds: things a run does that open a card, with a live counter in the Hangar
// Every citation has five levels (Daniel, 2026-09-25: "everything should have more levels ... goals to
// strive toward, even if it doesn't unlock something"). Level 1 opens the item; each level after pays
// Wreckage. `at` is the first target; `tiers` the rest.
export const ROMAN = ["", "I", "II", "III", "IV", "V"]
export const DEEDS = [
  { id: "bounty", name: "Untouched", line: "Clean waves in a row in one run.", tiers: [5, 8, 12, 18, 25], of: (p, s) => s?.stats.bestCleanStreak ?? 0, best: "cleanStreak" },
  { id: "ledger", name: "Banker", line: "Mints standing in one run.", tiers: [3, 4, 5, 6, 8], of: (p, s) => s?.stats.mintsMax ?? 0, best: "mints" },
  { id: "oath", name: "Sentinel", line: "A Warden's city untouched, waves in a row.", tiers: [5, 9, 14, 20, 30], of: (p, s) => s?.stats.wardenBest ?? 0, best: "warden" },
  { id: "hive", name: "Swarm master", line: "Rockets down, over all runs.", tiers: [1500, 4000, 10000, 25000, 60000], of: (p) => p.lifetime.kills },
  { id: "chain", name: "Gunner", line: "Rockets down by the laser in one run.", tiers: [40, 70, 110, 170, 260], of: (p, s) => s?.stats.struck ?? 0, best: "struck" },
  { id: "prism", name: "Marksman", line: "Rockets down by the laser, over all runs.", tiers: [200, 500, 1200, 3000, 7000], of: (p) => p.lifetime.struck },
  { id: "dms", name: "Survivor", line: "Deaths that counted.", tiers: [12, 25, 50, 100, 200], of: (p) => p.deaths },
  { id: "ap", name: "Brute force", line: "Brutes down, over all runs.", tiers: [20, 50, 125, 300, 750], of: (p) => p.lifetime.brutes || 0 },
  { id: "lure", name: "Giant killer", line: "Bosses down, over all runs.", tiers: [5, 12, 25, 50, 100], of: (p) => p.lifetime.bosses || 0 },
]
for (const d of DEEDS) d.at = d.tiers[0]
// every drone type earns levels from what its drones bring down, over all runs
export const MASTERY = [100, 300, 800, 2000, 5000]
export const LAST_DEATH_STEP = 23
// later content, cut on review: Manifest, Wager and Dare, Loadouts, Tempt Fate, Pass and its Tags, the mythic tier, skins
// what each card is, for the screens
export const CARDS = {
  prewave: { kind: "system", name: "Pre-wave shop", line: "Shop before the first wave." },
  omens: { kind: "system", name: "Dispatches", line: "Two orders between waves. Take one, or pass." },
  fate: { kind: "system", name: "Supply", line: "Every run rolls its supply line: what the shop holds and costs." },
  shop2x2: { kind: "stat", name: "Bigger shop", line: "A second base to choose from." },
  shop3x2: { kind: "stat", name: "Wider shop", line: "A third base to choose from." },
  shop3x3: { kind: "stat", name: "Full shop", line: "A third powerup to choose from." },
  hangar: { kind: "system", name: "The Hangar", line: "Everything you have, and everything you don't yet." },
  reroll: { kind: "system", name: "Reroll", line: "Roll the shop again." },

  laser12: { kind: "stat", name: "Wider laser", line: "The laser blast grows." },
  laser15: { kind: "stat", name: "Command laser", line: "The laser blast at full size." },
  laser4: { kind: "stat", name: "Heavy laser", line: "The laser hits twice as hard." },
  laser6: { kind: "stat", name: "Siege laser", line: "The laser takes a Brute in one." },
  tierU: { kind: "stat", name: "Uncommon finds", line: "Uncommon items can show in the shop." },
  tierR: { kind: "stat", name: "Rare finds", line: "Rare items can show in the shop." },
  threat: { kind: "system", name: "Threat", line: "A harder sky, and more Wreckage for holding it." },
}
for (const id of [...DRONE_ORDER, "mint"]) CARDS[id] = { kind: "launcher", name: id[0].toUpperCase() + id.slice(1), line: "" }
for (const d of DEEDS) if (CARDS[d.id]) CARDS[d.id] = { ...CARDS[d.id], deed: d.id }
for (const id of UPGRADE_ORDER) CARDS[id] = { kind: "upgrade", name: UPGRADES[id].name, line: UPGRADES[id].line }

export const has = (p, card) => p.unlocked.includes(card) || p.blueprints.includes(card)
export const blueprintCost = (p) => 3 + p.blueprints.length

// what run 1 holds before any card: one drone, five common powerups (the starter kit)
const KIT = { launchers: ["hornet"], upgrades: ["cap", "speed", "spread", "reach", "range", "swap", "capacitor"] }
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
// the "?" grid: every item, and whether it is unlocked and whether it has ever been bought. A deed's
// item is never a Blueprint: it has its own way in
export function hangar(p) {
  const pool = unlockedPool(p)
  const row = (id, kind) => ({ id, kind, unlocked: kind === "launcher" ? pool.launchers.includes(id) || (id === "mint" && pool.mint) : pool.upgrades.includes(id), bought: (p.bought[id] || 0) > 0, tier: RARITY[id], deed: DEEDS.find((d) => d.id === id)?.id })
  return [...DRONE_ORDER.map((id) => row(id, "launcher")), row("mint", "launcher"), ...UPGRADE_ORDER.map((id) => row(id, "upgrade"))]
}
// the deeds with their counters, for the Hangar
export const deeds = (p) => DEEDS.map((d) => { const level = p.deedLevels?.[d.id] || (has(p, d.id) ? 1 : 0); return { ...d, level, done: level >= d.tiers.length, at: d.tiers[min(level, d.tiers.length - 1)], have: d.best ? max(p.ledgerBest[d.best] || 0, 0) : d.of(p) } })
export const masteryOf = (p, type) => ({ kills: p.mastery?.[type] || 0, level: p.masteryLevels?.[type] || 0, at: MASTERY[min(p.masteryLevels?.[type] || 0, MASTERY.length - 1)] })

// ---- the tree ------------------------------------------------------------------------------------------
// Vertical nodes are small and capped; Swarm restores the shipped drone counts and is the one big
// felt step; the rest are horizontal (they change decisions, not numbers).

// Cut on review (2026-09-24): the +2% nodes (shots, pads, salvage, reload) changed nothing a player
// could feel and drained what Swarm needs; Fate lens and Scrapyard were sold before they existed.
export const TREE = {
  swarm: { name: "Swarm", line: "Pads hold more drones: a Hornet one more each rank, the rest in step.", per: "+1 on a Hornet", costs: [80, 120, 180, 260, 360] },
  chest: { name: "War chest", line: "Start with more money.", per: "+20", costs: [20, 30, 45, 60] },
  reroll: { name: "Extra reroll", line: "One more reroll per shop.", per: "+1", costs: [30, 50, 80] },
  dice: { name: "Supply chain", line: "The supply roll comes one higher.", per: "+1", costs: [15, 20, 25, 30, 40] },
  pity: { name: "Quartermaster", line: "A dry spell in the shop ends after 3 rolls, not 4.", per: "", costs: [35] },
  eater: { name: "Salvage crew", line: "A setback you clear pays 6 Wreckage, not 4.", per: "", costs: [35] },
  plating: { name: "Plating", line: "Cities take one more hit.", per: "+1 HP", costs: [150, 300] },
  scrap: { name: "Scrapyard", line: "Sell a base back between waves for half what it cost.", per: "", costs: [60] },
  memory: { name: "Backorder", line: "One item you leave in a shop comes back next shop, 20% off.", per: "", costs: [80] },
  pockets: { name: "Deep pockets", line: "Passing on a dispatch pays 100, not 60.", per: "", costs: [40] },
  stake: { name: "Stake", line: "Start with more money.", per: "+40", cost: (n) => round(120 * powi(1.35, n)), ranks: 30 },
  // the deep sinks (Daniel, 2026-09-25: "I have everything maxed out and money to spend")
  garrison: { name: "Garrison", line: "A second Hornet pad stands from the start.", per: "", costs: [600] },
  overwatch: { name: "Overwatch", line: "The laser starts with one more charge.", per: "+1 charge", costs: [500, 900] },
  armoury: { name: "Armoury", line: "The starting pad opens with a powerup already on it.", per: "one tier up", costs: [200, 400, 800] },
  provisions: { name: "Provisions", line: "Every city pays 10 more a wave.", per: "+10", costs: [150, 210, 290, 400, 560] },
  reserve: { name: "Reserve", line: "Every wave bonus pays 15 more.", per: "+15", cost: (n) => round(100 * powi(1.4, n)), ranks: 20 },
}
const powi = (b, n) => { let v = 1; for (let i = 0; i < n; i++) v *= b; return v }
export const treeRank = (p, id) => p.tree[id] || 0
export const treeRanks = (id) => TREE[id].ranks ?? TREE[id].costs.length
// null: maxed. A node with `cost(n)` and `ranks` climbs geometrically
export const treeCost = (p, id) => { const n = treeRank(p, id); return n >= treeRanks(id) ? null : TREE[id].cost ? TREE[id].cost(n) : TREE[id].costs[n] }
export const canBuyNode = (p, id) => treeCost(p, id) != null && p.w >= treeCost(p, id)
export function buyNode(p, id) {
  const cost = treeCost(p, id)
  if (cost == null || p.w < cost) return false
  p.w -= cost
  p.tree[id] = treeRank(p, id) + 1
  return true
}
const chestMoney = (n) => 20 * n
const stakeMoney = (n) => 40 * n

// ---- fate ------------------------------------------------------------------------------------------------

export const FATE_TIERS = [["forsaken", 0], ["cursed", 15], ["unsteady", 35], ["favored", 60], ["touched", 85]]
export const fateTier = (f) => FATE_TIERS.reduce((t, [name, lo]) => (f >= lo ? name : t), "forsaken")
// the luck roll is "Supply" in the game (Daniel, 2026-09-25: a war game, no high-fantasy words); the ids stay
export const FATE_NAMES = { forsaken: "Cut off", cursed: "Strained", unsteady: "Steady", favored: "Reinforced", touched: "Priority" }

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
  // Split targets and the two range powerups are always in (Daniel: "I want to see range extending options more often")
  const must = pool.upgrades.filter((u) => u === "split" || u === "reach" || u === "range")
  const upgrades = fated ? [...must, ...r.shuffle(pool.upgrades.filter((u) => !must.includes(u))).slice(0, max(0, nU - must.length))] : pool.upgrades
  // Touched runs always hold a multiplier
  if (fated && tier === "touched" && !upgrades.some((u) => u === "shot" || u === "rate")) { const m = pool.upgrades.find((u) => u === "shot" || u === "rate"); if (m) upgrades.push(m) }
  const rank = rankOf(p)
  const fight = fated ? FATE_FIGHT[tier] : FATE_FIGHT.unsteady
  const laser = { radius: max(8, (has(p, "laser15") ? 15 : has(p, "laser12") ? 12 : 10) + fight.radius), dmg: has(p, "laser6") ? 6 : has(p, "laser4") ? STRIKE.dmg : 2, charges: STRIKE.charges + treeRank(p, "overwatch") }
  const threat = p.threat > 0 ? THREATS[min(p.threat, THREATS.length) - 1] : null
  return {
    v: 1, rank, fate, tier, fated,
    pool: { launchers, upgrades, mint: pool.mint },
    // 50: with wave 1's pay the first shop can buy Faster drones, or save. The pre-wave shop comes
    // with 160, so its first shop can buy a switch or save for a Hornet
    startMoney: max(40, (has(p, "prewave") ? 160 : 50) + chestMoney(treeRank(p, "chest")) + stakeMoney(treeRank(p, "stake")) + fight.money),
    cityHp: max(1, SPEC.cityHp + treeRank(p, "plating") + (threat?.cityHp || 0)),
    garrison: treeRank(p, "garrison") > 0, armoury: treeRank(p, "armoury"), cityBonus: 10 * treeRank(p, "provisions"), waveBonus: 15 * treeRank(p, "reserve"),
    scrap: treeRank(p, "scrap") > 0, memory: treeRank(p, "memory") > 0, passMoney: treeRank(p, "pockets") > 0 ? 100 : ECONOMY.passMoney,
    swarm: min(5, treeRank(p, "swarm") + fight.swarm),
    mods: { shot: 1, rate: 1, salvage: 1, reload: 1 },
    laser,
    shop: { bases: SHOP_SLOTS[rank][0], ups: SHOP_SLOTS[rank][1], odds: shopOdds(p, fate), priceK: (fated ? fatePriceK(fate) : 1) * (threat?.priceK || 1), rerolls: has(p, "reroll") ? ECONOMY.rerolls.free + treeRank(p, "reroll") + ECONOMY.rerolls.prices.length : 0, pityAt: treeRank(p, "pity") ? 3 : 4 },
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
    laser: { radius: STRIKE.radius, dmg: STRIKE.dmg, charges: STRIKE.charges },
    garrison: false, armoury: 0, cityBonus: 0, waveBonus: 0,
    shop: { bases: 3, ups: 3, odds: { c: 60, u: 27, r: 10, m: 3 }, priceK: 1, rerolls: 0, pityAt: 4 },
    fixedShops: null, prewave: false, omens: null, win: 0, threat: 0, start: "hornet", scrap: true, memory: false, passMoney: ECONOMY.passMoney,
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
    const firstPay = n <= 15 ? 6 + 2 * n : 36 + (n - 15)
    const again = max(1, floor(firstPay * 0.2)) * (n >= p.best - 1 ? 2 : 1)
    add(first ? `First clear of wave ${n}` : `Wave ${n} again`, first ? firstPay : again)
    if (first) frontier += firstPay
  }
  if (s.wave > p.reachedBest) { add(`Reached wave ${s.wave}`, 5); frontier += 5 }
  cat = "firsts"
  for (const id of Object.keys(st.bought || {})) if (!(p.bought[id] > 0)) add(`First ${CARDS[id]?.name || id}`, 1)
  for (const t of Object.keys(st.seen || {})) if (!(p.seen[t] > 0)) add(`First ${t}`, 2)
  cat = "play"
  const near = (n) => n >= max(1, p.best - 1)
  add("Clean waves", (st.cleanWaves || []).filter(near).length)
  add("Laser waves", (st.laserWaves || []).filter(near).length)
  add("Bosses down", 15 * (st.bosses || 0))
  const curses = (st.curses || []).filter((c) => c.cleared && !c.forced).length
  add("Setbacks cleared", min(3, curses) * (treeRank(p, "eater") ? 6 : 4))
  cat = "waves"
  if (s.result?.won) { add("The win", 40); frontier += 40 }
  if (!s.result?.won && waves === p.best && waves > 0 && !p.consoled[waves]) add("Held the line", 5)
  cat = "fate"
  let total = lines.reduce((a, l) => a + l.w, 0)
  const k = s.run.fated ? fateHardship(s.run.fate) : 1
  if (k > 1 && frontier) { const extra = floor(frontier * (k - 1)); add(k === 1.5 ? "Cut off" : "Strained", extra); total += extra }
  if (T && frontier) { const extra = floor(frontier * 0.25 * T); add(`Threat ${T}`, extra); total += extra }
  // every death that cleared a wave counts toward Rank (the ladder's cards carry the anti-idle gate)
  const qualifies = !s.result?.won
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
  // every 750 lifetime kills pays a fragment, so the Blueprint track never stops moving
  const before = floor(L.kills / 750)
  L.kills += st.kills; L.strikes += st.strikes; L.struck += st.struck; L.waves += waves; L.seconds += floor(s.t)
  L.brutes = (L.brutes || 0) + (st.killsBy?.brute || 0)
  L.bosses = (L.bosses || 0) + (st.bosses || 0)
  L.cursesCleared += (st.curses || []).filter((c) => c.cleared).length
  p.fragments += floor(L.kills / 750) - before
  // the per-run bests the deeds watch
  const bests = { cleanStreak: st.bestCleanStreak || 0, mints: st.mintsMax || 0, warden: st.wardenBest || 0, struck: st.struck || 0 }
  for (const k in bests) p.ledgerBest[k] = max(p.ledgerBest[k] || 0, bests[k])
  if (s.run.fated) p.fates = [...p.fates.slice(-4), s.run.fate]
  if (s.result?.won) { p.wins++; p.threat = p.wins }
  // Rank: a death counts if the run reached the wave its number asks for (death N: wave min(N, 3)) and
  // the cities fell; every second counted death pays a fragment
  if (pay.qualifies && !s.result?.won) { p.deaths++; if (p.deaths % 2 === 0) p.fragments++ }
  // with nothing left to open, fragments are worth 10 Wreckage each
  if (p.fragments > 0 && !hangar(p).some((h) => !h.unlocked)) { p.w += 10 * p.fragments; p.fragments = 0 }
  const take = (cards) => { for (const c of cards) if (!has(p, c)) { p.unlocked.push(c); opened.push(c) } }
  // one death step per death, and a death step's cards need the run to have reached wave min(N, 3)
  // at some point (an idle death opens nothing); wave steps in order, at most WAVE_CARDS_PER_RUN a
  // run, the rest held
  let waveSteps = 0
  for (const step of LADDER) {
    if (step.at.death && p.deaths >= step.at.death && p.best >= min(step.at.death, 3)) take(step.cards)
    if (step.at.wave && p.best >= step.at.wave && step.cards.some((c) => !has(p, c))) { if (waveSteps < WAVE_CARDS_PER_RUN) { take(step.cards); waveSteps++ } }
  }
  // Rank past the ladder: a level every second death, a fragment each
  if (pay.qualifies && !s.result?.won && p.deaths > LAST_DEATH_STEP && (p.deaths - LAST_DEATH_STEP) % 2 === 0) {
    p.rankLevel = (p.rankLevel || 0) + 1; p.fragments++
    opened.push({ kind: "level", name: `Rank ${p.deaths}`, line: "A fragment.", icon: "plating" })
  }
  // citations: level 1 opens the item, every level after pays
  for (const d of DEEDS) {
    const have = d.best ? p.ledgerBest[d.best] || 0 : d.of(p)
    let level = p.deedLevels[d.id] || (has(p, d.id) ? 1 : 0)
    while (level < d.tiers.length && have >= d.tiers[level]) {
      level++
      if (level === 1) { if (!has(p, d.id)) { p.unlocked.push(d.id); p.deeds.push(d.id); opened.push(d.id) } }
      else { const w = 20 * level; p.w += w; p.lifetimeW += w; opened.push({ kind: "level", name: `${d.name} ${ROMAN[level]}`, line: `+${w} Wreckage`, icon: d.id }) }
    }
    p.deedLevels[d.id] = level
  }
  // mastery: each drone type's lifetime kills, levels that pay
  for (const L of s.launchers) if (L.kills) p.mastery[L.type] = (p.mastery[L.type] || 0) + L.kills
  for (const type in p.mastery) {
    let level = p.masteryLevels[type] || 0
    while (level < MASTERY.length && p.mastery[type] >= MASTERY[level]) {
      level++
      const w = 15 * level; p.w += w; p.lifetimeW += w
      opened.push({ kind: "level", name: `${CARDS[type]?.name || type} ${ROMAN[level]}`, line: `+${w} Wreckage`, icon: type })
    }
    p.masteryLevels[type] = level
  }
  return opened
}
// wave cards the profile has earned but not yet been handed
export const heldCards = (p) => LADDER.filter((l) => l.at.wave && p.best >= l.at.wave).flatMap((l) => l.cards).filter((c) => !has(p, c))

// the next card on each track, for the bars
export function nextOn(p) {
  const death = LADDER.find((l) => l.at.death && p.deaths < l.at.death)
  const wave = LADDER.find((l) => l.at.wave && p.best < l.at.wave)
  // past the ladder the tracks keep levelling: a Rank level every second death, a first clear every wave
  const nextRank = LAST_DEATH_STEP + 2 * ((p.rankLevel || 0) + 1)
  return {
    rank: death ? { at: death.at.death, have: p.deaths, cards: death.cards } : { at: nextRank, have: p.deaths, cards: [], level: `Rank ${nextRank}` },
    frontier: wave ? { at: wave.at.wave, have: p.best, cards: wave.cards } : { at: p.best + 1, have: p.best, cards: [], level: `first clear of wave ${p.best + 1}` },
    blueprints: { have: min(blueprintCost(p), p.fragments), at: blueprintCost(p), fragments: p.fragments, locked: hangar(p).filter((h) => !h.unlocked && !h.deed).map((h) => h.id) },
    swarm: treeCost(p, "swarm") != null ? { have: min(p.w, treeCost(p, "swarm")), at: treeCost(p, "swarm"), rank: treeRank(p, "swarm") } : null,
  }
}
// three fragments buy any locked item
export const blueprintCostOf = (p, id) => blueprintCost(p) * (CARDS[id]?.deed ? 2 : 1)
export function buyBlueprint(p, id) {
  if (has(p, id) || !CARDS[id] || (CARDS[id].kind !== "launcher" && CARDS[id].kind !== "upgrade") || p.fragments < blueprintCostOf(p, id)) return false
  p.fragments -= blueprintCostOf(p, id)
  p.blueprints.push(id)
  return true
}

// a run's seed: never the same twice for one profile, and never the last run's
export const seedFor = (p, clock) => `r${p.runs}-${p.lifetimeW}-${(clock >>> 0).toString(36)}`
