export function buildArticleBlocks(html, toc = []) {
  const source = String(html || "");
  const headings = [...source.matchAll(/<h([1-3])\b[^>]*\bid="([^"]+)"[^>]*>[\s\S]*?<\/h\1>/gi)];
  if (!headings.length) {
    return source ? [{ anchorId: "article-block-0", headingId: "", html: source, level: 0, title: "原文" }] : [];
  }

  const tocById = new Map(toc.map((item) => [item.id, item]));
  const blocks = [];
  if (headings[0].index > 0) {
    blocks.push({
      anchorId: "article-block-0",
      headingId: "",
      html: source.slice(0, headings[0].index),
      level: 0,
      title: "导读"
    });
  }

  headings.forEach((match, index) => {
    const start = match.index;
    const end = headings[index + 1]?.index ?? source.length;
    const headingId = match[2];
    const tocItem = tocById.get(headingId);
    blocks.push({
      anchorId: `article-block-${blocks.length}`,
      headingId,
      html: source.slice(start, end),
      level: Number(match[1]),
      title: tocItem?.text || stripHtml(match[0])
    });
  });

  return blocks;
}

export function buildReaderToc(blocks) {
  return blocks
    .map((block, blockIndex) => ({ ...block, blockIndex }))
    .filter((block) => block.headingId && block.level <= 3)
    .map(({ anchorId, blockIndex, headingId, level, title }) => ({
      anchorId,
      blockIndex,
      headingId,
      level,
      title
    }));
}

export function findArticleTarget(blocks, query, targetTitle = "") {
  const normalizedTarget = normalize(targetTitle);
  const normalizedQuery = normalize(query);
  if (normalizedTarget) {
    const titleMatch = blocks.findIndex((block) => normalize(block.title).includes(normalizedTarget));
    if (titleMatch >= 0) return titleMatch;
  }
  const queryHeading = bestHeadingMatch(blocks, normalizedQuery);
  if (queryHeading >= 0) return queryHeading;
  if (!normalizedQuery) return -1;
  const bodyMatch = blocks.findIndex((block) => normalize(stripHtml(block.html)).includes(normalizedQuery));
  if (bodyMatch >= 0) return bodyMatch;
  return bestHeadingMatch(blocks, normalizedTarget);
}

export function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function searchTokens(value) {
  const source = normalize(value);
  const tokens = source.match(/[a-z0-9]+|[\u4e00-\u9fa5]+/g) || [];
  return [...new Set(tokens.flatMap((token) => {
    if (!/^[\u4e00-\u9fa5]+$/.test(token) || token.length <= 2) return [token];
    return Array.from({ length: token.length - 1 }, (_, index) => token.slice(index, index + 2));
  }))].filter((token) => token.length >= 2);
}

function bestHeadingMatch(blocks, value) {
  if (!value) return -1;
  const tokens = searchTokens(value);
  let bestIndex = -1;
  let bestScore = 0;
  blocks.forEach((block, index) => {
    const heading = normalize(block.title);
    const score = tokens.filter((token) => heading.includes(token)).length;
    if (score > bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  });
  return bestScore >= Math.min(2, tokens.length) ? bestIndex : -1;
}
