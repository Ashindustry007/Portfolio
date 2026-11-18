"use client";

import { useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { audio } from "@/lib/audio/engine";
import { startLenis, stopLenis } from "@/lib/scroll";
import { captionTags, captionTitle, type InstagramPost } from "@/hooks/use-instagram";
import { cn } from "@/lib/utils";

export const frameNumber = (n: number) => String(n + 1).padStart(3, "0");
export const frameMonth = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });

const button = "flex h-11 w-11 shrink-0 items-center justify-center border border-ink/20 bg-background/60 transition-colors hover:border-primary hover:text-primary";

/** One photo, full screen, with the rest of the roll along the bottom. */
export function Lightbox({ posts, index, onChange }: { posts: InstagramPost[]; index: number | null; onChange: (i: number | null) => void }) {
  const post = index === null ? null : posts[index];
  const strip = useRef<HTMLDivElement>(null);
  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    stopLenis();
    return () => startLenis();
  }, [open]);

  // Keep the current frame in view on the filmstrip.
  useEffect(() => {
    if (index === null) return;
    strip.current?.querySelector<HTMLElement>(`[data-thumb="${index}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [index]);

  const step = (by: number) => {
    if (index === null) return;
    audio.shutter();
    onChange((index + by + posts.length) % posts.length);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onChange(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[150] bg-black/95" />
        <Dialog.Content
          className="fixed inset-0 z-[151] flex flex-col gap-3 p-3 outline-none sm:p-5"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
        >
          {post && index !== null && (
            <>
              <div className="flex items-center justify-between gap-4">
                <Dialog.Title className="font-mono text-xs uppercase tracking-[0.25em] text-ink/80">
                  <span className="text-primary">●</span> {frameNumber(index)} <span className="text-ink/40">/ {String(posts.length).padStart(3, "0")}</span>
                  <span className="ml-4 text-ink/50">{frameMonth(post.timestamp)}</span>
                </Dialog.Title>
                <Dialog.Close className={button} aria-label="Close">
                  <X size={16} />
                </Dialog.Close>
              </div>

              {/* Side by side when the screen is wide, stacked when it is tall. */}
              <div className="flex min-h-0 flex-1 flex-col gap-4 landscape:flex-row landscape:items-stretch">
                <div className="relative min-h-0 flex-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img key={post.id} src={post.media_url} alt={captionTitle(post.caption) || `Photograph ${frameNumber(index)}`} className="absolute inset-0 h-full w-full object-contain animate-in fade-in duration-500" />
                </div>
                <div data-lenis-prevent className="flex max-h-[32%] shrink-0 flex-col gap-4 overflow-y-auto landscape:max-h-none landscape:w-[min(34%,26rem)] landscape:justify-end">
                  <Dialog.Description className="whitespace-pre-line text-lg leading-relaxed text-foreground md:text-xl">
                    {post.caption.replace(/#\S+/g, "").trim() || "Untitled"}
                  </Dialog.Description>
                  {captionTags(post.caption).length > 0 && <p className="font-mono text-[0.75rem] uppercase leading-relaxed tracking-[0.15em] text-primary/80">{captionTags(post.caption).join("  ")}</p>}
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={button}>
                      <ArrowLeft size={16} />
                    </button>
                    <button type="button" onClick={() => step(1)} aria-label="Next photo" className={button}>
                      <ArrowRight size={16} />
                    </button>
                    <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="ml-2 font-mono text-[0.75rem] uppercase tracking-[0.2em] underline decoration-primary underline-offset-4 hover:text-primary">
                      View on Instagram
                    </a>
                  </div>
                </div>
              </div>

              <div ref={strip} data-lenis-prevent className="film-strip flex shrink-0 gap-1 overflow-x-auto py-2">
                {posts.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    data-thumb={i}
                    data-sfx="none"
                    onClick={() => {
                      audio.shutter();
                      onChange(i);
                    }}
                    aria-label={`Photo ${frameNumber(i)}`}
                    aria-current={i === index}
                    className={cn("h-12 w-10 shrink-0 overflow-hidden transition-all sm:h-14 sm:w-12", i === index ? "opacity-100 outline outline-1 outline-primary" : "opacity-45 hover:opacity-100")}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.media_url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
