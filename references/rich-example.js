// The rich layer over the line renderer (glow-up fork): a sky with depth and a few fixed stars,
// bloom so every bright line glows, and a particle system for the moments that matter.
// Everything here is drawing only. The sim never sees it, so replays and scores are unchanged.

const FULL_VS = `#version 300 es
out vec2 v_uv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  v_uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

// deep blue-black overhead, lifting to a cold haze at the horizon with a faint warm band where the
// cities are; sparse fixed stars in the upper sky (they never twinkle: the sky stays still)
const SKY_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform vec2 u_res;
uniform float u_horizon; // pixel row of the ground line, from the bottom
uniform float u_dpr;
uniform vec3 u_top, u_low, u_warm;
out vec4 o;
float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
void main() {
  float y = gl_FragCoord.y;
  float t = clamp((y - u_horizon) / max(1.0, u_res.y - u_horizon), 0.0, 1.0);
  vec3 col = mix(u_low, u_top, pow(t, 0.55));
  col += u_warm * exp(-t * 7.0) * 0.55;
  // one star per scattered cell, placed at a random point inside it, so there is no grid
  vec2 cs = vec2(9.0 * u_dpr);
  vec2 cell = floor(gl_FragCoord.xy / cs);
  float h = hash(cell);
  vec2 at = (cell + vec2(hash(cell + 17.0), hash(cell + 41.0))) * cs;
  float d = length(gl_FragCoord.xy - at) / u_dpr;
  float star = step(0.93, h) * smoothstep(1.3, 0.2, d) * (0.35 + 0.65 * hash(cell + 7.0));
  col += vec3(0.78, 0.84, 1.0) * star * 0.7 * smoothstep(0.15, 0.55, t);
  o = vec4(col, 1.0);
}`

const BRIGHT_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_tex;
out vec4 o;
void main() {
  vec3 c = texture(u_tex, v_uv).rgb;
  float l = max(c.r, max(c.g, c.b));
  o = vec4(c * smoothstep(0.22, 0.75, l), 1.0);
}`

const BLUR_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_dir; // one texel of the source, along the blur direction
out vec4 o;
void main() {
  vec3 c = texture(u_tex, v_uv).rgb * 0.2270270270;
  c += texture(u_tex, v_uv + u_dir * 1.3846153846).rgb * 0.3162162162;
  c += texture(u_tex, v_uv - u_dir * 1.3846153846).rgb * 0.3162162162;
  c += texture(u_tex, v_uv + u_dir * 3.2307692308).rgb * 0.0702702703;
  c += texture(u_tex, v_uv - u_dir * 3.2307692308).rgb * 0.0702702703;
  o = vec4(c, 1.0);
}`

const COMP_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_scene, u_b1, u_b2;
uniform float u_k1, u_k2;
out vec4 o;
void main() {
  vec3 c = texture(u_scene, v_uv).rgb + texture(u_b1, v_uv).rgb * u_k1 + texture(u_b2, v_uv).rgb * u_k2;
  // a soft vignette pulls the eye to the middle of the field
  float v = smoothstep(0.45, 1.05, length((v_uv - 0.5) * vec2(1.25, 1.0)));
  c *= 1.0 - 0.28 * v;
  o = vec4(c, 1.0);
}`

export function createRich(gl, compile) {
  const sky = compile(gl, FULL_VS, SKY_FS)
  const bright = compile(gl, FULL_VS, BRIGHT_FS)
  const blur = compile(gl, FULL_VS, BLUR_FS)
  const comp = compile(gl, FULL_VS, COMP_FS)
  const vao = gl.createVertexArray()

  const target = () => ({ tex: gl.createTexture(), fb: gl.createFramebuffer(), w: 0, h: 0 })
  const T = { scene: target(), a1: target(), b1: target(), a2: target(), b2: target() }
  function size(t, w, h) {
    w = Math.max(1, w | 0); h = Math.max(1, h | 0)
    if (t.w === w && t.h === h) return
    t.w = w; t.h = h
    gl.bindTexture(gl.TEXTURE_2D, t.tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0)
  }
  const into = (t) => { gl.bindFramebuffer(gl.FRAMEBUFFER, t ? t.fb : null); gl.viewport(0, 0, t ? t.w : gl.canvas.width, t ? t.h : gl.canvas.height) }
  const tri = () => { gl.bindVertexArray(vao); gl.drawArrays(gl.TRIANGLES, 0, 3) }
  const tex = (unit, t) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t.tex) }

  // start a frame: render into the scene target, sky first
  function begin(cam, th, rgb) {
    size(T.scene, cam.w, cam.h)
    size(T.a1, cam.w / 2, cam.h / 2); size(T.b1, cam.w / 2, cam.h / 2)
    size(T.a2, cam.w / 4, cam.h / 4); size(T.b2, cam.w / 4, cam.h / 4)
    into(T.scene)
    gl.disable(gl.BLEND)
    gl.useProgram(sky.p)
    gl.uniform2f(sky.u.u_res, cam.w, cam.h)
    gl.uniform1f(sky.u.u_horizon, cam.h - cam.oy)
    gl.uniform1f(sky.u.u_dpr, cam.dpr || 1)
    const bg = rgb(th.bg)
    gl.uniform3f(sky.u.u_top, bg[0] * 0.55, bg[1] * 0.55, bg[2] * 0.7)
    gl.uniform3f(sky.u.u_low, 0.07, 0.1, 0.19)
    gl.uniform3f(sky.u.u_warm, 0.11, 0.06, 0.035)
    tri()
  }

  // end a frame: bloom the bright parts and put it all on the screen
  function end() {
    gl.disable(gl.BLEND)
    gl.activeTexture(gl.TEXTURE0)
    into(T.a1); gl.useProgram(bright.p); gl.uniform1i(bright.u.u_tex, 0); tex(0, T.scene); tri()
    gl.useProgram(blur.p); gl.uniform1i(blur.u.u_tex, 0)
    const pass = (src, dst, dx, dy) => { into(dst); tex(0, src); gl.uniform2f(blur.u.u_dir, dx / src.w, dy / src.h); tri() }
    pass(T.a1, T.b1, 1, 0); pass(T.b1, T.a1, 0, 1)
    pass(T.a1, T.b2, 1, 0); pass(T.b2, T.a2, 0, 1)
    pass(T.a2, T.b2, 2, 0); pass(T.b2, T.a2, 0, 2)
    into(null)
    gl.useProgram(comp.p)
    gl.uniform1i(comp.u.u_scene, 0); gl.uniform1i(comp.u.u_b1, 1); gl.uniform1i(comp.u.u_b2, 2)
    gl.uniform1f(comp.u.u_k1, 0.9); gl.uniform1f(comp.u.u_k2, 1.25)
    tex(0, T.scene); tex(1, T.a1); tex(2, T.a2)
    tri()
    gl.activeTexture(gl.TEXTURE0)
  }

  return { begin, end }
}

// ---- particles ------------------------------------------------------------------------------------
// Sparks are short streaks along their velocity that start white-hot and cool to their colour;
// embers are glowing dots that drift and fall. Speeds are in screen pixels, so a spray reads the
// same size however far the camera has pulled back.
export function createParticles(cap = 1600) {
  const ps = []
  let last = null
  const rnd = (a, b) => a + Math.random() * (b - a)

  // o: { n, type, kind: "spark" | "ember", sp: [min,max] px/s, life: [min,max], g px/s², drag,
  //      hot (s white-hot), w (width), dir (radians) + spread, up (bias upward) }
  function emit(x, y, o, pxPerUnit) {
    const k = 1 / Math.max(1e-6, pxPerUnit)
    for (let i = 0; i < o.n && ps.length < cap; i++) {
      const a = o.dir != null ? o.dir + rnd(-o.spread, o.spread) : rnd(0, Math.PI * 2)
      const s = rnd(o.sp[0], o.sp[1]) * k
      ps.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s + (o.up || 0) * k,
        age: 0, life: rnd(o.life[0], o.life[1]), type: o.type, hot: o.hot || 0,
        g: (o.g ?? 420) * k, drag: o.drag ?? 3, w: o.w ?? 1.3, ember: o.kind === "ember", size: o.size ?? 1.6,
      })
    }
  }

  function step(clock) {
    const dt = last == null ? 0 : Math.max(0, Math.min(1 / 20, clock - last))
    last = clock
    if (!dt) return
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i]
      p.age += dt
      if (p.age >= p.life) { ps[i] = ps[ps.length - 1]; ps.pop(); continue }
      const f = Math.exp(-p.drag * dt)
      p.vx *= f; p.vy = p.vy * f - p.g * dt
      p.x += p.vx * dt; p.y += p.vy * dt
    }
  }

  // draw with the renderer's own primitives: lines for sparks, soft marks for embers
  function draw(tLine, mk, hotType, pxPerUnit, dpr) {
    for (const p of ps) {
      const u = p.age / p.life
      // bright for most of the life, then a quick fade
      const a = 1 - u * u * u
      const type = p.age < p.hot ? hotType : p.type
      if (p.ember) {
        mk(p.x, p.y, p.size * 4.5 * dpr, 8, type, 1, a * 0.7)
        mk(p.x, p.y, p.size * 1.1 * dpr, 0, type, 1, a)
      } else {
        const tail = 0.085
        tLine([p.x - p.vx * tail, p.y - p.vy * tail, p.x, p.y], type, p.w * 1.7 * (1 - 0.5 * u), a)
      }
    }
  }

  return { emit, step, draw, clear() { ps.length = 0; last = null }, get count() { return ps.length } }
}
