// Copied from Big-Head-Club/glowdrop tools/ab.js. Needs ffmpeg.
/*
 Blind A/B composer. Puts two images side by side in a random order so the
 critic cannot know which is ours. LEFT is A, RIGHT is B.

   node ~/.claude/skills/glowdropify/scripts/ab.mjs --ours shots/x.png --ref refs/tetris-effect/01.jpg \
       --out shots/ab/look-r1.png [--h 1000]

 Writes the answer key OUTSIDE the repo so a critic cannot trip over it.
 Print the key with:  node ~/.claude/skills/glowdropify/scripts/ab.mjs --reveal shots/ab/look-r1.png
*/
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const KEYDIR = process.env.AB_KEYDIR || path.join(os.tmpdir(), 'glowdropify-ab-keys');
fs.mkdirSync(KEYDIR, { recursive: true });
const keyFile = f => path.join(KEYDIR, crypto.createHash('sha1').update(path.resolve(f)).digest('hex') + '.json');

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = (process.argv[i+1] && !process.argv[i+1].startsWith('--')) ? process.argv[++i] : true;
}

if (args.reveal) {
  const kf = keyFile(String(args.reveal));
  if (!fs.existsSync(kf)) { console.error('no key for ' + args.reveal); process.exit(1); }
  console.log(fs.readFileSync(kf, 'utf8'));
  process.exit(0);
}

const ours = String(args.ours), ref = String(args.ref), out = String(args.out);
const H = Number(args.h || 1000);
const oursIsLeft = crypto.randomInt(2) === 0;
const left = oursIsLeft ? ours : ref;
const right = oursIsLeft ? ref : ours;

fs.mkdirSync(path.dirname(out), { recursive: true });
// Equal-HEIGHT stacking handed a 16:9 reference 3.11x the area and 3.9x the
// sampling density of a portrait frame, and it decided verdicts: a reference
// frame A/B'd against a centre crop of ITSELF loses to the wider half. Worse,
// every ours-vs-reference composite came out the same width, so the narrow
// half was always ours and the comparison was not blind at all.
// Both halves are now letterboxed into identical squares of side H, so each
// gets the same area and the composite is the same shape either way round.
execFileSync('ffmpeg', ['-y', '-i', left, '-i', right, '-filter_complex',
  `[0:v]scale=${H}:${H}:force_original_aspect_ratio=decrease,` +
  `pad=${H}:${H}:(ow-iw)/2:(oh-ih)/2:color=black[l];` +
  `[1:v]scale=${H}:${H}:force_original_aspect_ratio=decrease,` +
  `pad=${H}:${H}:(ow-iw)/2:(oh-ih)/2:color=black[r];` +
  `[l][r]hstack=inputs=2,pad=iw+24:ih:12:0:color=0x202020`,
  out], { stdio: 'pipe' });

fs.writeFileSync(keyFile(out), JSON.stringify({
  composite: path.resolve(out), left: path.resolve(left), right: path.resolve(right),
  ours: oursIsLeft ? 'LEFT (A)' : 'RIGHT (B)', oursPath: path.resolve(ours), refPath: path.resolve(ref)
}, null, 2));
console.log('composed ' + out + '  (LEFT=A, RIGHT=B; key hidden)');
