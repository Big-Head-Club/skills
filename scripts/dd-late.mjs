import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage()
await page.goto(process.argv[2]); await page.waitForTimeout(1500)
await page.evaluate(() => {
  window.__noAutoPause = true; localStorage.removeItem("dd.run"); __game.startRun(false)
  const s = () => __game.run.s
  for (let w = 0; w < 14; w++) {
    let k = 0; while (s().phase === "wave" && k++ < 900) { const alive = s().cities.filter(c => c.alive); alive.slice(1).forEach(c => { if (w < 8) c.hp = 3 }); alive[0] && (alive[0].hp = 3); __game.fast(20) }
    if (s().phase === "over") break
    const o = s().offer; if (o?.stage === "launcher") { const f = s().pads.filter(p => p.launcher == null && Math.abs(p.x) <= s().view/2); if (f.length) __game.input({ k: "launch", i: 0, pad: f[0].id }) }
    const o2 = s().offer; if (o2?.stage === "upgrade") { const i = o2.upgrades.findIndex(u => ["cooldown","radius","charge","flak"].includes(u)); if (!__game.input(i >= 0 ? { k: "upgrade", i, target: "strike" } : { k: "upgrade", i: 0, target: s().launchers[0].id })) __game.input({ k: "skip" }) }
  }
  __game.advance(4, 30)
})
const info = await page.evaluate(() => ({ wave: __game.run.s.wave, dead: __game.run.s.cities.filter(c => !c.alive).length, cities: __game.run.s.cities.length }))
await page.screenshot({ path: '/tmp/ddv/late.png' })
console.log(JSON.stringify(info))
await b.close()
