// the replayed shake: a land tap with nothing picked, then a legit buy; does the row shake again?
import { chromium } from "playwright"
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
await page.goto("http://localhost:5240/", { waitUntil: "networkidle" })
await page.evaluate(() => { window.__noAutoPause = true; const p = window.__game.profile; p.deaths = 6; p.best = 6; p.unlocked.push("prewave", "omens", "fate", "kite", "hangar", "shop2x2", "rate", "reroll"); window.__game.saveProfile() })
await page.click("#tPlay"); await page.waitForTimeout(2000)
await page.evaluate(() => { const g = window.__game; const s = g.run.s; s.money = 99999; s.offer.items = [{ kind: "upgrade", id: "reach", price: 10, tier: "c" }, { kind: "upgrade", id: "speed", price: 10, tier: "c" }]; s.offer.bought = []; g.offer() })
await page.waitForTimeout(500)
await page.mouse.click(640, 400); await page.waitForTimeout(700) // the land, nothing picked: a legit rejection
const after1 = await page.evaluate(() => ({ cls: document.getElementById("cards").className, anims: document.getElementById("cards").getAnimations().length }))
await page.click("#cards button:nth-child(1)"); await page.waitForTimeout(400)
const q = await page.evaluate(() => { const g = window.__game; const L = g.run.s.launchers[0]; return g.toScreen(L.x, L.y) })
await page.mouse.click(q.x, q.y); await page.waitForTimeout(150) // a legit buy: the offer hides and rebuilds
const after2 = await page.evaluate(() => ({ cls: document.getElementById("cards").className, anims: document.getElementById("cards").getAnimations().length, money: window.__game.run.s.money }))
console.log(JSON.stringify({ afterLandTap: after1, afterLegitBuy: after2 }))
await browser.close()
