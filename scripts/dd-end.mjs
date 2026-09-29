// the end sequence, frame by frame: a strong run 1 so several cards open
import { chromium } from "playwright"
const out = process.argv[2]
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
for (const [name, vp] of [["desk", { width: 1280, height: 720 }], ["phone", { width: 844, height: 390 }]]) {
  const page = await browser.newPage({ viewport: vp })
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message))
  await page.goto("http://localhost:5240/", { waitUntil: "networkidle" })
  await page.evaluate(() => { window.__noAutoPause = true })
  await page.click("#tPlay"); await page.waitForTimeout(400)
  // money for the early shops, then the run ends by hand after wave 6, so several cards open at once
  await page.evaluate(() => { const g = window.__game; g.run.s.money = 700 })
  for (let i = 0; i < 12; i++) {
    const st = await page.evaluate(() => { const g = window.__game; const s = g.run?.s; if (!s || s.phase === "over") return "over"; g.flush(); if (s.phase === "breather") { if (s.offer?.stage === "omen") { g.input({ k: "omen", i: 0 }); g.flush() } if (s.wave >= 7) { s.cities.forEach((c) => { c.alive = false; c.hp = 0 }); g.fast(2); g.flush(); return "over" } g.autoShop() } g.fast(60 * 45); g.flush(); return s.phase + "/" + s.wave })
    if (st === "over") break
  }
  await page.waitForTimeout(2300)
  await page.screenshot({ path: `${out}/end-${name}-1.png` })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${out}/end-${name}-1b.png` })
  await page.waitForTimeout(4500)
  await page.screenshot({ path: `${out}/end-${name}-2.png` })
  await page.mouse.click(vp.width / 2, vp.height * 0.8); await page.waitForTimeout(500)
  await page.screenshot({ path: `${out}/end-${name}-3.png` })
  await page.mouse.click(vp.width / 2, vp.height * 0.8); await page.waitForTimeout(500)
  await page.screenshot({ path: `${out}/end-${name}-3b.png` })
  for (let k = 0; k < 12; k++) { await page.mouse.click(vp.width / 2, vp.height * 0.8); await page.waitForTimeout(150) }
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${out}/end-${name}-4.png` })
  await page.click("#oMore").catch(() => {}); await page.waitForTimeout(300)
  await page.screenshot({ path: `${out}/end-${name}-5.png` })
  await page.close()
}
await browser.close()
