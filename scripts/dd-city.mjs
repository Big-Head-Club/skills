import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type() === 'error' && errs.push(m.text()))
await page.goto('http://localhost:5240'); await page.waitForTimeout(1500)
await page.screenshot({ path: '/tmp/ddv/c-title.png' })
await page.evaluate(() => { window.__noAutoPause = true; __game.startRun(false); __game.advance(9, 30) })
await page.screenshot({ path: '/tmp/ddv/c-wave1.png' })
const pickAll = () => __game.autoShop()
await page.evaluate(`window.pickAll = ${pickAll.toString()}`)
for (const [w, name] of [[5, 'c-wave6'], [6, 'c-wave12']]) {
  await page.evaluate((w) => { const s = () => __game.run.s; for (let i = 0; i < w; i++) { s().cities.forEach(c => { if (c.alive) c.hp = c.maxHp }); let n = 0; while (s().phase === "wave" && n++ < 900) { s().cities.forEach(c => { if (c.alive) c.hp = c.maxHp }); __game.fast(20) }; if (s().phase === "over") break; pickAll() } __game.advance(6, 30) }, w)
  await page.screenshot({ path: `/tmp/ddv/${name}.png` })
}
console.log(JSON.stringify({ wave: await page.evaluate(() => __game.run.s.wave), phase: await page.evaluate(() => __game.run.s.phase), errs }))
await b.close()
