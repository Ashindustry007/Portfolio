"use client";

import { create } from "zustand";
import { audio } from "@/lib/audio/engine";
import { achievements } from "@/lib/journey";
import { toast } from "@/hooks/use-toast";

const SFX_KEY = "cat-sfx";
const MUSIC_KEY = "cat-music";
const UNLOCKED_KEY = "cat-achievements";
const ENTERED_KEY = "cat-entered";

// Storage can throw in private windows or with site data blocked; the site must work without it.
function read(store: "local" | "session", key: string) {
  try {
    return (store === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}
function write(store: "local" | "session", key: string, value: string) {
  try {
    (store === "local" ? localStorage : sessionStorage).setItem(key, value);
  } catch {}
}

type ExperienceState = {
  /** Client-side preferences have been read. */
  ready: boolean;
  /** The visitor has passed the start gate. */
  entered: boolean;
  /** Already passed the gate earlier in this browser session. */
  returning: boolean;
  sfx: boolean;
  music: boolean;
  reducedMotion: boolean;
  finePointer: boolean;
  /** 0..1, how much of the opening scene's assets have loaded. */
  assetProgress: number;
  level: number;
  unlocked: string[];

  hydrate: () => void;
  enter: (withSound: boolean) => void;
  setSfx: (on: boolean) => void;
  setMusic: (on: boolean) => void;
  setAssetProgress: (p: number) => void;
  setLevel: (level: number) => void;
  unlock: (id: string) => void;
};

export const useExperience = create<ExperienceState>((set, get) => ({
  ready: false,
  entered: false,
  returning: false,
  sfx: false,
  music: false,
  reducedMotion: false,
  finePointer: false,
  assetProgress: 0,
  level: 0,
  unlocked: [],

  hydrate() {
    if (get().ready) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    reduced.addEventListener("change", (e) => set({ reducedMotion: e.matches }));
    fine.addEventListener("change", (e) => set({ finePointer: e.matches }));

    let unlocked: string[] = [];
    try {
      const saved = JSON.parse(read("local", UNLOCKED_KEY) ?? "[]");
      if (Array.isArray(saved)) unlocked = saved.filter((id) => achievements.some((a) => a.id === id));
    } catch {}

    const entered = read("session", ENTERED_KEY) === "1";
    const sfx = entered && read("local", SFX_KEY) === "1";
    const music = entered && read("local", MUSIC_KEY) === "1";
    set({ ready: true, entered, returning: entered, sfx, music, unlocked, reducedMotion: reduced.matches, finePointer: fine.matches });

    // Returning within the session skips the gate, but audio still needs one gesture to start.
    if (sfx || music) {
      audio.setSfx(sfx);
      audio.setMusic(music);
      const arm = () => {
        audio.unlock();
        window.removeEventListener("pointerdown", arm);
        window.removeEventListener("keydown", arm);
      };
      window.addEventListener("pointerdown", arm);
      window.addEventListener("keydown", arm);
    }
  },

  enter(withSound) {
    if (withSound) audio.unlock();
    audio.setSfx(withSound);
    audio.setMusic(withSound);
    audio.setMood(get().level);
    write("local", SFX_KEY, withSound ? "1" : "0");
    write("local", MUSIC_KEY, withSound ? "1" : "0");
    write("session", ENTERED_KEY, "1");
    set({ entered: true, sfx: withSound, music: withSound });
    if (withSound) audio.arrive(get().level);
  },

  setSfx(on) {
    if (on) audio.unlock();
    audio.setSfx(on);
    write("local", SFX_KEY, on ? "1" : "0");
    set({ sfx: on });
    // Confirm with a sound only when turning on; turning off should just go quiet.
    if (on) setTimeout(() => audio.toggle(true), 60);
  },

  setMusic(on) {
    if (on) audio.unlock();
    audio.setMusic(on);
    write("local", MUSIC_KEY, on ? "1" : "0");
    set({ music: on });
    audio.toggle(on);
  },

  setAssetProgress(p) {
    if (p > get().assetProgress) set({ assetProgress: Math.min(1, p) });
  },

  setLevel(level) {
    if (level === get().level) return;
    set({ level });
    audio.setMood(level);
    if (get().entered) audio.arrive(level);
  },

  unlock(id) {
    const { unlocked, entered } = get();
    if (!entered || unlocked.includes(id)) return;
    const found = achievements.find((a) => a.id === id);
    if (!found) return;
    const next = [...unlocked, id];
    set({ unlocked: next });
    write("local", UNLOCKED_KEY, JSON.stringify(next));
    audio.chime();
    toast({ title: `Achievement unlocked · ${next.length}/${achievements.length}`, description: `${found.title}. ${found.detail}` });

    if (id !== "nine-lives" && ["coder", "artist", "traveller"].every((c) => next.includes(c))) {
      setTimeout(() => get().unlock("nine-lives"), 1600);
    }
  },
}));
