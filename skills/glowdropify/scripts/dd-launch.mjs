import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage()
await page.goto('http://localhost:5240'); await page.waitForTimeout(1200)
const at = await page.evaluate(async () => {
  window.__noAutoPause = true; __game.startRun(false); __game.advance(7, 30)
  const s = () => __game.run.s, g = (x) => s().world.at(x)
  // put every launcher on the pad with the most uneven ground around it
  const bumpy = (p) => { let lo = 1e9, hi = -1e9; for (let d = -6; d <= 6; d += 0.5) { lo = Math.min(lo, g(p.x + d)); hi = Math.max(hi, g(p.x + d)) } return hi - lo }
  for (let w = 0; w < 8; w++) {
    let n = 0; while (s().phase === "wave" && n++ < 900) { s().cities.forEach(c => { if (c.alive) c.hp = c.maxHp }); __game.fast(20) }
    const f = s().pads.filter(p => p.launcher == null && Math.abs(p.x) <= s().view/2).sort((a, b) => bumpy(b) - bumpy(a))
    if (s().offer?.stage === "launcher" && f.length) __game.input({ k: "launch", i: 1, pad: f[0].id })
    const o = s().offer; if (o) { const i = o.upgrades.findIndex(u => ["cooldown","radius"].includes(u)); __game.input(i >= 0 ? { k: "upgrade", i, target: "strike" } : { k: "skip" }) || (s().offer && __game.input({ k: "upgrade", i: 0, target: s().launchers[0].id })) }
  }
  __game.advance(2, 30)
  return s().launchers.map(L => ({ ...__game.toScreen(L.x, L.y), type: L.type }))
})
for (const [i, p] of at.slice(0, 4).entries()) await page.screenshot({ path: `/tmp/ddv/L-${i}.png`, clip: { x: Math.max(0, Math.min(1440 - 200, p.x - 100)), y: Math.max(0, Math.min(900 - 170, p.y - 110)), width: 200, height: 170 } })
console.log(JSON.stringify(at.map(a => a.type)))
await b.close()
