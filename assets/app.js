const library = window.INDUSTRY_CHAIN_LIBRARY;
const chainAliases = {
  "semiconductor-material-industry-chain": "semiconductor-material"
};
const initialParams = new URLSearchParams(window.location.search);
const requestedChainId = initialParams.get("chain");
let requestedReading = normalizeReadingSource(initialParams.get("reading"));
let requestedReadingAnchor = initialParams.get("readingAnchor") || "";
let currentId = chainAliases[requestedChainId] || requestedChainId || library.chains[0].id;
document.body.classList.toggle("standalone-reading", Boolean(requestedReading));

if (requestedChainId && requestedChainId !== currentId) {
  const canonicalUrl = new URL(window.location.href);
  canonicalUrl.searchParams.set("chain", currentId);
  window.history.replaceState({}, "", canonicalUrl);
}

const chainColors = {
  upstream: "var(--cyan)",
  midstream: "var(--amber)",
  downstream: "var(--green)"
};

let searchIndex = [];
let activeSearchType = "全部";
let currentSearchQuery = "";
let searchInput;
let articleRequestId = 0;
let articleScrollCleanup;
let pendingArticleTarget = null;
let companyIndex = new Map();
let topicIndex = new Map();
let userProfile = null;
let readingSaveTimer = null;
const activeTrackingGroupByChain = new Map();
const activeStockCampFilterByChain = new Map();
const USER_TOKEN_KEY = "industry-chain:user-token";
const USER_PROFILE_KEY = "industry-chain:user-profile";

const trackedTopics = [
  "AI服务器",
  "新能源车",
  "新能源汽车",
  "车规",
  "军工",
  "消费电子",
  "数据中心",
  "先进封装",
  "国产替代",
  "高频高速",
  "低介电",
  "光模块",
  "液冷",
  "特高压",
  "储能",
  "机器人",
  "医疗康复",
  "商业航天"
];

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function compactText(values) {
  return values.flat(Infinity).filter(Boolean).join(" ");
}

function normalizeReadingSource(value) {
  const source = String(value || "").replace(/^\.?\//, "");
  const allowed =
    /^content\/research\/[A-Za-z0-9_./-]+\.md$/.test(source) ||
    /^managed\/sources\/[A-Za-z0-9_./-]+\.md$/.test(source);
  if (!allowed || source.includes("..")) return "";
  return source.startsWith("managed/") ? `/${source}` : `./${source}`;
}

function buildReadingUrl(sourceUrl, anchor = "") {
  const source = normalizeReadingSource(sourceUrl);
  if (!source) return sourceUrl;

  const url = new URL("./index.html", window.location.href);
  url.searchParams.set("chain", currentId);
  url.searchParams.set("reading", source.replace(/^\.?\//, ""));
  if (anchor) url.searchParams.set("readingAnchor", anchor);
  url.hash = "article";
  return url.toString();
}

function userToken() {
  return window.localStorage.getItem(USER_TOKEN_KEY) || "";
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `请求失败（${response.status}）`);
  return payload;
}

async function fetchUserProfile() {
  const token = userToken();
  if (!token) {
    userProfile = null;
    return null;
  }
  try {
    const payload = await apiRequest("/api/v1/me", { token });
    userProfile = payload.profile;
    window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile));
    return userProfile;
  } catch {
    userProfile = null;
    window.localStorage.removeItem(USER_PROFILE_KEY);
    return null;
  } finally {
  }
}

function loadCachedUserProfile() {
  try {
    userProfile = JSON.parse(window.localStorage.getItem(USER_PROFILE_KEY) || "null");
  } catch {
    userProfile = null;
  }
}

async function updateUserProfile(path, method) {
  const token = userToken();
  if (!token) throw new Error("请先在小程序登录后同步账号");
  const payload = await apiRequest(path, { method, token });
  userProfile = payload.profile;
  window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile));
  renderWebUserPanels(activeChain());
  renderCurrent(activeChain());
  return userProfile;
}

function searchTargetKey(chainId, type, index) {
  return `${chainId}:${type}:${index}`;
}

function splitCompanies(value) {
  return String(value || "")
    .split(/[、,，/]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !/瓶颈|基本盘|模块|服务器|数据中心|消费电子|信息娱乐|工业控制/.test(item));
}

function createCompanyIndex() {
  companyIndex = new Map();

  library.chains.forEach((chain) => {
    chain.chain.forEach((section, sectionIndex) => {
      const items = section.items || section.segments || [];
      items.forEach((item, itemIndex) => {
        splitCompanies(item.companies).forEach((company) => {
          const appearances = companyIndex.get(company) || [];
          appearances.push({
            chainId: chain.id,
            chainTitle: chain.title,
            target: searchTargetKey(chain.id, "chain-item", `${sectionIndex}-${itemIndex}`),
            segment: item.name,
            section: section.title || section.name,
            detail: item.detail || item.logic || ""
          });
          companyIndex.set(company, appearances);
        });
      });
    });
  });
}

function addTopicAppearance(topic, appearance) {
  const appearances = topicIndex.get(topic) || [];
  if (
    !appearances.some(
      (item) => item.chainId === appearance.chainId && item.segment === appearance.segment && item.context === appearance.context
    )
  ) {
    appearances.push(appearance);
  }
  topicIndex.set(topic, appearances);
}

function createTopicIndex() {
  topicIndex = new Map();

  library.chains.forEach((chain) => {
    const chainText = compactText([chain.title, chain.theme, chain.logic.map((item) => [item.title, item.body])]);
    trackedTopics.forEach((topic) => {
      if (chainText.includes(topic)) {
        addTopicAppearance(topic, {
          chainId: chain.id,
          chainTitle: chain.title,
          segment: "产业链主题",
          context: chain.theme,
          companies: ""
        });
      }
    });

    chain.chain.forEach((section, sectionIndex) => {
      const items = section.items || section.segments || [];
      items.forEach((item, itemIndex) => {
        const text = compactText([item.name, item.detail, item.logic, item.companies]);
        trackedTopics.forEach((topic) => {
          if (text.includes(topic)) {
            addTopicAppearance(topic, {
              chainId: chain.id,
              chainTitle: chain.title,
              target: searchTargetKey(chain.id, "chain-item", `${sectionIndex}-${itemIndex}`),
              segment: item.name,
              context: item.detail || item.logic || section.role,
              companies: item.companies || ""
            });
          }
        });
      });
    });

    chain.watchlist.forEach((item, index) => {
      const text = compactText([item.segment, item.signals, item.companies]);
      trackedTopics.forEach((topic) => {
        if (text.includes(topic)) {
          addTopicAppearance(topic, {
            chainId: chain.id,
            chainTitle: chain.title,
            target: searchTargetKey(chain.id, "watch", index),
            segment: item.segment,
            context: item.signals.join("、"),
            companies: item.companies || ""
          });
        }
      });
    });
  });
}

function topicsInText(value) {
  const text = String(value || "");
  return trackedTopics.filter((topic) => text.includes(topic) && topicIndex.has(topic));
}

function highlightText(value, terms) {
  const text = String(value ?? "");
  const normalizedText = text.toLowerCase();
  const uniqueTerms = [...new Set(terms)].sort((a, b) => b.length - a.length);
  let html = "";
  let index = 0;

  while (index < text.length) {
    const term = uniqueTerms.find((item) => normalizedText.startsWith(item, index));

    if (!term) {
      html += escapeHtml(text[index]);
      index += 1;
      continue;
    }

    const end = index + term.length;
    html += `<mark>${escapeHtml(text.slice(index, end))}</mark>`;
    index = end;
  }

  return html;
}

function createSearchIndex() {
  searchIndex = library.chains.flatMap((chain) => {
    const base = {
      chainId: chain.id,
      chainTitle: chain.title
    };
    const entries = [
      {
        ...base,
        type: "产业链",
        title: chain.title,
        body: compactText([chain.shortTitle, chain.theme, chain.status])
      }
    ];

    chain.chain.forEach((section, index) => {
      entries.push({
        ...base,
        target: searchTargetKey(chain.id, "chain", index),
        type: "骨架",
        title: section.title || section.name,
        body: compactText([
          section.role,
          (section.items || section.segments || []).map((item) => [
            item.name,
            item.detail,
            item.logic,
            item.companies
          ])
        ])
      });
    });

    chain.logic.forEach((item, index) => {
      entries.push({
        ...base,
        target: searchTargetKey(chain.id, "logic", index),
        type: "逻辑",
        title: item.title,
        body: item.body
      });
    });

    (chain.logicTracks || []).forEach((track) => {
      (track.coreInsights || []).forEach((insight) => {
        entries.push({
          ...base,
          target: searchTargetKey(chain.id, "logic-card", `${track.id}-${insight.id}`),
          type: "逻辑卡",
          title: insight.title,
          body: compactText([
            track.title,
            insight.kicker,
            insight.summary,
            insight.conclusion,
            insight.points?.map((point) => [point.label, point.description]),
            insight.metrics?.map((metric) => [metric.label, metric.value, metric.description]),
            insight.attachments?.map((attachment) => attachment.label)
          ])
        });
      });
    });

    (chain.trackingProfile?.metrics || []).forEach((item, index) => {
      entries.push({
        ...base,
        target: searchTargetKey(chain.id, "tracking", index),
        type: "追踪",
        title: item.name,
        body: compactText([item.why, item.signals])
      });
    });

    chain.watchlist.forEach((item, index) => {
      entries.push({
        ...base,
        target: searchTargetKey(chain.id, "watch", index),
        type: "观察",
        title: item.segment,
        body: compactText([item.signals, item.companies])
      });
    });

    chain.updates.forEach((item, index) => {
      entries.push({
        ...base,
        target: searchTargetKey(chain.id, "update", index),
        type: "动态",
        title: item.signal,
        body: compactText([
          item.date,
          item.type,
          item.segment,
          item.impact,
          item.confidence,
          item.sourceTitle,
          item.notes
        ])
      });
    });

    return entries.map((entry) => ({
      ...entry,
      haystack: normalize(`${entry.chainTitle} ${entry.type} ${entry.title} ${entry.body}`)
    }));
  });
}

function activeChain() {
  return library.chains.find((chain) => chain.id === currentId) || library.chains[0];
}

function setChain(id) {
  currentId = id;
  requestedReading = "";
  requestedReadingAnchor = "";
  const url = new URL(window.location.href);
  url.searchParams.set("chain", id);
  url.searchParams.delete("reading");
  url.searchParams.delete("readingAnchor");
  url.hash = "";
  window.history.replaceState({}, "", url);
  render();
}

function scrollToSearchTarget(targetKey) {
  const target = targetKey ? document.querySelector(`[data-search-target="${targetKey}"]`) : null;
  const fallback = document.querySelector("#currentTitle");
  const node = target || fallback;

  flashAndScroll(node);
}

function flashAndScroll(node, block = "center") {
  if (!node) return;

  node.scrollIntoView({ behavior: "smooth", block });
  node.classList.add("search-target-flash");
  window.setTimeout(() => node.classList.remove("search-target-flash"), 6000);
}

function openSearchResult(chainId, targetKey) {
  setChain(chainId);
  window.requestAnimationFrame(() => scrollToSearchTarget(targetKey));
}

function openCompanyArticleTarget(chainId, fallbackTarget, company) {
  pendingArticleTarget = { chainId, fallbackTarget, term: company };
  setChain(chainId);
}

function syncSearchUrl() {
  const url = new URL(window.location.href);
  const query = currentSearchQuery.trim();

  if (query) {
    url.searchParams.set("q", query);
  } else {
    url.searchParams.delete("q");
  }

  if (query && activeSearchType !== "全部") {
    url.searchParams.set("type", activeSearchType);
  } else {
    url.searchParams.delete("type");
  }

  window.history.replaceState({}, "", url);
}

function scoreSearchResult(entry, terms) {
  const title = normalize(entry.title);
  const chainTitle = normalize(entry.chainTitle);
  return terms.reduce((score, term) => {
    if (title.includes(term)) return score + 5;
    if (chainTitle.includes(term)) return score + 3;
    if (entry.haystack.includes(term)) return score + 1;
    return score;
  }, 0);
}

function excerptSearchResult(entry, terms) {
  const body = String(entry.body || "");
  const normalizedBody = normalize(body);
  const matchedTerm = terms.find((term) => normalizedBody.includes(term));
  if (!matchedTerm) return body.slice(0, 96);

  const start = Math.max(0, normalizedBody.indexOf(matchedTerm) - 36);
  const end = Math.min(body.length, start + 112);
  return `${start > 0 ? "..." : ""}${body.slice(start, end)}${end < body.length ? "..." : ""}`;
}

function searchTypeCounts(matches) {
  const counts = { "全部": matches.length };
  matches.forEach((item) => {
    counts[item.type] = (counts[item.type] || 0) + 1;
  });
  return counts;
}

async function copySearchLink(button) {
  const link = window.location.href;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = link;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    button.textContent = "已复制";
  } catch {
    button.textContent = "复制失败";
  }

  window.setTimeout(() => {
    button.textContent = "复制链接";
  }, 1400);
}

function focusSearchPanel() {
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState({}, "", url);
  document.querySelector(".search-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => searchInput?.focus({ preventScroll: true }), 180);
}

function searchLibrary(query) {
  searchInput.value = query;
  activeSearchType = "全部";
  renderSearchResults(query);
  focusSearchPanel();
}

function renderSearchResults(query) {
  const root = document.querySelector("#searchResults");
  currentSearchQuery = query;
  const terms = normalize(query).split(/\s+/).filter(Boolean);

  if (!terms.length) {
    root.innerHTML = "";
    activeSearchType = "全部";
    syncSearchUrl();
    return;
  }

  const allMatches = searchIndex
    .filter((entry) => terms.every((term) => entry.haystack.includes(term)))
    .map((entry) => ({
      ...entry,
      score: scoreSearchResult(entry, terms),
      excerpt: excerptSearchResult(entry, terms)
    }))
    .sort((a, b) => b.score - a.score || a.chainTitle.localeCompare(b.chainTitle, "zh-CN"));
  const typeCounts = searchTypeCounts(allMatches);
  const availableTypes = ["全部", "产业链", "骨架", "逻辑", "追踪", "观察", "动态"].filter((type) => typeCounts[type]);

  if (!typeCounts[activeSearchType]) {
    activeSearchType = "全部";
  }
  syncSearchUrl();

  const filteredMatches = activeSearchType === "全部" ? allMatches : allMatches.filter((item) => item.type === activeSearchType);
  const matches = filteredMatches.slice(0, 10);

  if (!matches.length) {
    root.innerHTML = `<p class="search-empty">没有找到匹配项，换个公司、材料或环节关键词试试。</p>`;
    return;
  }

  root.innerHTML = `
    <div class="search-tools">
      <div class="search-summary">找到 ${allMatches.length} 条相关结果${filteredMatches.length > matches.length ? `，当前显示前 ${matches.length} 条` : ""}</div>
      <button class="copy-search-link" type="button">复制链接</button>
    </div>
    <div class="search-filters" role="group" aria-label="搜索结果类型筛选">
      ${availableTypes
        .map(
          (type) => `
            <button class="search-filter${type === activeSearchType ? " active" : ""}" type="button" data-type="${escapeHtml(type)}" aria-pressed="${type === activeSearchType}">
              ${escapeHtml(type)} <span>${typeCounts[type]}</span>
            </button>
          `
        )
        .join("")}
    </div>
    <div class="search-list">
      ${matches
        .map(
          (item) => `
            <button class="search-result" type="button" data-chain="${escapeHtml(item.chainId)}" data-target="${escapeHtml(item.target || "")}">
              <span>${escapeHtml(item.type)} · ${highlightText(item.chainTitle, terms)}</span>
              <strong>${highlightText(item.title, terms)}</strong>
              <p>${highlightText(item.excerpt, terms)}</p>
            </button>
          `
        )
        .join("")}
    </div>
  `;

  root.querySelector(".copy-search-link").addEventListener("click", (event) => {
    copySearchLink(event.currentTarget);
  });

  root.querySelectorAll(".search-filter").forEach((button) => {
    button.addEventListener("click", () => {
      activeSearchType = button.dataset.type;
      renderSearchResults(currentSearchQuery);
      searchInput?.focus();
    });
  });

  root.querySelectorAll(".search-result").forEach((button) => {
    button.addEventListener("click", () => {
      openSearchResult(button.dataset.chain, button.dataset.target);
    });
  });
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta = {};

  if (!match) return { body: source, meta };

  const lines = match[1].split(/\r?\n/);
  let listKey = "";

  lines.forEach((line) => {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && listKey) {
      meta[listKey].push(listItem[1].trim());
      return;
    }

    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) return;

    const key = pair[1];
    const value = pair[2].trim().replace(/^["']|["']$/g, "");
    if (value) {
      meta[key] = value;
      listKey = "";
    } else {
      meta[key] = [];
      listKey = key;
    }
  });

  return { body: source.slice(match[0].length), meta };
}

function slugifyHeading(text, index) {
  return `article-${index}-${normalize(text)
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

function safeLinkHref(href) {
  const value = href.trim();
  if (/^(https?:|\.\/|\/|#)/i.test(value)) return escapeHtml(value);
  return "#";
}

function renderInlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => `<a href="${safeLinkHref(href)}">${text}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line) {
  return splitTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function articleBlockKind(text) {
  if (/免责声明|股市有风险|不构成投资建议/.test(text)) return "disclaimer";
  if (/风险提示|核心风险|估值回调风险|供给释放风险|技术路线风险|宏观经济风险/.test(text)) return "risk";
  if (/阅读提示|核心驱动|核心逻辑/.test(text)) return "insight";
  if (/附录|速查表|财务数据|一季度/.test(text)) return "appendix";
  return "";
}

function renderMarkdownArticle(markdown) {
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

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = slugifyHeading(text, headingIndex);
      currentKind = articleBlockKind(text) || currentKind;
      const kindClass = currentKind ? ` ${currentKind}` : "";
      html.push(`<h${level} id="${id}" class="article-heading${kindClass}">${renderInlineMarkdown(text)}</h${level}>`);
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
      const kind = articleBlockKind(text);
      html.push(`<blockquote class="${kind ? `article-note ${kind}` : ""}">${renderInlineMarkdown(text)}</blockquote>`);
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
      html.push(`
        <div class="article-table-wrap${currentKind ? ` ${currentKind}` : ""}">
          <div class="article-table-hint">横向滚动查看完整表格</div>
          <table>
            <thead><tr>${headers.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead>
            <tbody>
              ${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </div>
      `);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ""));
        index += 1;
      }
      html.push(`<ul class="${currentKind ? `article-list ${currentKind}` : "article-list"}">${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
        index += 1;
      }
      html.push(`<ol class="${currentKind ? `article-list ${currentKind}` : "article-list"}">${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ol>`);
      continue;
    }

    const paragraph = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,4})\s+/.test(lines[index]) &&
      !lines[index].trim().startsWith(">") &&
      !(index + 1 < lines.length && lines[index].includes("|") && isTableDivider(lines[index + 1])) &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    const text = paragraph.join(" ");
    const kind = articleBlockKind(text);
    html.push(`<p class="${kind ? `article-note ${kind}` : ""}">${renderInlineMarkdown(text)}</p>`);
  }

  return { html: html.join("\n"), meta: parsed.meta, toc };
}

function renderArticleToc(toc) {
  const root = document.querySelector("#articleToc");
  if (!toc.length) {
    root.innerHTML = "";
    return;
  }

  root.innerHTML = `
    <details class="article-toc-details" open>
      <summary>目录</summary>
      <nav>
        ${toc.map((item) => `<a class="toc-level-${item.level}" href="#${item.id}" data-heading="${item.id}">${escapeHtml(item.text)}</a>`).join("")}
      </nav>
    </details>
  `;

  root.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.getElementById(link.dataset.heading);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState({}, "", `#${link.dataset.heading}`);
    });
  });

  const details = root.querySelector(".article-toc-details");
  const setTocMode = () => {
    details.open = window.matchMedia("(min-width: 981px)").matches;
  };
  setTocMode();
}

function watchArticleHeadings() {
  if (articleScrollCleanup) articleScrollCleanup();
  const links = [...document.querySelectorAll("#articleToc a")];
  const headings = links.map((link) => document.getElementById(link.dataset.heading)).filter(Boolean);
  let frame = 0;

  if (!links.length || !headings.length) return;

  const setActiveHeading = () => {
    frame = 0;
    const offset = Math.min(window.innerHeight * 0.22, 180);
    const current =
      headings
        .map((heading) => ({ heading, top: heading.getBoundingClientRect().top }))
        .sort((a, b) => Math.abs(a.top - offset) - Math.abs(b.top - offset))[0]?.heading || headings[0];

    links.forEach((link) => link.classList.toggle("active", link.dataset.heading === current.id));
    scheduleReadingHistorySave(current, headings);
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(setActiveHeading);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  articleScrollCleanup = () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (frame) window.cancelAnimationFrame(frame);
  };
  setActiveHeading();
}

function scheduleReadingHistorySave(currentHeading, headings) {
  if (!userToken() || !currentHeading || requestedReading) return;
  window.clearTimeout(readingSaveTimer);
  readingSaveTimer = window.setTimeout(() => {
    const chain = activeChain();
    const article = document.querySelector("#articleView");
    const rect = article?.getBoundingClientRect();
    const total = Math.max((article?.scrollHeight || 0) - window.innerHeight, 1);
    const read = Math.max(0, -Number(rect?.top || 0));
    const payload = {
      headingId: currentHeading.id,
      headingTitle: currentHeading.textContent.trim(),
      blockIndex: Math.max(0, headings.findIndex((item) => item.id === currentHeading.id)),
      scrollTop: Math.max(0, Math.round(window.scrollY)),
      progress: Math.max(0, Math.min(100, Math.round((read / total) * 100)))
    };
    apiRequest(`/api/v1/me/reading-history/chains/${encodeURIComponent(chain.id)}`, {
      method: "PUT",
      token: userToken(),
      body: payload
    })
      .then((result) => {
        userProfile = result.profile;
        window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile));
      })
      .catch(() => {});
  }, 800);
}

function loadTextResource(url) {
  if (typeof fetch === "function") {
    return fetch(url).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    });
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url);
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(request.responseText);
      } else {
        reject(new Error(`HTTP ${request.status}`));
      }
    };
    request.onerror = () => reject(new Error("Network error"));
    request.send();
  });
}

function renderArticleMeta(meta, chain) {
  const tags = Array.isArray(meta.tags) ? meta.tags : [];

  return `
    <div class="article-meta">
      <div>
        <span>文章</span>
        <strong>${escapeHtml(meta.title || chain.title)}</strong>
      </div>
      <div>
        <span>创建</span>
        <strong>${escapeHtml(meta.created || library.meta.updated)}</strong>
      </div>
      <div>
        <span>状态</span>
        <strong>${escapeHtml(meta.status || "已整理")}</strong>
      </div>
      ${tags.length ? `<div class="article-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
    </div>
  `;
}

function injectArticleIllustrations(view, illustrations) {
  illustrations.forEach((illustration) => {
    const headings = [...view.querySelectorAll(".article-heading")];
    const heading = findIllustrationHeading(headings, illustration.afterHeading);
    if (!heading) return;

    const figure = el("figure", "article-illustration");
    figure.innerHTML = `
      <a href="${escapeHtml(illustration.src)}" target="_blank" rel="noopener noreferrer">
        <img src="${escapeHtml(illustration.src)}" alt="${escapeHtml(illustration.alt)}" loading="lazy">
      </a>
      <figcaption>${escapeHtml(illustration.caption)}</figcaption>
    `;
    heading.insertAdjacentElement("afterend", figure);
  });
}

function findIllustrationHeading(headings, afterHeading) {
  const target = String(afterHeading || "").trim();
  if (!target) return headings.find((item) => item.tagName === "H1") || headings[0];

  const exact = headings.find((item) => item.textContent.trim() === target);
  if (exact) return exact;

  const targetKey = illustrationHeadingKey(target);
  if (!targetKey) return null;
  return headings.find((item) => {
    const headingKey = illustrationHeadingKey(item.textContent);
    return Boolean(headingKey) && (
      headingKey === targetKey ||
      (targetKey.length >= 4 && (headingKey.includes(targetKey) || targetKey.includes(headingKey)))
    );
  }) || null;
}

function illustrationHeadingKey(value) {
  return String(value || "")
    .replace(/^\s*第?[一二三四五六七八九十百\d.、（）() -]+(?:章|节)?\s*/, "")
    .split(/[：:——]/, 1)[0]
    .replace(/[^\w\u4e00-\u9fa5]+/g, "")
    .toLowerCase();
}

function scrollToArticleHash() {
  if (!window.location.hash) return;

  const id = decodeURIComponent(window.location.hash.slice(1));
  const target = document.getElementById(id);
  if (target?.classList.contains("article-heading")) {
    window.setTimeout(() => target.scrollIntoView({ block: "start" }), 60);
  }
}

function scrollToRenderedSectionHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!["overview", "chain", "updates", "activity", "changes", "research", "stocks", "logic", "article"].includes(id)) return;
  if (id === "research") setActivityTab("research");
  if (id === "changes") setActivityTab("changes");
  const target = document.getElementById(id);
  if (!target) return;
  window.setTimeout(() => target.scrollIntoView({ block: "start" }), 80);
}

function scrollToReadingAnchor() {
  if (!requestedReadingAnchor) return;
  const target = findArticleHeading(requestedReadingAnchor) ||
    findArticleMention(requestedReadingAnchor);
  if (!target) return;
  window.setTimeout(() => {
    target.scrollIntoView({ block: "start" });
    target.classList.add("search-target-flash");
    window.setTimeout(() => target.classList.remove("search-target-flash"), 6000);
  }, 80);
}

function findArticleHeading(keyword) {
  const normalizedKeyword = normalize(keyword);
  const headings = [...document.querySelectorAll("#articleView .article-heading")];
  return headings.find((heading) => normalize(heading.textContent).includes(normalizedKeyword));
}

function findArticleMention(keyword) {
  const normalizedKeyword = normalize(keyword);
  const headings = [...document.querySelectorAll("#articleView .article-heading")];
  const bodyNodes = [...document.querySelectorAll("#articleView p, #articleView li, #articleView td, #articleView blockquote")];
  const match =
    headings.find((node) => normalize(node.textContent).includes(normalizedKeyword)) ||
    bodyNodes.find((node) => normalize(node.textContent).includes(normalizedKeyword));

  if (!match) return null;
  return match.closest("tr, li, blockquote, p, .article-heading") || match;
}

function focusArticleTerm(term) {
  const target = findArticleHeading(term);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState({}, "", `#${target.id}`);
    return;
  }

  searchLibrary(term);
}

function consumePendingArticleTarget(chainId) {
  if (!pendingArticleTarget || pendingArticleTarget.chainId !== chainId) return;

  const target = findArticleMention(pendingArticleTarget.term);
  if (target) {
    flashAndScroll(target, "center");
  } else {
    scrollToSearchTarget(pendingArticleTarget.fallbackTarget);
  }

  pendingArticleTarget = null;
}

function openCompanyPanel(company) {
  const appearances = companyIndex.get(company) || [];
  const logicCards = companyLogicCards(company);
  const security = companySecurity(company);
  const panel = document.querySelector("#companyPanel");

  panel.innerHTML = `
    <div class="company-panel-backdrop" data-close="company"></div>
    <section class="company-panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(company)} 公司卡片">
      <button class="company-panel-close" type="button" data-close="company" aria-label="关闭">×</button>
      <p class="eyebrow">Company</p>
      <h2>${escapeHtml(company)}</h2>
      <p>该公司在产业链研究库中出现 ${appearances.length} 次。</p>
      ${security ? `
        <section class="company-market-validation">
          <div>
            <span>Market Validation</span>
            <strong>市场走势验证</strong>
            <p>${escapeHtml(security.exchangeLabel)} · ${escapeHtml(security.ticker)}。股价走势用于观察市场何时交易这套逻辑，不代表产业逻辑已经得到证实。</p>
          </div>
          ${security.quoteUrl
            ? `<a href="${escapeHtml(security.quoteUrl)}" target="_blank" rel="noopener noreferrer">打开新浪 K 线</a>`
            : `<p class="company-market-pending">该交易市场的行情入口待接入。</p>`
          }
          ${logicCards.length ? `
            <div class="company-market-events">
              <small>研究对照节点</small>
              ${logicCards.map((item) => `
                <button type="button" data-logic-chain="${escapeHtml(item.chainId)}" data-logic-target="${escapeHtml(item.target)}">
                  <time>${escapeHtml(item.researchDate || "日期待补充")}</time>
                  <span>${escapeHtml(item.trackTitle)}</span>
                  <strong>${escapeHtml(item.title)}</strong>
                </button>
              `).join("")}
            </div>
          ` : ""}
        </section>
      ` : ""}
      <div class="company-appearances">
        ${appearances
          .map(
            (item) => `
              <button type="button" data-chain="${escapeHtml(item.chainId)}" data-target="${escapeHtml(item.target || "")}">
                <span>${escapeHtml(item.chainTitle)}</span>
                <strong>${escapeHtml(item.segment)}</strong>
                <p>${escapeHtml(item.section)} · ${escapeHtml(item.detail)}</p>
              </button>
            `
          )
          .join("")}
      </div>
      ${logicCards.length ? `
        <div class="company-logic-cards">
          <span>关联逻辑</span>
          ${logicCards.map((item) => `
            <button type="button" data-logic-chain="${escapeHtml(item.chainId)}" data-logic-target="${escapeHtml(item.target)}">
              <small>${escapeHtml(item.trackTitle)}</small>
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.summary)}</p>
            </button>
          `).join("")}
        </div>
      ` : ""}
    </section>
  `;
  panel.hidden = false;

  panel.querySelectorAll("[data-close='company']").forEach((button) => {
    button.addEventListener("click", closeCompanyPanel);
  });

  panel.querySelectorAll(".company-appearances button").forEach((button) => {
    button.addEventListener("click", () => {
      closeCompanyPanel();
      openCompanyArticleTarget(button.dataset.chain, button.dataset.target, company);
    });
  });

  panel.querySelectorAll(".company-logic-cards button").forEach((button) => {
    button.addEventListener("click", () => {
      closeCompanyPanel();
      setChain(button.dataset.logicChain);
      window.requestAnimationFrame(() => {
        flashAndScroll(document.getElementById(button.dataset.logicTarget), "center");
      });
    });
  });

  panel.querySelectorAll(".company-market-events button").forEach((button) => {
    button.addEventListener("click", () => {
      closeCompanyPanel();
      setChain(button.dataset.logicChain);
      window.requestAnimationFrame(() => {
        flashAndScroll(document.getElementById(button.dataset.logicTarget), "center");
      });
    });
  });
}

function companyLogicCards(company) {
  return library.chains.flatMap((chain) =>
    (chain.logicTracks || []).flatMap((track) =>
      (track.coreInsights || [])
        .filter((insight) => insight.attachments?.some((attachment) => attachment.type === "company" && attachment.label === company))
        .map((insight) => ({
          chainId: chain.id,
          trackTitle: track.title,
          title: insight.title,
          summary: insight.summary,
          researchDate: insight.researchDate || "",
          target: `logic-card-${track.id}-${insight.id}`
        }))
    )
  );
}

function companySecurity(company) {
  const mapped = library.companySecurities?.[company];
  if (mapped?.ticker && mapped?.exchange) return normalizeSecurity(mapped);

  for (const chain of library.chains) {
    for (const track of chain.logicTracks || []) {
      for (const insight of track.coreInsights || []) {
        const attachment = insight.attachments?.find((item) =>
          item.type === "company" && item.label === company && item.ticker && item.exchange
        );
        if (!attachment) continue;
        return normalizeSecurity(attachment);
      }
    }
  }
  return null;
}

function normalizeSecurity(input) {
  const exchange = String(input.exchange || "").trim().toUpperCase();
  const ticker = String(input.ticker || "").trim();
  if (!ticker || !exchange) return null;
  return {
    ticker,
    exchange,
    market: input.market || "CN",
    exchangeLabel: exchangeLabel(exchange),
    quoteUrl: buildQuoteUrl(exchange, ticker)
  };
}

function exchangeLabel(exchange) {
  return {
    SSE: "上海证券交易所",
    SZSE: "深圳证券交易所",
    BSE: "北京证券交易所",
    HKEX: "香港交易所",
    NASDAQ: "纳斯达克",
    NYSE: "纽约证券交易所"
  }[exchange] || exchange;
}

function buildQuoteUrl(exchange, ticker) {
  const prefix = {
    SSE: "sh",
    SZSE: "sz",
    BSE: "bj"
  }[exchange];
  if (!prefix) return "";
  return `https://finance.sina.com.cn/realstock/company/${prefix}${ticker}/nc.shtml`;
}

function openTopicPanel(topic) {
  const appearances = topicIndex.get(topic) || [];
  const panel = document.querySelector("#companyPanel");

  panel.innerHTML = `
    <div class="company-panel-backdrop" data-close="company"></div>
    <section class="company-panel topic-panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(topic)} 主题图谱">
      <button class="company-panel-close" type="button" data-close="company" aria-label="关闭">×</button>
      <p class="eyebrow">Topic Map</p>
      <h2>${escapeHtml(topic)}</h2>
      <p>该主题在产业链研究库中关联 ${appearances.length} 个环节，可用于查看需求、材料、制造和应用之间的交叉关系。</p>
      <button class="topic-search-button" type="button" data-topic-search="${escapeHtml(topic)}">查看全库搜索</button>
      <div class="company-appearances">
        ${appearances
          .map(
            (item) => `
              <button type="button" data-chain="${escapeHtml(item.chainId)}" data-target="${escapeHtml(item.target || "")}" data-term="${escapeHtml(item.segment)}">
                <span>${escapeHtml(item.chainTitle)}</span>
                <strong>${escapeHtml(item.segment)}</strong>
                <p>${escapeHtml(item.context || "")}</p>
                ${item.companies ? `<small>${escapeHtml(item.companies)}</small>` : ""}
              </button>
            `
          )
          .join("")}
      </div>
    </section>
  `;
  panel.hidden = false;

  panel.querySelectorAll("[data-close='company']").forEach((button) => {
    button.addEventListener("click", closeCompanyPanel);
  });

  panel.querySelector("[data-topic-search]").addEventListener("click", () => {
    closeCompanyPanel();
    searchLibrary(topic);
  });

  panel.querySelectorAll(".company-appearances button").forEach((button) => {
    button.addEventListener("click", () => {
      closeCompanyPanel();
      if (button.dataset.target) {
        openSearchResult(button.dataset.chain, button.dataset.target);
        return;
      }
      setChain(button.dataset.chain);
      window.setTimeout(() => focusArticleTerm(button.dataset.term), 240);
    });
  });
}

function closeCompanyPanel() {
  const panel = document.querySelector("#companyPanel");
  panel.hidden = true;
  panel.innerHTML = "";
}

async function renderArticle(chain) {
  const view = document.querySelector("#articleView");
  const toc = document.querySelector("#articleToc");
  const requestId = ++articleRequestId;
  view.innerHTML = `<p class="article-loading">正在加载原文...</p>`;
  toc.innerHTML = "";

  try {
    const articleSource = requestedReading || chain.article;
    const markdown = await loadTextResource(articleSource);
    if (requestId !== articleRequestId) return;

    const rendered = renderMarkdownArticle(markdown);
    if (!rendered.meta.title) {
      rendered.meta.title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || chain.title;
    }
    if (requestedReading) document.title = rendered.meta.title;
    document.querySelector("#articleSectionTitle").textContent = requestedReading ? "研究文章阅读" : "原文阅读";
    document.querySelector("#articleSectionDescription").textContent = requestedReading
      ? "复用产业链原文阅读能力，保留文章层级、目录、锚点与当前位置高亮。"
      : "以正式文章方式呈现完整研究内容，适合系统阅读、查找公司段落和回看关键判断。";
    view.innerHTML = `${renderArticleMeta(rendered.meta, chain)}${rendered.html}`;
    const activeResearch = requestedReading
      ? chain.updates.find((item) => normalizeReadingSource(item.sourceUrl) === requestedReading)
      : null;
    const activeSource = requestedReading
      ? (chain.sources || []).find((item) => normalizeReadingSource(item.markdownUrl) === requestedReading)
      : null;
    injectArticleIllustrations(
      view,
      activeSource?.illustrations || activeResearch?.sourceIllustrations || []
    );
    renderArticleToc(rendered.toc);
    watchArticleHeadings();
    if (requestedReadingAnchor) scrollToReadingAnchor();
    else scrollToArticleHash();
    consumePendingArticleTarget(chain.id);
  } catch (error) {
    view.innerHTML = `
      <div class="article-error">
        <strong>原文加载失败</strong>
        <p>文章内容暂时无法加载，请稍后刷新页面重试。</p>
      </div>
    `;
    if (pendingArticleTarget?.chainId === chain.id) {
      scrollToSearchTarget(pendingArticleTarget.fallbackTarget);
      pendingArticleTarget = null;
    }
  }
}

function renderIndustryGrid(chain) {
  const root = document.querySelector("#industryGrid");
  root.innerHTML = "";

  library.chains.forEach((item) => {
    const card = el("button", "industry-card");
    if (item.id === chain.id) card.classList.add("active");
    card.type = "button";
    card.innerHTML = `
      <strong>${item.title}</strong>
      <p>${item.theme}</p>
    `;
    card.addEventListener("click", () => setChain(item.id));
    root.append(card);
  });
}

function renderWebUserPanels(chain) {
  const userPanel = document.querySelector("#webUserPanel");
  const personalPanel = document.querySelector("#webPersonalPanel");
  if (!userPanel || !personalPanel) return;

  const hasToken = Boolean(userToken());
  userPanel.innerHTML = `
    <div>
      <strong>${userProfile ? "已同步个人资料" : hasToken ? "正在同步个人资料" : "未登录也可浏览"}</strong>
      <p>${userProfile
        ? "收藏、订阅和阅读历史会在网页、小程序和未来 App 之间复用。"
        : "登录能力优先在小程序启用；网页识别同一用户 token 后可展示个人收藏与阅读历史。"}</p>
    </div>
    <button type="button" id="refreshUserProfile">${userProfile ? "刷新" : "同步账号"}</button>
  `;
  userPanel.querySelector("#refreshUserProfile").addEventListener("click", () => {
    fetchUserProfile().then(() => {
      renderWebUserPanels(activeChain());
      renderCurrent(activeChain());
    });
  });

  const favoriteIds = new Set(userProfile?.favorites?.chains || []);
  const favorites = library.chains.filter((item) => favoriteIds.has(item.id)).slice(0, 4);
  const history = (userProfile?.readingHistory || []).slice(0, 4);
  personalPanel.innerHTML = userProfile && (favorites.length || history.length) ? `
    <div class="web-personal-head">
      <span>我的关注</span>
      <strong>${favorites.length} 个收藏 · ${history.length} 条阅读历史</strong>
    </div>
    <div class="web-personal-grid">
      ${favorites.map((item) => `
        <button type="button" data-chain="${escapeHtml(item.id)}">
          <span>收藏产业链</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.theme)}</p>
        </button>
      `).join("")}
      ${history.map((item) => `
        <button type="button" data-chain="${escapeHtml(item.chainId)}">
          <span>阅读历史 · ${escapeHtml(item.progress)}%</span>
          <strong>${escapeHtml(item.chainTitle)}</strong>
          <p>${escapeHtml(item.headingTitle || "继续阅读原文")}</p>
        </button>
      `).join("")}
    </div>
  ` : "";
  personalPanel.querySelectorAll("[data-chain]").forEach((button) => {
    button.addEventListener("click", () => setChain(button.dataset.chain));
  });
}

function renderCurrent(chain) {
  document.querySelector("#currentTitle").textContent = chain.title;
  document.querySelector("#currentTheme").textContent = chain.theme;

  const quick = document.querySelector("#quickLinks");
  quick.innerHTML = "";
  const quickLinks = chain.mobileSummary?.sections?.length
    ? chain.mobileSummary.sections
        .filter((section) => section.id !== "focus")
        .map((section) => [section.title, summarySectionHref(section.id), section.count])
    : [
        ["最新研究", "#activity"],
        ["核心逻辑", "#logic"],
        ["产业链结构", "#chain"],
        ["跟踪验证", "#updates"],
        ["市场验证", "#stocks"],
        ["原文阅读", "#article"],
      ];
  if (!quickLinks.some(([, href]) => href === "#workbench")) {
    quickLinks.splice(2, 0, ["工作台", "#workbench", buildWorkbenchSummary(chain).logicNodes.length]);
  }
  quickLinks.forEach(([label, href, count]) => {
    const link = el("a", "button", label);
    link.href = href;
    if (count !== undefined) link.dataset.count = count;
    quick.append(link);
  });

  const personalActions = el("div", "personal-actions");
  const isFavorite = Boolean(userProfile?.favorites?.chains?.includes(chain.id));
  const isSubscribed = Boolean(userProfile?.subscriptions?.chains?.includes(chain.id));
  [
    ["favorite", isFavorite ? "取消收藏" : "收藏产业链", isFavorite],
    ["subscription", isSubscribed ? "取消订阅" : "订阅动态", isSubscribed]
  ].forEach(([kind, label, active]) => {
    const button = el("button", active ? "active" : "", label);
    button.type = "button";
    button.addEventListener("click", () => toggleWebPersonalFlag(kind));
    personalActions.append(button);
  });
  quick.append(personalActions);

  renderCurrentHighlights(chain);
}

function renderCurrentHighlights(chain) {
  const root = document.querySelector("#currentHighlights");
  if (chain.mobileSummary?.highlights?.length) {
    const sectionMeta = new Map((chain.mobileSummary.sections || []).map((section) => [section.id, section]));
    root.innerHTML = chain.mobileSummary.highlights.slice(0, 3).map((item) => {
      const section = sectionMeta.get(item.target);
      return `
        <a class="current-highlight" href="${escapeHtml(summaryHighlightHref(item))}">
          <span>${escapeHtml(item.label || section?.title || "当前重点")}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.body || section?.summary || "")}</p>
          ${item.date ? `<small>${escapeHtml(item.date)}</small>` : ""}
        </a>
      `;
    }).join("");
    return;
  }
  const latestUpdate = [...(chain.updates || [])].sort((left, right) =>
    String(right.date || "").localeCompare(String(left.date || ""))
  )[0];
  const latestSource = [...(chain.sources || [])].sort((left, right) =>
    String(right.date || "").localeCompare(String(left.date || "")) ||
    String(right.createdAt || "").localeCompare(String(left.createdAt || ""))
  )[0];
  const latestVerification = (chain.trackingProfile?.metrics || [])
    .map((item) => item.latestVerification ? ({ metric: item, verification: item.latestVerification }) : null)
    .filter(Boolean)
    .sort((left, right) =>
      String(right.verification.date || "").localeCompare(String(left.verification.date || ""))
    )[0];
  const firstLogic = (chain.logicTracks || [])
    .flatMap((track) => (track.coreInsights || []).map((insight) => ({ track, insight })))
    .find(({ insight }) => insight.status !== "draft");

  const highlights = [
    latestUpdate ? {
      label: "最新变化",
      title: latestUpdate.signal,
      body: latestUpdate.impact,
      href: "#activity"
    } : null,
    latestSource ? {
      label: "最新资料",
      title: latestSource.title,
      body: latestSource.summary || `${latestSource.platform || "资料"} · ${latestSource.date || ""}`,
      href: "#activity"
    } : null,
    latestVerification ? {
      label: "最近核验",
      title: `${latestVerification.metric.name}：${verificationResultLabel(latestVerification.verification.result)}`,
      body: latestVerification.verification.summary,
      href: "#updates"
    } : firstLogic ? {
      label: "重点逻辑",
      title: firstLogic.insight.title,
      body: firstLogic.insight.summary,
      href: "#logic"
    } : null
  ].filter(Boolean).slice(0, 3);

  root.innerHTML = highlights.length ? highlights.map((item) => `
    <a class="current-highlight" href="${escapeHtml(item.href)}">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.body || "")}</p>
    </a>
  `).join("") : `
    <article class="current-highlight">
      <span>当前重点</span>
      <strong>${escapeHtml(chain.title)}</strong>
      <p>${escapeHtml(chain.theme)}</p>
    </article>
  `;
}

function summarySectionHref(id) {
  return {
    focus: "#overview",
    research: "#activity",
    logic: "#logic",
    structure: "#chain",
    workbench: "#workbench",
    tracking: "#updates",
    stocks: "#stocks",
    article: "#article"
  }[id] || "#overview";
}

function summaryHighlightHref(item) {
  if (item?.type === "research") return "#research";
  if (item?.type === "logic") return "#logic";
  if (item?.type === "update") return "#changes";
  return summarySectionHref(item?.target);
}

async function toggleWebPersonalFlag(kind) {
  try {
    const chain = activeChain();
    const active = kind === "favorite"
      ? Boolean(userProfile?.favorites?.chains?.includes(chain.id))
      : Boolean(userProfile?.subscriptions?.chains?.includes(chain.id));
    const path = kind === "favorite"
      ? `/api/v1/me/favorites/chains/${encodeURIComponent(chain.id)}`
      : `/api/v1/me/subscriptions/chains/${encodeURIComponent(chain.id)}`;
    await updateUserProfile(path, active ? "DELETE" : "PUT");
  } catch (error) {
    showToast(error.message || "个人资料同步失败");
  }
}

function showToast(message) {
  const toast = el("div", "web-toast", escapeHtml(message));
  document.body.append(toast);
  window.setTimeout(() => toast.classList.add("show"), 20);
  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 220);
  }, 2600);
}

function renderChain(chain) {
  const root = document.querySelector("#chainGrid");
  root.innerHTML = "";

  chain.chain.forEach((section, sectionIndex) => {
    const card = el("article", "chain-card");
    card.dataset.searchTarget = searchTargetKey(chain.id, "chain", sectionIndex);
    card.style.borderColor = chainColors[section.id] || "var(--line)";
    card.append(el("h3", "", section.title || section.name));
    card.append(el("p", "role", section.role));

    const items = section.items || section.segments || [];
    items.forEach((item, itemIndex) => {
      const block = el("div", "chain-item");
      block.dataset.searchTarget = searchTargetKey(chain.id, "chain-item", `${sectionIndex}-${itemIndex}`);
      const itemTopic = topicIndex.has(item.name) ? item.name : "";
      const name = el("button", "chain-node", escapeHtml(item.name));
      name.type = "button";
      name.addEventListener("click", () => {
        if (itemTopic) {
          openTopicPanel(itemTopic);
          return;
        }
        focusArticleTerm(item.name);
      });
      block.append(name);
      block.append(el("p", "", item.detail || item.logic));

      const topics = topicsInText(compactText([item.name, item.detail, item.logic, item.companies]));
      if (topics.length) {
        const topicChips = el("div", "topic-chips");
        topics.forEach((topic) => {
          const chip = el("button", "topic-chip", escapeHtml(topic));
          chip.type = "button";
          chip.addEventListener("click", () => openTopicPanel(topic));
          topicChips.append(chip);
        });
        block.append(topicChips);
      }

      const companies = el("div", "company company-chips");
      const parsedCompanies = splitCompanies(item.companies);
      if (parsedCompanies.length) {
        parsedCompanies.forEach((company) => {
          const chip = el("button", "company-chip", escapeHtml(company));
          chip.type = "button";
          chip.addEventListener("click", () => openCompanyPanel(company));
          companies.append(chip);
        });
      } else {
        companies.textContent = item.companies;
      }
      block.append(companies);
      card.append(block);
    });

    root.append(card);
  });
}

function renderWorkbench(chain) {
  const learningRoot = document.querySelector("#learningPath");
  const timelineRoot = document.querySelector("#sourceTimeline");
  const logicRoot = document.querySelector("#logicMap");
  if (!learningRoot || !timelineRoot || !logicRoot) return;

  const summary = buildWorkbenchSummary(chain);

  learningRoot.innerHTML = "";
  summary.learningSteps.forEach((step, index) => {
    const card = el("button", "learning-step");
    card.type = "button";
    card.disabled = !step.target;
    card.innerHTML = `
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${escapeHtml(step.title)}</strong>
      <small>${escapeHtml(step.body)}</small>
    `;
    if (step.target) {
      card.addEventListener("click", () => scrollToWorkbenchTarget(step.target));
    }
    learningRoot.append(card);
  });

  timelineRoot.innerHTML = "";
  if (!summary.timeline.length) {
    timelineRoot.append(el("p", "workbench-empty", "暂时没有独立资料或动态。后续 PDF、公众号、短视频和公告都会沉淀到这里。"));
  }
  summary.timeline.forEach((item) => {
    const card = el("article", `source-timeline-item ${item.kind}`);
    card.innerHTML = `
      <div class="source-timeline-meta">
        <time>${escapeHtml(item.date || "待定日期")}</time>
        <span>${escapeHtml(item.type)}</span>
        <em>${escapeHtml(item.segment || "全产业链")}</em>
      </div>
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.summary || "已归档，等待进一步提炼。")}</p>
      <div class="source-timeline-relation">
        <span>影响逻辑：${escapeHtml(item.logicTitle || "待判断")}</span>
        <span>状态：${escapeHtml(item.status || "待核验")}</span>
      </div>
    `;
    const actions = el("div", "source-timeline-actions");
    if (item.href) {
      const link = el("a", "", item.kind === "short-video" ? "打开视频" : "查看来源");
      link.href = item.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      actions.append(link);
    }
    if (item.logicTarget) {
      const logicButton = el("button", "", "查看逻辑");
      logicButton.type = "button";
      logicButton.addEventListener("click", () => scrollToWorkbenchTarget(item.logicTarget));
      actions.append(logicButton);
    }
    card.append(actions);
    timelineRoot.append(card);
  });

  logicRoot.innerHTML = "";
  summary.logicNodes.forEach((node, index) => {
    const card = el("article", `logic-map-node ${node.kind}`);
    card.dataset.searchTarget = node.target;
    card.innerHTML = `
      <div class="logic-map-node-head">
        <span>${escapeHtml(node.kindLabel)}</span>
        <em>${String(index + 1).padStart(2, "0")}</em>
      </div>
      <h4>${escapeHtml(node.title)}</h4>
      <p>${escapeHtml(node.body)}</p>
      <div class="logic-map-links">
        ${node.segments.slice(0, 3).map((segment) => `<button type="button" data-target="${escapeHtml(segment.target)}">${escapeHtml(segment.label)}</button>`).join("")}
      </div>
      <div class="logic-map-evidence">
        <span>${node.evidenceCount} 条资料/动态</span>
        <span>${node.metricCount} 个跟踪项</span>
      </div>
    `;
    card.querySelectorAll("[data-target]").forEach((button) => {
      button.addEventListener("click", () => scrollToWorkbenchTarget(button.dataset.target));
    });
    logicRoot.append(card);
  });
}

function scrollToWorkbenchTarget(target) {
  if (!target) return;
  if (target.startsWith("#")) {
    flashAndScroll(document.querySelector(target));
    return;
  }
  const byId = document.getElementById(target);
  if (byId) {
    flashAndScroll(byId);
    return;
  }
  scrollToSearchTarget(target);
}

function buildWorkbenchSummary(chain) {
  return {
    learningSteps: buildLearningSteps(chain),
    timeline: buildSourceTimeline(chain).slice(0, 8),
    logicNodes: buildLogicMapNodes(chain)
  };
}

function buildLearningSteps(chain) {
  if (chain.id === "optical-module") {
    return [
      {
        title: "先理解 AI 算力为什么需要高速互联",
        body: "从 GPU 集群通信、带宽、功耗和延迟约束看光进铜退。",
        target: findChainItemTarget(chain, ["交换机与云厂", "高速光模块"])
      },
      {
        title: "再看 800G / 1.6T 光模块如何承接需求",
        body: "高速模块是业绩兑现最直接环节，订单、产能和毛利率是关键。",
        target: findChainItemTarget(chain, ["高速光模块"])
      },
      {
        title: "拆开上游瓶颈",
        body: "光芯片、InP、陶瓷封装、TFLN 和光器件决定供给弹性。",
        target: findChainItemTarget(chain, ["光芯片", "衬底", "薄膜铌酸锂"])
      },
      {
        title: "理解 CPO / 硅光的价值重构",
        body: "CPO 把价值链推向光引擎、硅光、调制器和高精密器件。",
        target: findChainItemTarget(chain, ["CPO硅光交换机", "光器件与光引擎"])
      },
      {
        title: "看底层网络升级",
        body: "多芯光缆、光纤涨价和交换机订单验证智算网络落地。",
        target: findChainItemTarget(chain, ["光纤光缆网络", "光纤预制棒"])
      },
      {
        title: "最后回到公司与 K 线验证",
        body: "把逻辑映射到公司，观察市场是否已经开始交易。",
        target: "#stocks"
      }
    ];
  }

  return (chain.chain || []).flatMap((section, sectionIndex) =>
    (section.items || section.segments || []).slice(0, 2).map((item, itemIndex) => ({
      title: item.name,
      body: item.detail || item.logic || section.role || chain.theme,
      target: searchTargetKey(chain.id, "chain-item", `${sectionIndex}-${itemIndex}`)
    }))
  ).slice(0, 6);
}

function findChainItemTarget(chain, terms) {
  const normalizedTerms = terms.map(normalize);
  for (let sectionIndex = 0; sectionIndex < (chain.chain || []).length; sectionIndex += 1) {
    const section = chain.chain[sectionIndex];
    const items = section.items || section.segments || [];
    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      const item = items[itemIndex];
      const text = normalize(compactText([section.title, section.name, item.name, item.detail, item.logic, item.companies]));
      if (normalizedTerms.some((term) => text.includes(term))) {
        return searchTargetKey(chain.id, "chain-item", `${sectionIndex}-${itemIndex}`);
      }
    }
  }
  return "";
}

function buildSourceTimeline(chain) {
  const updates = (chain.updates || []).map((item, index) => {
    const logic = inferSourceLogic(chain, compactText([item.segment, item.signal, item.impact, item.notes]));
    return {
      kind: item.sourceKind === "短视频" ? "short-video" : "update",
      date: item.date,
      type: item.sourceKind || item.type || "动态",
      segment: item.segment,
      title: item.signal,
      summary: item.impact,
      status: item.confidence,
      href: item.sourceKind === "文章" ? buildReadingUrl(item.sourceUrl) : item.sourceUrl,
      logicTitle: logic?.title || item.logicTrack?.role || "",
      logicTarget: logic?.target || (item.logicTrack?.id ? `logic-track-${item.logicTrack.id}` : ""),
      sortKey: `${item.date || ""}-update-${index}`
    };
  });

  const sources = (chain.sources || []).map((item, index) => {
    const logic = inferSourceLogic(chain, compactText([
      item.segment,
      item.title,
      item.summary,
      item.tags,
      item.companies
    ]));
    return {
      kind: item.type === "short-video" ? "short-video" : "source",
      date: item.date || item.createdAt?.slice(0, 10) || "",
      type: researchTypeLabel(item.type),
      segment: item.segment,
      title: item.title,
      summary: item.summary,
      status: item.status === "published" ? "已归档" : "待整理",
      href: item.markdownUrl ? buildReadingUrl(item.markdownUrl) : item.originalUrl,
      logicTitle: logic?.title || "",
      logicTarget: logic?.target || "",
      sortKey: `${item.date || item.createdAt || ""}-source-${index}`
    };
  });

  const packages = (chain.researchPackages || []).map((item, index) => {
    const logic = inferSourceLogic(chain, compactText([item.topicTitle, item.summary, item.logic?.summary]));
    return {
      kind: "package",
      date: item.researchDate || item.importedAt?.slice(0, 10) || "",
      type: "研究包",
      segment: item.topicTitle || "研究主题",
      title: item.title || item.topicTitle || item.packageId,
      summary: item.summary || `提炼 ${item.logicCount || 0} 条逻辑，关联 ${item.companyCount || 0} 家公司。`,
      status: item.status === "imported" ? "已入库" : "待入库",
      href: item.sourceUrl ? buildReadingUrl(item.sourceUrl) : item.articleUrl,
      logicTitle: logic?.title || item.topicTitle || "",
      logicTarget: logic?.target || (item.topicId ? `logic-track-research-${item.topicId}` : ""),
      sortKey: `${item.researchDate || item.importedAt || ""}-package-${index}`
    };
  });

  const seen = new Set();
  return [...updates, ...sources, ...packages]
    .filter((item) => {
      const key = item.href ? `${item.date}:${item.href}` : `${item.date}:${item.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return item.title;
    })
    .sort((left, right) => String(right.sortKey).localeCompare(String(left.sortKey)));
}

function inferSourceLogic(chain, value) {
  const text = normalize(value);
  const baseLogic = (chain.logic || []).map((item, index) => ({
    title: item.title,
    target: searchTargetKey(chain.id, "logic", index),
    haystack: normalize(compactText([item.title, item.body]))
  }));
  const researchLogic = (chain.logicTracks || []).flatMap((track) =>
    (track.coreInsights || []).map((item, index) => ({
      title: item.title,
      target: searchTargetKey(chain.id, "logic-card", `${track.id}-${item.id || index}`),
      haystack: normalize(compactText([track.title, item.title, item.summary, item.conclusion]))
    }))
  );
  const metrics = (chain.trackingProfile?.metrics || []).map((item, index) => ({
    title: item.topicTitle || item.logicTitle || item.name,
    target: searchTargetKey(chain.id, "tracking", index),
    haystack: normalize(compactText([item.name, item.why, item.signals, item.topicTitle, item.logicTitle]))
  }));

  return [...baseLogic, ...researchLogic, ...metrics]
    .map((item) => ({
      ...item,
      score: searchTokensForWorkbench(item.haystack).filter((term) => text.includes(term)).length +
        searchTokensForWorkbench(text).filter((term) => item.haystack.includes(term)).length
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)[0] || null;
}

function buildLogicMapNodes(chain) {
  const baseNodes = (chain.logic || []).map((item, index) => logicMapNodeFromBase(chain, item, index));
  const researchNodes = (chain.logicTracks || []).flatMap((track) =>
    (track.coreInsights || []).map((item, index) => logicMapNodeFromInsight(chain, track, item, index))
  );
  return [...baseNodes, ...researchNodes];
}

function logicMapNodeFromBase(chain, item, index) {
  const target = searchTargetKey(chain.id, "logic", index);
  const text = compactText([item.title, item.body]);
  return {
    kind: "base",
    kindLabel: "基准逻辑",
    target,
    title: item.title,
    body: item.body,
    segments: relatedSegmentsForText(chain, text),
    evidenceCount: buildSourceTimeline(chain).filter((source) => source.logicTarget === target || source.logicTitle === item.title).length,
    metricCount: relatedMetricsForText(chain, text).length
  };
}

function logicMapNodeFromInsight(chain, track, item, index) {
  const target = searchTargetKey(chain.id, "logic-card", `${track.id}-${item.id || index}`);
  const text = compactText([track.title, track.summary, item.title, item.summary, item.conclusion, item.points, item.metrics]);
  return {
    kind: "research",
    kindLabel: "近期研究",
    target,
    title: item.title,
    body: item.summary || item.conclusion || track.summary,
    segments: relatedSegmentsForText(chain, text),
    evidenceCount: (item.sources || []).length,
    metricCount: relatedMetricsForText(chain, text).length
  };
}

function relatedSegmentsForText(chain, value) {
  const text = normalize(value);
  const segments = [];
  (chain.chain || []).forEach((section, sectionIndex) => {
    (section.items || section.segments || []).forEach((item, itemIndex) => {
      const segmentText = normalize(compactText([item.name, item.detail, item.logic, item.companies]));
      const score = searchTokensForWorkbench(segmentText).filter((term) => text.includes(term)).length;
      if (score > 0) {
        segments.push({
          label: item.name,
          score,
          target: searchTargetKey(chain.id, "chain-item", `${sectionIndex}-${itemIndex}`)
        });
      }
    });
  });
  return segments.sort((left, right) => right.score - left.score).slice(0, 5);
}

function relatedMetricsForText(chain, value) {
  const text = normalize(value);
  return (chain.trackingProfile?.metrics || []).filter((metric) => {
    const metricText = normalize(compactText([metric.name, metric.why, metric.signals, metric.topicTitle, metric.logicTitle]));
    return searchTokensForWorkbench(metricText).some((term) => text.includes(term));
  });
}

function searchTokensForWorkbench(value) {
  return [...new Set(String(value || "")
    .toLowerCase()
    .split(/[、，,;/；\s+：:()（）-]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2)
    .filter((item) => !/^(产业链|逻辑|公司|环节|上游|中游|下游|当前|订单|客户)$/.test(item)))];
}

function renderDiagram(chain) {
  const link = document.querySelector("#diagramLink");
  const image = document.querySelector("#diagramImage");
  const vectorDiagram = chain.diagramSvg && chain.diagramSvg !== chain.diagram ? chain.diagramSvg : "";
  const displayDiagram = vectorDiagram || chain.diagram;

  link.href = displayDiagram;
  image.onerror = vectorDiagram
    ? () => {
        image.onerror = null;
        image.src = chain.diagram;
        link.href = chain.diagram;
      }
    : null;
  image.src = displayDiagram;
  image.alt = `${chain.title}全景与价值传导图`;
  if (window.location.hash) {
    image.addEventListener("load", scrollToRenderedSectionHash, { once: true });
  }
}

function renderLogic(chain) {
  const root = document.querySelector("#logicGrid");
  const tracksRoot = document.querySelector("#logicTracks");
  root.innerHTML = "";
  tracksRoot.innerHTML = "";

  if (chain.logic.length) {
    root.append(el("div", "logic-section-label", "基准逻辑"));
  }
  chain.logic.forEach((item, index) => {
    const card = el("article", "logic-card");
    card.dataset.searchTarget = searchTargetKey(chain.id, "logic", index);
    const colors = ["var(--cyan)", "var(--amber)", "var(--green)", "#a78bfa"];
    card.style.borderColor = colors[index % colors.length];
    card.append(el("h3", "", `${index + 1}. ${item.title}`));
    card.append(el("p", "", item.body));
    root.append(card);
  });

  if ((chain.logicTracks || []).length) {
    tracksRoot.append(el("div", "logic-section-label recent", "近期研究逻辑"));
  }
  (chain.logicTracks || []).forEach((track) => {
    const logicTrack = el("section", "logic-track");
    logicTrack.id = `logic-track-${track.id}`;
    logicTrack.append(el("span", "logic-track-label", "近期资料提炼"));
    logicTrack.append(el("h3", "", track.title));
    logicTrack.append(el("p", "", track.summary));
    if (track.coreInsights?.length) {
      logicTrack.append(renderCoreInsights(track.id, track.coreInsights));
    }
    if (track.propagation?.nodes?.length) {
      logicTrack.append(renderPropagationPath(track.propagation));
    }
    tracksRoot.append(logicTrack);
  });
}

function renderStockCamp(chain) {
  const summary = document.querySelector("#stockCampSummary");
  const filters = document.querySelector("#stockCampFilters");
  const root = document.querySelector("#stockCampGrid");
  const stocks = buildStockCamp(chain);
  const mappedCount = stocks.filter((item) => item.security?.quoteUrl).length;
  const logicCount = stocks.filter((item) => item.logicCards.length).length;
  const latestResearchDate = stocks
    .map((item) => item.latestResearchDate)
    .filter(Boolean)
    .sort((left, right) => right.localeCompare(left))[0] || "暂无";

  summary.innerHTML = `
    <article>
      <span>股票池公司</span>
      <strong>${stocks.length}</strong>
      <p>来自产业链骨架、核心逻辑和研究包逻辑卡。</p>
    </article>
    <article>
      <span>已有行情入口</span>
      <strong>${mappedCount}</strong>
      <p>已匹配 A 股证券代码，可打开外部 K 线。</p>
    </article>
    <article>
      <span>关联研究逻辑</span>
      <strong>${logicCount}</strong>
      <p>可回到具体逻辑卡和研究日期进行对照。</p>
    </article>
    <article>
      <span>最新研究日期</span>
      <strong>${escapeHtml(latestResearchDate)}</strong>
      <p>用于观察逻辑提出后的阶段走势。</p>
    </article>
  `;

  const filterOptions = [
    ["all", "全部"],
    ["quoted", "已有行情"],
    ["logic", "有关联逻辑"],
    ["unmapped", "待补代码"]
  ];
  const activeFilter = filterOptions.some(([key]) => key === activeStockCampFilterByChain.get(chain.id))
    ? activeStockCampFilterByChain.get(chain.id)
    : "all";
  activeStockCampFilterByChain.set(chain.id, activeFilter);
  filters.innerHTML = "";
  filterOptions.forEach(([key, label]) => {
    const count = filterStockCamp(stocks, key).length;
    const button = el("button", key === activeFilter ? "active" : "", `${escapeHtml(label)} <span>${count}</span>`);
    button.type = "button";
    button.addEventListener("click", () => {
      activeStockCampFilterByChain.set(chain.id, key);
      renderStockCamp(chain);
    });
    filters.append(button);
  });

  const visibleStocks = filterStockCamp(stocks, activeFilter);
  root.innerHTML = visibleStocks.length ? "" : `
    <div class="stock-camp-empty">
      <strong>暂无匹配公司</strong>
      <p>切换筛选条件，或先为产业链公司补充证券代码。</p>
    </div>
  `;

  visibleStocks.forEach((stock) => {
    const card = el("article", `stock-card${stock.security?.quoteUrl ? " has-quote" : ""}`);
    card.dataset.searchTarget = searchTargetKey(chain.id, "stock", stock.name);
    const quoteAction = stock.security?.quoteUrl
      ? `<a href="${escapeHtml(stock.security.quoteUrl)}" target="_blank" rel="noopener noreferrer">打开新浪 K 线</a>`
      : `<span class="stock-quote-pending">待补证券代码</span>`;
    const logicPreview = stock.logicCards.slice(0, 2).map((item) => `
      <button type="button" data-logic-chain="${escapeHtml(item.chainId)}" data-logic-target="${escapeHtml(item.target)}">
        <time>${escapeHtml(item.researchDate || "日期待补充")}</time>
        <span>${escapeHtml(item.title)}</span>
      </button>
    `).join("");
    card.innerHTML = `
      <div class="stock-card-head">
        <button class="stock-company-name" type="button" data-company="${escapeHtml(stock.name)}">${escapeHtml(stock.name)}</button>
        <span class="stock-security ${stock.security?.quoteUrl ? "mapped" : "pending"}">
          ${stock.security ? `${escapeHtml(stock.security.exchangeLabel)} · ${escapeHtml(stock.security.ticker)}` : "代码待补"}
        </span>
      </div>
      <p>${escapeHtml(stock.primarySegment || "产业链公司")} · ${escapeHtml(stock.primarySection || chain.shortTitle || chain.title)}</p>
      <div class="stock-card-meta">
        <span>${stock.appearances.length} 个环节</span>
        <span>${stock.logicCards.length} 条逻辑</span>
        <span>研究日期：${escapeHtml(stock.latestResearchDate || "暂无")}</span>
      </div>
      ${stock.logicCards.length ? `<div class="stock-logic-links">${logicPreview}</div>` : ""}
      <div class="stock-card-actions">
        <button type="button" data-company="${escapeHtml(stock.name)}">查看公司卡</button>
        ${quoteAction}
      </div>
    `;
    card.querySelectorAll("[data-company]").forEach((button) => {
      button.addEventListener("click", () => openCompanyPanel(button.dataset.company));
    });
    card.querySelectorAll("[data-logic-target]").forEach((button) => {
      button.addEventListener("click", () => {
        setChain(button.dataset.logicChain);
        window.requestAnimationFrame(() => {
          flashAndScroll(document.getElementById(button.dataset.logicTarget), "center");
        });
      });
    });
    root.append(card);
  });
}

function filterStockCamp(stocks, filter) {
  if (filter === "quoted") return stocks.filter((item) => item.security?.quoteUrl);
  if (filter === "logic") return stocks.filter((item) => item.logicCards.length);
  if (filter === "unmapped") return stocks.filter((item) => !item.security?.quoteUrl);
  return stocks;
}

function buildStockCamp(chain) {
  const companies = new Map();
  const ensureCompany = (name) => {
    const cleaned = normalizeCompanyName(name);
    if (!isStockCampCompany(cleaned)) return null;
    if (!companies.has(cleaned)) {
      companies.set(cleaned, {
        name: cleaned,
        appearances: [],
        logicCards: []
      });
    }
    return companies.get(cleaned);
  };

  chain.chain.forEach((section, sectionIndex) => {
    const items = section.items || section.segments || [];
    items.forEach((item, itemIndex) => {
      splitCompanies(item.companies).forEach((name) => {
        const company = ensureCompany(name);
        if (!company) return;
        company.appearances.push({
          chainId: chain.id,
          chainTitle: chain.title,
          target: searchTargetKey(chain.id, "chain-item", `${sectionIndex}-${itemIndex}`),
          section: section.title || section.name,
          segment: item.name,
          detail: item.detail || item.logic || ""
        });
      });
    });
  });

  chain.logic.forEach((logic, logicIndex) => {
    splitCompanies(logic.companies).forEach((name) => {
      const company = ensureCompany(name);
      if (!company) return;
      company.appearances.push({
        chainId: chain.id,
        chainTitle: chain.title,
        target: searchTargetKey(chain.id, "logic", logicIndex),
        section: "核心逻辑",
        segment: logic.title,
        detail: logic.body || ""
      });
    });
  });

  (chain.logicTracks || []).forEach((track) => {
    (track.coreInsights || []).forEach((insight) => {
      const logicCompanies = (insight.attachments || [])
        .filter((attachment) => attachment.type === "company")
        .map((attachment) => attachment.label);
      logicCompanies.forEach((name) => {
        const company = ensureCompany(name);
        if (!company) return;
        company.logicCards.push({
          chainId: chain.id,
          trackTitle: track.title,
          title: insight.title,
          summary: insight.summary,
          researchDate: insight.researchDate || "",
          target: `logic-card-${track.id}-${insight.id}`
        });
      });
    });
  });

  return [...companies.values()].map((company) => {
    const uniqueAppearances = dedupeBy(company.appearances, (item) =>
      `${item.chainId}:${item.target}:${item.segment}`
    );
    const uniqueLogicCards = dedupeBy(company.logicCards, (item) =>
      `${item.chainId}:${item.target}`
    );
    const firstAppearance = uniqueAppearances[0] || {};
    const latestResearchDate = uniqueLogicCards
      .map((item) => item.researchDate)
      .filter(Boolean)
      .sort((left, right) => right.localeCompare(left))[0] || "";
    return {
      ...company,
      appearances: uniqueAppearances,
      logicCards: uniqueLogicCards,
      security: companySecurity(company.name),
      primarySection: firstAppearance.section || "",
      primarySegment: firstAppearance.segment || "",
      latestResearchDate
    };
  }).sort((left, right) =>
    Number(Boolean(right.security?.quoteUrl)) - Number(Boolean(left.security?.quoteUrl)) ||
    right.logicCards.length - left.logicCards.length ||
    right.appearances.length - left.appearances.length ||
    left.name.localeCompare(right.name, "zh-CN")
  );
}

function normalizeCompanyName(value) {
  return String(value || "")
    .replace(/（.*?）|\(.*?\)/g, "")
    .replace(/等$/, "")
    .trim();
}

function isStockCampCompany(value) {
  if (!value || value.length < 2) return false;
  if (/^(待补充|相关公司|供应商|客户|产业链公司)$/.test(value)) return false;
  if (/周期|长达|基础设施|本轮|生态|服务器|数据中心|训练|推理|行业应用|供应链/.test(value)) return false;
  if (value.length > 12 && !/[A-Za-z]/.test(value)) return false;
  return true;
}

function dedupeBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderTrackingProfile(chain) {
  const profile = chain.trackingProfile;
  const title = document.querySelector("#trackingTitle");
  const summary = document.querySelector("#trackingSummary");
  const filters = document.querySelector("#trackingFilters");
  const root = document.querySelector("#trackingGrid");

  title.textContent = profile?.title || `${chain.title}专属动态追踪`;
  summary.textContent = profile?.summary || "围绕这条产业链独有的供需、价格、认证和订单变量持续更新。";
  const metrics = profile?.metrics || [];
  const groups = [...new Set(metrics.map((item) => item.topicTitle || "产业链基准"))];
  const preferredGroup = groups.find((group) => group !== "产业链基准") || groups[0];
  const activeGroup = groups.includes(activeTrackingGroupByChain.get(chain.id))
    ? activeTrackingGroupByChain.get(chain.id)
    : preferredGroup;
  activeTrackingGroupByChain.set(chain.id, activeGroup);
  filters.innerHTML = "";
  groups.forEach((group) => {
    const count = metrics.filter((item) => (item.topicTitle || "产业链基准") === group).length;
    const button = el("button", group === activeGroup ? "active" : "", `${escapeHtml(group)} <span>${count}</span>`);
    button.type = "button";
    button.addEventListener("click", () => {
      activeTrackingGroupByChain.set(chain.id, group);
      renderTrackingProfile(chain);
    });
    filters.append(button);
  });
  root.innerHTML = "";

  metrics
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => (item.topicTitle || "产业链基准") === activeGroup)
    .forEach(({ item, index }) => {
    const card = el("article", "tracking-card");
    card.dataset.searchTarget = searchTargetKey(chain.id, "tracking", index);
    const verification = item.latestVerification;
    const evidence = findTrackingEvidence(chain, item);
    const colors = ["var(--cyan)", "var(--amber)", "var(--green)", "var(--blue)", "#a78bfa"];
    card.style.borderColor = colors[index % colors.length];
    card.append(el(
      "div",
      "tracking-card-state",
      verification
        ? `<span>${escapeHtml(verificationResultLabel(verification.result))}</span><time>${escapeHtml(verification.date)}</time>`
        : evidence
        ? `<span>${escapeHtml(evidence.item.type || "动态")}</span><time>${escapeHtml(evidence.item.date)}</time>`
        : `<span>${escapeHtml(trackingStatusLabel(item.executionStatus))}</span><time>${escapeHtml(item.updatedAt?.slice(0, 10) || "暂无新证据")}</time>`
    ));
    if (item.topicTitle) {
      card.append(el("div", "tracking-card-topic", `${escapeHtml(item.topicTitle)} · ${escapeHtml(item.logicTitle || "")}`));
    }
    card.append(el("h3", "", item.name));
    card.append(el("p", "", item.why));
    if (verification) {
      const latest = el("aside", `tracking-latest verification-${verification.result}`);
      latest.append(el("strong", "", verification.summary));
      latest.append(el("p", "", verification.notes || "该证据已由维护者核验并归档。"));
      const link = el("a", "", verification.sourceTitle || "查看核验来源");
      link.href = verification.sourceUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      latest.append(link);
      card.append(latest);
      if (item.verificationHistory?.length > 1) {
        const history = el("details", "tracking-verification-history");
        history.append(el("summary", "", `查看全部 ${item.verificationHistory.length} 次核验`));
        history.append(el("ol", "", item.verificationHistory.map((record) => `
          <li>
            <time>${escapeHtml(record.date)}</time>
            <strong>${escapeHtml(verificationResultLabel(record.result))}</strong>
            <span>${escapeHtml(record.summary)}</span>
          </li>
        `).join("")));
        card.append(history);
      }
    } else if (evidence) {
      const latest = el("aside", "tracking-latest");
      latest.append(el("strong", "", evidence.item.signal));
      latest.append(el("p", "", evidence.item.impact));
      const link = el("a", "", "查看这条变化");
      link.href = `#${evidence.id}`;
      latest.append(link);
      card.append(latest);
    } else if (item.dataSources?.length) {
      const source = item.dataSources[0];
      const latest = el("aside", "tracking-latest pending");
      latest.append(el("strong", "", `等待 ${source.providers.join("、") || "指定来源"} 的${source.document || "数据"}`));
      latest.append(el("p", "", `更新频率：${source.frequency || "待确定"}；当前尚未采集到验证结果。`));
      card.append(latest);
    }
    card.append(el(
      "div",
      "tracking-signals",
      item.signals.map((signal) => `<span>${escapeHtml(signal)}</span>`).join("")
    ));
    root.append(card);
  });
}

function verificationResultLabel(result) {
  return {
    strengthen: "逻辑强化",
    stable: "逻辑稳定",
    weaken: "逻辑减弱",
    challenge: "出现反证",
    invalidate: "逻辑失效"
  }[result] || "待判断";
}

function trackingStatusLabel(status) {
  return {
    active: "监控中",
    planned: "待接入",
    paused: "已暂停",
    retired: "已结束"
  }[status] || "持续观察";
}

function renderTimeline(chain) {
  const root = document.querySelector("#timeline");
  root.innerHTML = "";

  chain.updates
    .map((item, index) => ({ item, index }))
    .sort((a, b) => b.item.date.localeCompare(a.item.date) || b.index - a.index)
    .forEach(({ item, index }) => {
    const card = el("article", "timeline-item");
    card.id = `update-${chain.id}-${index}`;
    card.dataset.searchTarget = searchTargetKey(chain.id, "update", index);
    card.append(el(
      "div",
      "timeline-meta",
      `<span>${escapeHtml(item.date)}</span><span class="update-type">${escapeHtml(item.type || "产业事件")}</span><span class="update-source-kind">${escapeHtml(item.sourceKind || "资料")} · ${escapeHtml(item.sourcePlatform || "公开来源")}</span><span class="tag">${escapeHtml(item.segment)}</span><span>${escapeHtml(item.confidence)}</span>`
    ));
    card.append(el("h3", "", item.signal));
    card.append(el("p", "", item.impact));
    if (item.propagation?.nodes?.length) {
      card.append(renderPropagationPath(item.propagation));
    }
    if (item.logicTrack) {
      const relation = el("aside", "timeline-logic-relation");
      relation.append(el("span", "", `关联逻辑 · ${item.logicTrack.role}`));
      relation.append(el("strong", "", logicTrackTitle(chain, item.logicTrack.id)));
      relation.append(el("p", "", item.logicTrack.contribution));
      const logicLink = el("a", "", "查看核心逻辑");
      logicLink.href = `#logic-track-${item.logicTrack.id}`;
      relation.append(logicLink);
      card.append(relation);
    }
    card.append(el("p", "", item.notes));
    const actions = el("div", "timeline-actions");
    const source = el("a", "source", sourceActionLabel(item));
    source.href = item.sourceKind === "文章" ? buildReadingUrl(item.sourceUrl) : item.sourceUrl;
    source.title = item.sourceTitle;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    actions.append(source);
    card.append(actions);
    root.append(card);
  });
}

function findTrackingEvidence(chain, metric) {
  const terms = [
    metric.name,
    ...(metric.signals || [])
  ].flatMap(trackingKeywords);
  return chain.updates
    .filter((item) => !item.derivedFromPackage)
    .filter((item) => !metric.topicTitle || item.segment === metric.topicTitle)
    .map((item, index) => ({
      item,
      index,
      id: `update-${chain.id}-${index}`,
      text: normalize(compactText([
        item.type, item.segment, item.signal, item.impact, item.notes
      ]))
    }))
    .filter((entry) => terms.some((term) => entry.text.includes(term)))
    .sort((left, right) =>
      right.item.date.localeCompare(left.item.date) || right.index - left.index
    )[0] || null;
}

function trackingKeywords(value) {
  const normalized = normalize(value);
  const keywords = new Set([normalized]);
  normalized
    .split(/[、，,/+与和及\s-]+/)
    .filter(Boolean)
    .forEach((part) => keywords.add(part));
  const latin = normalized.match(/[a-z]+\d*(?:\/[a-z]*\d+)*/g) || [];
  latin.forEach((part) => keywords.add(part));
  const chinese = normalized.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  chinese.forEach((part) => {
    keywords.add(part);
    if (part.length >= 4) keywords.add(part.slice(0, 2));
  });
  return [...keywords].filter((term) => term.length >= 2);
}

function renderResearch(chain) {
  const root = document.querySelector("#researchFeed");
  root.innerHTML = "";
  const logicCards = (chain.logicTracks || []).flatMap((track) =>
    (track.coreInsights || []).map((card) => ({ ...card, trackTitle: track.title }))
  );

  const sources = [...(chain.sources || [])].sort((left, right) =>
    String(right.date || "").localeCompare(String(left.date || "")) ||
    String(right.createdAt || "").localeCompare(String(left.createdAt || ""))
  );

  if (!sources.length) {
    root.append(el("p", "research-empty", "暂时没有独立研究资料。"));
    return;
  }

  sources.forEach((source, index) => {
    const relatedCards = logicCards.filter((card) =>
      (card.sources || []).some((reference) =>
        normalizeResearchUrl(reference.url) === normalizeResearchUrl(source.markdownUrl) ||
        normalizeResearchUrl(reference.url) === normalizeResearchUrl(source.originalUrl) ||
        reference.title === source.title
      )
    );
    const card = el("article", "research-card");
    if (index === 0) card.classList.add("latest");
    card.innerHTML = `
      <div class="research-card-meta">
        <span>${escapeHtml(researchTypeLabel(source.type))}</span>
        <time>${escapeHtml(source.date || "")}</time>
        ${index === 0 ? "<strong>NEW</strong>" : ""}
      </div>
      <h3>${escapeHtml(source.title)}</h3>
      <p>${escapeHtml(source.summary || "已归档，等待进一步整理。")}</p>
      <div class="research-card-tags">
        ${source.segment ? `<span>${escapeHtml(source.segment)}</span>` : ""}
        ${(source.companies || []).slice(0, 3).map((company) => `<span>${escapeHtml(company)}</span>`).join("")}
      </div>
      <div class="research-card-result">
        ${relatedCards.length
          ? `<strong>提炼出 ${relatedCards.length} 张逻辑卡</strong><span>${escapeHtml([...new Set(relatedCards.map((item) => item.trackTitle))].join(" · "))}</span>`
          : "<strong>资料已归档</strong><span>尚未提炼逻辑卡</span>"}
      </div>
    `;
    const actions = el("div", "research-card-actions");
    if (source.markdownUrl) {
      const read = el("a", "", "阅读文章");
      read.href = buildReadingUrl(source.markdownUrl);
      read.target = "_blank";
      read.rel = "noopener noreferrer";
      actions.append(read);
    }
    if (source.originalUrl) {
      const original = el("a", "", source.type === "short-video" ? "打开视频" : "查看原始来源");
      original.href = source.originalUrl;
      original.target = "_blank";
      original.rel = "noopener noreferrer";
      actions.append(original);
    }
    if (relatedCards.length) {
      const logic = el("a", "", "查看提炼逻辑");
      const track = (chain.logicTracks || []).find((item) =>
        item.coreInsights?.some((insight) => relatedCards.some((card) => card.id === insight.id))
      );
      logic.href = track ? `#logic-track-${track.id}` : "#logic";
      actions.append(logic);
    }
    card.append(actions);
    root.append(card);
  });
}

function setActivityTab(name) {
  document.querySelectorAll("[data-activity-tab]").forEach((button) => {
    const active = button.dataset.activityTab === name;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll("[data-activity-panel]").forEach((panel) => {
    const active = panel.dataset.activityPanel === name;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });
}

function initActivityTabs() {
  document.querySelectorAll("[data-activity-tab]").forEach((button) => {
    button.addEventListener("click", () => setActivityTab(button.dataset.activityTab));
  });
}

function normalizeResearchUrl(value) {
  return String(value || "").trim().replace(/^\.?\//, "");
}

function researchTypeLabel(type) {
  return {
    "research-article": "研究文章",
    "short-video": "短视频",
    wechat: "公众号",
    weibo: "微博",
    announcement: "公司公告",
    report: "研报",
    news: "新闻"
  }[type] || "研究资料";
}

function renderCoreInsights(trackId, insights) {
  const section = el("section", "logic-insights");
  const header = el("div", "logic-insights-head");
  header.append(el("span", "", "本次资料提炼"));
  header.append(el("strong", "", "先理解核心逻辑，再观察它如何变化"));
  section.append(header);

  const grid = el("div", "logic-insights-grid");
  insights.forEach((insight, index) => {
    const card = el("article", `logic-insight display-${insight.display || "text"}`);
    card.id = `logic-card-${trackId}-${insight.id || index}`;
    card.dataset.searchTarget = searchTargetKey(currentId, "logic-card", `${trackId}-${insight.id || index}`);
    card.append(el("span", "logic-insight-index", String(index + 1).padStart(2, "0")));
    card.append(el("div", "logic-insight-kicker", insight.kicker));
    card.append(el("h4", "", insight.title));
    card.append(el("p", "logic-insight-summary", insight.summary));

    if (insight.points?.length) {
      const points = el("div", "logic-insight-points");
      insight.points.forEach((point) => {
        const item = el("div", "logic-insight-point");
        item.append(el("strong", "", point.label));
        item.append(el("span", "", point.description));
        points.append(item);
      });
      card.append(points);
    }

    if (insight.metrics?.length) {
      const metrics = el("div", "logic-insight-metrics");
      insight.metrics.forEach((metric) => {
        const row = el("div", "logic-insight-metric");
        row.innerHTML = `
          <div><strong>${escapeHtml(metric.label)}</strong><span>${escapeHtml(metric.value)}</span></div>
          <div class="logic-metric-track"><i style="width:${Math.max(4, Math.min(100, Number(metric.scale) || 0))}%"></i></div>
          <small>${escapeHtml(metric.description)}</small>
        `;
        metrics.append(row);
      });
      card.append(metrics);
    }

    if (insight.formula?.length) {
      const formula = el("div", "logic-insight-formula");
      insight.formula.forEach((part, partIndex) => {
        formula.append(el("strong", "", part));
        if (partIndex < insight.formula.length - 1) formula.append(el("span", "", "×"));
      });
      card.append(formula);
    }

    if (insight.comparison?.length) {
      const comparison = el("div", "logic-insight-comparison");
      insight.comparison.forEach((company) => {
        const column = el("div", "logic-company");
        column.append(el("strong", "", company.name));
        column.append(el("span", "", company.position));
        column.append(el("p", "", company.reason));
        comparison.append(column);
      });
      card.append(comparison);
    }

    if (insight.table?.columns?.length && insight.table?.rows?.length) {
      const tableWrap = el("div", "logic-insight-table-wrap");
      const table = el("table", "logic-insight-table");
      table.innerHTML = `
        <thead><tr>${insight.table.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead>
        <tbody>
          ${insight.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
        </tbody>
      `;
      tableWrap.append(table);
      card.append(tableWrap);
    }

    if (insight.conclusion) {
      card.append(el("p", "logic-insight-conclusion", insight.conclusion));
    }

    if (insight.attachments?.length || insight.sources?.length) {
      const footer = el("div", "logic-insight-footer");
      insight.attachments?.forEach((attachment) => {
        const chip = el("button", "logic-attachment", attachment.label);
        chip.type = "button";
        if (attachment.type === "company") {
          chip.addEventListener("click", () => openCompanyPanel(attachment.label));
        } else if (attachment.target) {
          chip.addEventListener("click", () => scrollToSearchTarget(attachment.target));
        } else {
          chip.disabled = true;
        }
        footer.append(chip);
      });
      insight.sources?.forEach((source) => {
        const link = el("a", "logic-source", source.label);
        link.href = source.type === "article"
          ? buildReadingUrl(source.url, source.anchor)
          : source.url;
        link.title = source.title || source.label;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        footer.append(link);
      });
      card.append(footer);
    }
    grid.append(card);
  });
  section.append(grid);
  return section;
}

function logicTrackTitle(chain, id) {
  return chain.logicTracks?.find((track) => track.id === id)?.title || "关联逻辑";
}

function sourceActionLabel(item) {
  if (item.sourceKind === "短视频") {
    const platform = item.sourcePlatform === "Douyin" ? "抖音" : item.sourcePlatform || "";
    return `打开${platform}视频`;
  }
  if (item.sourceKind === "文章") return "阅读全文";
  return item.sourceTitle;
}

function renderPropagationPath(propagation) {
  const section = el("section", "propagation");
  const header = el("div", "propagation-head");
  header.append(el("strong", "", escapeHtml(propagation.title)));
  header.append(el("p", "", escapeHtml(propagation.summary)));
  section.append(header);

  const path = el("div", "propagation-path");
  propagation.nodes.forEach((node, index) => {
    const step = el("button", `propagation-node state-${propagationStateClass(node.state)}`);
    step.type = "button";
    step.disabled = !node.target;
    step.innerHTML = `
      <span class="propagation-state">${escapeHtml(node.state)}</span>
      <strong>${escapeHtml(node.label)}</strong>
      <small>${escapeHtml(node.description)}</small>
    `;
    if (node.target) {
      step.title = "查看产业链对应位置";
      step.addEventListener("click", () => scrollToSearchTarget(node.target));
    }
    path.append(step);
    if (index < propagation.nodes.length - 1) {
      path.append(el("span", "propagation-arrow", "→"));
    }
  });
  section.append(path);

  if (propagation.changeSignals?.length) {
    const signals = el("div", "propagation-signals");
    signals.append(el("strong", "propagation-subtitle", "逻辑终结与反转条件"));
    const grid = el("div", "propagation-signal-grid");
    propagation.changeSignals.forEach((signal) => {
      const card = el(signal.target ? "button" : "article", "propagation-signal");
      if (signal.target) {
        card.type = "button";
        card.title = "查看产业链对应位置";
        card.addEventListener("click", () => scrollToSearchTarget(signal.target));
      }
      card.innerHTML = `
        <span>${escapeHtml(signal.state)}</span>
        <strong>${escapeHtml(signal.label)}</strong>
        <p>${escapeHtml(signal.description)}</p>
        <small>跟踪：${escapeHtml(signal.metric)}</small>
      `;
      grid.append(card);
    });
    signals.append(grid);
    section.append(signals);
  }

  if (propagation.verificationNotes?.length) {
    const boundary = el("details", "propagation-boundary");
    boundary.append(el("summary", "", "核验边界"));
    boundary.append(el(
      "ul",
      "",
      propagation.verificationNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")
    ));
    section.append(boundary);
  }

  return section;
}

function propagationStateClass(state) {
  return {
    "来源观点": "source",
    "逻辑推演": "inference",
    "待验证": "pending",
    "已验证": "verified"
  }[state] || "pending";
}

function renderWatchlist(chain) {
  const root = document.querySelector("#watchlist");
  root.innerHTML = "";

  chain.watchlist.forEach((item, index) => {
    const block = el("div", "watch-item");
    block.dataset.searchTarget = searchTargetKey(chain.id, "watch", index);
    block.append(el("strong", "", item.segment));
    block.append(el("p", "watch-purpose", "用于验证相关供需、价格、订单或盈利逻辑是否继续成立。"));
    block.append(el(
      "div",
      "watch-signals",
      item.signals.map((signal) => `<span>${escapeHtml(signal)}</span>`).join("")
    ));
    block.append(el("p", "watch-companies", item.companies));
    root.append(block);
  });
}

function render() {
  const chain = activeChain();
  document.querySelector("#updatedAt").textContent = `更新：${library.meta.updated}`;
  renderWebUserPanels(chain);
  renderIndustryGrid(chain);
  renderCurrent(chain);
  renderChain(chain);
  renderWorkbench(chain);
  renderDiagram(chain);
  renderTrackingProfile(chain);
  renderTimeline(chain);
  renderResearch(chain);
  renderStockCamp(chain);
  renderLogic(chain);
  renderWatchlist(chain);
  renderArticle(chain);
  scrollToRenderedSectionHash();
}

function initSearch() {
  createSearchIndex();
  createCompanyIndex();
  createTopicIndex();
  searchInput = document.querySelector("#librarySearch");
  const clear = document.querySelector("#clearSearch");
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  activeSearchType = params.get("type") || "全部";

  searchInput.value = initialQuery;
  searchInput.addEventListener("input", () => renderSearchResults(searchInput.value));
  clear.addEventListener("click", () => {
    searchInput.value = "";
    renderSearchResults("");
    searchInput.focus();
  });

  if (initialQuery) renderSearchResults(initialQuery);
}

loadCachedUserProfile();
fetchUserProfile().then(() => render());
initSearch();
initActivityTabs();
render();
