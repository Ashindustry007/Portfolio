"use client";

import { useEffect, useRef } from "react";
import { pointer } from "@/lib/pointer";
import { useExperience } from "@/lib/experience";

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], input, textarea, select, summary, label';

/**
 * A dot for precise pointing, a ring that appears over things you can click,
 * and crosshair hairlines. The smoke that trails it is <FluidCursor />.
 *
 * Elements steer it with attributes:
 *   data-cursor="hidden"            hide it (e.g. over the figure's own lens)
 *   data-cursor-label="VIEW"        ring grows and shows a word
 *   data-cursor-variant="outline"   with a label: a thin ring, so what is under it stays visible
 *   data-crosshair                  on any ancestor: show the hairlines while inside
 * Links and buttons get the "link" state automatically.
 */
export function CustomCursor() {
  const finePointer = useExperience((s) => s.finePointer);
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const lineX = useRef<HTMLDivElement>(null);
  const lineY = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!finePointer) return;
    const el = root.current;
    if (!el) return;
    document.documentElement.classList.add("has-cursor");

    const over = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;
      const marked = target.closest<HTMLElement>("[data-cursor], [data-cursor-label]");
      const interactive = target.closest<HTMLElement>(INTERACTIVE);
      let state = "default";
      let text = "";
      if (marked?.dataset.cursor === "hidden") state = "hidden";
      else if (marked?.dataset.cursorLabel) {
        state = "label";
        text = marked.dataset.cursorLabel;
      } else if (interactive) state = "link";
      el.dataset.state = state;
      el.dataset.variant = (state === "label" && marked?.dataset.cursorVariant) || "";
      el.dataset.lines = target.closest("[data-crosshair]") ? "true" : "false";
      if (label.current && text) label.current.textContent = text;
    };
    const down = () => (el.dataset.pressed = "true");
    const up = () => (el.dataset.pressed = "false");
    const leave = () => (el.dataset.gone = "true");
    const enter = () => (el.dataset.gone = "false");

    document.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerup", up, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.addEventListener("pointerenter", enter);

    // The dot keeps up with the pointer; the ring trails behind it.
    let hx = pointer.x, hy = pointer.y, rx = pointer.x, ry = pointer.y;
    let started = false;
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!pointer.seen) return;
      if (!started) {
        started = true;
        hx = rx = pointer.x;
        hy = ry = pointer.y;
        el.dataset.gone = "false";
      }
      hx += (pointer.x - hx) * 0.5;
      hy += (pointer.y - hy) * 0.5;
      rx += (pointer.x - rx) * 0.18;
      ry += (pointer.y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${hx}px, ${hy}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (lineX.current) lineX.current.style.transform = `translate3d(0, ${hy}px, 0)`;
      if (lineY.current) lineY.current.style.transform = `translate3d(${hx}px, 0, 0)`;
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("has-cursor");
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.removeEventListener("pointerenter", enter);
    };
  }, [finePointer]);

  if (!finePointer) return null;

  return (
    <div ref={root} className="cursor-root" data-state="default" data-gone="true" aria-hidden>
      <div ref={lineX} className="cursor-line cursor-line-x" />
      <div ref={lineY} className="cursor-line cursor-line-y" />
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
