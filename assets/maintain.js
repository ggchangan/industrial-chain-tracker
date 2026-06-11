const state = { library: null, markdown: "" };
const notice = document.querySelector("#adminNotice");
const createForm = document.querySelector("#createChainForm");
const updateForm = document.querySelector("#addUpdateForm");
const grid = document.querySelector("#maintenanceGrid");
const search = document.querySelector("#maintainSearch");
const chainSelect = document.querySelector("#updateChainId");
const fileInput = document.querySelector("#chainMarkdownFile");

initialize();

async function initialize() {
  updateForm.elements.date.value = new Date().toISOString().slice(0, 10);
  fileInput.addEventListener("change", readMarkdownFile);
  createForm.addEventListener("submit", createChain);
  updateForm.addEventListener("submit", addUpdate);
  search.addEventListener("input", () => renderCards(search.value));
  document.querySelector("#adminLogout").addEventListener("click", logout);
  await refreshLibrary();
}

async function refreshLibrary() {
  try {
    state.library = await apiRequest("./api/v1/library");
    renderChainOptions();
    renderCards(search.value);
    document.querySelector("#maintainUpdatedAt").textContent = `更新：${state.library.meta.updated}`;
  } catch (error) {
    setNotice(error.message, "error");
  }
}

async function readMarkdownFile() {
  const file = fileInput.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    state.markdown = "";
    setNotice("Markdown 文件不能超过 2MB。", "error");
    return;
  }

  state.markdown = await file.text();
  const heading = state.markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || "";
  if (heading) {
    createForm.elements.title.value ||= heading.replace(/深度解析.*$/, "").trim();
    createForm.elements.shortTitle.value ||= heading.replace(/产业链.*$/, "").trim().slice(0, 24);
  }
  document.querySelector("#markdownFileHint").textContent = `${file.name} · ${formatBytes(file.size)}`;
  setNotice("Markdown 已读取，可以补充 ID、标题和主题后建档。", "success");
}

async function createChain(event) {
  event.preventDefault();
  if (!state.markdown) {
    setNotice("请先选择 Markdown 原稿。", "error");
    return;
  }

  const button = createForm.querySelector("button[type='submit']");
  setBusy(button, true, "正在建档…");
  try {
    const payload = Object.fromEntries(new FormData(createForm).entries());
    delete payload.markdownFile;
    payload.markdown = state.markdown;
    const result = await apiRequest("./api/v1/admin/chains", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setNotice(`${result.chain.title}已建档，可从下方打开公开页检查自动生成结果。`, "success");
    createForm.reset();
    state.markdown = "";
    document.querySelector("#markdownFileHint").textContent = "选择不超过 2MB 的 `.md` 文件";
    await refreshLibrary();
  } catch (error) {
    setNotice(error.message, "error");
  } finally {
    setBusy(button, false, "上传并建立产业链");
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
    updateForm.elements.chainId.value = chainId;
    updateForm.elements.date.value = new Date().toISOString().slice(0, 10);
    await refreshLibrary();
  } catch (error) {
    setNotice(error.message, "error");
  } finally {
    setBusy(button, false, "保存动态追踪");
  }
}

function renderChainOptions() {
  const current = chainSelect.value;
  chainSelect.innerHTML = state.library.chains
    .map((chain) => `<option value="${escapeHtml(chain.id)}">${escapeHtml(chain.title)}</option>`)
    .join("");
  if ([...chainSelect.options].some((option) => option.value === current)) chainSelect.value = current;
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
        <button type="button" data-add-update="${escapeHtml(chain.id)}">添加动态</button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-add-update]").forEach((button) => {
    button.addEventListener("click", () => {
      chainSelect.value = button.dataset.addUpdate;
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

function setNotice(message, type) {
  notice.textContent = message;
  notice.className = `admin-notice ${type || ""}`;
}

function setBusy(button, busy, text) {
  button.disabled = busy;
  button.textContent = text;
}

function formatBytes(bytes) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}
