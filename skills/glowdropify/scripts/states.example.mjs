// Copy to docs/glow/states.mjs and edit. Each run() starts from a fresh load of --url.
// `view` is { name, width, height, touch, dpr }. Prefer a debug hook (window.__game)
// over clicking when a state is deep. Keep states the same across rounds so shots compare.
const tap = (page, view, sel) => view.touch ? page.tap(sel) : page.click(sel);

export default [
  { name: 'landing', run: async () => {} },
  { name: 'main-action', run: async (page, view) => { await tap(page, view, 'button.primary'); } },
  { name: 'deep-state', run: async (page) => { await page.evaluate(() => window.__game?.goto?.('result')); } },
];
