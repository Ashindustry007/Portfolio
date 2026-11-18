"use client";

import { useEffect, useRef } from "react";
import { pointer } from "@/lib/pointer";
import { cn } from "@/lib/utils";

/** The line-art cat. With `alive`, its pupils follow the cursor. */
export function CatMark({ className, alive = false, draw = false }: { className?: string; alive?: boolean; draw?: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const eyes = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!alive) return;
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const el = svg.current;
      const g = eyes.current;
      if (!el || !g || !pointer.seen) return;
      const r = el.getBoundingClientRect();
      const dx = pointer.x - (r.left + r.width / 2);
      const dy = pointer.y - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, d / 240) * 1.1;
      g.style.transform = `translate(${(dx / d) * reach}px, ${(dy / d) * reach}px)`;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [alive]);

  return (
    <svg ref={svg} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={cn(draw && "line-draw", className)} aria-hidden>
      <path pathLength={1} d="M6.2 13.5 7.4 4.6l5.5 4.5a11.6 11.6 0 0 1 6.2 0l5.5-4.5 1.2 8.9c1.4 5.2-.6 9.6-4.4 12.1-3.2 2.1-7.6 2.1-10.8 0-3.800-2.500-5.800-6.900-4.400-12.100Z" />
      <path pathLength={1} d="M14.6 20.300 16 21.600l1.400-1.300M16 21.600v1.700" />
      <path pathLength={1} d="M3 17.500l4.200.900M3.400 21.600l4-.6M29 17.500l-4.200.900M28.600 21.600l-4-.6" opacity=".55" />
      <g ref={eyes} style={{ transition: "transform 120ms linear" }}>
        <circle cx="12.200" cy="16.200" r="1.150" fill="currentColor" stroke="none" />
        <circle cx="19.800" cy="16.200" r="1.150" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
