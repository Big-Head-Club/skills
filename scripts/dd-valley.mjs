import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const errs = []; page.on('pageerror', e => errs.push(e.message))
await page.goto('http://localhost:5240'); await page.waitForTimeout(1200)
// run until several cities exist, keep them alive, then crop each city
const shots = await page.evaluate(() => {
  window.__noAutoPause = true; __game.startRun(false); __game.advance(3, 30)
  const s = () => __game.run.s
  const pick = () => { for (let k = 0; k < 2 && s().phase === "breather"; k++) { const o = s().offer; if (o?.stage === "launcher") { const f = s().pads.filter(p => p.launcher == null && Math.abs(p.x) <= s().view/2); __game.input({ k: "launch", i: 0, pad: f[1]?.id ?? f[0].id }) } else if (o?.stage === "upgrade") { const i = o.upgrades.findIndex(u => u !== "charge"); const id = o.upgrades[i]; const L = s().launchers.find(L => !(["split","spread","hardened","swap"].includes(id) && L.ups[id])); __game.input({ k: "upgrade", i, target: ["cooldown","radius","charge"].includes(id) ? "strike" : L.id }) } } }
  for (let w = 0; w < 7; w++) { let n = 0; while (s().phase === "wave" && n++ < 900) { s().cities.forEach(c => { if (c.alive) c.hp = c.maxHp }); __game.fast(20) } pick() }
  __game.advance(3, 30)
  return s().cities.map(c => __game.toScreen(c.x, c.y))
})
for (const [i, p] of shots.entries()) {
  const x = Math.max(0, Math.min(1440 - 360, Math.round(p.x - 180))), y = Math.max(0, Math.min(900 - 240, Math.round(p.y - 180)))
  await page.screenshot({ path: `/tmp/ddv/v-${i}.png`, clip: { x, y, width: 360, height: 240 } })
}
await page.screenshot({ path: '/tmp/ddv/v-full.png' })
console.log(JSON.stringify({ n: shots.length, errs }))
await b.close()
