import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type() === 'error' && errs.push(m.text()))
await page.goto('http://localhost:5240'); await page.waitForTimeout(1000)
// wave 14: every rocket type is in the pool. Spawn one of each in a row so they sit side by side.
const types = await page.evaluate(() => {
  localStorage.removeItem("dd.run"); window.__noAutoPause = true; __game.startRun(false)
  const s = __game.run.s
  for (let w = 0; w < 13; w++) { let n = 0; while (s.phase === "wave" && n++ < 900) { s.cities.forEach(c => { if (c.alive) c.hp = 3 }); __game.fast(20) } if (s.phase === "breather") __game.autoShop() }
  __game.advance(0.5, 30)
  s.rockets.length = 0; s.script.length = s.scriptAt // clear the wave so only ours fly
  return s.script.length
})
await page.evaluate(async () => {
  const s = __game.run.s
  const { spawnRocket } = await import("/src/sim.js")
  const order = ["dart", "lob", "zigzag", "decoy", "needle", "splitter", "brute"]
  const city = s.cities.find(c => c.alive)
  order.forEach((t, i) => spawnRocket(s, t, 0.12 + i * 0.125, city, 0.5))
  __game.advance(1.6, 30)
})
await page.screenshot({ path: '/tmp/ddv/rk-a.png', clip: { x: 0, y: 0, width: 1440, height: 520 } })
await page.evaluate(() => __game.advance(1 / 30, 30)); await page.waitForTimeout(1000)
await page.screenshot({ path: '/tmp/ddv/rk-b.png', clip: { x: 0, y: 0, width: 1440, height: 520 } })
console.log(JSON.stringify({ errs }))
await b.close()
