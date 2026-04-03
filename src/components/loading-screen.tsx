
"use client";

import { Progress } from "@/components/ui/progress";
import { siteConfig } from "@/lib/config";

interface LoadingScreenProps {
  progress: number;
  onComplete: () => void;
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-6">
      <div className="mb-8 flex items-center space-x-4 text-primary">
        <div className="h-12 w-12 border-4 border-t-transparent border-primary rounded-full animate-spin" />
        <div className="flex flex-col">
          <span className="text-2xl font-headline font-bold uppercase tracking-widest leading-none">Panda Portfolio</span>
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] opacity-50 mt-1">Initializing Experience</span>
        </div>
      </div>
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono">
          <span>Optimizing cinematic assets</span>
          <span className="text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1 bg-white/5" />
        <p className="text-center text-[8px] text-white/20 uppercase tracking-widest font-mono">
          Streaming {siteConfig.framesCount} frames • Background buffering enabled
        </p>
      </div>
    </div>
  );
}
