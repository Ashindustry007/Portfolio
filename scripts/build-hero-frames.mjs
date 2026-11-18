// Builds the figure's assets from the source clip in assets/hero-src/ and the
// cutout masks in assets/hero-masks/ (see make-hero-masks.py).
//
//   node scripts/build-hero-frames.mjs
//
// Output, in public/hero/:
//   f-00.webp … f-NN.webp   the turntable spin: the figure cut out, square crop
//   rest.webp               the resting frame again, larger, for the still pose
//   cloak-c|a|t.webp        one pose per class for the cloaked avatars
//   cloak-c|a|t-field.webp  that pose's silhouette, blurred: used for his rim light and the coder's giant
// and src/components/hero/manifest.json: frame count and which frame the figure rests on.
//
// To use a different clip: replace the PNGs in assets/hero-src/, re-run
// make-hero-masks.py, then adjust CROP, `keep`, REST_SOURCE and CLOAK_POSES
// below.

import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets/hero-src";
const MASKS = "assets/hero-masks";
const OUT = "public/hero";

// Square region of the 1280x720 source that holds the head and shoulders.
const CROP = { left: 280, top: 0, width: 720, height: 720 };
const SIZE = 640;

// The clip turns quickly for its first two thirds, then drifts to a stop. Sample
// the turn densely and the drift sparsely, and end on the resting frame:
// near-frontal, level gaze.
const TURN_END = 126;
const REST_SOURCE = 168;
const keep = (i) => (i <= TURN_END ? i % 3 === 0 : i <= REST_SOURCE && i % 6 === 0);

// Source frame for each class's avatar: facing us, looking up, gazing off to the side.
const CLOAK_POSES = { c: 168, a: 9, t: 36 };
// The avatars use a wider cut than the spin, so both shoulders are whole.
const CLOAK_CROP = { left: 140, top: 0, width: 1000, height: 720 };

const files = (await readdir(SRC)).filter((f) => f.endsWith(".png")).sort();
const indices = files.map((_, i) => i).filter(keep);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const maskFor = (i) => path.join(MASKS, `${String(i).padStart(3, "0")}.png`);

/** The figure from source frame `i`, cut out with its mask, as an RGBA image `size` wide. */
async function cutout(i, size, { soften = 0, crop = CROP } = {}) {
  const height = Math.round((size * crop.height) / crop.width);
  let rgb = sharp(path.join(SRC, files[i])).extract(crop).resize(size, height, { kernel: "cubic" });
  if (soften) rgb = rgb.blur(soften);
  const alpha = await sharp(maskFor(i)).extract(crop).resize(size, height).blur(0.8).extractChannel(0).raw().toBuffer();
  return sharp(await rgb.removeAlpha().raw().toBuffer(), { raw: { width: size, height, channels: 3 } }).joinChannel(alpha, { raw: { width: size, height, channels: 1 } });
}

let bytes = 0;
await Promise.all(
  indices.map(async (source, n) => {
    const out = path.join(OUT, `f-${String(n).padStart(2, "0")}.webp`);
    const info = await (await cutout(source, SIZE)).webp({ quality: 76, alphaQuality: 80, effort: 6 }).toFile(out);
    bytes += info.size;
  })
);

// The figure spends nearly all its time on the resting frame, so that one also
// ships larger. The source is only 720px tall; upscale smoothly so the line
// drawing made from it has clean gradients to follow.
await (await cutout(REST_SOURCE, 1024, { soften: 0.6 })).webp({ quality: 88, alphaQuality: 90, effort: 6 }).toFile(path.join(OUT, "rest.webp"));

for (const [key, source] of Object.entries(CLOAK_POSES)) {
  await (await cutout(source, CLOAK_CROP.width, { soften: 0.4, crop: CLOAK_CROP })).webp({ quality: 84, alphaQuality: 88, effort: 6 }).toFile(path.join(OUT, `cloak-${key}.webp`));
  // Wide blur of the silhouette: a cheap stand-in for "distance from the body".
  await sharp(maskFor(source)).extract(CLOAK_CROP).resize(356, 256).blur(22).greyscale().webp({ lossless: true }).toFile(path.join(OUT, `cloak-${key}-field.webp`));
}

const rest = indices.length - 1;
await writeFile("src/components/hero/manifest.json", JSON.stringify({ count: indices.length, rest, size: SIZE }, null, 2) + "\n");

console.log(`${indices.length} frames, ${(bytes / 1024).toFixed(0)} KB, rest frame ${rest}`);
