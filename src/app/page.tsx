
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
  const criticalLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const totalFrames = siteConfig.framesCount;
    const criticalThreshold = 25; // Unlock the site after these many frames
    let loadedCount = 0;

    const loadImage = (index: number) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        const idx = index.toString().padStart(3, "0");
        img.src = `${siteConfig.framesBaseUrl}${idx}${siteConfig.framesSuffix}`;
        img.onload = () => {
          imagesRef.current[index] = img;
          loadedCount++;
          
          // Update progress relative to critical threshold for the loader
          if (!criticalLoadedRef.current) {
            const progress = Math.min(100, Math.round((loadedCount / criticalThreshold) * 100));
            setLoadProgress(progress);
            
            if (loadedCount >= criticalThreshold) {
              criticalLoadedRef.current = true;
              setTimeout(() => setLoading(false), 500);
            }
          }
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          resolve();
        };
      });
    };

    const startLoading = async () => {
      // 1. Load critical frames first (Sequential for stability)
      for (let i = 0; i < criticalThreshold; i++) {
        await loadImage(i);
      }

      // 2. Load remaining frames in small background batches (Non-blocking)
      const backgroundBatchSize = 5;
      for (let i = criticalThreshold; i < totalFrames; i += backgroundBatchSize) {
        const batch = [];
        for (let j = i; j < i + backgroundBatchSize && j < totalFrames; j++) {
          batch.push(loadImage(j));
        }
        // Use requestIdleCallback if available, otherwise just await the batch
        if ('requestIdleCallback' in window) {
          await new Promise(resolve => window.requestIdleCallback(async () => {
            await Promise.all(batch);
            resolve(null);
          }));
        } else {
          await Promise.all(batch);
        }
      }
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
