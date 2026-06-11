const state = { library: null, markdown: "", editingId: "", managedIds: new Set() };
const notice = document.querySelector("#adminNotice");
const createForm = document.querySelector("#createChainForm");
const updateForm = document.querySelector("#addUpdateForm");
const grid = document.querySelector("#maintenanceGrid");
const search = document.querySelector("#maintainSearch");
const chainSelect = document.querySelector("#updateChainId");
const fileInput = document.querySelector("#chainMarkdownFile");
const coverInput = document.querySelector("#chainCoverFile");
const diagramInput = document.querySelector("#chainDiagramFile");
const structureInput = document.querySelector("#chainStructure");

initialize();

async function initialize() {
  updateForm.elements.date.value = new Date().toISOString().slice(0, 10);
  fileInput.addEventListener("change", readMarkdownFile);
  document.querySelector("#previewChainButton").addEventListener("click", previewChain);
  document.querySelector("#cancelChainEdit").addEventListener("click", resetChainForm);
  createForm.addEventListener("submit", createChain);
  updateForm.addEventListener("submit", addUpdate);
  search.addEventListener("input", () => renderCards(search.value));
  document.querySelector("#adminLogout").addEventListener("click", logout);
  await refreshLibrary();
}

async function refreshLibrary() {
  try {
    const [library, adminChains] = await Promise.all([
      apiRequest("./api/v1/library"),
      apiRequest("./api/v1/admin/chains")
    ]);
    state.library = library;
    state.managedIds = new Set(adminChains.chains.filter((chain) => chain.managed).map((chain) => chain.id));
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

async function previewChain() {
  if (!state.markdown) {
    setNotice("请先选择 Markdown 原稿。", "error");
    return;
  }

  const button = document.querySelector("#previewChainButton");
  setBusy(button, true, "正在解析…");
  try {
    const result = await apiRequest("./api/v1/admin/chains/preview", {
      method: "POST",
      body: JSON.stringify({
        id: createForm.elements.id.value,
        title: createForm.elements.title.value,
        shortTitle: createForm.elements.shortTitle.value,
        theme: createForm.elements.theme.value,
        markdown: state.markdown
      })
    });
    structureInput.value = JSON.stringify(result.draft, null, 2);
    setNotice("草稿已生成。请检查章节、环节、公司与核心逻辑，确认无误后再上传正式图片并发布。", "success");
    structureInput.focus();
  } catch (error) {
    setNotice(error.message, "error");
  } finally {
    setBusy(button, false, "解析原稿并生成草稿");
  }
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
    try {
      payload.structure = JSON.parse(payload.structure);
    } catch {
      throw new Error("骨架草稿不是有效 JSON，请检查括号、逗号和引号。");
    }
    if (coverInput.files[0]) payload.cover = await readImageAsset(coverInput.files[0], "正式封面");
    if (diagramInput.files[0]) payload.diagram = await readImageAsset(diagramInput.files[0], "产业链图谱");
    if (!state.editingId && (!payload.cover || !payload.diagram)) {
      throw new Error("首次发布必须上传正式封面和产业链图谱。");
    }
    const editingId = state.editingId;
    const result = await apiRequest(editingId
      ? `./api/v1/admin/chains/${encodeURIComponent(editingId)}`
      : "./api/v1/admin/chains", {
      method: editingId ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    setNotice(`${result.chain.title}${editingId ? "已更新" : "已发布"}，可从下方打开公开页检查。`, "success");
    resetChainForm();
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
        ${state.managedIds.has(chain.id) ? `
          <button type="button" data-edit-chain="${escapeHtml(chain.id)}">编辑内容</button>
          <button type="button" data-delete-chain="${escapeHtml(chain.id)}">删除</button>
        ` : ""}
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
  grid.querySelectorAll("[data-edit-chain]").forEach((button) => {
    button.addEventListener("click", () => editChain(button.dataset.editChain));
  });
  grid.querySelectorAll("[data-delete-chain]").forEach((button) => {
    button.addEventListener("click", () => deleteChain(button.dataset.deleteChain));
  });
}

async function editChain(chainId) {
  try {
    const payload = await apiRequest(`./api/v1/admin/chains/${encodeURIComponent(chainId)}`);
    const chain = payload.chain;
    state.editingId = chainId;
    state.markdown = payload.markdown;
    createForm.elements.id.value = chain.id;
    createForm.elements.id.readOnly = true;
    createForm.elements.shortTitle.value = chain.shortTitle;
    createForm.elements.title.value = chain.title;
    createForm.elements.theme.value = chain.theme;
    structureInput.value = JSON.stringify({
      title: chain.title,
      shortTitle: chain.shortTitle,
      theme: chain.theme,
      trackingProfile: chain.trackingProfile,
      chain: chain.chain,
      logic: chain.logic
    }, null, 2);
    document.querySelector("#markdownFileHint").textContent = "已载入现有原稿；选择新文件可替换";
    createForm.querySelector("button[type='submit']").textContent = "保存产业链更新";
    document.querySelector("#cancelChainEdit").hidden = false;
    document.querySelector("#create-chain").scrollIntoView({ behavior: "smooth", block: "start" });
    setNotice(`正在编辑${chain.title}。图片不重新选择则保留现有文件。`, "success");
  } catch (error) {
    setNotice(error.message, "error");
  }
}

async function deleteChain(chainId) {
  const chain = state.library.chains.find((item) => item.id === chainId);
  if (!window.confirm(`确定删除“${chain?.title || chainId}”吗？该操作会删除后台原稿、图片和动态。`)) return;
  try {
    await apiRequest(`./api/v1/admin/chains/${encodeURIComponent(chainId)}`, { method: "DELETE" });
    if (state.editingId === chainId) resetChainForm();
    setNotice(`${chain?.title || chainId}已删除。`, "success");
    await refreshLibrary();
  } catch (error) {
    setNotice(error.message, "error");
  }
}

function resetChainForm() {
  state.editingId = "";
  state.markdown = "";
  createForm.reset();
  createForm.elements.id.readOnly = false;
  structureInput.value = "";
  document.querySelector("#markdownFileHint").textContent = "选择不超过 2MB 的 `.md` 文件";
  createForm.querySelector("button[type='submit']").textContent = "确认内容并正式发布";
  document.querySelector("#cancelChainEdit").hidden = true;
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

async function readImageAsset(file, label) {
  if (!file) throw new Error(`请上传${label}。`);
  if (file.size > 8 * 1024 * 1024) throw new Error(`${label}不能超过 8MB。`);
  const data = await fileToDataUrl(file);
  return { name: file.name, type: file.type || inferImageType(file.name), data };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

function inferImageType(name) {
  const extension = String(name).split(".").pop().toLowerCase();
  return {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    svg: "image/svg+xml"
  }[extension] || "";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}
