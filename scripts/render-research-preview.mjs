import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderMarkdown } from "../server/markdown.mjs";

const inputArg = process.argv[2];
if (!inputArg) {
  throw new Error("Usage: node scripts/render-research-preview.mjs <article.md>");
}

const inputPath = path.resolve(inputArg);
const outputPath = inputPath.replace(/\.md$/i, "-preview.html");
const markdown = await readFile(inputPath, "utf8");
const rendered = renderMarkdown(markdown);
const markdownTitle = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
const title = rendered.meta.title || markdownTitle || path.basename(inputPath, path.extname(inputPath));
const articleHtml = rendered.html
  .replace(/^<h1[^>]*>.*?<\/h1>\s*/s, "")
  .replaceAll('loading="lazy"', 'loading="eager"');

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #1f2937;
      --muted: #667085;
      --line: #e5e7eb;
      --blue: #0f4c81;
      --soft: #f5f8fb;
    }
    * { box-sizing: border-box; }
    body {
      background: #eef2f5;
      color: var(--ink);
      font-family: "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
      letter-spacing: 0;
      line-height: 1.85;
      margin: 0;
    }
    main {
      background: #fff;
      margin: 0 auto;
      max-width: 760px;
      min-height: 100vh;
      padding: 42px 38px 72px;
    }
    h1 { font-size: 30px; line-height: 1.35; margin: 0 0 24px; }
    h2 {
      border-left: 5px solid var(--blue);
      font-size: 23px;
      line-height: 1.45;
      margin: 46px 0 20px;
      padding-left: 13px;
    }
    h3 { color: var(--blue); font-size: 19px; margin: 30px 0 12px; }
    p, li { font-size: 16px; }
    p { margin: 0 0 18px; }
    strong { color: #111827; }
    code {
      background: #f1f5f9;
      border-radius: 3px;
      color: #0f4c81;
      padding: 2px 5px;
    }
    blockquote {
      background: var(--soft);
      border-left: 4px solid var(--blue);
      color: #344054;
      margin: 24px 0;
      padding: 15px 18px;
    }
    blockquote.disclaimer {
      border-left-color: #98a2b3;
      color: var(--muted);
      font-size: 14px;
    }
    img {
      background: #0f172a;
      display: block;
      height: auto;
      margin: 28px auto 32px;
      max-width: 100%;
    }
    table {
      border-collapse: collapse;
      font-size: 14px;
      margin: 22px 0 28px;
      width: 100%;
    }
    th, td {
      border: 1px solid var(--line);
      padding: 9px 10px;
      text-align: left;
      vertical-align: top;
    }
    th { background: var(--soft); color: #344054; }
    hr { border: 0; border-top: 1px solid var(--line); margin: 38px 0; }
    @media (max-width: 640px) {
      main { padding: 28px 20px 56px; }
      h1 { font-size: 26px; }
      h2 { font-size: 21px; }
      table { display: block; overflow-x: auto; white-space: nowrap; }
    }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    ${articleHtml}
  </main>
</body>
</html>
`;

await writeFile(outputPath, html, "utf8");
console.log(fileURLToPath(new URL(`file://${outputPath}`)));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
