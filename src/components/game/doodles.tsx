"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Pen doodles and margin notes. Every stroke has pathLength 1 so it can draw
// itself on, and wears the #rough filter for a hand-drawn wobble.

const SHAPES = {
  arrow: { box: "0 0 120 60", d: ["M4 10c30 38 62 44 108 32", "M96 30l17 12-19 9"] },
  "arrow-down": { box: "0 0 60 110", d: ["M44 4C10 30 8 62 26 102", "M12 88l14 15 9-19"] },
  underline: { box: "0 0 200 20", d: ["M3 12c40-8 70-9 100-4s62 6 94-1"] },
  scribble: { box: "0 0 200 24", d: ["M3 14c22-12 30 10 50-2s28 10 48-2 30 10 50-2 26 8 46-3"] },
  circle: { box: "0 0 200 90", d: ["M22 50C18 22 70 6 112 8s78 18 72 44-56 34-98 32S26 76 22 50c-1-8 6-18 16-24"] },
  star: { box: "0 0 60 60", d: ["M30 5l7 18 19 1-15 12 5 19-16-11-16 11 5-19L4 24l19-1z"] },
  spark: { box: "0 0 60 60", d: ["M30 6v48", "M6 30h48", "M13 13l34 34", "M47 13L13 47"] },
  wave: { box: "0 0 160 50", d: ["M4 34c14-26 28-26 40-6s26 8 30-8", "M58 34c14-26 28-26 40-6s26 8 30-8", "M112 34c12-22 24-22 34-8"] },
  mountain: { box: "0 0 160 80", d: ["M4 74L52 14l24 34 18-20 62 46", "M40 30l12 12 12-8"] },
  paw: { box: "0 0 60 60", d: ["M18 40c0-9 6-14 12-14s12 5 12 14c0 6-5 8-12 8s-12-2-12-8z", "M12 26c-3-4-2-9 1-9s6 4 5 8-4 4-6 1z", "M24 17c-2-5 0-10 3-10s5 5 4 9-5 5-7 1z", "M37 16c0-5 2-9 5-9s4 5 2 9-6 4-7 0z", "M46 27c1-4 4-8 7-7s2 6-1 9-7 2-6-2z"] },
  camera: { box: "0 0 90 70", d: ["M8 22h18l6-10h26l6 10h18v40H8z", "M45 54a13 13 0 1 0 0-26 13 13 0 0 0 0 26z", "M70 30h5"] },
  brackets: { box: "0 0 110 60", d: ["M34 8L8 30l26 22", "M76 8l26 22-26 22", "M62 6L48 54"] },
  compass: { box: "0 0 80 80", d: ["M40 6a34 34 0 1 0 0 68 34 34 0 0 0 0-68z", "M52 28L46 46 28 52l6-18z", "M40 2v8M40 70v8M2 40h8M70 40h8"] },
  pin: { box: "0 0 50 70", d: ["M25 66C10 44 6 34 6 24a19 19 0 0 1 38 0c0 10-4 20-19 42z", "M25 31a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"] },
  box: { box: "0 0 200 120", d: ["M6 8c60-4 130-3 188 1 2 34 2 70-1 104-62 3-126 3-186-1-3-34-3-70-1-104z"] },
  bulb: { box: "0 0 60 80", d: ["M20 54c-8-8-12-16-12-25a22 22 0 0 1 44 0c0 9-4 17-12 25z", "M22 62h16M24 70h12", "M30 54V36l-6-6M30 36l6-6"] },
  chip: { box: "0 0 80 80", d: ["M20 20h40v40H20z", "M30 30h20v20H30z", "M28 20V8M40 20V8M52 20V8M28 72V60M40 72V60M52 72V60M8 28h12M8 40h12M8 52h12M60 28h12M60 40h12M60 52h12"] },
} as const;

export type DoodleName = keyof typeof SHAPES;

/** Adds `is-drawn` once the element scrolls into view, which starts its strokes drawing. */
export function useDrawOnView<T extends Element>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-drawn");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export function Doodle({ name, className, delay = 0, strokeWidth = 1.6 }: { name: DoodleName; className?: string; delay?: number; strokeWidth?: number }) {
  const ref = useDrawOnView<SVGSVGElement>();
  const shape = SHAPES[name];
  return (
    <svg ref={ref} viewBox={shape.box} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="none" className={cn("sketch-stroke pointer-events-none overflow-visible", className)} aria-hidden>
      {shape.d.map((d, i) => (
        <path key={i} d={d} pathLength={1} style={{ "--d": `${delay + i * 0.25}s` } as React.CSSProperties} />
      ))}
    </svg>
  );
}

/** A handwritten margin note, optionally with an arrow pointing at what it is about. */
export function Note({ children, className, arrow, arrowClassName }: { children: React.ReactNode; className?: string; arrow?: DoodleName; arrowClassName?: string }) {
  return (
    <span className={cn("pointer-events-none inline-flex items-center gap-2 font-hand text-xl leading-none text-primary", className)} aria-hidden>
      <span>{children}</span>
      {arrow && <Doodle name={arrow} className={cn("h-8 w-14 shrink-0", arrowClassName)} />}
    </span>
  );
}

/** Wraps a word or phrase in a pen circle or underline. */
export function Marked({ children, with: mark = "underline", className }: { children: React.ReactNode; with?: "underline" | "circle" | "scribble"; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <Doodle
        name={mark}
        className={cn("absolute text-primary", mark === "circle" ? "-inset-x-[12%] -inset-y-[22%] h-[144%] w-[124%]" : "inset-x-0 -bottom-[0.18em] h-[0.32em] w-full")}
        strokeWidth={mark === "circle" ? 1.4 : 2}
      />
    </span>
  );
}

/** A hand-ruled dimension line with a measurement, as on a drawing. */
export function Dimension({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("pointer-events-none flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-ink/35", className)} aria-hidden>
      <span className="h-2 w-px bg-current" />
      <span className="h-px flex-1 bg-current" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-current" />
      <span className="h-2 w-px bg-current" />
    </div>
  );
}
