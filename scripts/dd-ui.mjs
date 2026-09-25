// drive the roguelite client through a run and shoot every new screen
import { chromium } from "playwright"
const out = process.argv[2] || "/private/tmp/claude-501/-Users-danieljviau-Desktop-stuff/e4526ee5-f607-4ab8-9fbd-200b78dd30dc/scratchpad/ui"
import fs from "node:fs"; fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
const errors = []
page.on("pageerror", (e) => errors.push("pageerror: " + e.message))
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()) })
await page.goto("http://localhost:5240/", { waitUntil: "networkidle" })
await page.evaluate(() => { window.__noAutoPause = true })
await page.waitForTimeout(800)
await page.screenshot({ path: `${out}/1-title.png` })
// a run: fast-forward to the first breather, shoot the shop, auto-buy, then play until death
await page.click("#tPlay")
await page.waitForTimeout(600)
await page.screenshot({ path: `${out}/2-wave1.png` })
const info = await page.evaluate(() => { const g = window.__game; g.fast(60 * 40); return { phase: g.run.s.phase, wave: g.run.s.wave, money: g.run.s.money, stage: g.run.s.offer?.stage } })
console.log("after fast:", JSON.stringify(info))
await page.waitForTimeout(1500)
await page.screenshot({ path: `${out}/3-shop.png` })
// play the run out with the dev autoShop, until it ends
for (let i = 0; i < 12; i++) {
  const st = await page.evaluate(() => { const g = window.__game; const s = g.run?.s; if (!s || s.phase === "over") return "over"; if (s.phase === "breather") { g.flush(); if (s.offer?.stage === "omen") { g.input({ k: "omen", i: 0 }); g.flush() } g.autoShop() } g.fast(60 * 40); return s.phase + "/" + s.wave })
  console.log("step", i, st)
  if (st === "over") break
  await page.waitForTimeout(100)
}
await page.waitForTimeout(2500)
await page.screenshot({ path: `${out}/4-over.png` })
const prof = await page.evaluate(() => JSON.stringify({ runs: window.__game.profile.runs, deaths: window.__game.profile.deaths, w: window.__game.profile.w, unlocked: window.__game.profile.unlocked }))
console.log("profile:", prof)
await page.click("#oSpend").catch(() => {})
await page.waitForTimeout(600)
await page.screenshot({ path: `${out}/5-hangar.png` })
// second run: pre-wave shop and omens
await page.evaluate(() => { window.__game.goHome() })
await page.waitForTimeout(300)
await page.screenshot({ path: `${out}/6-title2.png` })
await page.click("#tPlay")
await page.waitForTimeout(900)
await page.screenshot({ path: `${out}/7-prewave.png` })
const st2 = await page.evaluate(() => { const g = window.__game; g.flush(); g.autoShop(); g.fast(60 * 40); const s = g.run.s; return s.phase + "/" + s.wave + "/" + s.offer?.stage })
console.log("run2:", st2)
await page.waitForTimeout(1500)
await page.screenshot({ path: `${out}/8-omens.png` })
console.log("errors:", JSON.stringify(errors))
await browser.close()
