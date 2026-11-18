"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initPointer } from "@/lib/pointer";
import { useExperience } from "@/lib/experience";
import { useGlobalSfx } from "@/hooks/use-global-sfx";
import { audio } from "@/lib/audio/engine";
import { SmoothScroll } from "@/components/shell/smooth-scroll";
import { CustomCursor } from "@/components/shell/custom-cursor";
import { FluidCursor } from "@/components/shell/fluid-cursor";
import { Hud } from "@/components/shell/hud";
import { StartGate } from "@/components/shell/start-gate";
import { Toaster } from "@/components/ui/toaster";
import { PenFilter } from "@/components/game/sketch-image";

// Each sub-page dresses the whole site, HUD included, in its own palette.
const PAGE_LOOK: Record<string, { theme: string; klass: string }> = {
  "/courses": { theme: "dark", klass: "c" },
  "/photography": { theme: "dark", klass: "a" },
  "/travels": { theme: "dark", klass: "t" },
};

const CLASS_ACHIEVEMENT: Record<string, string> = {
  "/courses": "coder",
  "/photography": "artist",
  "/travels": "traveller",
};

/**
 * Everything that must outlive a page change lives here, in the root layout:
 * the cursor, the HUD, smooth scrolling and the audio, so music keeps playing
 * while the visitor moves between pages.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const entered = useExperience((s) => s.entered);
  const first = useRef(true);

  useEffect(() => {
    initPointer();
    useExperience.getState().hydrate();
  }, []);

  useGlobalSfx();

  useEffect(() => {
    // Only the home page has an opening scene worth waiting for at the gate.
    if (pathname !== "/") useExperience.getState().setAssetProgress(1);
    if (first.current) {
      first.current = false;
      return;
    }
    audio.whoosh();
  }, [pathname]);

  useEffect(() => {
    const look = PAGE_LOOK[pathname];
    document.documentElement.dataset.theme = look?.theme ?? "dark";
    document.documentElement.dataset.class = look?.klass ?? "";
  }, [pathname]);

  useEffect(() => {
    const id = CLASS_ACHIEVEMENT[pathname];
    if (!id || !entered) return;
    const timer = setTimeout(() => useExperience.getState().unlock(id), 1200);
    return () => clearTimeout(timer);
  }, [pathname, entered]);

  return (
    <>
      <PenFilter />
      <SmoothScroll />
      {children}
      <Hud />
      <StartGate />
      <FluidCursor />
      <CustomCursor />
      <Toaster />
    </>
  );
}
