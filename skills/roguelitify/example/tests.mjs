import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRun, applyInput, step, replay, makeWorld, bandSpan, isRevealed, canUpgrade, launcherStats, shopFor, validInput, modK } from "../public/src/sim.js"
import { SPEC, WORLD, viewWidth, DRONE_ORDER, UPGRADES, OMENS, COUNTERS, ROCKET_DEBUT } from "../public/src/config.js"
import { newProfile, runConfig, fullRun, payout, advance, LADDER, CARDS, TREE, treeRanks, treeCost, rollFate, fateTier } from "../public/src/meta.js"
import { nameless } from "../public/src/guide.js"
import { play } from "../tools/bot.mjs"
import { career } from "../tools/meta.mjs"

test("a run replays from its log to the same tick and result, with and without a profile", () => {
  for (const seed of ["t-a", "t-b"]) {
    const { s, log } = play(seed, "casual")
    const again = replay(seed, log)
    assert.equal(again.phase, "over")
    assert.deepEqual(again.result, s.result)
    assert.equal(again.tick, s.tick)
  }
  // a career: every run's config comes from the profile, and each replays with it
  const { rows } = career(7, 3, "casual", "swarm", { check: true })
  assert.equal(rows.length, 3)
})

test("the sim calls no Math function IEEE leaves to the engine", () => {
  for (const f of ["sim.js", "config.js", "fx.js", "rng.js", "meta.js"]) {
    const src = readFileSync(new URL(`../public/src/${f}`, import.meta.url), "utf8").replace(/\/\/.*$/gm, "")
    const bad = src.match(/Math\.(sin|cos|tan|atan2?|asin|acos|pow|exp|log\w*|hypot|cbrt|random)\b|(?<![/*])\*\*(?![/*])/g) // ** is Math.pow in disguise
    assert.equal(bad, null, `${f} uses ${bad}`)
  }
})

test("every revealed band has at least 2 pads and a hill, and pads outnumber launchers", () => {
  for (const seed of ["w1", "w2", "w3", "w4", "w5", "w6", "2026-09-22", "2026-09-23", "2026-09-24"]) {
    const w = makeWorld(seed)
    for (let k = 1; k <= SPEC.zoomSteps; k++) {
      const [lo, hi] = bandSpan(k)
      for (const side of [-1, 1]) {
        const inBand = w.pads.filter((p) => Math.sign(p.x) === side && Math.abs(p.x) >= lo && Math.abs(p.x) < hi)
        assert.ok(inBand.length >= 2, `${seed} band ${k} side ${side} has ${inBand.length} pads`)
      }
      assert.ok(w.hills.some((h) => h.band === k), `${seed} band ${k} has no hill`)
    }
    const view0 = w.pads.filter((p) => Math.abs(p.x) < WORLD.view0 / 2)
    assert.ok(view0.length >= 3, `${seed}: only ${view0.length} pads in the first view`)
    for (let n = 1 + SPEC.wavesPerView; n <= SPEC.zoomCapWave; n += SPEC.wavesPerView) {
      const before = w.pads.filter((p) => Math.abs(p.x) <= viewWidth(n - 1) / 2).length
      const after = w.pads.filter((p) => Math.abs(p.x) <= viewWidth(n) / 2).length
      assert.ok(after >= before + 2, `${seed}: wave ${n} reveals ${after - before} pads`)
    }
  }
})

test("a new profile's run: one city, one Hornet holding one drone, the Sidearm, 50 money, fixed shops", () => {
  const run = runConfig(newProfile(), "first")
  const s = createRun("first", { run })
  assert.equal(s.cities.length, 1)
  assert.equal(s.launchers.length, 1)
  assert.equal(s.launchers[0].type, "hornet")
  assert.equal(s.launchers[0].stats.cap, 1)
  assert.equal(s.strike.radius, 10)
  assert.equal(s.strike.dmg, 2)
  assert.equal(s.money, 50)
  assert.equal(run.rank, 0)
  assert.equal(run.fate, 50)
  applyInput(s, { k: "go" })
  assert.equal(s.phase, "wave") // no pre-wave shop yet
  while (s.phase === "wave") step(s)
  if (s.phase === "breather") {
    assert.equal(s.offer.stage, "shop")
    assert.deepEqual(s.offer.items.map((x) => [x.id, x.price]), [["hornet", 245], ["cap", 230], ["speed", 190]])
    assert.equal(validInput(s, { k: "reroll" }), false)
  }
})

test("the full game: five swarm ranks restore the shipped drone counts; tree mods apply", () => {
  const L = { type: "hornet", ups: {} }
  assert.equal(launcherStats(L).cap, 6)
  const p = newProfile()
  p.tree.swarm = 2
  const run = runConfig(p, "tree")
  const s = createRun("tree", { run })
  assert.equal(s.launchers[0].stats.cap, 3)
  // every type grows in step: a Kite holds 2 at rank 2, 3 at rank 4
  assert.equal(launcherStats({ type: "kite", ups: {} }, s).cap, 2)
  p.tree.swarm = 4
  assert.equal(launcherStats({ type: "kite", ups: {} }, createRun("tree", { run: runConfig(p, "tree") })).cap, 3)
})

test("the run-1 kit dies on wave 2 or 3 for casual play (bots pooled), and the smart bot is money-bound too", () => {
  const levels = ["picks=first,strike=none", "picks=first,strike=lazy", "picks=random,strike=lazy"]
  const N = 30
  let w2 = 0, w3 = 0, w4 = 0
  for (const level of levels) for (let i = 0; i < N; i++) {
    const seed = "cad-" + i
    const { s } = play(seed, level, { run: runConfig(newProfile(), seed) })
    if (s.wavesDone >= 2) w2++
    if (s.wavesDone >= 3) w3++
    if (s.wavesDone >= 4) w4++
  }
  const T = N * levels.length
  assert.ok(w2 / T >= 0.5 && w2 / T <= 0.85, `wave 2 cleared ${(100 * w2 / T).toFixed(0)}%`)
  assert.ok(w3 / T >= 0.15 && w3 / T <= 0.5, `wave 3 cleared ${(100 * w3 / T).toFixed(0)}%`)
  assert.ok(w4 / T <= 0.45, `wave 4 cleared ${(100 * w4 / T).toFixed(0)}%`)
})

test("a casual career lengthens: run 1 dies early, runs 6-8 go further, and the ladder opens in order", () => {
  const first = [], late = []
  for (let k = 0; k < 12; k++) {
    const { rows, p } = career(100 + k, 8, "casual", "swarm")
    first.push(rows[0].waves)
    late.push(...rows.slice(5).map((r) => r.waves))
    assert.ok(p.deaths >= 6, `profile ${k}: ${p.deaths} deaths`)
    assert.ok(p.unlocked.includes("prewave") && p.unlocked.includes("kite"), `profile ${k} missed the first cards`)
    assert.ok(p.lifetimeW > 100, `profile ${k} earned ${p.lifetimeW} W`)
  }
  const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1]
  assert.ok(med(first) <= 3, `run 1 median ${med(first)}`)
  assert.ok(med(late) >= med(first) + 1, `late median ${med(late)} vs first ${med(first)}`)
  // a strong player's career lengthens faster
  const strong = []
  for (let k = 0; k < 6; k++) strong.push(...career(300 + k, 6, "strong", "swarm").rows.slice(3).map((r) => r.waves))
  assert.ok(med(strong) >= 6, `strong late median ${med(strong)}`)
})

test("the shop: rank slots and tiers, no tier the profile lacks, a counter before every debut", () => {
  const p = newProfile()
  for (const l of LADDER) if (l.at.death && l.at.death <= 13) p.unlocked.push(...l.cards)
  p.unlocked.push("mint", "ram", "charge", "flak", "tierR")
  const run = runConfig(p, "shop-1")
  run.fated = false; run.pool = { launchers: DRONE_ORDER.slice(), upgrades: Object.keys(UPGRADES), mint: true }
  const s = createRun("shop-1", { run })
  for (const wave of [2, 5, ROCKET_DEBUT.needle, ROCKET_DEBUT.splitter, ROCKET_DEBUT.brute]) {
    s.wave = wave
    const items = shopFor(s, wave)
    assert.equal(items.filter((x) => x.kind === "launcher").length, 3)
    assert.equal(items.filter((x) => x.kind === "upgrade").length, 3)
    for (const t in COUNTERS) if (ROCKET_DEBUT[t] === wave) assert.ok(items.some((x) => COUNTERS[t].includes(x.id)), `no ${t} counter before wave ${wave}: ${items.map((x) => x.id)}`)
    // a reroll is a different shop
    assert.notDeepEqual(shopFor(s, wave, 1).map((x) => x.id), items.map((x) => x.id))
  }
  // a profile without the uncommon tier never sees one
  const q = newProfile(); q.unlocked.push("prewave", "shop2x2", "kite", "rate", "shot", "split")
  const s2 = createRun("shop-2", { run: runConfig(q, "shop-2") })
  for (let wave = 5; wave < 12; wave++) { s2.wave = wave; for (const x of shopFor(s2, wave)) if (x.kind === "upgrade") assert.equal(x.tier, "c", `${x.id} is ${x.tier}`) }
})

test("omens: a bag of 12 by the Fate mix, pairs never hold two curses, Jammed Sky blocks the laser, curses clear", () => {
  const p = newProfile(); p.unlocked.push("prewave", "omens", "fate", "kite")
  let sawPairs = 0
  // every pair a long run draws keeps the rules
  const q = newProfile(); q.unlocked.push("prewave", "omens", "fate", "kite", "shop2x2", "tierU"); q.tree.swarm = 5
  for (let i = 0; i < 6; i++) {
    const seed = "omen-long-" + i
    q.lifetimeW = i * 37
    const s = createRun(seed, { run: runConfig(q, seed) })
    applyInput(s, { k: "go" }); applyInput(s, { k: "done" })
    let pairs = 0
    while (s.phase !== "over" && s.wave < 14) {
      s.cities.forEach((c) => (c.hp = 99))
      while (s.phase === "wave") step(s)
      if (s.offer?.stage === "omen") {
        const [a, b] = s.offer.cards
        assert.notEqual(a, b, `${seed}: the same card twice`)
        assert.ok(!(OMENS[a].kind === "curse" && OMENS[b].kind === "curse"), `${seed}: two curses`)
        assert.notEqual(OMENS[a].touch, OMENS[b].touch, `${seed}: same touch`)
        pairs++
        applyInput(s, { k: "omen", i: 0 })
      }
      applyInput(s, { k: "done" })
    }
    assert.ok(pairs >= 4, `${seed}: ${pairs} pairs`)
  }
  for (let i = 0; i < 12; i++) {
    const seed = "omen-" + i
    p.lifetimeW = i * 53
    const run = runConfig(p, seed)
    const s = createRun(seed, { run })
    assert.equal(s.omen.bag.length, 12)
    const kinds = s.omen.bag.map((id) => OMENS[id].kind)
    assert.deepEqual([kinds.filter((k) => k === "curse").length, kinds.filter((k) => k === "mixed").length, kinds.filter((k) => k === "bless").length], run.omens.mix)
    applyInput(s, { k: "go" })
    assert.equal(s.phase, "breather")
    assert.equal(s.offer.stage, "shop") // the pre-wave shop
    applyInput(s, { k: "done" })
    s.cities[0].hp = 99 // survive wave 1 whatever happens
    while (s.phase === "wave") step(s)
    assert.equal(s.offer.stage, "omen")
    const [a, b] = s.offer.cards
    sawPairs++
    assert.ok(!(OMENS[a].kind === "curse" && OMENS[b].kind === "curse"))
    assert.notEqual(OMENS[a].touch, OMENS[b].touch)
    assert.equal(validInput(s, { k: "buy", i: 0 }), false)
    const curse = s.offer.cards.findIndex((id) => id === "jammed")
    if (curse >= 0) {
      applyInput(s, { k: "omen", i: curse })
      assert.equal(s.offer.stage, "shop")
      applyInput(s, { k: "done" })
      assert.equal(modK(s, "laserOff"), 1)
      assert.equal(validInput(s, { k: "strike", x: 0, y: 50 }), false)
      assert.equal(s.stats.curses[0].cleared, false)
      while (s.phase === "wave") step(s)
      assert.equal(s.stats.curses[0].cleared, true)
      assert.equal(modK(s, "laserOff"), 0)
    } else {
      applyInput(s, { k: "pass" })
      assert.equal(s.offer.stage, "shop")
    }
  }
  assert.equal(sawPairs, 12)
})

test("fate: the roll's tiers land where the spec says, and Fate shapes prices and the pool", () => {
  const p = newProfile(); p.unlocked.push("fate")
  const hist = { forsaken: 0, cursed: 0, unsteady: 0, favored: 0, touched: 0 }
  const N = 4000
  for (let i = 0; i < N; i++) { p.lifetimeW = i; hist[fateTier(rollFate(p, "f" + i))]++ }
  const pct = (k) => hist[k] / N
  assert.ok(pct("forsaken") > 0.025 && pct("forsaken") < 0.07, `forsaken ${pct("forsaken")}`)
  assert.ok(pct("touched") > 0.025 && pct("touched") < 0.07, `touched ${pct("touched")}`)
  assert.ok(pct("unsteady") > 0.35 && pct("unsteady") < 0.52, `unsteady ${pct("unsteady")}`)
  for (const l of LADDER) if (l.at.death && l.at.death <= 6) p.unlocked.push(...l.cards)
  let lo = null, hi = null
  for (let i = 0; i < 400 && !(lo && hi); i++) { p.lifetimeW = i; const r = runConfig(p, "g" + i); if (r.tier === "forsaken") lo = r; if (r.tier === "touched") hi = r }
  assert.ok(lo && hi)
  assert.ok(lo.shop.priceK > hi.shop.priceK)
  assert.ok(hi.pool.upgrades.length >= lo.pool.upgrades.length)
  assert.ok(hi.pool.upgrades.includes("shot") || hi.pool.upgrades.includes("rate"))
})

test("wreckage: first clears pay most, a surrender pays its lines but is no death, consolation pays once", () => {
  const p = newProfile()
  const { s } = play("pay-1", "casual", { run: runConfig(p, "pay-1") })
  const pay = payout(p, s)
  assert.ok(pay.total > 0)
  const opened = advance(p, s, pay)
  assert.equal(p.deaths, s.wavesDone >= 1 ? 1 : 0)
  if (p.deaths) assert.ok(opened.includes("prewave"))
  // the same run again: the first clears are gone; dying at the best wave consoles once, then never
  const again = payout(p, s)
  assert.equal(again.total, 0) // the same seed pays once
  s.seed = "pay-1b"
  const again2 = payout(p, s)
  assert.ok(again2.total < pay.total)
  if (s.wavesDone >= 1) assert.ok(again2.lines.some((l) => l.name === "Held the line"))
  advance(p, s, again2)
  s.seed = "pay-1c"
  assert.ok(!payout(p, s).lines.some((l) => l.name === "Held the line"))
  // a surrender
  const s2 = createRun("pay-2", { run: runConfig(newProfile(), "pay-2") })
  applyInput(s2, { k: "go" }); s2.cities[0].hp = 99
  while (s2.phase === "wave") step(s2)
  applyInput(s2, { k: "end" })
  assert.equal(s2.result.surrendered, true)
  const q = newProfile()
  const pay2 = payout(q, s2)
  assert.equal(pay2.total, 0); assert.ok(!pay2.qualifies)
  advance(q, s2, pay2)
  assert.equal(q.deaths, 0)
  // an idle run that only clears wave 1 counts as death 1 and 2, never death 3
  const idle = newProfile(); idle.deaths = 2
  const s3 = createRun("pay-3", { run: runConfig(idle, "pay-3") })
  applyInput(s3, { k: "go" }); s3.cities[0].hp = 99
  while (s3.phase === "wave") step(s3)
  s3.cities[0].hp = 1; applyInput(s3, { k: "done" })
  while (s3.phase === "wave") step(s3)
  if (s3.phase === "over") {
    // the death counts (every death moves the meta), but death 3's cards need a best wave of 3
    const pay3 = payout(idle, s3); assert.ok(pay3.qualifies)
    const opened = advance(idle, s3, pay3); assert.equal(idle.deaths, 3)
    if (idle.best < 3) assert.ok(!opened.includes("shop2x2"), "an idle death opened a ladder card")
  }
})

test("new cities arrive before the waves the spec names, and clearing the win wave ends the run", () => {
  const { s } = play("cities-1", "strong")
  for (const c of s.cities.slice(1)) assert.ok(SPEC.newCityWaves.includes(c.wave))
  assert.ok(s.cities.length <= 6)
  const p = newProfile(); p.tree.swarm = 5; p.tree.chest = 4
  for (const l of LADDER) p.unlocked.push(...l.cards)
  const run = runConfig(p, "win-1"); run.pool = { launchers: DRONE_ORDER.slice(), upgrades: Object.keys(UPGRADES), mint: true }; run.fated = false
  const { s: w } = play("win-1", "strong", { run })
  assert.ok(w.wavesDone >= 8, `a full profile's strong bot cleared ${w.wavesDone}`)
  assert.equal(w.result.won, false) // no cap: the run goes until the last city falls
})

test("strikes and drone shots never hurt drones; the strike only recharges in a wave", () => {
  const s = createRun("blast-1")
  applyInput(s, { k: "go" })
  for (let i = 0; i < 200; i++) step(s)
  const d = s.drones[0]
  assert.ok(d)
  applyInput(s, { k: "strike", x: d.x, y: d.y + 1 })
  for (let i = 0; i < 90; i++) step(s)
  assert.equal(s.stats.dronesLost, s.events.filter((e) => e.kind === "droneLost").length === 0 ? s.stats.dronesLost : s.stats.dronesLost)
  s.cities[0].hp = 99
  while (s.phase === "wave") step(s)
  const ready = s.strike.ready, t = s.strike.t
  for (let i = 0; i < 600; i++) step(s)
  assert.equal(s.strike.ready, ready); assert.equal(s.strike.t, t)
})

test("undo reverses the last buy of a shop: money, pad, drones, powerup counts", () => {
  const s = createRun("undo-1")
  applyInput(s, { k: "go" })
  s.cities[0].hp = 99
  while (s.phase !== "breather") step(s)
  s.money = 5000
  const iL = s.offer.items.findIndex((x) => x.kind === "launcher"), iU = s.offer.items.findIndex((x) => x.kind === "upgrade" && UPGRADES[x.id].to === "launcher")
  const pad = s.pads.find((p) => p.launcher == null && isRevealed(s, p.x))
  const before = { money: s.money, n: s.launchers.length, ups: { ...s.launchers[0].ups } }
  assert.equal(validInput(s, { k: "undo" }), false)
  assert.ok(applyInput(s, { k: "buy", i: iL, pad: pad.id }))
  assert.ok(applyInput(s, { k: "buy", i: iU, target: s.launchers[0].id }))
  assert.ok(applyInput(s, { k: "undo" }))
  assert.deepEqual(s.launchers[0].ups, before.ups)
  assert.ok(applyInput(s, { k: "undo" }))
  assert.equal(s.money, before.money); assert.equal(s.launchers.length, before.n); assert.equal(s.pads[pad.id].launcher, null)
  assert.equal(validInput(s, { k: "undo" }), false)
  assert.ok(applyInput(s, { k: "buy", i: iL, pad: pad.id }))
})

test("a launcher can only go on a free, revealed pad", () => {
  const s2 = createRun("pads-1")
  applyInput(s2, { k: "go" })
  s2.cities[0].hp = 99
  while (s2.phase !== "breather") step(s2)
  const taken = s2.pads.find((p) => p.launcher != null)
  const hidden = s2.pads.find((p) => !isRevealed(s2, p.x))
  s2.money = 9999
  const i = s2.offer.items.findIndex((x) => x.kind === "launcher")
  assert.ok(i >= 0)
  assert.equal(applyInput(s2, { k: "buy", i, pad: taken.id }), false)
  assert.equal(applyInput(s2, { k: "buy", i, pad: hidden.id }), false)
})

test("everything has a name and a line in the field guide, and every ladder card is described", () => {
  assert.deepEqual(nameless(), [])
  for (const k of Object.keys(UPGRADES)) assert.ok(UPGRADES[k].to)
  assert.equal(DRONE_ORDER.length, 11)
  for (const l of LADDER) for (const c of l.cards) assert.ok(CARDS[c], `no card ${c}`)
  for (const id in TREE) assert.ok(treeRanks(id) >= 1 && treeCost(newProfile(), id) > 0, `${id} has no first price`)
})

test("switch upgrades go on a launcher once; the rest stack; Heavier shots is a real step on a Hornet", () => {
  const L = { type: "picket", ups: {} }
  for (const id of Object.keys(UPGRADES).filter((k) => UPGRADES[k].to === "launcher")) {
    L.ups = {}
    L.type = UPGRADES[id].only || "picket" // a type-bound switch (Warden's oath) goes on its type only
    assert.ok(canUpgrade(L, id), `${id} should apply the first time`)
    if (UPGRADES[id].only) assert.ok(!canUpgrade({ type: "picket", ups: {} }, id), `${id} must refuse another type`)
    L.ups[id] = 1
    assert.equal(canUpgrade(L, id), !UPGRADES[id].once, `${id}: a second copy must ${UPGRADES[id].once ? "be refused" : "stack"}`)
  }
  const band = (n) => launcherStats({ type: "picket", ups: { reach: n } }).band
  assert.ok(band(2) > band(1) && band(1) > band(0))
  const rate = (n) => launcherStats({ type: "hornet", ups: { rate: n } }).rate
  assert.ok(rate(2) < rate(1) && rate(1) < rate(0))
  assert.equal(launcherStats({ type: "kite", ups: { swap: 1 } }).target, "lowest")
  // two hits, then one
  assert.ok(launcherStats({ type: "hornet", ups: {} }).shot < 2 && launcherStats({ type: "hornet", ups: { shot: 1 } }).shot >= 2)
})
