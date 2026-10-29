import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await page.goto('http://localhost:5240'); await page.waitForTimeout(1200)
// the steepest free pad, with a launcher card held so every pad lights
const at = await page.evaluate(async () => {
  window.__noAutoPause = true; __game.startRun(false); __game.advance(7, 30)
  const s = () => __game.run.s
  for (let w = 0; w < 4; w++) { let n = 0; while (s().phase === "wave" && n++ < 900) { s().cities.forEach(c => { if (c.alive) c.hp = c.maxHp }); __game.fast(20) } if (w < 3) { const f = s().pads.filter(p => p.launcher == null && Math.abs(p.x) <= s().view/2); __game.input({ k: "launch", i: 0, pad: f[0].id }); const o = s().offer; if (o?.stage === "upgrade") __game.input({ k: "skip" }) || __game.input({ k: "upgrade", i: o.upgrades.findIndex(u => ["cooldown","radius"].includes(u)) >= 0 ? o.upgrades.findIndex(u => ["cooldown","radius"].includes(u)) : 0, target: "strike" }) } }
  __game.advance(1, 30)
  await new Promise(r => setTimeout(r, 1500))
  document.querySelector('#cards .card')?.click(); __game.advance(0.3, 30)
  const slope = (p) => { const g = __game.run.s.world.at; let lo = 1e9, hi = -1e9; for (let d = -4; d <= 4; d += 0.5) { lo = Math.min(lo, g(p.x + d)); hi = Math.max(hi, g(p.x + d)) } return hi - lo }
  const all = s().pads.filter(p => Math.abs(p.x) <= s().view / 2).sort((a, b) => slope(b) - slope(a))
  return all.slice(0, 3).map(p => __game.toScreen(p.x, p.y))
})
for (const [i, p] of at.entries()) await page.screenshot({ path: `/tmp/ddv/pad-${i}.png`, clip: { x: Math.max(0, Math.min(1440 - 240, p.x - 120)), y: Math.max(0, Math.min(900 - 180, p.y - 120)), width: 240, height: 180 } })
await page.screenshot({ path: '/tmp/ddv/pad-full.png' })
await b.close()
