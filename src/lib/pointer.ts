// One shared pointer reading for the cursor, the hero figure and the 3D world.
// Consumers read this inside their own animation frames, so pointer movement
// never triggers a React render.
export const pointer = {
  x: -100,
  y: -100,
  // -1..1 from the centre of the viewport
  nx: 0,
  ny: 0,
  down: false,
  seen: false,
  lastMove: 0,
};

let listening = false;

export function initPointer() {
  if (listening || typeof window === "undefined") return;
  listening = true;

  const move = (e: PointerEvent) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ny = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.seen = true;
    pointer.lastMove = performance.now();
  };
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerdown", (e) => { pointer.down = true; move(e); }, { passive: true });
  window.addEventListener("pointerup", () => { pointer.down = false; }, { passive: true });
  window.addEventListener("pointercancel", () => { pointer.down = false; }, { passive: true });
}
