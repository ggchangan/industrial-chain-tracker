import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const dataPath = new URL("../assets/data.js", import.meta.url);
const blogIndexPath = new URL("../index.html", import.meta.url);
const dataSource = await readFile(dataPath, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSource, sandbox);

const library = sandbox.window.INDUSTRY_CHAIN_LIBRARY;
if (!library?.chains?.length) {
  throw new Error("assets/data.js does not expose window.INDUSTRY_CHAIN_LIBRARY");
}

for (const chain of library.chains) {
  if (!chain.updateFile) continue;

  const sourcePath = new URL(chain.updateFile, blogIndexPath);
  const source = JSON.parse(await readFile(sourcePath, "utf8"));

  chain.watchlist = source.watchlist.map((item) => ({
    segment: item.segment,
    signals: item.whatToTrack,
    companies: item.companies.join("、")
  }));

  chain.updates = source.updates.map((item) => ({
    date: item.date,
    type: normalizeUpdateType(item),
    segment: item.segment,
    signal: item.signal,
    impact: item.impact,
    confidence: item.confidence,
    sourceTitle: item.source.title,
    sourceUrl: normalizeSourceUrl(item.source.url),
    notes: item.notes
  }));
}

library.meta.updated = new Date().toISOString().slice(0, 10);

await writeFile(
  dataPath,
  `window.INDUSTRY_CHAIN_LIBRARY = ${JSON.stringify(library, null, 2)};\n`,
  "utf8"
);

console.log("Synced " + library.chains.length + " chains to assets/data.js");

function normalizeSourceUrl(url) {
  if (url.startsWith("../raw/")) {
    return url.replace("../raw/", "./content/raw/");
  }
  if (url.startsWith("../content/")) {
    return url.replace("../content/", "./content/");
  }
  return url;
}

function normalizeUpdateType(item) {
  const allowed = new Set(["产业事件", "机构逻辑", "公司公告", "数据变化"]);
  if (allowed.has(item.type)) return item.type;
  if (item.source?.type === "short-video" || /机构|研报|调研|观点|解读/.test(item.source?.title || "")) {
    return "机构逻辑";
  }
  if (item.source?.type === "announcement" || /公告|年报|季报|业绩说明会/.test(item.source?.title || "")) {
    return "公司公告";
  }
  if (item.source?.type === "internal" || item.confidence === "基准框架") return "数据变化";
  return "产业事件";
}
