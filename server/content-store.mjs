import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const STATE_FILE = "managed-content.json";

export async function createContentStore({ baseLibrary, dataDir }) {
  const resolvedDataDir = path.resolve(dataDir);
  await mkdir(resolvedDataDir, { recursive: true });

  let state = await readState(resolvedDataDir);
  let library = mergeLibrary(baseLibrary, state);

  async function createChain(input) {
    const article = normalizeArticleInput(input);
    const id = normalizeId(input.id || article.title);
    if (!id) throw validationError("请输入有效的英文产业链 ID");
    if (library.chains.some((chain) => chain.id === id)) {
      throw validationError(`产业链 ID 已存在：${id}`);
    }

    const generated = buildChain({ ...input, id, markdown: article.markdown, articleTitle: article.title });
    const articleRelativePath = path.join("raw", `${id}-industry-chain-original.md`);
    const diagramRelativePath = path.join("generated", `${id}-industry-chain-map.svg`);
    const coverRelativePath = path.join("generated", `${id}-industry-chain-cover.svg`);

    await Promise.all([
      writeManagedFile(resolvedDataDir, articleRelativePath, article.markdown),
      writeManagedFile(resolvedDataDir, diagramRelativePath, createDiagramSvg(generated)),
      writeManagedFile(resolvedDataDir, coverRelativePath, createCoverSvg(generated))
    ]);

    const chain = {
      ...generated,
      article: managedUrl(articleRelativePath),
      cover: managedUrl(coverRelativePath),
      diagram: managedUrl(diagramRelativePath),
      diagramSvg: managedUrl(diagramRelativePath),
      updateFile: "",
      watchlist: [],
      updates: []
    };

    state.managedChains.push(chain);
    await saveState(resolvedDataDir, state);
    library = mergeLibrary(baseLibrary, state);
    return structuredClone(library.chains.find((item) => item.id === id));
  }

  async function addUpdate(chainId, input) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");

    const update = normalizeUpdate(input);
    state.updatesByChain[chainId] ||= [];
    state.updatesByChain[chainId].unshift(update);
    await saveState(resolvedDataDir, state);
    library = mergeLibrary(baseLibrary, state);
    return structuredClone(update);
  }

  return {
    addUpdate,
    createChain,
    dataDir: resolvedDataDir,
    getLibrary: () => library
  };
}

function mergeLibrary(baseLibrary, state) {
  const library = structuredClone(baseLibrary);
  const managedChains = structuredClone(state.managedChains || []);
  library.chains.push(...managedChains);

  for (const chain of library.chains) {
    const managedUpdates = structuredClone(state.updatesByChain?.[chain.id] || []);
    if (managedUpdates.length) chain.updates = [...managedUpdates, ...(chain.updates || [])];
  }

  if (state.updatedAt) library.meta.updated = state.updatedAt.slice(0, 10);
  return library;
}

async function readState(dataDir) {
  try {
    const state = JSON.parse(await readFile(path.join(dataDir, STATE_FILE), "utf8"));
    return {
      managedChains: Array.isArray(state.managedChains) ? state.managedChains : [],
      updatesByChain: state.updatesByChain && typeof state.updatesByChain === "object" ? state.updatesByChain : {},
      updatedAt: state.updatedAt || ""
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { managedChains: [], updatesByChain: {}, updatedAt: "" };
  }
}

async function saveState(dataDir, state) {
  state.updatedAt = new Date().toISOString();
  const target = path.join(dataDir, STATE_FILE);
  const temporary = `${target}.tmp`;
  await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await rename(temporary, target);
}

async function writeManagedFile(dataDir, relativePath, contents) {
  const target = path.resolve(dataDir, relativePath);
  assertInside(dataDir, target);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents, "utf8");
}

function managedUrl(relativePath) {
  return `/managed/${relativePath.split(path.sep).join("/")}`;
}

function normalizeArticleInput(input) {
  const markdown = String(input.markdown || "").trim();
  if (markdown.length < 80) throw validationError("Markdown 原稿内容过短");
  if (Buffer.byteLength(markdown, "utf8") > 2 * 1024 * 1024) {
    throw validationError("Markdown 原稿不能超过 2MB");
  }

  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || String(input.title || "").trim();
  if (!title) throw validationError("Markdown 原稿缺少一级标题");
  return { markdown: `${markdown}\n`, title };
}

function buildChain(input) {
  const sections = extractSections(input.markdown);
  const chainSections = buildChainSections(sections);
  const title = String(input.title || input.articleTitle).trim();
  const shortTitle = String(input.shortTitle || title.replace(/产业链.*$/, "")).trim().slice(0, 24);
  const theme = String(input.theme || extractTheme(input.markdown)).trim().slice(0, 240);
  const logic = buildLogic(sections, theme);

  return {
    id: input.id,
    title,
    shortTitle: shortTitle || title,
    theme: theme || "新产业链原稿已上传，等待进一步完善产业逻辑。",
    status: "已建档",
    trackingProfile: {
      title: `${shortTitle || title}专属动态追踪`,
      summary: "从产业进展、订单验证、产能变化和关键公司动态四个方向持续更新。",
      metrics: [
        {
          name: "产业进展",
          why: "判断产业是否从概念验证进入订单和规模化阶段。",
          signals: ["政策与标准", "客户验证", "订单与交付", "产能与良率"]
        }
      ]
    },
    chain: chainSections,
    logic
  };
}

function extractSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const sections = [];
  let current = null;

  for (const line of lines) {
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      current = { level: heading[1].length, title: cleanMarkdown(heading[2]), body: [] };
      sections.push(current);
    } else if (current && line.trim()) {
      current.body.push(cleanMarkdown(line));
    }
  }
  return sections;
}

function buildChainSections(sections) {
  const groups = [
    { id: "upstream", label: "上游", matcher: /上游|材料|设备|基础设施/ },
    { id: "midstream", label: "中游", matcher: /中游|制造|加工|平台|系统|核心零部件/ },
    { id: "downstream", label: "下游", matcher: /下游|应用|终端|场景/ }
  ];

  return groups.map((group) => {
    const matches = sections.filter((section) => group.matcher.test(section.title));
    const source = matches.length ? matches : sections.filter((section) => section.level >= 3).slice(0, 3);
    const items = source.slice(0, 6).map((section) => ({
      name: section.title.replace(/^[(（]?[一二三四五六七八九十\d]+[)）.、\s-]*/, "").slice(0, 40) || "待完善环节",
      detail: section.body.join(" ").slice(0, 160) || "根据原稿自动建档，等待补充环节说明。",
      companies: extractCompanies(section.body.join(" ")) || "待补充"
    }));

    return {
      id: group.id,
      title: `${group.label}：${matches[0]?.title.replace(/^.*?[：:]/, "") || "待完善"}`,
      role: matches[0]?.body.join(" ").slice(0, 100) || "根据 Markdown 原稿自动生成的基础骨架。",
      items: items.length ? items : [{ name: "待完善环节", detail: "请根据原稿进一步补充。", companies: "待补充" }]
    };
  });
}

function buildLogic(sections, theme) {
  const candidates = sections.filter((section) => /驱动|逻辑|总结|催化|趋势|核心/.test(section.title));
  const source = candidates.length ? candidates : sections.filter((section) => section.level === 2);
  const logic = source.slice(0, 4).map((section) => ({
    title: section.title.slice(0, 40),
    body: section.body.join(" ").slice(0, 220) || theme
  }));
  return logic.length ? logic : [{ title: "核心逻辑", body: theme }];
}

function extractTheme(markdown) {
  const core = markdown.match(/>\s*\*\*核心驱动\*\*[：:]\s*(.+)/)?.[1];
  if (core) return cleanMarkdown(core);
  return cleanMarkdown(markdown.split(/\n\s*\n/).find((block) => !block.startsWith("#") && block.length > 30) || "");
}

function extractCompanies(text) {
  const matches = [...text.matchAll(/([\u4e00-\u9fa5A-Za-z]{2,16})[（(]\d{6}[）)]/g)].map((match) => match[1]);
  return [...new Set(matches)].slice(0, 12).join("、");
}

function normalizeUpdate(input) {
  const sourceUrl = String(input.sourceUrl || "").trim();
  if (!/^https?:\/\//i.test(sourceUrl)) throw validationError("来源链接必须以 http:// 或 https:// 开头");

  const update = {
    date: String(input.date || new Date().toISOString().slice(0, 10)).trim(),
    segment: required(input.segment, "请输入产业链环节"),
    signal: required(input.signal, "请输入动态摘要"),
    impact: required(input.impact, "请输入影响判断"),
    confidence: String(input.confidence || "待核验").trim(),
    sourceTitle: required(input.sourceTitle, "请输入来源标题"),
    sourceUrl,
    notes: String(input.notes || "通过维护台添加，后续持续跟踪。").trim()
  };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(update.date)) throw validationError("日期格式应为 YYYY-MM-DD");
  return update;
}

function required(value, message) {
  const normalized = String(value || "").trim();
  if (!normalized) throw validationError(message);
  return normalized;
}

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/产业链.*$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function cleanMarkdown(value) {
  return String(value || "")
    .replace(/[*_`>#|]/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function createDiagramSvg(chain) {
  const columns = chain.chain.map((section, index) => {
    const x = 60 + index * 380;
    const items = section.items.slice(0, 4).map((item, itemIndex) =>
      `<text x="${x + 24}" y="${190 + itemIndex * 54}" class="item">${escapeXml(item.name)}</text>`
    ).join("");
    return `<g>
      <rect x="${x}" y="88" width="320" height="330" rx="12" class="panel"/>
      <text x="${x + 24}" y="132" class="section">${escapeXml(section.title)}</text>
      ${items}
    </g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500" viewBox="0 0 1200 500">
  <style>
    .bg{fill:#0c1118}.panel{fill:#142130;stroke:#2b4052;stroke-width:2}
    .title{fill:#edf5f7;font:700 30px sans-serif}.section{fill:#27d9e8;font:700 20px sans-serif}
    .item{fill:#d7e5ea;font:16px sans-serif}
  </style>
  <rect width="1200" height="500" class="bg"/>
  <text x="60" y="52" class="title">${escapeXml(chain.title)}图谱</text>
  ${columns}
</svg>`;
}

function createCoverSvg(chain) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500" viewBox="0 0 900 500">
  <rect width="900" height="500" fill="#0c1118"/>
  <path d="M80 330H820M170 170V330M450 120V330M730 190V330" stroke="#27d9e8" stroke-width="5" opacity=".8"/>
  <circle cx="170" cy="170" r="18" fill="#35d39a"/><circle cx="450" cy="120" r="18" fill="#f5b942"/>
  <circle cx="730" cy="190" r="18" fill="#27d9e8"/>
  <text x="80" y="80" fill="#96aab5" font-family="sans-serif" font-size="24">产业链研究库</text>
  <text x="80" y="265" fill="#edf5f7" font-family="sans-serif" font-weight="700" font-size="48">${escapeXml(chain.shortTitle)}</text>
  <text x="80" y="410" fill="#96aab5" font-family="sans-serif" font-size="22">${escapeXml(chain.theme.slice(0, 42))}</text>
</svg>`;
}

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;"
  })[character]);
}

function assertInside(rootDir, targetPath) {
  const root = `${path.resolve(rootDir)}${path.sep}`;
  if (!targetPath.startsWith(root)) throw new Error("Managed path escapes data directory");
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = "validation_error";
  return error;
}

function notFoundError(message) {
  const error = new Error(message);
  error.statusCode = 404;
  error.code = "not_found";
  return error;
}
