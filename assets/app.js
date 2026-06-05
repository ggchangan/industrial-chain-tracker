const library = window.INDUSTRY_CHAIN_LIBRARY;
let currentId = new URLSearchParams(window.location.search).get("chain") || library.chains[0].id;

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
  const url = new URL(window.location.href);
  url.searchParams.set("chain", id);
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
        <span>原稿</span>
        <strong>${escapeHtml(meta.title || chain.title)}</strong>
      </div>
      <div>
        <span>创建</span>
        <strong>${escapeHtml(meta.created || library.meta.updated)}</strong>
      </div>
      <div>
        <span>状态</span>
        <strong>${escapeHtml(meta.status || "raw")}</strong>
      </div>
      <a href="${escapeHtml(chain.article)}">打开 Markdown 原稿</a>
      ${tags.length ? `<div class="article-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
    </div>
  `;
}

function scrollToArticleHash() {
  if (!window.location.hash) return;

  const id = decodeURIComponent(window.location.hash.slice(1));
  const target = document.getElementById(id);
  if (target?.classList.contains("article-heading")) {
    window.setTimeout(() => target.scrollIntoView({ block: "start" }), 60);
  }
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
    const markdown = await loadTextResource(chain.article);
    if (requestId !== articleRequestId) return;

    const rendered = renderMarkdownArticle(markdown);
    view.innerHTML = `${renderArticleMeta(rendered.meta, chain)}${rendered.html}`;
    renderArticleToc(rendered.toc);
    watchArticleHeadings();
    scrollToArticleHash();
    consumePendingArticleTarget(chain.id);
  } catch (error) {
    view.innerHTML = `
      <div class="article-error">
        <strong>原文加载失败</strong>
        <p>请通过资料库打开 Markdown 原稿：<a href="${escapeHtml(chain.article)}">${escapeHtml(chain.article.replace("./", ""))}</a></p>
        <p>${escapeHtml(error.message)}</p>
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
      <span>${item.status}</span>
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
  document.querySelector("#diagramCaption").textContent = `${chain.title}正文配图，适合放进公众号文章用于快速建立产业链地图。`;

  const quick = document.querySelector("#quickLinks");
  quick.innerHTML = "";
  [
    ["原文阅读", "#article"],
    ["原稿文件", chain.article],
    ["Cover图", chain.cover],
    ["产业链图", chain.diagram],
    ["动态数据", chain.updateFile]
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
  link.href = chain.diagram;
  image.src = chain.diagram;
  image.alt = `${chain.title}全景与价值传导图`;
}

function renderLogic(chain) {
  const root = document.querySelector("#logicGrid");
  root.innerHTML = "";

  chain.logic.forEach((item, index) => {
    const card = el("article", "logic-card");
    card.dataset.searchTarget = searchTargetKey(chain.id, "logic", index);
    const colors = ["var(--cyan)", "var(--amber)", "var(--green)", "#a78bfa"];
    card.style.borderColor = colors[index % colors.length];
    card.append(el("h3", "", `${index + 1}. ${item.title}`));
    card.append(el("p", "", item.body));
    root.append(card);
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
    const colors = ["var(--cyan)", "var(--amber)", "var(--green)", "var(--blue)", "#a78bfa"];
    card.style.borderColor = colors[index % colors.length];
    card.append(el("h3", "", item.name));
    card.append(el("p", "", item.why));
    card.append(el("ul", "", item.signals.map((signal) => `<li>${signal}</li>`).join("")));
    root.append(card);
  });
}

function renderTimeline(chain) {
  const root = document.querySelector("#timeline");
  root.innerHTML = "";

  chain.updates.forEach((item, index) => {
    const card = el("article", "timeline-item");
    card.dataset.searchTarget = searchTargetKey(chain.id, "update", index);
    card.append(el("div", "timeline-meta", `<span>${item.date}</span><span class="tag">${item.segment}</span><span>${item.confidence}</span>`));
    card.append(el("h3", "", item.signal));
    card.append(el("p", "", item.impact));
    card.append(el("p", "", item.notes));
    const source = el("a", "source", item.sourceTitle);
    source.href = item.sourceUrl;
    card.append(source);
    root.append(card);
  });
}

function renderWatchlist(chain) {
  const root = document.querySelector("#watchlist");
  root.innerHTML = "";

  chain.watchlist.forEach((item, index) => {
    const block = el("div", "watch-item");
    block.dataset.searchTarget = searchTargetKey(chain.id, "watch", index);
    block.append(el("strong", "", item.segment));
    block.append(el("ul", "", item.signals.map((signal) => `<li>${signal}</li>`).join("")));
    block.append(el("p", "", item.companies));
    root.append(block);
  });
}

function renderFiles(chain) {
  const root = document.querySelector("#fileGrid");
  root.innerHTML = "";

  [
    ["原始文章", chain.article],
    ["动态数据", chain.updateFile],
    ["公众号封面", chain.cover],
    ["产业链图 PNG", chain.diagram],
    ["产业链图 SVG", chain.diagramSvg]
  ].forEach(([label, href]) => {
    const link = el("a", "", `<span>${label}</span><strong>${href.replace("./", "")}</strong>`);
    link.href = href;
    root.append(link);
  });
}

function render() {
  const chain = activeChain();
  document.querySelector("#updatedAt").textContent = `更新：${library.meta.updated}`;
  renderIndustryGrid(chain);
  renderCurrent(chain);
  renderChain(chain);
  renderDiagram(chain);
  renderLogic(chain);
  renderTrackingProfile(chain);
  renderTimeline(chain);
  renderWatchlist(chain);
  renderFiles(chain);
  renderArticle(chain);
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
