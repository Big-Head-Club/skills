// A player's career, headless: N runs on one profile, each run's config from the profile, the
// payout and the ladder applied, Wreckage spent by a simple policy. Prints where each run died.
// `node tools/meta.mjs [--runs 8] [--profiles 20] [--level strong|casual|none|picks=..,strike=..] [--spend swarm|none]`
import { play } from "./bot.mjs" /* the game's headless player: tools/bot.mjs */
import { newProfile, runConfig, payout, advance, buyNode, canBuyNode, TREE, seedFor, nextOn } from "./meta.js" /* in the game: ../public/src/meta.js */
import { replay } from "../public/src/sim.js"

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]] : a), []))
const RUNS = Number(args.runs || 8), P = Number(args.profiles || 20), level = args.level || "casual", spend = args.spend || "swarm"

// what a player buys with Wreckage: swarm first, then a war chest, then whatever is cheapest
export function spendW(p, policy = "swarm") {
  if (policy === "none") return
  let bought = true
  while (bought) {
    bought = false
    // the swarm policy saves for Swarm first, and buys nothing cheaper while a rank is within reach
    const order = policy === "swarm" ? ["swarm", "chest", "reroll", "dice"] : Object.keys(TREE)
    if (policy === "swarm" && !canBuyNode(p, "swarm") && TREE.swarm.costs[p.tree.swarm || 0] != null) return
    for (const id of order) if (canBuyNode(p, id)) { buyNode(p, id); bought = true; break }
  }
}

// one career: returns each run's waves cleared, and the profile
export function career(seedBase, runs, level, policy, opts = {}) {
  const p = newProfile()
  const rows = []
  for (let i = 0; i < runs; i++) {
    const seed = seedFor(p, (seedBase * 1000 + i) >>> 0)
    const run = runConfig(p, seed)
    const { s, log } = play(seed, level, { run })
    if (opts.check) {
      const again = replay(seed, log, { run })
      const sig = (x) => JSON.stringify([x.tick, x.result?.waves, x.money, x.launchers.map((L) => [L.type, L.pad, L.ups]), x.mods, x.omen?.taken, x.stats.kills, x.stats.struck])
      if (sig(again) !== sig(s) || again.rejected) throw new Error(`replay differs on ${seed}`)
    }
    const pay = payout(p, s)
    const opened = advance(p, s, pay)
    spendW(p, policy)
    rows.push({ run: i + 1, waves: s.wavesDone, won: !!s.result?.won, fate: run.fate, tier: run.tier, w: pay.total, opened, money: run.startMoney, swarm: run.swarm, rank: run.rank })
  }
  return { rows, p }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const t0 = Date.now()
  const all = []
  for (let k = 0; k < P; k++) all.push(career(k, RUNS, level, spend, { check: k === 0 }))
  for (let i = 0; i < RUNS; i++) {
    const w = all.map((c) => c.rows[i].waves).sort((a, b) => a - b)
    const hist = {}
    for (const x of w) hist[x] = (hist[x] || 0) + 1
    const r = all[0].rows[i]
    console.log(`run ${i + 1}: median ${w[w.length >> 1]} range ${w[0]}–${w[w.length - 1]}  ${JSON.stringify(hist)}  [profile 0: rank ${r.rank} swarm ${r.swarm} money ${r.money} fate ${r.fate} ${r.tier} +${r.w}W opened ${r.opened.join(",") || "-"}]`)
  }
  const p = all[0].p
  console.log(`profile 0 after ${RUNS} runs: deaths ${p.deaths} best ${p.best} W ${p.w} (lifetime ${p.lifetimeW}) fragments ${p.fragments} tree ${JSON.stringify(p.tree)} · ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}
