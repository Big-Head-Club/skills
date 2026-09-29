import { chromium, devices } from "/Users/danieljviau/.claude/skills/glowdropify/scripts/node_modules/playwright/index.mjs"
const out = process.argv[2]
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
for (const [name, vp] of [["portrait", { width: 393, height: 852 }], ["landscape", { width: 852, height: 393 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: devices["iPhone 14 Pro"].userAgent })
  const page = await ctx.newPage()
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message))
  await page.goto("http://localhost:5241/", { waitUntil: "networkidle" })
  await page.evaluate(() => { localStorage.clear(); window.__noAutoPause = true })
  await page.reload({ waitUntil: "networkidle" })
  await page.evaluate(() => { window.__noAutoPause = true; const p = window.__game.profile; p.runs = 4; p.deaths = 3; p.w = 130; p.lifetime.kills = 300; p.fragments = 2; p.unlocked.push("prewave", "omens", "fate", "kite", "hangar", "shop2x2", "rate", "reroll", "flakgun"); window.__game.saveProfile() })
  await page.screenshot({ path: `${out}/m-${name}-title.png` })
  try { await page.tap("#tPlay", { timeout: 5000 }) } catch (e) { console.log("TAP tPlay failed:", e.message.split("\n").filter((l) => /intercepts|not visible|not stable|hidden|outside/.test(l)).slice(0, 3).join(" | ") || e.message.split("\n")[0]); await page.evaluate(() => document.querySelector("#tPlay").click()) }
await page.waitForTimeout(500)
  await page.screenshot({ path: `${out}/m-${name}-prewave.png` })
  if (await page.isVisible("#oGo")) { try { await page.tap("#oGo", { timeout: 5000 }) } catch (e) { console.log("TAP oGo failed:", e.message.split("\n").filter((l) => /intercepts|not visible|not stable|hidden|outside/.test(l)).slice(0, 3).join(" | ") || e.message.split("\n")[0]); await page.evaluate(() => document.querySelector("#oGo").click()) } await page.waitForTimeout(300) }
  await page.evaluate(() => { const g = window.__game, s = g.run.s; if (s.phase === "ready") { g.input({ k: "go" }); g.flush() } g.fast(60 * 6); g.flush() })
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${out}/m-${name}-play.png` })
  await page.evaluate(() => { const g = window.__game, s = g.run.s; g.fast(60 * 60); g.flush(); s.money = 700 })
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${out}/m-${name}-after1.png` })
  if (await page.isVisible("#oPass")) { try { await page.tap("#oPass", { timeout: 5000 }) } catch (e) { console.log("TAP oPass failed:", e.message.split("\n").filter((l) => /intercepts|not visible|not stable|hidden|outside/.test(l)).slice(0, 3).join(" | ") || e.message.split("\n")[0]); await page.evaluate(() => document.querySelector("#oPass").click()) } await page.waitForTimeout(400) }
  await page.screenshot({ path: `${out}/m-${name}-shop.png` })
  await page.evaluate(() => { const g = window.__game, s = g.run.s; s.cities.forEach((c) => { c.alive = false; c.hp = 0 }); g.input({ k: "done" }); g.flush(); g.fast(3); g.flush() })
  await page.waitForTimeout(3000)
  for (let k = 0; k < 8; k++) { await page.tap("body", { position: { x: vp.width / 2, y: vp.height * 0.55 } }).catch(() => {}); await page.waitForTimeout(150) }
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${out}/m-${name}-over.png` })
  await page.evaluate(() => window.__game.openHangar(true)); await page.waitForTimeout(500)
  await page.screenshot({ path: `${out}/m-${name}-hangar.png` })
  await ctx.close()
}
await browser.close()
