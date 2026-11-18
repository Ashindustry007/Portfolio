"""Cut the figure out of each source frame the hero uses.

One-off step, run only when the source clip in assets/hero-src/ changes. The
masks it writes to assets/hero-masks/ are committed, so the normal asset build
(node scripts/build-hero-frames.mjs) needs nothing but Node.

    python3 -m venv .venv-masks && .venv-masks/bin/pip install "rembg[cpu]" pillow
    .venv-masks/bin/python scripts/make-hero-masks.py
"""

import glob
import os

from PIL import Image
from rembg import new_session, remove

SRC = "assets/hero-src"
OUT = "assets/hero-masks"

# Keep in step with `keep` in build-hero-frames.mjs.
TURN_END = 126
REST_SOURCE = 168


def keep(i: int) -> bool:
    return i % 3 == 0 if i <= TURN_END else (i <= REST_SOURCE and i % 6 == 0)


os.makedirs(OUT, exist_ok=True)
session = new_session("isnet-general-use")
files = sorted(glob.glob(f"{SRC}/*.png"))
for i, path in enumerate(files):
    if not keep(i):
        continue
    mask = remove(Image.open(path).convert("RGB"), session=session, only_mask=True)
    mask.convert("L").save(f"{OUT}/{i:03d}.png", optimize=True)
    print(i, end=" ", flush=True)
print()
