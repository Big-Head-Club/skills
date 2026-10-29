import { chromium } from "playwright"
const out = process.argv[2]
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
page.on("pageerror", (e) => console.log("PAGEERROR", e.message))
await page.goto("http://localhost:5240/", { waitUntil: "networkidle" })
await page.evaluate(() => { window.__noAutoPause = true })
await page.click("#tPlay"); await page.waitForTimeout(500)
await page.mouse.move(700, 250); await page.waitForTimeout(400)
await page.evaluate(() => { const g = window.__game; g.fast(60 * 4); g.flush() })
await page.waitForTimeout(300)
await page.screenshot({ path: `${out}/laser-wave.png`, clip: { x: 340, y: 380, width: 600, height: 340 } })
// a strike upgrade picked: the emplacement breathes a ring
await page.evaluate(() => { const g = window.__game; const s = g.run.s; s.cities[0].hp = 99; g.fast(60 * 60); g.flush(); s.money = 2000; s.offer.items[2] = { kind: "upgrade", id: "radius", price: 450, tier: "u" }; g.offer() })
await page.waitForTimeout(500)
await page.click("#cards button:nth-child(3)"); await page.waitForTimeout(600)
await page.screenshot({ path: `${out}/laser-up.png` })
await browser.close()
