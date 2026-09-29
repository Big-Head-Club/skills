import { chromium } from "/Users/danieljviau/.claude/skills/glowdropify/scripts/node_modules/playwright/index.mjs"
const out = process.argv[2]
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.on("pageerror", (e) => console.log("PAGEERROR", e.message))
await page.goto("http://localhost:5241/", { waitUntil: "networkidle" })
await page.evaluate(() => { localStorage.clear(); window.__noAutoPause = true })
await page.reload({ waitUntil: "networkidle" })
await page.evaluate(() => { window.__noAutoPause = true })
await page.click("#tPlay"); await page.waitForTimeout(400)
const pre = await page.evaluate(() => { const g = window.__game, s = g.run.s; s.launchers.length = 0; s.drones.length = 0; s.pads.forEach((p) => (p.launcher = null)); if (s.phase === "ready") { g.input({ k: "go" }); g.flush() } g.fast(60 * 3); g.flush(); s.cities.forEach((c) => { c.hp = 1000; c.maxHp = 1000 }); const rk = [...s.rockets].sort((a, b) => a.y - b.y)[0]; rk.type = "warhead"; rk.hp = 999; let n = 0; while (!s.blasts.some((b) => b.nuke) && s.phase === "wave" && n++ < 60 * 40) { g.fast(1); g.flush(); s.cities.forEach((c) => { if (c.hp < 1000) c.hp = 1000 }) } return { nuke: s.blasts.some((b) => b.nuke), phase: s.phase, n } })
console.log(JSON.stringify(pre))
let last = 0
for (const t of [0.1, 0.5, 1.0, 1.6, 2.6]) {
  await page.evaluate((dt) => { const g = window.__game; g.advance(dt) }, t - last); last = t
  await page.screenshot({ path: `${out}/nuke-${t}.png` })
}
await browser.close()
