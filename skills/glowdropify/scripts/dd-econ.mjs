import { chromium } from 'playwright'
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type() === 'error' && errs.push(m.text()))
await page.goto('http://localhost:5240'); await page.waitForTimeout(1000)
const r1 = await page.evaluate(() => { localStorage.removeItem("dd.run"); window.__noAutoPause = true; __game.startRun(false); __game.advance(3, 30); let n = 0; while (__game.run.s.phase === "wave" && n++ < 300) __game.fast(20); __game.advance(0.4, 30); const s = __game.run.s; return { money: s.money, items: s.offer.items.map(x => x.id + ":" + x.price), bank: document.getElementById("hBank").textContent } })
await page.waitForTimeout(2000)
await page.screenshot({ path: '/tmp/ddv/econ-shop1.png' })
// buy a powerup twice across breathers to see escalation: buy the first affordable upgrade now
const r2 = await page.evaluate(() => { const s = __game.run.s; const i = s.offer.items.findIndex((x, i) => x.kind === "upgrade" && s.money >= x.price); if (i < 0) return null; const x = s.offer.items[i]; const L = s.launchers[0]; const target = ["cooldown","radius","charge","flak"].includes(x.id) ? "strike" : L.id; __game.input({ k: "buy", i, target }); __game.input({ k: "done" }); s.upsBought; let n = 0; while (s.phase === "wave" && n++ < 400) __game.fast(20); __game.advance(0.4, 30); return { bought: x.id + ":" + x.price, next: s.offer.items.map(y => y.id + ":" + y.price), money: s.money, bought2: s.upsBought } })
await page.waitForTimeout(2000)
await page.screenshot({ path: '/tmp/ddv/econ-shop2.png' })
console.log(JSON.stringify({ r1, r2, errs }))
await b.close()
