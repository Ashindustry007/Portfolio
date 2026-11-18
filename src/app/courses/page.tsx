"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, FileCode2, FileJson, FileText, Folder } from "lucide-react";
import { academicData, siteConfig } from "@/lib/config";
import { files, findFile, folders, gpaTable, plainText, wins, type SourceFile } from "@/components/coder/files";
import { audio } from "@/lib/audio/engine";
import { useExperience } from "@/lib/experience";
import { fluidGuide } from "@/lib/fluid";
import { Footer } from "@/components/footer";
import { CloakedAvatar } from "@/components/hero/cloaked-avatar";
import { Doodle, Note } from "@/components/game/doodles";
import { CornerMarks } from "@/components/game/line-art";
import { CodeField } from "@/components/game/page-fields";
import { cn } from "@/lib/utils";

const PROMPT = "ashish@cat:~/education$";
const TOKEN_CLASS: Record<string, string> = {
  kw: "text-primary",
  str: "text-class",
  num: "text-amber-300",
  com: "text-ink/35",
  cls: "text-sky-300",
  key: "text-ink/90",
};

const HELP = [
  "ls                 list every file",
  "cat <file>         open a file in the editor",
  "gpa                grades for every term",
  "wins               competitions and hackathons",
  "certs              certificates earned",
  "whoami             who you are talking to",
  "gallery | fieldlog  walk another path",
  "cd ..              back to the home page",
  "clear              wipe this terminal",
];

function FileIcon({ file }: { file: SourceFile }) {
  const Icon = file.lang === "JSON" ? FileJson : file.lang === "Markdown" || file.lang === "Git log" ? FileText : FileCode2;
  return <Icon size={13} className="shrink-0 text-ink/40" />;
}

type Entry = { kind: "in" | "out" | "err"; text: string };

export default function CoursesPage() {
  const router = useRouter();
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const [active, setActive] = useState<SourceFile>(files[0]);
  const [tabs, setTabs] = useState<SourceFile[]>([files[0]]);
  const [shown, setShown] = useState(files[0].lines.length);
  const [closed, setClosed] = useState<string[]>([]);
  const [log, setLog] = useState<Entry[]>([
    { kind: "out", text: "education shell. Type 'help' to see what it can do." },
  ]);
  const [input, setInput] = useState("");
  const [past, setPast] = useState<string[]>([]);
  const [pastAt, setPastAt] = useState(-1);
  const [caret, setCaret] = useState({ line: 1, col: 1 });
  // On this page the cursor's smoke falls in columns, like the code behind it.
  useEffect(() => {
    fluidGuide.mode = 2;
    return () => {
      fluidGuide.mode = 0;
    };
  }, []);

  const terminal = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  const open = (file: SourceFile) => {
    setActive(file);
    setTabs((t) => (t.includes(file) ? t : [...t, file].slice(-4)));
    // The file types itself in, a few lines at a time.
    setShown(reducedMotion ? file.lines.length : 0);
    audio.open();
  };

  useEffect(() => {
    if (shown >= active.lines.length) return;
    const id = setTimeout(() => {
      setShown((n) => Math.min(active.lines.length, n + 2));
      audio.tick(1.1);
    }, 28);
    return () => clearTimeout(id);
  }, [shown, active]);

  useEffect(() => {
    terminal.current?.scrollTo({ top: terminal.current.scrollHeight });
  }, [log]);

  const run = (raw: string) => {
    const command = raw.trim();
    const say = (kind: Entry["kind"], ...lines: string[]) => lines.map((text) => ({ kind, text }));
    let out: Entry[] = [];
    const [name, ...rest] = command.split(/\s+/);
    const arg = rest.join(" ");

    switch (name) {
      case "":
        break;
      case "help":
        out = say("out", ...HELP);
        break;
      case "ls":
        out = say("out", ...files.map((f) => f.path));
        break;
      case "cat":
      case "open":
      case "code": {
        const file = findFile(arg);
        if (!file) out = say("err", arg ? `no such file: ${arg}` : "usage: cat <file>");
        else {
          open(file);
          out = say("out", `opened ${file.path}`, ...plainText(file).slice(0, 4), "…");
        }
        break;
      }
      case "gpa":
        out = say("out", ...gpaTable());
        break;
      case "wins":
        out = say("out", ...wins.flatMap((w) => [`* ${w.title}`, `    ${w.description}`]));
        break;
      case "certs":
        out = say("out", ...academicData.additionalCourses.map((c) => `${c.date.padEnd(10)} ${c.title} (${c.provider})`));
        break;
      case "whoami":
        out = say("out", `${siteConfig.name} ${siteConfig.surname}`, `${academicData.graduate.degree}, ${academicData.graduate.branch}, UC San Diego`, `${academicData.undergraduate.degree}, ${academicData.undergraduate.branch}, OUTR`, "coder, artist, traveller");
        break;
      case "clear":
        setLog([]);
        return;
      case "cd":
        if (arg === ".." || arg === "~" || arg === "/") {
          router.push("/");
          out = say("out", "leaving ~/education");
        } else out = say("err", `cd: no such directory: ${arg || "(none)"}`);
        break;
      case "gallery":
        router.push("/photography");
        out = say("out", "walking to the gallery");
        break;
      case "fieldlog":
        router.push("/extracurriculars");
        out = say("out", "opening the field log");
        break;
      case "meow":
        audio.meow();
        out = say("out", "=^..^=");
        break;
      case "sudo":
        out = say("err", "permission denied: nice try.");
        break;
      default: {
        // A bare file name opens it, the way a shell with autocd would.
        const file = findFile(command);
        if (file) {
          open(file);
          out = say("out", `opened ${file.path}`);
        } else out = say("err", `command not found: ${name}. Try 'help'.`);
      }
    }
    setLog((l) => [...l, { kind: "in" as const, text: command }, ...out].slice(-160));
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      audio.click();
      run(input);
      if (input.trim()) setPast((p) => [input, ...p].slice(0, 30));
      setPastAt(-1);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(past.length - 1, pastAt + 1);
      if (past[next] !== undefined) {
        setPastAt(next);
        setInput(past[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = pastAt - 1;
      setPastAt(Math.max(-1, next));
      setInput(next >= 0 ? past[next] : "");
    } else if (e.key === "Tab") {
      // Complete a file name after `cat `.
      const match = input.match(/^(cat|open|code)\s+(\S+)$/);
      if (!match) return;
      const hit = files.find((f) => f.name.startsWith(match[2]) || f.path.startsWith(match[2]));
      if (hit) {
        e.preventDefault();
        setInput(`${match[1]} ${hit.path}`);
      }
    } else if (e.key.length === 1) audio.tick(0.9 + Math.random() * 0.3);
  };

  const tree = useMemo(() => folders.map((f) => ({ ...f, files: files.filter((file) => file.dir === f.dir) })), []);
  const { graduate, undergraduate } = academicData;
  const meters = [
    { label: `${graduate.degree}, ${graduate.branch}`, where: "UC San Diego", value: Number(graduate.cgpa), max: 4, text: graduate.cgpa },
    { label: `${undergraduate.degree}, ${undergraduate.branch}`, where: "OUTR", value: Number(undergraduate.cgpa), max: 10, text: undergraduate.cgpa },
  ];

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="code-rain pointer-events-none fixed inset-0" aria-hidden />
      <CodeField />

      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-16 pt-32 md:grid-cols-[minmax(0,1fr)_auto] md:px-8">
        <div className="space-y-6">
          <p className="font-mono text-xs text-class">
            <span className="text-ink/40">{PROMPT}</span> whoami --class
          </p>
          <h1 className="font-headline text-5xl font-bold uppercase leading-none md:text-7xl">
            Academic
            <br />
            <span className="text-outline">Excellence</span>
            <span className="ml-2 inline-block h-[0.72em] w-[0.42em] translate-y-[0.06em] animate-pulse bg-class" aria-hidden />
          </h1>
          <p className="max-w-lg font-mono text-sm uppercase leading-relaxed tracking-wider text-muted-foreground">
            A comprehensive journey from electrical engineering fundamentals to advanced specialization in artificial intelligence and computer science, and the competitions along the way.
          </p>

          <dl className="grid max-w-xl gap-5 pt-2 sm:grid-cols-2">
            {meters.map((m) => (
              <div key={m.where} className="border border-ink/10 bg-card/60 p-4">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-ink/45">{m.where}</dt>
                <dd className="mt-1 text-xs leading-snug text-ink/75">{m.label}</dd>
                <dd className="mt-3 flex items-baseline gap-2 font-headline">
                  <span className="text-3xl font-bold text-class">{m.text}</span>
                  <span className="font-mono text-[0.6875rem] text-ink/40">/ {m.max.toFixed(1)} CGPA</span>
                </dd>
                <dd className="mt-2 h-1 bg-ink/10" aria-hidden>
                  <span className="block h-full bg-class" style={{ width: `${(m.value / m.max) * 100}%` }} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="relative mx-auto w-[min(72vw,22rem)]">
          <CornerMarks />
          <CloakedAvatar klass="c" active className="w-full" />
          <figcaption className="absolute inset-x-0 bottom-0 translate-y-full pt-3 text-center font-mono text-[0.625rem] uppercase tracking-[0.3em] text-ink/40">
            <span className="text-class">●</span> Live · class C · coder
          </figcaption>
          <Note arrow="arrow" className="absolute -left-24 top-6 hidden -rotate-6 lg:inline-flex">
            compiling…
          </Note>
        </figure>
      </section>

      <section className="relative mx-auto max-w-7xl px-3 pb-24 md:px-8">
        <div className="relative border border-ink/15 bg-[#12110f]/95 shadow-2xl shadow-black/40 backdrop-blur">
          {/* Title bar */}
          <div className="flex items-center gap-3 border-b border-ink/10 px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="flex-1 truncate text-center font-mono text-[0.6875rem] text-ink/45">~/education/{active.path}</span>
          </div>

          <div className="grid md:grid-cols-[15rem_minmax(0,1fr)]">
            {/* Explorer */}
            <nav aria-label="Files" data-lenis-prevent className="max-h-56 overflow-auto border-b border-ink/10 p-3 font-mono text-xs md:max-h-none md:border-b-0 md:border-r">
              <p className="mb-2 px-2 text-[0.625rem] uppercase tracking-[0.3em] text-ink/35">Explorer</p>
              <button type="button" onClick={() => open(files[0])} className={cn("flex w-full items-center gap-2 px-2 py-1 text-left transition-colors hover:bg-ink/5", active === files[0] ? "bg-class/10 text-class" : "text-ink/70")}>
                <FileIcon file={files[0]} /> README.md
              </button>
              {tree.map((folder) => {
                const isClosed = closed.includes(folder.dir);
                return (
                  <div key={folder.dir} className="mt-1">
                    <button
                      type="button"
                      aria-expanded={!isClosed}
                      onClick={() => setClosed((c) => (isClosed ? c.filter((d) => d !== folder.dir) : [...c, folder.dir]))}
                      className="flex w-full items-center gap-1.5 px-1 py-1 text-left text-ink/85 transition-colors hover:bg-ink/5"
                    >
                      <ChevronDown size={12} className={cn("shrink-0 transition-transform", isClosed && "-rotate-90")} />
                      <Folder size={13} className="shrink-0 text-class/70" />
                      <span>{folder.dir}</span>
                      <span className="ml-auto truncate pl-2 text-[0.625rem] text-ink/30">{folder.note}</span>
                    </button>
                    {!isClosed &&
                      folder.files.map((file) => (
                        <button
                          key={file.path}
                          type="button"
                          onClick={() => {
                            open(file);
                            setLog((l) => [...l, { kind: "in" as const, text: `cat ${file.path}` }, { kind: "out" as const, text: `opened ${file.path}` }].slice(-160));
                          }}
                          className={cn("flex w-full items-center gap-2 py-1 pl-7 pr-2 text-left transition-colors hover:bg-ink/5", active === file ? "bg-class/10 text-class" : "text-ink/60")}
                        >
                          <FileIcon file={file} /> {file.name}
                        </button>
                      ))}
                  </div>
                );
              })}
            </nav>

            {/* Editor */}
            <div className="min-w-0">
              <div role="tablist" aria-label="Open files" className="flex overflow-x-auto border-b border-ink/10 font-mono text-[0.75rem]">
                {tabs.map((file) => (
                  <button
                    key={file.path}
                    role="tab"
                    type="button"
                    aria-selected={file === active}
                    onClick={() => {
                      setActive(file);
                      setShown(file.lines.length);
                    }}
                    className={cn("flex shrink-0 items-center gap-2 border-r border-ink/10 px-4 py-2 transition-colors", file === active ? "bg-ink/[0.06] text-ink shadow-[inset_0_2px_0_hsl(var(--class))]" : "text-ink/45 hover:text-ink/80")}
                  >
                    <FileIcon file={file} /> {file.name}
                  </button>
                ))}
              </div>

              <div data-lenis-prevent className="relative h-[52vh] min-h-[340px] overflow-auto py-3 font-mono text-[0.8125rem] leading-6" onPointerLeave={() => setCaret({ line: 1, col: 1 })}>
                <ol>
                  {active.lines.slice(0, shown).map((line, i) => (
                    <li
                      key={`${active.path}-${i}`}
                      onPointerEnter={() => setCaret({ line: i + 1, col: line.reduce((n, [t]) => n + t.length, 0) + 1 })}
                      className="group flex whitespace-pre hover:bg-ink/[0.045]"
                    >
                      <span className="w-12 shrink-0 select-none pr-4 text-right text-ink/25 group-hover:text-class">{i + 1}</span>
                      <code className="pr-6">
                        {line.map(([text, kind], t) => (
                          <span key={t} className={kind ? TOKEN_CLASS[kind] : "text-ink/75"}>
                            {text}
                          </span>
                        ))}
                        {i === shown - 1 && shown < active.lines.length && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-class" />}
                      </code>
                    </li>
                  ))}
                </ol>
                {active.dir === "graduate" && shown >= active.lines.length && (
                  <Note arrow="arrow" className="absolute right-8 top-24 hidden rotate-3 lg:inline-flex" arrowClassName="order-first -scale-x-100">
                    the AI years
                  </Note>
                )}
              </div>

              {/* Terminal */}
              <div className="border-t border-ink/10">
                <p className="flex items-center gap-4 border-b border-ink/10 px-4 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-ink/35">
                  <span className="text-ink/80 shadow-[inset_0_-1px_0_hsl(var(--class))]">Terminal</span>
                  <span className="ml-auto normal-case tracking-normal">tab completes · ↑ recalls</span>
                </p>
                <div ref={terminal} data-lenis-prevent onClick={() => field.current?.focus()} className="h-52 cursor-text overflow-auto px-4 py-3 font-mono text-xs leading-5">
                  <div aria-live="polite">
                    {log.map((entry, i) => (
                      <p key={i} className={cn("whitespace-pre-wrap break-words", entry.kind === "err" ? "text-red-400" : entry.kind === "in" ? "text-ink/90" : "text-ink/55")}>
                        {entry.kind === "in" && <span className="text-class">{PROMPT} </span>}
                        {entry.text}
                      </p>
                    ))}
                  </div>
                  <label className="flex items-center gap-2">
                    <span className="shrink-0 text-class">{PROMPT}</span>
                    <input
                      ref={field}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKey}
                      aria-label="Terminal input. Type help for commands."
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="help"
                      className="min-w-0 flex-1 bg-transparent text-ink caret-[hsl(var(--class))] outline-none placeholder:text-ink/20"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-4 border-t border-ink/10 bg-class/90 px-4 py-1 font-mono text-[0.6875rem] text-black">
            <span>⎇ main</span>
            <span className="hidden sm:inline">{files.length} files</span>
            <span className="ml-auto">
              Ln {caret.line}, Col {caret.col}
            </span>
            <span>{active.lang}</span>
            <span className="hidden sm:inline">UTF-8</span>
          </div>
          <CornerMarks />
        </div>

        <div className="relative mt-5 flex justify-center">
          <Note arrow="arrow-down" className="rotate-2" arrowClassName="order-first h-10 w-6 rotate-180">
            it really runs. try <span className="ml-1.5 font-mono text-sm text-class">gpa</span>
          </Note>
          <Doodle name="brackets" className="absolute right-6 top-0 hidden h-10 w-16 text-ink/25 md:block" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
