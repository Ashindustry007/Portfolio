// All sound on the site is synthesized here with the Web Audio API: no audio files.
// Browsers only allow audio after a user gesture, so nothing is created until unlock().

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// D minor pentatonic, used for every pitched effect so hovers and plucks stay in key with the music.
const PENTA = [62, 65, 67, 69, 72, 74, 77, 79, 81, 84];

// Bass note first, then the pad voicing.
const CHORDS: number[][] = [
  [38, 57, 60, 64, 65], // Dm9
  [34, 58, 62, 65, 69], // Bbmaj7
  [41, 57, 60, 64, 67], // Fmaj9
  [36, 55, 60, 62, 67], // Csus2
];

// Per-level character: how busy the plucks are and how open the pad filter sits.
const MOODS = [
  { density: 0.16, cutoff: 620, lift: 0 },
  { density: 0.24, cutoff: 720, lift: 0 },
  { density: 0.42, cutoff: 950, lift: 12 },
  { density: 0.52, cutoff: 1150, lift: 12 },
  { density: 0.34, cutoff: 860, lift: 0 },
  { density: 0.2, cutoff: 640, lift: 0 },
];

const BAR = 8;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private reverbSend!: GainNode;
  private delaySend!: GainNode;
  private padFilter!: BiquadFilterNode;
  private noise!: AudioBuffer;

  private sfxOn = false;
  private musicOn = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextBar = 0;
  private barIndex = 0;
  private mood = 0;
  private lastHover = 0;
  private lastTick = 0;

  get unlocked() {
    return !!this.ctx;
  }

  /** Create (or resume) the audio context. Must be called from a user gesture. */
  unlock() {
    if (typeof window === "undefined") return;
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.ratio.value = 6;
    limiter.connect(ctx.destination);

    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(limiter);

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = this.sfxOn ? 1 : 0;
    this.sfxBus.connect(this.master);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0;
    this.musicBus.connect(this.master);

    // One second of white noise, reused for clicks, whooshes and the reverb tail.
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(3.2);
    const reverbOut = ctx.createGain();
    reverbOut.gain.value = 0.55;
    reverb.connect(reverbOut).connect(this.master);
    this.reverbSend = ctx.createGain();
    this.reverbSend.connect(reverb);

    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.375;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.34;
    const damp = ctx.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 2200;
    delay.connect(damp).connect(feedback).connect(delay);
    damp.connect(this.musicBus);
    damp.connect(this.reverbSend);
    this.delaySend = ctx.createGain();
    this.delaySend.connect(delay);

    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = "lowpass";
    this.padFilter.frequency.value = MOODS[0].cutoff;
    this.padFilter.Q.value = 0.6;
    this.padFilter.connect(this.musicBus);
    this.padFilter.connect(this.reverbSend);

    document.addEventListener("visibilitychange", () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else if (this.sfxOn || this.musicOn) void this.ctx.resume();
    });

    if (this.musicOn) this.startMusic();
  }

  private impulse(seconds: number) {
    const ctx = this.ctx!;
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.6);
    }
    return buffer;
  }

  setSfx(on: boolean) {
    this.sfxOn = on;
    if (!this.ctx) return;
    this.sfxBus.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.03);
  }

  setMusic(on: boolean) {
    this.musicOn = on;
    if (!this.ctx) return;
    if (on) this.startMusic();
    else this.stopMusic();
  }

  /** Which level's character the next bars take on. */
  setMood(level: number) {
    this.mood = Math.max(0, Math.min(MOODS.length - 1, level));
    if (!this.ctx) return;
    this.padFilter.frequency.setTargetAtTime(MOODS[this.mood].cutoff, this.ctx.currentTime, 1.2);
  }

  /** 0..1, driven by scroll speed: opens the pad filter while the visitor is moving. */
  setEnergy(amount: number) {
    if (!this.ctx || !this.musicOn) return;
    const base = MOODS[this.mood].cutoff;
    this.padFilter.frequency.setTargetAtTime(base + Math.min(1, amount) * 1600, this.ctx.currentTime, 0.25);
  }

  // ---------------------------------------------------------------- music

  private startMusic() {
    const ctx = this.ctx!;
    this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
    this.musicBus.gain.setTargetAtTime(0.5, ctx.currentTime, 1.2);
    if (this.timer) return;
    this.nextBar = ctx.currentTime + 0.1;
    this.timer = setInterval(() => {
      if (!this.ctx || this.ctx.state !== "running") return;
      // If the tab was asleep, skip ahead rather than scheduling bars in the past.
      if (this.nextBar < this.ctx.currentTime) this.nextBar = this.ctx.currentTime + 0.1;
      while (this.nextBar < this.ctx.currentTime + 1.5) {
        this.scheduleBar(this.nextBar);
        this.nextBar += BAR;
      }
    }, 250);
  }

  private stopMusic() {
    const ctx = this.ctx!;
    this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
    this.musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private scheduleBar(t: number) {
    const ctx = this.ctx!;
    const chord = CHORDS[this.barIndex % CHORDS.length];
    const mood = MOODS[this.mood];
    this.barIndex++;

    // Bass
    const bass = ctx.createOscillator();
    bass.type = "sine";
    bass.frequency.value = midi(chord[0]);
    const bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(0, t);
    bassGain.gain.linearRampToValueAtTime(0.16, t + 1.5);
    bassGain.gain.setValueAtTime(0.16, t + BAR - 1);
    bassGain.gain.linearRampToValueAtTime(0, t + BAR + 1.5);
    bass.connect(bassGain).connect(this.musicBus);
    bass.start(t);
    bass.stop(t + BAR + 1.6);

    // Pad: two slightly detuned voices per note, overlapping the next bar.
    for (const note of chord.slice(1)) {
      for (const detune of [-7, 7]) {
        const osc = ctx.createOscillator();
        osc.type = detune < 0 ? "sawtooth" : "triangle";
        osc.frequency.value = midi(note);
        osc.detune.value = detune;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.03, t + 2.8);
        gain.gain.setValueAtTime(0.03, t + BAR - 1);
        gain.gain.linearRampToValueAtTime(0, t + BAR + 3);
        osc.connect(gain).connect(this.padFilter);
        osc.start(t);
        osc.stop(t + BAR + 3.1);
      }
    }

    // Sparse plucks on a 16-step grid.
    const tones = chord.slice(1);
    for (let step = 0; step < 16; step++) {
      if (Math.random() > mood.density) continue;
      const note = tones[Math.floor(Math.random() * tones.length)] + 12 + (Math.random() < 0.3 ? mood.lift : 0);
      this.musicPluck(t + (step * BAR) / 16, note, 0.028 + Math.random() * 0.02);
    }
  }

  private musicPluck(t: number, note: number, level: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = midi(note);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(level, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    osc.connect(gain);
    gain.connect(this.musicBus);
    gain.connect(this.delaySend);
    osc.start(t);
    osc.stop(t + 1);
  }

  // ---------------------------------------------------------------- effects

  private get live() {
    return !!this.ctx && this.sfxOn && this.ctx.state === "running";
  }

  private tone(opts: {
    freq: number;
    to?: number;
    type?: OscillatorType;
    at?: number;
    attack?: number;
    decay: number;
    level: number;
    reverb?: number;
  }) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + (opts.at ?? 0);
    const osc = ctx.createOscillator();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(opts.freq, t);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t + opts.decay);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(opts.level, t + (opts.attack ?? 0.004));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.decay);
    osc.connect(gain).connect(this.sfxBus);
    if (opts.reverb) {
      const send = ctx.createGain();
      send.gain.value = opts.reverb;
      gain.connect(send).connect(this.reverbSend);
    }
    osc.start(t);
    osc.stop(t + opts.decay + 0.05);
  }

  private burst(opts: { at?: number; decay: number; level: number; type: BiquadFilterType; freq: number; to?: number; q?: number; reverb?: number; attack?: number }) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + (opts.at ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = opts.type;
    filter.frequency.setValueAtTime(opts.freq, t);
    if (opts.to) filter.frequency.exponentialRampToValueAtTime(opts.to, t + opts.decay);
    filter.Q.value = opts.q ?? 1;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(opts.level, t + (opts.attack ?? 0.003));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.decay);
    src.connect(filter).connect(gain).connect(this.sfxBus);
    if (opts.reverb) {
      const send = ctx.createGain();
      send.gain.value = opts.reverb;
      gain.connect(send).connect(this.reverbSend);
    }
    src.start(t, Math.random() * 0.5);
    src.stop(t + opts.decay + 0.05);
  }

  /** Hover tick. `position` 0..1 picks the note, so sweeping across a row plays a scale. */
  hover(position = 0.5) {
    if (!this.live) return;
    const now = performance.now();
    if (now - this.lastHover < 45) return;
    this.lastHover = now;
    const note = PENTA[Math.min(PENTA.length - 1, Math.max(0, Math.floor(position * PENTA.length)))];
    this.tone({ freq: midi(note + 12), type: "triangle", decay: 0.14, level: 0.05, reverb: 0.5 });
  }

  click() {
    if (!this.live) return;
    this.tone({ freq: 560, to: 240, decay: 0.09, level: 0.14 });
    this.burst({ decay: 0.03, level: 0.06, type: "highpass", freq: 3200 });
  }

  /** Two-note confirm, rising for on and falling for off. */
  toggle(on: boolean) {
    if (!this.live) return;
    const [a, b] = on ? [74, 81] : [81, 74];
    this.tone({ freq: midi(a), type: "triangle", decay: 0.12, level: 0.09 });
    this.tone({ freq: midi(b), type: "triangle", decay: 0.2, level: 0.09, at: 0.08, reverb: 0.4 });
  }

  open() {
    if (!this.live) return;
    this.tone({ freq: 320, to: 880, decay: 0.16, level: 0.07, type: "triangle", reverb: 0.3 });
  }

  close() {
    if (!this.live) return;
    this.tone({ freq: 760, to: 300, decay: 0.16, level: 0.07, type: "triangle", reverb: 0.3 });
  }

  whoosh() {
    if (!this.live) return;
    this.burst({ decay: 0.7, attack: 0.25, level: 0.09, type: "bandpass", freq: 300, to: 2600, q: 0.8, reverb: 0.5 });
  }

  /** Arriving at a level: a whoosh and that level's chord. */
  arrive(level: number) {
    if (!this.live) return;
    this.whoosh();
    const chord = CHORDS[level % CHORDS.length];
    chord.slice(1, 4).forEach((n, i) => {
      this.tone({ freq: midi(n + 12), type: "sine", decay: 1.4, attack: 0.05, level: 0.045, at: 0.12 + i * 0.05, reverb: 0.8 });
    });
  }

  /** Achievement unlocked. */
  chime() {
    if (!this.live) return;
    [74, 77, 81, 86].forEach((n, i) => {
      this.tone({ freq: midi(n), type: "triangle", decay: 0.9, level: 0.085, at: i * 0.085, reverb: 0.9 });
      this.tone({ freq: midi(n + 12), type: "sine", decay: 0.5, level: 0.03, at: i * 0.085 });
    });
  }

  /** Tiny mechanical tick: boot text, the figure's turntable ratchet. */
  tick(pitch = 1) {
    if (!this.live) return;
    const now = performance.now();
    if (now - this.lastTick < 28) return;
    this.lastTick = now;
    this.tone({ freq: 1500 * pitch, type: "square", decay: 0.02, level: 0.018 });
  }

  shutter() {
    if (!this.live) return;
    this.burst({ decay: 0.035, level: 0.16, type: "bandpass", freq: 2400, q: 1.4 });
    this.burst({ decay: 0.05, level: 0.12, type: "bandpass", freq: 1500, q: 1.2, at: 0.075 });
  }

  /** A rubber stamp coming down on paper. */
  stamp() {
    if (!this.live) return;
    this.tone({ freq: 150, to: 55, decay: 0.14, level: 0.3 });
    this.burst({ decay: 0.07, level: 0.14, type: "lowpass", freq: 900 });
  }

  meow() {
    if (!this.live) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.linearRampToValueAtTime(860, t + 0.14);
    osc.frequency.linearRampToValueAtTime(470, t + 0.5);
    const formant = ctx.createBiquadFilter();
    formant.type = "bandpass";
    formant.Q.value = 4;
    formant.frequency.setValueAtTime(900, t);
    formant.frequency.linearRampToValueAtTime(1900, t + 0.16);
    formant.frequency.linearRampToValueAtTime(1000, t + 0.5);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.16, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    osc.connect(formant).connect(gain).connect(this.sfxBus);
    const send = ctx.createGain();
    send.gain.value = 0.3;
    gain.connect(send).connect(this.reverbSend);
    osc.start(t);
    osc.stop(t + 0.6);
  }
}

export const audio = new AudioEngine();
