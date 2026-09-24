import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await page.goto('http://localhost:5240'); await page.waitForTimeout(1000)
const n = await page.evaluate(() => {
  window.__noAutoPause = true; __game.startRun(false)
  const s = () => __game.run.s
  for (let w = 0; w < 6; w++) {
    let k = 0; while (s().phase === "wave" && k++ < 900) { s().cities.forEach(c => { if (c.alive && c.hp < 2) c.hp = 2 }); __game.fast(20) }
    if (w === 5) break
    const f = s().pads.filter(p => p.launcher == null && Math.abs(p.x) <= s().view/2); if (s().offer?.stage === "launcher") __game.input({ k: "launch", i: 0, pad: f[0].id })
    const o = s().offer; if (o) { const i = o.upgrades.findIndex(u => ["cooldown","radius","charge","flak"].includes(u)); __game.input(i >= 0 ? { k: "upgrade", i, target: "strike" } : { k: "upgrade", i: 0, target: s().launchers[0].id }) }
  }
  __game.advance(3, 30)
  return s().report.leaks.length
})
await page.screenshot({ path: '/tmp/ddv/leak.png' })
console.log(n)
await b.close()
