"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { extracurriculars } from "@/lib/config";
import { classes } from "@/lib/journey";
import { pointer } from "@/lib/pointer";
import { audio } from "@/lib/audio/engine";
import { useExperience } from "@/lib/experience";
import { useInstagram, type InstagramPost } from "@/hooks/use-instagram";
import { areas, placeOf, type Area, type AreaKey } from "@/lib/places";
import { Footer } from "@/components/footer";
import { CloakedAvatar } from "@/components/hero/cloaked-avatar";
import { TopoField } from "@/components/game/topo-field";
import { SketchImage } from "@/components/game/sketch-image";
import { Note, useDrawOnView } from "@/components/game/doodles";
import { CornerMarks } from "@/components/game/line-art";
import { cn } from "@/lib/utils";

// Each area's leg is stamped in its own ink.
const INKS = ["176 62% 52%", "38 80% 66%", "22 100% 56%", "200 70% 62%", "330 70% 68%"];

const years = (text: string) => text.match(/\b(19|20)\d{2}(-\d{2,4})?\b/)?.[0] ?? "";
const monthYear = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
/** "2024", or "2023–24" across years. */
function yearSpan(first: string, last: string) {
  const a = new Date(first).getFullYear(), b = new Date(last).getFullYear();
  return a === b ? String(a) : `${a}–${String(b).slice(2)}`;
}
/** "Jun to Oct 2024", "Oct 2023 to Nov 2024", or one month. */
function span(first: string, last: string) {
  const a = new Date(first), b = new Date(last);
  const m = (d: Date) => d.toLocaleDateString("en-US", { month: "short" });
  if (a.getFullYear() === b.getFullYear()) return a.getMonth() === b.getMonth() ? `${m(a)} ${a.getFullYear()}` : `${m(a)} to ${m(b)} ${b.getFullYear()}`;
  return `${m(a)} ${a.getFullYear()} to ${m(b)} ${b.getFullYear()}`;
}

/** A compass whose needle swings to face the cursor. */
function Compass({ className }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const needle = useRef<SVGGElement>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    let angle = 0, frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const el = svg.current;
      if (!el || !needle.current || !pointer.seen) return;
      const r = el.getBoundingClientRect();
      const target = (Math.atan2(pointer.y - (r.top + r.height / 2), pointer.x - (r.left + r.width / 2)) * 180) / Math.PI + 90;
      // Turn the short way round.
      const delta = ((target - angle + 540) % 360) - 180;
      angle += delta * 0.08;
      needle.current.style.transform = `rotate(${angle.toFixed(2)}deg)`;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  return (
    <svg ref={svg} viewBox="0 0 120 120" fill="none" stroke="currentColor" className={className} aria-hidden>
      <circle cx="60" cy="60" r="56" strokeOpacity="0.25" />
      <circle cx="60" cy="60" r="46" strokeOpacity="0.5" strokeDasharray="1 5" />
      {["N", "E", "S", "W"].map((d, i) => (
        <text key={d} x="60" y="13" transform={`rotate(${i * 90} 60 60)`} textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" className="font-mono" opacity={d === "N" ? 1 : 0.5}>
          {d}
        </text>
      ))}
      <g ref={needle} style={{ transformOrigin: "60px 60px" }}>
        <path d="M60 20l7 40h-14z" fill="hsl(var(--primary))" stroke="none" />
        <path d="M60 100l7-40h-14z" strokeOpacity="0.6" />
      </g>
      <circle cx="60" cy="60" r="3" fill="hsl(var(--background))" />
    </svg>
  );
}

function Stamp({ id, big, small, tilt, className }: { id: string; big: string; small: string; tilt: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" className={cn("stamp h-24 w-24 shrink-0 text-class md:h-28 md:w-28", className)} style={{ "--tilt": `${tilt}deg`, filter: "url(#rough)" } as React.CSSProperties} aria-hidden>
      <defs>
        <path id={id} d="M60 60m-41 0a41 41 0 1 1 82 0a41 41 0 1 1-82 0" />
      </defs>
      <circle cx="60" cy="60" r="56" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="50" strokeWidth="1" />
      <circle cx="60" cy="60" r="30" strokeWidth="1" strokeDasharray="2 3" />
      <text fontSize="8.5" letterSpacing="2.2" fill="currentColor" stroke="none" className="font-mono uppercase">
        <textPath href={`#${id}`}>· field log · ashish kumar panda · cleared ·</textPath>
      </text>
      <text x="60" y="58" textAnchor="middle" fontSize={big.length > 2 ? 15 : 20} fontWeight="700" fill="currentColor" stroke="none" className="font-headline">
        {big}
      </text>
      <text x="60" y="71" textAnchor="middle" fontSize="7.5" letterSpacing="1" fill="currentColor" stroke="none" className="font-mono">
        {small}
      </text>
    </svg>
  );
}

/** Marks its children as drawn when scrolled into view, and lands the stamp with a thud. */
function useStamped<T extends HTMLElement>() {
  const ref = useDrawOnView<T>();
  const entered = useExperience((s) => s.entered);
  useEffect(() => {
    const el = ref.current;
    if (!el || !entered) return;
    const observer = new MutationObserver(() => {
      if (el.classList.contains("is-drawn")) {
        setTimeout(() => audio.stamp(), 120);
        observer.disconnect();
      }
    });
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [entered, ref]);
  return ref;
}

const Pin = () => <span className="absolute left-0 top-9 h-3 w-3 -translate-x-1/2 rotate-45 border border-class bg-background" aria-hidden />;

type Shot = { post: InstagramPost; spot: string };

/** One photo on a leg: the picture, the spot as tagged on Instagram, and when. */
function Snap({ shot, area, tilt }: { shot: Shot; area: Area; tilt: number }) {
  const { post, spot } = shot;
  return (
    <li className="group">
      <a
        href={post.permalink}
        target="_blank"
        rel="noopener noreferrer"
        // Each print sits a little askew and straightens when picked up.
        className="relative block border border-ink/15 bg-card p-1.5 pb-2.5 shadow-xl shadow-black/40 transition-[rotate,transform] duration-500 [rotate:var(--tilt)] hover:z-10 hover:-translate-y-1 hover:scale-[1.03] hover:[rotate:0deg] sm:p-2 sm:pb-3"
        style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
      >
        <SketchImage src={post.media_url} alt={`Photograph at ${spot}, ${area.region === "Home" ? "Odisha" : area.region}, ${monthYear(post.timestamp)}`} className="aspect-[4/5]" lens={70} />
        <span className="mt-2 block px-0.5">
          <span className="block font-headline text-[0.95rem] font-bold leading-tight sm:text-base">{spot}</span>
          <span className="mt-0.5 block font-mono text-[0.625rem] uppercase tracking-[0.2em] text-class/90">{monthYear(post.timestamp)}</span>
        </span>
      </a>
    </li>
  );
}

function Waypoint({ item, index }: { item: { title: string; description: string }; index: number }) {
  const ref = useStamped<HTMLLIElement>();
  return (
    <li ref={ref} className="stamp-holder relative pl-10 md:pl-16">
      <Pin />
      <div className="flex items-center gap-5">
        <Stamp id={`stamp-way-${index}`} big={String(index + 1).padStart(2, "0")} small={years(item.description) || "LOGGED"} tilt={index % 2 === 0 ? -9 : 7} />
        <div className="min-w-0 max-w-xl">
          <h3 className="font-headline text-xl font-bold leading-tight">{item.title}</h3>
          <p className="mt-2 leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
      </div>
    </li>
  );
}

/** The top of a leg: its stamp, the area, and the spots it covers. */
function LegHeader({ kicker, title, meta, detail, stamp }: { kicker: string; title: string; meta?: string; detail?: string; stamp?: { id: string; big: string; small: string; tilt: number } }) {
  const ref = useStamped<HTMLElement>();
  return (
    <header ref={ref} className="stamp-holder relative mb-8 flex flex-col items-start gap-3 pl-10 sm:mb-10 sm:flex-row sm:items-center sm:gap-5 md:pl-16">
      <Pin />
      {stamp ? <Stamp {...stamp} className="h-16 w-16 sm:h-24 sm:w-24 md:h-28 md:w-28" /> : null}
      <div className="min-w-0 bg-background/70 py-1 pr-3 backdrop-blur-sm">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-class">{kicker}</p>
        <h2 className="mt-1 font-headline text-3xl font-bold uppercase leading-none tracking-tight md:text-5xl">{title}</h2>
        {meta && <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-ink/55">{meta}</p>}
        {detail && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink/60">{detail}</p>}
      </div>
    </header>
  );
}

export default function TravelsPage() {
  const { posts, loading, failed } = useInstagram();
  const trail = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trail, offset: ["start 70%", "end 60%"] });
  const drawn = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });

  // Only the photos whose place is recorded (lib/places.ts), one leg per area,
  // the most recently visited first.
  const legs = useMemo(() => {
    const byArea = new Map<AreaKey, Shot[]>();
    for (const post of posts) {
      const place = placeOf(post.permalink);
      if (place) byArea.set(place.area, [...(byArea.get(place.area) ?? []), { post, spot: place.spot }]);
    }
    return [...byArea.entries()];
  }, [posts]);
  const located = legs.reduce((n, [, shots]) => n + shots.length, 0);

  const ground = extracurriculars.find((c) => c.category.startsWith("Adventure"));
  const others = classes.filter((c) => c.key !== "t");

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <TopoField className="z-0" />

      <div className="relative z-10">
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-32 md:grid-cols-[minmax(0,1fr)_auto] md:px-8">
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-widest text-class">Field log · class T</p>
            <h1 className="font-headline text-5xl font-bold uppercase leading-none md:text-7xl">
              Off the
              <br />
              <span className="text-outline">Map</span>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">Caves, forts, summits and shorelines, logged where they were tagged, with the community work along the way.</p>
            <dl className="flex flex-wrap gap-x-10 gap-y-4 pt-2 font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-ink/45">
              <div>
                <dt>From</dt>
                <dd className="mt-1 text-ink/85">Bhubaneswar · 20.30°N 85.82°E</dd>
              </div>
              <div>
                <dt>To</dt>
                <dd className="mt-1 text-ink/85">La Jolla · 32.88°N 117.23°W</dd>
              </div>
              <div>
                <dt>Logged</dt>
                <dd className="mt-1 text-class">{posts.length ? `${located} frames · ${legs.length} areas` : loading ? "reading the log…" : "log offline"}</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-[min(76vw,24rem)]">
            <CornerMarks />
            <CloakedAvatar klass="t" active className="w-full" />
            <Compass className="absolute -left-8 -top-8 h-24 w-24 text-ink md:-left-14 md:h-28 md:w-28" />
            <Note arrow="arrow" className="absolute -bottom-9 right-0 rotate-3 text-class" arrowClassName="order-first -scale-x-100 rotate-180">
              it follows you
            </Note>
          </div>
        </section>

        <div ref={trail} className="relative mx-auto max-w-7xl px-6 pb-28 md:px-8">
          {/* The trail: a faint dashed line, inked in as the page is walked. */}
          <div className="absolute bottom-28 left-6 top-0 w-px md:left-8" aria-hidden>
            <div className="h-full w-px bg-[linear-gradient(hsl(var(--ink)/0.25)_50%,transparent_50%)] bg-[length:1px_10px]" />
            <motion.div className="absolute inset-0 origin-top bg-class" style={{ scaleY: drawn }} />
          </div>

          {failed && <p className="relative py-10 pl-10 text-lg text-muted-foreground md:pl-16">The photo log couldn&apos;t be loaded right now.</p>}

          {legs.map(([key, shots], l) => {
            const area = areas[key] as Area;
            const first = shots[shots.length - 1].post.timestamp, last = shots[0].post.timestamp;
            const spots = [...new Set(shots.map((x) => x.spot))];
            return (
              <section key={key} style={{ "--class": INKS[l % INKS.length] } as React.CSSProperties} className="relative pt-20 first:pt-6">
                <LegHeader
                  kicker={`Leg ${String(l + 1).padStart(2, "0")} · ${area.region}`}
                  title={area.name}
                  meta={`${shots.length} ${shots.length === 1 ? "frame" : "frames"} · ${span(first, last)}`}
                  detail={spots.length > 1 || spots[0] !== area.name ? spots.join("  ·  ") : undefined}
                  stamp={{ id: `stamp-${key}`, big: area.mark, small: yearSpan(first, last), tilt: l % 2 === 0 ? -9 : 7 }}
                />
                <ol className="grid grid-cols-2 gap-3 pl-10 sm:grid-cols-3 sm:gap-5 md:pl-16 lg:grid-cols-4 xl:grid-cols-5">
                  {shots.map((shot, i) => (
                    <Snap key={shot.post.id} shot={shot} area={area} tilt={[-1.6, 1.2, -0.6, 1.8, -1.1][i % 5]} />
                  ))}
                </ol>
              </section>
            );
          })}

          {ground && (
            <section style={{ "--class": "22 100% 56%" } as React.CSSProperties} className="relative pt-24">
              <LegHeader kicker="On the ground" title={ground.category} />
              <ol className="space-y-12">
                {ground.items.map((item, i) => (
                  <Waypoint key={item.title} item={item} index={i} />
                ))}
              </ol>
            </section>
          )}
        </div>

        <section className="mx-auto max-w-6xl px-6 pb-28 md:px-8">
          <div className="border-t border-ink/10 pt-12">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-class">End of the log</p>
            <h2 className="mt-2 font-headline text-3xl font-bold uppercase md:text-4xl">Two more paths</h2>
            <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
              {others.map((o) => (
                <li key={o.key}>
                  <Link href={o.href} className="group flex items-center gap-5 py-4 transition-colors hover:text-primary">
                    <span className="text-outline w-10 font-headline text-4xl font-bold leading-none transition-all group-hover:text-primary group-hover:[-webkit-text-stroke:0px]">{o.letter}</span>
                    <span className="flex-1">
                      <span className="block font-headline text-lg font-bold uppercase">{o.role}</span>
                      <span className="block text-sm text-muted-foreground">{o.line}</span>
                    </span>
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-ink/40 group-hover:text-primary">{o.page} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
