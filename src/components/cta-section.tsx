
"use client";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Doodle, Marked, Note } from "@/components/game/doodles";

export function CTASection() {
  return (
    <section className="relative px-6 py-[clamp(5rem,20vh,12rem)] md:px-8 bg-background border-t border-ink/5 overflow-hidden group">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0 opacity-90 transition-opacity duration-700">
        <Image
          src="/images/15d1e769-a062-4f93-9554-bf19ab63428e-ezgif.com-png-to-webp-converter.webp"
          alt="CTA Background"
          fill
          unoptimized={true}
          className="object-cover object-[95%_center] translate-x-[10%] transition-all duration-1000 group-hover:scale-105"
        />
        {/* Left-to-right gradient to ensure text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
        {/* Top and bottom fades for smooth transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl space-y-12"
        >
          <div className="space-y-4">
            <span className="text-primary font-mono text-xs uppercase tracking-[0.4em] block">Level 05 / Continue?</span>
            <h2 className="text-[length:clamp(2.6rem,min(11vw,17vh),6rem)] font-headline font-bold leading-[0.9] uppercase tracking-tighter">
              Let&apos;s Build <br />
              <span className="text-primary">Intelligent <Marked>Systems</Marked></span> <br />
              Together
            </h2>
          </div>
          
          <div className="relative flex flex-col sm:flex-row justify-start items-center gap-6">
            <Note arrow="arrow-down" className="absolute -top-14 left-40 hidden -rotate-3 md:inline-flex" arrowClassName="h-10 w-6">
              press start
            </Note>
            <Doodle name="paw" className="absolute -bottom-16 left-2 hidden h-9 w-9 rotate-12 text-ink/30 md:block" />
            <Doodle name="paw" className="absolute -bottom-24 left-16 hidden h-9 w-9 -rotate-6 text-ink/20 md:block" delay={0.4} />
            <Button asChild size="lg" className="h-14 px-10 rounded-full font-headline uppercase tracking-widest text-sm transition-all hover:scale-105 bg-primary text-black hover:bg-primary/90 shadow-2xl shadow-primary/20">
              <Link href={siteConfig.socials.github}>View GitHub Repo</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full font-headline uppercase tracking-widest text-sm transition-all hover:scale-105 border-white/20 hover:border-primary backdrop-blur-sm">
              <Link href={siteConfig.socials.email}>Contact Me</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
