const state = { library: null, loadedChainId: "" };
const notice = document.querySelector("#adminNotice");
const articleForm = document.querySelector("#editArticleForm");
const updateForm = document.querySelector("#addUpdateForm");
const grid = document.querySelector("#maintenanceGrid");
const search = document.querySelector("#maintainSearch");
const articleSelect = document.querySelector("#articleChainId");
const updateSelect = document.querySelector("#updateChainId");
const fileInput = document.querySelector("#chainMarkdownFile");
const markdownInput = document.querySelector("#articleMarkdown");

initialize();

async function initialize() {
  updateForm.elements.date.value = new Date().toISOString().slice(0, 10);
  fileInput.addEventListener("change", readMarkdownFile);
  articleSelect.addEventListener("change", () => loadArticle(articleSelect.value));
  articleForm.addEventListener("submit", saveArticle);
  updateForm.addEventListener("submit", addUpdate);
  search.addEventListener("input", () => renderCards(search.value));
  document.querySelector("#adminLogout").addEventListener("click", logout);
  await refreshLibrary();
  if (articleSelect.value) await loadArticle(articleSelect.value);
}

async function refreshLibrary(preferredChainId = "") {
  try {
    state.library = await apiRequest("./api/v1/library");
    renderChainOptions(articleSelect, preferredChainId || articleSelect.value);
    renderChainOptions(updateSelect, updateSelect.value);
    renderCards(search.value);
    document.querySelector("#maintainUpdatedAt").textContent = `更新：${state.library.meta.updated}`;
  } catch (error) {
    setNotice(error.message, "error");
  }
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
    delete payload.chainId;
    await apiRequest(`./api/v1/admin/chains/${encodeURIComponent(chainId)}/updates`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const chainTitle = state.library.chains.find((chain) => chain.id === chainId)?.title || chainId;
    setNotice(`${chainTitle}的动态已保存并发布。`, "success");
    updateForm.reset();
    updateSelect.value = chainId;
    updateForm.elements.date.value = new Date().toISOString().slice(0, 10);
    await refreshLibrary();
  } catch (error) {
    setNotice(error.message, "error");
  } finally {
    setBusy(button, false, "保存动态追踪");
  }
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
        <small>${chain.updates?.length || 0} 条动态</small>
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
