"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Github, Hand, Instagram, Linkedin } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { classes } from "@/lib/journey";
import { useExperience } from "@/lib/experience";
import { scrollToTarget } from "@/lib/scroll";
import { PlayerFigure, figureTelemetry } from "@/components/hero/player-figure";
import { Parallax } from "@/components/game/parallax";
import { CornerMarks, Hint } from "@/components/game/line-art";

// What each letter of CAT stands for, in his own record.
const CLASS_LINES: Record<string, string> = {
  C: "AI engineer. Computer vision, LLMs and agentic systems.",
  A: "Photographer and trained painter. Led OUTR's media club.",
  T: "Certified surfer. OUTR to UC San Diego, the long way round.",
};

const rise = {
  hide: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.25 + i * 0.09, ease: [0.2, 0.8, 0.2, 1] as const } }),
};

/** Frame counter and turntable angle beside the figure, updated as it moves. */
function Telemetry() {
  const frame = useRef<HTMLSpanElement>(null);
  const turn = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let id = 0;
    const tick = () => {
      id = requestAnimationFrame(tick);
      if (frame.current) frame.current.textContent = String(figureTelemetry.frame).padStart(3, "0");
      if (turn.current) turn.current.textContent = String(Math.round(figureTelemetry.turn)).padStart(3, "0");
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      <p className="absolute left-0 top-0 -translate-y-full pb-2 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-white/40 lg:left-[4%] lg:top-[3%] lg:translate-y-0 lg:pb-0">
        Frame <span ref={frame} className="text-white/75">000</span>/{String(figureTelemetry.count - 1).padStart(3, "0")}
      </p>
      <p className="absolute right-0 top-0 -translate-y-full pb-2 text-right font-mono text-[0.625rem] uppercase tracking-[0.25em] text-white/40 lg:left-[4%] lg:right-auto lg:top-[calc(3%+1.25rem)] lg:translate-y-0 lg:pb-0 lg:text-left">
        Turn <span ref={turn} className="text-primary">000</span>°
      </p>
    </>
  );
}

/**
 * Under the figure: a glowing prompt whose hand moves with the figure's
 * demonstration turn, until the visitor turns it themselves; then a quiet label.
 */
function TurnHint() {
  const fine = useExperience((s) => s.finePointer);
  const hand = useRef<HTMLSpanElement>(null);
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    let id = 0;
    const tick = () => {
      if (figureTelemetry.handled) {
        setHandled(true);
        return;
      }
      id = requestAnimationFrame(tick);
      if (hand.current) hand.current.style.transform = `translateX(${(figureTelemetry.nudge * 22).toFixed(1)}px)`;
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  if (handled) return <Hint>Drag to rotate</Hint>;
  return (
    <span className="turn-hint inline-flex items-center gap-2 rounded-full border border-primary/60 bg-black/50 py-2 pl-3 pr-4 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm">
      <ChevronLeft size={12} className="text-primary/70" aria-hidden />
      <span ref={hand} className="inline-flex text-primary will-change-transform" aria-hidden>
        <Hand size={15} />
      </span>
      <ChevronRight size={12} className="mr-1 text-primary/70" aria-hidden />
      {fine ? "Drag or scroll sideways to turn" : "Swipe sideways to turn"}
    </span>
  );
}

function Turntable() {
  return (
    <svg viewBox="0 0 400 80" fill="none" className="pointer-events-none absolute inset-x-0 bottom-[1%] mx-auto w-[92%] overflow-visible" aria-hidden>
      <ellipse cx="200" cy="40" rx="196" ry="34" stroke="hsl(var(--ink) / 0.14)" />
      <ellipse cx="200" cy="40" rx="170" ry="28" stroke="hsl(var(--ink) / 0.3)" strokeDasharray="1 7" className="turntable-ticks" />
      <ellipse cx="200" cy="40" rx="120" ry="19" stroke="hsl(var(--primary) / 0.5)" strokeDasharray="60 18" className="turntable-ticks is-reverse" />
    </svg>
  );
}

export function HeroSection() {
  const entered = useExperience((s) => s.entered);
  const state = entered ? "show" : "hide";

  return (
    <div data-crosshair className="relative overflow-hidden">
      <div className="blueprint-grid absolute inset-0" aria-hidden />

      <div className="relative mx-auto grid min-h-[100svh] max-w-[102.5rem] grid-cols-1 items-center gap-y-16 px-6 pb-28 pt-28 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-10 lg:gap-y-10 lg:px-14 lg:pr-28 landscape:max-lg:grid-cols-[auto_minmax(0,1fr)] landscape:max-lg:gap-x-10 landscape:max-lg:gap-y-10 landscape:max-lg:pt-20">
        {/* Who */}
        <Parallax depth={10} className="relative z-10 order-2 lg:order-1">
          <motion.p variants={rise} custom={0} initial="hide" animate={state} className="mb-5 font-mono text-[0.6875rem] uppercase tracking-[0.35em] text-primary">
            Player 01 <span className="text-white/30">/</span> Select
          </motion.p>
          <h1 className="font-headline text-[15vw] font-bold uppercase leading-[0.86] tracking-tighter sm:text-7xl lg:text-[clamp(3.25rem,5.6vw,6.5rem)]">
            {siteConfig.name.split(" ").map((word, i) => (
              <motion.span key={word} variants={rise} custom={1 + i} initial="hide" animate={state} className="block">
                {word}
              </motion.span>
            ))}
            <motion.span variants={rise} custom={3} initial="hide" animate={state} className="text-outline block">
              {siteConfig.surname}
            </motion.span>
          </h1>
          <motion.div variants={rise} custom={4} initial="hide" animate={state} className="mt-7 max-w-sm space-y-3">
            <p className="font-headline text-sm font-bold uppercase tracking-[0.25em] text-primary">{siteConfig.subheadline}</p>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{siteConfig.intro}</p>
          </motion.div>
          <motion.div variants={rise} custom={5} initial="hide" animate={state} className="mt-7 flex items-center gap-2">
            {[
              { href: siteConfig.socials.github, label: "GitHub", Icon: Github },
              { href: siteConfig.socials.linkedin, label: "LinkedIn", Icon: Linkedin },
              { href: siteConfig.socials.instagram, label: "Instagram", Icon: Instagram },
            ].map(({ href, label, Icon }) => (
              <Link key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="hud-button">
                <Icon size={15} />
              </Link>
            ))}
          </motion.div>
        </Parallax>

        {/* The player model */}
        {/* The player model. On a phone it spans the full width (justify-self-center, not
            mx-auto, so it reaches into both gutters evenly). On laptops and up it rises from
            the bottom edge to nearly the full height of the screen, as the original hero
            did, with the name and class list over its edges; the spacer below holds the
            middle column open so those keep their widths. */}
        <div className="relative order-1 w-[min(100vw,62svh)] justify-self-center lg:absolute lg:bottom-0 lg:left-1/2 lg:z-0 lg:w-[min(calc(100svh-4.5rem),64vw)] lg:-translate-x-1/2 landscape:max-lg:row-span-2 landscape:max-lg:w-[min(44vw,76svh)] landscape:max-lg:self-start landscape:max-lg:mt-6">
          <CornerMarks />
          <Telemetry />
          <Turntable />
          <PlayerFigure />
          <p className="absolute inset-x-0 bottom-0 z-10 translate-y-full pt-3 text-center lg:bottom-[13%] lg:translate-y-0 lg:pt-0">
            <TurnHint />
          </p>
        </div>

        <div aria-hidden className="hidden lg:order-2 lg:block lg:w-[min(38vw,66svh)]" />

        {/* What: the three classes */}
        <Parallax depth={10} className="relative z-10 order-3 lg:justify-self-end">
          <motion.p variants={rise} custom={2} initial="hide" animate={state} className="mb-4 font-mono text-[0.6875rem] uppercase tracking-[0.35em] text-primary">
            Class <span className="text-white/30">/</span> C.A.T
          </motion.p>
          <ul className="max-w-md border-t border-white/10">
            {classes.map((c, i) => (
              <motion.li key={c.letter} variants={rise} custom={3 + i} initial="hide" animate={state}>
                <Link href={c.href} className="group flex items-center gap-5 border-b border-white/10 py-4 transition-colors hover:border-primary/60">
                  <span className="text-outline w-12 shrink-0 font-headline text-5xl font-bold leading-none transition-all duration-300 group-hover:text-primary group-hover:[-webkit-text-stroke:0px]">
                    {c.letter}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-headline text-lg font-bold uppercase tracking-wide">{c.role}</span>
                    <span className="block text-xs leading-relaxed text-muted-foreground">{CLASS_LINES[c.letter]}</span>
                  </span>
                  <ArrowUpRight size={16} className="shrink-0 text-white/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </motion.li>
            ))}
          </ul>
          <motion.div variants={rise} custom={6} initial="hide" animate={state} className="mt-6 max-w-md">
            <p className="mb-2 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-white/35">Loadout</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
              {siteConfig.skills.map((skill) => (
                <li key={skill.id} className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-white/60">
                  <span className="text-primary/70">{skill.id}</span> {skill.label}
                </li>
              ))}
            </ul>
          </motion.div>
        </Parallax>
      </div>

      <button
        type="button"
        onClick={() => scrollToTarget("#level-origin")}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/50 transition-colors hover:text-primary"
      >
        <Hint>Scroll to begin</Hint>
        <ArrowDown size={14} className="animate-bounce" />
      </button>
    </div>
  );
}
