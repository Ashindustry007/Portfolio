"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { experience, publications } from "@/lib/config";
import { audio } from "@/lib/audio/engine";
import { useExperience } from "@/lib/experience";
import { TiltCard } from "@/components/game/tilt-card";
import { LevelHeader } from "@/components/game/level-header";
import { Doodle, Marked, Note } from "@/components/game/doodles";
import { Vignette } from "@/components/experience/vignettes";
import { OdiaField } from "@/components/experience/odia-field";
import { cn } from "@/lib/utils";

function QuestCard({ item, index }: { item: (typeof experience)[number]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  // Newest first on the page, so the newest carries the highest quest number.
  const quest = experience.length - index;

  return (
    <TiltCard max={5} className="h-full">
      <article className="relative flex h-full flex-col bg-card/80 backdrop-blur-sm">
        <span className="sketch-border" aria-hidden />
        <Vignette role={item} />
        <div className="flex flex-1 flex-col gap-4 p-6">
        <header>
          <p className="mb-2 flex items-center justify-between font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-primary">
            <span>Quest {String(quest).padStart(2, "0")}</span>
            {index === 0 && <span className="text-ink/45">Latest</span>}
          </p>
          <h3 className="font-headline text-xl font-bold leading-tight">{item.title}</h3>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">{item.company}</p>
        </header>
        <p className={cn("text-sm leading-relaxed text-muted-foreground", !expanded && "line-clamp-4")}>{item.description}</p>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.ul
              key="highlights"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="space-y-3 overflow-hidden"
            >
              {item.highlights.map((point, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
        <button
          type="button"
          data-sfx="none"
          onClick={() => {
            setExpanded((e) => !e);
            if (expanded) audio.close();
            else {
              audio.open();
              useExperience.getState().unlock("lore-reader");
            }
          }}
          aria-expanded={expanded}
          className="relative mt-auto inline-flex items-center gap-1.5 self-start font-mono text-[0.6875rem] uppercase tracking-widest text-primary/80 transition-colors hover:text-primary"
        >
          {expanded ? "Close log" : "Read full log"}
          <ChevronDown size={12} className={cn("transition-transform duration-300", expanded && "rotate-180")} />
        </button>
        </div>
        {index === 0 && <Doodle name="star" className="absolute -right-4 -top-4 h-9 w-9 text-primary" />}
      </article>
    </TiltCard>
  );
}

export function ExperienceSection() {
  return (
    <section className="relative px-6 py-32 md:px-8">
      <div className="mx-auto max-w-7xl space-y-16">
        <LevelHeader
          level={2}
          title={
            <>
              Experience &amp; <Marked>Research</Marked> Path
            </>
          }
          hint={`${experience.length} quests cleared`}
        >
          <Doodle name="chip" className="absolute -left-4 top-6 hidden h-14 w-14 -rotate-12 text-ink/25 md:block" />
          <Note arrow="arrow-down" className="absolute -right-8 bottom-0 hidden rotate-6 lg:inline-flex" arrowClassName="h-10 w-6">
            open any log
          </Note>
        </LevelHeader>

        <div className="grid items-start gap-7 md:grid-cols-2 lg:grid-cols-3">
          {experience.map((item, idx) => (
            <QuestCard key={item.company} item={item} index={idx} />
          ))}
        </div>

        {publications.length > 0 && (
          <div className="relative mx-auto max-w-4xl px-4 py-24 text-center">
            <OdiaField />
            <div className="relative">
            <p className="mb-6 flex items-center justify-center gap-3 font-mono text-xs uppercase tracking-widest text-primary">
              <Doodle name="bulb" className="h-7 w-5" /> Lore · Publications
            </p>
            {publications.map((pub) => (
              <div key={pub.title} className="space-y-2">
                <h3 className="font-headline text-lg font-bold leading-snug">
                  <Marked with="scribble">&ldquo;{pub.title}&rdquo;</Marked>
                </h3>
                <p className="pt-2 text-xs italic text-muted-foreground">{pub.authors}</p>
                <p className="font-mono text-[0.6875rem] uppercase tracking-widest text-primary/70">{pub.conference}</p>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
