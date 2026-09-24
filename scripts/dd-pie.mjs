import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await page.goto('http://localhost:5240'); await page.waitForTimeout(1000)
await page.evaluate(() => { window.__noAutoPause = true; localStorage.setItem("dd.settings", JSON.stringify({ sound: true, autoStrike: false })) })
await page.reload(); await page.waitForTimeout(1000)
await page.evaluate(() => { window.__noAutoPause = true; __game.startRun(false); __game.advance(3, 30) })
await page.waitForTimeout(700); await page.mouse.move(700, 300); await page.mouse.click(700, 300); console.log(await page.evaluate(() => __game.run.s.strike.ready))
const cd = await page.evaluate(() => __game.run.s.strike.cooldown)
for (const [i, t] of [[0, 1.5], [1, 1.5], [2, 2.0]]) { await page.evaluate((t) => __game.advance(t, 30), t); await page.mouse.move(700 + i, 300); await page.screenshot({ path: `/tmp/ddv/pie-${i}.png`, clip: { x: 560, y: 160, width: 280, height: 280 } }) }
console.log(JSON.stringify({ cd }))
await b.close()
