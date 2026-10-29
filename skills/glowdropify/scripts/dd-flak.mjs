import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const errs = []; page.on('pageerror', e => errs.push(e.message))
await page.goto('http://localhost:5240'); await page.waitForTimeout(1000)
const res = await page.evaluate(() => {
  window.__noAutoPause = true; __game.startRun(false)
  const s = __game.run.s
  s.strike.ups.push("flak", "flak", "flak"); s.strike.charges = 3; s.strike.ready = 3
  __game.advance(7, 30)
  // fire into the sky ahead of the rockets, so the flak sits in their path
  const r = s.rockets.filter(r => r.type !== "decoy").sort((a, b) => b.y - a.y)[0]
  __game.input({ k: "strike", x: r.x + r.vx * 2.2, y: r.y + r.vy * 2.2 })
  __game.advance(1.2, 30)
  const flak = s.flak.length
  const before = s.stats.struck
  return { flak, struckAfterBlast: before, pos: __game.toScreen(r.x + r.vx * 2.2, r.y + r.vy * 2.2) }
})
await page.screenshot({ path: '/tmp/ddv/flak.png', clip: { x: Math.max(0, res.pos.x - 250), y: Math.max(0, res.pos.y - 180), width: 500, height: 360 } })
res.later = await page.evaluate(() => { __game.advance(8, 30); return { struck: __game.run.s.stats.struck, flak: __game.run.s.flak.length } })
console.log(JSON.stringify({ ...res, errs }))
await b.close()
