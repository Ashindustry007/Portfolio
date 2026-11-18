"use client";

import { useEffect, useRef } from "react";
import { createQuad, GLSL_COMMON } from "@/components/hero/gl";
import { pointer } from "@/lib/pointer";
import { scrollState } from "@/lib/scroll";
import { useExperience } from "@/lib/experience";
import { fluidGuide } from "@/lib/fluid";
import { cn } from "@/lib/utils";

// A relief map drawn in contour lines; the whole sheet drifts as the page
// scrolls. The cursor's smoke (lib/fluid.ts) works out the same terrain and
// runs along these lines, so the formula for `h` must match the one there.
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uScroll;
uniform float uAspect;
uniform vec2 uMouse;
uniform vec3 uLine;
uniform vec3 uAccent;
uniform float uStrength;
${GLSL_COMMON}

void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  vec2 m = vec2(uMouse.x * uAspect, uMouse.y);
  float h = fbm(p * 2.1 + vec2(0.0, uScroll * 0.9) + uTime * 0.012);
  float d = distance(p, m);
  float bump = exp(-d * d * 22.0);

  float bands = h * 15.0;
  float line = 1.0 - smoothstep(0.0, 0.05, abs(fract(bands) - 0.5));
  // Every fifth contour is an index line, drawn a little stronger.
  float index = step(0.8, fract(floor(bands) / 5.0 + 0.1));
  float a = line * (0.1 + index * 0.1) * uStrength;
  vec3 col = mix(uLine, uAccent, clamp(bump * 1.6, 0.0, 1.0));
  a += line * bump * 0.22;
  // Fade toward the top and bottom so sections above and below read cleanly.
  a *= smoothstep(0.0, 0.12, vUv.y) * smoothstep(0.0, 0.12, 1.0 - vUv.y);
  gl_FragColor = vec4(col * a, a);
}`;

/** Fixed, full-viewport contour map, drawn in the page's ink and class colours. */
export function TopoField({ className, strength = 1 }: { className?: string; strength?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const quad = createQuad(el, FRAG, 0);
    if (!quad) return;
    const { gl } = quad;
    const u = {
      time: quad.uniform("uTime"), scroll: quad.uniform("uScroll"), aspect: quad.uniform("uAspect"),
      mouse: quad.uniform("uMouse"), line: quad.uniform("uLine"), accent: quad.uniform("uAccent"), strength: quad.uniform("uStrength"),
    };

    const hsl = (name: string): [number, number, number] => {
      const probe = document.createElement("span");
      probe.style.color = `hsl(${getComputedStyle(document.documentElement).getPropertyValue(name)})`;
      document.body.appendChild(probe);
      const rgb = getComputedStyle(probe).color.match(/[\d.]+/g)!.slice(0, 3).map((v) => Number(v) / 255) as [number, number, number];
      probe.remove();
      return rgb;
    };
    gl.uniform3f(u.line, ...hsl("--ink"));
    gl.uniform3f(u.accent, ...hsl("--class"));
    gl.uniform1f(u.strength, strength);

    const resize = () => {
      quad.resize(window.innerWidth, 1.25, window.innerHeight);
      gl.uniform1f(u.aspect, window.innerWidth / window.innerHeight);
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let mx = 0.5, my = 0.5;
    let drawn = false;
    fluidGuide.mode = 1;
    const render = () => {
      frame = requestAnimationFrame(render);
      if (document.hidden) return;
      const tx = pointer.seen ? pointer.x / window.innerWidth : 0.5;
      const ty = pointer.seen ? 1 - pointer.y / window.innerHeight : 0.5;
      // Reduced motion: a still map, redrawn only when the page scrolls.
      if (reducedMotion && drawn && Math.abs(scrollState.velocity) < 0.01) return;
      mx += (tx - mx) * 0.08;
      my += (ty - my) * 0.08;
      // Absolute time, so the smoke's copy of the terrain stays in step with this one.
      gl.uniform1f(u.time, reducedMotion ? 0 : performance.now() / 1000);
      gl.uniform1f(u.scroll, scrollState.y / window.innerHeight);
      gl.uniform2f(u.mouse, reducedMotion ? -2 : mx, reducedMotion ? -2 : my);
      quad.draw();
      drawn = true;
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      fluidGuide.mode = 0;
      window.removeEventListener("resize", resize);
      quad.dispose();
    };
  }, [reducedMotion, strength]);

  return <canvas ref={canvas} className={cn("pointer-events-none fixed inset-0 h-full w-full", className)} aria-hidden />;
}
