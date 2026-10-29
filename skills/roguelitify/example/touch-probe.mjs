// every touch path in a run on a phone in landscape: does each tap do what it should?
import { chromium, devices } from "/Users/danieljviau/.claude/skills/glowdropify/scripts/node_modules/playwright/index.mjs"
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const vp = { width: 852, height: 393 }
const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: devices["iPhone 14 Pro"].userAgent })
const page = await ctx.newPage()
const log = []
page.on("pageerror", (e) => log.push("PAGEERROR " + e.message))
await page.goto("http://localhost:5241/", { waitUntil: "networkidle" })
await page.evaluate(() => { localStorage.clear(); window.__noAutoPause = true })
await page.reload({ waitUntil: "networkidle" })
await page.evaluate(() => { window.__noAutoPause = true; const p = window.__game.profile; p.runs = 4; p.deaths = 3; p.w = 130; p.lifetime.kills = 300; p.unlocked.push("prewave", "omens", "fate", "kite", "hangar", "shop2x2", "rate", "reroll"); window.__game.saveProfile() })
const st = () => page.evaluate(() => { const g = window.__game, s = g.run?.s; return { screen: g.screen, phase: s?.phase, wave: s?.wave, money: s?.money, L: s?.launchers.length, placing: g.ui.placing, pick: g.ui.pick, stage: s?.offer?.stage, picked: !!document.querySelector("#cards .picked") } })
const tapAt = async (x, y, label) => { await page.touchscreen.tap(x, y); await page.waitForTimeout(250); log.push(`${label} @${Math.round(x)},${Math.round(y)} -> ${JSON.stringify(await st())}`) }
// 1 title tap
await page.touchscreen.tap(...(await page.$("#tPlay").then(async (e) => { const b = await e.boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2] }))); await page.waitForTimeout(600)
log.push("tPlay -> " + JSON.stringify(await st()))
await page.evaluate(() => { const g = window.__game; g.run.s.money = 900; g.offer() }); await page.waitForTimeout(200)
// 2 tap a base card right away (the guard), then again after a second
let c0 = await page.$("#cards button:not([disabled])"); log.push("cards enabled: " + (await page.$$("#cards button:not([disabled])")).length); let b = c0 ? await c0.boundingBox() : { x: 100, y: 60, width: 10, height: 10 }
await tapAt(b.x + b.width / 2, b.y + b.height / 2, "card at once")
await page.waitForTimeout(1200)
c0 = await page.$("#cards button:not([disabled])"); b = c0 ? await c0.boundingBox() : b
await tapAt(b.x + b.width / 2, b.y + b.height / 2, "card after 1.2s")
// 3 tap a free pad to place
const pad = await page.evaluate(() => { const g = window.__game, s = g.run.s; const p = s.pads.find((p) => p.launcher == null && p.id !== 0) || s.pads.find((p) => p.launcher == null); const q = g.R ? null : null; return p ? { x: p.x, y: p.y, id: p.id } : null })
if (pad) { const q = await page.evaluate((pad) => { const g = window.__game; const p = g.run.s.pads[pad.id]; const r = g.R; return r.toScreen ? r.toScreen(p.x, p.y) : null }, pad); log.push("pad screen " + JSON.stringify(q)) }
// use the launcher/pad hit helpers through the canvas: tap the pad's screen point via padAt lookup
const padPt = await page.evaluate(() => { const g = window.__game, s = g.run.s; for (let x = 20; x < innerWidth - 20; x += 6) for (let y = innerHeight * 0.45; y < innerHeight - 10; y += 6) { const p = g.padAt(x, y, true); if (p && p.launcher == null) return [x, y, p.id] } return null })
log.push("pad point " + JSON.stringify(padPt))
if (padPt) await tapAt(padPt[0], padPt[1], "tap pad")
// 4 Go
b = await (await page.$("#oGo")).boundingBox(); await tapAt(b.x + b.width / 2, b.y + b.height / 2, "Go")
// 5 strike tap mid-wave (after the 500ms guard)
await page.evaluate(() => { const g = window.__game, s = g.run.s; if (s.phase === "ready") { g.input({ k: "go" }); g.flush() } g.fast(60 * 2); g.flush() })
await page.waitForTimeout(700)
const before = await page.evaluate(() => window.__game.run.s.stats.strikes)
await tapAt(vp.width * 0.5, vp.height * 0.35, "strike")
const after = await page.evaluate(() => window.__game.run.s.stats.strikes)
log.push(`strikes ${before} -> ${after}`)
// 6 through the wave to the dispatch, tap a dispatch card at once and after the flourish
await page.evaluate(() => { const g = window.__game; g.fast(60 * 60); g.flush() })
await page.waitForTimeout(300)
let c = await page.$("#cards button:not([disabled])"); b = c ? await c.boundingBox() : null
if (b) await tapAt(b.x + b.width / 2, b.y + b.height / 2, "dispatch at 0.3s")
await page.waitForTimeout(1500)
c = await page.$("#cards button:not([disabled])"); b = c ? await c.boundingBox() : null
if (b) await tapAt(b.x + b.width / 2, b.y + b.height / 2, "dispatch at 1.8s")
// 7 pause button
b = await (await page.$("#hudPause")).boundingBox(); await tapAt(b.x + b.width / 2, b.y + b.height / 2, "pause")
b = await (await page.$("#pResume")).boundingBox(); await tapAt(b.x + b.width / 2, b.y + b.height / 2, "resume")
console.log(log.join("\n"))
await ctx.close(); await browser.close()
