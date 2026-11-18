"use client";

import { useMemo } from "react";
import { audio } from "@/lib/audio/engine";
import { captionTitle, type InstagramPost } from "@/hooks/use-instagram";
import { frameMonth, frameNumber } from "@/components/gallery/lightbox";
import { cn } from "@/lib/utils";

// The whole collection, hung the way a museum would: one room per year, each
// work matted and framed, lit from a rail above, with a small label beside it.

// A hang has rhythm: not every frame is the same width or sits at the same height.
const WIDTHS = ["w-full", "w-[84%]", "w-full", "w-[72%]", "w-[92%]", "w-full", "w-[80%]"];
const DROPS = ["mt-0", "mt-10", "mt-4", "mt-14", "mt-0", "mt-8", "mt-2"];

function Work({ post, index, onOpen }: { post: InstagramPost; index: number; onOpen: (i: number) => void }) {
  const title = captionTitle(post.caption);
  const k = index % WIDTHS.length;
  return (
    <li className={cn("mb-16 break-inside-avoid", DROPS[k])}>
      <figure className={cn("museum-work group mx-auto", WIDTHS[k])}>
        <button
          type="button"
          data-sfx="none"
          onClick={() => {
            audio.shutter();
            onOpen(index);
          }}
          aria-label={`Open work ${frameNumber(index)}${title ? `: ${title}` : ""}`}
          className="museum-frame block w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.media_url} alt={title || `Photograph ${frameNumber(index)}`} loading="lazy" decoding="async" className="block h-auto w-full" />
        </button>
        <figcaption className="museum-label">
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-primary">
            No. {frameNumber(index)} · {frameMonth(post.timestamp)}
          </span>
          {title && <span className="mt-1 block text-[0.95rem] leading-snug text-ink/85">{title}</span>}
        </figcaption>
      </figure>
    </li>
  );
}

export function Museum({ posts, onOpen }: { posts: InstagramPost[]; onOpen: (i: number) => void }) {
  const rooms = useMemo(() => {
    const byYear = new Map<number, { post: InstagramPost; index: number }[]>();
    posts.forEach((post, index) => {
      const year = new Date(post.timestamp).getFullYear();
      byYear.set(year, [...(byYear.get(year) ?? []), { post, index }]);
    });
    return [...byYear.entries()].sort((a, b) => b[0] - a[0]);
  }, [posts]);

  return (
    <section aria-label="The collection" className="museum relative">
      <header className="mx-auto max-w-7xl px-6 pb-6 pt-28 md:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">The collection</p>
        <h2 className="mt-2 font-headline text-5xl font-bold uppercase leading-[0.9] tracking-tight md:text-7xl">
          {posts.length} works,
          <br />
          <span className="text-outline">{rooms.length} rooms</span>
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">Everything from the feed, hung by year. Step up to any frame to read its label; click to see it alone.</p>
      </header>

      {rooms.map(([year, works], r) => (
        <div key={year} className="museum-room relative overflow-hidden">
          {/* The lighting rail, and the pools of light it throws on the wall. */}
          <div className="museum-rail" aria-hidden />
          <div className="mx-auto max-w-[110rem] px-6 pb-10 pt-24 md:px-10">
            <div className="mb-16 flex items-end justify-between gap-6 border-b border-ink/10 pb-5">
              <h3 className="font-headline text-6xl font-bold leading-none tracking-tighter md:text-8xl">
                <span className="text-outline">{year}</span>
              </h3>
              <p className="text-right font-mono text-[0.6875rem] uppercase leading-relaxed tracking-[0.25em] text-ink/50">
                Room {String(r + 1).padStart(2, "0")}
                <br />
                {works.length} {works.length === 1 ? "work" : "works"}
              </p>
            </div>
            <ul className="columns-1 gap-x-14 sm:columns-2 lg:columns-3 lg:gap-x-20 min-[1900px]:columns-4">
              {works.map(({ post, index }) => (
                <Work key={post.id} post={post} index={index} onOpen={onOpen} />
              ))}
            </ul>
          </div>
        </div>
      ))}
    </section>
  );
}
