"use client";

import { projects } from "@/lib/config";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { motion } from "framer-motion";
import { Github, Trophy } from "lucide-react";

export function ProjectsSection() {
  return (
    <section className="py-32 px-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <span className="text-primary font-mono text-xs uppercase tracking-widest block">Work</span>
            <h2 className="text-5xl font-headline font-bold uppercase">Featured Projects</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project, idx) => {
            const imgData = PlaceHolderImages.find(img => img.id === project.imageKey);
            const Wrapper = project.link ? "a" : "div";
            const linkProps = project.link
              ? { href: project.link, target: "_blank", rel: "noopener noreferrer" }
              : {};
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (idx % 3) * 0.1 }}
                viewport={{ once: true }}
              >
              <Wrapper {...linkProps} className="group block cursor-pointer">
                <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-6 border border-white/5 bg-white/[0.02]">
                  {imgData && (
                    <Image
                      src={imgData.imageUrl}
                      alt={project.title}
                      fill
                      unoptimized={true}
                      className="object-cover object-center grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                      data-ai-hint={imgData.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {project.award && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-black shadow-lg shadow-primary/30">
                      <Trophy size={14} strokeWidth={2.5} />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Winner</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-headline font-bold group-hover:text-primary transition-colors leading-tight">
                    {project.title}
                  </h3>
                  {project.award && (
                    <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-primary">
                      <Trophy size={12} />
                      {project.award}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                  <div className="pt-4 flex items-center gap-2">
                    <div className="h-px w-8 bg-primary/30 group-hover:w-12 transition-all duration-500" />
                    {project.link ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary/60 group-hover:text-primary transition-colors">
                        <Github size={12} />
                        View on GitHub
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Technical Case Study</span>
                    )}
                  </div>
                </div>
              </Wrapper>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}