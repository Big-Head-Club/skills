import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const errs = []; page.on('pageerror', e => errs.push(e.message))
await page.goto('http://localhost:5240'); await page.waitForTimeout(1000)
const snap = () => page.evaluate(() => { const s = __game.run?.s; return s && { screen: __game.screen, phase: s.phase, wave: s.wave, tick: s.tick, launchers: s.launchers.map(L => L.type + ":" + L.pad + ":" + JSON.stringify(L.ups)).join(","), cities: s.cities.map(c => c.hp).join(","), kills: s.stats.kills, rockets: s.rockets.length } })
// play into wave 3 through the page's own input path
await page.evaluate(async () => {
  window.__noAutoPause = true; __game.startRun(false)
  const s = () => __game.run.s
  for (let w = 0; w < 2; w++) {
    let n = 0; while (s().phase === "wave" && n++ < 900) __game.fast(20)
    const f = s().pads.filter(p => p.launcher == null && Math.abs(p.x) <= s().view/2)
    __game.input({ k: "launch", i: 0, pad: f[1].id })
    const o = s().offer; const i = o.upgrades.findIndex(u => ["cooldown","radius"].includes(u))
    __game.input(i >= 0 ? { k: "upgrade", i, target: "strike" } : { k: "upgrade", i: 0, target: s().launchers[0].id })
  }
  __game.advance(6, 30)
})
const midWave = await snap()
await page.evaluate(() => dispatchEvent(new Event("pagehide")))
await page.reload(); await page.waitForTimeout(2500)
const afterWave = await snap()
// now to a breather, reload there
await page.evaluate(() => { document.getElementById('pResume').click(); let n = 0; while (__game.run.s.phase === "wave" && n++ < 900) __game.fast(20); __game.advance(0.5, 30) })
const midBreather = await snap()
await page.evaluate(() => dispatchEvent(new Event("pagehide")))
await page.reload(); await page.waitForTimeout(2500)
const afterBreather = await snap()
const cards = await page.evaluate(() => document.querySelectorAll('#cards .card').length)
console.log(JSON.stringify({ midWave, afterWave, midBreather, afterBreather, cards, errs }, null, 1))
await b.close()
