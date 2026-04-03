
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
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let loadedCount = 0;
    const totalFrames = siteConfig.framesCount;
    const batchSize = 5;

    const loadBatch = async (start: number, end: number) => {
      const promises = [];
      for (let i = start; i < end && i < totalFrames; i++) {
        promises.push(new Promise<void>((resolve) => {
          const img = new Image();
          const idx = i.toString().padStart(3, "0");
          img.src = `${siteConfig.framesBaseUrl}${idx}${siteConfig.framesSuffix}`;
          img.onload = () => {
            imagesRef.current[i] = img;
            loadedCount++;
            setLoadProgress(Math.round((loadedCount / totalFrames) * 100));
            resolve();
          };
          img.onerror = () => {
            loadedCount++;
            setLoadProgress(Math.round((loadedCount / totalFrames) * 100));
            resolve();
          };
        }));
      }
      await Promise.all(promises);
    };

    const startLoading = async () => {
      // Load all frames in batches
      for (let i = 0; i < totalFrames; i += batchSize) {
        await loadBatch(i, i + batchSize);
      }
      
      // Slight delay for a smooth transition after 100%
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    startLoading();
  }, []);

  return (
    <main className="relative min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen 
            key="loader"
            progress={loadProgress}
            onComplete={() => setLoading(false)} 
          />
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <ParallaxHero sharedImages={imagesRef.current} />
            <div id="about">
              <AboutSection />
            </div>
            <ExperienceSection />
            <ProjectsSection />
            <BeyondSection />
            <CTASection />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
