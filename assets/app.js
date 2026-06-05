const library = window.INDUSTRY_CHAIN_LIBRARY;
let currentId = new URLSearchParams(window.location.search).get("chain") || library.chains[0].id;

const chainColors = {
  upstream: "var(--cyan)",
  midstream: "var(--amber)",
  downstream: "var(--green)"
};

let searchIndex = [];

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

    chain.chain.forEach((section) => {
      entries.push({
        ...base,
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

    chain.logic.forEach((item) => {
      entries.push({
        ...base,
        type: "逻辑",
        title: item.title,
        body: item.body
      });
    });

    (chain.trackingProfile?.metrics || []).forEach((item) => {
      entries.push({
        ...base,
        type: "追踪",
        title: item.name,
        body: compactText([item.why, item.signals])
      });
    });

    chain.watchlist.forEach((item) => {
      entries.push({
        ...base,
        type: "观察",
        title: item.segment,
        body: compactText([item.signals, item.companies])
      });
    });

    chain.updates.forEach((item) => {
      entries.push({
        ...base,
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
  window.history.replaceState({}, "", url);
  render();
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

function renderSearchResults(query) {
  const root = document.querySelector("#searchResults");
  const terms = normalize(query).split(/\s+/).filter(Boolean);

  if (!terms.length) {
    root.innerHTML = "";
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
  const matches = allMatches.slice(0, 10);

  if (!matches.length) {
    root.innerHTML = `<p class="search-empty">没有找到匹配项，换个公司、材料或环节关键词试试。</p>`;
    return;
  }

  root.innerHTML = `
    <div class="search-summary">找到 ${allMatches.length} 条相关结果${allMatches.length > matches.length ? `，显示前 ${matches.length} 条` : ""}</div>
    <div class="search-list">
      ${matches
        .map(
          (item) => `
            <button class="search-result" type="button" data-chain="${escapeHtml(item.chainId)}">
              <span>${escapeHtml(item.type)} · ${highlightText(item.chainTitle, terms)}</span>
              <strong>${highlightText(item.title, terms)}</strong>
              <p>${highlightText(item.excerpt, terms)}</p>
            </button>
          `
        )
        .join("")}
    </div>
  `;

  root.querySelectorAll(".search-result").forEach((button) => {
    button.addEventListener("click", () => {
      setChain(button.dataset.chain);
      document.querySelector("#currentTitle").scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
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
    ["原始文章", chain.article],
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

  chain.chain.forEach((section) => {
    const card = el("article", "chain-card");
    card.style.borderColor = chainColors[section.id] || "var(--line)";
    card.append(el("h3", "", section.title || section.name));
    card.append(el("p", "role", section.role));

    const items = section.items || section.segments || [];
    items.forEach((item) => {
      const block = el("div", "chain-item");
      block.append(el("strong", "", item.name));
      block.append(el("p", "", item.detail || item.logic));
      block.append(el("div", "company", item.companies));
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

  chain.updates.forEach((item) => {
    const card = el("article", "timeline-item");
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

  chain.watchlist.forEach((item) => {
    const block = el("div", "watch-item");
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
}

function initSearch() {
  createSearchIndex();
  const input = document.querySelector("#librarySearch");
  const clear = document.querySelector("#clearSearch");

  input.addEventListener("input", () => renderSearchResults(input.value));
  clear.addEventListener("click", () => {
    input.value = "";
    renderSearchResults("");
    input.focus();
  });
}

initSearch();
render();
