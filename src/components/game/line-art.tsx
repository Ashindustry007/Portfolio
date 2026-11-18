import { cn } from "@/lib/utils";

function Plus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" className={cn("absolute h-3 w-3", className)} aria-hidden>
      <path d="M6 0v12M0 6h12" />
    </svg>
  );
}

/** Registration marks at the four corners of the nearest positioned ancestor. */
export function CornerMarks({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 text-white/35", className)} aria-hidden>
      <Plus className="-left-1.5 -top-1.5" />
      <Plus className="-right-1.5 -top-1.5" />
      <Plus className="-bottom-1.5 -left-1.5" />
      <Plus className="-bottom-1.5 -right-1.5" />
    </div>
  );
}

/** [ Bracketed ] mono caption, the site's way of labelling something you can do. */
export function Hint({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-[0.625rem] uppercase tracking-[0.3em] text-white/45", className)}>
      <span className="text-primary">[</span> {children} <span className="text-primary">]</span>
    </span>
  );
}
