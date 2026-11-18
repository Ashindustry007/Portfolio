"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "@/lib/experience";
import { cn } from "@/lib/utils";

/**
 * Leans toward the cursor in 3D and carries a soft highlight under it.
 * Children can sit at different depths with `[transform:translateZ(…)]`.
 */
export function TiltCard({ max = 7, className, children, onHover }: { max?: number; className?: string; children: React.ReactNode; onHover?: (inside: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useExperience((s) => s.finePointer && !s.reducedMotion);
  const hover = useRef(onHover);
  hover.current = onHover;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rx = 0, ry = 0, tx = 0, ty = 0, frame = 0, running = false;

    const tick = () => {
      rx += (tx - rx) * 0.12;
      ry += (ty - ry) * 0.12;
      el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      if (Math.abs(tx - rx) + Math.abs(ty - ry) > 0.02) frame = requestAnimationFrame(tick);
      else running = false;
    };
    const kick = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      if (!enabled) return;
      ty = (px - 0.5) * 2 * max;
      tx = -(py - 0.5) * 2 * max;
      kick();
    };
    const enter = () => hover.current?.(true);
    const leave = () => {
      hover.current?.(false);
      tx = ty = 0;
      kick();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [enabled, max]);

  return (
    <div ref={ref} className={cn("tilt-card relative will-change-transform", className)} style={{ transformStyle: "preserve-3d" }}>
      {children}
      <div className="tilt-glare pointer-events-none absolute inset-0" aria-hidden />
    </div>
  );
}
