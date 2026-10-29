// Legibility audit: every visible element on every screen, judged by Jev (TypeSafe's System One
// model) as a first-time visitor who knows nothing about the game. Jev answers typed questions
// (scores 0-3), it does not write; the report lists what a stranger could not place.
//
//   node tools/legible.mjs [--out dir] [--url http://host/] [--min 2] [--screens title,hangar,...]
//
// Needs TYPESAFE_API_KEY (env, or ../jev-hello/.env) and the playwright install in the glowdropify
// skill's scripts folder. Serves ./public itself unless --url is given. Writes <out>/legibility.md,
// <out>/legibility.json and a screenshot per screen; prints the flagged elements.
import { createServer } from "node:http"
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join, extname, dirname } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { homedir } from "node:os"

const here = dirname(fileURLToPath(import.meta.url))
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]] : a), []))
const OUT = args.out || join(here, "..", "docs", "design", "legibility")
const MIN = Number(args.min || 2) // a score under this on any question flags the element
mkdirSync(OUT, { recursive: true })

// ---- the key --------------------------------------------------------------------------------------
let key = process.env.TYPESAFE_API_KEY
if (!key) for (const f of [join(here, "..", ".env"), join(here, "..", "..", "jev-hello", ".env"), join(homedir(), "Desktop", "stuff", "jev-hello", ".env")]) {
  if (existsSync(f)) { const m = readFileSync(f, "utf8").match(/TYPESAFE_API_KEY=(\S+)/); if (m) { key = m[1]; break } }
}
if (!key) { console.error("Set TYPESAFE_API_KEY"); process.exit(1) }

// ---- playwright from the skill's install ------------------------------------------------------------
const PW = join(homedir(), ".claude", "skills", "glowdropify", "scripts", "node_modules", "playwright", "index.mjs")
const { chromium } = await import(pathToFileURL(PW).href)

// ---- a static server for ./public --------------------------------------------------------------------
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" }
let url = args.url, server = null
if (!url) {
  const root = join(here, "..", "public")
  server = createServer((req, res) => {
    const p = decodeURIComponent(req.url.split("?")[0])
    const f = join(root, p === "/" ? "index.html" : p)
    if (!f.startsWith(root) || !existsSync(f)) { res.writeHead(404); res.end(); return }
    res.writeHead(200, { "Content-Type": TYPES[extname(f)] || "application/octet-stream", "Cache-Control": "no-store" })
    res.end(readFileSync(f))
  })
  await new Promise((r) => server.listen(0, r))
  url = `http://localhost:${server.address().port}/`
}

// ---- what a stranger knows ------------------------------------------------------------------------------
// Only this. Not the rules, not the vocabulary: that is what the audit tests.
const PREMISE = "A browser game. Drones defend cities from rockets. A run goes wave by wave until the cities fall; between waves there is a shop. Between runs the player spends what the run earned."

// ---- the screens, and how to reach each ------------------------------------------------------------------
// Each step runs in the page with the dev hook (window.__game). A developed profile shows the most.
const developed = () => {
  const g = window.__game, p = g.profile
  p.runs = 9; p.deaths = 8; p.best = 6; p.reachedBest = 7; p.w = 210; p.fragments = 4
  p.lifetime.kills = 700; p.lifetime.waves = 26
  p.unlocked = ["prewave", "omens", "fate", "kite", "hangar", "shop2x2", "rate", "reroll", "flakgun", "warden", "tierU", "hotswap", "split", "laser12", "shot", "mint", "radius", "laser15"]
  p.tree = { swarm: 1 }
  p.bought = { hornet: 9, kite: 2, rate: 3 }
  p.cleared = { 1: 9, 2: 8, 3: 7, 4: 5, 5: 3, 6: 1 }
  p.mastery = { hornet: 420 }; p.masteryLevels = { hornet: 2 }
  g.saveProfile()
}
const SCREENS = [
  { id: "title-first", note: "the title, first visit", run: async (page) => { await page.evaluate(() => window.__game.goHome()) } },
  { id: "title", note: "the title after some runs", run: async (page) => { await page.evaluate(developed); await page.reload({ waitUntil: "networkidle" }); await page.evaluate(() => { window.__noAutoPause = true }) } },
  { id: "play", note: "mid-wave, HUD and field", run: async (page) => {
    await page.click("#tPlay"); await page.waitForTimeout(400)
    // the shop closes only from its own Go button, as a player would press it
    await page.evaluate(() => { const g = window.__game; g.run.s.money = 600; g.flush() })
    await page.waitForTimeout(200)
    if (await page.isVisible("#oGo")) { await page.click("#oGo"); await page.waitForTimeout(300) }
    await page.evaluate(() => { const g = window.__game, s = g.run.s; if (s.phase === "ready") { g.input({ k: "go" }); g.flush() } g.fast(60 * 8); g.flush() })
    await page.waitForTimeout(300)
  } },
  { id: "dispatch", note: "the two orders between waves", run: async (page) => {
    for (let i = 0; i < 6; i++) {
      const st = await page.evaluate(() => { const g = window.__game, s = g.run.s; g.flush(); if (s.phase === "breather" && s.offer?.stage === "omen") return "omen"; if (s.phase === "breather") g.autoShop(); g.fast(60 * 60); g.flush(); return s.phase })
      if (st === "omen") break
    }
    await page.waitForTimeout(600)
  } },
  { id: "shop", note: "the shop between waves", run: async (page) => {
    if (await page.isVisible("#oPass")) { await page.click("#oPass"); await page.waitForTimeout(300) }
    await page.evaluate(() => { const g = window.__game, s = g.run.s; s.money = 700; if (s.offer) g.offer() })
    await page.waitForTimeout(600)
  } },
  { id: "shop-bought", note: "the shop after a purchase (undo shows)", run: async (page) => {
    await page.evaluate(() => { const g = window.__game, s = g.run.s; if (s.offer) { const i = s.offer.items?.findIndex((x, i) => window.__game.run && i >= 0) ?? 0; g.input({ k: "buy", i: 0 }); g.flush() } })
    await page.waitForTimeout(500)
  } },
  { id: "pause", note: "the pause panel", run: async (page) => {
    if (await page.isVisible("#oGo")) { await page.click("#oGo"); await page.waitForTimeout(300) }
    await page.evaluate(() => { const g = window.__game; g.fast(60 * 4); g.flush() })
    await page.click("#hudPause"); await page.waitForTimeout(400)
  } },
  { id: "guide", note: "the guide", run: async (page) => { await page.click("#pGuide"); await page.waitForTimeout(500) } },
  { id: "over", note: "the result screen, sequence done", run: async (page, vp) => {
    await page.evaluate(() => window.__game.show("play"))
    await page.click("#pResume").catch(() => {})
    await page.evaluate(() => { const g = window.__game, s = g.run.s; s.cities.forEach((c) => { c.alive = false; c.hp = 0 }); g.fast(2); g.flush() })
    await page.waitForTimeout(2600)
    for (let k = 0; k < 14; k++) { await page.mouse.click(vp.width / 2, vp.height * 0.8); await page.waitForTimeout(160) }
    await page.waitForTimeout(700)
  } },
  { id: "over-details", note: "the result screen with details open", run: async (page) => { await page.click("#oMore").catch(() => {}); await page.waitForTimeout(400) } },
  { id: "hangar", note: "the Hangar", run: async (page) => { await page.evaluate(() => window.__game.openHangar(true)); await page.waitForTimeout(600) } },
]

// ---- collecting the visible elements ----------------------------------------------------------------
// Every element a person can see: its own text, or a control or drawing with none. Nearby text is the
// context a reader has: the nearest labelled ancestor and the screen's other text.
const collect = () => {
  const vw = innerWidth, vh = innerHeight
  const own = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).filter(Boolean).join(" ")
  const visible = (el) => {
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.right < 0 || r.top > vh || r.left > vw) return false
    for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.05 || e.hidden) return false }
    // covered by a panel over it: not seen. A hit on something else counts as cover only when that
    // thing, or an ancestor of it that is not also ours, paints a background (a transparent full-screen
    // container over the HUD is not cover)
    const cx = Math.max(0, Math.min(vw - 1, r.x + r.width / 2)), cy = Math.max(0, Math.min(vh - 1, r.y + r.height / 2))
    const pts = [[cx, cy], [r.x + 3, r.y + 3], [r.right - 3, r.bottom - 3]]
    const painted = (e) => { const cs = getComputedStyle(e); const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/); const a = m ? (m[1].split(",")[3] ?? "1").trim() : "0"; return Number(a) > 0.4 || cs.backgroundImage !== "none" || (cs.backdropFilter && cs.backdropFilter !== "none") }
    return pts.some(([x, y]) => {
      const t = document.elementFromPoint(x, y)
      if (!t) return false
      if (t === el || el.contains(t) || t.contains(el)) return true
      for (let e = t; e && e !== document.body; e = e.parentElement) { if (e.contains(el)) return true; if (painted(e)) return false }
      return true
    })
  }
  const out = []
  for (const el of document.body.querySelectorAll("*")) {
    if (["SCRIPT", "STYLE", "SECTION", "NAV", "UL", "HEADER", "MAIN", "DIV", "P", "LI", "SVG", "PATH", "RECT", "CIRCLE", "G"].includes(el.tagName) && !own(el) && !el.getAttribute("aria-label")) continue
    if (!visible(el)) continue
    const tag0 = el.tagName.toLowerCase()
    // a control reads as the whole of its text; a pip or dot inside a labelled thing is not a thing
    const text = tag0 === "button" || tag0 === "a" ? (el.innerText || "").replace(/\s+/g, " ").trim() : own(el)
    if (tag0 === "i" && !text && !el.getAttribute("aria-label") && !el.matches(".bar > i, .deed > i, #hLeft")) continue
    if (el.closest("button") && el !== el.closest("button")) continue
    const aria = el.getAttribute("aria-label") || el.getAttribute("alt") || ""
    const tag = el.tagName.toLowerCase()
    const control = tag === "button" || tag === "a" || el.getAttribute("role") === "button"
    // a drawing or a bar: no text, but a person sees it
    const drawing = tag === "canvas" || (tag === "i" && !text) || tag === "img"
    if (!text && !aria && !control && !drawing) continue
    if (tag === "i" && el.closest("button, .bar, .deed, .node") && !aria && el.children.length === 0 && !el.closest(".bar, .deed")) continue // pips and dots inside a labelled thing
    let ctx = ""
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) { const t = e.innerText?.replace(/\s+/g, " ").trim(); if (t && t !== text && (t.length > text.length + 2 || !text)) { ctx = t.slice(0, 220); break } }
    const r = el.getBoundingClientRect()
    out.push({ tag, id: el.id || "", cls: (typeof el.className === "string" ? el.className : "").trim(), text: text.slice(0, 160), aria, control, drawing, disabled: el.disabled || el.getAttribute("aria-disabled") === "true", ctx, x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) })
  }
  const all = [...new Set(out.map((e) => e.text || e.aria).filter(Boolean))].join(" · ").slice(0, 1600)
  return { elements: out, all, vw, vh }
}

// ---- asking Jev -------------------------------------------------------------------------------------------
const LEVELS = ["No idea", "A guess at best", "Probably right", "Certain"]
const QUESTIONS = {
  what: { type: "score", instructions: "How clearly can this first-time visitor tell what the element IS: a button to press, a label, a count, a price, a meter, a picture?", criteria: LEVELS },
  does: { type: "score", instructions: "How clearly can they tell what it DOES: what happens if they press it, or what it measures, names or counts?", criteria: LEVELS },
  links: { type: "score", instructions: "How clearly can they tell what else on this screen or in the game it connects to: what it counts, what it opens, what it costs, what it belongs to?", criteria: LEVELS },
  jargon: { type: "noul", instructions: "Does the element rely on a word, name, number or symbol that a newcomer to this game would not know without being told?" },
  kind: { type: "choice", instructions: "What is the element?", criteria: { button: null, label_or_heading: null, number_or_price: null, meter_or_bar: null, picture: null, sentence: null, unclear: null } },
}
const describe = (screen, e) => {
  const what = e.text ? `text "${e.text}"` : e.aria ? `no text; screen-reader label "${e.aria}"` : e.drawing ? "no text; a small drawing or bar" : "no text"
  const shape = `${e.control ? "a button" : e.drawing ? (e.tag === "canvas" ? "a canvas drawing" : e.tag === "img" ? "an image" : "a bar or shape") : `a <${e.tag}>`}${e.disabled ? ", greyed out" : ""}, ${e.w}×${e.h} px, centred at ${Math.round(100 * e.x / screen.vw)}% across and ${Math.round(100 * e.y / screen.vh)}% down`
  return [
    `A first-time visitor knows only this: ${PREMISE}`,
    `Screen: ${screen.note}.`,
    `Element: ${shape}; ${what}.`,
    e.aria && e.text ? `Screen-reader label: "${e.aria}".` : "",
    e.ctx ? `The text around it: "${e.ctx}".` : "",
    `Everything else readable on the screen: ${screen.all || "(nothing)"}.`,
    "Judge only what this visitor could infer from what is on the screen.",
  ].filter(Boolean).join("\n")
}
async function ask(state) {
  for (let tries = 0; tries < 3; tries++) {
    const res = await fetch("https://api.typesafe.ai/v1/systemone", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ state, model: "jev-latest", questions: QUESTIONS }) })
    if (res.ok) { const { answers } = await res.json(); return { what: answers.what.score, does: answers.does.score, links: answers.links.score, jargon: answers.jargon.noul, kind: answers.kind.choice } }
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 800 * (tries + 1))); continue }
    throw new Error(`TypeSafe ${res.status}: ${await res.text()}`)
  }
  throw new Error("TypeSafe: gave up")
}

// ---- run ---------------------------------------------------------------------------------------------------
const vp = { width: 1280, height: 720 }
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const page = await browser.newPage({ viewport: vp })
page.on("pageerror", (e) => console.log("PAGEERROR", e.message))
await page.goto(url, { waitUntil: "networkidle" })
await page.evaluate(() => { localStorage.clear(); window.__noAutoPause = true })
await page.reload({ waitUntil: "networkidle" })
await page.evaluate(() => { window.__noAutoPause = true })

const only = args.screens ? String(args.screens).split(",") : null
const report = []
let asked = 0
for (const sc of SCREENS) {
  try { await sc.run(page, vp) } catch (e) { console.log(`${sc.id}: could not reach (${e.message.split("\n")[0]})`) }
  if (only && !only.includes(sc.id)) continue
  const shot = join(OUT, `${sc.id}.png`)
  await page.screenshot({ path: shot })
  const got = await page.evaluate(collect)
  // one judgment per distinct thing: the same text in the same kind of place is asked once
  const seen = new Map()
  for (const e of got.elements) { const k = `${e.tag}|${e.cls}|${e.text}|${e.aria}|${e.drawing}`; if (!seen.has(k)) seen.set(k, { ...e, n: 0 }); seen.get(k).n++ }
  const items = [...seen.values()]
  const screen = { note: sc.note, all: got.all, vw: got.vw, vh: got.vh }
  const judged = []
  for (let i = 0; i < items.length; i += 6) {
    const chunk = items.slice(i, i + 6)
    const res = await Promise.all(chunk.map((e) => ask(describe(screen, e)).catch((err) => ({ error: err.message }))))
    res.forEach((r, j) => judged.push({ ...chunk[j], ...r }))
    asked += chunk.length
  }
  report.push({ id: sc.id, note: sc.note, shot, items: judged })
  const flagged = judged.filter((e) => !e.error && (e.what < MIN || e.does < MIN || e.links < MIN))
  console.log(`${sc.id}: ${judged.length} elements, ${flagged.length} flagged`)
}
await browser.close()
server?.close()

// ---- the report --------------------------------------------------------------------------------------------
const name = (e) => e.text ? `"${e.text}"` : e.aria ? `[${e.aria}]` : e.drawing ? `[${e.tag}${e.cls ? "." + e.cls.split(" ")[0] : ""}]` : `[${e.tag}${e.id ? "#" + e.id : ""}]`
const fmt = (n) => (n == null ? "-" : n.toFixed(1))
const lines = [`# Legibility audit`, ``, `Judge: Jev (jev-latest). Scores 0-3 (${LEVELS.map((l, i) => `${i} ${l}`).join(", ")}). Flagged: any score under ${MIN}. ${asked} judgments.`, ``, `What the judge was told the visitor knows: ${PREMISE}`, ``]
let flaggedAll = []
for (const sc of report) {
  const rows = sc.items.filter((e) => !e.error).sort((a, b) => a.what + a.does + a.links - (b.what + b.does + b.links))
  const flagged = rows.filter((e) => e.what < MIN || e.does < MIN || e.links < MIN)
  flaggedAll.push(...flagged.map((e) => ({ ...e, screen: sc.id })))
  lines.push(`## ${sc.note} (${sc.id})`, ``, `![${sc.id}](${sc.id}.png)`, ``, `${rows.length} elements, ${flagged.length} flagged.`, ``, `| element | where | is | does | links | jargon | kind |`, `|---|---|---|---|---|---|---|`)
  for (const e of rows) lines.push(`| ${name(e).replace(/\|/g, "/")}${e.n > 1 ? ` ×${e.n}` : ""} | ${Math.round(100 * e.x / vp.width)}%, ${Math.round(100 * e.y / vp.height)}% | ${fmt(e.what)} | ${fmt(e.does)} | ${fmt(e.links)} | ${Math.round(100 * e.jargon)}% | ${e.kind} |`)
  const errs = sc.items.filter((e) => e.error)
  if (errs.length) lines.push(``, `${errs.length} not judged: ${errs.map((e) => name(e)).join(", ")}`)
  lines.push(``)
}
writeFileSync(join(OUT, "legibility.md"), lines.join("\n"))
writeFileSync(join(OUT, "legibility.json"), JSON.stringify(report, null, 1))
console.log(`\nflagged, worst first:`)
for (const e of flaggedAll.sort((a, b) => a.what + a.does + a.links - (b.what + b.does + b.links))) console.log(`  ${e.screen.padEnd(13)} ${name(e).slice(0, 60).padEnd(62)} is ${fmt(e.what)} does ${fmt(e.does)} links ${fmt(e.links)} jargon ${Math.round(100 * e.jargon)}%${e.ctx ? `  near: ${e.ctx.slice(0, 50)}` : ""}`)
console.log(`\nreport: ${join(OUT, "legibility.md")}`)
