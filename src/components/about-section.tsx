"use client";

import { PlaceHolderImages } from "@/lib/placeholder-images";
import { TiltCard } from "@/components/game/tilt-card";
import { SketchImage } from "@/components/game/sketch-image";
import { CornerMarks } from "@/components/game/line-art";
import { Dimension, Doodle, Marked, Note } from "@/components/game/doodles";

export function AboutSection() {
  const avatar = PlaceHolderImages.find((img) => img.id === "avatar");

  return (
    <section className="relative overflow-hidden px-6 py-32 md:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-20 lg:grid-cols-2">
        <div className="relative mx-auto w-full max-w-xl">
          <TiltCard>
            <figure className="relative -rotate-2 border border-ink/15 bg-card p-3 pb-12 shadow-2xl shadow-black/50">
              {avatar?.imageUrl && <SketchImage src={avatar.imageUrl} alt={avatar.description || "About Ashish"} className="aspect-video" lens={95} />}
              <figcaption className="absolute inset-x-4 bottom-2.5 flex items-baseline justify-between">
                <span className="font-hand text-2xl text-ink/80">the player, off duty</span>
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-ink/35">Fig. 01</span>
              </figcaption>
            </figure>
          </TiltCard>
          <CornerMarks className="-inset-4" />
          <Note arrow="arrow" className="absolute -top-10 right-2 rotate-3" arrowClassName="order-first rotate-[150deg]">
            move your cursor over me
          </Note>
          <Doodle name="star" className="absolute -bottom-8 -left-6 h-10 w-10 text-primary" delay={0.4} />
          <Doodle name="spark" className="absolute -right-5 top-1/2 h-7 w-7 text-ink/40" delay={0.7} />
        </div>

        <div className="relative space-y-6">
          <div className="space-y-2">
            <span className="block font-mono text-xs uppercase tracking-widest text-primary">
              Level 01 <span className="text-ink/30">/</span> Origin
            </span>
            <h2 className="font-headline text-3xl font-bold leading-tight md:text-4xl">
              Shaping the Future of <br />
              <Marked with="circle" className="text-primary">
                AI-Powered Creation
              </Marked>
            </h2>
          </div>

          <div className="max-w-xl space-y-4 leading-relaxed text-muted-foreground">
            <p>
              I am an AI Engineer currently pursuing my MSCS at UC San Diego, driven by the challenge of bridging the gap between theoretical research and scalable, real-world systems. My focus lies at the intersection of{" "}
              <Marked className="text-foreground">Computer Vision and Agentic AI</Marked>.
            </p>
            <p>
              With a foundation from OUTR (B.Tech), I have spent my academic and professional career developing intelligent pipelines that solve complex problems, from healthcare audio bio-markers and cancer risk assessment via spatial transcriptomics to agentic automation of pre-silicon chip design.
            </p>
          </div>

          <Dimension label="OUTR → UC San Diego" className="max-w-md pt-2" />

          <div className="grid max-w-md grid-cols-2 gap-6">
            <div className="relative space-y-1 pl-7">
              <Doodle name="pin" className="absolute left-0 top-0 h-6 w-4 text-primary" />
              <h3 className="font-headline text-[0.75rem] font-bold uppercase tracking-wider">Education</h3>
              <p className="font-mono text-[0.6875rem] uppercase tracking-widest text-muted-foreground">MSCS @ UC San Diego</p>
              <p className="font-mono text-[0.6875rem] uppercase tracking-widest text-muted-foreground">B.Tech @ OUTR</p>
            </div>
            <div className="relative space-y-1 pl-9">
              <Doodle name="bulb" className="absolute left-0 top-0 h-7 w-6 text-primary" delay={0.3} />
              <h3 className="font-headline text-[0.75rem] font-bold uppercase tracking-wider">Focus</h3>
              <p className="font-mono text-[0.6875rem] uppercase tracking-widest text-muted-foreground">Deep Learning / Computer Vision</p>
              <p className="font-mono text-[0.6875rem] uppercase tracking-widest text-muted-foreground">Agentic AI Systems</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
