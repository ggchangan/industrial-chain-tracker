const state = {
  library: null,
  loadedChainId: "",
  archiveChainId: "",
  sourceAssets: []
};
const notice = document.querySelector("#adminNotice");
const articleForm = document.querySelector("#editArticleForm");
const updateForm = document.querySelector("#addUpdateForm");
const sourceForm = document.querySelector("#addSourceForm");
const grid = document.querySelector("#maintenanceGrid");
const search = document.querySelector("#maintainSearch");
const articleSelect = document.querySelector("#articleChainId");
const updateSelect = document.querySelector("#updateChainId");
const sourceSelect = document.querySelector("#sourceChainId");
const archiveSelect = document.querySelector("#archiveChainId");
const archiveSummary = document.querySelector("#archiveSummary");
const archiveList = document.querySelector("#archiveList");
const fileInput = document.querySelector("#chainMarkdownFile");
const markdownInput = document.querySelector("#articleMarkdown");
const sourceFileInput = document.querySelector("#sourceMarkdownFile");
const sourceMarkdownInput = document.querySelector("#sourceMarkdown");
const sourceIllustrationFiles = document.querySelector("#sourceIllustrationFiles");
const sourceIllustrationList = document.querySelector("#sourceIllustrationList");
const cancelSourceEdit = document.querySelector("#cancelSourceEdit");
const cancelUpdateEdit = document.querySelector("#cancelUpdateEdit");

initialize();

async function initialize() {
  updateForm.elements.date.value = new Date().toISOString().slice(0, 10);
  sourceForm.elements.date.value = new Date().toISOString().slice(0, 10);
  fileInput.addEventListener("change", readMarkdownFile);
  sourceFileInput.addEventListener("change", readSourceMarkdownFile);
  sourceIllustrationFiles.addEventListener("change", readSourceIllustrations);
  articleSelect.addEventListener("change", () => loadArticle(articleSelect.value));
  archiveSelect.addEventListener("change", () => {
    state.archiveChainId = archiveSelect.value;
    sourceSelect.value = archiveSelect.value;
    renderArchive();
  });
  articleForm.addEventListener("submit", saveArticle);
  sourceForm.addEventListener("submit", addSource);
  updateForm.addEventListener("submit", addUpdate);
  cancelSourceEdit.addEventListener("click", resetSourceForm);
  cancelUpdateEdit.addEventListener("click", resetUpdateForm);
  search.addEventListener("input", () => renderCards(search.value));
  document.querySelector("#adminLogout").addEventListener("click", logout);
  renderSourceIllustrations();
  await refreshLibrary();
  if (articleSelect.value) await loadArticle(articleSelect.value);
}

async function refreshLibrary(preferredChainId = "") {
  try {
    state.library = await apiRequest("./api/v1/library");
    renderChainOptions(articleSelect, preferredChainId || articleSelect.value);
    renderChainOptions(updateSelect, updateSelect.value);
    renderChainOptions(sourceSelect, sourceSelect.value);
    renderChainOptions(archiveSelect, state.archiveChainId || preferredChainId || archiveSelect.value);
    state.archiveChainId = archiveSelect.value;
    renderArchive();
    renderCards(search.value);
    document.querySelector("#maintainUpdatedAt").textContent = `更新：${state.library.meta.updated}`;
  } catch (error) {
    setNotice(error.message, "error");
  }
}

function renderArchive() {
  const chain = state.library?.chains.find((item) => item.id === state.archiveChainId);
  if (!chain) {
    archiveSummary.innerHTML = "";
    archiveList.innerHTML = "";
    return;
  }

  const sources = chain.sources || [];
  const logicCardCount = (chain.logicTracks || []).reduce(
    (total, track) => total + (track.coreInsights?.length || 0),
    0
  );
  archiveSummary.innerHTML = `
    <article><span>基准原文</span><strong>1</strong><small>产业链骨架</small></article>
    <article><span>资料档案</span><strong>${sources.length}</strong><small>文章、视频及外部来源</small></article>
    <article><span>逻辑卡片</span><strong>${logicCardCount}</strong><small>可复用研究结论</small></article>
    <article><span>动态追踪</span><strong>${chain.updates?.length || 0}</strong><small>按日期发布</small></article>
  `;

  const baseline = `
    <article class="archive-item baseline">
      <div class="archive-item-head">
        <span>产业链基准原文</span>
        <small>骨架资料</small>
      </div>
      <h3>${escapeHtml(chain.title)}</h3>
      <p>用于生成和维护产业链骨架，不承担动态逻辑变化记录。</p>
      <div class="archive-item-actions">
        <a href="./index.html?chain=${encodeURIComponent(chain.id)}#article" target="_blank">阅读原文</a>
        <button type="button" data-archive-edit="${escapeHtml(chain.id)}">编辑原文</button>
      </div>
    </article>
  `;

  archiveList.innerHTML = baseline + sources.map((source) => `
    <article class="archive-item">
      <div class="archive-item-head">
        <span>${escapeHtml(sourceTypeLabel(source.type))}</span>
        <small>${escapeHtml(sourceStatusLabel(source.status))}</small>
      </div>
      <h3>${escapeHtml(source.title)}</h3>
      <p>${escapeHtml(source.summary || "尚未填写资料摘要")}</p>
      <div class="archive-item-meta">
        <span>${escapeHtml(source.date || "")}</span>
        ${source.platform ? `<span>${escapeHtml(source.platform)}</span>` : ""}
        ${source.segment ? `<span>${escapeHtml(source.segment)}</span>` : ""}
        ${source.derivedFromUpdate ? "<span>来自动态</span>" : "<span>独立归档</span>"}
      </div>
      <div class="archive-item-actions">
        ${source.markdownUrl ? `<a href="${escapeHtml(sourceReaderUrl(chain.id, source.markdownUrl))}" target="_blank">阅读原文</a>` : ""}
        ${source.originalUrl ? `<a href="${escapeHtml(source.originalUrl)}" target="_blank" rel="noopener noreferrer">原始链接</a>` : ""}
        <button type="button" data-edit-source="${escapeHtml(source.id)}">编辑资料包</button>
      </div>
    </article>
  `).join("") + `
    <div class="archive-subhead">
      <strong>动态追踪记录</strong>
      <span>动态是资料产生的时间线结论，也可以单独修订。</span>
    </div>
    ${(chain.updates || []).map((update) => `
      <article class="archive-item update-record">
        <div class="archive-item-head">
          <span>${escapeHtml(update.type || "产业事件")}</span>
          <small>${escapeHtml(update.confidence || "")}</small>
        </div>
        <h3>${escapeHtml(update.signal)}</h3>
        <p>${escapeHtml(update.impact)}</p>
        <div class="archive-item-meta">
          <span>${escapeHtml(update.date)}</span>
          <span>${escapeHtml(update.segment)}</span>
          <span>${escapeHtml(update.sourceTitle || "")}</span>
        </div>
        <div class="archive-item-actions">
          <button type="button" data-edit-update="${escapeHtml(update.id)}">编辑动态</button>
        </div>
      </article>
    `).join("")}
  `;

  archiveList.querySelectorAll("[data-archive-edit]").forEach((button) => {
    button.addEventListener("click", async () => {
      articleSelect.value = button.dataset.archiveEdit;
      document.querySelector("#edit-article").scrollIntoView({ behavior: "smooth", block: "start" });
      await loadArticle(button.dataset.archiveEdit);
    });
  });
  archiveList.querySelectorAll("[data-edit-source]").forEach((button) => {
    button.addEventListener("click", () => editSource(chain.id, button.dataset.editSource));
  });
  archiveList.querySelectorAll("[data-edit-update]").forEach((button) => {
    button.addEventListener("click", () => editUpdate(chain.id, button.dataset.editUpdate));
  });
}

function renderChainOptions(select, preferredValue = "") {
  select.innerHTML = state.library.chains
    .map((chain) => `<option value="${escapeHtml(chain.id)}">${escapeHtml(chain.title)}</option>`)
    .join("");
  if ([...select.options].some((option) => option.value === preferredValue)) select.value = preferredValue;
}

async function loadArticle(chainId) {
  if (!chainId) return;
  markdownInput.disabled = true;
  try {
    const payload = await apiRequest(`./api/v1/admin/chains/${encodeURIComponent(chainId)}`);
    state.loadedChainId = chainId;
    markdownInput.value = payload.markdown;
    fileInput.value = "";
    document.querySelector("#markdownFileHint").textContent = "已载入当前原稿；可直接编辑或选择新文件替换";
    setNotice(`已载入${payload.chain.title}原文。`, "success");
  } catch (error) {
    setNotice(error.message, "error");
  } finally {
    markdownInput.disabled = false;
  }
}

async function readMarkdownFile() {
  const file = fileInput.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    fileInput.value = "";
    setNotice("Markdown 文件不能超过 2MB。", "error");
    return;
  }
  markdownInput.value = await file.text();
  document.querySelector("#markdownFileHint").textContent = `${file.name} · ${formatBytes(file.size)}`;
  setNotice("新 Markdown 已读取，保存前可以继续在下方检查和修改。", "success");
}

async function readSourceMarkdownFile() {
  const file = sourceFileInput.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    sourceFileInput.value = "";
    setNotice("资料原文不能超过 2MB。", "error");
    return;
  }
  sourceMarkdownInput.value = await file.text();
  if (!sourceForm.elements.title.value) {
    sourceForm.elements.title.value =
      sourceMarkdownInput.value.match(/^#\s+(.+)$/m)?.[1]?.trim() || file.name.replace(/\.md$/i, "");
  }
  setNotice(`${file.name} 已载入资料原文。`, "success");
}

async function readSourceIllustrations() {
  const files = [...sourceIllustrationFiles.files];
  if (!files.length) return;
  if (state.sourceAssets.length + files.length > 12) {
    sourceIllustrationFiles.value = "";
    setNotice("每份资料最多保存 12 张配图。", "error");
    return;
  }
  for (const file of files) {
    if (file.size > 8 * 1024 * 1024) {
      setNotice(`${file.name} 超过 8MB，未加入资料包。`, "error");
      continue;
    }
    state.sourceAssets.push({
      key: crypto.randomUUID(),
      src: "",
      preview: await fileToDataUrl(file),
      alt: file.name.replace(/\.[^.]+$/, ""),
      caption: "",
      afterHeading: "",
      upload: {
        name: file.name,
        type: file.type,
        data: await fileToDataUrl(file)
      }
    });
  }
  sourceIllustrationFiles.value = "";
  renderSourceIllustrations();
}

function renderSourceIllustrations() {
  if (!state.sourceAssets.length) {
    sourceIllustrationList.innerHTML = `<p class="source-assets-empty">尚未添加配图。</p>`;
    return;
  }
  sourceIllustrationList.innerHTML = state.sourceAssets.map((item) => `
    <article class="source-illustration-item" data-source-asset="${escapeHtml(item.key)}">
      <img src="${escapeHtml(item.preview || item.src)}" alt="${escapeHtml(item.alt)}" />
      <div>
        <label>
          <span>图片说明</span>
          <input data-asset-field="caption" value="${escapeHtml(item.caption)}" placeholder="图片下方显示的说明" />
        </label>
        <label>
          <span>插入位置</span>
          <input data-asset-field="afterHeading" value="${escapeHtml(item.afterHeading)}" placeholder="填写文章中的完整标题；留空则放在开头" />
        </label>
        <label>
          <span>替代文字</span>
          <input data-asset-field="alt" value="${escapeHtml(item.alt)}" placeholder="无障碍与加载失败时显示" />
        </label>
      </div>
      <button type="button" data-remove-asset="${escapeHtml(item.key)}">移除</button>
    </article>
  `).join("");

  sourceIllustrationList.querySelectorAll("[data-asset-field]").forEach((input) => {
    input.addEventListener("input", () => {
      const item = state.sourceAssets.find(
        (asset) => asset.key === input.closest("[data-source-asset]").dataset.sourceAsset
      );
      if (item) item[input.dataset.assetField] = input.value;
    });
  });
  sourceIllustrationList.querySelectorAll("[data-remove-asset]").forEach((button) => {
    button.addEventListener("click", () => {
      state.sourceAssets = state.sourceAssets.filter((item) => item.key !== button.dataset.removeAsset);
      renderSourceIllustrations();
    });
  });
}

async function addSource(event) {
  event.preventDefault();
  const button = sourceForm.querySelector("button[type='submit']");
  setBusy(button, true, "正在归档…");
  try {
    const payload = Object.fromEntries(new FormData(sourceForm).entries());
    const chainId = payload.chainId;
    const sourceId = payload.sourceId;
    delete payload.chainId;
    delete payload.sourceId;
    payload.illustrations = state.sourceAssets.map(({ key, preview, ...item }) => item);
    await apiRequest(
      sourceId
        ? `./api/v1/admin/chains/${encodeURIComponent(chainId)}/sources/${encodeURIComponent(sourceId)}`
        : `./api/v1/admin/chains/${encodeURIComponent(chainId)}/sources`,
      {
      method: sourceId ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    setNotice(sourceId ? "资料包已更新。" : "资料已保存到产业链档案。", "success");
    resetSourceForm(chainId);
    state.archiveChainId = chainId;
    await refreshLibrary(chainId);
    archiveSelect.value = chainId;
    renderArchive();
  } catch (error) {
    setNotice(error.message, "error");
  } finally {
    setBusy(button, false, "保存资料归档");
  }
}

async function editSource(chainId, sourceId) {
  try {
    const payload = await apiRequest(
      `./api/v1/admin/chains/${encodeURIComponent(chainId)}/sources/${encodeURIComponent(sourceId)}`
    );
    const source = payload.source;
    sourceSelect.value = chainId;
    sourceForm.elements.sourceId.value = source.id;
    [
      "type", "date", "title", "platform", "author", "originalUrl",
      "summary", "segment", "status"
    ].forEach((name) => {
      if (sourceForm.elements[name]) sourceForm.elements[name].value = source[name] || "";
    });
    sourceForm.elements.companies.value = (source.companies || []).join("、");
    sourceForm.elements.tags.value = (source.tags || []).join("、");
    sourceMarkdownInput.value = payload.markdown || "";
    state.sourceAssets = (source.illustrations || []).map((item) => ({
      ...item,
      key: crypto.randomUUID(),
      preview: item.src
    }));
    renderSourceIllustrations();
    document.querySelector("#sourceFormTitle").textContent = "编辑资料包";
    document.querySelector("#sourceFormDescription").textContent =
      "原文、配图、来源信息和归档状态会作为一个整体保存。";
    sourceForm.querySelector("button[type='submit']").textContent = "保存资料修改";
    cancelSourceEdit.hidden = false;
    document.querySelector("#add-source").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    setNotice(error.message, "error");
  }
}

function resetSourceForm(chainId = sourceSelect.value) {
  sourceForm.reset();
  renderChainOptions(sourceSelect, chainId);
  sourceForm.elements.date.value = new Date().toISOString().slice(0, 10);
  sourceFileInput.value = "";
  sourceIllustrationFiles.value = "";
  sourceMarkdownInput.value = "";
  state.sourceAssets = [];
  renderSourceIllustrations();
  document.querySelector("#sourceFormTitle").textContent = "新增资料归档";
  document.querySelector("#sourceFormDescription").textContent =
    "先保存完整来源和原文，再决定是否提炼逻辑卡或发布为动态追踪。";
  sourceForm.querySelector("button[type='submit']").textContent = "保存资料归档";
  cancelSourceEdit.hidden = true;
}

async function saveArticle(event) {
  event.preventDefault();
  const chainId = articleSelect.value;
  const button = articleForm.querySelector("button[type='submit']");
  setBusy(button, true, "正在保存…");
  try {
    const result = await apiRequest(`./api/v1/admin/chains/${encodeURIComponent(chainId)}`, {
      method: "PUT",
      body: JSON.stringify({ markdown: markdownInput.value })
    });
    setNotice(`${result.chain.title}原文已更新。`, "success");
    await refreshLibrary(chainId);
  } catch (error) {
    setNotice(error.message, "error");
  } finally {
    setBusy(button, false, "保存原文更新");
  }
}

async function addUpdate(event) {
  event.preventDefault();
  const button = updateForm.querySelector("button[type='submit']");
  setBusy(button, true, "正在保存…");
  try {
    const payload = Object.fromEntries(new FormData(updateForm).entries());
    const chainId = payload.chainId;
    const updateId = payload.updateId;
    delete payload.chainId;
    delete payload.updateId;
    await apiRequest(
      updateId
        ? `./api/v1/admin/chains/${encodeURIComponent(chainId)}/updates/${encodeURIComponent(updateId)}`
        : `./api/v1/admin/chains/${encodeURIComponent(chainId)}/updates`,
      {
      method: updateId ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    const chainTitle = state.library.chains.find((chain) => chain.id === chainId)?.title || chainId;
    setNotice(`${chainTitle}的动态已${updateId ? "更新" : "保存并发布"}。`, "success");
    resetUpdateForm(chainId);
    await refreshLibrary();
  } catch (error) {
    setNotice(error.message, "error");
  } finally {
    setBusy(button, false, "保存动态追踪");
  }
}

function editUpdate(chainId, updateId) {
  const chain = state.library.chains.find((item) => item.id === chainId);
  const update = chain?.updates?.find((item) => item.id === updateId);
  if (!update) {
    setNotice("未找到这条动态。", "error");
    return;
  }
  updateSelect.value = chainId;
  updateForm.elements.updateId.value = update.id;
  [
    "date", "type", "segment", "signal", "impact", "confidence",
    "sourceTitle", "sourceUrl", "notes"
  ].forEach((name) => {
    updateForm.elements[name].value = update[name] || "";
  });
  updateForm.querySelector("button[type='submit']").textContent = "保存动态修改";
  cancelUpdateEdit.hidden = false;
  document.querySelector("#add-update").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetUpdateForm(chainId = updateSelect.value) {
  updateForm.reset();
  renderChainOptions(updateSelect, chainId);
  updateForm.elements.date.value = new Date().toISOString().slice(0, 10);
  updateForm.querySelector("button[type='submit']").textContent = "保存动态追踪";
  cancelUpdateEdit.hidden = true;
}

function renderCards(query = "") {
  if (!state.library) return;
  const normalized = query.trim().toLowerCase();
  const chains = state.library.chains.filter((chain) =>
    `${chain.title} ${chain.shortTitle} ${chain.theme}`.toLowerCase().includes(normalized)
  );

  grid.innerHTML = chains.map((chain) => `
    <article class="maintenance-card">
      <div class="maintenance-card-meta">
        <span>${escapeHtml(chain.status)}</span>
        <small>${chain.sources?.length || 0} 份资料 · ${chain.updates?.length || 0} 条动态</small>
      </div>
      <h3>${escapeHtml(chain.title)}</h3>
      <p>${escapeHtml(chain.theme)}</p>
      <div class="maintenance-links">
        <a href="./index.html?chain=${encodeURIComponent(chain.id)}">公开页</a>
        ${resourceLink(chain.article, "原稿")}
        ${resourceLink(chain.cover, "封面")}
        ${resourceLink(chain.diagram, "产业链图谱")}
        <button type="button" data-edit-article="${escapeHtml(chain.id)}">编辑原文</button>
        <button type="button" data-add-update="${escapeHtml(chain.id)}">添加动态</button>
        <button type="button" data-open-archive="${escapeHtml(chain.id)}">资料档案</button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-edit-article]").forEach((button) => {
    button.addEventListener("click", async () => {
      articleSelect.value = button.dataset.editArticle;
      document.querySelector("#edit-article").scrollIntoView({ behavior: "smooth", block: "start" });
      await loadArticle(button.dataset.editArticle);
      markdownInput.focus();
    });
  });
  grid.querySelectorAll("[data-add-update]").forEach((button) => {
    button.addEventListener("click", () => {
      updateSelect.value = button.dataset.addUpdate;
      document.querySelector("#add-update").scrollIntoView({ behavior: "smooth", block: "start" });
      updateForm.elements.segment.focus();
    });
  });
  grid.querySelectorAll("[data-open-archive]").forEach((button) => {
    button.addEventListener("click", () => {
      state.archiveChainId = button.dataset.openArchive;
      archiveSelect.value = state.archiveChainId;
      sourceSelect.value = state.archiveChainId;
      renderArchive();
      document.querySelector("#archive").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function sourceTypeLabel(type) {
  return {
    "research-article": "研究文章",
    "short-video": "短视频",
    wechat: "微信公众号",
    weibo: "微博",
    announcement: "公司公告",
    report: "研报",
    news: "新闻",
    other: "其他资料"
  }[type] || "资料";
}

function sourceStatusLabel(status) {
  return {
    draft: "待整理",
    published: "已发布",
    archived: "仅归档"
  }[status] || "已归档";
}

function sourceReaderUrl(chainId, markdownUrl) {
  const source = String(markdownUrl || "").replace(/^\.?\//, "");
  return `./index.html?chain=${encodeURIComponent(chainId)}&reading=${encodeURIComponent(source)}#article`;
}

function resourceLink(url, label) {
  return url ? `<a href="${escapeHtml(url)}">${label}</a>` : "";
}

async function logout() {
  await fetch("./api/v1/admin/logout", { method: "POST", credentials: "same-origin" });
  window.location.replace("./admin-login.html");
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.location.replace(`./admin-login.html?next=${encodeURIComponent("/maintain.html")}`);
    throw new Error("登录状态已失效");
  }
  if (!response.ok) throw new Error(payload.message || `请求失败（${response.status}）`);
  return payload;
}

function setNotice(message, type = "") {
  notice.textContent = message;
  notice.className = `admin-notice ${type}`.trim();
}

function setBusy(button, busy, text) {
  button.disabled = busy;
  button.textContent = text;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
