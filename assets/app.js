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
  if (!["chain", "updates", "research", "logic", "verification", "article"].includes(id)) return;
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
  const panel = document.querySelector("#companyPanel");

  panel.innerHTML = `
    <div class="company-panel-backdrop" data-close="company"></div>
    <section class="company-panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(company)} 公司卡片">
      <button class="company-panel-close" type="button" data-close="company" aria-label="关闭">×</button>
      <p class="eyebrow">Company</p>
      <h2>${escapeHtml(company)}</h2>
      <p>该公司在产业链研究库中出现 ${appearances.length} 次。</p>
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
          target: `logic-card-${track.id}-${insight.id}`
        }))
    )
  );
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

function renderCurrent(chain) {
  document.querySelector("#currentTitle").textContent = chain.title;
  document.querySelector("#currentTheme").textContent = chain.theme;

  const quick = document.querySelector("#quickLinks");
  quick.innerHTML = "";
  [
    ["产业链骨架", "#chain"],
    ["动态追踪", "#updates"],
    ["最新研究", "#research"],
    ["核心逻辑", "#logic"],
    ["观察与验证", "#verification"],
    ["原文阅读", "#article"],
  ].forEach(([label, href]) => {
    const link = el("a", "button", label);
    link.href = href;
    quick.append(link);
  });
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

  chain.logic.forEach((item, index) => {
    const card = el("article", "logic-card");
    card.dataset.searchTarget = searchTargetKey(chain.id, "logic", index);
    const colors = ["var(--cyan)", "var(--amber)", "var(--green)", "#a78bfa"];
    card.style.borderColor = colors[index % colors.length];
    card.append(el("h3", "", `${index + 1}. ${item.title}`));
    card.append(el("p", "", item.body));
    root.append(card);
  });

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

function renderTrackingProfile(chain) {
  const profile = chain.trackingProfile;
  const title = document.querySelector("#trackingTitle");
  const summary = document.querySelector("#trackingSummary");
  const root = document.querySelector("#trackingGrid");

  title.textContent = profile?.title || `${chain.title}专属动态追踪`;
  summary.textContent = profile?.summary || "围绕这条产业链独有的供需、价格、认证和订单变量持续更新。";
  root.innerHTML = "";

  (profile?.metrics || []).forEach((item, index) => {
    const card = el("article", "tracking-card");
    card.dataset.searchTarget = searchTargetKey(chain.id, "tracking", index);
    const evidence = findTrackingEvidence(chain, item);
    const colors = ["var(--cyan)", "var(--amber)", "var(--green)", "var(--blue)", "#a78bfa"];
    card.style.borderColor = colors[index % colors.length];
    card.append(el(
      "div",
      "tracking-card-state",
      evidence
        ? `<span>${escapeHtml(evidence.item.type || "动态")}</span><time>${escapeHtml(evidence.item.date)}</time>`
        : "<span>持续观察</span><time>暂无新证据</time>"
    ));
    card.append(el("h3", "", item.name));
    card.append(el("p", "", item.why));
    if (evidence) {
      const latest = el("aside", "tracking-latest");
      latest.append(el("strong", "", evidence.item.signal));
      latest.append(el("p", "", evidence.item.impact));
      const link = el("a", "", "查看这条变化");
      link.href = `#${evidence.id}`;
      latest.append(link);
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
  renderIndustryGrid(chain);
  renderCurrent(chain);
  renderChain(chain);
  renderDiagram(chain);
  renderTrackingProfile(chain);
  renderTimeline(chain);
  renderResearch(chain);
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

initSearch();
render();
