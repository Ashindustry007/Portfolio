"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { readNativeScroll, scrollState, setLenis, startLenis, stopLenis } from "@/lib/scroll";
import { useExperience } from "@/lib/experience";
import { audio } from "@/lib/audio/engine";

/** Eased scrolling, and the one place that publishes scroll position for the HUD, world and music. */
export function SmoothScroll() {
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const ready = useExperience((s) => s.ready);
  const entered = useExperience((s) => s.entered);
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;

    if (reducedMotion) {
      readNativeScroll();
      const onScroll = () => readNativeScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
    setLenis(lenis);
    let frame = 0;
    let n = 0;
    const raf = (time: number) => {
      frame = requestAnimationFrame(raf);
      lenis.raf(time);
      scrollState.y = lenis.scroll;
      scrollState.limit = Math.max(1, lenis.limit);
      scrollState.progress = Math.min(1, Math.max(0, lenis.scroll / scrollState.limit));
      scrollState.velocity = lenis.velocity;
      if (++n % 6 === 0) audio.setEnergy(Math.abs(lenis.velocity) / 45);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      setLenis(null);
    };
  }, [ready, reducedMotion]);

  // The page stays put behind the start gate.
  useEffect(() => {
    if (entered) startLenis();
    else stopLenis();
  }, [entered, ready, reducedMotion]);

  // A new page has a new height; let the scroller re-measure once it has painted.
  useEffect(() => {
    const id = setTimeout(() => window.dispatchEvent(new Event("resize")), 120);
    return () => clearTimeout(id);
  }, [pathname]);

  return null;
}
