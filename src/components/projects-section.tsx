"use client";

import { Github, Trophy } from "lucide-react";
import { projects } from "@/lib/config";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useExperience } from "@/lib/experience";
import { TiltCard } from "@/components/game/tilt-card";
import { SketchImage } from "@/components/game/sketch-image";
import { LevelHeader } from "@/components/game/level-header";
import { Doodle, Marked, Note } from "@/components/game/doodles";

export function ProjectsSection() {
  return (
    <section className="relative px-6 py-32 md:px-8">
      <div className="mx-auto max-w-7xl space-y-16">
        <LevelHeader
          level={3}
          title={
            <>
              Featured <Marked with="circle">Projects</Marked>
            </>
          }
          hint={`${projects.length} builds in the inventory`}
        >
          <Doodle name="brackets" className="absolute -right-2 top-4 hidden h-12 w-20 rotate-6 text-ink/25 md:block" />
        </LevelHeader>

        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, idx) => {
            const image = PlaceHolderImages.find((img) => img.id === project.imageKey);
            const Wrapper = project.link ? "a" : "div";
            const linkProps = project.link
              ? { href: project.link, target: "_blank", rel: "noopener noreferrer", onClick: () => useExperience.getState().unlock("window-shopper") }
              : {};
            return (
              <TiltCard key={project.title} max={6}>
                <Wrapper {...linkProps} className="group relative block">
                  <div className="relative mb-6 p-2">
                    <span className="sketch-border" aria-hidden />
                    {image && <SketchImage src={image.imageUrl} alt={image.description} className="aspect-[3/2] bg-card" lens={85} />}
                    {project.award && (
                      <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-black shadow-lg shadow-primary/30">
                        <Trophy size={14} strokeWidth={2.5} />
                        <span className="font-mono text-[0.6875rem] font-bold uppercase tracking-widest">Winner</span>
                      </span>
                    )}
                    <span className="absolute -bottom-2 right-3 bg-background px-2 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-ink/40">Build {String(idx + 1).padStart(2, "0")}</span>
                  </div>
                  {project.award && (
                    <Note className="absolute -right-3 -top-7 rotate-6">
                      <Doodle name="star" className="h-6 w-6" /> won it!
                    </Note>
                  )}
                  <div className="space-y-3 px-2">
                    <h3 className="font-headline text-2xl font-bold leading-tight transition-colors group-hover:text-primary">{project.title}</h3>
                    {project.award && (
                      <p className="flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-widest text-primary">
                        <Trophy size={12} />
                        {project.award}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                    <div className="flex items-center gap-2 pt-3">
                      <span className="h-px w-8 bg-primary/40 transition-all duration-500 group-hover:w-14" />
                      {project.link ? (
                        <span className="flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-widest text-primary/70 transition-colors group-hover:text-primary">
                          <Github size={12} />
                          View on GitHub
                        </span>
                      ) : (
                        <span className="font-mono text-[0.6875rem] uppercase tracking-widest text-primary/70">Technical Case Study</span>
                      )}
                    </div>
                  </div>
                </Wrapper>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
