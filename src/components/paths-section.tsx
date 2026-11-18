"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { classes } from "@/lib/journey";
import { CloakedAvatar } from "@/components/hero/cloaked-avatar";
import { TiltCard } from "@/components/game/tilt-card";
import { CornerMarks, Hint } from "@/components/game/line-art";

function PathTile({ c, index }: { c: (typeof classes)[number]; index: number }) {
  const [active, setActive] = useState(false);

  return (
    <TiltCard onHover={setActive} className="h-full">
      <Link
        href={c.href}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        style={{ "--class": c.color } as React.CSSProperties}
        className="group relative flex h-full flex-col overflow-hidden border border-ink/10 bg-card transition-colors duration-500 hover:border-class/70"
      >
        {/* Where this path leads, kept faint behind the avatar. */}
        <Image src={c.scene} alt="" fill unoptimized sizes="(min-width: 768px) 33vw, 100vw" className="object-cover opacity-[0.13] grayscale transition-opacity duration-700 group-hover:opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-card/40 via-transparent to-card" />

        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5 [transform:translateZ(60px)]">
          <span className="font-headline text-7xl font-bold leading-none text-white mix-blend-difference transition-colors duration-500 group-hover:text-class group-hover:mix-blend-normal">{c.letter}</span>
          <span className="bg-black/50 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-ink/70 backdrop-blur">
            Path 0{index + 1}
            <span className="text-ink/20"> / 03</span>
          </span>
        </div>

        <CloakedAvatar klass={c.key} active={active} className="relative w-full [transform:translateZ(50px)]" />

        <div className="relative -mt-8 flex items-end justify-between gap-4 p-5 [transform:translateZ(30px)]">
          <div>
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-class">{c.page}</p>
            <h3 className="font-headline text-3xl font-bold uppercase tracking-tight">{c.role}</h3>
            <p className="mt-1 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">{c.line}</p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-class/40 text-class transition-all duration-500 group-hover:bg-class group-hover:text-black">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </Link>
      <CornerMarks />
    </TiltCard>
  );
}

export function PathsSection() {
  return (
    <section className="relative px-6 py-32 md:px-8">
      <div className="mx-auto max-w-7xl space-y-16">
        <div className="space-y-4 text-center">
          <span className="block font-mono text-xs uppercase tracking-widest text-primary">Level 04</span>
          <h2 className="font-headline text-4xl font-bold uppercase md:text-5xl">Choose Your Path</h2>
          <p>
            <Hint>Three cloaks, one player</Hint>
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {classes.map((c, i) => (
            <PathTile key={c.letter} c={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
