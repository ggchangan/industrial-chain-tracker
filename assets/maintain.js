const state = {
  library: null,
  loadedChainId: "",
  archiveChainId: "",
  sourceAssets: [],
  logicCards: [],
  logicTracks: [],
  packagePayload: null,
  packageInspection: null,
  verificationChainId: ""
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
const sourceMarkdownAnalysis = document.querySelector("#sourceMarkdownAnalysis");
const cancelSourceEdit = document.querySelector("#cancelSourceEdit");
const cancelUpdateEdit = document.querySelector("#cancelUpdateEdit");
const logicCardForm = document.querySelector("#logicCardForm");
const logicCardChainSelect = document.querySelector("#logicCardChainId");
const logicCardSourceSelect = document.querySelector("#logicCardSourceId");
const logicCardDisplay = document.querySelector("#logicCardDisplay");
const logicCardContent = document.querySelector("#logicCardContent");
const logicCardContentHint = document.querySelector("#logicCardContentHint");
const cancelLogicCardEdit = document.querySelector("#cancelLogicCardEdit");
const packageForm = document.querySelector("#packageForm");
const packageChainSelect = document.querySelector("#packageChainId");
const packageFolder = document.querySelector("#packageFolder");
const inspectPackageButton = document.querySelector("#inspectPackage");
const importPackageButton = document.querySelector("#importPackage");
const packageInspection = document.querySelector("#packageInspection");
const verificationForm = document.querySelector("#monitorVerificationForm");
const verificationChainSelect = document.querySelector("#verificationChainId");
const verificationMonitorSelect = document.querySelector("#verificationMonitorId");
const verificationMonitorPreview = document.querySelector("#verificationMonitorPreview");
const verificationHistoryList = document.querySelector("#verificationHistoryList");

initialize();

async function initialize() {
  updateForm.elements.date.value = new Date().toISOString().slice(0, 10);
  sourceForm.elements.date.value = new Date().toISOString().slice(0, 10);
  verificationForm.elements.date.value = new Date().toISOString().slice(0, 10);
  fileInput.addEventListener("change", readMarkdownFile);
  sourceFileInput.addEventListener("change", readSourceMarkdownFile);
  sourceIllustrationFiles.addEventListener("change", readSourceIllustrations);
  sourceMarkdownInput.addEventListener("input", renderSourceMarkdownAnalysis);
  sourceForm.elements.title.addEventListener("input", renderSourceMarkdownAnalysis);
  articleSelect.addEventListener("change", () => loadArticle(articleSelect.value));
  archiveSelect.addEventListener("change", async () => {
    state.archiveChainId = archiveSelect.value;
    sourceSelect.value = archiveSelect.value;
    logicCardChainSelect.value = archiveSelect.value;
    await loadLogicCards();
    renderArchive();
  });
  articleForm.addEventListener("submit", saveArticle);
  sourceForm.addEventListener("submit", addSource);
  updateForm.addEventListener("submit", addUpdate);
  cancelSourceEdit.addEventListener("click", resetSourceForm);
  cancelUpdateEdit.addEventListener("click", resetUpdateForm);
  logicCardForm.addEventListener("submit", saveLogicCard);
  logicCardChainSelect.addEventListener("change", async () => {
    state.archiveChainId = logicCardChainSelect.value;
    archiveSelect.value = state.archiveChainId;
    await loadLogicCards();
    renderArchive();
    renderLogicSourceOptions();
  });
  logicCardDisplay.addEventListener("change", () => setLogicContentTemplate(true));
  cancelLogicCardEdit.addEventListener("click", resetLogicCardForm);
  packageFolder.addEventListener("change", resetPackageInspection);
  inspectPackageButton.addEventListener("click", inspectSelectedPackage);
  packageForm.addEventListener("submit", importSelectedPackage);
  verificationChainSelect.addEventListener("change", () => {
    state.verificationChainId = verificationChainSelect.value;
    renderVerificationMonitors();
  });
  verificationMonitorSelect.addEventListener("change", renderVerificationMonitor);
  verificationForm.addEventListener("submit", saveMonitorVerification);
  search.addEventListener("input", () => renderCards(search.value));
  document.querySelector("#adminLogout").addEventListener("click", logout);
  renderSourceIllustrations();
  await refreshLibrary();
  resetLogicCardForm(state.archiveChainId);
  if (articleSelect.value) await loadArticle(articleSelect.value);
}

async function refreshLibrary(preferredChainId = "") {
  try {
    state.library = await apiRequest("./api/v1/library");
    renderChainOptions(articleSelect, preferredChainId || articleSelect.value);
    renderChainOptions(updateSelect, updateSelect.value);
    renderChainOptions(sourceSelect, sourceSelect.value);
    renderChainOptions(archiveSelect, state.archiveChainId || preferredChainId || archiveSelect.value);
    renderChainOptions(logicCardChainSelect, state.archiveChainId || preferredChainId || logicCardChainSelect.value);
    renderChainOptions(packageChainSelect, preferredChainId || packageChainSelect.value);
    renderChainOptions(
      verificationChainSelect,
      state.verificationChainId || preferredChainId || verificationChainSelect.value
    );
    state.verificationChainId = verificationChainSelect.value;
    state.archiveChainId = archiveSelect.value;
    await loadLogicCards();
    renderLogicSourceOptions();
    renderArchive();
    renderVerificationMonitors();
    renderCards(search.value);
    document.querySelector("#maintainUpdatedAt").textContent = `更新：${state.library.meta.updated}`;
  } catch (error) {
    setNotice(error.message, "error");
  }
}

function researchMonitors(chain) {
  return (chain?.trackingProfile?.metrics || []).filter((item) => item.topicTitle && item.id);
}

function renderVerificationMonitors(preferredValue = verificationMonitorSelect.value) {
  const chain = state.library?.chains.find((item) => item.id === verificationChainSelect.value);
  const monitors = researchMonitors(chain);
  verificationMonitorSelect.innerHTML = monitors.length
    ? monitors.map((item) => `
        <option value="${escapeHtml(item.id)}">${escapeHtml(item.topicTitle)} · ${escapeHtml(item.name)}</option>
      `).join("")
    : `<option value="">当前产业链没有研究监控项</option>`;
  if (monitors.some((item) => item.id === preferredValue)) {
    verificationMonitorSelect.value = preferredValue;
  }
  verificationForm.querySelector("button[type='submit']").disabled = !monitors.length;
  renderVerificationMonitor();
}

function renderVerificationMonitor() {
  const chain = state.library?.chains.find((item) => item.id === verificationChainSelect.value);
  const monitor = researchMonitors(chain).find((item) => item.id === verificationMonitorSelect.value);
  if (!monitor) {
    verificationMonitorPreview.innerHTML = `<p class="archive-empty">导入包含 monitors 的研究包后，可在这里进行人工核验。</p>`;
    verificationHistoryList.innerHTML = `<p class="archive-empty">暂无核验历史。</p>`;
    return;
  }
  verificationMonitorPreview.innerHTML = `
    <article>
      <span>${escapeHtml(monitor.topicTitle)} · ${escapeHtml(monitor.logicTitle)}</span>
      <h3>${escapeHtml(monitor.name)}</h3>
      <p>${escapeHtml(monitor.why)}</p>
      <div class="verification-signals">
        <div><strong>强化信号</strong><span>${escapeHtml(monitor.signals?.[0] || "")}</span></div>
        <div><strong>减弱信号</strong><span>${escapeHtml(monitor.signals?.[1] || "")}</span></div>
      </div>
    </article>
  `;
  const history = monitor.verificationHistory || [];
  verificationHistoryList.innerHTML = history.length
    ? history.map((item) => `
      <article class="archive-item verification-record status-${escapeHtml(item.result)}">
        <div class="archive-item-head">
          <span>${escapeHtml(verificationResultLabel(item.result))}</span>
          <small>${escapeHtml(item.date)}</small>
        </div>
        <h3>${escapeHtml(item.summary)}</h3>
        <p>${escapeHtml(item.notes || "无补充备注")}</p>
        <div class="archive-item-actions">
          <a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.sourceTitle)}</a>
        </div>
      </article>
    `).join("")
    : `<p class="archive-empty">尚未核验，公开页显示为“待接入”。</p>`;
}

async function saveMonitorVerification(event) {
  event.preventDefault();
  const button = verificationForm.querySelector("button[type='submit']");
  const chainId = verificationChainSelect.value;
  const monitorId = verificationMonitorSelect.value;
  setBusy(button, true, "正在保存…");
  try {
    const payload = Object.fromEntries(new FormData(verificationForm).entries());
    payload.monitorId = monitorId;
    await apiRequest(
      `./api/v1/admin/chains/${encodeURIComponent(chainId)}/monitor-verifications`,
      { method: "POST", body: JSON.stringify(payload) }
    );
    setNotice("核验记录已保存，公开页监控状态和逻辑变化已更新。", "success");
    const preservedMonitor = monitorId;
    await refreshLibrary(chainId);
    verificationChainSelect.value = chainId;
    renderVerificationMonitors(preservedMonitor);
    verificationForm.reset();
    verificationForm.elements.date.value = new Date().toISOString().slice(0, 10);
    verificationForm.elements.result.value = "strengthen";
  } catch (error) {
    setNotice(error.message, "error");
  } finally {
    setBusy(button, false, "保存核验记录");
  }
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

async function loadLogicCards() {
  if (!state.archiveChainId) return;
  const payload = await apiRequest(
    `./api/v1/admin/chains/${encodeURIComponent(state.archiveChainId)}/logic-cards`
  );
  state.logicCards = payload.cards || [];
  state.logicTracks = payload.tracks || [];
}

function renderLogicSourceOptions(preferredValue = logicCardSourceSelect.value) {
  const chain = state.library?.chains.find((item) => item.id === logicCardChainSelect.value);
  const options = (chain?.sources || []).map((source) =>
    `<option value="${escapeHtml(source.id)}">${escapeHtml(source.title)}</option>`
  );
  logicCardSourceSelect.innerHTML =
    `<option value="">不关联具体资料</option>${options.join("")}`;
  if ([...logicCardSourceSelect.options].some((option) => option.value === preferredValue)) {
    logicCardSourceSelect.value = preferredValue;
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
  const logicCardCount = state.logicCards.filter((card) => card.status !== "deleted").length;
  const researchPackages = chain.researchPackages || [];
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

  archiveList.innerHTML = baseline + `
    <div class="archive-subhead">
      <strong>研究主题包</strong>
      <span>完整 HTML、Markdown、逻辑与监控配置。</span>
    </div>
    ${researchPackages.length ? researchPackages.map((item) => `
      <article class="archive-item research-package-record">
        <div class="archive-item-head">
          <span>${escapeHtml(item.topicTitle)}</span>
          <small>${escapeHtml(item.status === "imported" ? "已入库" : item.status)}</small>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.logic?.summary || "已保存研究原文和结构化逻辑。")}</p>
        <div class="archive-item-meta">
          <span>${item.logicCount || 0} 条逻辑</span>
          <span>${item.monitorCount || 0} 个监控</span>
          <span>${item.assetCount || 0} 个资源</span>
        </div>
        <div class="archive-item-actions">
          <a href="${escapeHtml(item.articleUrl)}" target="_blank">阅读 HTML</a>
          <a href="${escapeHtml(item.sourceUrl)}" target="_blank">查看 Markdown</a>
          <a href="${escapeHtml(item.logicUrl)}" target="_blank">查看逻辑配置</a>
        </div>
      </article>
    `).join("") : `<p class="archive-empty">还没有导入标准研究包。</p>`}
  ` + sources.map((source) => `
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
        <button type="button" data-create-logic="${escapeHtml(source.id)}">提炼逻辑卡</button>
      </div>
    </article>
  `).join("") + `
    <div class="archive-subhead">
      <strong>逻辑卡片</strong>
      <span>从资料中提炼，可关联公司、环节与原文。</span>
    </div>
    ${renderLogicCardArchive()}
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
  archiveList.querySelectorAll("[data-create-logic]").forEach((button) => {
    button.addEventListener("click", () => startLogicCardFromSource(chain.id, button.dataset.createLogic));
  });
  archiveList.querySelectorAll("[data-edit-logic]").forEach((button) => {
    button.addEventListener("click", () => editLogicCard(button.dataset.editLogic));
  });
  archiveList.querySelectorAll("[data-logic-move]").forEach((button) => {
    button.addEventListener("click", () =>
      moveLogicCard(button.dataset.logicMove, Number(button.dataset.direction))
    );
  });
  archiveList.querySelectorAll("[data-edit-update]").forEach((button) => {
    button.addEventListener("click", () => editUpdate(chain.id, button.dataset.editUpdate));
  });
}

function resetPackageInspection() {
  state.packagePayload = null;
  state.packageInspection = null;
  importPackageButton.disabled = true;
  const files = [...packageFolder.files];
  packageInspection.innerHTML = files.length
    ? `<p class="archive-empty">已选择 ${files.length} 个文件，点击“检测资料包”。</p>`
    : `<p class="archive-empty">尚未选择资料包。</p>`;
}

async function inspectSelectedPackage() {
  const files = [...packageFolder.files];
  if (!files.length) {
    setNotice("请先选择研究包文件夹。", "error");
    return;
  }
  setBusy(inspectPackageButton, true, "正在检测…");
  importPackageButton.disabled = true;
  try {
    state.packagePayload = { files: await Promise.all(files.map(serializePackageFile)) };
    const chainId = packageChainSelect.value;
    state.packageInspection = await apiRequest(
      `./api/v1/admin/chains/${encodeURIComponent(chainId)}/research-packages/inspect`,
      { method: "POST", body: JSON.stringify(state.packagePayload) }
    );
    renderPackageInspection();
    importPackageButton.disabled = !state.packageInspection.valid;
    setNotice(
      state.packageInspection.valid ? "资料包检测通过，可以确认入库。" : "资料包存在阻断错误，请修正后重新检测。",
      state.packageInspection.valid ? "success" : "error"
    );
  } catch (error) {
    packageInspection.innerHTML = `<p class="archive-empty">${escapeHtml(error.message)}</p>`;
    setNotice(error.message, "error");
  } finally {
    setBusy(inspectPackageButton, false, "检测资料包");
  }
}

async function importSelectedPackage(event) {
  event.preventDefault();
  if (!state.packageInspection?.valid || !state.packagePayload) return;
  setBusy(importPackageButton, true, "正在入库…");
  try {
    const chainId = packageChainSelect.value;
    const result = await apiRequest(
      `./api/v1/admin/chains/${encodeURIComponent(chainId)}/research-packages`,
      { method: "POST", body: JSON.stringify(state.packagePayload) }
    );
    setNotice(`${result.researchPackage.topicTitle}已入库。`, "success");
    state.archiveChainId = chainId;
    await refreshLibrary(chainId);
    archiveSelect.value = chainId;
    packageFolder.value = "";
    resetPackageInspection();
    document.querySelector("#archive").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    setNotice(error.message, "error");
  } finally {
    setBusy(importPackageButton, false, "确认入库");
    importPackageButton.disabled = !state.packageInspection?.valid;
  }
}

function renderPackageInspection() {
  const result = state.packageInspection;
  const preview = result.preview || {};
  packageInspection.innerHTML = `
    <div class="package-preview ${result.valid ? "valid" : "invalid"}">
      <div>
        <span>${result.valid ? "检测通过" : "检测失败"}</span>
        <h3>${escapeHtml(preview.title || "未识别标题")}</h3>
        <p>${escapeHtml(preview.topicTitle || "未识别主题")} · ${escapeHtml(preview.topicId || "无主题 ID")}</p>
      </div>
      <dl>
        <div><dt>逻辑</dt><dd>${preview.logicCount || 0}</dd></div>
        <div><dt>监控</dt><dd>${preview.monitorCount || 0}</dd></div>
        <div><dt>公司</dt><dd>${preview.companyCount || 0}</dd></div>
        <div><dt>资源</dt><dd>${preview.assetCount || 0}</dd></div>
      </dl>
    </div>
    ${renderInspectionIssues("阻断错误", result.errors, "error")}
    ${renderInspectionIssues("提示", result.warnings, "warning")}
  `;
}

function renderInspectionIssues(title, items, type) {
  if (!items?.length) return "";
  return `
    <section class="inspection-issues ${type}">
      <strong>${escapeHtml(title)}（${items.length}）</strong>
      <ul>${items.map((item) => `
        <li><span>${escapeHtml(item.message)}</span><small>${escapeHtml(item.location || "")}</small></li>
      `).join("")}</ul>
    </section>
  `;
}

async function serializePackageFile(file) {
  const relativePath = file.webkitRelativePath || file.name;
  if (/^text\//.test(file.type) || /\.(?:html?|md|json|svg)$/i.test(file.name)) {
    return { path: relativePath, type: file.type, encoding: "utf8", content: await file.text() };
  }
  return { path: relativePath, type: file.type, encoding: "base64", content: await fileToBase64(file) };
}

async function fileToBase64(file) {
  const dataUrl = await fileToDataUrl(file);
  return String(dataUrl).split(",", 2)[1] || "";
}

function renderLogicCardArchive() {
  if (!state.logicCards.length) {
    return `<p class="archive-empty">还没有逻辑卡，可从资料卡点击“提炼逻辑卡”。</p>`;
  }
  return state.logicCards.map((card) => `
    <article class="archive-item logic-card-record">
      <div class="archive-item-head">
        <span>${escapeHtml(card.trackTitle)}</span>
        <small>${card.status === "published" ? "已发布" : "草稿"}</small>
      </div>
      <h3>${escapeHtml(card.title)}</h3>
      <p>${escapeHtml(card.summary)}</p>
      <div class="archive-item-meta">
        <span>${escapeHtml(logicDisplayLabel(card.display))}</span>
        <span>排序 ${escapeHtml(card.order)}</span>
        ${card.sourceId ? "<span>已关联资料</span>" : ""}
      </div>
      <div class="archive-item-actions">
        <button type="button" data-edit-logic="${escapeHtml(card.id)}">编辑逻辑卡</button>
        <button type="button" data-logic-move="${escapeHtml(card.id)}" data-direction="-1">上移</button>
        <button type="button" data-logic-move="${escapeHtml(card.id)}" data-direction="1">下移</button>
      </div>
    </article>
  `).join("");
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
  renderSourceMarkdownAnalysis();
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
    renderSourceMarkdownAnalysis();
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
  renderSourceMarkdownAnalysis();
}

function renderSourceMarkdownAnalysis() {
  const markdown = sourceMarkdownInput.value.trim();
  if (!markdown) {
    sourceMarkdownAnalysis.textContent =
      "粘贴或上传完整 Markdown 后，将在这里检查标题和配图位置。";
    return;
  }
  const headings = [...markdown.matchAll(/^(#{1,4})\s+(.+)$/gm)]
    .map((match) => ({ level: match[1].length, text: match[2].trim() }));
  const hasTitle = headings.some((heading) => heading.level === 1);
  const analyzedHeadings = hasTitle ? headings : [
    { level: 1, text: sourceForm.elements.title.value.trim() || "资料标题" },
    ...headings
  ];
  const titleMessage = hasTitle
    ? "已识别一级标题"
    : `缺少一级标题，保存时将自动补为“${sourceForm.elements.title.value.trim() || "资料标题"}”`;
  const imageMessages = state.sourceAssets.map((asset) => {
    const matched = findMarkdownHeading(analyzedHeadings, asset.afterHeading);
    return matched
      ? `“${asset.alt || "配图"}” → ${matched.text}`
      : `“${asset.alt || "配图"}”暂未匹配章节`;
  });
  sourceMarkdownAnalysis.textContent = [
    titleMessage,
    `共 ${headings.length} 个标题`,
    ...imageMessages
  ].join("；");
}

function findMarkdownHeading(headings, afterHeading) {
  const target = String(afterHeading || "").trim();
  if (!target) return headings.find((heading) => heading.level === 1) || headings[0];
  const exact = headings.find((heading) => heading.text === target);
  if (exact) return exact;
  const targetKey = markdownHeadingKey(target);
  if (!targetKey) return null;
  return headings.find((heading) => {
    const key = markdownHeadingKey(heading.text);
    return Boolean(key) && (
      key === targetKey ||
      (targetKey.length >= 4 && (key.includes(targetKey) || targetKey.includes(key)))
    );
  }) || null;
}

function markdownHeadingKey(value) {
  return String(value || "")
    .replace(/^\s*第?[一二三四五六七八九十百\d.、（）() -]+(?:章|节)?\s*/, "")
    .split(/[：:——]/, 1)[0]
    .replace(/[^\w\u4e00-\u9fa5]+/g, "")
    .toLowerCase();
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
    renderSourceMarkdownAnalysis();
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
  renderSourceMarkdownAnalysis();
  document.querySelector("#sourceFormTitle").textContent = "新增资料归档";
  document.querySelector("#sourceFormDescription").textContent =
    "先保存完整来源和原文，再决定是否提炼逻辑卡或发布为动态追踪。";
  sourceForm.querySelector("button[type='submit']").textContent = "保存资料归档";
  cancelSourceEdit.hidden = true;
}

function startLogicCardFromSource(chainId, sourceId) {
  resetLogicCardForm(chainId);
  logicCardSourceSelect.value = sourceId;
  const source = state.library.chains
    .find((chain) => chain.id === chainId)?.sources?.find((item) => item.id === sourceId);
  if (source) {
    logicCardForm.elements.trackId.value =
      state.logicTracks[0]?.id || `${chainId}-research`;
    logicCardForm.elements.trackTitle.value =
      state.logicTracks[0]?.title || `${source.segment || source.title}核心逻辑`;
    logicCardForm.elements.trackSummary.value =
      state.logicTracks[0]?.summary || source.summary || "";
    logicCardForm.elements.articleAnchor.value = "";
  }
  document.querySelector("#logic-cards").scrollIntoView({ behavior: "smooth", block: "start" });
  logicCardForm.elements.title.focus();
}

function editLogicCard(cardId) {
  const card = state.logicCards.find((item) => item.id === cardId);
  if (!card) return;
  const chain = state.library.chains.find((item) => item.id === state.archiveChainId);
  const sourceId = card.sourceId || findLogicCardSourceId(chain, card);
  logicCardChainSelect.value = state.archiveChainId;
  renderLogicSourceOptions(sourceId);
  logicCardForm.elements.cardId.value = card.id;
  [
    "trackId", "trackTitle", "trackSummary", "kicker",
    "title", "summary", "conclusion", "articleAnchor", "order", "status", "display"
  ].forEach((name) => {
    if (logicCardForm.elements[name]) logicCardForm.elements[name].value = card[name] ?? "";
  });
  logicCardForm.elements.sourceId.value = sourceId;
  logicCardForm.elements.companies.value = (card.attachments || [])
    .filter((item) => item.type === "company").map((item) => item.label).join("、");
  logicCardForm.elements.segments.value = (card.attachments || [])
    .filter((item) => item.type !== "company").map((item) => item.label).join("、");
  logicCardContent.value = JSON.stringify(logicCardContentValue(card), null, 2);
  updateLogicContentHint();
  document.querySelector("#logicCardFormTitle").textContent = "编辑逻辑卡";
  logicCardForm.querySelector("button[type='submit']").textContent = "保存逻辑卡修改";
  cancelLogicCardEdit.hidden = false;
  document.querySelector("#logic-cards").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function saveLogicCard(event) {
  event.preventDefault();
  const button = logicCardForm.querySelector("button[type='submit']");
  setBusy(button, true, "正在保存…");
  try {
    const fields = Object.fromEntries(new FormData(logicCardForm).entries());
    const chainId = fields.chainId;
    const cardId = fields.cardId;
    const chain = state.library.chains.find((item) => item.id === chainId);
    const existingCard = state.logicCards.find((item) => item.id === cardId);
    const source = chain?.sources?.find((item) => item.id === fields.sourceId);
    let content = {};
    try {
      content = logicCardContent.value.trim() ? JSON.parse(logicCardContent.value) : {};
    } catch {
      throw new Error("结构化内容不是有效 JSON，请根据示例检查括号和引号。");
    }
    const payload = {
      ...fields,
      content,
      attachments: [
        ...splitAdminList(fields.companies).map((label) => ({ type: "company", label })),
        ...splitAdminList(fields.segments)
          .map((label) => logicAttachmentForLabel(chain, label, existingCard?.attachments))
      ],
      sources: source ? [{
        label: source.markdownUrl ? "阅读全文" : "查看来源",
        type: source.markdownUrl ? "article" : "external",
        title: source.title,
        url: source.markdownUrl || source.originalUrl,
        anchor: fields.articleAnchor
      }] : []
    };
    delete payload.chainId;
    delete payload.cardId;
    delete payload.companies;
    delete payload.segments;
    await apiRequest(
      cardId
        ? `./api/v1/admin/chains/${encodeURIComponent(chainId)}/logic-cards/${encodeURIComponent(cardId)}`
        : `./api/v1/admin/chains/${encodeURIComponent(chainId)}/logic-cards`,
      { method: cardId ? "PUT" : "POST", body: JSON.stringify(payload) }
    );
    setNotice(cardId ? "逻辑卡已更新。" : "逻辑卡已创建。", "success");
    state.archiveChainId = chainId;
    await refreshLibrary(chainId);
    resetLogicCardForm(chainId);
  } catch (error) {
    setNotice(error.message, "error");
  } finally {
    setBusy(button, false, "保存逻辑卡");
  }
}

async function moveLogicCard(cardId, direction) {
  const card = state.logicCards.find((item) => item.id === cardId);
  if (!card) return;
  const group = state.logicCards
    .filter((item) => item.trackId === card.trackId)
    .sort((left, right) => Number(left.order) - Number(right.order));
  const index = group.findIndex((item) => item.id === cardId);
  const target = group[index + direction];
  if (!target) return;
  const leftOrder = card.order;
  await updateLogicCardOrder(card, target.order);
  await updateLogicCardOrder(target, leftOrder);
  await loadLogicCards();
  renderArchive();
  setNotice("逻辑卡顺序已更新。", "success");
}

function updateLogicCardOrder(card, order) {
  return apiRequest(
    `./api/v1/admin/chains/${encodeURIComponent(state.archiveChainId)}/logic-cards/${encodeURIComponent(card.id)}`,
    { method: "PUT", body: JSON.stringify({ ...card, content: logicCardContentValue(card), order }) }
  );
}

function resetLogicCardForm(chainId = state.archiveChainId || logicCardChainSelect.value) {
  logicCardForm.reset();
  renderChainOptions(logicCardChainSelect, chainId);
  renderLogicSourceOptions();
  logicCardForm.elements.order.value = String(
    Math.max(0, ...state.logicCards.map((card) => Number(card.order) || 0)) + 1
  );
  logicCardForm.elements.status.value = "draft";
  logicCardForm.elements.display.value = "points";
  logicCardForm.elements.cardId.value = "";
  document.querySelector("#logicCardFormTitle").textContent = "新增逻辑卡";
  logicCardForm.querySelector("button[type='submit']").textContent = "保存逻辑卡";
  cancelLogicCardEdit.hidden = true;
  setLogicContentTemplate(true);
}

function setLogicContentTemplate(force) {
  if (!force && logicCardContent.value.trim()) {
    updateLogicContentHint();
    return;
  }
  logicCardContent.value = JSON.stringify(logicContentTemplate(logicCardDisplay.value), null, 2);
  updateLogicContentHint();
}

function updateLogicContentHint() {
  logicCardContentHint.textContent = {
    points: "要点卡：每项包含 label 和 description。",
    metrics: "指标条：每项包含 label、value、scale（0-100）和 description。",
    formula: "公式链：按顺序填写字符串数组。",
    comparison: "公司对比：每项包含 name、position 和 reason。",
    table: "表格：columns 为表头数组，rows 为二维数组。",
    text: "纯结论无需结构化内容，可保留空对象。"
  }[logicCardDisplay.value];
}

function logicContentTemplate(display) {
  if (display === "points") return { points: [{ label: "要点名称", description: "解释这一要点" }] };
  if (display === "metrics") {
    return { metrics: [{ label: "指标", value: "约30%", scale: 30, description: "指标口径" }] };
  }
  if (display === "formula") return { formula: ["原料占比", "传导比例", "最终影响"] };
  if (display === "comparison") {
    return { comparison: [{ name: "公司A", position: "业务定位", reason: "弹性来源" }] };
  }
  if (display === "table") {
    return { table: { columns: ["比较维度", "公司A", "公司B"], rows: [["业务纯度", "高", "中"]] } };
  }
  return {};
}

function logicCardContentValue(card) {
  if (card.display === "points") return { points: card.points || [] };
  if (card.display === "metrics") return { metrics: card.metrics || [] };
  if (card.display === "formula") return { formula: card.formula || [] };
  if (card.display === "comparison") return { comparison: card.comparison || [] };
  if (card.display === "table") return { table: card.table || { columns: [], rows: [] } };
  return {};
}

function logicDisplayLabel(display) {
  return {
    points: "要点卡",
    metrics: "指标条",
    formula: "公式链",
    comparison: "公司对比",
    table: "表格",
    text: "纯结论"
  }[display] || "逻辑卡";
}

function findLogicCardSourceId(chain, card) {
  const sourceUrls = new Set((card.sources || []).map((source) => normalizeAdminUrl(source.url)));
  return (chain?.sources || []).find((source) =>
    sourceUrls.has(normalizeAdminUrl(source.markdownUrl)) ||
    sourceUrls.has(normalizeAdminUrl(source.originalUrl))
  )?.id || "";
}

function normalizeAdminUrl(value) {
  return String(value || "").trim().replace(/^\.?\//, "");
}

function logicAttachmentForLabel(chain, label, existingAttachments = []) {
  const existing = existingAttachments.find((item) => item.label === label);
  if (existing) return existing;
  const normalized = String(label || "").trim().toLowerCase();
  const chainTitle = String(chain?.title || "").toLowerCase();
  if (normalized === chainTitle || normalized === String(chain?.shortTitle || "").toLowerCase()) {
    return {
      type: "chain",
      label,
      target: `${chain.id}:chain:0`
    };
  }
  for (const [sectionIndex, section] of (chain?.chain || []).entries()) {
    const sectionText = `${section.id || ""} ${section.title || ""}`.toLowerCase();
    if (sectionText.includes(normalized) || normalized.includes(String(section.title || "").toLowerCase())) {
      return {
        type: "segment",
        label,
        target: `${chain.id}:chain:${sectionIndex}`
      };
    }
    for (const [itemIndex, item] of (section.items || []).entries()) {
      const itemText = `${item.name || ""} ${item.detail || ""}`.toLowerCase();
      if (itemText.includes(normalized) || normalized.includes(String(item.name || "").toLowerCase())) {
        return {
          type: "segment",
          label,
          target: `${chain.id}:chain-item:${sectionIndex}-${itemIndex}`
        };
      }
    }
  }
  return { type: "topic", label };
}

function splitAdminList(value) {
  return String(value || "").split(/[、,，\n]/).map((item) => item.trim()).filter(Boolean);
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
  if (!response.ok) {
    const error = new Error(payload.message || `请求失败（${response.status}）`);
    error.code = payload.error || "";
    throw error;
  }
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
