"use client";

import { useEffect, useRef } from "react";
import { createQuad, GLSL_COMMON } from "@/components/hero/gl";
import { pointer } from "@/lib/pointer";
import { scrollState } from "@/lib/scroll";
import { useExperience } from "@/lib/experience";
import { classes } from "@/lib/journey";
import { cn } from "@/lib/utils";

// The living backgrounds of the Coder and Artist pages, as the contour map
// (topo-field.tsx) is for the home page and the Traveller's. Each is one
// full-viewport shader that drifts with the scroll and answers the cursor.

/**
 * Paint in slow motion: colour folded through itself, stirred where the cursor
 * is. Also used inside the gallery walk (flow.tsx), so the same paint runs
 * behind the whole Artist page without a seam.
 */
export const PAINT_GLSL = `
vec3 paintTint(float k) { return 0.5 + 0.5 * cos(6.2832 * (k + vec3(0.0, 0.33, 0.67))); }
vec3 paint(vec2 uv, float aspect, float t, float scroll, vec2 mouse) {
  vec2 c = vec2(uv.x * aspect, uv.y - scroll * 0.22);
  vec2 q = c * 1.5;
  vec2 d = c - vec2(mouse.x * aspect, mouse.y - scroll * 0.22);
  q += vec2(-d.y, d.x) * exp(-dot(d, d) * 9.0) * 1.3;
  q += 0.6 * vec2(fbm(q * 1.3 + vec2(0.0, t * 0.05)), fbm(q * 1.3 + vec2(5.2, -t * 0.04)));
  q += 0.38 * vec2(fbm(q * 2.5 - t * 0.03), fbm(q * 2.5 + 3.7 + t * 0.03));
  float f = fbm(q * 1.6 - t * 0.05);
  float bands = sin(f * 17.0 - t * 0.3);
  vec3 col = paintTint(f * 1.5 + c.y * 0.2 - t * 0.02 + bands * 0.06);
  return col * (0.45 + 0.55 * smoothstep(-0.3, 0.9, bands));
}`;

const PAINT_FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uScroll;
uniform float uAspect;
uniform float uStrength;
uniform vec2 uMouse;
${GLSL_COMMON}
${PAINT_GLSL}
void main() {
  float a = uStrength;
  gl_FragColor = vec4(paint(vUv, uAspect, uTime, uScroll, uMouse) * a, a);
}`;

// Code falling in columns. It is faint until the cursor comes near, and then
// that patch of it lights up, as if the cursor were reading it.
const CODE_FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uScroll;
uniform float uAspect;
uniform float uStrength;
uniform vec2 uMouse;
uniform vec3 uTint;
${GLSL_COMMON}
float rain(vec2 uv, float t, float cols) {
  vec2 grid = vec2(cols, cols / uAspect);
  vec2 cell = floor(uv * grid);
  vec2 local = fract(uv * grid);
  float seed = hash(vec2(cell.x, 7.0));
  float head = fract(seed * 13.0 - t * (0.05 + seed * 0.14));
  float trail = pow(1.0 - fract(cell.y / grid.y - head), 6.0);
  vec2 bit = floor(local * vec2(4.0, 6.0));
  float on = step(0.46, hash(cell * 1.37 + bit + floor(t * (1.5 + seed * 3.0))));
  on *= step(bit.x, 2.5) * step(bit.y, 4.5);
  return on * (0.14 + trail * 1.4);
}
void main() {
  vec2 uv = vec2(vUv.x, vUv.y - uScroll * 0.12);
  float far = rain(uv, uTime, 92.0);
  float near = rain(uv + 0.37, uTime * 1.5, 56.0);
  vec2 d = vec2((vUv.x - uMouse.x) * uAspect, vUv.y - uMouse.y);
  float read = exp(-dot(d, d) * 16.0);
  float glow = far * 0.12 + near * (0.07 + read * 0.55);
  vec3 col = mix(uTint, vec3(0.7, 1.0, 0.86), clamp(near * read - 0.5, 0.0, 0.5)) * glow;
  // A soft pool of the class colour under the cursor, and a slow scan line.
  col += uTint * read * 0.07;
  col += uTint * smoothstep(0.004, 0.0, abs(fract(vUv.y + uTime * 0.03) - 0.5)) * 0.07;
  // Quieter toward the top and bottom, where the page's chrome sits.
  float a = uStrength * smoothstep(0.0, 0.14, vUv.y) * smoothstep(0.0, 0.14, 1.0 - vUv.y);
  gl_FragColor = vec4(col * a, max(col.r, max(col.g, col.b)) * a);
}`;

function Field({ fragment, strength, tint, className }: { fragment: string; strength: number; tint?: string; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const quad = createQuad(el, fragment, 0);
    if (!quad) return;
    const { gl } = quad;
    const u = { time: quad.uniform("uTime"), scroll: quad.uniform("uScroll"), aspect: quad.uniform("uAspect"), mouse: quad.uniform("uMouse"), tint: quad.uniform("uTint") };
    gl.uniform1f(quad.uniform("uStrength"), strength);

    // The colour to draw in. Passed in rather than read from the page, because
    // this mounts before the shell has switched the page's class colour.
    const probe = document.createElement("span");
    probe.style.color = `hsl(${tint ?? getComputedStyle(document.documentElement).getPropertyValue("--class")})`;
    document.body.appendChild(probe);
    const [r, g, b] = getComputedStyle(probe).color.match(/[\d.]+/g)!.slice(0, 3).map((v) => Number(v) / 255);
    probe.remove();
    if (u.tint) gl.uniform3f(u.tint, r, g, b);

    const resize = () => {
      quad.resize(window.innerWidth, 1.25, window.innerHeight);
      gl.uniform1f(u.aspect, window.innerWidth / window.innerHeight);
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0, mx = 0.5, my = 0.5, drawn = false;
    const render = () => {
      frame = requestAnimationFrame(render);
      if (document.hidden) return;
      // Reduced motion: a still field, redrawn only when the page scrolls.
      if (reducedMotion && drawn && Math.abs(scrollState.velocity) < 0.01) return;
      mx += ((pointer.seen ? pointer.x / window.innerWidth : 0.5) - mx) * 0.07;
      my += ((pointer.seen ? 1 - pointer.y / window.innerHeight : 0.5) - my) * 0.07;
      gl.uniform1f(u.time, reducedMotion ? 20 : performance.now() / 1000);
      gl.uniform1f(u.scroll, scrollState.y / window.innerHeight);
      gl.uniform2f(u.mouse, reducedMotion ? -2 : mx, reducedMotion ? -2 : my);
      quad.draw();
      drawn = true;
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      quad.dispose();
    };
  }, [fragment, strength, tint, reducedMotion]);

  return <canvas ref={canvas} className={cn("pointer-events-none fixed inset-0 h-full w-full", className)} aria-hidden />;
}

/** The Coder page's background: falling code that brightens where the cursor reads it. */
export function CodeField({ className, strength = 0.7 }: { className?: string; strength?: number }) {
  return <Field fragment={CODE_FRAG} strength={strength} tint={classes[0].color} className={className} />;
}

/** The Artist page's background: slow-moving paint, stirred by the cursor. */
export function PaintField({ className, strength = 0.2 }: { className?: string; strength?: number }) {
  return <Field fragment={PAINT_FRAG} strength={strength} className={className} />;
}
