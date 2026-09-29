The `dd-*.mjs` scripts are the Drone Command captures, kept as worked examples. The ones worth
copying: `dd-ui.mjs` (drive a whole run through `window.__game`, shoot every screen, collect page
errors), `dd-end.mjs` (a result sequence shot at its beat times and after taps: a screen that moves
must be shot at the moments it moves, not once), `dd-hangar.mjs` (set the profile through the dev
hook to reach a late state without playing there), `dd-late.mjs` (the crowded late state).

Capture lessons from 2026-09-28:

- The render clock is real time; short effects (a quarter-second bolt) are missed by `fast()` plus a
  screenshot. Step frames by hand with `advance(seconds)` and shoot at once.
- A loop of `advance()` hunting for an event can run thousands of drawn frames under SwiftShader and
  hang the capture. Hunt with `fast()` (no drawing), then `advance()` a little.
- The shop overlay closes only through its own Go button; an input sent through the dev hook leaves
  a stale overlay on screen. Drive the real buttons (`page.click("#oGo")`) as a player would.
- `page.tap` on a phone context reports the element that intercepts a tap (the rotate prompt, a
  panel); print that line, it is the finding.
- `mobile-shot.mjs` (a phone in both orientations, every screen) and `touch-probe.mjs` (every touch
  path with state after each tap) are the mobile pass. Portrait play is blocked by design; check the
  title, results and Hangar there.
- The kill guard on this Mac blocks `pkill -f` and `pgrep | kill`; start a server with `& echo $! >
  pidfile` and kill the exact pid.
