"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { extracurriculars, siteConfig } from "@/lib/config";
import { classes } from "@/lib/journey";
import { useInstagram } from "@/hooks/use-instagram";
import { scrollToTarget } from "@/lib/scroll";
import { Footer } from "@/components/footer";
import { CloakedAvatar } from "@/components/hero/cloaked-avatar";
import { Flow } from "@/components/gallery/flow";
import { Museum } from "@/components/gallery/museum";
import { Lightbox } from "@/components/gallery/lightbox";
import { CornerMarks } from "@/components/game/line-art";
import { PaintField } from "@/components/game/page-fields";
import { Doodle, Note } from "@/components/game/doodles";

// How many of the newest photos hang in the opening walk.
const STREAM = 24;
const STREAM_ON_TOUCH = 14;

export default function PhotographyPage() {
  const { posts, loading, failed } = useInstagram();
  const [open, setOpen] = useState<number | null>(null);
  const openPhoto = useCallback((i: number) => setOpen(i), []);
  // Fewer on phones and tablets, which have less memory to spare.
  const [streamCount] = useState(() => (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches ? STREAM_ON_TOUCH : STREAM));

  // The whole collection stays shut until asked for, from the button under the walk.
  const [showAll, setShowAll] = useState(false);
  const [asked, setAsked] = useState(0);
  const revealAll = useCallback(() => {
    setShowAll(true);
    setAsked((n) => n + 1);
  }, []);
  useEffect(() => {
    if (!asked) return;
    // Wait for the rooms to be on the page before walking down to them.
    const id = setTimeout(() => scrollToTarget("#collection", { offset: -20 }), 80);
    return () => clearTimeout(id);
  }, [asked]);

  const arts = extracurriculars.find((c) => c.category.startsWith("Arts"));
  const others = classes.filter((c) => c.key !== "a");

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <PaintField />
      {posts.length > 0 && <Flow posts={posts.slice(0, streamCount)} total={posts.length} onOpen={openPhoto} onShowAll={revealAll} />}

      {loading && <p className="relative flex min-h-[100svh] items-center justify-center px-6 font-headline text-3xl font-bold uppercase text-muted-foreground">Hanging the pictures…</p>}
      {!loading && (failed || posts.length === 0) && (
        <div className="flex min-h-[70svh] flex-col items-center justify-center px-6 text-center">
          <p className="font-headline text-3xl font-bold uppercase">{failed ? "The gallery couldn't be loaded right now." : "No photos posted yet."}</p>
          <Link href={siteConfig.socials.instagram} target="_blank" rel="noopener noreferrer" className="mt-6 font-mono text-xs uppercase tracking-[0.2em] underline decoration-primary underline-offset-4 hover:text-primary">
            View on Instagram
          </Link>
        </div>
      )}
      {posts.length > 0 &&
        (showAll ? (
          <div id="collection" className="relative">
            <Museum posts={posts} onOpen={openPhoto} />
          </div>
        ) : (
          <section className="museum relative flex flex-col items-center gap-6 px-6 py-24 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">The collection</p>
            <h2 className="font-headline text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-6xl">
              That was {streamCount}.
              <br />
              <span className="text-outline">There are {posts.length}.</span>
            </h2>
            <button type="button" onClick={revealAll} className="gate-button is-primary">
              Open the whole gallery
            </button>
          </section>
        ))}

      {/* The artist behind the camera: the Arts & Media record. */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-28 md:grid-cols-[auto_minmax(0,1fr)] md:px-8 lg:gap-20">
        <figure className="relative mx-auto w-[min(72vw,22rem)]">
          <CornerMarks />
          <CloakedAvatar klass="a" active className="w-full" />
          <Note arrow="arrow" className="absolute -right-6 -top-8 rotate-6 text-class" arrowClassName="rotate-[110deg]">
            before the camera, paint
          </Note>
        </figure>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-class">The artist&apos;s record</p>
          <h2 className="mt-2 font-headline text-4xl font-bold uppercase leading-none tracking-tight md:text-6xl">{arts?.category ?? "Arts"}</h2>
          <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            {arts?.items.map((item) => (
              <li key={item.title} className="grid gap-x-8 gap-y-1 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                <h3 className="font-headline text-lg font-bold leading-snug">{item.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">{item.description}</p>
              </li>
            ))}
          </ul>
          <Link href={siteConfig.socials.instagram} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:text-primary">
            <Doodle name="camera" className="h-6 w-8 text-class" /> Follow @ash.galleryyy
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <h2 className="mb-8 font-headline text-3xl font-bold uppercase leading-none tracking-tight md:text-5xl">More to discover</h2>
        <ul className="grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2">
          {others.map((o) => (
            <li key={o.key} className="bg-background/85 backdrop-blur-sm">
              <Link href={o.href} className="group flex items-center gap-5 p-6 transition-colors hover:bg-card">
                <span className="text-outline w-12 font-headline text-5xl font-bold leading-none transition-all group-hover:text-primary group-hover:[-webkit-text-stroke:0px]">{o.letter}</span>
                <span className="flex-1">
                  <span className="block font-headline text-xl font-bold uppercase">{o.role}</span>
                  <span className="block text-base text-muted-foreground">{o.line}</span>
                </span>
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-ink/40 group-hover:text-primary">{o.page} →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Footer />
      <Lightbox posts={posts} index={open} onChange={setOpen} />
    </main>
  );
}
