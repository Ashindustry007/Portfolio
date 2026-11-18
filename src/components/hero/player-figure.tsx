"use client";

import { useEffect, useRef, useState } from "react";
import manifest from "./manifest.json";
import { createQuad, GLSL_COMMON, loadImage } from "./gl";
import { pointer } from "@/lib/pointer";
import { useExperience } from "@/lib/experience";
import { audio } from "@/lib/audio/engine";
import { cn } from "@/lib/utils";

const COUNT = manifest.count;
const REST = manifest.rest;
const frameUrl = (i: number) => `/hero/f-${String(i).padStart(2, "0")}.webp`;

// Module scope survives client-side navigation, so coming back to "/" neither
// reloads the frames nor replays the entrance spin.
// Slots 0..REST are the spin; slot COUNT is the larger copy of the resting frame.
const frames: (HTMLImageElement | undefined)[] = new Array(COUNT + 1);
let loadStarted = false;
let introPlayed = false;
// Once the visitor has turned the figure themselves, it stops demonstrating.
let handled = false;
// The demonstration: every few seconds the head turns this many frames and back.
const NUDGE_FRAMES = 8;
const NUDGE_MS = 1900;
const NUDGE_GAP = 4200;
// The lens keeps the size it had when the figure was smaller, however large the figure gets.
const LENS_PX = 105;

function loadAssets(onProgress: (p: number) => void) {
  if (loadStarted) return;
  loadStarted = true;
  let done = 0;
  const total = COUNT + 1;
  const step = () => onProgress(++done / total);
  void loadImage("/hero/rest.webp").then((img) => {
    frames[COUNT] = img;
    step();
  });
  // Resting frame first: it is what the figure shows for nearly all of a visit.
  const order = [REST, ...Array.from({ length: COUNT }, (_, i) => i).filter((i) => i !== REST)];
  for (const i of order) {
    void loadImage(frameUrl(i)).then((img) => {
      frames[i] = img;
      step();
    });
  }
}

/** Live values for the hero's readouts; written every frame, read in animation frames. */
export const figureTelemetry = {
  frame: REST,
  count: COUNT,
  turn: 0,
  /** 0..1, how far into a demonstration turn the figure is (the hint's hand follows it). */
  nudge: 0,
  /** True once the visitor has turned the figure themselves. */
  handled: false,
};

// One pass draws the figure: the cut-out photograph, and a lens that swaps the
// photograph for a scribbled portrait.
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform float uMix;
uniform float uTime;
uniform float uLensOn;
uniform float uLensR;
uniform float uReveal;
uniform float uBoil;
uniform vec2 uLens;
uniform vec2 uTexel;
${GLSL_COMMON}

vec4 frame(vec2 uv) {
  return mix(texture2D(uA, uv), texture2D(uB, uv), uMix);
}
float tone(vec2 uv) {
  return luma(frame(uv).rgb);
}
float sobelTone(vec2 uv, vec2 px) {
  float tl = tone(uv + px * vec2(-1.0,  1.0));
  float tc = tone(uv + px * vec2( 0.0,  1.0));
  float tr = tone(uv + px * vec2( 1.0,  1.0));
  float ml = tone(uv + px * vec2(-1.0,  0.0));
  float mr = tone(uv + px * vec2( 1.0,  0.0));
  float bl = tone(uv + px * vec2(-1.0, -1.0));
  float bc = tone(uv + px * vec2( 0.0, -1.0));
  float br = tone(uv + px * vec2( 1.0, -1.0));
  float gx = (tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl);
  float gy = (tl + 2.0 * tc + tr) - (bl + 2.0 * bc + br);
  return length(vec2(gx, gy));
}
// Edge of the cut-out itself: gives the drawing a clean outline even where the
// black shirt meets nothing.
float outline(vec2 uv, vec2 px) {
  float l = frame(uv - vec2(px.x, 0.0)).a, r = frame(uv + vec2(px.x, 0.0)).a;
  float d = frame(uv - vec2(0.0, px.y)).a, u = frame(uv + vec2(0.0, px.y)).a;
  return length(vec2(r - l, u - d));
}

// One pass of the pen: the closed curves where a warped noise field crosses its
// midpoint. Different seeds give loops that cross each other like a tangle.
// Dividing by the field's slope keeps the stroke one even hairline throughout.
float field(vec2 q) {
  q += (vec2(noise(q * 0.6 + 11.3), noise(q * 0.6 + 47.1)) - 0.5) * 2.1;
  return noise(q);
}
float loops(vec2 p, float freq, vec2 seed, float width) {
  vec2 q = p * freq + seed;
  float n = field(q);
  vec2 slope = vec2(field(q + vec2(0.03, 0.0)) - n, field(q + vec2(0.0, 0.03)) - n) / 0.03;
  float away = abs(n - 0.5) / max(length(slope), 0.08) / freq;
  return 1.0 - smoothstep(width * 0.45, width, away);
}
// Roughly how close a point outside the figure is to it.
float halo(vec2 uv) {
  float a = 0.0;
  a += frame(uv + vec2( 0.07,  0.00)).a + frame(uv + vec2(-0.07,  0.00)).a;
  a += frame(uv + vec2( 0.00,  0.07)).a + frame(uv + vec2( 0.00, -0.07)).a;
  a += frame(uv + vec2( 0.05,  0.05)).a + frame(uv + vec2(-0.05,  0.05)).a;
  a += frame(uv + vec2( 0.05, -0.05)).a + frame(uv + vec2(-0.05, -0.05)).a;
  return a / 8.0;
}

void main() {
  vec2 uv = vUv;

  vec4 f = frame(uv);
  float body = f.a;
  float l = luma(f.rgb);

  // The figure wipes in from the top when it first appears, and its cut-off
  // shoulders fade out at the bottom instead of ending in a straight line.
  float sweep = smoothstep(1.0 - uReveal * 1.25, 1.0 - uReveal * 1.25 + 0.14, vUv.y);
  float foot = smoothstep(0.02, 0.2, vUv.y);
  // A shoulder that reaches the side of the frame fades out rather than being cut.
  float sides = smoothstep(0.0, 0.07, vUv.x) * smoothstep(0.0, 0.07, 1.0 - vUv.x);
  float photoAlpha = body * sweep * foot * sides;

  // ---- lens
  float dist = distance(vUv, uLens);
  // The lens dissolves at the edge of the frame instead of being sliced by it.
  float inset = smoothstep(0.0, 0.09, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
  float lens = (1.0 - smoothstep(uLensR - 0.004, uLensR, dist)) * uLensOn * inset;
  float ring = (smoothstep(uLensR - 0.007, uLensR - 0.003, dist) - smoothstep(uLensR, uLensR + 0.003, dist)) * uLensOn * inset;

  // ---- scribble portrait, seen through the lens
  // Drawn the way a continuous-line scribble is: tangles of looping strokes,
  // sparse and wide in the shadows, tight and piled up where the light falls,
  // with loose loops running past the outline. Orange ink on black.
  vec3 sketch = vec3(0.03, 0.026, 0.024);
  // Only worked out under the lens; it is the costly part of the frame.
  if (lens > 0.001) {
    vec2 drift = vec2(uTime * 0.01, -uTime * 0.008) * uBoil;
    float t = pow(l, 0.6) * body;
    float w = 0.0019;
    float ink = 0.0;
    ink += loops(uv,  6.0, vec2( 3.1, 17.7) + drift, w) * smoothstep(0.03, 0.10, t);
    ink += loops(uv,  9.0, vec2(41.3,  5.9) - drift, w) * smoothstep(0.07, 0.16, t);
    ink += loops(uv, 13.0, vec2( 9.4, 63.2) + drift, w) * smoothstep(0.13, 0.24, t);
    ink += loops(uv, 18.0, vec2(77.7, 28.4) - drift, w) * smoothstep(0.20, 0.32, t);
    ink += loops(uv, 24.0, vec2(15.2, 91.6) + drift, w) * smoothstep(0.28, 0.42, t);
    ink += loops(uv, 31.0, vec2(58.8, 44.1) - drift, w) * smoothstep(0.36, 0.52, t);
    ink += loops(uv, 39.0, vec2(23.5,  8.3) + drift, w) * smoothstep(0.46, 0.62, t);
    ink += loops(uv, 48.0, vec2(88.1, 71.4) - drift, w) * smoothstep(0.56, 0.72, t);
    ink += loops(uv, 58.0, vec2(34.9, 52.6) + drift, w) * smoothstep(0.66, 0.84, t);

    // The features themselves, gone over twice with a slightly unsteady hand.
    vec2 w1 = (vec2(noise(uv * 26.0 + 3.0), noise(uv * 26.0 + 19.0)) - 0.5) * uTexel * 3.0;
    vec2 w2 = (vec2(noise(uv * 21.0 + 51.0), noise(uv * 21.0 + 7.0)) - 0.5) * uTexel * 4.2;
    float c1 = smoothstep(0.4, 0.62, sobelTone(uv + w1, uTexel * 0.6) / (l + 0.28)) * body;
    float c2 = smoothstep(0.44, 0.68, sobelTone(uv + w2, uTexel * 0.6) / (l + 0.28)) * body;
    float o1 = smoothstep(0.3, 0.7, outline(uv + w1, uTexel * 0.9));
    float o2 = smoothstep(0.3, 0.7, outline(uv + w2 * 1.6, uTexel * 0.9));
    ink += c1 * 0.85 + c2 * 0.55 + o1 * 0.85 + o2 * 0.55;

    // Stray loops that wander off the figure.
    float near = halo(uv) * (1.0 - body);
    ink += loops(uv, 4.5, vec2(66.6, 12.1) + drift, w) * smoothstep(0.04, 0.35, near);
    ink += loops(uv, 7.5, vec2( 2.2, 37.9) - drift, w) * smoothstep(0.15, 0.55, near);
    ink += loops(uv, 3.0, vec2(12.7, 80.3) + drift, w) * smoothstep(0.02, 0.2, near) * 0.7;

    // Where strokes pile up the orange runs hot.
    sketch += vec3(1.0, 0.45, 0.03) * min(ink, 1.0) * 0.92 + vec3(1.0, 0.7, 0.4) * clamp(ink - 1.0, 0.0, 2.0) * 0.22;
  }

  vec3 color = mix(f.rgb * 1.06, sketch, lens);
  float alpha = mix(photoAlpha, 1.0, lens);
  color = mix(color, vec3(1.0, 0.5, 0.0), ring);
  alpha = max(alpha, ring);

  gl_FragColor = vec4(color * alpha, alpha);
}`;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The player model. It spins once on entry (the real frames) and then rests.
 * Dragging or scrolling sideways spins it by hand (and until someone does, it
 * keeps demonstrating a small turn), and the cursor carries a lens that shows it as an
 * orange scribble on black. The whole card leans slightly toward the cursor;
 * the portrait itself is never warped.
 */
export function PlayerFigure({ className }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [webgl, setWebgl] = useState(true);
  const [dragging, setDragging] = useState(false);
  const entered = useExperience((s) => s.entered);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  useEffect(() => {
    loadAssets((p) => useExperience.getState().setAssetProgress(p));
  }, []);

  useEffect(() => {
    const el = canvas.current;
    const box = wrap.current;
    if (!el || !box) return;
    const quad = createQuad(el, FRAG, 2);
    if (!quad) {
      setWebgl(false);
      return;
    }
    const { gl } = quad;
    const u = {
      mix: quad.uniform("uMix"), time: quad.uniform("uTime"),
      lensOn: quad.uniform("uLensOn"), lensR: quad.uniform("uLensR"), reveal: quad.uniform("uReveal"),
      boil: quad.uniform("uBoil"), lens: quad.uniform("uLens"),
    };
    gl.uniform1i(quad.uniform("uA"), 0);
    gl.uniform1i(quad.uniform("uB"), 1);
    gl.uniform2f(quad.uniform("uTexel"), 1 / manifest.size, 1 / manifest.size);

    const uploaded = [-1, -1];
    const upload = (unit: number, index: number) => {
      const img = frames[index];
      if (!img || uploaded[unit] === index) return !!img;
      quad.upload(unit, img);
      uploaded[unit] = index;
      return true;
    };

    const resize = () => quad.resize(box.clientWidth);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(box);

    // ---- state driven outside React: position in the spin, lean, lens
    const state = useExperience.getState();
    const skipIntro = introPlayed || state.reducedMotion || state.returning;
    let pos = skipIntro ? REST : 0;
    let spin: { from: number; to: number; start: number; duration: number; ease: (t: number) => number } | null = null;
    let revealStart = 0;
    let reveal = skipIntro ? 1 : 0;
    let lean = 0;
    let mx = 0, my = 0;
    let lensOn = 0, lx = 0.5, ly = 0.5;
    let drag: { x: number; pos: number; moved: number } | null = null;
    let lastStep = Math.round(pos);
    let started = skipIntro;
    let visible = true;
    const boil = state.reducedMotion ? 0 : 1;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Until the visitor turns it, the figure shows that it can: the cursor reads
    // DRAG over it, and every few seconds the head turns partway and back.
    if (state.unlocked.includes("turntable")) handled = true;
    figureTelemetry.handled = handled;
    let nudge: { start: number } | null = null;
    let nudgeAt = 0;
    let insideLast = false;
    if (!handled) {
      el.setAttribute("data-cursor-label", "‹ Drag ›");
      el.setAttribute("data-cursor-variant", "outline");
    }
    const markHandled = () => {
      if (handled) return;
      handled = true;
      figureTelemetry.handled = true;
      figureTelemetry.nudge = 0;
      nudge = null;
      el.removeAttribute("data-cursor-label");
      el.removeAttribute("data-cursor-variant");
      // Let the cursor drop the label now rather than when the pointer next crosses an edge.
      el.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
    };

    // The clip runs one way only and the figure rests on its last frame, so a
    // gesture that would carry it past the end turns it back into the clip
    // instead: dragging or swiping either way turns the head.
    const reflect = (v: number) => clamp(v > REST ? 2 * REST - v : v, 0, REST);

    // The lens shows only while the pointer is on the figure itself, not on the
    // name or class list laid over its edges.
    let over = false;
    const onEnter = () => (over = true);
    const onLeave = () => (over = false);

    // Let go of the figure and it turns back to face the camera.
    const settle = () => {
      const distance = REST - pos;
      if (distance > 0.01) spin = { from: pos, to: REST, start: performance.now(), duration: 500 + distance * 34, ease: easeOut };
    };

    const begin = () => {
      if (started) return;
      started = true;
      introPlayed = true;
      revealStart = performance.now() + 200;
      spin = { from: 0, to: REST, start: performance.now() + 700, duration: 3000, ease: easeInOut };
    };
    if (state.entered && !skipIntro) begin();
    const unsubscribe = useExperience.subscribe((s, prev) => {
      if (s.entered && !prev.entered) begin();
    });

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(box);

    const onDown = (e: PointerEvent) => {
      if (!started) return;
      spin = null;
      nudge = null;
      figureTelemetry.nudge = 0;
      drag = { x: e.clientX, pos, moved: 0 };
      el.setPointerCapture(e.pointerId);
      setDragging(true);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const delta = ((e.clientX - drag.x) / box.clientWidth) * COUNT * 0.9;
      // Dragging right turns the model back through its spin; the clip is not a
      // closed loop, so it stops at either end rather than wrapping.
      pos = reflect(drag.pos - delta);
      drag.moved = Math.max(drag.moved, Math.abs(delta));
      if (drag.moved > 0.5) markHandled();
    };
    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      if (drag.moved > 10) useExperience.getState().unlock("turntable");
      drag = null;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      setDragging(false);
      settle();
    };

    // Scrolling sideways over the figure turns it too: a two-finger swipe on a
    // trackpad, or Shift and the wheel on a mouse. Up-and-down scrolling still
    // scrolls the page. Fingers moving right turn it the same way a rightward drag does.
    let wheeling = false;
    let wheelMoved = 0;
    let wheelTimer = 0;
    let wheelAt = 0; // where the swipe has carried it, before reflecting at the clip's end
    const onWheel = (e: WheelEvent) => {
      if (!started) return;
      const sideways = e.shiftKey ? e.deltaX || e.deltaY : Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
      if (!sideways) return;
      // Keep the swipe from reaching the page: no smooth-scroll, no browser back gesture.
      e.preventDefault();
      e.stopPropagation();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? box.clientWidth : 1;
      const step = ((sideways * unit) / box.clientWidth) * COUNT * 0.9;
      spin = null;
      nudge = null;
      figureTelemetry.nudge = 0;
      if (!wheeling) wheelAt = pos;
      wheelAt = clamp(wheelAt + step, 0, 2 * REST);
      pos = reflect(wheelAt);
      wheeling = true;
      wheelMoved += Math.abs(step);
      if (wheelMoved > 0.5) markHandled();
      window.clearTimeout(wheelTimer);
      // Hold the pose briefly after the swipe (and its momentum) ends, then turn back.
      wheelTimer = window.setTimeout(() => {
        if (wheelMoved > 10) useExperience.getState().unlock("turntable");
        wheeling = false;
        wheelMoved = 0;
        settle();
      }, 650);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    let frame = 0;
    const t0 = performance.now();
    let last = t0;
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      // Easing by elapsed time, so motion feels the same at 60Hz, 120Hz or a struggling 20.
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const ease = (rate: number) => 1 - Math.exp(-dt * rate);

      if (spin) {
        const t = clamp((now - spin.start) / spin.duration, 0, 1);
        pos = spin.from + (spin.to - spin.from) * spin.ease(t);
        if (t >= 1) spin = null;
      }
      if (revealStart && reveal < 1) reveal = clamp((now - revealStart) / 900, 0, 1);

      // The demonstration turn, silent, and never while the cursor is on the figure.
      if (!handled && boil && started && reveal >= 1 && !spin && !drag && !wheeling) {
        if (!nudge) {
          if (!nudgeAt) nudgeAt = now + 1200;
          if (now >= nudgeAt && !insideLast) nudge = { start: now };
        }
        if (nudge) {
          const t = (now - nudge.start) / NUDGE_MS;
          const s = t >= 1 ? 0 : Math.sin(Math.PI * easeInOut(t));
          pos = REST - NUDGE_FRAMES * s;
          figureTelemetry.nudge = s;
          if (t >= 1) {
            nudge = null;
            nudgeAt = now + NUDGE_GAP;
          }
        }
      }

      // A soft ratchet as the turntable passes each frame.
      const stepNow = Math.round(pos);
      if (stepNow !== lastStep) {
        lastStep = stepNow;
        if (spin || drag || wheeling) audio.tick(0.7 + (stepNow / REST) * 0.6);
      }

      const rect = box.getBoundingClientRect();
      const resting = !spin && !drag && !wheeling && Math.abs(pos - REST) < 0.01;
      lean += ((resting ? 1 : 0) - lean) * ease(3.8);

      // The card leans toward the cursor, or sways slowly when there is none to follow.
      let tx: number, ty: number;
      const idle = !pointer.seen || now - pointer.lastMove > 5000;
      if (idle) {
        const s = (now - t0) / 1000;
        tx = Math.sin(s * 0.45) * 0.55;
        ty = Math.sin(s * 0.31 + 1.0) * 0.3;
      } else {
        tx = clamp((pointer.x - (rect.left + rect.width / 2)) / (window.innerWidth * 0.5), -1, 1);
        ty = clamp((pointer.y - (rect.top + rect.height * 0.4)) / (window.innerHeight * 0.5), -1, 1);
      }
      mx += (tx - mx) * ease(4.5);
      my += (ty - my) * ease(4.5);

      const inside = (over || !!drag) && pointer.seen && pointer.x > rect.left && pointer.x < rect.right && pointer.y > rect.top && pointer.y < rect.bottom;
      insideLast = inside && !idle;
      // With a mouse the lens follows the cursor; on touch it shows only while a finger is down.
      const lensWanted = inside && !idle && (fine || pointer.down);
      lensOn += ((lensWanted ? 1 : 0) - lensOn) * ease(9);
      if (inside) {
        lx = (pointer.x - rect.left) / rect.width;
        ly = 1 - (pointer.y - rect.top) / rect.height;
      }

      if (tilt.current && boil) {
        tilt.current.style.transform = `rotateY(${(mx * 6 * lean).toFixed(2)}deg) rotateX(${(-my * 4 * lean).toFixed(2)}deg)`;
      }

      figureTelemetry.frame = stepNow;
      // The clip is one full turn, so position along it reads as an angle.
      figureTelemetry.turn = (1 - pos / REST) * 360;

      // At rest, draw from the larger copy; while turning, blend neighbouring spin frames.
      const still = resting && !!frames[COUNT];
      const a = still ? COUNT : Math.floor(pos);
      const b = still ? COUNT : Math.min(REST, a + 1);
      if (!upload(0, a)) return;
      upload(1, b);

      gl.uniform1f(u.mix, uploaded[1] === b ? pos - a : 0);
      gl.uniform1f(u.time, (now - t0) / 1000);
      gl.uniform1f(u.lensOn, lensOn);
      gl.uniform1f(u.lensR, Math.min(LENS_PX, rect.width * 0.165) / Math.max(1, rect.width));
      gl.uniform1f(u.reveal, reveal);
      gl.uniform1f(u.boil, boil);
      gl.uniform2f(u.lens, lx, ly);
      quad.draw();
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      observer.disconnect();
      io.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      window.clearTimeout(wheelTimer);
      figureTelemetry.nudge = 0;
      quad.dispose();
    };
  }, [reducedMotion]);

  return (
    <div ref={wrap} className={cn("relative aspect-square select-none", className)} style={{ perspective: "900px" }}>
      {/* The studio light the portrait was shot in: warm from the left, cool from the right. */}
      <div className="figure-glow pointer-events-none absolute inset-0" aria-hidden />
      <div ref={tilt} className="relative h-full w-full will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        {webgl ? (
          <canvas
            ref={canvas}
            role="img"
            aria-label="Portrait of Ashish. Drag or scroll sideways to rotate it."
            className={cn("h-full w-full touch-pan-y transition-opacity duration-700", entered ? "opacity-100" : "opacity-0", dragging ? "cursor-grabbing" : "cursor-grab")}
          />
        ) : (
          // No WebGL: the resting cut-out as a plain image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/hero/rest.webp" alt="Portrait of Ashish" className="h-full w-full object-cover" />
        )}
      </div>
    </div>
  );
}
