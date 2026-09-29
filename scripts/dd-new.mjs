// the new drones in the air: a full profile, money for the shop, buy one of each by hand
import { chromium } from "playwright"
const out = process.argv[2]
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.on("pageerror", (e) => console.log("PAGEERROR", e.message))
await page.goto("http://localhost:5240/", { waitUntil: "networkidle" })
await page.evaluate(() => { window.__noAutoPause = true; const p = window.__game.profile; p.deaths = 30; p.best = 14; p.unlocked.push("prewave", "omens", "fate", "kite", "hangar", "shop2x2", "rate", "reroll", "shot", "warden", "tierU", "split", "laser12", "picket", "cooldown", "shop3x2", "hardened", "eye", "weaver", "charge", "gunship", "shop3x3", "lure", "reaper", "beacon", "refund", "ap", "mint", "radius", "laser15", "ram", "tierR", "laser4", "flak", "chain", "hive", "prism", "dms"); p.tree.swarm = 3; window.__game.saveProfile() })
await page.click("#tPlay"); await page.waitForTimeout(500)
// the pre-wave shop: force the four new types in, with money, and place them on free pads
const info = await page.evaluate(() => {
  const g = window.__game; const s = g.run.s; g.flush()
  s.money = 5000
  s.offer.items = ["gunship", "reaper", "eye", "lure"].map((id) => ({ kind: "launcher", id, price: 100, tier: "r" }))
  s.offer.bought = []
  const free = s.pads.filter((p) => p.launcher == null && Math.abs(p.x) <= s.view / 2).sort((a, b) => Math.abs(a.x) - Math.abs(b.x))
  const placed = []
  s.offer.items.forEach((x, i) => { const p = free[i]; if (p && g.input({ k: "buy", i, pad: p.id })) placed.push(x.id) })
  g.flush(); g.input({ k: "done" }); g.flush()
  g.fast(60 * 9); g.flush()
  return { placed, drones: s.drones.map((d) => d.type + "@" + Math.round(d.y)), wave: s.wave }
})
console.log(JSON.stringify(info))
await page.mouse.move(700, 300); await page.waitForTimeout(600)
await page.screenshot({ path: `${out}/new-drones.png` })
await page.evaluate(() => { const g = window.__game; g.fast(60 * 6); g.flush() })
await page.waitForTimeout(300)
await page.screenshot({ path: `${out}/new-drones-2.png` })
await page.evaluate(() => { window.__game.show("hangar", true); window.__game.openHangar() })
await page.waitForTimeout(500)
await page.evaluate(() => document.querySelector("#hangar .scroll").scrollTo(0, 600))
await page.waitForTimeout(200)
await page.screenshot({ path: `${out}/hangar-deeds.png` })
await browser.close()
