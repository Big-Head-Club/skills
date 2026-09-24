import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage()
await page.goto('http://localhost:5240'); await page.waitForTimeout(1500)
await page.evaluate(() => { window.__noAutoPause = true; __game.startRun(false); __game.advance(0.5, 30); document.getElementById('hudPause').click() })
// sample one scanline through the clouds over time; record the run lengths of equal colour
for (let i = 0; i < 4; i++) {
  await page.waitForTimeout(900)
  await page.screenshot({ path: `/tmp/ddv/jit-${i}.png`, clip: { x: 1180, y: 590, width: 200, height: 110 } })
}
await page.screenshot({ path: '/tmp/ddv/jit-full.png' })
await b.close()
