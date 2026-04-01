"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/config";
import { Footer } from "@/components/footer";
import { ArrowLeft, Instagram, Maximize2, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { fetchPhotography, type PhotographyItem } from "@/ai/flows/fetch-photography-flow";

export default function PhotographyPage() {
  const [photos, setPhotos] = useState<PhotographyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 600], [1, 0.3]);

  useEffect(() => {
    async function loadPhotos() {
      try {
        const data = await fetchPhotography();
        setPhotos(data);
      } catch (error) {
        console.error("Failed to fetch photography feed:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPhotos();
  }, []);

  return (
    <main className="relative min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Background Layers */}
      <motion.div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://uobfpmgknyqxdsdvqcfe.supabase.co/storage/v1/object/public/Portfolio/Whisk_e2dcaa7c302f8248dbc4a95e628ab799eg-ezgif.com-png-to-webp-converter.webp')`,
          opacity: bgOpacity 
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-r from-background via-background/60 to-transparent pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none" />

      {/* Content Layer */}
      <div className="relative z-10">
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Portfolio
            </Link>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">
              @ash.galleryyy
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-32 px-8 border-b border-white/5 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="space-y-6 max-w-2xl">
              <span className="text-primary font-mono text-xs uppercase tracking-widest block">Cinematic Photography</span>
              <h1 className="text-5xl md:text-7xl font-headline font-bold leading-none uppercase">
                Through <br />
                <span className="text-outline text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.8)' }}>
                  The Lens
                </span>
              </h1>
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider max-w-lg leading-relaxed">
                Active feed from @ash.galleryyy. A curated visual narrative of light, structure, and human stories.
              </p>
              
              <Link 
                href={siteConfig.socials.instagram} 
                target="_blank"
                className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest hover:bg-primary hover:text-black transition-all duration-500 group"
              >
                <Instagram size={16} className="group-hover:scale-110 transition-transform" />
                Follow @ash.galleryyy
              </Link>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-24 px-8 min-h-[600px]">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-4">
                <Loader2 className="text-primary animate-spin" size={40} />
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Fetching feed...</p>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 animate-in fade-in duration-1000">
                {photos.map((photo) => (
                  <div 
                    key={photo.id} 
                    className="relative group overflow-hidden rounded-2xl break-inside-avoid bg-white/[0.02] border border-white/5 shadow-2xl"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image
                        src={`https://picsum.photos/seed/${photo.imageSeed}/800/1000`}
                        alt={photo.title}
                        width={800}
                        height={1000}
                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <div className="space-y-1">
                              <h3 className="text-xl font-headline font-bold text-white leading-tight">{photo.title}</h3>
                              <p className="text-[10px] font-mono text-primary uppercase tracking-widest">{photo.location}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                              <Maximize2 size={16} className="text-white" />
                            </div>
                          </div>
                          {photo.caption && (
                            <p className="text-[11px] text-white/60 leading-relaxed italic border-t border-white/10 pt-4">
                              "{photo.caption}"
                            </p>
                          )}
                          <div className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
                            {photo.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
