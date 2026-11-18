"use client";

import { useEffect, useRef } from "react";
import { pointer } from "@/lib/pointer";
import { useExperience } from "@/lib/experience";

/** Drifts its children against the cursor. `depth` is the travel in pixels at the screen edge; negative moves with the cursor. */
export function Parallax({ depth = 12, className, children }: { depth?: number; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useExperience((s) => s.finePointer && !s.reducedMotion);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let x = 0, y = 0, frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      x += (-pointer.nx * depth - x) * 0.08;
      y += (-pointer.ny * depth - y) * 0.08;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, [depth, enabled]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
