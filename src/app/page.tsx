
"use client";

import { useState, useEffect, useRef } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { ParallaxHero } from "@/components/parallax-hero";
import { AboutSection } from "@/components/about-section";
import { ExperienceSection } from "@/components/experience-section";
import { ProjectsSection } from "@/components/projects-section";
import { BeyondSection } from "@/components/beyond-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { siteConfig } from "@/lib/config";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const CRITICAL_BATCH = 30;

  useEffect(() => {
    if (typeof window === "undefined") return;

    let loadedCount = 0;
    const batchSize = 5;

    const loadBatch = async (start: number, end: number) => {
      const promises = [];
      for (let i = start; i < end && i < siteConfig.framesCount; i++) {
        promises.push(new Promise<void>((resolve) => {
          const img = new Image();
          const idx = i.toString().padStart(3, "0");
          img.src = `${siteConfig.framesBaseUrl}${idx}${siteConfig.framesSuffix}`;
          img.onload = () => {
            imagesRef.current[i] = img;
            loadedCount++;
            if (i < CRITICAL_BATCH) {
              setLoadProgress(Math.round((loadedCount / CRITICAL_BATCH) * 100));
            }
            resolve();
          };
          img.onerror = () => {
            loadedCount++;
            resolve();
          };
        }));
      }
      await Promise.all(promises);
    };

    const startLoading = async () => {
      // Load critical batch first in small chunks to keep UI responsive
      for (let i = 0; i < CRITICAL_BATCH; i += batchSize) {
        await loadBatch(i, i + batchSize);
      }
      
      // Once critical batch is done, unlock the UI
      setLoading(false);

      // Continue loading the rest in the background
      for (let i = CRITICAL_BATCH; i < siteConfig.framesCount; i += batchSize) {
        await loadBatch(i, i + batchSize);
      }
    };

    startLoading();
  }, []);

  return (
    <main className="relative min-h-screen bg-background">
      {loading && (
        <LoadingScreen 
          progress={loadProgress}
          onComplete={() => setLoading(false)} 
        />
      )}
      
      <div className={loading ? "invisible" : "visible"}>
        <ParallaxHero sharedImages={imagesRef.current} />
        <div id="about">
          <AboutSection />
        </div>
        <ExperienceSection />
        <ProjectsSection />
        <BeyondSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  );
}
