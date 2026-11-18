import { levels } from "@/lib/journey";
import { Hint } from "@/components/game/line-art";
import { Dimension } from "@/components/game/doodles";
import { cn } from "@/lib/utils";

/** The title block every level opens with. */
export function LevelHeader({ level, title, hint, className, children }: { level: number; title: React.ReactNode; hint?: string; className?: string; children?: React.ReactNode }) {
  return (
    <header className={cn("relative mx-auto max-w-3xl space-y-4 text-center", className)}>
      <span className="block font-mono text-xs uppercase tracking-widest text-primary">
        Level {levels[level].code} <span className="text-ink/30">/</span> {levels[level].name}
      </span>
      <h2 className="font-headline text-4xl font-bold uppercase leading-[1.05] md:text-5xl">{title}</h2>
      {hint && (
        <p>
          <Hint>{hint}</Hint>
        </p>
      )}
      <Dimension label={levels[level].hint} className="mx-auto max-w-xs pt-3" />
      {children}
    </header>
  );
}
