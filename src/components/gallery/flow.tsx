"use client";

import { useEffect, useRef, useState } from "react";
import type * as Three from "three";
import { ArrowDown } from "lucide-react";
import { audio } from "@/lib/audio/engine";
import { pointer } from "@/lib/pointer";
import { useExperience } from "@/lib/experience";
import { scrollState } from "@/lib/scroll";
import { GLSL_COMMON } from "@/components/hero/gl";
import { PAINT_GLSL } from "@/components/game/page-fields";
import { captionTitle, type InstagramPost } from "@/hooks/use-instagram";
import { frameMonth, frameNumber } from "@/components/gallery/lightbox";

// A walk through the photographs. They hang in a dark space, one behind
// another to the left and right of the path, each with its caption on a small
// card beneath it. Scrolling walks forward: the nearest print grows until it
// slides past, and the next comes out of the dark behind it. The view leans
// with the pointer; a print under the pointer brightens, ripples and turns
// toward it, and a click opens it.

const STEP = 1.05; // depth between one print and the next
const START = 2.0; // how far back the walk begins from the first plate
const END = 1.7; // how close it stops to the last one
const FOV = 50;

const PRINT_VERT = `
varying vec2 vUv;
uniform float uVel;
void main() {
  vUv = uv;
  vec3 p = position;
  // Walking fast makes the prints billow toward you.
  p.z += sin(uv.x * 3.14159) * sin(uv.y * 3.14159) * uVel * 0.12;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const PRINT_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D map;
uniform float uNear;   // 1 when close and lit, 0 far back in the dark
uniform float uShow;   // fades the print in once loaded, and out as it passes
uniform float uHover;
uniform float uDim;    // other prints step back while one is being looked at
uniform float uTime;
uniform float uVel;
uniform float uRatio;
uniform vec2 uPoint;
void main() {
  vec2 uv = vUv;
  // Under the pointer, the surface ripples outward from where it is touched.
  vec2 away = uv - uPoint;
  away.x *= uRatio;
  float d = length(away);
  float ripple = sin(d * 30.0 - uTime * 6.0) * 0.007 * uHover * smoothstep(0.7, 0.0, d);
  uv += normalize(away + 0.0001) * ripple;
  float split = 0.0025 * uHover + abs(uVel) * 0.006;
  vec3 c = vec3(texture2D(map, uv + vec2(split, 0.0)).r, texture2D(map, uv).g, texture2D(map, uv - vec2(split, 0.0)).b);
  // Prints far back are dim and drained of colour, and come up as you reach them.
  float grey = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(grey), c, mix(0.3, 1.0, uNear));
  c *= mix(0.22, 1.0, uNear) * uDim * (1.0 + 0.14 * uHover);
  // A hairline border, in the accent when the print is under the pointer.
  vec2 e = min(vUv, 1.0 - vUv) * vec2(uRatio, 1.0);
  float edge = 1.0 - smoothstep(0.004, 0.007, min(e.x, e.y));
  c = mix(c, mix(vec3(0.93, 0.9, 0.85), vec3(1.0, 0.5, 0.0), uHover), edge * mix(0.3, 0.95, uHover) * uNear);
  gl_FragColor = vec4(c, uShow);
}`;

// The page's slow paint (see page-fields.tsx), drawn behind the prints so the
// walk shares its background with the rest of the Artist page.
const BACKDROP_FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uScroll;
uniform float uAspect;
uniform vec2 uMouse;
${GLSL_COMMON}
${PAINT_GLSL}
void main() {
  vec3 wall = vec3(0.043, 0.04, 0.038);
  gl_FragColor = vec4(wall + paint(vUv, uAspect, uTime, uScroll, uMouse) * 0.17, 1.0);
}`;

/** The small card under each print: its number and date, then the caption. */
function card(index: number, post: InstagramPost, accent: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 190;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "top";
  ctx.font = "500 24px 'Geist Mono', ui-monospace, monospace";
  ctx.fillStyle = accent;
  ctx.fillText(`${frameNumber(index)}  ·  ${frameMonth(post.timestamp).toUpperCase()}`, 4, 14);
  ctx.font = "500 34px Inter, sans-serif";
  ctx.fillStyle = "#ece6da";
  // Up to three lines, ending in an ellipsis if the caption runs longer.
  const words = captionTitle(post.caption).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  let cut = false;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > canvas.width - 12) {
      if (lines.length === 2) {
        cut = true;
        break;
      }
      lines.push(line);
      line = word;
    } else line = next;
  }
  lines.push(cut ? `${line.replace(/[\s,.;:!?-]+$/, "")}…` : line);
  lines.forEach((l, i) => ctx.fillText(l, 4, 54 + i * 43));
  return canvas;
}

/** The title plate: the first thing hanging in the space, where a print would be. */
function titleCard(accent: string, fine: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 760;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#141210";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(236, 230, 218, 0.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, canvas.width - 3, canvas.height - 3);
  ctx.textBaseline = "top";
  ctx.font = "500 30px 'Geist Mono', ui-monospace, monospace";
  ctx.fillStyle = accent;
  ctx.fillText("CLASS A  ·  GALLERY", 70, 84);
  ctx.font = "700 168px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#f3eee3";
  ctx.fillText("THROUGH", 62, 150);
  ctx.strokeStyle = "#f3eee3";
  ctx.lineWidth = 3;
  ctx.strokeText("THE LENS", 62, 318);
  ctx.font = "400 40px Inter, sans-serif";
  ctx.fillStyle = "rgba(236, 230, 218, 0.72)";
  ctx.fillText("A walk through the photographs.", 70, 520);
  ctx.font = "500 26px 'Geist Mono', ui-monospace, monospace";
  ctx.fillStyle = accent;
  ctx.fillText(fine ? "SCROLL TO WALK  ·  HOVER A PRINT  ·  CLICK TO OPEN" : "SCROLL TO WALK  ·  TAP A PRINT TO OPEN", 70, 640);
  return canvas;
}

/** Load a photo and shrink it, so a long walk does not exhaust GPU memory. */
function loadPhoto(src: string, max: number) {
  return new Promise<HTMLCanvasElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * k);
      canvas.height = Math.round(img.naturalHeight * k);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

type Item = {
  post: InstagramPost;
  print?: Three.Mesh<Three.PlaneGeometry, Three.ShaderMaterial>;
  label?: Three.Mesh<Three.PlaneGeometry, Three.MeshBasicMaterial>;
  ratio: number;
  loading: boolean;
  hover: number;
};

export function Flow({ posts, total, onOpen, onShowAll }: { posts: InstagramPost[]; total: number; onOpen: (i: number) => void; onShowAll: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const finePointer = useExperience((s) => s.finePointer);
  const [current, setCurrent] = useState(0);
  const [plain, setPlain] = useState(false);
  const open = useRef(onOpen);
  open.current = onOpen;

  const count = posts.length;
  // One more place than there are photos: the title plate hangs first.
  const travel = count * STEP + START - END;

  useEffect(() => {
    if (reducedMotion || !count) return;
    const el = canvas.current, box = stage.current, track = wrap.current;
    if (!el || !box || !track) return;
    let disposed = false;
    let cleanup = () => {};

    void (async () => {
      const THREE = await import("three");
      await Promise.all([document.fonts.load("700 80px 'Space Grotesk'"), document.fonts.load("500 30px Inter"), document.fonts.load("500 24px 'Geist Mono'")]).catch(() => {});
      if (disposed) return;

      let renderer: Three.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: false, powerPreference: "high-performance" });
      } catch {
        setPlain(true);
        return;
      }
      // Colours pass straight through: the shaders work on them as stored.
      THREE.ColorManagement.enabled = false;
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, finePointer ? 1.5 : 1.25));
      renderer.setClearColor(0x0b0a0a, 1);

      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 40);
      const scene = new THREE.Scene();
      const geometry = new THREE.PlaneGeometry(1, 1, 16, 16);
      const flat = new THREE.PlaneGeometry(1, 1);
      const accent = `hsl(${getComputedStyle(document.documentElement).getPropertyValue("--primary").trim().replace(/ /g, ", ")})`;
      const maxSide = finePointer ? 1000 : 640;

      const titleTexture = new THREE.CanvasTexture(titleCard(accent, finePointer));
      titleTexture.minFilter = THREE.LinearFilter;
      const title = new THREE.Mesh(flat, new THREE.MeshBasicMaterial({ map: titleTexture, transparent: true, depthTest: false }));
      title.renderOrder = 1;
      scene.add(title);

      const backdrop = new THREE.ShaderMaterial({
        vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
        fragmentShader: BACKDROP_FRAG,
        uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uAspect: { value: 1 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) } },
        depthTest: false,
        depthWrite: false,
      });
      const behind = new THREE.Scene();
      behind.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), backdrop));
      const still = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      renderer.autoClear = false;

      const items: Item[] = posts.map((post) => ({ post, ratio: 0.8, loading: false, hover: 0 }));

      let aspect = 1;
      const resize = () => {
        const w = box.clientWidth, h = box.clientHeight;
        renderer.setSize(w, h, false);
        aspect = w / h;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(box);

      // Where a print hangs. On a wide screen they alternate left and right of
      // the path and overlap a little in the middle; on a tall one they
      // alternate above and below it instead.
      const place = (i: number) => {
        const wide = aspect >= 1;
        const side = i % 2 === 0 ? -1 : 1;
        const drift = ((i * 7) % 5) / 4 - 0.5; // -0.5..0.5, fixed per print
        const half = Math.tan((FOV * Math.PI) / 360) * 2.1; // half the view's height at reading distance
        return wide
          ? { x: side * Math.min(0.72, half * aspect * 0.46) + drift * 0.1, y: drift * 0.22 + 0.06, z: -i * STEP, tall: half * 1.42, widest: half * aspect * 1.02 }
          : { x: side * 0.03 + drift * 0.03, y: side * half * 0.36 + 0.05, z: -i * STEP, tall: half * 0.78, widest: half * aspect * 1.6 };
      };

      const summon = (item: Item, i: number) => {
        if (item.print || item.loading) return;
        item.loading = true;
        void loadPhoto(item.post.media_url, maxSide).then((photo) => {
          item.loading = false;
          if (!photo || disposed) return;
          item.ratio = photo.width / photo.height;
          const texture = new THREE.CanvasTexture(photo);
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          const material = new THREE.ShaderMaterial({
            vertexShader: PRINT_VERT,
            fragmentShader: PRINT_FRAG,
            uniforms: { map: { value: texture }, uNear: { value: 0 }, uShow: { value: 0 }, uHover: { value: 0 }, uDim: { value: 1 }, uTime: { value: 0 }, uVel: { value: 0 }, uRatio: { value: item.ratio }, uPoint: { value: new THREE.Vector2(0.5, 0.5) } },
            transparent: true,
            depthTest: false,
          });
          item.print = new THREE.Mesh(geometry, material);
          item.print.userData.index = i;
          // Far prints are drawn first, so nearer ones cover them.
          item.print.renderOrder = -i * 2 - 2;
          scene.add(item.print);

          const text = new THREE.CanvasTexture(card(i, item.post, accent));
          text.minFilter = THREE.LinearFilter;
          item.label = new THREE.Mesh(flat, new THREE.MeshBasicMaterial({ map: text, transparent: true, depthTest: false, opacity: 0 }));
          item.label.renderOrder = -i * 2 - 1;
          scene.add(item.label);
        });
      };
      const dismiss = (item: Item) => {
        if (item.print) {
          scene.remove(item.print);
          item.print.material.uniforms.map.value.dispose();
          item.print.material.dispose();
          item.print = undefined;
        }
        if (item.label) {
          scene.remove(item.label);
          item.label.material.map?.dispose();
          item.label.material.dispose();
          item.label = undefined;
        }
      };

      let visible = true;
      const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
      io.observe(track);

      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      let hovered = -1;
      let frame = 0, last = performance.now(), prev = 0, vel = 0, shown = -1, lx = 0, ly = 0;

      const render = (now: number) => {
        frame = requestAnimationFrame(render);
        if (!visible || document.hidden) return;
        const dt = Math.min(0.05, (now - last) / 1000) || 0.016;
        last = now;

        const r = track.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
        if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
        const depth = progress * travel;
        vel += (Math.max(-1, Math.min(1, ((depth - prev) / dt) * 0.18)) - vel) * 0.14;
        prev = depth;

        // The view leans toward the pointer.
        const rect = box.getBoundingClientRect();
        const inside = finePointer && pointer.seen && pointer.y >= rect.top && pointer.y <= rect.bottom;
        const px = inside ? ((pointer.x - rect.left) / rect.width) * 2 - 1 : 0;
        const py = inside ? 1 - ((pointer.y - rect.top) / rect.height) * 2 : 0;
        lx += (px - lx) * 0.06;
        ly += (py - ly) * 0.06;
        const camZ = START - depth;
        camera.position.set(lx * 0.16, ly * 0.1, camZ);
        camera.rotation.set(ly * 0.025, -lx * 0.04, 0);

        // The title plate hangs in the first place, like a print.
        const first = place(0);
        // Smaller than a print and pulled toward the middle, so leaning with the
        // cursor never pushes its lettering off the edge.
        let th = first.tall * 0.6, tw = th * (1024 / 760);
        if (tw > first.widest) {
          tw = first.widest;
          th = tw * (760 / 1024);
        }
        title.scale.set(tw, th, 1);
        title.position.set(first.x * 0.75, first.y, first.z);
        const td = camZ - first.z;
        title.material.opacity = Math.max(0, Math.min(1, (td - 0.8) / 0.7));
        title.visible = td > 0.4 && td < 11;

        // Which print is under the pointer?
        let hit = -1;
        if (inside) {
          ndc.set(px, py);
          ray.setFromCamera(ndc, camera);
          const targets = items.filter((it) => it.print?.visible).map((it) => it.print!);
          const found = ray.intersectObjects(targets, false).sort((a, b) => a.distance - b.distance)[0];
          if (found?.uv) {
            hit = found.object.userData.index as number;
            (found.object as NonNullable<Item["print"]>).material.uniforms.uPoint.value.copy(found.uv);
          }
        }
        if (hit !== hovered) {
          hovered = hit;
          box.dataset.hot = hit >= 0 ? "true" : "false";
          if (hit >= 0) audio.hover(0.5 + lx * 0.4);
        }

        let nearest = 0, nearestBy = 99;
        items.forEach((item, i) => {
          const at = place(i + 1);
          const d = camZ - at.z; // how far ahead of us it hangs
          if (d < -0.6 || d > 11) {
            if (d < -6 || d > 16) dismiss(item);
            if (item.print) item.print.visible = false;
            if (item.label) item.label.visible = false;
            return;
          }
          summon(item, i);
          if (!item.print || !item.label) return;

          let h = at.tall;
          let w = h * item.ratio;
          if (w > at.widest) {
            w = at.widest;
            h = w / item.ratio;
          }
          item.hover += ((hovered === i ? 1 : 0) - item.hover) * 0.12;
          // Fades up out of the dark, and away again just before it would hit the camera.
          const near = 1 - Math.min(1, Math.max(0, (d - 3.1) / 6));
          // It lets go before it gets close enough to fill the whole view.
          const passing = Math.min(1, Math.max(0, (d - 0.8) / 0.7));
          const u = item.print.material.uniforms;
          u.uNear.value = near;
          u.uShow.value = Math.min(passing, u.uShow.value + dt * 2.4);
          u.uHover.value = item.hover;
          u.uDim.value += ((hovered >= 0 && hovered !== i ? 0.5 : 1) - u.uDim.value) * 0.1;
          u.uTime.value = now / 1000;
          u.uVel.value = vel;
          const grow = 1 + item.hover * 0.045;
          item.print.visible = true;
          item.print.position.set(at.x, at.y, at.z + item.hover * 0.12);
          item.print.scale.set(w * grow, h * grow, 1);
          // It turns to face the pointer while it is being looked at.
          item.print.rotation.set(-ly * 0.16 * item.hover, lx * 0.22 * item.hover, 0);

          // The card sits just under the print, flush with its left edge.
          const lw = Math.max(w, 0.62);
          const lh = lw * (190 / 720);
          item.label.visible = true;
          item.label.scale.set(lw, lh, 1);
          item.label.position.set(at.x - (w * grow) / 2 + lw / 2, at.y - (h * grow) / 2 - lh / 2 - 0.025, at.z + item.hover * 0.12);
          // Only the prints you are standing at show their card; further back it would just be clutter.
          const reading = 1 - Math.min(1, Math.max(0, (d - 2.7) / 0.7));
          item.label.material.opacity = u.uShow.value * Math.max(reading, item.hover) * u.uDim.value;

          const off = Math.abs(d - 2.0);
          if (off < nearestBy) {
            nearestBy = off;
            nearest = i;
          }
        });
        if (nearest !== shown) {
          shown = nearest;
          setCurrent(nearest);
          audio.tick(0.9);
        }
        backdrop.uniforms.uTime.value = now / 1000;
        backdrop.uniforms.uScroll.value = scrollState.y / window.innerHeight;
        backdrop.uniforms.uAspect.value = aspect;
        backdrop.uniforms.uMouse.value.set(inside ? (px + 1) / 2 : 0.5, inside ? (py + 1) / 2 : 0.5);
        renderer.clear();
        renderer.render(behind, still);
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(render);

      // A click (or tap) opens the print under it.
      const click = (e: MouseEvent) => {
        const r = box.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, 1 - ((e.clientY - r.top) / r.height) * 2);
        ray.setFromCamera(ndc, camera);
        const targets = items.filter((it) => it.print?.visible).map((it) => it.print!);
        const found = ray.intersectObjects(targets, false).sort((a, b) => a.distance - b.distance)[0];
        if (found) {
          audio.shutter();
          open.current(found.object.userData.index as number);
        }
      };
      el.addEventListener("click", click);

      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        io.disconnect();
        el.removeEventListener("click", click);
        items.forEach(dismiss);
        titleTexture.dispose();
        title.material.dispose();
        backdrop.dispose();
        geometry.dispose();
        flat.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [posts, count, travel, reducedMotion, finePointer]);

  const allButton = (
    <button type="button" onClick={onShowAll} className="gate-button is-primary pointer-events-auto">
      <span className="hidden sm:inline">See the</span> whole gallery · {total} <ArrowDown size={14} />
    </button>
  );

  // Reduced motion, or no WebGL: the same photographs and captions, set out plainly.
  if (reducedMotion || plain) {
    return (
      <section className="px-4 pb-16 pt-28 sm:px-6">
        <h1 className="font-headline text-5xl font-bold uppercase leading-none md:text-7xl">Through the Lens</h1>
        <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <li key={post.id}>
              <button type="button" onClick={() => onOpen(i)} className="block w-full text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.media_url} alt="" loading="lazy" className="w-full" />
                <span className="mt-3 block text-lg leading-snug">{captionTitle(post.caption)}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-14 text-center">{allButton}</p>
      </section>
    );
  }

  const post = posts[current];
  return (
    <div ref={wrap} style={{ height: `${Math.round(travel * 40 + 100)}svh` }} className="relative">
      <div ref={stage} data-hot="false" className="sticky top-0 h-[100svh] overflow-hidden bg-[#0b0a0a]">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" aria-hidden />

        {/* Where you are in the walk, the way out to everything, and when the nearest print was made. */}
        <div className="pointer-events-none absolute inset-x-4 bottom-5 grid grid-cols-[1fr_auto_1fr] items-end gap-4 sm:inset-x-6 md:bottom-12">
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-ink/70">
            <p>
              <span className="text-primary">{frameNumber(current)}</span> / {String(total).padStart(3, "0")}
            </p>
          </div>
          {allButton}
          <p className="text-right font-headline text-2xl font-bold uppercase leading-none tracking-tight text-ink/85 md:text-4xl">{post ? frameMonth(post.timestamp) : ""}</p>
        </div>
        <div ref={bar} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary" style={{ transform: "scaleX(0)" }} aria-hidden />
      </div>

      {/* For screen readers and search engines, which cannot read a canvas. */}
      <div className="sr-only">
        <h1>Through the Lens</h1>
        <ul>
          {posts.map((p, i) => (
            <li key={p.id}>
              <button type="button" onClick={() => onOpen(i)}>
                Photo {frameNumber(i)}, {frameMonth(p.timestamp)}: {captionTitle(p.caption)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
