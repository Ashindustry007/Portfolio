"use client";

import { useEffect, useRef } from "react";
import { levels } from "@/lib/journey";
import { useExperience } from "@/lib/experience";
import { cn } from "@/lib/utils";

/** One stop on the route. Tells the HUD and the music when it reaches the middle of the screen. */
export function LevelSection({ index, className, children }: { index: number; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const store = useExperience.getState();
        store.setLevel(index);
        if (index === 1) store.unlock("first-steps");
        if (index === levels.length - 1) store.unlock("end-of-the-road");
      },
      // A thin band across the middle of the viewport.
      { rootMargin: "-48% 0px -48% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div ref={ref} id={`level-${levels[index].id}`} data-level={index} className={cn("relative", className)}>
      {children}
    </div>
  );
}
