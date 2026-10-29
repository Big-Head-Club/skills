// leak lines in a breather after a wave with lobs and zigzags, cities kept alive so leaks are recorded
import { chromium } from "playwright"
const out = process.argv[2]
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.on("pageerror", (e) => console.log("PAGEERROR", e.message))
await page.goto("http://localhost:5240/", { waitUntil: "networkidle" })
await page.evaluate(() => { window.__noAutoPause = true })
await page.click("#tPlay"); await page.waitForTimeout(400)
const info = await page.evaluate(() => {
  const g = window.__game; const s = g.run.s; g.flush()
  // no defence at all: every rocket leaks; play to the breather after wave 5
  s.launchers.length = 0; s.drones.length = 0; s.pads.forEach((p) => (p.launcher = null))
  for (let i = 0; i < 6 && s.wave < 5; i++) { s.cities.forEach((c) => (c.hp = 999)); g.fast(60 * 45); g.flush(); if (s.phase === "breather" && s.wave < 5) { if (s.offer?.stage === "omen") { g.input({ k: "omen", i: 0 }); g.flush() } g.input({ k: "done" }); g.flush() } }
  return { wave: s.wave, phase: s.phase, leaks: s.report.leaks.map((l) => l.type + (l.arc ? "*" : "")).join(","), lob: s.report.leaks.filter((l) => l.type === "lob").slice(0, 1).map((l) => ({ first: l.path.slice(0, 8).map((v) => Math.round(v)), n: l.path.length / 2, arc: l.arc?.map((v) => Math.round(v * 100) / 100) })) }
})
console.log(JSON.stringify(info))
await page.waitForTimeout(1200)
await page.screenshot({ path: `${out}/leaks.png` })
await browser.close()
