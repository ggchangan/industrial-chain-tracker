import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceIcon = path.join(root, "assets", "brand", "mini-program-avatar-v2-512.png");
const outDir = path.join(root, "apps", "mobile", "src", "static", "brand");
const docsDir = path.join(root, "docs", "app-assets");

const iconTargets = [
  ["app-icon-1024.png", 1024, 1024],
  ["app-icon-512.png", 512, 512],
  ["android-icon-432.png", 432, 432],
  ["android-icon-216.png", 216, 216],
  ["android-icon-108.png", 108, 108]
];

const launchTargets = [
  ["launch-1242x2688.png", 1242, 2688],
  ["launch-1170x2532.png", 1170, 2532],
  ["launch-1080x2400.png", 1080, 2400]
];

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(docsDir, { recursive: true });

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed:\n${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function convert(input, output, args) {
  run("sips", [input, ...args, "--out", output]);
}

function makeIcon([filename, width, height]) {
  const output = path.join(outDir, filename);
  convert(sourceIcon, output, ["-z", String(height), String(width)]);
  return output;
}

function makeLaunch([filename, width, height]) {
  const output = path.join(outDir, filename);
  const python = `
from PIL import Image, ImageDraw, ImageFont
import math

width, height = ${width}, ${height}
out = ${JSON.stringify(output)}
img = Image.new("RGB", (width, height), "#08111f")
draw = ImageDraw.Draw(img)

for y in range(height):
    t = y / max(height - 1, 1)
    r = int(8 + 6 * t)
    g = int(17 + 35 * t)
    b = int(31 + 37 * t)
    draw.line([(0, y), (width, y)], fill=(r, g, b))

cx, cy = width / 2, height * 0.34
max_radius = width * 0.58
for radius in range(int(max_radius), 0, -8):
    alpha = radius / max_radius
    color = (int(34 * (1 - alpha) + 8 * alpha), int(211 * (1 - alpha) + 17 * alpha), int(238 * (1 - alpha) + 31 * alpha))
    box = [cx - radius, cy - radius, cx + radius, cy + radius]
    draw.ellipse(box, outline=color)

for index in range(11):
    y = int(height * (0.18 + index * 0.065))
    points = []
    for step in range(80):
        x = width * (0.12 + step / 79 * 0.76)
        wave = math.sin(step / 79 * math.pi * 2 + index * 0.7) * 42
        points.append((x, y + wave))
    draw.line(points, fill="#164e63", width=2)

card = 256
x0 = int(width / 2 - card / 2)
y0 = int(height * 0.36 - card / 2)
draw.rounded_rectangle([x0, y0, x0 + card, y0 + card], radius=56, fill="#07111d", outline="#22d3ee", width=4)
nodes = [(x0 + 82, y0 + 92, 24, "#22d3ee"), (x0 + 174, y0 + 86, 18, "#a78bfa"), (x0 + 142, y0 + 172, 26, "#34d399")]
for x, y, r, color in nodes:
    draw.ellipse([x-r, y-r, x+r, y+r], fill=color)
draw.line([(x0+104, y0+104), (x0+158, y0+94)], fill="#e0f2fe", width=10)
draw.line([(x0+93, y0+115), (x0+131, y0+157)], fill="#e0f2fe", width=10)
draw.line([(x0+160, y0+105), (x0+145, y0+151)], fill="#e0f2fe", width=10)

font_paths = [
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/STHeiti Light.ttc",
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
]
def font(size):
    for path in font_paths:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()

title_font = font(int(width * 0.075))
subtitle_font = font(int(width * 0.032))
def center(text, y, fill, f):
    bbox = draw.textbbox((0, 0), text, font=f)
    draw.text(((width - (bbox[2]-bbox[0])) / 2, y), text, fill=fill, font=f)

center("产业链研究库", int(height * 0.52), "#f8fafc", title_font)
center("用图谱理解产业链 · 用研究跟踪变化", int(height * 0.56), "#94a3b8", subtitle_font)
img.save(out)
`;
  run("/Users/renzhang/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3", ["-c", python]);
  return output;
}

const outputs = [
  ...iconTargets.map(makeIcon),
  ...launchTargets.map(makeLaunch)
];

console.log("Generated mobile assets:");
for (const output of outputs) {
  console.log(`- ${path.relative(root, output)}`);
}
