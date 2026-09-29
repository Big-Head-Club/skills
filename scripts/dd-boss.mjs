// wave 5's Warhead and the lure, in the air
import { chromium } from "playwright"
const out = process.argv[2]
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.on("pageerror", (e) => console.log("PAGEERROR", e.message))
await page.goto("http://localhost:5240/", { waitUntil: "networkidle" })
await page.evaluate(() => { window.__noAutoPause = true; const p = window.__game.profile; p.deaths = 30; p.best = 14; p.unlocked.push("prewave", "omens", "fate", "kite", "lure", "eye"); p.tree.swarm = 4; window.__game.saveProfile() })
await page.click("#tPlay"); await page.waitForTimeout(400)
const info = await page.evaluate(() => {
  const g = window.__game; const s = g.run.s; g.flush(); s.money = 4000
  s.offer.items = [{ kind: "launcher", id: "lure", price: 100, tier: "u" }, { kind: "launcher", id: "hornet", price: 100, tier: "c" }, { kind: "launcher", id: "hornet", price: 100, tier: "c" }]; s.offer.bought = []
  const free = s.pads.filter((p) => p.launcher == null && Math.abs(p.x) <= s.view / 2).sort((a, b) => Math.abs(a.x) - Math.abs(b.x))
  s.offer.items.forEach((x, i) => { const p = free[i]; if (p) g.input({ k: "buy", i, pad: p.id }) })
  g.flush(); g.input({ k: "done" }); g.flush()
  // play to wave 5, then run into the wave until the boss is on screen
  for (let i = 0; i < 12 && s.wave < 5; i++) { s.cities.forEach((c) => (c.hp = 9)); g.fast(60 * 40); g.flush(); if (s.phase === "breather") { if (s.offer?.stage === "omen") { g.input({ k: "omen", i: 0 }); g.flush() } g.autoShop(); g.flush() } }
  let n = 0; while (!s.rockets.some((r) => r.type === "warhead") && n++ < 60 * 30) { s.cities.forEach((c) => (c.hp = 9)); g.fast(1) }
  g.fast(60 * 4); g.flush()
  return { wave: s.wave, phase: s.phase, boss: s.rockets.filter((r) => r.type === "warhead").map((r) => [Math.round(r.x), Math.round(r.y), r.hp]), lure: s.drones.filter((d) => d.type === "lure").length }
})
console.log(JSON.stringify(info))
await page.mouse.move(640, 260); await page.waitForTimeout(500)
await page.screenshot({ path: `${out}/boss.png` })
await browser.close()
