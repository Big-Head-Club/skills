// live-coordinate probe: strike, launcher and pad targets, clicks at offsets, each with a fresh target position
import { chromium } from "playwright"
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
await page.goto("http://localhost:5240/", { waitUntil: "networkidle" })
await page.evaluate(() => { window.__noAutoPause = true; const p = window.__game.profile; p.deaths = 6; p.best = 6; p.unlocked.push("prewave", "omens", "fate", "kite", "hangar", "shop2x2", "rate", "reroll", "warden", "tierU", "shot"); p.tree.scrap = 1; window.__game.saveProfile() })
await page.click("#tPlay"); await page.waitForTimeout(2500)
const reset = () => page.evaluate(() => { const g = window.__game; const s = g.run.s; s.money = 99999; s.offer.items = [{ kind: "upgrade", id: "cooldown", price: 10, tier: "u" }, { kind: "upgrade", id: "reach", price: 10, tier: "c" }, { kind: "launcher", id: "hornet", price: 10, tier: "c" }]; s.offer.bought = []; g.offer() })
await reset(); await page.waitForTimeout(500)
const where = (kind) => page.evaluate((kind) => { const g = window.__game; const s = g.run.s; if (kind === "laser") { const l = s.world.laser; return g.toScreen(l.x, l.y) } if (kind === "launcher") { const L = s.launchers[0]; return g.toScreen(L.x, L.y) } const p = s.pads.filter((p) => p.launcher == null && Math.abs(p.x) <= s.view / 2).sort((a, b) => Math.abs(a.x) - Math.abs(b.x))[0]; return g.toScreen(p.x, p.y) }, kind)
const probe = async (cardIndex, kind, label) => {
  const out = []
  for (const [dx, dy] of [[0, 0], [0, -20], [0, -40], [0, -60], [30, -30], [-30, -30], [40, 0], [-40, 0], [0, 20], [30, 20], [50, -50], [0, -80]]) {
    await reset(); await page.waitForTimeout(450)
    await page.click(`#cards button:nth-child(${cardIndex})`); await page.waitForTimeout(400)
    const at = await where(kind)
    await page.mouse.move(at.x + dx, at.y + dy); await page.waitForTimeout(60)
    const hover = await page.evaluate(() => ({ pad: window.__game.ui.hoverPad, L: window.__game.ui.hoverLauncher }))
    await page.evaluate(() => document.querySelectorAll(".nudge").forEach((el) => el.classList.remove("nudge")))
    await page.mouse.click(at.x + dx, at.y + dy); await page.waitForTimeout(60)
    const r = await page.evaluate(() => { const n = document.querySelector(".nudge"); return { nudge: n ? (n.id || n.className) : null, picked: !!document.querySelector("#cards .picked"), money: window.__game.run.s.money } })
    const bought = r.money < 99999
    out.push(`${dx},${dy}:${r.nudge ? `SHAKE(${r.nudge})${bought ? "+bought" : ""}` : bought ? "ok" : r.picked ? "held" : "?"}`)
    await page.waitForTimeout(400)
  }
  console.log(label, out.join("  "))
}
await probe(1, "laser", "strike:  ")
await probe(2, "launcher", "launcher:")
await browser.close()
