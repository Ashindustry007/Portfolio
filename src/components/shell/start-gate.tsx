"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useExperience } from "@/lib/experience";
import { siteConfig } from "@/lib/config";
import { CatMark } from "@/components/game/cat-mark";

const BOOT = [
  "Wake the cat",
  "Compile coder module",
  "Mix artist palette",
  "Plot traveller route",
  "Load player model",
  "Ready",
];

/**
 * First screen of a visit. It covers the page while the opening scene loads and
 * asks whether to enter with sound, which is also the click browsers require
 * before any audio may play.
 */
export function StartGate() {
  const ready = useExperience((s) => s.ready);
  const entered = useExperience((s) => s.entered);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const returning = useExperience((s) => s.returning);
  const assetProgress = useExperience((s) => s.assetProgress);
  const enter = useExperience((s) => s.enter);

  const [step, setStep] = useState(0);
  const [waited, setWaited] = useState(false);
  const primary = useRef<HTMLButtonElement>(null);

  const open = ready && !entered;

  useEffect(() => {
    if (!open) return;
    if (reducedMotion) {
      setStep(BOOT.length);
      return;
    }
    const id = setInterval(() => setStep((s) => Math.min(BOOT.length, s + 1)), 260);
    return () => clearInterval(id);
  }, [open, reducedMotion]);

  // Never hold a visitor at the gate because an image is slow.
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setWaited(true), 5000);
    return () => clearTimeout(id);
  }, [open]);

  const booted = step >= BOOT.length;
  const canEnter = booted && (assetProgress >= 1 || waited);
  const percent = Math.round(Math.min(assetProgress, step / BOOT.length) * 100);

  useEffect(() => {
    if (canEnter) primary.current?.focus({ preventScroll: true });
  }, [canEnter]);

  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("gate-open");
    return () => document.documentElement.classList.remove("gate-open");
  }, [open]);

  return (
    <AnimatePresence>
      {/* Before preferences are read we still cover the page, so content never flashes under the gate. */}
      {(!ready || open) && (
        <motion.div
          key="gate"
          role="dialog"
          aria-modal="true"
          aria-label="Start"
          data-crosshair
          className="fixed inset-0 z-[200] flex flex-col overflow-y-auto bg-background"
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: reducedMotion || returning ? 0 : 0.9, ease: [0.76, 0, 0.24, 1] } }}
          style={{ clipPath: "inset(0 0 0% 0)" }}
        >
          <div className="gate-grid absolute inset-0" aria-hidden />

          {open && (
            <>
              <div className="relative flex items-start justify-between px-6 py-5 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-white/40">
                <span>{siteConfig.name} {siteConfig.surname}</span>
                <span>Portfolio · {new Date().getFullYear()}</span>
              </div>

              <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-4 text-center">
                <CatMark draw className="mb-[3vh] h-[min(5rem,15vh)] w-[min(5rem,15vh)] shrink-0 text-primary md:h-[min(6rem,15vh)] md:w-[min(6rem,15vh)]" />
                <h1 className="font-headline text-[length:min(18vw,26vh,11rem)] font-bold uppercase leading-[0.85] tracking-tighter">
                  <span className="text-primary">C</span>
                  <span className="text-outline">A</span>
                  <span>T</span>
                </h1>
                <p className="mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.45em] text-white/60 md:text-xs">
                  Coder <span className="text-primary">/</span> Artist <span className="text-primary">/</span> Traveller
                </p>

                <div className="mt-[min(3rem,5vh)] flex min-h-14 items-center justify-center">
                  {canEnter ? (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col items-center gap-3 sm:flex-row">
                      <button ref={primary} type="button" className="gate-button is-primary" onClick={() => enter(true)}>
                        <Volume2 size={14} /> Enter with sound
                      </button>
                      <button type="button" className="gate-button" onClick={() => enter(false)}>
                        <VolumeX size={14} /> Enter muted
                      </button>
                    </motion.div>
                  ) : (
                    <span className="font-headline text-4xl font-bold tabular-nums tracking-tighter text-white/90">{percent}%</span>
                  )}
                </div>
              </div>

              <div className="relative flex items-end justify-between px-6 py-5 [@media(max-height:520px)]:hidden">
                <ol className="space-y-1 font-mono text-[0.625rem] uppercase tracking-[0.25em]" aria-hidden>
                  {BOOT.map((line, i) => (
                    <li key={line} className={i < step ? (i === BOOT.length - 1 ? "text-primary" : "text-white/55") : "text-white/15"}>
                      {String(i + 1).padStart(3, "0")} {line}
                    </li>
                  ))}
                </ol>
                <p className="hidden max-w-[16rem] text-right font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.25em] text-white/35 sm:block">
                  This site has music and sound effects. You can switch them off at any time, top right.
                </p>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
