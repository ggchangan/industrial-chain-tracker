import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

export async function loadLibrary(rootDir) {
  const source = await readFile(path.join(rootDir, "assets", "data.js"), "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);

  const library = sandbox.window.INDUSTRY_CHAIN_LIBRARY;
  if (!library?.chains?.length) {
    throw new Error("assets/data.js does not expose a valid industry chain library");
  }

  return structuredClone(library);
}

export async function loadArticle(rootDir, chain, dataDir = "") {
  const relativePath = String(chain.article || "").replace(/^\.\//, "");
  if (relativePath.startsWith("/managed/") || String(chain.article || "").startsWith("/managed/")) {
    const managedRelativePath = String(chain.article).replace(/^\/managed\//, "");
    const articlePath = path.resolve(dataDir, managedRelativePath);
    assertInsideRoot(dataDir, articlePath);
    return readFile(articlePath, "utf8");
  }
  const articlePath = path.resolve(rootDir, relativePath);
  assertInsideRoot(rootDir, articlePath);
  return readFile(articlePath, "utf8");
}

export function searchLibrary(library, query, limit = 30) {
  const normalized = normalize(query);
  if (!normalized) return [];

  const results = [];
  for (const chain of library.chains) {
    addResult(results, normalized, chain, "产业链", chain.title, [chain.shortTitle, chain.theme, chain.status]);

    chain.chain.forEach((section) => {
      addResult(results, normalized, chain, "骨架", section.title || section.name, [
        section.role,
        (section.items || section.segments || []).flatMap((item) => [
          item.name,
          item.detail,
          item.logic,
          item.companies
        ])
      ]);
    });

    chain.logic.forEach((item) => {
      addResult(results, normalized, chain, "逻辑", item.title, item.body);
    });

    (chain.trackingProfile?.metrics || []).forEach((item) => {
      addResult(results, normalized, chain, "追踪", item.name, [item.why, item.signals]);
    });

    chain.watchlist.forEach((item) => {
      addResult(results, normalized, chain, "观察", item.segment, [item.signals, item.companies]);
    });

    chain.updates.forEach((item) => {
      addResult(results, normalized, chain, "动态", item.signal, [
        item.date,
        item.segment,
        item.impact,
        item.confidence,
        item.notes
      ]);
    });
  }

  return results
    .sort((a, b) => b.score - a.score || a.chainTitle.localeCompare(b.chainTitle, "zh-CN"))
    .slice(0, Math.min(Math.max(limit, 1), 100))
    .map(({ score, ...result }) => result);
}

function addResult(results, query, chain, type, title, values) {
  const body = flattenText(values);
  const haystack = normalize(`${chain.title} ${title} ${body}`);
  if (!haystack.includes(query)) return;

  let score = 1;
  if (normalize(title).includes(query)) score += 4;
  if (normalize(chain.title).includes(query)) score += 2;
  if (normalize(title) === query) score += 4;

  results.push({
    score,
    chainId: chain.id,
    chainTitle: chain.title,
    type,
    title,
    excerpt: createExcerpt(body || chain.theme, query)
  });
}

function createExcerpt(value, query) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  const index = normalize(text).indexOf(query);
  if (index < 0) return text.slice(0, 180);
  const start = Math.max(index - 45, 0);
  const end = Math.min(index + query.length + 105, text.length);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

function flattenText(value) {
  return [value].flat(Infinity).filter(Boolean).join(" ");
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function assertInsideRoot(rootDir, targetPath) {
  const root = path.resolve(rootDir) + path.sep;
  if (!targetPath.startsWith(root)) {
    throw new Error("Requested path is outside the project root");
  }
}
