"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Volume2, VolumeX } from "lucide-react";
import { achievements, classes, levels } from "@/lib/journey";
import { useExperience } from "@/lib/experience";
import { pointer } from "@/lib/pointer";
import { scrollState, scrollToTarget } from "@/lib/scroll";
import { audio } from "@/lib/audio/engine";
import { CatMark } from "@/components/game/cat-mark";
import { cn } from "@/lib/utils";

const pad = (n: number, width: number) => String(Math.max(0, Math.round(n))).padStart(width, "0");

function Equalizer({ on }: { on: boolean }) {
  return (
    <span className={cn("hud-eq", on && "is-on")} aria-hidden>
      <i /><i /><i /><i />
    </span>
  );
}

/** Vertical route on the home page: one node per level, the cat marks where you are. */
function RouteMap() {
  const level = useExperience((s) => s.level);
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const cat = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let tops: number[] = [];
    const measure = () => {
      tops = levels.map((l) => {
        const el = document.getElementById(`level-${l.id}`);
        return el ? el.getBoundingClientRect().top + window.scrollY : Number.NaN;
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!track.current || tops.some(Number.isNaN)) return;
      // Position along the route = which level tops the middle of the screen sits between.
      const y = scrollState.y + window.innerHeight * 0.5;
      let t = 0;
      for (let i = 0; i < tops.length; i++) {
        const start = tops[i];
        const end = tops[i + 1] ?? document.documentElement.scrollHeight;
        if (y >= start) t = i + Math.min(1, (y - start) / Math.max(1, end - start));
      }
      const ratio = Math.min(1, t / (levels.length - 1));
      if (fill.current) fill.current.style.transform = `scaleY(${ratio})`;
      if (cat.current) cat.current.style.top = `${ratio * 100}%`;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <nav aria-label="Journey levels" className="pointer-events-auto absolute right-6 top-1/2 hidden -translate-y-1/2 lg:block">
      <div ref={track} className="relative flex h-[46vh] max-h-[420px] flex-col justify-between">
        <div className="absolute bottom-0 right-[5px] top-0 w-px bg-ink/15" />
        <div ref={fill} className="absolute bottom-0 right-[5px] top-0 w-px origin-top bg-primary" style={{ transform: "scaleY(0)" }} />
        <div ref={cat} className="absolute right-[-7px] -mt-[13px] text-primary transition-[top] duration-150 ease-linear" style={{ top: 0 }}>
          <button
            type="button"
            data-sfx="none"
            aria-label="Poke the cat"
            className="block rounded-full bg-background p-[3px]"
            onClick={() => {
              audio.meow();
              useExperience.getState().unlock("curious-cat");
            }}
          >
            <CatMark alive className="h-[18px] w-[18px]" />
          </button>
        </div>
        {levels.map((l, i) => (
          <button
            key={l.id}
            type="button"
            onClick={() => scrollToTarget(`#level-${l.id}`)}
            aria-current={i === level ? "step" : undefined}
            className="group relative flex items-center justify-end gap-3 py-1 pr-6 text-right"
          >
            <span
              className={cn(
                "translate-x-1 font-mono text-[0.625rem] uppercase tracking-[0.25em] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                i === level ? "text-foreground" : "text-ink/50"
              )}
            >
              {l.name}
            </span>
            <span className={cn("font-mono text-[0.625rem] tracking-[0.2em]", i <= level ? "text-primary" : "text-ink/35")}>{l.code}</span>
            <span className={cn("absolute right-[2px] h-[7px] w-[7px] rotate-45 border transition-colors", i <= level ? "border-primary bg-primary" : "border-ink/40 bg-background")} />
          </button>
        ))}
      </div>
    </nav>
  );
}

function Readout() {
  const x = useRef<HTMLSpanElement>(null);
  const y = useRef<HTMLSpanElement>(null);
  const explored = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (x.current) x.current.textContent = pad(pointer.seen ? pointer.x : 0, 4);
      if (y.current) y.current.textContent = pad(pointer.seen ? pointer.y : 0, 4);
      if (explored.current) explored.current.textContent = pad(scrollState.progress * 100, 3);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="absolute bottom-5 left-6 hidden gap-5 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-ink/40 md:flex">
      <span>X:<span ref={x} className="text-ink/70">0000</span>PX</span>
      <span>Y:<span ref={y} className="text-ink/70">0000</span>PX</span>
      <span>Explored:<span ref={explored} className="text-primary">000</span>%</span>
    </div>
  );
}

export function Hud() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const entered = useExperience((s) => s.entered);
  const level = useExperience((s) => s.level);
  const sfx = useExperience((s) => s.sfx);
  const music = useExperience((s) => s.music);
  const unlocked = useExperience((s) => s.unlocked);
  const setSfx = useExperience((s) => s.setSfx);
  const setMusic = useExperience((s) => s.setMusic);
  const [trophiesOpen, setTrophiesOpen] = useState(false);

  const here = classes.find((c) => c.href === pathname);
  const title = isHome ? `LVL ${levels[level].code}` : here ? `Class ${here.letter}` : "CAT";
  const subtitle = isHome ? levels[level].name : here ? `${here.role} · ${here.page}` : "";

  useEffect(() => setTrophiesOpen(false), [pathname]);

  return (
    <>
    <div
      className={cn("pointer-events-none fixed inset-0 z-[90] transition-opacity duration-700", entered ? "opacity-100" : "opacity-0")}
      // Until the gate lifts the HUD is invisible, so keep it out of the tab order too.
      inert={!entered}
    >
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/85 via-background/40 to-transparent" />

      <header className="absolute inset-x-0 top-0 flex items-start justify-between px-4 py-4 md:px-6 md:py-5">
        <Link href="/" aria-label="Home" className="pointer-events-auto group flex items-center gap-3">
          <CatMark alive className="h-8 w-8 text-primary transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
          <span className="flex flex-col font-mono uppercase leading-tight">
            <span className="text-[0.6875rem] tracking-[0.3em] text-primary">{title}</span>
            <span className="text-[0.6875rem] tracking-[0.25em] text-ink/60">{subtitle}</span>
          </span>
        </Link>

        <div className="pointer-events-auto flex items-center gap-1 md:gap-2">
          <nav aria-label="Paths" className="mr-1 flex items-center md:mr-3">
            {classes.map((c) => (
              <Link
                key={c.letter}
                href={c.href}
                aria-label={`${c.role}: ${c.page}`}
                aria-current={pathname === c.href ? "page" : undefined}
                className={cn("hud-letter group", pathname === c.href && "is-active")}
              >
                {c.letter}
                <span className="hud-tip">{c.role}</span>
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="hud-button relative"
            aria-expanded={trophiesOpen}
            aria-label={`Achievements, ${unlocked.length} of ${achievements.length} unlocked`}
            onClick={() => {
              setTrophiesOpen((o) => !o);
              trophiesOpen ? audio.close() : audio.open();
            }}
          >
            <Trophy size={14} />
            <span className="font-mono text-[0.625rem] tracking-[0.15em]">{unlocked.length}/{achievements.length}</span>
          </button>
          <button type="button" data-sfx="none" className="hud-button" aria-pressed={music} aria-label={music ? "Turn music off" : "Turn music on"} onClick={() => setMusic(!music)}>
            <Equalizer on={music} />
          </button>
          <button type="button" data-sfx="none" className="hud-button" aria-pressed={sfx} aria-label={sfx ? "Turn sound effects off" : "Turn sound effects on"} onClick={() => setSfx(!sfx)}>
            {sfx ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </header>

      {isHome && <RouteMap />}
      <Readout />
    </div>

    <div className="pointer-events-none fixed inset-0 z-[91]">
      {trophiesOpen && (
        <div className="pointer-events-auto absolute right-4 top-16 w-[min(20rem,calc(100vw-2rem))] border border-ink/10 bg-background/95 p-4 backdrop-blur-md md:right-6">
          <p className="mb-3 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-primary">Achievements</p>
          <ul className="space-y-2.5">
            {achievements.map((a) => {
              const got = unlocked.includes(a.id);
              return (
                <li key={a.id} className={cn("flex items-start gap-3", !got && "opacity-35")}>
                  <span className={cn("mt-[5px] h-[7px] w-[7px] shrink-0 rotate-45 border", got ? "border-primary bg-primary" : "border-ink/50")} />
                  <span>
                    <span className="block text-xs font-medium text-foreground">{got ? a.title : "???"}</span>
                    <span className="block text-[0.75rem] leading-snug text-muted-foreground">{a.detail}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

    </div>
    </>
  );
}
