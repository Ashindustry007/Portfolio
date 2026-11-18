"use client";

import { useRef } from "react";
import type { experience } from "@/lib/config";

// A small scene at the top of each quest card, drawn from what the work was.
// Any figure shown is read out of the role's own text in config.ts, so the
// scene can never disagree with the card beneath it.

type Role = (typeof experience)[number];
const textOf = (role: Role) => [role.description, ...role.highlights].join(" ");
const find = (role: Role, pattern: RegExp) => textOf(role).match(pattern)?.[1];

/** Publishes the pointer's position inside the scene as --mx / --my (0..100%). */
function useLocalPointer() {
  const ref = useRef<HTMLDivElement>(null);
  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };
  return { ref, onPointerMove };
}

function Stat({ value, label }: { value?: string; label: string }) {
  if (!value) return null;
  return (
    <p className="absolute bottom-2 right-3 text-right font-mono text-[0.625rem] uppercase leading-tight tracking-[0.2em] text-ink/45">
      <span className="block font-headline text-xl font-bold tracking-tight text-primary">{value}</span>
      {label}
    </p>
  );
}

const frame = "vg relative h-32 overflow-hidden border-b border-ink/10 bg-black/25";
const line = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Qualcomm: an agent driving a web page by itself. */
function AgentBrowser({ role }: { role: Role }) {
  return (
    <div className={frame}>
      <svg viewBox="0 0 320 128" className="h-full w-full text-ink/45" aria-hidden>
        <g {...line} strokeWidth="1">
          <rect x="14" y="12" width="206" height="104" rx="5" />
          <path d="M14 30h206" />
          <rect x="62" y="17" width="110" height="8" rx="4" strokeOpacity="0.5" />
          <path d="M26 44h70M26 54h44" strokeOpacity="0.6" />
          <rect className="vg-target" style={{ "--d": "0s" } as React.CSSProperties} x="26" y="64" width="52" height="14" rx="2" />
          <rect className="vg-target" style={{ "--d": "1.6s" } as React.CSSProperties} x="112" y="42" width="96" height="36" rx="2" />
          <path d="M112 54h96M112 66h96M144 42v36M176 42v36" strokeOpacity="0.4" />
          <rect className="vg-target" style={{ "--d": "3.2s" } as React.CSSProperties} x="26" y="90" width="182" height="16" rx="8" />
        </g>
        <circle cx="24" cy="21" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="32" cy="21" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="40" cy="21" r="2" fill="currentColor" opacity="0.5" />
        <text x="36" y="101.5" className="fill-primary font-mono" fontSize="7">
          &gt; drive the portal in plain words
        </text>
        {/* The agent's cursor makes its rounds: button, table, prompt. */}
        <path className="vg-agent fill-primary" d="M0 0l0 13 3.5-3.5 2.5 6 2.2-1-2.5-5.8 5 0z" />
        {/* The chip all this is in service of. */}
        <g {...line} strokeWidth="1" className="text-primary/70">
          <rect x="250" y="34" width="42" height="42" />
          <rect x="261" y="45" width="20" height="20" />
          <path d="M258 34v-9M271 34v-9M284 34v-9M258 85v-9M271 85v-9M284 85v-9M241 42h9M241 55h9M241 68h9M292 42h9M292 55h9M292 68h9" />
        </g>
      </svg>
      <Stat value={find(role, /(\d+) JavaScript browser-automation playbooks/)} label="playbooks" />
    </div>
  );
}

// Fixed, irregular cell positions for the tissue slide.
// Rounded, so the server and the browser print exactly the same markup.
const round = (n: number) => Math.round(n * 10) / 10;
const CELLS = Array.from({ length: 64 }, (_, i) => {
  const col = i % 16, row = Math.floor(i / 16);
  const jitter = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1) * 0.5;
  return { x: round(12 + col * 19.5 + jitter(1) * 12), y: round(18 + row * 28 + jitter(2) * 14), r: round(6.5 + Math.abs(jitter(3)) * 6) };
});

/** Boolean Lab: tissue under the microscope; the cursor paints the segmentation. */
function TissueSegment({ role }: { role: Role }) {
  const local = useLocalPointer();
  const cells = (className: string, extra?: React.SVGProps<SVGGElement>) => (
    <g className={className} {...extra}>
      {CELLS.map((c, i) => (
        <ellipse key={i} cx={c.x} cy={c.y} rx={c.r} ry={round(c.r * 0.82)} transform={`rotate(${(i * 37) % 180} ${c.x} ${c.y})`} />
      ))}
    </g>
  );
  return (
    <div {...local} className={frame}>
      <svg viewBox="0 0 320 128" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full text-ink/35" aria-hidden>
        {cells("", { ...line, strokeWidth: 1 })}
      </svg>
      {/* The predicted mask, shown only in a patch that follows the cursor (or drifts when left alone). */}
      <svg viewBox="0 0 320 128" preserveAspectRatio="xMidYMid slice" className="vg-reveal absolute inset-0 h-full w-full" aria-hidden>
        {cells("", { fill: "hsl(var(--primary) / 0.55)", stroke: "hsl(var(--primary))", strokeWidth: 1.2 })}
      </svg>
      <p className="absolute left-3 top-2 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-ink/40">Crypt segmentation</p>
      <Stat value={find(role, /(\d+%) mIoU/)} label="mIoU" />
    </div>
  );
}

/** Open Financial: a paper invoice being read by the OCR. */
function InvoiceScan({ role }: { role: Role }) {
  const fields = [
    { y: 26, w: 70, label: "Vendor", d: "0.3s" },
    { y: 54, w: 46, label: "Date", d: "1.1s" },
    { y: 82, w: 58, label: "Total", d: "1.9s" },
  ];
  return (
    <div className={frame}>
      <svg viewBox="0 0 320 128" className="h-full w-full text-ink/45" aria-hidden>
        <g {...line} strokeWidth="1">
          <path d="M22 8h112v104l-9 6-10-6-9 6-10-6-9 6-10-6-9 6-9-6-10 6-9-6-9 6-9-6z" />
          <path d="M34 24h40M34 34h72M34 52h30M34 62h84M34 80h36M34 90h78" strokeOpacity="0.5" />
          {fields.map((f) => (
            <g key={f.label} className="vg-field text-primary" style={{ "--d": f.d } as React.CSSProperties}>
              <rect x="30" y={f.y - 7} width={f.w + 8} height="15" rx="1.5" />
              <path d={`M${f.w + 38} ${f.y}h${118 - f.w}`} strokeDasharray="2 3" />
              <rect x="158" y={f.y - 8} width="70" height="16" rx="2" fill="hsl(var(--primary) / 0.12)" />
              <text x="164" y={f.y + 3} fontSize="7" stroke="none" className="fill-primary font-mono uppercase" letterSpacing="1">
                {f.label}
              </text>
            </g>
          ))}
        </g>
        <rect className="vg-scanline" x="16" y="6" width="124" height="2" fill="hsl(var(--primary))" />
      </svg>
      <Stat value={find(role, /(\d+%) of invoices/)} label="invoices auto-read" />
    </div>
  );
}

/** Pucho: an mRNA strand, and a scan with a heat spot where the model is looking. */
function HelixHeat({ role }: { role: Role }) {
  const local = useLocalPointer();
  const strand = (phase: number) =>
    Array.from({ length: 33 }, (_, i) => `${i === 0 ? "M" : "L"}${10 + i * 5} ${(64 + Math.sin(i * 0.5 + phase) * 26).toFixed(1)}`).join(" ");
  return (
    <div {...local} className={frame}>
      <svg viewBox="0 0 320 128" className="h-full w-full text-ink/45" aria-hidden>
        <g {...line} strokeWidth="1.2">
          <path d={strand(0)} className="text-primary" />
          <path d={strand(Math.PI)} strokeOpacity="0.5" />
          {Array.from({ length: 16 }, (_, i) => {
            const x = 15 + i * 10, a = (x - 10) / 10;
            return <path key={i} className="vg-base" style={{ "--d": `${i * 0.12}s` } as React.CSSProperties} d={`M${x} ${(64 + Math.sin(a) * 26).toFixed(1)}V${(64 + Math.sin(a + Math.PI) * 26).toFixed(1)}`} strokeOpacity="0.5" />;
          })}
          {/* An axial scan, in outline. */}
          <path d="M252 18c30 0 50 22 50 46s-20 46-50 46-50-22-50-46 20-46 50-46z" />
          <path d="M252 26v76M226 44c12 8 14 22 6 34M278 44c-12 8-14 22-6 34M214 64h18M272 64h18" strokeOpacity="0.5" />
        </g>
      </svg>
      {/* Where the explanation says the evidence is: it tracks the cursor. */}
      <span className="vg-heat absolute inset-y-0 right-0 w-[41%]" aria-hidden />
      <p className="absolute left-3 top-2 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-ink/40">mRNA · explainable scan</p>
      <Stat value={find(role, /([\d.]+%) sensitivity/)} label="sensitivity" />
    </div>
  );
}

/** Analytics Labs: a series, its forecast, and the points flagged as anomalies. */
function Forecast({ role }: { role: Role }) {
  const history = [58, 61, 52, 66, 60, 72, 30, 70, 76, 68, 82, 79, 88, 56, 90];
  const pts = history.map((v, i) => [14 + i * 13, 112 - v]);
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  // The two dips are the anomalies.
  const flagged = [6, 13];
  return (
    <div className={frame}>
      <svg viewBox="0 0 320 128" className="h-full w-full text-ink/45" aria-hidden>
        <g {...line} strokeWidth="1">
          <path d="M14 14v104h292" strokeOpacity="0.5" />
          <path d="M14 92h292M14 66h292M14 40h292" strokeOpacity="0.15" />
          <path d={path} strokeWidth="1.3" />
          <path className="vg-forecast text-primary" pathLength={1} d="M196 22C222 14 246 20 268 10s28-4 34-6" strokeWidth="1.6" />
          <path className="vg-band" d="M196 22C222 4 250 6 302 -10V34C262 30 232 34 196 22z" fill="hsl(var(--primary) / 0.1)" stroke="none" />
          <path d="M196 14v104" strokeDasharray="2 3" strokeOpacity="0.6" />
        </g>
        {flagged.map((i) => (
          <g key={i} className="text-primary">
            <circle cx={pts[i][0]} cy={pts[i][1]} r="2.6" fill="currentColor" />
            <circle className="vg-ping" cx={pts[i][0]} cy={pts[i][1]} r="7" {...line} strokeWidth="1" style={{ "--d": `${i * 0.2}s` } as React.CSSProperties} />
          </g>
        ))}
        <text x="200" y="124" fontSize="6.5" className="fill-current font-mono uppercase" letterSpacing="1">
          forecast
        </text>
      </svg>
      <Stat value={find(role, /(\d+%) (?:forecast )?accuracy/)} label="forecast accuracy" />
    </div>
  );
}

const SCENES: Record<string, (props: { role: Role }) => React.JSX.Element> = {
  Qualcomm: AgentBrowser,
  "Boolean Lab - UCSD Health": TissueSegment,
  "Open Financial Technologies": InvoiceScan,
  "Pucho Digital Healthcare": HelixHeat,
  "Analytics Labs": Forecast,
};

/** The scene for a role, or nothing for a role that has none yet. */
export function Vignette({ role }: { role: Role }) {
  const Scene = SCENES[role.company];
  return Scene ? <Scene role={role} /> : null;
}
