"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createFluid, type Fluid } from "@/lib/fluid";
import { scrollState } from "@/lib/scroll";
import { useExperience } from "@/lib/experience";

/** The page's accent colour (the class colour on a class page) as 0..1 RGB. */
function accent(): [number, number, number] {
  const probe = document.createElement("span");
  probe.style.color = `hsl(${getComputedStyle(document.documentElement).getPropertyValue("--class")})`;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color.match(/[\d.]+/g)!.slice(0, 3).map((v) => Number(v) / 255) as [number, number, number];
  probe.remove();
  return rgb;
}

/**
 * Smoke that follows the pointer, over everything. Only for a mouse or
 * trackpad, and not when the visitor has asked for reduced motion.
 */
export function FluidCursor() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const fluid = useRef<Fluid | null>(null);
  const pathname = usePathname();
  const enabled = useExperience((s) => s.finePointer && !s.reducedMotion);

  useEffect(() => {
    const el = canvas.current;
    if (!el || !enabled) return;
    let made = false;
    // Built on the first move, so a visitor who never moves the pointer pays nothing.
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (!made) {
        made = true;
        fluid.current = createFluid(el, { scroll: () => scrollState.y / window.innerHeight });
        fluid.current?.setTint(accent());
      }
      fluid.current?.move(e.clientX, e.clientY);
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "touch") fluid.current?.burst(e.clientX, e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      fluid.current?.dispose();
      fluid.current = null;
    };
  }, [enabled]);

  // Each class page has its own colour; the shell sets it just after the route changes.
  useEffect(() => {
    const id = setTimeout(() => fluid.current?.setTint(accent()), 60);
    return () => clearTimeout(id);
  }, [pathname]);

  if (!enabled) return null;
  return <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[9998] h-full w-full" aria-hidden />;
}
