// hunt the false shake: pick a strike card and a launcher card, click around their targets, log every nudge
import { chromium } from "playwright"
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.on("pageerror", (e) => console.log("PAGEERROR", e.message))
await page.goto("http://localhost:5240/", { waitUntil: "networkidle" })
await page.evaluate(() => { window.__noAutoPause = true; const p = window.__game.profile; p.deaths = 6; p.best = 6; p.unlocked.push("prewave", "omens", "fate", "kite", "hangar", "shop2x2", "rate", "reroll", "warden", "tierU", "shot"); window.__game.saveProfile() })
await page.click("#tPlay"); await page.waitForTimeout(500)
await page.evaluate(() => { const g = window.__game; const s = g.run.s; g.flush(); s.money = 99999; s.offer.items = [{ kind: "upgrade", id: "cooldown", price: 10, tier: "u" }, { kind: "upgrade", id: "reach", price: 10, tier: "c" }, { kind: "launcher", id: "hornet", price: 10, tier: "c" }]; s.offer.bought = []; g.offer() })
await page.waitForTimeout(600)
const targets = await page.evaluate(() => { const g = window.__game; const s = g.run.s; const l = s.world.laser; const L = s.launchers[0]; return { laser: g.toScreen(l.x, l.y), launcher: g.toScreen(L.x, L.y), scale: g.R.cam.scale / g.R.cam.dpr } })
console.log("targets", JSON.stringify(targets))
const probe = async (cardIndex, at, label) => {
  const out = []
  for (const [dx, dy] of [[0, 0], [0, -20], [0, -40], [0, -60], [30, -30], [-30, -30], [40, 0], [-40, 0], [0, 20], [30, 20], [50, -50], [0, -80]]) {
    await page.click(`#cards button:nth-child(${cardIndex})`); await page.waitForTimeout(400)
    const picked = await page.evaluate(() => !!document.querySelector("#cards .picked"))
    await page.mouse.click(at.x + dx, at.y + dy); await page.waitForTimeout(60)
    const r = await page.evaluate(() => ({ nudge: !!document.querySelector(".nudge"), picked: !!document.querySelector("#cards .picked") }))
    out.push(`${dx},${dy}:${!picked ? "np" : r.nudge ? "SHAKE" : r.picked ? "held" : "ok"}`)
    await page.waitForTimeout(400)
    // put the shop back exactly as it was for the next probe
    await page.evaluate(() => { const g = window.__game; const s = g.run.s; s.money = 99999; s.offer.items = [{ kind: "upgrade", id: "cooldown", price: 10, tier: "u" }, { kind: "upgrade", id: "reach", price: 10, tier: "c" }, { kind: "launcher", id: "hornet", price: 10, tier: "c" }]; s.offer.bought = []; g.offer() })
    await page.waitForTimeout(450)
  }
  console.log(label, out.join("  "))
}
await probe(1, targets.laser, "strike card @emplacement:")
await probe(2, targets.launcher, "launcher card @launcher:")
await browser.close()
