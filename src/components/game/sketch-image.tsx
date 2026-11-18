"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Defined once in the shell. Turns any image into a scribble: grey it, find the
 * edges, shake them, and ink them orange on black.
 */
export function PenFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <filter id="pen" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feColorMatrix type="saturate" values="0" />
          <feGaussianBlur stdDeviation="0.7" />
          <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" result="edges" />
          {/* Two unsteady passes over the same lines, like a scribble gone over twice. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="11" result="shake" />
          <feDisplacementMap in="edges" in2="shake" scale="6" xChannelSelector="R" yChannelSelector="G" result="pass1" />
          <feDisplacementMap in="edges" in2="shake" scale="-5" xChannelSelector="G" yChannelSelector="R" result="pass2" />
          <feComposite in="pass1" in2="pass2" operator="arithmetic" k2="1" k3="0.8" />
          {/* Lines become orange ink; everything else stays black. */}
          <feColorMatrix type="matrix" values="5.5 0 0 0 0.03  2.6 0 0 0 0.027  0.3 0 0 0 0.025  0 0 0 1 0" />
        </filter>
        {/* A slight wobble for hand-drawn strokes and boxes. */}
        <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "className"> & {
  className?: string;
  imgClassName?: string;
  /** Lens radius in pixels. */
  lens?: number;
};

/**
 * An image the cursor can see through: under the pointer, a lens shows the same
 * picture as an orange scribble. The same trick as the hero figure, for any image.
 */
export function SketchImage({ className, imgClassName, lens = 110, alt = "", ...img }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  // The filtered copy exists only while the cursor is over the image. Leaving it
  // in the page hidden is not safe: a GPU-composited filter can still paint a
  // hidden element as a solid sheet, which blacked the photo out.
  const [hot, setHot] = useState(false);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--lx", `${e.clientX - r.left}px`);
    el.style.setProperty("--ly", `${e.clientY - r.top}px`);
  };

  return (
    <span ref={ref} onPointerMove={move} onPointerEnter={(e) => e.pointerType !== "touch" && setHot(true)} onPointerLeave={() => setHot(false)} className={cn("sketch-image group/sketch relative block overflow-hidden", className)} style={{ "--lens": `${lens}px` } as React.CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={alt} loading="lazy" decoding="async" {...img} className={cn("block h-full w-full object-cover", imgClassName)} />
      {hot && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" aria-hidden decoding="async" {...img} loading="eager" className={cn("sketch-layer absolute inset-0 block h-full w-full object-cover", imgClassName)} />
          <span className="sketch-ring" aria-hidden />
        </>
      )}
    </span>
  );
}
