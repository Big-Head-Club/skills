import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const errs = []; page.on('pageerror', e => errs.push(e.message))
await page.goto('http://localhost:5240'); await page.waitForTimeout(1000)
const r = await page.evaluate(() => {
  localStorage.removeItem("dd.run"); window.__noAutoPause = true; __game.startRun(false)
  const s = __game.run.s
  let n = 0; while (s.phase === "wave" && n++ < 300) __game.fast(20)
  s.offer.items[0] = { kind: "launcher", id: "mint", price: 6 }; s.money = 20
  const f = s.pads.filter(p => p.launcher == null && Math.abs(p.x) <= s.view / 2)
  const ok = __game.input({ k: "buy", i: 0, pad: f[0].id }); __game.input({ k: "done" })
  const m0 = s.money
  n = 0; while (s.phase === "wave" && n++ < 300) { s.cities.forEach(c => { if (c.alive) c.hp = 3 }); __game.fast(20) }
  __game.advance(1, 30)
  return { ok, before: m0, after: s.money, income: s.income, pos: __game.toScreen(f[0].x, f[0].y) }
})
await page.screenshot({ path: '/tmp/ddv/mint.png', clip: { x: Math.max(0, r.pos.x - 160), y: Math.max(0, r.pos.y - 140), width: 320, height: 180 } })
console.log(JSON.stringify({ ...r, errs }))
await b.close()
