#!/usr/bin/env python3
"""Build VG-only static keyframes and a 4K contact sheet from real project assets."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts" / "vg" / "keyframes"
W, H = 1920, 1080

INK = "#0d1117"
SURFACE = "#161b22"
LINE = "#3b434e"
CREAM = "#e8dece"
PAPER = "#f3ebdf"
LIGHT_INK = "#27231d"
MUTED = "#a8b0bb"
CORAL = "#ff7657"
WHITE = "#f0f3f6"

FONT_REG = Path("C:/Windows/Fonts/segoeui.ttf")
FONT_BOLD = Path("C:/Windows/Fonts/seguisb.ttf")
FONT_CJK_BOLD = Path("C:/Windows/Fonts/msyhbd.ttc")


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REG), size)


def font_cjk(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_CJK_BOLD), size)


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = hex_color.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def fit_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    image = image.convert("RGB")
    scale = max(size[0] / image.width, size[1] / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    x = (resized.width - size[0]) // 2
    y = (resized.height - size[1]) // 2
    return resized.crop((x, y, x + size[0], y + size[1]))


def fit_contain(image: Image.Image, size: tuple[int, int], bg: str) -> Image.Image:
    image = image.convert("RGB")
    scale = min(size[0] / image.width, size[1] / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, bg)
    canvas.paste(resized, ((size[0] - resized.width) // 2, (size[1] - resized.height) // 2))
    return canvas


def rounded_paste(base: Image.Image, asset: Image.Image, box: tuple[int, int, int, int], radius: int = 30) -> None:
    x0, y0, x1, y1 = box
    fitted = fit_cover(asset, (x1 - x0, y1 - y0))
    mask = Image.new("L", fitted.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, fitted.width - 1, fitted.height - 1), radius=radius, fill=255)
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((x0 + 10, y0 + 18, x1 + 10, y1 + 18), radius=radius, fill=(0, 0, 0, 75))
    base.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(22)))
    base.paste(fitted.convert("RGBA"), (x0, y0), mask)


def label(draw: ImageDraw.ImageDraw, shot: str, title: str, light: bool = True) -> None:
    colour = WHITE if light else LIGHT_INK
    draw.text((72, 58), f"{shot}  /  {title.upper()}", font=font(25, True), fill=colour, spacing=2)
    draw.rounded_rectangle((72, 104, 182, 111), radius=4, fill=CORAL)


def pill(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, light: bool = True, accent: bool = False) -> None:
    fnt = font(29, True)
    box = draw.textbbox((0, 0), text, font=fnt)
    width = box[2] - box[0] + 48
    x, y = xy
    fill = CORAL if accent else ("#21262d" if light else "#ffffff")
    colour = INK if accent else (WHITE if light else LIGHT_INK)
    draw.rounded_rectangle((x, y, x + width, y + 58), radius=29, fill=fill, outline=LINE if light and not accent else None, width=2)
    draw.text((x + 24, y + 10), text, font=fnt, fill=colour)


def load(relative: str) -> Image.Image:
    return Image.open(ROOT / relative).convert("RGBA")


def dark_canvas() -> Image.Image:
    return Image.new("RGBA", (W, H), rgba(INK))


def light_canvas() -> Image.Image:
    return Image.new("RGBA", (W, H), rgba(CREAM))


def build_frames() -> list[tuple[str, str, Image.Image]]:
    sf01 = load("artifacts/vg/styleframes/SF01-opening.png")
    sf02 = load("artifacts/vg/styleframes/SF02-product.png")
    sf03 = load("artifacts/vg/styleframes/SF03-evidence-ai.png")
    home_dark = load("app/ui/previews/home-dark-en-minimal.png")
    home_light = load("app/ui/previews/home-light-zh.png")
    workspace = load("app/ui/previews/workspace-en-dark.png")
    development = load("app/ui/previews/development-zh-light.png")
    logo = load("docs/assets/brand/ifc-clashtrace-github-logo.png")

    frames: list[tuple[str, str, Image.Image]] = []

    # S01 — opening.
    frame = fit_cover(sf01, (W, H)).convert("RGBA")
    label(ImageDraw.Draw(frame), "S01", "Opening / Traceable", True)
    frames.append(("S01", "开场：可追溯", frame))

    # S02 — linework-to-product previsual.
    frame = dark_canvas()
    draw = ImageDraw.Draw(frame)
    rounded_paste(frame, home_dark, (250, 155, 1740, 925), 34)
    for x in range(300, 1690, 140):
        draw.line((x, 190, x, 890), fill=rgba(LINE, 85), width=1)
    draw.rectangle((995, 155, 1000, 925), fill=CORAL)
    draw.text((1210, 820), "Blueprint → Product", font=font(42, True), fill=WHITE)
    label(draw, "S02", "Product Reveal", True)
    frames.append(("S02", "产品显形", frame))

    # S03 — feature relay.
    frame = light_canvas()
    draw = ImageDraw.Draw(frame)
    label(draw, "S03", "Local / Deterministic / Evidence", False)
    for idx, (asset, word) in enumerate(((home_dark, "LOCAL"), (home_light, "DETERMINISTIC"), (workspace, "EVIDENCE"))):
        x0 = 95 + idx * 605
        rounded_paste(frame, asset, (x0, 230, x0 + 545, 725), 24)
        draw.text((x0, 770), word, font=font(42, True), fill=LIGHT_INK)
        draw.line((x0, 835, x0 + 430, 835), fill=CORAL if idx == 2 else LINE, width=5)
    frames.append(("S03", "功能接力", frame))

    # S04 — guided tour.
    frame = dark_canvas()
    draw = ImageDraw.Draw(frame)
    rounded_paste(frame, workspace, (165, 125, 1755, 965), 34)
    path = [(425, 310), (1460, 305), (1460, 760), (520, 765)]
    draw.line(path, fill=CORAL, width=7, joint="curve")
    for idx, (x, y) in enumerate(path, start=1):
        draw.ellipse((x - 24, y - 24, x + 24, y + 24), fill=CORAL)
        draw.text((x - 8, y - 17), str(idx), font=font(25, True), fill=INK)
    label(draw, "S04", "One Review Flow", True)
    frames.append(("S04", "一条审查流程", frame))

    # S05 — PG-E deterministic run.
    frame = light_canvas()
    draw = ImageDraw.Draw(frame)
    rounded_paste(frame, workspace, (520, 145, 1800, 945), 34)
    draw.text((90, 245), "PG-E", font=font(116, True), fill=LIGHT_INK)
    draw.text((98, 380), "12 m × 8 m", font=font(44, True), fill=CORAL)
    draw.text((98, 445), "Synthetic clinic", font=font(34), fill=LIGHT_INK)
    draw.text((98, 510), "Real deterministic run", font=font(30), fill=LIGHT_INK)
    pill(draw, (98, 610), "88 relationships", False)
    label(draw, "S05", "PG-E / Real Calculation", False)
    frames.append(("S05", "PG-E真实计算", frame))

    # S06 — counts landing.
    frame = fit_cover(sf02, (W, H)).convert("RGBA")
    draw = ImageDraw.Draw(frame)
    label(draw, "S06", "Results Land", False)
    draw.rounded_rectangle((1160, 760, 1780, 930), radius=30, fill=rgba(PAPER, 235), outline=rgba(CORAL), width=4)
    draw.text((1210, 795), "4 / 1 / 11 / 72", font=font(63, True), fill=LIGHT_INK)
    draw.text((1212, 875), "CLASH · WARNING · N/E · CLEAR", font=font(22, True), fill=LIGHT_INK)
    frames.append(("S06", "结果落定", frame))

    # S07 — focused pair.
    frame = dark_canvas()
    draw = ImageDraw.Draw(frame)
    rounded_paste(frame, workspace, (210, 135, 1710, 945), 34)
    draw.rounded_rectangle((715, 260, 1475, 825), radius=24, outline=CORAL, width=8)
    draw.ellipse((1000, 430, 1190, 620), outline=WHITE, width=6)
    draw.line((1190, 525, 1570, 335), fill=WHITE, width=4)
    draw.text((1370, 275), "FOCUS PAIR", font=font(35, True), fill=WHITE)
    label(draw, "S07", "3D Evidence Focus", True)
    frames.append(("S07", "三维证据聚焦", frame))

    # S08 — rules annotation.
    frame = light_canvas()
    draw = ImageDraw.Draw(frame)
    blurred = fit_cover(workspace, (W, H)).filter(ImageFilter.GaussianBlur(9)).convert("RGBA")
    frame.alpha_composite(Image.blend(blurred, Image.new("RGBA", (W, H), rgba(CREAM)), 0.58))
    draw = ImageDraw.Draw(frame)
    draw.rounded_rectangle((300, 225, 1620, 855), radius=40, fill=rgba(PAPER, 242), outline=rgba(LIGHT_INK, 80), width=2)
    draw.text((405, 330), "HARD CLASH", font=font(34, True), fill=LIGHT_INK)
    draw.text((405, 395), "> 2 mm", font=font(106, True), fill=CORAL)
    draw.line((960, 315, 960, 765), fill=LINE, width=2)
    draw.text((1085, 330), "CLEARANCE WARNING", font=font(34, True), fill=LIGHT_INK)
    draw.text((1085, 395), "< 50 mm", font=font(94, True), fill=CORAL)
    draw.text((405, 650), "Strict boundaries. Visible evidence.", font=font(35), fill=LIGHT_INK)
    label(draw, "S08", "Freeze / Annotate", False)
    frames.append(("S08", "规则定格标注", frame))

    # S09 — fail closed.
    frame = fit_cover(sf03, (W, H)).convert("RGBA")
    draw = ImageDraw.Draw(frame)
    draw.rounded_rectangle((250, 285, 1020, 790), radius=38, fill=rgba(INK, 238), outline=rgba(CORAL), width=4)
    draw.text((335, 370), "NOT_EVALUATED", font=font(64, True), fill=CORAL)
    draw.text((340, 475), "Missing reliable geometry", font=font(36), fill=WHITE)
    pill(draw, (340, 570), "fail closed", True, True)
    pill(draw, (340, 655), "never silently CLEAR", True)
    label(draw, "S09", "Uncertainty Remains Visible", True)
    frames.append(("S09", "不确定性保持可见", frame))

    # S10 — bounded evidence.
    frame = light_canvas()
    draw = ImageDraw.Draw(frame)
    rounded_paste(frame, development, (120, 180, 1260, 930), 30)
    draw.rounded_rectangle((1320, 220, 1800, 515), radius=34, fill=LIGHT_INK)
    draw.text((1395, 270), "8 / 8", font=font(96, True), fill=WHITE)
    draw.text((1398, 390), "three-way agreement", font=font(28), fill=MUTED)
    draw.rounded_rectangle((1320, 555, 1800, 850), radius=34, fill=CORAL)
    draw.text((1395, 605), "9 / 9", font=font(96, True), fill=INK)
    draw.text((1398, 725), "clearance fixtures", font=font(28), fill=INK)
    label(draw, "S10", "Controlled Evidence", False)
    frames.append(("S10", "受控证据", frame))

    # S11 — controlled AI boundary.
    frame = fit_cover(sf03, (W, H)).convert("RGBA")
    draw = ImageDraw.Draw(frame)
    draw.rounded_rectangle((1030, 245, 1775, 850), radius=36, fill=rgba(SURFACE, 245), outline=rgba(LINE), width=2)
    draw.text((1110, 315), "CONTROLLED AI PACK", font=font(36, True), fill=WHITE)
    for idx, (alias, state) in enumerate((("C01", "CLASH"), ("C03", "WARNING"), ("C05", "CLEAR"), ("C08", "NOT EVALUATED"))):
        y = 405 + idx * 82
        draw.rounded_rectangle((1110, y, 1695, y + 58), radius=18, fill=rgba(INK))
        draw.text((1140, y + 11), alias, font=font(28, True), fill=CORAL)
        draw.text((1290, y + 11), state, font=font(26, True), fill=WHITE)
    draw.text((1112, 765), "Preview → fresh consent → one request", font=font(25), fill=MUTED)
    label(draw, "S11", "AI Stays Separate", True)
    frames.append(("S11", "AI保持独立", frame))

    # S12 — supported contract.
    frame = light_canvas()
    draw = ImageDraw.Draw(frame)
    label(draw, "S12", "Focused Feasibility Prototype", False)
    draw.text((110, 240), "IFC4 STEP", font=font(112, True), fill=LIGHT_INK)
    draw.text((110, 390), "metre units", font=font(76, True), fill=CORAL)
    draw.text((110, 505), "shared coordinates", font=font(76, True), fill=LIGHT_INK)
    draw.text((110, 620), "pipe × wall / beam", font=font(76, True), fill=LIGHT_INK)
    draw.line((112, 765, 1790, 765), fill=LINE, width=3)
    draw.text((110, 820), "Prototype — not engineering certification", font=font(40, True), fill=LIGHT_INK)
    frames.append(("S12", "支持边界", frame))

    # S13 — canonical resolve.
    frame = dark_canvas()
    draw = ImageDraw.Draw(frame)
    logo_img = fit_contain(logo, (520, 370), INK).convert("RGBA")
    frame.alpha_composite(logo_img, (700, 180))
    draw.text((960, 640), "Geometry.  Result.  Evidence.", anchor="mm", font=font(50, True), fill=MUTED)
    draw.text((960, 760), "Every relationship. Traceable.", anchor="mm", font=font(72, True), fill=WHITE)
    draw.rounded_rectangle((690, 865, 1230, 873), radius=4, fill=CORAL)
    label(draw, "S13", "Canonical Resolve", True)
    frames.append(("S13", "品牌收束", frame))

    return frames


def build_board(frames: list[tuple[str, str, Image.Image]]) -> Image.Image:
    board = Image.new("RGB", (3840, 2160), INK)
    draw = ImageDraw.Draw(board)
    cell_w, cell_h = 929, 519
    margin_x, margin_y, gap = 32, 32, 20
    thumb_w, thumb_h = 864, 486
    for idx, (shot, title, image) in enumerate(frames):
        col, row = idx % 4, idx // 4
        x = margin_x + col * (cell_w + gap)
        y = margin_y + row * cell_h
        thumb = image.convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        board.paste(thumb, (x, y))
        draw.rectangle((x, y + thumb_h - 48, x + thumb_w, y + thumb_h), fill=rgba(INK, 225)[:3])
        draw.text((x + 18, y + thumb_h - 41), f"{shot}  {title}", font=font_cjk(25), fill=WHITE)
    draw.rounded_rectangle((margin_x, 2106, 3808, 2150), radius=16, fill=rgba(CORAL, 235)[:3])
    draw.text(
        (margin_x + 22, 2113),
        "仅供 VG 构图预览 · 重复旧素材均为临时占位 · G7A 必须逐镜替换为对应的真实产品录屏/截图",
        font=font_cjk(22),
        fill=INK,
    )
    return board


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    frames = build_frames()
    for shot, title, image in frames:
        image.convert("RGB").save(OUT / f"KF{shot[1:]}-{title.replace(' ', '-').replace('：', '-')}.png", quality=95)
    board = build_board(frames)
    board.save(OUT / "VG-keyframe-table-4k.png", quality=95)
    print(f"VG_KEYFRAMES={len(frames)}")
    print(f"VG_KEYFRAME_BOARD={OUT / 'VG-keyframe-table-4k.png'}")


if __name__ == "__main__":
    main()
