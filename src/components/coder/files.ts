import { academicData, extracurriculars } from "@/lib/config";

// The coursework, laid out as a project tree. Each file's text is generated
// from config.ts, so the editor and the terminal always show the same data.

export type Token = [text: string, kind?: "kw" | "str" | "num" | "com" | "cls" | "key"];
export type Line = Token[];
export type SourceFile = { path: string; name: string; dir: string; lang: string; lines: Line[] };

const bar = (value: number, max: number, width = 20) => {
  const filled = Math.round((value / max) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
};
const slug = (id: string) => id.toLowerCase().replace(/\s+/g, "_");
const className = (id: string) => id.replace(/\s+/g, "");

function termFile(dir: string, id: string, gpaLabel: string, gpa: string, scale: number, courses: string[], header: string[]): SourceFile {
  const lines: Line[] = [
    ...header.map<Line>((h) => [[`# ${h}`, "com"]]),
    [],
    [["class ", "kw"], [className(id), "cls"], ["(Term):"]],
    [["    "], [gpaLabel, "key"], [" = "], [gpa, "num"], [`  # ${bar(Number(gpa), scale)} of ${scale.toFixed(1)}`, "com"]],
    [["    "], ["courses", "key"], [" = ["]],
    ...courses.map<Line>((c) => [["        "], [`"${c}"`, "str"], [","]]),
    [["    ]"]],
  ];
  const name = `${slug(id)}.py`;
  return { path: `${dir}/${name}`, name, dir, lang: "Python", lines };
}

const { graduate, undergraduate, additionalCourses } = academicData;

const readme: SourceFile = {
  path: "README.md",
  name: "README.md",
  dir: "",
  lang: "Markdown",
  lines: [
    [["# education", "kw"]],
    [],
    [["From electrical engineering fundamentals to a specialization in"]],
    [["artificial intelligence and computer science."]],
    [],
    [["## graduate", "kw"]],
    [[`${graduate.degree}, ${graduate.branch}`]],
    [[graduate.university]],
    [["CGPA "], [graduate.cgpa, "num"], [`  ${bar(Number(graduate.cgpa), 4)} of 4.0`, "com"]],
    [],
    [["## undergraduate", "kw"]],
    [[`${undergraduate.degree}, ${undergraduate.branch}`]],
    [[undergraduate.university]],
    [["CGPA "], [undergraduate.cgpa, "num"], [`  ${bar(Number(undergraduate.cgpa), 10)} of 10.0`, "com"]],
    [],
    [["## try the terminal", "kw"]],
    [["Type "], ["help", "str"], [" below, or pick a file on the left."]],
  ],
};

const certificates: SourceFile = {
  path: "certificates/certificates.json",
  name: "certificates.json",
  dir: "certificates",
  lang: "JSON",
  lines: [
    [["["]],
    ...additionalCourses.flatMap<Line>((c, i) => [
      [["  {"]],
      [["    "], ['"title"', "key"], [": "], [`"${c.title}"`, "str"], [","]],
      [["    "], ['"provider"', "key"], [": "], [`"${c.provider}"`, "str"], [","]],
      ...("description" in c && c.description ? [[["    "], ['"covers"', "key"], [": "], [`"${c.description}"`, "str"], [","]] as Line] : []),
      [["    "], ['"date"', "key"], [": "], [`"${c.date}"`, "str"]],
      [[i === additionalCourses.length - 1 ? "  }" : "  },"]],
    ]),
    [["]"]],
  ],
};

// Competitive programming and hackathon results, written the way a repository
// remembers things: as a commit log, newest first.
export const wins = extracurriculars.find((c) => c.category.startsWith("Tech"))?.items ?? [];
const shortHash = (text: string) => {
  let h = 7;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h.toString(16).padStart(7, "0").slice(0, 7);
};
const competitions: SourceFile = {
  path: "competitions/wins.log",
  name: "wins.log",
  dir: "competitions",
  lang: "Git log",
  lines: wins.flatMap<Line>((w) => [
    [["* ", "kw"], [shortHash(w.title), "num"], [" "], [w.title, "cls"]],
    [["|   "], [w.description, "com"]],
    [["|"]],
  ]),
};

export const files: SourceFile[] = [
  readme,
  ...graduate.terms.map((t) => termFile("graduate", t.id, "gpa", t.gpa, 4, t.courses, [graduate.university, `${graduate.degree}, ${graduate.branch}`])),
  ...undergraduate.semesters.map((s) => termFile("undergraduate", s.id, "sgpa", s.sgpa, 10, s.courses, [undergraduate.university, `${undergraduate.degree}, ${undergraduate.branch}`])),
  competitions,
  certificates,
];

export const folders = [
  { dir: "graduate", note: `UCSD · CGPA ${graduate.cgpa}` },
  { dir: "undergraduate", note: `OUTR · CGPA ${undergraduate.cgpa}` },
  { dir: "competitions", note: `${wins.length} logged` },
  { dir: "certificates", note: `${additionalCourses.length} earned` },
];

export const plainText = (file: SourceFile) => file.lines.map((line) => line.map(([text]) => text).join(""));

/** Find a file by full path, file name, or name without its extension. */
export function findFile(query: string) {
  const q = query.trim().toLowerCase().replace(/^\.\//, "");
  return files.find((f) => f.path.toLowerCase() === q || f.name.toLowerCase() === q || f.name.toLowerCase().replace(/\.\w+$/, "") === q);
}

export const gpaTable = () => [
  ...graduate.terms.map((t) => `${t.id.padEnd(12)} ${bar(Number(t.gpa), 4)} ${t.gpa} / 4.0`),
  `${"UCSD CGPA".padEnd(12)} ${bar(Number(graduate.cgpa), 4)} ${graduate.cgpa} / 4.0`,
  "",
  ...undergraduate.semesters.map((s) => `${s.id.padEnd(12)} ${bar(Number(s.sgpa), 10)} ${s.sgpa} / 10.0`),
  `${"OUTR CGPA".padEnd(12)} ${bar(Number(undergraduate.cgpa), 10)} ${undergraduate.cgpa} / 10.0`,
];
