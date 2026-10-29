import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const errs = []; page.on('pageerror', e => errs.push(e.message))
await page.goto('http://localhost:5240'); await page.waitForTimeout(1200)
const L = await page.evaluate(async () => {
  window.__noAutoPause = true; __game.startRun(false); __game.advance(7, 30)
  const s = () => __game.run.s
  let n = 0; while (s().phase === "wave" && n++ < 300) __game.fast(20)
  const f = s().pads.filter(p => p.launcher == null && Math.abs(p.x) <= s().view/2)
  __game.input({ k: "launch", i: 0, pad: f[1].id })
  s().offer.upgrades = ["reach", "rate", "shot"]; __game.offer()
  await new Promise(r => setTimeout(r, 500))
  const L = s().launchers[0]
  return { ...__game.toScreen(L.x, L.y) }
})
await page.click('#cards .card:nth-child(1)')
await page.mouse.click(L.x, L.y - 8)
for (const [i, dt] of [[0, 0.1], [1, 0.25], [2, 0.3], [3, 0.4]]) { await page.evaluate((d) => __game.advance(d, 30), dt); await page.screenshot({ path: `/tmp/ddv/reach-${i}.png`, clip: { x: Math.max(0, L.x - 360), y: Math.max(0, L.y - 420), width: 720, height: 460 } }) }
console.log(JSON.stringify({ errs, reach: await page.evaluate(() => __game.run.s.launchers[0].ups.reach) }))
await b.close()
