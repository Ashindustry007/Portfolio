// Smoke that trails the pointer: a small real-time fluid simulation on the GPU
// (the "stable fluids" method). Each pointer move injects smoke and a push in
// the direction of travel; the smoke then swirls, spreads and fades on its own.
// The edges of the screen are walls, so it stays trapped in view.
//
// Two things are particular to this site:
//  - the smoke is drawn in the page's accent colour;
//  - the flow is steered by the background behind it (see `guide`), so on a
//    contour map it runs along the contour lines.

import { GLSL_COMMON } from "@/components/hero/gl";

/** What is drawn behind the smoke, and so what steers it. */
export const fluidGuide = {
  /** 0 nothing, 1 the contour map, 2 falling code (favours vertical flow). */
  mode: 0,
};

const VERT = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv, vL, vR, vT, vB;
uniform vec2 texel;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texel.x, 0.0);
  vR = vUv + vec2(texel.x, 0.0);
  vT = vUv + vec2(0.0, texel.y);
  vB = vUv - vec2(0.0, texel.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const HEAD = "precision highp float; precision highp sampler2D;\nvarying vec2 vUv, vL, vR, vT, vB;\n";

const SPLAT = HEAD + `
uniform sampler2D uTarget;
uniform float aspect;
uniform vec3 value;
uniform vec2 point;
uniform float radius;
void main() {
  vec2 p = vUv - point;
  p.x *= aspect;
  gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + exp(-dot(p, p) / radius) * value, 1.0);
}`;

const ADVECT = HEAD + `
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 simTexel;
uniform float dt;
uniform float fade;
void main() {
  vec2 from = vUv - dt * texture2D(uVelocity, vUv).xy * simTexel;
  gl_FragColor = texture2D(uSource, from) / (1.0 + fade * dt);
}`;

const DIVERGENCE = HEAD + `
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  // Walls: at the border the flow is reflected, which keeps the smoke inside.
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const CURL = HEAD + `
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

// Puts back the small swirls that the simulation would otherwise smooth away.
const VORTICITY = HEAD + `
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float strength;
uniform float dt;
void main() {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= strength * C;
  force.y *= -1.0;
  vec2 v = texture2D(uVelocity, vUv).xy + force * dt;
  gl_FragColor = vec4(clamp(v, vec2(-1000.0), vec2(1000.0)), 0.0, 1.0);
}`;

// The same terrain the contour map draws (see topo-field.tsx), so both agree.
const TERRAIN = GLSL_COMMON + `
uniform float uAspect;
uniform float uScroll;
uniform float uTime;
float terrain(vec2 uv) {
  return fbm(vec2(uv.x * uAspect, uv.y) * 2.1 + vec2(0.0, uScroll * 0.9) + uTime * 0.012);
}`;

// Steers the flow by the background: smoke rises a little, and the part of its
// motion that would carry it across a contour line is bled off, so it runs
// along the lines instead.
const GUIDE = HEAD + TERRAIN + `
uniform sampler2D uVelocity;
uniform sampler2D uDye;
uniform float dt;
uniform float mode;
void main() {
  vec2 v = texture2D(uVelocity, vUv).xy;
  float d = min(texture2D(uDye, vUv).x, 1.5);
  v.y += 26.0 * d * dt;
  if (mode > 0.5 && mode < 1.5) {
    float e = 0.012;
    vec2 slope = vec2(terrain(vUv + vec2(e, 0.0)) - terrain(vUv - vec2(e, 0.0)), terrain(vUv + vec2(0.0, e)) - terrain(vUv - vec2(0.0, e)));
    float steep = length(slope);
    if (steep > 0.0001) {
      vec2 across = slope / steep;
      v -= across * dot(v, across) * min(1.0, 9.0 * dt) * smoothstep(0.0, 0.01, steep);
    }
  } else if (mode > 1.5) {
    v.x *= 1.0 - min(1.0, 5.0 * dt);
  }
  gl_FragColor = vec4(v, 0.0, 1.0);
}`;

const PRESSURE = HEAD + `
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  gl_FragColor = vec4((L + R + B + T - texture2D(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = HEAD + `
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  gl_FragColor = vec4(texture2D(uVelocity, vUv).xy - vec2(R - L, T - B), 0.0, 1.0);
}`;

const SCALE = HEAD + `
uniform sampler2D uTexture;
uniform float value;
void main() { gl_FragColor = value * texture2D(uTexture, vUv); }`;

// Thin smoke is a deep ember, thick smoke the full accent, and the curling
// edges catch the light. Over a contour map, the lines it covers glow.
const DISPLAY = HEAD + TERRAIN + `
uniform sampler2D uDye;
uniform vec3 tint;
uniform float mode;
void main() {
  float d = texture2D(uDye, vUv).x;
  float edge = length(vec2(texture2D(uDye, vR).x - texture2D(uDye, vL).x, texture2D(uDye, vT).x - texture2D(uDye, vB).x));
  float body = 1.0 - exp(-d * 2.6);
  float rim = pow(min(edge * 2.6, 1.0), 1.3);
  vec3 ember = tint * vec3(0.5, 0.36, 0.3);
  vec3 hot = mix(tint, vec3(1.0), 0.55);
  vec3 col = mix(ember, tint, body) * body * 0.4 + hot * rim * 0.42 * (0.35 + body);
  float a = body * 0.26 + rim * 0.34 * (0.35 + body);
  if (mode > 0.5 && mode < 1.5) {
    float bands = terrain(vUv) * 15.0;
    float line = 1.0 - smoothstep(0.0, 0.06, abs(fract(bands) - 0.5));
    col += hot * line * body * 0.5;
    a += line * body * 0.34;
  }
  a = clamp(a, 0.0, 1.0);
  gl_FragColor = vec4(min(col, vec3(1.0)), a);
}`;

type Target = { texture: WebGLTexture; fbo: WebGLFramebuffer; width: number; height: number };
type Double = { read: Target; write: Target; swap: () => void };

export type Fluid = {
  /** Call on every pointer move, in viewport pixels. */
  move: (x: number, y: number) => void;
  /** A burst of smoke in all directions, for a click. */
  burst: (x: number, y: number) => void;
  setTint: (rgb: [number, number, number]) => void;
  dispose: () => void;
};

/** Returns null where the browser cannot run it (no WebGL2 or no float targets). */
export function createFluid(canvas: HTMLCanvasElement, clock: { scroll: () => number }): Fluid | null {
  const gl = canvas.getContext("webgl2", { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: true });
  if (!gl || !gl.getExtension("EXT_color_buffer_float")) return null;

  const shader = (type: number, source: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  type Program = { program: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };
  let vertex: WebGLShader;
  const programs: Record<string, Program> = {};
  try {
    vertex = shader(gl.VERTEX_SHADER, VERT);
    const sources = { splat: SPLAT, advect: ADVECT, divergence: DIVERGENCE, curl: CURL, vorticity: VORTICITY, guide: GUIDE, pressure: PRESSURE, gradient: GRADIENT, scale: SCALE, display: DISPLAY };
    for (const [name, source] of Object.entries(sources)) {
      const program = gl.createProgram()!;
      gl.attachShader(program, vertex);
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, source));
      gl.bindAttribLocation(program, 0, "aPosition");
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link");
      const u: Program["u"] = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < count; i++) {
        const info = gl.getActiveUniform(program, i);
        if (info) u[info.name] = gl.getUniformLocation(program, info.name);
      }
      programs[name] = { program, u };
    }
  } catch (error) {
    console.error(error);
    return null;
  }

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  const target = (width: number, height: number, internal: number, format: number, filter: number): Target => {
    const texture = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, width, height, 0, format, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { texture, fbo, width, height };
  };
  const double = (...args: Parameters<typeof target>): Double => {
    const pair = { read: target(...args), write: target(...args), swap() { [pair.read, pair.write] = [pair.write, pair.read]; } };
    return pair;
  };
  const free = (t?: Target) => {
    if (!t) return;
    gl.deleteTexture(t.texture);
    gl.deleteFramebuffer(t.fbo);
  };

  let velocity: Double, dye: Double, pressure: Double, divergence: Target, curl: Target;
  let built = false;
  const build = () => {
    if (built) [velocity.read, velocity.write, dye.read, dye.write, pressure.read, pressure.write, divergence, curl].forEach(free);
    // The flow is worked out coarsely and the smoke itself finely.
    const size = (short: number) => {
      const ratio = Math.max(canvas.width, canvas.height) / Math.max(1, Math.min(canvas.width, canvas.height));
      const long = Math.round(short * ratio);
      return canvas.width >= canvas.height ? ([long, short] as const) : ([short, long] as const);
    };
    const [sw, sh] = size(128);
    const [dw, dh] = size(768);
    velocity = double(sw, sh, gl.RG16F, gl.RG, gl.LINEAR);
    dye = double(dw, dh, gl.R16F, gl.RED, gl.LINEAR);
    pressure = double(sw, sh, gl.R16F, gl.RED, gl.NEAREST);
    divergence = target(sw, sh, gl.R16F, gl.RED, gl.NEAREST);
    curl = target(sw, sh, gl.R16F, gl.RED, gl.NEAREST);
    built = true;
  };
  const fit = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.floor(window.innerWidth * dpr), h = Math.floor(window.innerHeight * dpr);
    if (canvas.width === w && canvas.height === h) return false;
    canvas.width = w;
    canvas.height = h;
    return true;
  };
  fit();
  build();

  const use = (name: string) => {
    const p = programs[name];
    gl.useProgram(p.program);
    return p.u;
  };
  const bind = (t: Target, unit: number) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t.texture);
    return unit;
  };
  const draw = (to: Target | null) => {
    if (to) {
      gl.viewport(0, 0, to.width, to.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, to.fbo);
    } else {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const clearScreen = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  const splat = (x: number, y: number, fx: number, fy: number, amount: number, spread: number) => {
    let u = use("splat");
    gl.uniform2f(u.texel, 1 / velocity.read.width, 1 / velocity.read.height);
    gl.uniform1f(u.aspect, canvas.width / canvas.height);
    gl.uniform2f(u.point, x, y);
    gl.uniform1i(u.uTarget, bind(velocity.read, 0));
    gl.uniform3f(u.value, fx, fy, 0);
    gl.uniform1f(u.radius, 0.0014 * spread);
    draw(velocity.write);
    velocity.swap();
    u = use("splat");
    gl.uniform1i(u.uTarget, bind(dye.read, 0));
    gl.uniform3f(u.value, amount, 0, 0);
    gl.uniform1f(u.radius, 0.00016 * spread);
    draw(dye.write);
    dye.swap();
  };

  const pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, moved: false, seen: false };
  let tint: [number, number, number] = [1, 0.5, 0];
  let frame = 0;
  let last = 0;
  let lastInput = 0;

  const terrainUniforms = (u: Program["u"]) => {
    gl.uniform1f(u.uAspect, canvas.width / canvas.height);
    gl.uniform1f(u.uScroll, clock.scroll());
    gl.uniform1f(u.uTime, performance.now() / 1000);
  };

  const step = (now: number) => {
    frame = requestAnimationFrame(step);
    const dt = Math.min((now - last) / 1000, 1 / 60);
    last = now;
    // Nothing has moved for a while and the smoke has gone: stop until the pointer returns.
    if (now - lastInput > 9000) {
      cancelAnimationFrame(frame);
      frame = 0;
      clearScreen();
      return;
    }
    if (fit()) build();

    if (pointer.moved) {
      pointer.moved = false;
      const dx = pointer.x - pointer.px, dy = pointer.y - pointer.py;
      const travel = Math.hypot(dx, dy);
      if (travel > 0) {
        // A slow drift leaves a thin wisp; a fast sweep throws a wide, dense billow.
        const count = Math.min(Math.ceil(travel / 0.004), 24);
        const amount = Math.min(0.16 + 4.5 * travel, 0.6);
        const spread = 0.8 + Math.min(travel * 30, 1.9);
        for (let i = 1; i <= count; i++) {
          const k = i / count;
          splat(pointer.px + dx * k, pointer.py + dy * k, 620 * dx, 620 * dy, amount, spread);
        }
        pointer.px = pointer.x;
        pointer.py = pointer.y;
      }
    }

    gl.disable(gl.BLEND);
    const simTexel: [number, number] = [1 / velocity.read.width, 1 / velocity.read.height];

    let u = use("curl");
    gl.uniform2f(u.texel, ...simTexel);
    gl.uniform1i(u.uVelocity, bind(velocity.read, 0));
    draw(curl);

    u = use("vorticity");
    gl.uniform2f(u.texel, ...simTexel);
    gl.uniform1i(u.uVelocity, bind(velocity.read, 0));
    gl.uniform1i(u.uCurl, bind(curl, 1));
    gl.uniform1f(u.strength, 9);
    gl.uniform1f(u.dt, dt);
    draw(velocity.write);
    velocity.swap();

    u = use("guide");
    gl.uniform2f(u.texel, ...simTexel);
    gl.uniform1i(u.uVelocity, bind(velocity.read, 0));
    gl.uniform1i(u.uDye, bind(dye.read, 1));
    gl.uniform1f(u.dt, dt);
    gl.uniform1f(u.mode, fluidGuide.mode);
    terrainUniforms(u);
    draw(velocity.write);
    velocity.swap();

    u = use("divergence");
    gl.uniform2f(u.texel, ...simTexel);
    gl.uniform1i(u.uVelocity, bind(velocity.read, 0));
    draw(divergence);

    u = use("scale");
    gl.uniform1i(u.uTexture, bind(pressure.read, 0));
    gl.uniform1f(u.value, 0.8);
    draw(pressure.write);
    pressure.swap();

    u = use("pressure");
    gl.uniform2f(u.texel, ...simTexel);
    gl.uniform1i(u.uDivergence, bind(divergence, 0));
    for (let i = 0; i < 20; i++) {
      gl.uniform1i(u.uPressure, bind(pressure.read, 1));
      draw(pressure.write);
      pressure.swap();
    }

    u = use("gradient");
    gl.uniform2f(u.texel, ...simTexel);
    gl.uniform1i(u.uPressure, bind(pressure.read, 0));
    gl.uniform1i(u.uVelocity, bind(velocity.read, 1));
    draw(velocity.write);
    velocity.swap();

    u = use("advect");
    gl.uniform2f(u.simTexel, ...simTexel);
    gl.uniform1f(u.dt, dt);
    gl.uniform1i(u.uVelocity, bind(velocity.read, 0));
    gl.uniform1i(u.uSource, bind(velocity.read, 0));
    gl.uniform1f(u.fade, 1.1);
    draw(velocity.write);
    velocity.swap();
    gl.uniform1i(u.uVelocity, bind(velocity.read, 0));
    gl.uniform1i(u.uSource, bind(dye.read, 1));
    gl.uniform1f(u.fade, 3.0);
    draw(dye.write);
    dye.swap();

    u = use("display");
    gl.uniform2f(u.texel, 1.5 / dye.read.width, 1.5 / dye.read.height);
    gl.uniform1i(u.uDye, bind(dye.read, 0));
    gl.uniform3f(u.tint, ...tint);
    gl.uniform1f(u.mode, fluidGuide.mode);
    terrainUniforms(u);
    draw(null);
  };

  const wake = () => {
    lastInput = performance.now();
    if (frame) return;
    last = lastInput;
    frame = requestAnimationFrame(step);
  };
  const place = (x: number, y: number) => {
    const nx = x / window.innerWidth, ny = 1 - y / window.innerHeight;
    if (!pointer.seen) {
      pointer.seen = true;
      pointer.x = pointer.px = nx;
      pointer.y = pointer.py = ny;
      return;
    }
    pointer.x = nx;
    pointer.y = ny;
    pointer.moved = true;
  };

  return {
    move(x, y) {
      place(x, y);
      wake();
    },
    burst(x, y) {
      place(x, y);
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2, force = 380 + Math.random() * 520;
        splat(pointer.x, pointer.y, Math.cos(a) * force, Math.sin(a) * force, 0.5, 1.6);
      }
      wake();
    },
    setTint(rgb) {
      tint = rgb;
    },
    dispose() {
      if (frame) cancelAnimationFrame(frame);
      [velocity.read, velocity.write, dye.read, dye.write, pressure.read, pressure.write, divergence, curl].forEach(free);
      gl.deleteBuffer(quad);
      for (const p of Object.values(programs)) gl.deleteProgram(p.program);
      clearScreen();
    },
  };
}
