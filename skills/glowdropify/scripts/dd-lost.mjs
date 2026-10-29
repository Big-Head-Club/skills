import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const errs = []; page.on('pageerror', e => errs.push(e.message))
await page.goto('http://localhost:5240'); await page.waitForTimeout(1000)
const got = await page.evaluate(() => {
  window.__noAutoPause = true; __game.startRun(false)
  const s = () => __game.run.s
  for (let w = 0; w < 3; w++) { let k = 0; while (s().phase === "wave" && k++ < 900) { s().cities.forEach(c => { if (c.alive) c.hp = 3 }); __game.fast(20) } const o = s().offer; if (o?.stage === "launcher") { const f = s().pads.filter(p => p.launcher == null && Math.abs(p.x) <= s().view/2); __game.input({ k: "launch", i: 0, pad: f[0].id }) } const o2 = s().offer; if (o2) { const i = o2.upgrades.findIndex(u => ["cooldown","radius","charge","flak"].includes(u)); __game.input(i >= 0 ? { k: "upgrade", i, target: "strike" } : { k: "upgrade", i: 0, target: s().launchers[0].id }) } }
  // let one city take its last hit
  const c = s().cities.find(c => c.alive && c.x !== 0) || s().cities[0]
  s().cities.forEach(o => { if (o !== c && o.alive) o.hp = 3 })
  c.hp = 1
  for (let i = 0; i < 3000 && c.alive; i++) { __game.advance(1 / 30, 30); s().cities.forEach(o => { if (o !== c && o.alive) o.hp = 3 }) }
  return { lost: !c.alive, ...__game.toScreen(c.x, c.y) }
})
await page.evaluate(() => __game.advance(0.2, 30))
await page.screenshot({ path: '/tmp/ddv/lost-0.png' })
await page.evaluate(() => { const s = __game.run.s; for (let i = 0; i < 120; i++) { s.cities.forEach(o => { if (o.alive) o.hp = 3 }); __game.advance(1 / 30, 30) } })
await page.screenshot({ path: '/tmp/ddv/lost-1.png' })
console.log(JSON.stringify({ got, errs }))
await b.close()
