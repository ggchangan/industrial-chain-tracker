import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const STATE_FILE = "managed-content.json";

export async function createContentStore({ baseLibrary, dataDir, rootDir }) {
  const resolvedDataDir = path.resolve(dataDir);
  const resolvedRootDir = path.resolve(rootDir);
  await mkdir(resolvedDataDir, { recursive: true });

  let state = await readState(resolvedDataDir);
  if (migrateDeprecatedChains(baseLibrary, state)) {
    await saveState(resolvedDataDir, state);
  }
  let library = mergeLibrary(baseLibrary, state);

  async function createChain(input) {
    const article = normalizeArticleInput(input);
    const id = normalizeId(input.id || article.title);
    if (!id) throw validationError("请输入有效的英文产业链 ID");
    if (library.chains.some((chain) => chain.id === id)) {
      throw validationError(`产业链 ID 已存在：${id}`);
    }

    const generated = normalizeChainDraft(input.structure || buildChainDraft({
      ...input,
      id,
      markdown: article.markdown,
      articleTitle: article.title
    }), { ...input, id, articleTitle: article.title });
    const cover = normalizeAsset(input.cover, "封面");
    const diagram = normalizeAsset(input.diagram, "产业链图谱");
    const articleRelativePath = path.join("raw", `${id}-industry-chain-original.md`);
    const diagramRelativePath = path.join("uploads", `${id}-industry-chain-map${diagram.extension}`);
    const coverRelativePath = path.join("uploads", `${id}-industry-chain-cover${cover.extension}`);

    await Promise.all([
      writeManagedFile(resolvedDataDir, articleRelativePath, article.markdown),
      writeManagedBinary(resolvedDataDir, diagramRelativePath, diagram.contents),
      writeManagedBinary(resolvedDataDir, coverRelativePath, cover.contents)
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

  async function getEditableChain(chainId) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");
    const markdown = await readChainArticle(resolvedRootDir, resolvedDataDir, chain.article);
    return { chain: structuredClone(chain), markdown };
  }

  async function updateArticle(chainId, input) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");
    const article = normalizeArticleInput(input);
    const articleRelativePath = path.join("raw", `${chainId}-industry-chain-original.md`);
    const articleUrl = managedUrl(articleRelativePath);
    await writeManagedFile(resolvedDataDir, articleRelativePath, article.markdown);

    const managedIndex = state.managedChains.findIndex((item) => item.id === chainId);
    if (managedIndex >= 0) {
      state.managedChains[managedIndex].article = articleUrl;
    } else {
      state.articleOverrides[chainId] = articleUrl;
    }
    await saveState(resolvedDataDir, state);
    library = mergeLibrary(baseLibrary, state);
    return structuredClone(library.chains.find((item) => item.id === chainId));
  }

  async function deleteManagedChain(chainId) {
    const index = state.managedChains.findIndex((item) => item.id === chainId);
    if (index < 0) throw notFoundError("该产业链不是通过后台创建的，无法删除");
    const [chain] = state.managedChains.splice(index, 1);
    delete state.updatesByChain[chainId];
    await Promise.all([
      removeManagedFile(resolvedDataDir, chain.article),
      removeManagedFile(resolvedDataDir, chain.cover),
      removeManagedFile(resolvedDataDir, chain.diagram)
    ]);
    await saveState(resolvedDataDir, state);
    library = mergeLibrary(baseLibrary, state);
  }

  return {
    addUpdate,
    createChain,
    deleteManagedChain,
    previewChain: (input) => buildChainDraft({
      ...input,
      id: normalizeId(input.id || "new-chain"),
      markdown: normalizeArticleInput(input).markdown,
      articleTitle: normalizeArticleInput(input).title
    }),
    getEditableChain,
    isManagedChain: (chainId) => state.managedChains.some((chain) => chain.id === chainId),
    updateArticle,
    dataDir: resolvedDataDir,
    getLibrary: () => library
  };
}

async function readChainArticle(rootDir, dataDir, articleUrl) {
  if (String(articleUrl || "").startsWith("/managed/")) {
    const relativePath = String(articleUrl).replace(/^\/managed\//, "");
    const target = path.resolve(dataDir, relativePath);
    assertInside(dataDir, target);
    return readFile(target, "utf8");
  }
  const relativePath = String(articleUrl || "").replace(/^\.\//, "");
  const target = path.resolve(rootDir, relativePath);
  assertInside(rootDir, target);
  return readFile(target, "utf8");
}

async function removeManagedFile(dataDir, fileUrl) {
  if (!String(fileUrl || "").startsWith("/managed/")) return;
  const relativePath = fileUrl.replace(/^\/managed\//, "");
  const target = path.resolve(dataDir, relativePath);
  assertInside(dataDir, target);
  await rm(target, { force: true });
}

function mergeLibrary(baseLibrary, state) {
  const library = structuredClone(baseLibrary);
  for (const chain of library.chains) {
    if (state.articleOverrides?.[chain.id]) {
      chain.article = state.articleOverrides[chain.id];
    }
  }
  const managedChains = structuredClone(state.managedChains || []);
  library.chains.push(...managedChains);

  for (const chain of library.chains) {
    const managedUpdates = structuredClone(state.updatesByChain?.[chain.id] || []);
    if (managedUpdates.length) chain.updates = [...managedUpdates, ...(chain.updates || [])];
  }

  if (state.updatedAt) library.meta.updated = formatChinaDate(state.updatedAt);
  return library;
}

function formatChinaDate(value) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

function migrateDeprecatedChains(baseLibrary, state) {
  if (!baseLibrary.chains.some((chain) => chain.id === "semiconductor-material")) return false;
  const previousLength = state.managedChains.length;
  state.managedChains = state.managedChains.filter((chain) => chain.id !== "semiconductor-material-industry-chain");
  const hadUpdates = Boolean(state.updatesByChain["semiconductor-material-industry-chain"]);
  const hadOverride = Boolean(state.articleOverrides["semiconductor-material-industry-chain"]);
  delete state.updatesByChain["semiconductor-material-industry-chain"];
  delete state.articleOverrides["semiconductor-material-industry-chain"];
  return previousLength !== state.managedChains.length || hadUpdates || hadOverride;
}

async function readState(dataDir) {
  try {
    const state = JSON.parse(await readFile(path.join(dataDir, STATE_FILE), "utf8"));
    return {
      managedChains: Array.isArray(state.managedChains) ? state.managedChains : [],
      articleOverrides: state.articleOverrides && typeof state.articleOverrides === "object" ? state.articleOverrides : {},
      updatesByChain: state.updatesByChain && typeof state.updatesByChain === "object" ? state.updatesByChain : {},
      updatedAt: state.updatedAt || ""
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { managedChains: [], articleOverrides: {}, updatesByChain: {}, updatedAt: "" };
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

async function writeManagedBinary(dataDir, relativePath, contents) {
  const target = path.resolve(dataDir, relativePath);
  assertInside(dataDir, target);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents);
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

function buildChainDraft(input) {
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

function normalizeChainDraft(draft, input) {
  const title = required(draft.title || input.title || input.articleTitle, "请输入页面标题");
  const shortTitle = required(draft.shortTitle || input.shortTitle, "请输入短标题");
  const theme = required(draft.theme || input.theme, "请输入一句话主题");
  if (!Array.isArray(draft.chain) || !draft.chain.length) throw validationError("产业链骨架不能为空");
  if (!Array.isArray(draft.logic) || !draft.logic.length) throw validationError("核心逻辑不能为空");

  return {
    id: input.id,
    title,
    shortTitle,
    theme,
    status: "已建档",
    trackingProfile: draft.trackingProfile || {
      title: `${shortTitle}专属动态追踪`,
      summary: "围绕产业进展、订单验证、产能变化和关键公司动态持续更新。",
      metrics: [{
        name: "产业进展",
        why: "判断产业是否从概念验证进入订单和规模化阶段。",
        signals: ["政策与标准", "客户验证", "订单与交付", "产能与良率"]
      }]
    },
    chain: draft.chain.map((section, index) => ({
      id: normalizeId(section.id || `section-${index + 1}`) || `section-${index + 1}`,
      title: required(section.title || section.name, "骨架章节标题不能为空"),
      role: required(section.role, "骨架章节说明不能为空"),
      items: (section.items || section.segments || []).map((item) => ({
        name: required(item.name, "骨架环节名称不能为空"),
        detail: required(item.detail || item.logic, "骨架环节说明不能为空"),
        companies: required(item.companies || "待补充", "骨架公司不能为空")
      }))
    })),
    logic: draft.logic.map((item) => ({
      title: required(item.title, "核心逻辑标题不能为空"),
      body: required(item.body, "核心逻辑内容不能为空")
    }))
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
  const topLevel = sections.filter((section) =>
    section.level === 2 && !/概览|总结|风险|附录|市场热点|为什么|能力/.test(section.title)
  );
  const candidates = topLevel.slice(0, 5);

  return candidates.map((section, index) => {
    const start = sections.indexOf(section);
    const endOffset = sections.slice(start + 1).findIndex((item) => item.level === 2);
    const end = endOffset < 0 ? sections.length : start + 1 + endOffset;
    const children = sections.slice(start + 1, end).filter((item) => item.level === 3);
    const items = children.slice(0, 8).map((child) => ({
      name: cleanHeading(child.title).slice(0, 42),
      detail: child.body.join(" ").slice(0, 180) || "请根据原稿补充环节说明。",
      companies: extractCompanies(child.body.join(" ")) || "待补充"
    }));

    return {
      id: `section-${index + 1}`,
      title: cleanHeading(section.title),
      role: section.body.join(" ").slice(0, 140) || "根据 Markdown 原稿章节生成，请在发布前检查。",
      items: items.length ? items : [{
        name: cleanHeading(section.title),
        detail: section.body.join(" ").slice(0, 180) || "请根据原稿补充环节说明。",
        companies: extractCompanies(section.body.join(" ")) || "待补充"
      }]
    };
  });
}

function buildLogic(sections, theme) {
  const summary = sections.find((section) => section.level === 2 && /核心逻辑|逻辑总结|核心驱动|产业趋势/.test(section.title));
  let source = [];
  if (summary) {
    const start = sections.indexOf(summary);
    const endOffset = sections.slice(start + 1).findIndex((item) => item.level === 2);
    const end = endOffset < 0 ? sections.length : start + 1 + endOffset;
    source = sections.slice(start + 1, end).filter((section) =>
      section.level === 3 &&
      /驱动|逻辑|催化|趋势/.test(section.title) &&
      !/优先级|风险/.test(section.title)
    );
  }
  if (!source.length) {
    source = sections.filter((section) => section.level === 2 && /驱动|逻辑|总结|催化|趋势|核心/.test(section.title));
  }
  if (!source.length) source = sections.filter((section) => section.level === 2);
  const logic = source.slice(0, 4).map((section) => ({
    title: cleanHeading(section.title).slice(0, 40),
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
  const type = required(input.type, "请选择动态类型");
  if (!["产业事件", "机构逻辑", "公司公告", "数据变化"].includes(type)) {
    throw validationError("动态类型无效");
  }

  const update = {
    date: String(input.date || new Date().toISOString().slice(0, 10)).trim(),
    type,
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
    .replace(/-industry-chain$/, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function cleanHeading(value) {
  return String(value || "")
    .replace(/^[(（]?[一二三四五六七八九十\d]+[)）.、\s-]*/, "")
    .trim();
}

function cleanMarkdown(value) {
  return String(value || "")
    .replace(/[*_`>#|]/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAsset(asset, label) {
  if (!asset || typeof asset !== "object") throw validationError(`请上传正式${label}文件`);
  const type = String(asset.type || "").toLowerCase();
  const allowed = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/svg+xml": ".svg"
  };
  const extension = allowed[type];
  if (!extension) throw validationError(`${label}仅支持 PNG、JPG、WebP 或 SVG`);
  const data = String(asset.data || "").replace(/^data:[^;]+;base64,/, "");
  const contents = Buffer.from(data, "base64");
  if (!contents.length || contents.length > 8 * 1024 * 1024) {
    throw validationError(`${label}文件无效或超过 8MB`);
  }
  return { contents, extension };
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
