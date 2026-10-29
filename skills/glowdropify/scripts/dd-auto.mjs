import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const res = {}
{
  const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
  const errs = []; page.on('pageerror', e => errs.push(e.message))
  await page.goto('http://localhost:5240'); await page.waitForTimeout(1000)
  res.auto = await page.evaluate(() => { window.__noAutoPause = true; __game.startRun(false); __game.advance(25, 30); return __game.run.s.stats.strikes })
  // switch it off from pause, play on: no more strikes
  await page.evaluate(() => document.getElementById('hudPause').click())
  await page.click('#pStrike'); res.label = await page.textContent('#pStrike')
  await page.click('#pResume')
  res.off = await page.evaluate(() => { const n = __game.run.s.stats.strikes; __game.advance(20, 30); return __game.run.s.stats.strikes - n })
  res.errs = errs
}
{
  const page = await (await b.newContext({ viewport: { width: 640, height: 360 }, hasTouch: true, isMobile: true })).newPage()
  await page.goto('http://localhost:5240'); await page.waitForTimeout(1000)
  await page.tap('#tMenu'); await page.waitForTimeout(200)
  res.menuFits = await page.evaluate(() => [...document.querySelectorAll('#tMenuList button')].every(b => { const r = b.getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0 }))
  await page.screenshot({ path: '/tmp/ddv/menu640.png' })
}
console.log(JSON.stringify(res))
await b.close()
