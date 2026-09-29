
"use client";

import { useState } from "react";
import { experience, publications } from "@/lib/config";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

function ExperienceCard({ item, index }: { item: (typeof experience)[number]; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-background border-white/5 hover:border-primary/50 transition-all duration-500 group flex flex-col">
      <CardHeader>
        <span className="text-primary font-mono text-sm mb-2 block">0{index + 1}</span>
        <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">
          {item.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
          {item.company}
        </p>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <p className={cn("text-sm text-muted-foreground leading-relaxed", !expanded && "line-clamp-4")}>
          {item.description}
        </p>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.ul
              key="highlights"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden space-y-3"
            >
              {item.highlights.map((point, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="mt-auto self-start inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary/70 hover:text-primary transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronDown size={12} className={cn("transition-transform duration-300", expanded && "rotate-180")} />
        </button>
      </CardContent>
    </Card>
  );
}

export function ExperienceSection() {
  return (
    <section className="py-32 px-8 bg-[#161412]">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-primary font-mono text-xs uppercase tracking-widest block">Professional Journey</span>
          <h2 className="text-5xl font-headline font-bold uppercase">Experience & Research Path</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {experience.map((item, idx) => (
            <ExperienceCard key={idx} item={item} index={idx} />
          ))}
        </div>

        {publications.length > 0 && (
          <div className="pt-16">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-grow bg-white/10" />
                <div className="flex items-center gap-2 text-primary">
                  <BookOpen size={16} />
                  <span className="text-xs font-mono uppercase tracking-widest">Publications</span>
                </div>
                <div className="h-px flex-grow bg-white/10" />
              </div>
              
              {publications.map((pub, idx) => (
                <div key={idx} className="text-center space-y-2">
                  <h3 className="text-lg font-headline font-bold text-white leading-snug">
                    "{pub.title}"
                  </h3>
                  <p className="text-xs text-muted-foreground italic">{pub.authors}</p>
                  <p className="text-[10px] text-primary/60 font-mono uppercase tracking-widest">
                    {pub.conference}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
