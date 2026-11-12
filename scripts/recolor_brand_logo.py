"""Recolor AI Discov mark PNGs to match site cool-slate palette (hue ~260)."""
from __future__ import annotations

from collections import Counter
from pathlib import Path

from PIL import Image

ASSETS = Path(
    r"C:\Users\bilal\.cursor\projects\c-Users-bilal-Desktop-the-new-idea-wonder-trail-keeper\assets"
)
OUT = Path(__file__).resolve().parents[1] / "public" / "brand"

LIGHT_SRC = ASSETS / "aidiscov-icon-light-ea37fcc3-42df-4b99-90bf-be76e908afc4.png"
DARK_SRC = ASSETS / "aidiscov-icon-dark-9a4a5914-3be8-45bd-9b0f-996df16307f3.png"

# Site-aligned targets (approx from oklch 260 palette)
LIGHT = {
    "bg": (248, 248, 250, 255),  # oklch ~0.975 paper
    "outer": (120, 122, 132, 255),  # muted slate
    "center": (36, 38, 48, 255),  # primary dark
    "dot": (58, 78, 168, 255),  # cool indigo signal (was terracotta)
}
DARK = {
    "bg": (28, 28, 32, 255),  # oklch ~0.145 charcoal
    "outer": (150, 152, 160, 255),  # muted slate light
    "center": (244, 244, 246, 255),  # near-white bar
    "dot": (130, 148, 220, 255),  # lighter cool indigo
}


def dist2(a, b):
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2


def classify_light(rgb):
    r, g, b = rgb
    # cream bg
    if r > 220 and g > 215 and b > 200 and abs(r - g) < 25:
        return "bg"
    # terracotta / orange accent
    if r > 160 and g < 140 and b < 120 and r > g + 30:
        return "dot"
    # near black center bar
    if r < 60 and g < 60 and b < 60:
        return "center"
    # medium gray arms
    if abs(r - g) < 20 and abs(g - b) < 20 and 70 < r < 180:
        return "outer"
    # anti-aliased edges: bias by nearest role
    return None


def classify_dark(rgb):
    r, g, b = rgb
    # near-black bg
    if r < 40 and g < 40 and b < 40:
        return "bg"
    # terracotta
    if r > 160 and g < 140 and b < 120 and r > g + 30:
        return "dot"
    # white / cream center
    if r > 210 and g > 210 and b > 200:
        return "center"
    # medium gray arms
    if abs(r - g) < 25 and abs(g - b) < 25 and 90 < r < 190:
        return "outer"
    return None


def recolor(src: Path, palette: dict, classify, out: Path):
    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size
    role_counts = Counter()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            role = classify((r, g, b))
            if role is None:
                # nearest of known role centers in source-ish space
                candidates = {
                    "bg": (240, 238, 230) if classify is classify_light else (20, 20, 22),
                    "outer": (128, 128, 123),
                    "center": (26, 28, 33) if classify is classify_light else (242, 242, 233),
                    "dot": (217, 93, 57),
                }
                role = min(candidates, key=lambda k: dist2((r, g, b), candidates[k]))
            role_counts[role] += 1
            tr, tg, tb, ta = palette[role]
            # preserve anti-alias by blending toward target using alpha of original coverage
            if a < 255:
                # keep soft edges
                px[x, y] = (tr, tg, tb, a)
            else:
                px[x, y] = (tr, tg, tb, ta)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, "PNG")
    print(out.name, dict(role_counts))


def main():
    recolor(LIGHT_SRC, LIGHT, classify_light, OUT / "aidiscov-mark-light.png")
    recolor(DARK_SRC, DARK, classify_dark, OUT / "aidiscov-mark-dark.png")
    # square favicon from dark mark (works on both tabs)
    fav = Image.open(OUT / "aidiscov-mark-dark.png").convert("RGBA")
    fav.save(OUT / "favicon.png", "PNG")
    print("done", OUT)


if __name__ == "__main__":
    main()
