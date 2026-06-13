export function renderMarkdown(markdown) {
  const parsed = parseFrontmatter(markdown);
  const lines = parsed.body.split(/\r?\n/);
  const html = [];
  const toc = [];
  let index = 0;
  let headingIndex = 0;
  let currentKind = "";

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^\s*---+\s*$/.test(line)) {
      html.push("<hr>");
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = slugifyHeading(text, headingIndex);
      currentKind = articleBlockKind(text) || currentKind;
      html.push(`<h${level} id="${id}" class="${currentKind}">${renderInline(text)}</h${level}>`);
      if (level <= 3) toc.push({ id, level, text });
      headingIndex += 1;
      index += 1;
      continue;
    }

    if (line.trim().startsWith(">")) {
      const quote = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      const text = quote.join(" ");
      html.push(`<blockquote class="${articleBlockKind(text)}">${renderInline(text)}</blockquote>`);
      continue;
    }

    if (index + 1 < lines.length && line.includes("|") && isTableDivider(lines[index + 1])) {
      const headers = splitTableRow(line);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      html.push(
        `<table><thead><tr>${headers.map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead>` +
        `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`
      );
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ""));
        index += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
        index += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    const paragraph = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,4})\s+/.test(lines[index]) &&
      !/^\s*---+\s*$/.test(lines[index]) &&
      !lines[index].trim().startsWith(">") &&
      !(index + 1 < lines.length && lines[index].includes("|") && isTableDivider(lines[index + 1])) &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    const text = paragraph.join(" ");
    html.push(`<p class="${articleBlockKind(text)}">${renderInline(text)}</p>`);
  }

  return { html: html.join("\n"), meta: parsed.meta, toc };
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta = {};
  if (!match) return { body: source, meta };

  let listKey = "";
  match[1].split(/\r?\n/).forEach((line) => {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && listKey) {
      meta[listKey].push(listItem[1].trim());
      return;
    }
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) return;
    const value = pair[2].trim().replace(/^["']|["']$/g, "");
    if (value) {
      meta[pair[1]] = value;
      listKey = "";
    } else {
      meta[pair[1]] = [];
      listKey = pair[1];
    }
  });
  return { body: source.slice(match[0].length), meta };
}

function renderInline(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => `<img src="${safeHref(src)}" alt="${alt}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => `<a href="${safeHref(href)}">${text}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function splitTableRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function isTableDivider(line) {
  return splitTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function articleBlockKind(text) {
  if (/免责声明|股市有风险|不构成投资建议/.test(text)) return "disclaimer";
  if (/风险提示|核心风险|估值回调风险|供给释放风险|技术路线风险/.test(text)) return "risk";
  if (/阅读提示|核心驱动|核心逻辑/.test(text)) return "insight";
  if (/附录|速查表|财务数据/.test(text)) return "appendix";
  return "";
}

function slugifyHeading(text, index) {
  return `article-${index}-${String(text).toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "")}`;
}

function safeHref(value) {
  const href = String(value).trim();
  return /^(https?:|\.\/|\/|#)/i.test(href) ? escapeHtml(href) : "#";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
