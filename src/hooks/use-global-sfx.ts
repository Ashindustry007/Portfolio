"use client";

import { useEffect } from "react";
import { audio } from "@/lib/audio/engine";

const TARGETS = 'a, button, [role="button"], [role="tab"], summary, [data-sfx]';

/**
 * Gives every interactive element a hover and click sound from one pair of
 * document listeners, so new links and buttons are covered without extra code.
 * Opt out with data-sfx="none". The hover note follows the element's
 * horizontal position, so sweeping across a row plays up the scale.
 */
export function useGlobalSfx() {
  useEffect(() => {
    let last: Element | null = null;

    const find = (target: EventTarget | null) => {
      const el = (target as Element | null)?.closest?.<HTMLElement>(TARGETS) ?? null;
      return el?.dataset.sfx === "none" ? null : el;
    };

    const over = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const el = find(e.target);
      if (el === last) return;
      last = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      audio.hover((r.left + r.width / 2) / window.innerWidth);
    };
    const down = (e: PointerEvent) => {
      if (find(e.target)) audio.click();
    };
    const focus = (e: FocusEvent) => {
      const el = find(e.target);
      if (!el || !el.matches(":focus-visible")) return;
      const r = el.getBoundingClientRect();
      audio.hover((r.left + r.width / 2) / window.innerWidth);
    };

    document.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("focusin", focus);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("focusin", focus);
    };
  }, []);
}
