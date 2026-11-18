"use client";

import { useEffect, useRef, useState } from "react";
import { createQuad, GLSL_COMMON, loadImage } from "./gl";
import { useExperience } from "@/lib/experience";
import { cn } from "@/lib/utils";

export type CloakClass = "c" | "a" | "t";

// Each class stands him in a place of its own, drawn entirely in the shader:
//   coder      a city of server towers on a glowing grid, with the machine's
//              mind (rings, a neural net, code falling like rain) rising behind him
//   artist     colour that flows and folds around him like a hallucination
//   traveller  ranges of mountains at dusk, wind tearing snow off the crests
// `scene` paints that place; `cloth` is what the same element does to his shirt.
// His face and hair are never altered.
const CLASS_GLSL: Record<CloakClass, string> = {
  c: `
vec3 tint(float k) { return mix(vec3(0.02, 0.6, 0.38), vec3(0.8, 1.0, 0.9), k); }
// Columns of glyphs, each with a bright head running down it.
float rain(vec2 uv, float t, float cols) {
  vec2 grid = vec2(cols, cols * 1.25);
  vec2 cell = floor(uv * grid);
  vec2 local = fract(uv * grid);
  float seed = hash(vec2(cell.x, 7.0));
  float head = fract(seed * 13.0 - t * (0.12 + seed * 0.3));
  float trail = pow(1.0 - fract(cell.y / grid.y - head), 6.0);
  vec2 bit = floor(local * vec2(4.0, 6.0));
  float on = step(0.46, hash(cell * 1.37 + bit + floor(t * (2.0 + seed * 5.0))));
  on *= step(bit.x, 2.5) * step(bit.y, 4.5);
  return on * (0.12 + trail * 1.5);
}
float segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}
vec3 scene(vec2 p, vec2 head, float twin, float t, float power) {
  float horizon = 0.4;
  vec3 col = vec3(0.0, 0.022, 0.017);

  // Sky: code falling like rain, thicker where it gathers into a vast copy of him.
  float far = rain(p, t, 46.0);
  float sky = smoothstep(horizon - 0.02, horizon + 0.2, p.y);
  col += tint(clamp(far - 0.7, 0.0, 1.0)) * far * 0.16 * sky;
  float inside = smoothstep(0.25, 0.6, twin);
  float near = rain(p + 3.0, t * 1.4, 30.0);
  col += tint(clamp(near - 0.5, 0.0, 1.0)) * near * inside * 0.32 * sky;

  // The mind: a core of light behind his head, ringed by turning arcs.
  vec2 c = vec2((p.x - head.x) * 0.8, p.y - head.y - 0.08);
  float r = length(c), ang = atan(c.y, c.x);
  col += tint(0.45) * exp(-r * 5.0) * (0.85 + 0.15 * power);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float ring = smoothstep(0.0045, 0.0, abs(r - (0.115 + fi * 0.062)));
    float turn = mod(fi, 2.0) < 0.5 ? 1.0 : -1.0;
    float arc = step(0.38, fract(ang / 6.2832 * (3.0 + fi) + t * 0.045 * turn * (1.0 + fi * 0.4)));
    col += tint(0.75) * ring * arc * (0.75 - fi * 0.12);
  }
  // Its net: ten nodes on the outer ring, each wired to its neighbour and to
  // the node three along, with signals running down every wire.
  float wires = 0.0, sparks = 0.0, nodes = 0.0;
  for (int i = 0; i < 10; i++) {
    float fi = float(i);
    float a0 = fi * 0.6283 + t * 0.05, a1 = (fi + 1.0) * 0.6283 + t * 0.05, a2 = (fi + 3.0) * 0.6283 + t * 0.05;
    float r0 = 0.34 + 0.04 * sin(fi * 2.4 + t * 0.4);
    float r1 = 0.34 + 0.04 * sin((fi + 1.0) * 2.4 + t * 0.4);
    float r2 = 0.34 + 0.04 * sin((fi + 3.0) * 2.4 + t * 0.4);
    vec2 n0 = vec2(cos(a0), sin(a0)) * r0, n1 = vec2(cos(a1), sin(a1)) * r1, n2 = vec2(cos(a2), sin(a2)) * r2;
    wires += smoothstep(0.0035, 0.0, segment(c, n0, n1)) + smoothstep(0.003, 0.0, segment(c, n0, n2)) * 0.6;
    float k1 = fract(t * 0.5 + fi * 0.37), k2 = fract(t * 0.36 + fi * 0.61);
    sparks += smoothstep(0.02, 0.0, distance(c, mix(n0, n1, k1))) + smoothstep(0.018, 0.0, distance(c, mix(n0, n2, k2)));
    nodes += smoothstep(0.018, 0.006, distance(c, n0)) * (0.6 + 0.4 * sin(t * 2.0 + fi * 1.9));
  }
  col += (tint(0.35) * wires * 0.26 + tint(0.9) * nodes * 0.85 + vec3(0.9, 1.0, 0.95) * sparks * 0.85 * (0.6 + 0.4 * power)) * sky;

  // The city: two rows of server towers along the horizon, lower in the
  // middle so the core shows between them, every rack light blinking.
  for (int L = 0; L < 2; L++) {
    float fl = float(L);
    float n = 13.0 + fl * 9.0;
    float id = floor(p.x * n + fl * 0.5);
    float gap = fract(p.x * n + fl * 0.5);
    float open = smoothstep(0.04, 0.36, abs((id + 0.5 - fl * 0.5) / n - head.x));
    float top = horizon + (0.07 + 0.3 * hash(vec2(id, 3.0 + fl * 17.0))) * (0.22 + 0.78 * open) * (fl < 0.5 ? 1.0 : 0.62);
    float tower = step(0.07, gap) * step(gap, 0.93) * step(horizon - 0.01, p.y) * smoothstep(top + 0.003, top - 0.003, p.y);
    vec3 wall = mix(vec3(0.0, 0.07, 0.055), vec3(0.0, 0.03, 0.024), fl);
    vec2 rack = floor(vec2(gap * 7.0, (p.y - horizon) * 95.0));
    vec2 inRack = fract(vec2(gap * 7.0, (p.y - horizon) * 95.0));
    float lit = step(0.6, hash(rack + id * 3.1 + fl * 9.0 + floor(t * (0.6 + hash(rack + id) * 3.0))));
    float led = lit * step(0.25, inRack.x) * step(inRack.x, 0.75) * step(0.3, inRack.y) * step(inRack.y, 0.7);
    wall += tint(0.2 + 0.7 * hash(rack + 5.0)) * led * (0.5 + 0.4 * power) * (1.0 - fl * 0.35);
    wall += tint(0.8) * smoothstep(0.006, 0.0, abs(p.y - top)) * 0.5;
    col = mix(col, wall, tower);
  }

  // The ground: a lit grid running out to the horizon, with data moving along it.
  if (p.y < horizon) {
    float depth = 0.11 / (horizon - p.y + 0.0001);
    float across = abs(fract((p.x - head.x) * depth * 5.0) - 0.5);
    float along = abs(fract(depth * 2.6 - t * (0.35 + 0.25 * power)) - 0.5);
    float thick = 0.02 + depth * 0.012;
    float grid = max(1.0 - smoothstep(0.0, thick, across), 1.0 - smoothstep(0.0, thick * 1.6, along));
    float fade = smoothstep(horizon, horizon - 0.3, p.y);
    vec3 floor_ = vec3(0.0, 0.018, 0.014) + tint(0.45) * grid * (0.16 + 0.5 * exp(-depth * 0.35)) * fade;
    floor_ += tint(0.5) * exp(-abs(p.x - head.x) * 3.2) * exp(-(horizon - p.y) * 5.0) * 0.4;
    col = floor_;
  }
  col += tint(0.7) * smoothstep(0.004, 0.0, abs(p.y - horizon)) * 0.55;
  // A scan passing down through everything.
  col += tint(0.5) * smoothstep(0.012, 0.0, abs(fract(p.y - t * 0.12) - 0.5)) * 0.08;
  return col;
}
vec3 cloth(vec2 uv, float t) {
  float g = rain(uv * vec2(1.0, 0.8), t * 1.2, 34.0);
  return tint(0.2) * 0.14 + tint(clamp(g - 0.4, 0.0, 1.0)) * g * 0.7;
}`,
  a: `
vec3 tint(float k) { return 0.5 + 0.5 * cos(6.2832 * (k + vec3(0.0, 0.33, 0.67))); }
vec3 scene(vec2 p, vec2 head, float twin, float t, float power) {
  vec2 c = vec2((p.x - head.x) * 0.8, p.y - head.y);
  float r = length(c);
  // Fold the plane through itself twice, slowly, so colour never sits still.
  vec2 q = c * 2.3;
  q += 0.6 * vec2(fbm(q * 1.3 + vec2(0.0, t * 0.11)), fbm(q * 1.3 + vec2(5.2, -t * 0.09)));
  q += 0.38 * vec2(fbm(q * 2.5 - t * 0.07), fbm(q * 2.5 + 3.7 + t * 0.06));
  float f = fbm(q * 1.6 + r * 1.4 - t * 0.13);
  // Rings of colour breathing out from behind his head.
  float bands = sin(f * 19.0 + r * 10.0 - t * (0.8 + 0.5 * power));
  vec3 col = tint(f * 1.7 + r * 0.9 - t * 0.05 + bands * 0.07);
  col = pow(col, vec3(0.85)) * (0.5 + 0.5 * smoothstep(-0.3, 0.9, bands));
  col += vec3(1.0, 0.96, 0.9) * pow(smoothstep(0.9, 1.0, abs(bands)), 2.0) * 0.22;
  // Brightest right behind him, deepening toward the corners.
  col *= 0.32 + 1.0 * exp(-r * 1.7);
  col += tint(t * 0.03 + 0.1) * exp(-r * 7.0) * 0.5;
  return col;
}
vec3 cloth(vec2 uv, float t) {
  vec2 q = uv * 3.0;
  q += 0.5 * vec2(fbm(q + t * 0.1), fbm(q + 4.0 - t * 0.08));
  float f = fbm(q * 1.5);
  return tint(f * 1.8 + uv.y - t * 0.05) * (0.3 + 0.35 * sin(f * 16.0 - t));
}`,
  t: `
vec3 tint(float k) { return mix(vec3(0.1, 0.62, 0.62), vec3(1.0, 0.8, 0.5), k); }
vec3 scene(vec2 p, vec2 head, float twin, float t, float power) {
  vec3 dusk = vec3(0.03, 0.07, 0.13), haze = vec3(0.1, 0.33, 0.38), glow = vec3(1.0, 0.72, 0.42);
  // The sun sits low, right behind his head.
  float sd = distance(vec2(p.x * 0.8, p.y), vec2(head.x * 0.8, head.y + 0.1));
  vec3 col = mix(haze, dusk, smoothstep(0.3, 1.0, p.y));
  col = mix(col, glow, exp(-sd * 4.6) * 0.92);
  col += glow * smoothstep(0.085, 0.074, sd) * 0.55;
  // High cloud, pulled into streaks.
  float cirrus = fbm(vec2(p.x * 2.4 - t * 0.07, p.y * 15.0));
  col += vec3(1.0, 0.86, 0.72) * smoothstep(0.52, 0.8, cirrus) * 0.2 * smoothstep(0.45, 0.9, p.y);

  // Four ranges, far to near. Each hides the ones behind and sheds snow downwind.
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float x = p.x * (1.5 + fi * 0.85) + fi * 7.3 + t * 0.004 * (fi + 1.0);
    float crest = 0.56 - fi * 0.115 + (fbm(vec2(x, fi * 3.1)) - 0.5) * (0.46 - fi * 0.075)
                + pow(abs(noise(vec2(x * 2.3, 5.0)) - 0.5) * 2.0, 2.0) * 0.06;
    float below = smoothstep(crest + 0.004, crest - 0.004, p.y);
    vec3 rock = mix(vec3(0.2, 0.42, 0.46), vec3(0.015, 0.05, 0.07), fi / 3.0);
    float snow = smoothstep(crest - 0.085, crest - 0.004, p.y) * smoothstep(0.4, 0.56, crest) * (0.45 + 0.55 * noise(vec2(p.x * 46.0, p.y * 64.0)));
    rock = mix(rock, vec3(0.94, 0.92, 0.88), snow * (0.8 - fi * 0.16));
    rock += glow * smoothstep(0.012, 0.0, abs(p.y - crest)) * 0.55 * (1.0 - fi / 4.0);
    col = mix(col, rock, below);

    float up = p.y - crest;
    float plume = fbm(vec2(p.x * 6.5 - t * (0.6 + 0.5 * power) - fi * 2.0, up * 20.0 + fi));
    float lee = smoothstep(0.0, 0.03, up) * smoothstep(0.2, 0.02, up) * smoothstep(0.4, 0.55, crest);
    col += vec3(1.0, 0.95, 0.9) * smoothstep(0.48, 0.8, plume) * lee * (0.4 + 0.3 * power);

    float mist = fbm(vec2(p.x * 2.0 + t * 0.05 * (fi + 1.0), fi * 9.0));
    col = mix(col, vec3(0.55, 0.72, 0.74), smoothstep(crest - 0.02, crest - 0.17, p.y) * mist * 0.24 * below);
  }
  // The wind itself: long, fast threads across the whole view.
  float thread = noise(vec2(p.x * 3.0 - t * 1.7, p.y * 76.0));
  col += vec3(1.0) * smoothstep(0.86, 0.98, thread) * noise(vec2(p.x * 2.0 - t * 0.5, p.y * 4.0)) * 0.16;
  return col;
}
vec3 cloth(vec2 uv, float t) {
  float gust = fbm(vec2(uv.x * 5.0 - t * 0.7, uv.y * 13.0));
  return tint(0.15) * 0.16 + tint(0.9) * smoothstep(0.5, 0.78, gust) * 0.42;
}`,
};

// Where the neckline sits in each pose, as a height up the figure's frame, and
// where the centre of his head falls on the canvas (x, y from the bottom).
const POSE: Record<CloakClass, { collar: number; head: [number, number] }> = {
  c: { collar: 0.3, head: [0.485, 0.36] },
  a: { collar: 0.3, head: [0.5, 0.37] },
  t: { collar: 0.31, head: [0.52, 0.365] },
};

const fragment = (klass: CloakClass) => `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPhoto;
uniform sampler2D uField;
uniform float uTime;
uniform float uPower;
uniform float uCollar;
uniform vec2 uHead;
${GLSL_COMMON}
${CLASS_GLSL[klass]}

void main() {
  vec2 p = vUv;
  float t = uTime;

  // ---- the figure, standing at the bottom of the frame. His cut-out is wider
  // than it is tall (1000 x 720), so that both shoulders are whole.
  float scale = 0.74;
  vec2 fuv = vec2((p.x - 0.5) / (scale * 1.3889) + 0.5, p.y * 1.25 / scale);
  float inFrame = step(0.0, fuv.x) * step(fuv.x, 1.0) * step(fuv.y, 1.0);
  vec4 photo = texture2D(uPhoto, fuv) * inFrame;
  float body = photo.a;
  float l = luma(photo.rgb);
  float halo = texture2D(uField, fuv).r * inFrame;

  // His own outline again, twice the size and set back: the coder's scene
  // builds its giant from this.
  vec2 big = (fuv - vec2(0.5, 0.42)) / 1.85 + vec2(0.5, 0.36);
  float twin = texture2D(uField, big).r * step(0.0, big.y) * step(big.y, 1.0) * step(0.0, big.x) * step(big.x, 1.0);

  vec3 world = scene(p, uHead, twin, t, uPower) * (0.86 + 0.14 * uPower);
  // He stands a little apart from it: the world dims just around him.
  world *= 1.0 - 0.34 * smoothstep(0.3, 0.8, halo) * (1.0 - body);

  // The cloak is the dark cloth below his chin: shirt and collar, never skin or hair.
  float below = 1.0 - smoothstep(uCollar, uCollar + 0.07, fuv.y);
  float fabric = body * below * (1.0 - smoothstep(0.1, 0.22, l));
  float rim = (1.0 - smoothstep(0.5, 0.98, halo)) * body;
  vec3 figure = mix(photo.rgb, cloth(fuv, t) + tint(0.85) * rim * 0.55, fabric * 0.9);
  // The scene's light catches the edge of him.
  figure += tint(0.8) * rim * (1.0 - fabric) * 0.16;

  // His chest dissolves into the scene instead of ending in a straight line,
  // and the whole picture fades out along its bottom edge, where the tile's text begins.
  float rooted = smoothstep(0.015, 0.2, p.y);
  float foot = smoothstep(0.0, 0.1, p.y);
  vec3 col = mix(world, figure, body * rooted);
  gl_FragColor = vec4(col * foot, foot);
}`;

/**
 * Ashish in front of one class's world, wearing its cloak.
 * `active` (a hovered tile, say) stirs the scene up.
 */
export function CloakedAvatar({ klass, active = false, className }: { klass: CloakClass; active?: boolean; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const [webgl, setWebgl] = useState(true);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  activeRef.current = active;

  useEffect(() => {
    const el = canvas.current;
    const box = wrap.current;
    if (!el || !box) return;
    const quad = createQuad(el, fragment(klass), 2);
    if (!quad) {
      setWebgl(false);
      return;
    }
    const { gl } = quad;
    gl.uniform1i(quad.uniform("uPhoto"), 0);
    gl.uniform1i(quad.uniform("uField"), 1);
    gl.uniform1f(quad.uniform("uCollar"), POSE[klass].collar);
    gl.uniform2f(quad.uniform("uHead"), ...POSE[klass].head);
    const uTime = quad.uniform("uTime");
    const uPower = quad.uniform("uPower");

    let ready = 0;
    let disposed = false;
    const sources = [`cloak-${klass}`, `cloak-${klass}-field`];
    sources.forEach((name, unit) => {
      void loadImage(`/hero/${name}.webp`).then((img) => {
        if (!img || disposed) return;
        quad.upload(unit, img);
        ready++;
      });
    });

    const resize = () => quad.resize(box.clientWidth, 1.5, box.clientHeight);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(box);
    let visible = false;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { rootMargin: "100px" });
    io.observe(box);

    let frame = 0;
    let power = 0;
    let drawnStill = false;
    // Offset each class so three side by side do not move in step.
    const t0 = performance.now() - { c: 0, a: 40000, t: 90000 }[klass];
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (ready < sources.length || !visible || document.hidden) return;
      const target = activeRef.current ? 1 : 0;
      power += (target - power) * 0.07;
      // With reduced motion the scene is a still image that only brightens on hover.
      if (reducedMotion && drawnStill && Math.abs(power - target) < 0.01) return;
      gl.uniform1f(uTime, reducedMotion ? 12.0 : (now - t0) / 1000);
      gl.uniform1f(uPower, power);
      quad.draw();
      drawnStill = true;
    };
    frame = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      io.disconnect();
      quad.dispose();
    };
  }, [klass, reducedMotion]);

  return (
    <div ref={wrap} className={cn("relative aspect-[4/5]", className)}>
      {webgl ? (
        <canvas ref={canvas} className="h-full w-full" aria-hidden />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/hero/cloak-${klass}.webp`} alt="" className="absolute inset-x-0 bottom-0 mx-auto w-3/4" />
      )}
    </div>
  );
}
