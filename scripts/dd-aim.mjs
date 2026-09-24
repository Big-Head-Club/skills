import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await page.goto('http://localhost:5240'); await page.waitForTimeout(1000)
await page.evaluate(() => { localStorage.removeItem("dd.settings"); window.__noAutoPause = true; __game.startRun(false); __game.advance(6, 30) })
await page.waitForTimeout(700)
// cursor in an empty corner of the sky: no strike
await page.mouse.move(80, 120)
const before = await page.evaluate(() => { __game.advance(1.5, 30); return __game.run.s.stats.strikes })
// cursor onto a rocket: it fires there
const at = await page.evaluate(() => { const r = __game.run.s.rockets.filter(r => r.type !== "decoy")[0]; return __game.toScreen(r.x + r.vx * 0.45, r.y + r.vy * 0.45) })
await page.mouse.move(at.x, at.y)
const res = await page.evaluate(() => { __game.advance(0.4, 30); const s = __game.run.s; return { strikes: s.stats.strikes, shell: s.shells[0] && __game.toScreen(s.shells[0].tx, s.shells[0].ty) } })
console.log(JSON.stringify({ before, at, res }))
await b.close()
