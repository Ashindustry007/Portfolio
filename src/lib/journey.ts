// The home page as a sequence of levels. Content itself stays in config.ts;
// this only names the stops on the route.
export type Level = {
  id: string;
  code: string;
  name: string;
  hint: string;
};

export const levels: Level[] = [
  { id: "spawn", code: "00", name: "Spawn", hint: "Player select" },
  { id: "origin", code: "01", name: "Origin", hint: "Backstory" },
  { id: "quests", code: "02", name: "Quest Log", hint: "Experience" },
  { id: "builds", code: "03", name: "Builds", hint: "Projects" },
  { id: "paths", code: "04", name: "Choose Your Path", hint: "Coder / Artist / Traveller" },
  { id: "final", code: "05", name: "Continue?", hint: "Contact" },
];

// CAT: each letter owns one of the sub-pages, with its own cloak and accent colour.
export const classes = [
  {
    letter: "C",
    key: "c",
    role: "Coder",
    href: "/courses",
    page: "Terminal",
    color: "160 84% 55%",
    line: "Coursework, competitions and the foundations behind the work.",
    scene: "/images/Whisk_a3792c5199b1eb7ba9f4435d6860072beg-ezgif.com-png-to-webp-converter.webp",
  },
  {
    letter: "A",
    key: "a",
    role: "Artist",
    href: "/photography",
    page: "Gallery",
    color: "338 96% 64%",
    line: "Photography, painting and a cinematic eye.",
    scene: "/images/Whisk_2fef7c40d3875ff89344a9b2ecb13813eg-ezgif.com-png-to-webp-converter.webp",
  },
  {
    letter: "T",
    key: "t",
    role: "Traveller",
    href: "/travels",
    page: "Field Log",
    color: "176 62% 52%",
    line: "Trips, summits, surf and community work.",
    scene: "/images/Whisk_050fef88eeb28d78dd1491ef96f1ce80dr-ezgif.com-png-to-webp-converter.webp",
  },
] as const;

export type Achievement = { id: string; title: string; detail: string };

export const achievements: Achievement[] = [
  { id: "first-steps", title: "First Steps", detail: "Set off on the route." },
  { id: "turntable", title: "Turntable", detail: "Spun the player model." },
  { id: "lore-reader", title: "Lore Reader", detail: "Opened a quest's full log." },
  { id: "window-shopper", title: "Window Shopper", detail: "Inspected a build." },
  { id: "curious-cat", title: "Curious Cat", detail: "Poked the cat." },
  { id: "coder", title: "Class: Coder", detail: "Opened the terminal." },
  { id: "artist", title: "Class: Artist", detail: "Walked the gallery." },
  { id: "traveller", title: "Class: Traveller", detail: "Read the field log." },
  { id: "nine-lives", title: "Nine Lives", detail: "Walked all three paths." },
  { id: "end-of-the-road", title: "End of the Road", detail: "Reached the final level." },
];
