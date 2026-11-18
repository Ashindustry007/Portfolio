"use client";

import { useEffect } from "react";
import { HeroSection } from "@/components/hero/hero-section";
import { AboutSection } from "@/components/about-section";
import { ExperienceSection } from "@/components/experience-section";
import { ProjectsSection } from "@/components/projects-section";
import { PathsSection } from "@/components/paths-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { LevelSection } from "@/components/game/level-section";
import { scrollToTarget } from "@/lib/scroll";
import { TopoField } from "@/components/game/topo-field";

const SCROLL_KEY = "home-scroll-y";

export default function Home() {
  // Coming back from a sub-page returns the visitor to where they left the route.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SCROLL_KEY);
      if (saved) requestAnimationFrame(() => scrollToTarget(Number(saved), { immediate: true }));
    } catch {}

    let frame = 0;
    const save = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        try {
          sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
        } catch {}
      });
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      window.removeEventListener("scroll", save);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-background">
      {/* A contour map under the whole route; it parts around the cursor. */}
      <TopoField className="z-0" strength={0.5} />
      <div className="relative z-10">
      <LevelSection index={0}>
        <HeroSection />
      </LevelSection>
      <LevelSection index={1}>
        <div id="about">
          <AboutSection />
        </div>
      </LevelSection>
      <LevelSection index={2}>
        <ExperienceSection />
      </LevelSection>
      <LevelSection index={3}>
        <ProjectsSection />
      </LevelSection>
      <LevelSection index={4}>
        <PathsSection />
      </LevelSection>
      <LevelSection index={5}>
        <CTASection />
        <Footer />
      </LevelSection>
      </div>
    </main>
  );
}
