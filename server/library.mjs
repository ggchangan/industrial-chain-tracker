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

  const cloned = structuredClone(library);
  cloned.companySecurities = await loadCompanySecurities(rootDir);
  return cloned;
}

async function loadCompanySecurities(rootDir) {
  try {
    const source = await readFile(path.join(rootDir, "content", "company-securities.json"), "utf8");
    const parsed = JSON.parse(source);
    return Object.fromEntries(
      Object.entries(parsed.securities || {})
        .filter(([, value]) => value?.ticker && value?.exchange)
        .map(([name, value]) => [name, {
          ticker: String(value.ticker).trim(),
          exchange: String(value.exchange).trim(),
          market: String(value.market || "").trim() || "CN"
        }])
    );
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
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
        item.type,
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

export function buildMobileChainSummary(chain, library = {}) {
  const sources = sortByRecent(chain.sources || []);
  const updates = sortByRecent(chain.updates || []);
  const logicTracks = chain.logicTracks || [];
  const recentInsights = logicTracks
    .flatMap((track) => (track.coreInsights || []).map((insight) => ({
      id: insight.id,
      title: insight.title,
      summary: insight.summary,
      kicker: insight.kicker,
      trackId: track.id,
      trackTitle: track.title,
      researchDate: track.researchDate || track.date || ""
    })))
    .filter((item) => item.title || item.summary);
  const companies = collectChainCompanies(chain);
  const mappedCompanies = companies.filter((name) => library.companySecurities?.[name]);
  const latestSource = sources[0];
  const latestUpdate = updates[0];
  const latestInsight = recentInsights[0];
  const trackingMetrics = chain.trackingProfile?.metrics || [];

  const highlights = [
    latestSource && {
      type: "research",
      label: "最新研究",
      title: latestSource.title,
      body: latestSource.summary || `${latestSource.platform || "资料"} · ${latestSource.date || ""}`,
      date: latestSource.date || latestSource.createdAt || "",
      target: "research"
    },
    latestInsight && {
      type: "logic",
      label: "近期逻辑",
      title: latestInsight.title,
      body: latestInsight.summary,
      date: latestInsight.researchDate,
      target: "logic"
    },
    latestUpdate && {
      type: "update",
      label: "最新变化",
      title: latestUpdate.signal,
      body: latestUpdate.impact,
      date: latestUpdate.date,
      target: "tracking"
    }
  ].filter(Boolean);

  const sections = [
    {
      id: "focus",
      title: "当前重点",
      summary: chain.theme,
      count: highlights.length
    },
    {
      id: "research",
      title: "最新研究",
      summary: latestSource?.summary || "查看已归档研究资料和提炼结果。",
      count: sources.length
    },
    {
      id: "logic",
      title: "核心逻辑",
      summary: latestInsight?.summary || chain.logic?.[0]?.body || "先理解产业链最关键的判断。",
      count: (chain.logic?.length || 0) + recentInsights.length
    },
    {
      id: "structure",
      title: "产业结构",
      summary: (chain.chain || []).map((item) => item.title || item.name).filter(Boolean).slice(0, 4).join(" / "),
      count: chain.chain?.length || 0
    },
    {
      id: "tracking",
      title: "跟踪验证",
      summary: chain.trackingProfile?.summary || "持续观察逻辑是否强化、减弱或出现反证。",
      count: trackingMetrics.length
    },
    {
      id: "stocks",
      title: "个股集中营",
      summary: mappedCompanies.length
        ? `${mappedCompanies.length}/${companies.length} 家公司已有行情入口`
        : `${companies.length} 家产业链相关公司`,
      count: companies.length
    },
    {
      id: "article",
      title: "原文阅读",
      summary: "完整研究原文作为二级深度阅读入口。",
      count: 1
    }
  ];

  return {
    version: "0.1",
    headline: chain.theme,
    sections,
    highlights,
    latestResearch: sources.slice(0, 3).map((source) => ({
      id: source.id,
      title: source.title,
      summary: source.summary,
      date: source.date || source.createdAt || "",
      type: source.type,
      platform: source.platform,
      companies: (source.companies || []).slice(0, 5)
    })),
    coreLogic: [
      ...(chain.logic || []).slice(0, 3).map((item, index) => ({
        id: `base-${index + 1}`,
        title: item.title,
        summary: item.body,
        kind: "base"
      })),
      ...recentInsights.slice(0, 3).map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        kind: "research",
        kicker: item.kicker,
        trackTitle: item.trackTitle,
        researchDate: item.researchDate
      }))
    ],
    tracking: {
      title: chain.trackingProfile?.title || "跟踪验证",
      summary: chain.trackingProfile?.summary || "",
      metrics: trackingMetrics.slice(0, 5).map((metric) => ({
        name: metric.name,
        why: metric.why,
        signals: (metric.signals || []).slice(0, 5),
        status: metric.currentStatus || metric.executionStatus || ""
      }))
    },
    stocks: {
      total: companies.length,
      mapped: mappedCompanies.length,
      examples: companies.slice(0, 10).map((name) => ({
        name,
        mapped: Boolean(library.companySecurities?.[name]),
        security: library.companySecurities?.[name] || null
      }))
    },
    article: {
      entryLabel: "阅读完整原文",
      resource: chain.article,
      cover: chain.cover,
      diagram: chain.diagram
    }
  };
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

function sortByRecent(items) {
  return [...items].sort((left, right) =>
    String(right.date || right.createdAt || "").localeCompare(String(left.date || left.createdAt || ""))
  );
}

function collectChainCompanies(chain) {
  const names = new Set();
  const add = (value) => splitCompanies(value).forEach((name) => names.add(name));

  for (const section of chain.chain || []) {
    for (const item of section.items || section.segments || []) {
      add(item.companies);
    }
  }
  for (const item of chain.watchlist || []) add(item.companies);
  for (const source of chain.sources || []) add(source.companies);
  for (const track of chain.logicTracks || []) {
    for (const insight of track.coreInsights || []) {
      for (const company of insight.companies || []) add(company.name || company);
      for (const row of insight.comparison || []) add(row.company || row.name);
    }
  }

  return [...names]
    .map(normalizeCompanyName)
    .filter(Boolean)
    .filter((name) => !/^(meta|oracle|google|微软|谷歌|英伟达|spectrum-x|vera rubin)$/i.test(name))
    .slice(0, 80);
}

function splitCompanies(value) {
  if (Array.isArray(value)) return value.flatMap(splitCompanies);
  return String(value || "")
    .split(/[、，,;/；\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeCompanyName(value) {
  return String(value || "")
    .replace(/[（）()].*?[）)]/g, "")
    .replace(/^(A股|港股|美股|公司|龙头|重点)[:：]/, "")
    .trim();
}

function assertInsideRoot(rootDir, targetPath) {
  const root = path.resolve(rootDir) + path.sep;
  if (!targetPath.startsWith(root)) {
    throw new Error("Requested path is outside the project root");
  }
}
