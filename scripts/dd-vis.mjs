// the meta in play: the dial, the chips after a curse, the deed line, the pity pips, and a flak battery
import { chromium } from "playwright"
const out = process.argv[2]
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.on("pageerror", (e) => console.log("PAGEERROR", e.message))
await page.goto("http://localhost:5240/", { waitUntil: "networkidle" })
await page.evaluate(() => { window.__noAutoPause = true; const p = window.__game.profile; p.deaths = 6; p.best = 6; p.lifetimeW = 77; p.unlocked.push("prewave", "omens", "fate", "kite", "hangar", "shop2x2", "rate", "reroll", "flakgun", "warden", "tierU"); p.tree.swarm = 2; window.__game.saveProfile() })
await page.click("#tPlay"); await page.waitForTimeout(500)
const info = await page.evaluate(() => {
  const g = window.__game; const s = g.run.s; g.flush(); s.money = 3000; s.pity = 5
  s.offer.items = [{ kind: "launcher", id: "flakgun", price: 100, tier: "u" }, { kind: "launcher", id: "hornet", price: 100, tier: "c" }, { kind: "upgrade", id: "range", price: 100, tier: "c" }, { kind: "upgrade", id: "reach", price: 100, tier: "c" }]; s.offer.bought = []
  const free = s.pads.filter((p) => p.launcher == null && Math.abs(p.x) <= s.view / 2).sort((a, b) => Math.abs(a.x) - Math.abs(b.x))
  g.input({ k: "buy", i: 0, pad: free[0].id }); g.input({ k: "buy", i: 1, pad: free[1].id }); g.flush()
  g.offer()
  return { flak: s.launchers.map((L) => L.type), pity: s.pity }
})
console.log(JSON.stringify(info))
await page.waitForTimeout(500)
await page.screenshot({ path: `${out}/vis-shop.png` })
// through wave 1 to the omen: take the curse if one shows, else the first; then into wave 2 with the chips up
const info2 = await page.evaluate(() => {
  const g = window.__game; const s = g.run.s
  g.input({ k: "done" }); g.flush()
  s.cities.forEach((c) => (c.hp = 99))
  g.fast(60 * 40); g.flush()
  let picked = null
  if (s.offer?.stage === "omen") { const i = s.offer.cards.findIndex((id) => id === "dust" || id === "levy" || id === "jammed" || id === "fog" || id === "volley" || id === "blackout"); picked = s.offer.cards[i >= 0 ? i : 0]; g.input({ k: "omen", i: i >= 0 ? i : 0 }); g.flush() }
  g.autoShop(); g.flush(); g.fast(60 * 3); g.flush()
  return { picked, wave: s.wave, mods: s.mods.length, flakClouds: s.flak.length }
})
console.log(JSON.stringify(info2))
await page.mouse.move(700, 250); await page.waitForTimeout(400)
await page.screenshot({ path: `${out}/vis-wave.png` })
await page.screenshot({ path: `${out}/vis-hud.png`, clip: { x: 0, y: 0, width: 420, height: 160 } })
await browser.close()
