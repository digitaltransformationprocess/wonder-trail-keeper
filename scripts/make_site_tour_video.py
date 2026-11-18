"""
Build a Google-AI-Studio-style product tour from AI Discov screenshots:
floating browser chrome + cinematic multi-segment Ken Burns (zoom / pan / scroll).
16:9
"""
from __future__ import annotations

import os
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "brand" / "site-tour"
OUT_FRAMES = SRC / "frames"
FINAL = ROOT / "public" / "brand" / "aidiscov-site-tour.mp4"

# 16:9 cinematic
W, H = 1920, 1080
FPS = 30
BG = (6, 6, 8)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    cands = (
        [r"C:\Windows\Fonts\segoeuib.ttf", r"C:\Windows\Fonts\arialbd.ttf"]
        if bold
        else [r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\arial.ttf"]
    )
    for p in cands:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def ease_in_out(t: float) -> float:
    return t * t * (3 - 2 * t)


def ease_out_cubic(t: float) -> float:
    return 1 - (1 - t) ** 3


def ease_in_out_cubic(t: float) -> float:
    if t < 0.5:
        return 4 * t * t * t
    return 1 - (-2 * t + 2) ** 3 / 2


def round_rect(draw: ImageDraw.ImageDraw, box, radius: int, fill) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def make_browser_stage(screenshot: Image.Image, url: str) -> Image.Image:
    """
    Build a large stage (overscan) so the camera can push in / pan / scroll
    without hitting empty edges too quickly.
    """
    stage_w, stage_h = int(W * 1.55), int(H * 1.55)
    stage = Image.new("RGB", (stage_w, stage_h), BG)
    draw = ImageDraw.Draw(stage)

    # atmospheric glow
    for i in range(55):
        a = int(22 * (1 - i / 55))
        pad = 30 + i * 7
        draw.ellipse(
            [pad, stage_h // 2 - 520 - i * 4, stage_w - pad, stage_h // 2 + 520 + i * 4],
            fill=(10 + a // 3, 12 + a // 3, 20 + a // 2),
        )

    chrome_w = int(stage_w * 0.78)
    chrome_x = (stage_w - chrome_w) // 2
    chrome_y = int(stage_h * 0.10)
    chrome_h = int(stage_h * 0.78)
    radius = 26

    # soft drop shadow
    shadow = Image.new("RGBA", (stage_w, stage_h), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle(
        (chrome_x + 18, chrome_y + 28, chrome_x + chrome_w + 18, chrome_y + chrome_h + 28),
        radius=radius,
        fill=(0, 0, 0, 110),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    stage = Image.alpha_composite(stage.convert("RGBA"), shadow).convert("RGB")
    draw = ImageDraw.Draw(stage)

    round_rect(
        draw,
        (chrome_x, chrome_y, chrome_x + chrome_w, chrome_y + chrome_h),
        radius,
        (28, 28, 32),
    )

    bar_h = 58
    round_rect(
        draw,
        (chrome_x, chrome_y, chrome_x + chrome_w, chrome_y + bar_h + 20),
        radius,
        (38, 38, 42),
    )
    draw.rectangle(
        (chrome_x, chrome_y + 30, chrome_x + chrome_w, chrome_y + bar_h + 20),
        fill=(38, 38, 42),
    )

    for i, col in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        cx = chrome_x + 32 + i * 24
        cy = chrome_y + 30
        draw.ellipse((cx - 8, cy - 8, cx + 8, cy + 8), fill=col)

    pill_x0 = chrome_x + 120
    pill_x1 = chrome_x + chrome_w - 32
    pill_y0 = chrome_y + 18
    pill_y1 = chrome_y + 46
    round_rect(draw, (pill_x0, pill_y0, pill_x1, pill_y1), 13, (22, 22, 26))
    draw.text((pill_x0 + 16, pill_y0 + 5), url, font=font(20, False), fill=(180, 184, 192))

    content_pad = 12
    content_box = (
        chrome_x + content_pad,
        chrome_y + bar_h + 20,
        chrome_x + chrome_w - content_pad,
        chrome_y + chrome_h - content_pad,
    )
    cw = content_box[2] - content_box[0]
    ch = content_box[3] - content_box[1]

    ss = screenshot.convert("RGB")
    # Scale so screenshot is TALLER than the viewport → room to "scroll"
    scale = max(cw / ss.width, (ch * 1.55) / ss.height)
    nw, nh = max(cw, int(ss.width * scale)), max(ch, int(ss.height * scale))
    ss = ss.resize((nw, nh), Image.Resampling.LANCZOS)
    # store full tall page into a content layer, then crop top into chrome initially
    # For stage we paste top portion; scroll happens via camera cy on full stage
    # Better: paste full tall screenshot clipped into content box from top,
    # but keep a separate tall page layer for scroll shots.

    # Paste top of page into chrome for the stage look
    left = (nw - cw) // 2
    ss_view = ss.crop((left, 0, left + cw, ch))
    stage.paste(ss_view, (content_box[0], content_box[1]))

    # Attach tall page as attribute via packing into a slightly taller stage strip
    # We'll rebuild scrollable stages separately when needed.
    stage.info["content_box"] = content_box
    stage.info["page"] = ss
    stage.info["page_left"] = left
    return stage


def make_scroll_stage(screenshot: Image.Image, url: str, scroll_t: float) -> Image.Image:
    """Browser stage with page scrolled by scroll_t in [0,1]."""
    stage = make_browser_stage(screenshot, url)
    page: Image.Image = stage.info["page"]
    left = stage.info["page_left"]
    box = stage.info["content_box"]
    cw = box[2] - box[0]
    ch = box[3] - box[1]
    max_y = max(0, page.height - ch)
    y0 = int(max_y * scroll_t)
    view = page.crop((left, y0, left + cw, y0 + ch))
    stage.paste(view, (box[0], box[1]))
    return stage


def sample_camera(
    base: Image.Image,
    z: float,
    cx: float,
    cy: float,
) -> Image.Image:
    bw, bh = base.size
    z = max(1.0, z)
    vw, vh = bw / z, bh / z
    x0 = cx * bw - vw / 2
    y0 = cy * bh - vh / 2
    x0 = max(0, min(bw - vw, x0))
    y0 = max(0, min(bh - vh, y0))
    crop = base.crop((int(x0), int(y0), int(x0 + vw), int(y0 + vh)))
    return crop.resize((W, H), Image.Resampling.LANCZOS)


def path_frames(
    base: Image.Image,
    n_frames: int,
    keys: list[tuple[float, float, float, float]],
    ease=ease_in_out_cubic,
) -> list[Image.Image]:
    """
    keys: list of (t, zoom, cx, cy) with t in 0..1 sorted.
    """
    frames: list[Image.Image] = []
    for i in range(n_frames):
        u = i / max(1, n_frames - 1)
        # find segment
        for a, b in zip(keys, keys[1:]):
            if u <= b[0] or b is keys[-1]:
                span = max(1e-6, b[0] - a[0])
                local = (u - a[0]) / span
                local = min(1.0, max(0.0, local))
                e = ease(local)
                z = lerp(a[1], b[1], e)
                cx = lerp(a[2], b[2], e)
                cy = lerp(a[3], b[3], e)
                frames.append(sample_camera(base, z, cx, cy))
                break
    return frames


def scroll_path_frames(
    screenshot: Image.Image,
    url: str,
    n_frames: int,
    cam_keys: list[tuple[float, float, float, float]],
    scroll_from: float,
    scroll_to: float,
) -> list[Image.Image]:
    """Animate both camera and page scroll for a true 'scrolling site' feel."""
    frames: list[Image.Image] = []
    for i in range(n_frames):
        u = i / max(1, n_frames - 1)
        e = ease_in_out_cubic(u)
        scroll_t = lerp(scroll_from, scroll_to, e)
        stage = make_scroll_stage(screenshot, url, scroll_t)
        # camera key interp
        z, cx, cy = cam_keys[0][1], cam_keys[0][2], cam_keys[0][3]
        for a, b in zip(cam_keys, cam_keys[1:]):
            if u <= b[0] or b is cam_keys[-1]:
                span = max(1e-6, b[0] - a[0])
                local = min(1.0, max(0.0, (u - a[0]) / span))
                ee = ease_in_out_cubic(local)
                z = lerp(a[1], b[1], ee)
                cx = lerp(a[2], b[2], ee)
                cy = lerp(a[3], b[3], ee)
                break
        frames.append(sample_camera(stage, z, cx, cy))
    return frames


def title_card(
    lines: list[tuple[str, int, bool, tuple[int, int, int]]],
    hold: int,
    zoom_to: float = 1.08,
) -> list[Image.Image]:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    for i in range(60):
        a = int(22 * (1 - i / 60))
        pad = 100 + i * 8
        draw.ellipse(
            [pad, H // 2 - 320, W - pad, H // 2 + 320],
            fill=(10 + a // 4, 12 + a // 4, 18 + a // 3),
        )
    rendered = []
    total_h = 0
    for text, size, bold, color in lines:
        f = font(size, bold)
        bbox = draw.textbbox((0, 0), text, font=f)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        rendered.append((text, f, color, tw, th))
        total_h += th + 16
    y = (H - total_h) // 2
    for text, f, color, tw, th in rendered:
        draw.text(((W - tw) // 2, y), text, font=f, fill=color)
        y += th + 16

    # subtle push-in on title
    frames = []
    for i in range(hold):
        t = ease_out_cubic(i / max(1, hold - 1))
        z = lerp(1.0, zoom_to, t)
        frames.append(sample_camera(img, z, 0.5, 0.5))
    return frames


def crossfade(a: Image.Image, b: Image.Image, n: int) -> list[Image.Image]:
    return [Image.blend(a, b, (i + 1) / (n + 1)) for i in range(n)]


def main() -> None:
    OUT_FRAMES.mkdir(parents=True, exist_ok=True)
    for old in OUT_FRAMES.glob("*.jpg"):
        old.unlink()

    all_frames: list[Image.Image] = []

    # Opening title — slow push
    all_frames += title_card(
        [
            ("clarity over noise", 78, True, (255, 255, 255)),
            ("AI Discov", 40, False, (150, 160, 180)),
        ],
        hold=int(FPS * 2.4),
        zoom_to=1.12,
    )

    # --- HOME: establish wide → punch into search ---
    home = Image.open(SRC / "aidiscov-home.png")
    home_stage = make_browser_stage(home, "aidiscov.com")
    home_move = path_frames(
        home_stage,
        int(FPS * 4.2),
        [
            (0.0, 1.05, 0.50, 0.42),
            (0.35, 1.25, 0.48, 0.46),
            (0.70, 1.70, 0.50, 0.58),  # dive into search
            (1.0, 1.85, 0.52, 0.62),
        ],
    )
    all_frames += crossfade(all_frames[-1], home_move[0], 12)
    all_frames += home_move

    # --- EXPLORE: lateral pan across filters then push ---
    explore = Image.open(SRC / "aidiscov-explore.png")
    explore_stage = make_browser_stage(explore, "aidiscov.com/explore")
    explore_move = path_frames(
        explore_stage,
        int(FPS * 4.0),
        [
            (0.0, 1.15, 0.35, 0.40),
            (0.40, 1.35, 0.62, 0.45),  # pan right across filters
            (0.75, 1.75, 0.55, 0.55),
            (1.0, 1.90, 0.50, 0.58),
        ],
    )
    all_frames += crossfade(all_frames[-1], explore_move[0], 14)
    all_frames += explore_move

    # --- LATEST: scroll feed + slight zoom ---
    latest = Image.open(SRC / "aidiscov-latest-feed.png")
    latest_move = scroll_path_frames(
        latest,
        "aidiscov.com/latest",
        int(FPS * 4.6),
        cam_keys=[
            (0.0, 1.20, 0.50, 0.45),
            (0.45, 1.40, 0.48, 0.50),
            (1.0, 1.65, 0.52, 0.55),
        ],
        scroll_from=0.0,
        scroll_to=0.72,
    )
    all_frames += crossfade(all_frames[-1], latest_move[0], 12)
    all_frames += latest_move

    # --- TOOL DETAIL: slow orbit-like pan + deep zoom on copy ---
    tool = Image.open(SRC / "aidiscov-tool-colab.png")
    tool_stage = make_browser_stage(tool, "aidiscov.com/tools/google-colab")
    tool_move = path_frames(
        tool_stage,
        int(FPS * 4.4),
        [
            (0.0, 1.10, 0.42, 0.38),
            (0.30, 1.35, 0.55, 0.42),
            (0.65, 1.80, 0.40, 0.52),  # into description
            (1.0, 2.05, 0.45, 0.55),
        ],
    )
    all_frames += crossfade(all_frames[-1], tool_move[0], 14)
    all_frames += tool_move

    # --- DEALS: pull back then punch CTA ---
    deals = Image.open(SRC / "aidiscov-deals.png")
    deals_stage = make_browser_stage(deals, "aidiscov.com/deals")
    deals_move = path_frames(
        deals_stage,
        int(FPS * 4.0),
        [
            (0.0, 1.55, 0.55, 0.50),
            (0.35, 1.20, 0.50, 0.45),  # pull back wide
            (0.70, 1.70, 0.62, 0.55),  # into Get Deal
            (1.0, 1.95, 0.68, 0.58),
        ],
    )
    all_frames += crossfade(all_frames[-1], deals_move[0], 12)
    all_frames += deals_move

    # End card
    end = title_card(
        [
            ("Find the right AI", 64, True, (255, 255, 255)),
            ("for your use case.", 64, True, (255, 255, 255)),
            ("", 14, False, (255, 255, 255)),
            ("aidiscov.com", 40, False, (120, 170, 255)),
        ],
        hold=int(FPS * 3.2),
        zoom_to=1.10,
    )
    all_frames += crossfade(all_frames[-1], end[0], 16)
    all_frames += end

    print(f"Writing {len(all_frames)} frames ({len(all_frames)/FPS:.1f}s)…")
    for i, fr in enumerate(all_frames):
        fr.save(OUT_FRAMES / f"f{i:05d}.jpg", quality=93, optimize=True)

    subprocess.check_call(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            str(FPS),
            "-i",
            str(OUT_FRAMES / "f%05d.jpg"),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-crf",
            "17",
            "-movflags",
            "+faststart",
            str(FINAL),
        ]
    )
    print(f"done -> {FINAL}")


if __name__ == "__main__":
    main()
