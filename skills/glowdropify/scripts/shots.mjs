// Capture every state of an app at the standard viewports, audit each screen for
// the things Daniel keeps cutting, and rebuild the progress page.
//
//   node ~/.claude/skills/glowdropify/scripts/shots.mjs --url http://localhost:3000 \
//        --out docs/glow/shots --round r0 [--states docs/glow/states.mjs] [--video] \
//        [--views all] [--seed 7] [--idle 900]
//
// --states  a module whose default export is [{ name, run: async (page, view) => {} }, ...].
//           Each run() drives the page from a fresh load to that state (click, call
//           window.__game hooks, etc). Without it you get one state: "landing".
// --views   "all" (default) or a comma list of names from VIEWS below.
// --video   also record <state>-<view>.webm for every state, so critics can judge motion.
// --seed    replace Math.random in the page with a seeded generator, so rounds show the
//           same dice, maps and deals. Server-side randomness is not affected. Leave it
//           off if the client makes ids with Math.random that must differ per player.
// --idle    ms to wait after each state before the shot (default 900).
//
// Views run in parallel. Writes <out>/<round>/<state>-<view>.png, audit.json and
// <out>/index.html (every round side by side, newest first). The audit is evidence
// for critics, not a gate: always look at the pictures.

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const VIEWS = {
  desk: { width: 1440, height: 900, touch: false, dpr: 1 },
  phone: { width: 390, height: 844, touch: true, dpr: 3 },
  land: { width: 844, height: 390, touch: true, dpr: 3 },
  small: { width: 360, height: 640, touch: true, dpr: 2 },
};

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = (process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) ? process.argv[++i] : true;
}
if (!args.url) { console.error('need --url'); process.exit(2); }
const OUT = path.resolve(String(args.out || 'docs/glow/shots'));
const ROUND = String(args.round || 'r' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, ''));
const IDLE = Number(args.idle || 900);
const SEED = args.seed === undefined ? null : Number(args.seed === true ? 1 : args.seed);
const dir = path.join(OUT, ROUND);
fs.mkdirSync(dir, { recursive: true });

const names = !args.views || args.views === 'all' ? Object.keys(VIEWS) : String(args.views).split(',');
let states = [{ name: 'landing', run: async () => {} }];
if (args.states) states = (await import(pathToFileURL(path.resolve(String(args.states))).href)).default;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Share of pixels that change between two frames 100 ms apart with no input.
// Glowdrop idles at 40-50% by design; a screen where the user is thinking should read ~0.
function motionPct(a, b) {
  const raw = f => execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-vf', 'scale=320:-2', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 24 });
  const x = raw(a), y = raw(b);
  let n = 0;
  for (let i = 0; i < x.length; i++) if (Math.abs(x[i] - y[i]) > 6) n++;
  return +(100 * n / x.length).toFixed(1);
}

// Runs in the page. Counts what the standards forbid or cap.
function audit(touch) {
  const MIN = touch ? 44 : 24;
  const W = innerWidth, H = innerHeight;
  const cs = el => getComputedStyle(el);
  const shown = el => {
    const s = cs(el), r = el.getBoundingClientRect();
    return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && r.width > 0 && r.height > 0;
  };
  // On top: a tap at the element's centre would hit it (or a child). Screens hidden
  // behind a sheet or modal don't count.
  const onTop = el => {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) return false;
    const x = Math.min(W - 1, Math.max(0, r.x + r.width / 2)), y = Math.min(H - 1, Math.max(0, r.y + r.height / 2));
    const hit = document.elementFromPoint(x, y);
    return !!hit && (el === hit || el.contains(hit) || hit.contains(el));
  };
  const box = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const label = el => (el.getAttribute('aria-label') || el.innerText || el.value || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);

  // Controls: real controls, ARIA roles, and anything styled as clickable. A child of a
  // counted control is not counted again.
  const ctrlSel = 'button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=menuitem], [role=checkbox], [role=switch], [onclick], [tabindex]:not([tabindex="-1"])';
  const cand = new Set(document.querySelectorAll(ctrlSel));
  for (const el of document.body.querySelectorAll('*')) if (cs(el).cursor === 'pointer') cand.add(el);
  const controls = [...cand].filter(el => shown(el) && ![...cand].some(o => o !== el && o.contains(el)));

  // Hit area: probe points MIN/2 out from the centre. Pseudo-element hit areas count,
  // because elementFromPoint returns the owner of a ::before/::after.
  const reach = el => {
    const r = el.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2, d = MIN / 2 - 1;
    return [[-d, 0], [d, 0], [0, -d], [0, d]].every(([dx, dy]) => {
      const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= W || y >= H) return true;
      const h = document.elementFromPoint(x, y); return !!h && (h === el || el.contains(h));
    });
  };
  const small = [], off = [];
  for (const el of controls) {
    const b = box(el);
    if (b.x < -1 || b.y < -1 || b.x + b.w > W + 1 || b.y + b.h > H + 1) { if (b.y < H) off.push({ what: label(el), ...b }); continue; }
    const inline = el.tagName === 'A' && cs(el).display === 'inline';
    if (!inline && onTop(el) && (b.w < MIN || b.h < MIN) && !reach(el)) small.push({ what: label(el), ...b });
  }

  // Contrast of text against the first opaque background behind it.
  const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bgOf = el => { for (let e = el; e; e = e.parentElement) { const c = rgb(cs(e).backgroundColor); if (c.length >= 3 && (c[3] === undefined || c[3] > 0.9)) return c; } return [255, 255, 255]; };
  const lowContrast = [], seenC = new Set();
  for (const el of [...controls, ...document.querySelectorAll('h1,h2,h3,p,li,label,span,td')]) {
    if (seenC.has(el) || !shown(el) || !el.innerText || !el.innerText.trim() || !onTop(el)) continue;
    seenC.add(el);
    const s = cs(el), fg = rgb(s.color); if (fg[3] !== undefined && fg[3] < 0.5) continue;
    if (s.backgroundImage !== 'none') continue;   // gradients and images can't be judged here; critics look
    const L1 = lum(fg), L2 = lum(bgOf(el)), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const big = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && +s.fontWeight >= 700);
    if (ratio < (big ? 3 : 4.5)) lowContrast.push({ what: label(el), ratio: +ratio.toFixed(2) });
  }

  // Visible words on the top layer. Numbers are counted apart from words.
  // A block with 7+ words is a sentence: explainer text until proven otherwise.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const blocks = new Map(); let words = 0, numbers = 0; const tiny = new Set();
  for (let t; (t = walker.nextNode());) {
    const s = t.textContent.trim(); if (!s) continue;
    const el = t.parentElement; if (!el || !shown(el) || !onTop(el)) continue;
    for (const w of s.split(/\s+/)) /^[\d.,:%×x+\-−/]+$/.test(w) ? numbers++ : words++;
    const blockEl = el.closest('p, li, label, figcaption, small, h1, h2, h3, h4, td, th, button, div, span') || el;
    blocks.set(blockEl, (blocks.get(blockEl) || '') + ' ' + s);
    if (parseFloat(cs(el).fontSize) < 12) tiny.add(s.slice(0, 40));
  }
  const sentences = [...blocks.values()].map(s => s.trim().replace(/\s+/g, ' ')).filter(s => s.split(' ').filter(w => /[a-z]/i.test(w)).length >= 7);

  const tooltips = [...document.querySelectorAll('[title], [data-tooltip], [data-tip], [role=tooltip], .tooltip, .tip')]
    .filter(el => !['svg', 'title', 'LINK', 'STYLE', 'HTML'].includes(el.tagName))
    .map(el => (el.getAttribute('title') || el.getAttribute('data-tooltip') || el.className || '').toString().slice(0, 50));
  const helpers = [...document.querySelectorAll('[class*=help], [class*=hint], [class*=subtext], [class*=caption], [class*=description], [class*=explain], [class*=instruction], small')]
    .filter(el => shown(el) && onTop(el)).map(el => el.innerText.trim().slice(0, 60)).filter(Boolean);
  const menus = [...document.querySelectorAll('nav, [class*=hamburger], [class*=burger], [aria-haspopup], [class*=toolbar], [class*=tabbar], [role=tablist], [role=menubar]')].filter(shown).length;
  const toasts = [...document.querySelectorAll('[class*=toast], [class*=snackbar], [role=status], [role=alert]')].filter(el => shown(el) && el.innerText.trim()).length;

  const cap = a => a.slice(0, 20);
  return {
    viewport: `${W}x${H}`,
    hScroll: document.documentElement.scrollWidth > W + 1,
    words, numbers, controls: controls.length,
    sentences: cap(sentences), sentenceCount: sentences.length,
    tooltips: cap(tooltips), helpers: cap(helpers),
    tinyText: cap([...tiny]), smallControls: cap(small), smallCount: small.length,
    offscreen: cap(off), lowContrast: cap(lowContrast), lowContrastCount: lowContrast.length,
    menusOrToolbars: menus, toasts,
    cls: +(window.__glowCLS || 0).toFixed(3),
    reducedMotionRule: [...document.styleSheets].some(ss => { try { return [...ss.cssRules].some(r => String(r.conditionText || r.media?.mediaText || '').includes('prefers-reduced-motion')); } catch { return false; } }),
  };
}

async function shoot(browser, v, V, st) {
  const video = !!args.video;
  const ctx = await browser.newContext({
    viewport: { width: V.width, height: V.height }, deviceScaleFactor: V.dpr, hasTouch: V.touch, isMobile: V.touch,
    ...(video ? { recordVideo: { dir, size: { width: V.width, height: V.height } } } : {}),
  });
  await ctx.addInitScript(seed => {
    window.__glowCLS = 0;
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__glowCLS += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch {}
    if (seed !== null) { let a = seed >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  }, SEED);
  const page = await ctx.newPage();
  const errors = [];
  let failed = false;
  page.on('pageerror', e => errors.push(e.message.slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  try {
    await page.goto(String(args.url), { waitUntil: 'load', timeout: 30000 });
    await sleep(400);
    await st.run(page, { name: v, ...V });
    await sleep(IDLE);
  } catch (e) { failed = true; errors.push('STATE FAILED: ' + e.message.slice(0, 200)); }
  const base = path.join(dir, `${st.name}-${v}`);
  await page.screenshot({ path: base + '.png' });
  await sleep(100);
  await page.screenshot({ path: base + '.b.png' });
  const a = await page.evaluate(audit, V.touch).catch(e => ({ error: e.message }));
  a.idleMotionPct = motionPct(base + '.png', base + '.b.png');
  fs.rmSync(base + '.b.png');
  if (video) await sleep(1500);
  const vid = video ? page.video() : null;
  await ctx.close();
  if (vid) fs.renameSync(await vid.path(), base + '.webm');
  console.log(`${st.name}-${v}${failed ? ' FAILED' : ''}: ${a.words} words (+${a.numbers} numbers), ${a.controls} controls, ${a.sentenceCount} sentences, ${a.tooltips?.length} tooltips, ${a.smallCount} small, ${a.offscreen?.length} off-screen, ${a.lowContrastCount} low contrast, idle motion ${a.idleMotionPct}%, CLS ${a.cls}${a.hScroll ? ', SIDEWAYS SCROLL' : ''}${errors.length ? ', ' + errors.length + ' errors' : ''}`);
  return { state: st.name, view: v, shot: path.basename(base) + '.png', failed, errors, ...a };
}

// SwiftShader gives headless Chromium WebGL2 (canvas games render black without it); PW_ARGS adds more
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", ...(process.env.PW_ARGS ? process.env.PW_ARGS.split(" ") : [])] });
const report = { round: ROUND, url: args.url, seed: SEED, at: new Date().toISOString(), screens: [] };
const perView = await Promise.all(names.filter(v => VIEWS[v] || console.error('unknown view ' + v)).map(async v => {
  const out = [];
  for (const st of states) out.push(await shoot(browser, v, VIEWS[v], st));
  return out;
}));
await browser.close();
report.screens = states.flatMap(st => perView.flat().filter(s => s.state === st.name));
fs.writeFileSync(path.join(dir, 'audit.json'), JSON.stringify(report, null, 2));

// Progress page: one row per state/view, one column per round, newest first.
const rounds = fs.readdirSync(OUT).filter(d => fs.existsSync(path.join(OUT, d, 'audit.json')))
  .map(d => JSON.parse(fs.readFileSync(path.join(OUT, d, 'audit.json'), 'utf8'))).sort((a, b) => b.at.localeCompare(a.at));
const keys = [...new Set(rounds.flatMap(r => r.screens.map(s => `${s.state}-${s.view}`)))];
const cell = (r, k) => {
  const s = r.screens.find(x => `${x.state}-${x.view}` === k); if (!s) return '<td></td>';
  const flags = [s.failed && 'STATE FAILED', s.sentenceCount && `${s.sentenceCount} sentences`, s.tooltips?.length && `${s.tooltips.length} tooltips`,
    s.smallCount && `${s.smallCount} small`, s.offscreen?.length && `${s.offscreen.length} off-screen`, s.lowContrastCount && `${s.lowContrastCount} low contrast`,
    s.hScroll && 'sideways scroll', s.errors?.length && `${s.errors.length} errors`].filter(Boolean).join(' · ');
  const webm = s.shot.replace('.png', '.webm');
  const vid = fs.existsSync(path.join(OUT, r.round, webm)) ? ` · <a href="${r.round}/${webm}">video</a>` : '';
  return `<td><a href="${r.round}/${s.shot}"><img src="${r.round}/${s.shot}" loading="lazy"></a><div>${s.words ?? '?'}w ${s.numbers ?? '?'}n · ${s.controls ?? '?'}c · idle ${s.idleMotionPct}%${vid}${flags ? '<br><b>' + flags + '</b>' : ''}</div></td>`;
};
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html><meta charset=utf-8><meta http-equiv=refresh content=60><title>Glow up</title>
<style>body{background:#16171a;color:#ddd;font:13px system-ui;margin:16px}table{border-collapse:collapse}td,th{vertical-align:top;padding:6px;border-bottom:1px solid #333;text-align:left}img{max-width:260px;max-height:260px;display:block}a{color:#9ab}b{color:#f2a33a;font-weight:500}th{position:sticky;top:0;background:#16171a}</style>
<h1 style="font-weight:500">Glow up</h1><p>${rounds.length} rounds · newest left · w words, n numbers, c controls on screen</p>
<table><tr><th></th>${rounds.map(r => `<th>${r.round}<br><small>${r.at.slice(0, 16).replace('T', ' ')}</small></th>`).join('')}</tr>
${keys.map(k => `<tr><th>${k}</th>${rounds.map(r => cell(r, k)).join('')}</tr>`).join('\n')}</table>`);
console.log(`\n${report.screens.length} screens → ${dir}\nprogress page → ${path.join(OUT, 'index.html')}`);
