"use client";

import { useEffect, useRef } from "react";
import { pointer } from "@/lib/pointer";
import { audio } from "@/lib/audio/engine";
import { useExperience } from "@/lib/experience";

// The paper is about recognising handwritten Odia numerals, so the numerals
// themselves drift around it. They scatter from the cursor, and whichever is
// nearest gets "recognised": boxed, and labelled with the digit it stands for.
const NUMERALS = ["୦", "୧", "୨", "୩", "୪", "୫", "୬", "୭", "୮", "୯"];
const FONT = "'Noto Sans Oriya', 'Oriya Sangam MN', 'Nirmala UI', sans-serif";

type Glyph = { digit: number; x: number; y: number; vx: number; vy: number; size: number; spin: number; angle: number; seed: number };

export function OdiaField() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    let w = 0, h = 0;
    let glyphs: Glyph[] = [];
    const seedGlyphs = () => {
      // About one numeral per 15,000 px², so phones are not crowded.
      const count = Math.max(10, Math.min(34, Math.round((w * h) / 15000)));
      glyphs = Array.from({ length: count }, (_, i) => ({
        digit: i % 10,
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: 20 + Math.random() * 26,
        spin: (Math.random() - 0.5) * 0.004,
        angle: (Math.random() - 0.5) * 0.5,
        seed: Math.random() * 100,
      }));
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = el.getBoundingClientRect();
      if (Math.abs(r.width - w) < 1 && Math.abs(r.height - h) < 1) return;
      w = r.width;
      h = r.height;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedGlyphs();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);

    const styles = getComputedStyle(document.documentElement);
    const ink = `hsl(${styles.getPropertyValue("--ink")}`;
    const accent = `hsl(${styles.getPropertyValue("--primary")}`;

    let visible = false;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(el);

    let frame = 0;
    let recognised = -1;
    let drawn = false;
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (!visible || document.hidden) return;
      const rect = el.getBoundingClientRect();
      const mx = pointer.x - rect.left, my = pointer.y - rect.top;
      const inside = pointer.seen && mx > -60 && mx < w + 60 && my > -60 && my < h + 60;
      if (reducedMotion && drawn && !inside) return;

      ctx.clearRect(0, 0, w, h);
      let nearest = -1, best = 95;
      glyphs.forEach((g, i) => {
        if (!reducedMotion) {
          // A slow wander, plus a push away from the cursor.
          g.vx += Math.sin(now * 0.0004 + g.seed) * 0.0025;
          g.vy += Math.cos(now * 0.0003 + g.seed * 1.7) * 0.0025;
          if (inside) {
            const dx = g.x - mx, dy = g.y - my;
            const d = Math.hypot(dx, dy) || 1;
            if (d < 130) {
              const push = ((130 - d) / 130) * 0.5;
              g.vx += (dx / d) * push;
              g.vy += (dy / d) * push;
            }
          }
          g.vx *= 0.965;
          g.vy *= 0.965;
          g.x += g.vx;
          g.y += g.vy;
          g.angle += g.spin;
          // Drift off one edge, return on the other.
          if (g.x < -30) g.x = w + 30;
          if (g.x > w + 30) g.x = -30;
          if (g.y < -30) g.y = h + 30;
          if (g.y > h + 30) g.y = -30;
        }
        if (inside) {
          const d = Math.hypot(g.x - mx, g.y - my);
          if (d < best) {
            best = d;
            nearest = i;
          }
        }
      });

      glyphs.forEach((g, i) => {
        const hit = i === nearest;
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(hit ? 0 : g.angle);
        ctx.font = `${hit ? 600 : 400} ${g.size}px ${FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = hit ? `${accent})` : `${ink} / ${0.2 + (g.size - 20) / 110})`;
        ctx.fillText(NUMERALS[g.digit], 0, 0);
        if (hit) {
          // The recognition: a box around the numeral and the digit it reads as.
          const half = g.size * 0.72;
          ctx.strokeStyle = `${accent})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(-half, -half, half * 2, half * 2);
          ctx.font = "500 10px 'Geist Mono', ui-monospace, monospace";
          ctx.textAlign = "left";
          ctx.fillStyle = `${accent})`;
          ctx.fillRect(-half, -half - 15, 30, 15);
          ctx.fillStyle = "#0d0c0b";
          ctx.fillText(`= ${g.digit}`, -half + 5, -half - 7);
        }
        ctx.restore();
      });

      if (nearest !== recognised) {
        recognised = nearest;
        if (nearest >= 0) audio.tick(0.8 + glyphs[nearest].digit * 0.06);
      }
      drawn = true;
    };
    // Start once the Odia face is ready, so the first frame is not drawn in a fallback font.
    let cancelled = false;
    void document.fonts.load(`400 24px ${FONT}`, "୫").finally(() => {
      if (!cancelled) frame = requestAnimationFrame(draw);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      io.disconnect();
    };
  }, [reducedMotion]);

  return <canvas ref={canvas} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}
