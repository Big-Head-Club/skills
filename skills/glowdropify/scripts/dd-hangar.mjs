import { chromium } from "playwright"
const out = process.argv[2]
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.on("pageerror", (e) => console.log("PAGEERROR", e.message))
await page.goto("http://localhost:5240/", { waitUntil: "networkidle" })
await page.evaluate(() => { const p = window.__game.profile; p.deaths = 2; p.w = 140; p.fragments = 3; p.unlocked.push("prewave", "omens", "fate", "shop2x2", "kite", "hangar"); window.__game.saveProfile(); window.__game.openHangar(true) })
await page.waitForTimeout(700)
await page.screenshot({ path: `${out}/hangar2.png` })
await page.evaluate(() => window.__game.goHome())
// a run at rank 2 to see the shop with tiers and reroll, and the pause line
await page.click("#tPlay"); await page.waitForTimeout(500)
await page.evaluate(() => { const g = window.__game; g.flush(); g.autoShop(); g.fast(60 * 40); g.flush(); if (g.run.s.offer?.stage === "omen") { g.input({ k: "omen", i: 0 }); g.flush() } })
await page.waitForTimeout(1400)
await page.screenshot({ path: `${out}/shop-rank2.png` })
await page.click("#hudPause"); await page.waitForTimeout(400)
await page.screenshot({ path: `${out}/pause.png` })
await browser.close()
