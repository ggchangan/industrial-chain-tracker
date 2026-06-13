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

  chain.logicTracks = (source.logicTracks || []).map((track) => ({
    id: track.id,
    title: track.title,
    summary: track.summary,
    coreInsights: (track.coreInsights || []).map((insight) => ({
      ...insight,
      attachments: (insight.attachments || []).map((attachment) => ({
        ...attachment,
        target: attachment.target
          ? `${chain.id}:${attachment.target.type}:${attachment.target.index}`
          : ""
      })),
      sources: (insight.sources || []).map((sourceItem) => ({
        ...sourceItem,
        url: normalizeSourceUrl(sourceItem.url)
      }))
    })),
    propagation: normalizePropagation(chain.id, track.propagation)
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
    sourceKind: normalizeSourceKind(item.source),
    sourcePlatform: item.source.platform || "",
    ...(item.logicTrack ? { logicTrack: item.logicTrack } : {}),
    ...(item.propagation ? { propagation: normalizePropagation(chain.id, item.propagation) } : {}),
    notes: item.notes
  }));
}

library.meta.updated = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());

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
  if (url.startsWith("../research/")) {
    return url.replace("../research/", "./content/research/");
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

function normalizeSourceKind(source) {
  if (source?.type === "short-video") return "短视频";
  if (source?.type === "article") return "文章";
  if (source?.type === "announcement") return "公告";
  return "资料";
}

function normalizePropagation(chainId, propagation) {
  if (!propagation?.nodes?.length) return null;

  return {
    title: propagation.title,
    summary: propagation.summary,
    nodes: propagation.nodes.map((node) => ({
      label: node.label,
      description: node.description,
      state: node.state,
      target: node.target ? `${chainId}:${node.target.type}:${node.target.index}` : ""
    })),
    changeSignals: (propagation.changeSignals || []).map((signal) => ({
      label: signal.label,
      description: signal.description,
      metric: signal.metric,
      state: signal.state,
      target: signal.target ? `${chainId}:${signal.target.type}:${signal.target.index}` : ""
    })),
    verificationNotes: propagation.verificationNotes || []
  };
}
