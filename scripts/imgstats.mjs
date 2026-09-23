// Copied from Big-Head-Club/glowdrop tools/imgstats.js. Needs ffmpeg.
/*
 Objective look metrics for an image, so a critic can compare ours against the
 reference with numbers as well as eyes.

   node ~/.claude/skills/glowdropify/scripts/imgstats.mjs refs/tetris-effect/01.jpg
   node ~/.claude/skills/glowdropify/scripts/imgstats.mjs shots/a.png refs/tetris-effect/01.jpg   (compare)
*/
import { execFileSync } from 'node:child_process';

// Sample at about 320x180 worth of pixels, keeping the image's own aspect so a
// portrait phone shot is not squashed.
function dims(f) {
  const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
    '-of', 'csv=p=0', f]).toString().trim().split(',').map(Number);
  const k = Math.sqrt(57600 / (w * h));
  return [Math.max(2, Math.round(w * k / 2) * 2), Math.max(2, Math.round(h * k / 2) * 2)];
}
function pixels(f, W, H) {
  return execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-vf', `scale=${W}:${H}`,
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 });
}
const srgb2lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };

function stats(f) {
  const [W, H] = dims(f);
  const p = pixels(f, W, H), n = W * H;
  let lum = [], sat = [], hue = new Array(24).fill(0), dark = 0, mid = 0, hot = 0, blown = 0;
  let rs = 0, gs = 0, bs = 0, colourfulSum = 0;
  for (let i = 0; i < n; i++) {
    const r = p[i*3], g = p[i*3+1], b = p[i*3+2];
    rs += r; gs += g; bs += b;
    const L = 0.2126*srgb2lin(r) + 0.7152*srgb2lin(g) + 0.0722*srgb2lin(b);
    lum.push(L);
    const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
    const s = mx ? (mx - mn) / mx : 0;
    sat.push(s); colourfulSum += (mx - mn);
    if (L < 0.02) dark++; else if (L < 0.25) mid++; else if (L < 0.85) hot++; else blown++;
    if (mx - mn > 24) {
      let h;
      if (mx === r) h = ((g - b) / (mx - mn) + 6) % 6;
      else if (mx === g) h = (b - r) / (mx - mn) + 2;
      else h = (r - g) / (mx - mn) + 4;
      hue[Math.floor(h * 4) % 24] += L;
    }
  }
  lum.sort((a,b)=>a-b); sat.sort((a,b)=>a-b);
  const q = a => t => a[Math.floor(t * (a.length - 1))];
  const ql = q(lum), qs = q(sat);
  // local contrast / edge energy
  // Edge energy must be measured on LUMA, not on one channel. Reading p[i] alone
  // reads RED, which scores a red checkerboard 98.8 and an identical blue one 0.0.
  // Our palette is cyan and the reference is neutral, so that understated our
  // frames by 32-90% and had builders chasing "detail" that was already there.
  const luma = new Float64Array(n);
  for (let i = 0; i < n; i++) luma[i] = 0.2126*p[i*3] + 0.7152*p[i*3+1] + 0.0722*p[i*3+2];
  let edge = 0;
  for (let y = 1; y < H-1; y++) for (let x = 1; x < W-1; x++) {
    const i = y*W+x;
    edge += Math.abs(luma[i]-luma[i+1]) + Math.abs(luma[i]-luma[i+W]);
  }
  const topHue = hue.map((v,i)=>[i*15,v]).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([h])=>h);
  return {
    file: f,
    meanRGB: [rs/n|0, gs/n|0, bs/n|0],
    lum: { p05: +ql(0.05).toFixed(4), p50: +ql(0.5).toFixed(4), p90: +ql(0.9).toFixed(4), p99: +ql(0.99).toFixed(4), mean: +(lum.reduce((a,b)=>a+b,0)/n).toFixed(4) },
    tonal: { nearBlackPct: +(100*dark/n).toFixed(1), lowPct: +(100*mid/n).toFixed(1), brightPct: +(100*hot/n).toFixed(1), blownPct: +(100*blown/n).toFixed(2) },
    sat: { p50: +qs(0.5).toFixed(3), p90: +qs(0.9).toFixed(3) },
    colourfulness: +(colourfulSum/n).toFixed(1),
    edgeEnergy: +(edge/(n*2)).toFixed(1),
    dominantHues: topHue
  };
}
const files = process.argv.slice(2);
const out = files.map(stats);
console.log(JSON.stringify(out.length === 1 ? out[0] : out, null, 2));
