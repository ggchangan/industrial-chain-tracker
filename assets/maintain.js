const state = {
  library: null,
  loadedChainId: "",
  archiveChainId: "",
  sourceAssets: [],
  logicCards: [],
  logicTracks: [],
  logicRadarFilters: {
    chainId: "all",
    priority: "all",
    kind: "all",
    decision: "all"
  },
  radarDecisions: {},
  radarVerificationTasks: [],
  settlingRadarTaskId: "",
  feedbackItems: [],
  users: [],
  packagePayload: null,
  packageInspection: null,
  verificationChainId: ""
};
const notice = document.querySelector("#adminNotice");
const articleForm = document.querySelector("#editArticleForm");
const updateForm = document.querySelector("#addUpdateForm");
const updateShareText = document.querySelector("#updateShareText");
const parseUpdateShare = document.querySelector("#parseUpdateShare");
const sourceForm = document.querySelector("#addSourceForm");
const grid = document.querySelector("#maintenanceGrid");
const search = document.querySelector("#maintainSearch");
const articleSelect = document.querySelector("#articleChainId");
const updateSelect = document.querySelector("#updateChainId");
const sourceSelect = document.querySelector("#sourceChainId");
const archiveSelect = document.querySelector("#archiveChainId");
const archiveSummary = document.querySelector("#archiveSummary");
const archiveList = document.querySelector("#archiveList");
const logicRadarSummary = document.querySelector("#logicRadarSummary");
const logicRadarInbox = document.querySelector("#logicRadarInbox");
const logicRadarChainFilter = document.querySelector("#logicRadarChainFilter");
const logicRadarPriorityFilter = document.querySelector("#logicRadarPriorityFilter");
const logicRadarKindFilter = document.querySelector("#logicRadarKindFilter");
const logicRadarDecisionFilter = document.querySelector("#logicRadarDecisionFilter");
const feedbackInbox = document.querySelector("#feedbackInbox");
const userMembershipList = document.querySelector("#userMembershipList");
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
const radarVerificationTasks = document.querySelector("#radarVerificationTasks");
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
  parseUpdateShare.addEventListener("click", preprocessUpdateShareText);
  logicRadarChainFilter.addEventListener("change", updateLogicRadarFilters);
  logicRadarPriorityFilter.addEventListener("change", updateLogicRadarFilters);
  logicRadarKindFilter.addEventListener("change", updateLogicRadarFilters);
  logicRadarDecisionFilter.addEventListener("change", updateLogicRadarFilters);
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
  await loadRadarDecisions();
  await loadRadarVerificationTasks();
  await loadFeedback();
  await loadUsers();
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
    renderLogicRadarFilterOptions();
    renderChainOptions(
      verificationChainSelect,
      state.verificationChainId || preferredChainId || verificationChainSelect.value
    );
    state.verificationChainId = verificationChainSelect.value;
    state.archiveChainId = archiveSelect.value;
    await loadLogicCards();
    renderLogicSourceOptions();
    renderLogicRadarInbox();
    renderArchive();
    renderVerificationMonitors();
    renderRadarVerificationTasks();
    renderCards(search.value);
    document.querySelector("#maintainUpdatedAt").textContent = `更新：${state.library.meta.updated}`;
  } catch (error) {
    setNotice(error.message, "error");
  }
}

async function loadFeedback() {
  try {
    const payload = await apiRequest("./api/v1/admin/feedback");
    state.feedbackItems = payload.feedback || [];
    renderFeedbackInbox();
  } catch (error) {
    setNotice(error.message, "error");
  }
}

async function loadUsers() {
  try {
    const payload = await apiRequest("./api/v1/admin/users");
    state.users = payload.users || [];
    renderUserMemberships();
  } catch (error) {
    setNotice(error.message, "error");
  }
}

async function loadRadarDecisions() {
  try {
    const payload = await apiRequest("./api/v1/admin/radar-decisions");
    state.radarDecisions = Object.fromEntries((payload.decisions || []).map((item) => [item.id, item]));
    renderLogicRadarInbox();
  } catch (error) {
    setNotice(error.message, "error");
  }
}

async function loadRadarVerificationTasks() {
  try {
    const payload = await apiRequest("./api/v1/admin/radar-verification-tasks");
    state.radarVerificationTasks = payload.tasks || [];
    renderRadarVerificationTasks();
  } catch (error) {
    setNotice(error.message, "error");
  }
}

function renderUserMemberships() {
  if (!userMembershipList) return;
  const users = state.users || [];
  if (!users.length) {
    userMembershipList.innerHTML = `<p class="archive-empty">暂无登录用户。用户从小程序或网页同步账号后会出现在这里。</p>`;
    return;
  }
  userMembershipList.innerHTML = users.map((user) => {
    const membership = user.membership || { tier: "free", status: "inactive", expiresAt: "" };
    return `
      <article class="archive-item user-membership-item">
        <div class="archive-item-head">
          <span>${escapeHtml(membershipLabel(membership))}</span>
          <small>${escapeHtml(formatDateTime(user.lastSeenAt || user.createdAt))}</small>
        </div>
        <h3>${escapeHtml(user.id)}</h3>
        <p>${escapeHtml(user.openid || user.unionid || "无公开身份标识")}</p>
        <div class="archive-item-meta">
          <span>收藏 ${escapeHtml(user.counts?.favorites || 0)}</span>
          <span>订阅 ${escapeHtml(user.counts?.subscriptions || 0)}</span>
          <span>阅读 ${escapeHtml(user.counts?.readingHistory || 0)}</span>
        </div>
        <div class="archive-item-actions membership-actions">
          <label>
            <span>档位</span>
            <select data-membership-tier="${escapeHtml(user.id)}">
              ${membershipTierOptions(membership.tier)}
            </select>
          </label>
          <label>
            <span>状态</span>
            <select data-membership-status="${escapeHtml(user.id)}">
              ${membershipStatusOptions(membership.status)}
            </select>
          </label>
          <label>
            <span>到期时间</span>
            <input data-membership-expires="${escapeHtml(user.id)}" type="date" value="${escapeHtml((membership.expiresAt || "").slice(0, 10))}" />
          </label>
          <button type="button" data-membership-save="${escapeHtml(user.id)}">保存会员</button>
        </div>
      </article>
    `;
  }).join("");
  userMembershipList.querySelectorAll("[data-membership-save]").forEach((button) => {
    button.addEventListener("click", () => saveUserMembership(button.dataset.membershipSave));
  });
}

async function saveUserMembership(userId) {
  const escaped = CSS.escape(userId);
  const tier = userMembershipList.querySelector(`[data-membership-tier="${escaped}"]`)?.value || "free";
  const status = userMembershipList.querySelector(`[data-membership-status="${escaped}"]`)?.value || "inactive";
  const expiresAt = userMembershipList.querySelector(`[data-membership-expires="${escaped}"]`)?.value || "";
  try {
    await apiRequest(`./api/v1/admin/users/${encodeURIComponent(userId)}/membership`, {
      method: "PUT",
      body: JSON.stringify({ tier, status, expiresAt })
    });
    await loadUsers();
    setNotice("用户会员状态已更新。", "success");
  } catch (error) {
    setNotice(error.message, "error");
  }
}

function membershipLabel(membership = {}) {
  const tier = {
    free: "免费",
    pro: "Pro",
    team: "Team",
    admin: "Admin"
  }[membership.tier] || "免费";
  const status = {
    active: "有效",
    inactive: "未开通",
    trialing: "试用",
    expired: "已过期",
    canceled: "已取消"
  }[membership.status] || membership.status || "未开通";
  return `${tier} · ${status}`;
}

function membershipTierOptions(current) {
  return ["free", "pro", "team", "admin"].map((tier) =>
    `<option value="${tier}" ${tier === current ? "selected" : ""}>${escapeHtml({
      free: "免费",
      pro: "Pro",
      team: "Team",
      admin: "Admin"
    }[tier])}</option>`
  ).join("");
}

function membershipStatusOptions(current) {
  return ["inactive", "active", "trialing", "expired", "canceled"].map((status) =>
    `<option value="${status}" ${status === current ? "selected" : ""}>${escapeHtml({
      inactive: "未开通",
      active: "有效",
      trialing: "试用",
      expired: "已过期",
      canceled: "已取消"
    }[status])}</option>`
  ).join("");
}

function renderFeedbackInbox() {
  if (!feedbackInbox) return;
  const items = state.feedbackItems || [];
  if (!items.length) {
    feedbackInbox.innerHTML = `<p class="archive-empty">暂无公开页反馈。</p>`;
    return;
  }
  feedbackInbox.innerHTML = items.map((item) => `
    <article class="archive-item feedback-item status-${escapeHtml(item.status)}">
      <div class="archive-item-head">
        <span>${escapeHtml(feedbackTypeLabel(item.type))}</span>
        <small>${escapeHtml(formatDateTime(item.createdAt))}</small>
      </div>
      <h3>${escapeHtml(item.chainTitle || "未指定产业链")}</h3>
      <p>${escapeHtml(item.message)}</p>
      <div class="archive-item-meta">
        <span>${escapeHtml(feedbackStatusLabel(item.status))}</span>
        ${item.contact ? `<span>联系：${escapeHtml(item.contact)}</span>` : ""}
        ${item.pageUrl ? `<span>页面：${escapeHtml(item.pageUrl)}</span>` : ""}
      </div>
      <div class="archive-item-actions feedback-actions">
        <label>
          <span>处理状态</span>
          <select data-feedback-status="${escapeHtml(item.id)}">
            ${feedbackStatusOptions(item.status)}
          </select>
        </label>
        <label>
          <span>处理备注</span>
          <textarea data-feedback-notes="${escapeHtml(item.id)}" rows="2">${escapeHtml(item.adminNotes || "")}</textarea>
        </label>
        <button type="button" data-feedback-save="${escapeHtml(item.id)}">保存处理</button>
      </div>
    </article>
  `).join("");
  feedbackInbox.querySelectorAll("[data-feedback-save]").forEach((button) => {
    button.addEventListener("click", () => saveFeedbackUpdate(button.dataset.feedbackSave));
  });
}

async function saveFeedbackUpdate(feedbackId) {
  const status = feedbackInbox.querySelector(`[data-feedback-status="${CSS.escape(feedbackId)}"]`)?.value || "open";
  const adminNotes = feedbackInbox.querySelector(`[data-feedback-notes="${CSS.escape(feedbackId)}"]`)?.value || "";
  try {
    await apiRequest(`./api/v1/admin/feedback/${encodeURIComponent(feedbackId)}`, {
      method: "PUT",
      body: JSON.stringify({ status, adminNotes })
    });
    await loadFeedback();
    setNotice("反馈处理状态已更新。", "success");
  } catch (error) {
    setNotice(error.message, "error");
  }
}

function feedbackTypeLabel(type) {
  return {
    suggestion: "产品建议",
    bug: "问题反馈",
    content: "内容补充",
    cooperation: "合作线索",
    other: "其他"
  }[type] || "反馈";
}

function feedbackStatusLabel(status) {
  return {
    open: "待处理",
    reviewing: "处理中",
    planned: "已规划",
    resolved: "已解决",
    closed: "已关闭"
  }[status] || "待处理";
}

function feedbackStatusOptions(current) {
  return ["open", "reviewing", "planned", "resolved", "closed"].map((status) =>
    `<option value="${status}" ${status === current ? "selected" : ""}>${escapeHtml(feedbackStatusLabel(status))}</option>`
  ).join("");
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}

function renderLogicRadarInbox() {
  if (!logicRadarSummary || !logicRadarInbox) return;
  const allItems = buildLogicRadarInboxItems();
  const items = filterLogicRadarItems(allItems);
  const pending = items.filter((item) => item.kind === "pending-verification").length;
  const changed = items.filter((item) => item.kind === "logic-change").length;
  const sources = items.filter((item) => item.kind === "new-source").length;
  logicRadarSummary.innerHTML = `
    <article><span>待核验</span><strong>${pending}</strong><small>需要人工判断</small></article>
    <article><span>逻辑变化</span><strong>${changed}</strong><small>研究包/核验触发</small></article>
    <article><span>最新资料</span><strong>${sources}</strong><small>可继续提炼</small></article>
    <article><span>筛选结果</span><strong>${items.length}</strong><small>共 ${allItems.length} 条信号</small></article>
  `;
  if (!items.length) {
    logicRadarInbox.innerHTML = `<p class="archive-empty">当前筛选条件下暂无雷达信号。可以切回全部产业链、全部优先级或全部信号查看。</p>`;
    return;
  }
  logicRadarInbox.innerHTML = items.slice(0, 18).map((item) => `
    <article class="archive-item logic-radar-inbox-item radar-${escapeHtml(item.priority)}">
      <div class="archive-item-head">
        <span>${escapeHtml(item.kindLabel)} · ${escapeHtml(radarDecisionLabel(item.decision.status))}</span>
        <small>${escapeHtml(item.date || "无日期")}</small>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <div class="archive-item-meta">
        <span>${escapeHtml(item.chainTitle)}</span>
        <span>${escapeHtml(item.priorityLabel)}</span>
        ${item.source ? `<span>${escapeHtml(item.source)}</span>` : ""}
      </div>
      <div class="archive-item-actions">
        <button type="button" data-radar-chain="${escapeHtml(item.chainId)}" data-radar-target="${escapeHtml(item.target)}">${escapeHtml(item.action)}</button>
        <button type="button" data-radar-task="${escapeHtml(item.id)}">转入核验任务</button>
        <a href="./index.html?chain=${encodeURIComponent(item.chainId)}#${escapeHtml(item.publicHash)}" target="_blank" rel="noopener noreferrer">查看公开页</a>
      </div>
      <div class="radar-decision-actions">
        <label>
          <span>处理状态</span>
          <select data-radar-decision-status="${escapeHtml(item.id)}">
            ${radarDecisionOptions(item.decision.status)}
          </select>
        </label>
        <label>
          <span>处理备注</span>
          <input data-radar-decision-notes="${escapeHtml(item.id)}" type="text" value="${escapeHtml(item.decision.notes || "")}" placeholder="记录判断、后续动作或忽略原因" />
        </label>
        <button type="button" data-radar-decision-save="${escapeHtml(item.id)}">保存状态</button>
      </div>
    </article>
  `).join("");
  logicRadarInbox.querySelectorAll("[data-radar-chain]").forEach((button) => {
    button.addEventListener("click", () =>
      openRadarTarget(button.dataset.radarChain, button.dataset.radarTarget)
        .catch((error) => setNotice(error.message, "error"))
    );
  });
  logicRadarInbox.querySelectorAll("[data-radar-decision-save]").forEach((button) => {
    button.addEventListener("click", () =>
      saveRadarDecision(button.dataset.radarDecisionSave)
        .catch((error) => setNotice(error.message, "error"))
    );
  });
  logicRadarInbox.querySelectorAll("[data-radar-task]").forEach((button) => {
    button.addEventListener("click", () =>
      createRadarVerificationTask(button.dataset.radarTask)
        .catch((error) => setNotice(error.message, "error"))
    );
  });
}

function updateLogicRadarFilters() {
  state.logicRadarFilters = {
    chainId: logicRadarChainFilter.value || "all",
    priority: logicRadarPriorityFilter.value || "all",
    kind: logicRadarKindFilter.value || "all",
    decision: logicRadarDecisionFilter.value || "all"
  };
  renderLogicRadarInbox();
}

function renderLogicRadarFilterOptions() {
  const current = state.logicRadarFilters.chainId || "all";
  logicRadarChainFilter.innerHTML = [
    `<option value="all">全部产业链</option>`,
    ...state.library.chains.map((chain) =>
      `<option value="${escapeHtml(chain.id)}">${escapeHtml(chain.title)}</option>`
    )
  ].join("");
  logicRadarChainFilter.value = [...logicRadarChainFilter.options].some((option) => option.value === current)
    ? current
    : "all";
  state.logicRadarFilters.chainId = logicRadarChainFilter.value;
  logicRadarPriorityFilter.value = state.logicRadarFilters.priority || "all";
  logicRadarKindFilter.value = state.logicRadarFilters.kind || "all";
  logicRadarDecisionFilter.value = state.logicRadarFilters.decision || "all";
}

function filterLogicRadarItems(items) {
  const { chainId, priority, kind, decision } = state.logicRadarFilters;
  return items.filter((item) =>
    (chainId === "all" || item.chainId === chainId) &&
    (priority === "all" || item.priority === priority) &&
    (kind === "all" || item.kind === kind) &&
    (decision === "all" || item.decision.status === decision)
  );
}

function buildLogicRadarInboxItems() {
  return (state.library?.chains || []).flatMap((chain) => [
    ...pendingVerificationItems(chain),
    ...logicChangeItems(chain),
    ...newSourceItems(chain),
    ...latestVerificationItems(chain)
  ]).map(withRadarDecision).sort((left, right) =>
    priorityScore(right.priority) - priorityScore(left.priority) ||
    String(right.date || "").localeCompare(String(left.date || ""))
  );
}

function withRadarDecision(item) {
  const id = radarItemId(item);
  return {
    ...item,
    id,
    decision: state.radarDecisions[id] || { status: "open", notes: "" }
  };
}

function radarItemId(item) {
  return [
    item.kind,
    item.chainId,
    item.target,
    item.date || "nodate",
    normalizeRadarIdPart(item.title)
  ].join(":");
}

function normalizeRadarIdPart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || "untitled";
}

function pendingVerificationItems(chain) {
  return (chain.trackingProfile?.metrics || [])
    .filter((item) => item.topicTitle && item.id && !item.latestVerification)
    .map((item) => ({
      kind: "pending-verification",
      kindLabel: "待核验",
      priority: radarPriorityForMonitor(item),
      priorityLabel: item.executionStatus === "planned" ? "新监控项" : trackingStatusLabel(item.executionStatus),
      chainId: chain.id,
      chainTitle: chain.title,
      date: item.updatedAt?.slice(0, 10) || "",
      title: `${item.topicTitle} · ${item.name}`,
      summary: item.why || item.logicTitle || "需要补充最新证据并判断逻辑是否强化、减弱或失效。",
      source: item.logicTitle || "",
      target: `verification:${item.id}`,
      publicHash: "updates",
      action: "去核验"
    }));
}

function logicChangeItems(chain) {
  return (chain.updates || [])
    .filter((item) => item.logicTrack || item.verificationId || /逻辑|研究|核验|反证|强化|减弱|失效/.test(`${item.signal} ${item.impact}`))
    .slice(0, 5)
    .map((item) => ({
      kind: "logic-change",
      kindLabel: item.verificationId ? "核验变化" : "逻辑变化",
      priority: item.verificationId || /失效|反证|减弱/.test(`${item.signal} ${item.impact}`) ? "high" : "medium",
      priorityLabel: item.confidence || "待判断",
      chainId: chain.id,
      chainTitle: chain.title,
      date: item.date || "",
      title: item.signal || item.segment || "逻辑变化",
      summary: item.impact || item.notes || "新的资料或核验改变了产业链判断。",
      source: item.sourceTitle || "",
      target: "archive",
      publicHash: "activity",
      action: "看档案"
    }));
}

function newSourceItems(chain) {
  return (chain.sources || [])
    .filter((item) => item.status !== "archived")
    .sort((left, right) =>
      String(right.date || right.createdAt || "").localeCompare(String(left.date || left.createdAt || ""))
    )
    .slice(0, 3)
    .map((item) => ({
      kind: "new-source",
      kindLabel: "最新资料",
      priority: radarPriorityForSource(item),
      priorityLabel: sourceStatusLabel(item.status),
      chainId: chain.id,
      chainTitle: chain.title,
      date: item.date || item.createdAt?.slice(0, 10) || "",
      title: item.title,
      summary: item.summary || `${sourceTypeLabel(item.type)} · ${item.platform || "未标平台"}`,
      source: item.platform || sourceTypeLabel(item.type),
      target: "archive",
      publicHash: "activity",
      action: "看资料"
    }));
}

function latestVerificationItems(chain) {
  return (chain.trackingProfile?.metrics || [])
    .filter((item) => item.latestVerification)
    .slice(0, 3)
    .map((item) => ({
      kind: "latest-verification",
      kindLabel: "最近核验",
      priority: ["challenge", "invalidate", "weaken"].includes(item.latestVerification.result) ? "high" : "low",
      priorityLabel: verificationResultLabel(item.latestVerification.result),
      chainId: chain.id,
      chainTitle: chain.title,
      date: item.latestVerification.date || "",
      title: `${item.topicTitle || item.name} · ${item.name}`,
      summary: item.latestVerification.summary,
      source: item.latestVerification.sourceTitle || "",
      target: `verification:${item.id}`,
      publicHash: "updates",
      action: "复核"
    }));
}

async function openRadarTarget(chainId, target) {
  state.archiveChainId = chainId;
  archiveSelect.value = chainId;
  sourceSelect.value = chainId;
  logicCardChainSelect.value = chainId;
  await loadLogicCards();
  renderLogicSourceOptions();
  if (target?.startsWith("verification:")) {
    verificationChainSelect.value = chainId;
    state.verificationChainId = chainId;
    renderVerificationMonitors(target.replace(/^verification:/, ""));
    document.querySelector("#monitor-verifications").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  renderArchive();
  document.querySelector("#archive").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function saveRadarDecision(decisionId) {
  const escaped = CSS.escape(decisionId);
  const status = logicRadarInbox.querySelector(`[data-radar-decision-status="${escaped}"]`)?.value || "open";
  const notes = logicRadarInbox.querySelector(`[data-radar-decision-notes="${escaped}"]`)?.value || "";
  const payload = await apiRequest(`./api/v1/admin/radar-decisions/${encodeURIComponent(decisionId)}`, {
    method: "PUT",
    body: JSON.stringify({ status, notes })
  });
  state.radarDecisions[payload.decision.id] = payload.decision;
  renderLogicRadarInbox();
  setNotice("雷达项处理状态已保存。", "success");
}

async function createRadarVerificationTask(radarId) {
  const item = buildLogicRadarInboxItems().find((entry) => entry.id === radarId);
  if (!item) throw new Error("雷达项不存在，请刷新后重试。");
  const payload = await apiRequest("./api/v1/admin/radar-verification-tasks", {
    method: "POST",
    body: JSON.stringify({
      radarId: item.id,
      chainId: item.chainId,
      kind: item.kind,
      priority: item.priority,
      title: item.title,
      summary: item.summary,
      source: item.source,
      target: item.target,
      notes: item.decision.notes || ""
    })
  });
  const index = state.radarVerificationTasks.findIndex((task) => task.id === payload.task.id);
  if (index >= 0) {
    state.radarVerificationTasks[index] = payload.task;
  } else {
    state.radarVerificationTasks.unshift(payload.task);
  }
  state.radarDecisions[item.id] = {
    ...(state.radarDecisions[item.id] || {}),
    id: item.id,
    status: "verification",
    notes: payload.task.notes || `已转入核验任务：${payload.task.title}`
  };
  renderLogicRadarInbox();
  renderRadarVerificationTasks();
  setNotice("已转入核验任务。", "success");
}

function renderRadarVerificationTasks() {
  if (!radarVerificationTasks) return;
  const tasks = state.radarVerificationTasks || [];
  if (!tasks.length) {
    radarVerificationTasks.innerHTML = `<p class="archive-empty">暂无从雷达转入的核验任务。</p>`;
    return;
  }
  radarVerificationTasks.innerHTML = tasks.slice(0, 12).map((task) => `
    <article class="archive-item radar-verification-task status-${escapeHtml(task.status)} priority-${escapeHtml(task.priority)}">
      <div class="archive-item-head">
        <span>${escapeHtml(radarTaskStatusLabel(task.status))} · ${escapeHtml(radarKindLabel(task.kind))}</span>
        <small>${escapeHtml(formatDateTime(task.createdAt))}</small>
      </div>
      <h3>${escapeHtml(task.title)}</h3>
      <p>${escapeHtml(task.summary)}</p>
      <div class="archive-item-meta">
        <span>${escapeHtml(task.chainTitle)}</span>
        <span>${escapeHtml(radarPriorityLabel(task.priority))}</span>
        ${task.source ? `<span>${escapeHtml(task.source)}</span>` : ""}
      </div>
      <div class="radar-decision-actions radar-task-actions">
        <label>
          <span>任务状态</span>
          <select data-radar-task-status="${escapeHtml(task.id)}">
            ${radarTaskStatusOptions(task.status)}
          </select>
        </label>
        <label>
          <span>任务备注</span>
          <input data-radar-task-notes="${escapeHtml(task.id)}" type="text" value="${escapeHtml(task.notes || "")}" placeholder="记录核验计划、证据来源或处理结论" />
        </label>
        <button type="button" data-radar-task-save="${escapeHtml(task.id)}">保存任务</button>
      </div>
      <div class="archive-item-actions">
        <button type="button" data-radar-task-open="${escapeHtml(task.id)}">处理任务</button>
        <button type="button" data-radar-task-update="${escapeHtml(task.id)}">沉淀为动态</button>
      </div>
    </article>
  `).join("");
  radarVerificationTasks.querySelectorAll("[data-radar-task-save]").forEach((button) => {
    button.addEventListener("click", () =>
      saveRadarVerificationTask(button.dataset.radarTaskSave)
        .catch((error) => setNotice(error.message, "error"))
    );
  });
  radarVerificationTasks.querySelectorAll("[data-radar-task-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const task = state.radarVerificationTasks.find((item) => item.id === button.dataset.radarTaskOpen);
      if (!task) return;
      openRadarTarget(task.chainId, task.target)
        .catch((error) => setNotice(error.message, "error"));
    });
  });
  radarVerificationTasks.querySelectorAll("[data-radar-task-update]").forEach((button) => {
    button.addEventListener("click", () =>
      startUpdateFromRadarTask(button.dataset.radarTaskUpdate)
    );
  });
}

async function saveRadarVerificationTask(taskId) {
  const escaped = CSS.escape(taskId);
  const status = radarVerificationTasks.querySelector(`[data-radar-task-status="${escaped}"]`)?.value || "open";
  const notes = radarVerificationTasks.querySelector(`[data-radar-task-notes="${escaped}"]`)?.value || "";
  const payload = await apiRequest(`./api/v1/admin/radar-verification-tasks/${encodeURIComponent(taskId)}`, {
    method: "PUT",
    body: JSON.stringify({ status, notes })
  });
  const index = state.radarVerificationTasks.findIndex((task) => task.id === taskId);
  if (index >= 0) state.radarVerificationTasks[index] = payload.task;
  renderRadarVerificationTasks();
  setNotice("核验任务已更新。", "success");
}

function startUpdateFromRadarTask(taskId) {
  const task = state.radarVerificationTasks.find((item) => item.id === taskId);
  if (!task) {
    setNotice("未找到这条核验任务。", "error");
    return;
  }
  const chain = state.library.chains.find((item) => item.id === task.chainId);
  resetUpdateForm(task.chainId);
  state.settlingRadarTaskId = task.id;
  updateSelect.value = task.chainId;
  updateForm.elements.type.value = radarTaskUpdateType(task.kind);
  updateForm.elements.segment.value = radarTaskSegment(task, chain);
  updateForm.elements.signal.value = task.title;
  updateForm.elements.impact.value = task.summary;
  updateForm.elements.confidence.value = task.status === "done" ? "已核验" : "待核验";
  updateForm.elements.sourceTitle.value = task.source || task.title;
  updateForm.elements.sourceKind.value = task.kind === "new-source" ? "资料" : "文章";
  updateForm.elements.sourcePlatform.value = task.source || "人工核验";
  updateForm.elements.sourceUrl.value = radarTaskSourceUrl(task, chain);
  updateForm.elements.notes.value = [
    task.notes,
    `来自逻辑雷达任务：${task.title}`,
    task.radarId ? `雷达ID：${task.radarId}` : ""
  ].filter(Boolean).join("\n");
  updateForm.querySelector("button[type='submit']").textContent = "保存动态并完成任务";
  cancelUpdateEdit.hidden = false;
  document.querySelector("#add-update").scrollIntoView({ behavior: "smooth", block: "start" });
  updateForm.elements.impact.focus();
  setNotice("已根据核验任务预填动态草稿，请补充来源链接和影响判断后保存。", "success");
}

function radarTaskUpdateType(kind) {
  if (kind === "pending-verification" || kind === "latest-verification") return "数据变化";
  if (kind === "new-source") return "机构逻辑";
  return "产业事件";
}

function radarTaskSegment(task, chain) {
  const fromTitle = String(task.title || "").split(/[·:：]/, 1)[0].trim();
  if (fromTitle && fromTitle.length <= 30) return fromTitle;
  return chain?.shortTitle || chain?.title || "全产业链";
}

function radarTaskSourceUrl(task, chain) {
  const source = String(task.source || "").trim();
  if (/^https?:\/\//i.test(source)) return source;
  const article = String(chain?.article || "").trim();
  if (/^\.\/content\/[A-Za-z0-9_./-]+$/i.test(article) || /^\/managed\/[A-Za-z0-9_./-]+$/i.test(article)) {
    return article;
  }
  return "";
}

function radarDecisionLabel(status) {
  return {
    open: "待处理",
    reviewed: "已查看",
    verification: "已转核验",
    ignored: "已忽略"
  }[status] || "待处理";
}

function radarDecisionOptions(current) {
  return ["open", "reviewed", "verification", "ignored"].map((status) =>
    `<option value="${status}" ${status === current ? "selected" : ""}>${escapeHtml(radarDecisionLabel(status))}</option>`
  ).join("");
}

function radarTaskStatusLabel(status) {
  return {
    open: "待处理",
    doing: "核验中",
    done: "已完成",
    ignored: "已忽略"
  }[status] || "待处理";
}

function radarTaskStatusOptions(current) {
  return ["open", "doing", "done", "ignored"].map((status) =>
    `<option value="${status}" ${status === current ? "selected" : ""}>${escapeHtml(radarTaskStatusLabel(status))}</option>`
  ).join("");
}

function radarKindLabel(kind) {
  return {
    "pending-verification": "待核验",
    "logic-change": "逻辑变化",
    "new-source": "最新资料",
    "latest-verification": "最近核验"
  }[kind] || "雷达信号";
}

function radarPriorityLabel(priority) {
  return {
    high: "高优先级",
    medium: "中优先级",
    low: "低优先级"
  }[priority] || "中优先级";
}

function priorityScore(priority) {
  return { high: 3, medium: 2, low: 1 }[priority] || 0;
}

function radarPriorityForMonitor(item) {
  const text = `${item.name} ${item.why} ${item.topicTitle} ${item.logicTitle} ${(item.signals || []).join(" ")}`;
  if (item.executionStatus === "planned") return "high";
  if (/失效|反证|减弱|订单|量产|价格|招标|客户|产能|良率/.test(text)) return "high";
  if (item.executionStatus === "active") return "medium";
  return "low";
}

function radarPriorityForSource(item) {
  const text = `${item.title} ${item.summary} ${item.segment} ${(item.tags || []).join(" ")}`;
  if (/订单|量产|涨价|降价|招标|中标|业绩|产能|良率|客户|英伟达|华为|CPO|AI/.test(text)) return "high";
  if (item.status === "draft") return "medium";
  return "low";
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
          <button type="button" data-create-logic-from-update="${escapeHtml(update.id)}">沉淀逻辑卡</button>
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
  archiveList.querySelectorAll("[data-create-logic-from-update]").forEach((button) => {
    button.addEventListener("click", () => startLogicCardFromUpdate(chain.id, button.dataset.createLogicFromUpdate));
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
    renderPackageImportSummary(result.researchPackage, chainId);
    document.querySelector("#archive").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    setNotice(error.message, "error");
  } finally {
    setBusy(importPackageButton, false, "确认入库");
    importPackageButton.disabled = !state.packageInspection?.valid;
  }
}

function renderPackageImportSummary(researchPackage, chainId) {
  state.packagePayload = null;
  state.packageInspection = null;
  importPackageButton.disabled = true;
  const publicUrl = `./index.html?chain=${encodeURIComponent(chainId)}#activity`;
  const logicUrl = `./index.html?chain=${encodeURIComponent(chainId)}#logic`;
  const trackingUrl = `./index.html?chain=${encodeURIComponent(chainId)}#updates`;
  const marketUrl = `./index.html?chain=${encodeURIComponent(chainId)}#stocks`;
  const readerUrl = sourceReaderUrl(chainId, researchPackage.sourceUrl);
  const companies = [...new Set((researchPackage.logic?.logics || [])
    .flatMap((item) => item.companies || [])
    .map((company) => company.name)
    .filter(Boolean))];
  const monitors = (researchPackage.logic?.logics || [])
    .flatMap((item) => item.monitors || [])
    .map((monitor) => monitor.name)
    .filter(Boolean);

  packageInspection.innerHTML = `
    <section class="package-result-card">
      <div class="package-result-head">
        <span>已入库</span>
        <h3>${escapeHtml(researchPackage.topicTitle)}</h3>
        <p>${escapeHtml(researchPackage.title)}</p>
      </div>
      <dl class="package-result-metrics">
        <div><dt>逻辑</dt><dd>${researchPackage.logicCount || 0}</dd></div>
        <div><dt>监控</dt><dd>${researchPackage.monitorCount || 0}</dd></div>
        <div><dt>公司</dt><dd>${researchPackage.companyCount || companies.length}</dd></div>
        <div><dt>资源</dt><dd>${researchPackage.assetCount || 0}</dd></div>
      </dl>
      <div class="package-result-summary">
        <article>
          <strong>核心摘要</strong>
          <p>${escapeHtml(researchPackage.logic?.summary || "已保存研究原文，并生成逻辑卡、资料归档和跟踪验证入口。")}</p>
        </article>
        <article>
          <strong>关联公司</strong>
          <p>${companies.length ? companies.slice(0, 12).map(escapeHtml).join("、") : "暂无公司映射"}</p>
        </article>
        <article>
          <strong>监控项</strong>
          <p>${monitors.length ? monitors.slice(0, 8).map(escapeHtml).join("、") : "暂无监控项"}</p>
        </article>
      </div>
      <div class="package-result-actions">
        <a href="${escapeHtml(publicUrl)}" target="_blank">查看最新研究</a>
        <a href="${escapeHtml(logicUrl)}" target="_blank">查看逻辑卡</a>
        <a href="${escapeHtml(trackingUrl)}" target="_blank">查看跟踪验证</a>
        <a href="${escapeHtml(marketUrl)}" target="_blank">查看市场验证</a>
        <a href="${escapeHtml(readerUrl)}" target="_blank">阅读 Markdown</a>
        <a href="${escapeHtml(researchPackage.articleUrl)}" target="_blank">打开 HTML</a>
      </div>
    </section>
  `;
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

function startLogicCardFromUpdate(chainId, updateId) {
  const chain = state.library.chains.find((item) => item.id === chainId);
  const update = chain?.updates?.find((item) => item.id === updateId);
  if (!update) {
    setNotice("未找到这条动态。", "error");
    return;
  }
  resetLogicCardForm(chainId);
  const sourceId = findSourceIdForUpdate(chain, update);
  renderLogicSourceOptions(sourceId);
  logicCardForm.elements.sourceId.value = sourceId;
  logicCardForm.elements.trackId.value = update.logicTrack?.id || logicTrackIdFromUpdate(chainId, update);
  logicCardForm.elements.trackTitle.value = update.logicTrack?.role
    ? `${update.segment || chain.shortTitle || chain.title} · ${update.logicTrack.role}`
    : `${update.segment || chain.shortTitle || chain.title}逻辑变化`;
  logicCardForm.elements.trackSummary.value = update.logicTrack?.contribution || update.impact || update.signal;
  logicCardForm.elements.kicker.value = update.type || "动态沉淀";
  logicCardForm.elements.display.value = "points";
  logicCardForm.elements.title.value = update.signal;
  logicCardForm.elements.summary.value = update.impact;
  logicCardForm.elements.conclusion.value = [
    update.confidence ? `置信度：${update.confidence}` : "",
    update.notes || ""
  ].filter(Boolean).join("\n");
  logicCardForm.elements.segments.value = update.segment || "";
  logicCardForm.elements.articleAnchor.value = "";
  logicCardContent.value = JSON.stringify({
    points: [
      { label: "核心变化", description: update.signal },
      { label: "产业链影响", description: update.impact },
      { label: "后续观察", description: update.notes || "继续跟踪证据变化和市场验证。" }
    ]
  }, null, 2);
  updateLogicContentHint();
  document.querySelector("#logicCardFormTitle").textContent = "从动态沉淀逻辑卡";
  logicCardForm.querySelector("button[type='submit']").textContent = "保存逻辑卡草稿";
  cancelLogicCardEdit.hidden = false;
  document.querySelector("#logic-cards").scrollIntoView({ behavior: "smooth", block: "start" });
  logicCardForm.elements.summary.focus();
  setNotice("已根据动态追踪预填逻辑卡草稿，请检查结构化内容后保存。", "success");
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

function findSourceIdForUpdate(chain, update) {
  const updateUrl = normalizeAdminUrl(update.sourceUrl);
  const updateTitle = String(update.sourceTitle || "").trim();
  return (chain?.sources || []).find((source) =>
    updateUrl && (
      normalizeAdminUrl(source.markdownUrl) === updateUrl ||
      normalizeAdminUrl(source.originalUrl) === updateUrl ||
      normalizeAdminUrl(source.articleUrl) === updateUrl
    )
  )?.id || (chain?.sources || []).find((source) =>
    updateTitle && String(source.title || "").trim() === updateTitle
  )?.id || "";
}

function logicTrackIdFromUpdate(chainId, update) {
  return `${chainId}-${normalizeLogicIdPart(update.segment || update.type || "logic")}-track`;
}

function normalizeLogicIdPart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "logic";
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
    delete payload.sourceRawText;
    await apiRequest(
      updateId
        ? `./api/v1/admin/chains/${encodeURIComponent(chainId)}/updates/${encodeURIComponent(updateId)}`
        : `./api/v1/admin/chains/${encodeURIComponent(chainId)}/updates`,
      {
      method: updateId ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    if (!updateId && state.settlingRadarTaskId) {
      await completeRadarTaskAfterUpdate(state.settlingRadarTaskId, payload);
    }
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

async function completeRadarTaskAfterUpdate(taskId, updatePayload) {
  const currentTask = state.radarVerificationTasks.find((task) => task.id === taskId);
  const notes = [
    currentTask?.notes,
    `已沉淀为动态追踪：${updatePayload.signal}`
  ].filter(Boolean).join("\n");
  const payload = await apiRequest(`./api/v1/admin/radar-verification-tasks/${encodeURIComponent(taskId)}`, {
    method: "PUT",
    body: JSON.stringify({ status: "done", notes })
  });
  const index = state.radarVerificationTasks.findIndex((task) => task.id === taskId);
  if (index >= 0) state.radarVerificationTasks[index] = payload.task;
  renderRadarVerificationTasks();
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
    "sourceTitle", "sourceKind", "sourcePlatform", "sourceUrl", "notes"
  ].forEach((name) => {
    updateForm.elements[name].value = update[name] || (name === "sourceKind" ? "文章" : "");
  });
  updateForm.querySelector("button[type='submit']").textContent = "保存动态修改";
  cancelUpdateEdit.hidden = false;
  document.querySelector("#add-update").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetUpdateForm(chainId = updateSelect.value) {
  updateForm.reset();
  state.settlingRadarTaskId = "";
  renderChainOptions(updateSelect, chainId);
  updateForm.elements.date.value = new Date().toISOString().slice(0, 10);
  updateForm.elements.sourceKind.value = "文章";
  updateForm.querySelector("button[type='submit']").textContent = "保存动态追踪";
  cancelUpdateEdit.hidden = true;
}

function preprocessUpdateShareText() {
  const rawText = updateShareText.value.trim();
  if (!rawText) {
    setNotice("请先粘贴一段分享文本。", "error");
    updateShareText.focus();
    return;
  }

  const parsed = parseUpdateShareText(rawText);
  if (!parsed.url && !parsed.title) {
    setNotice("暂时没有识别到标题或链接，请检查分享文本。", "error");
    return;
  }

  const form = updateForm.elements;
  if (parsed.url) form.sourceUrl.value = parsed.url;
  if (parsed.platform) form.sourcePlatform.value = parsed.platform;
  if (parsed.sourceKind) form.sourceKind.value = parsed.sourceKind;
  if (parsed.sourceTitle) form.sourceTitle.value = parsed.sourceTitle;
  form.confidence.value = "待核验";
  form.type.value = parsed.updateType;
  if (parsed.segment && !form.segment.value.trim()) form.segment.value = parsed.segment;
  if (parsed.signal && !form.signal.value.trim()) form.signal.value = parsed.signal;
  if (parsed.impact && !form.impact.value.trim()) form.impact.value = parsed.impact;
  form.notes.value = compactUpdateNotes(form.notes.value, parsed.notes);
  setNotice("已根据分享文本预填动态草稿，请继续检查影响判断和所属环节。", "success");
}

function parseUpdateShareText(rawText) {
  const text = rawText.replace(/\s+/g, " ").trim();
  const url = text.match(/https?:\/\/[^\s]+/i)?.[0]?.replace(/[，。；;、]+$/, "") || "";
  const author = text.match(/【([^】]+?)的作品】/)?.[1]?.trim() || "";
  const afterAuthor = text.match(/】(.+?)(?:https?:\/\/|$)/i)?.[1]?.trim() || "";
  const beforeUrl = url ? text.slice(0, text.indexOf(url)).trim() : text;
  const title = cleanSharedTitle(afterAuthor || beforeUrl.replace(/.*看看【[^】]+】/, ""));
  const platform = inferSharePlatform(url, text);
  const sourceKind = platform === "Douyin" || /短视频|视频|抖音/.test(text) ? "短视频" : "文章";
  const sourceTitle = author && title ? `${author}：${title}` : title || author;
  const segment = inferUpdateSegment(text);
  const updateType = /机构|调研|研报|观点|解读|券商/.test(text) ? "机构逻辑" : "产业事件";

  return {
    url,
    platform,
    sourceKind,
    sourceTitle,
    updateType,
    segment,
    signal: title ? `待核验：${sourceKind === "短视频" ? "短视频观点称" : "资料称"}${title}` : "",
    impact: title
      ? `该资料已作为待核验线索入库；若后续被公告、研报或产业链访谈验证，需要判断它是否改变相关环节的供需、技术路线、订单节奏或公司受益逻辑。`
      : "",
    notes: `原始分享文本：${rawText}\n当前仅完成信息预处理，尚未取得完整原文、字幕或交叉验证资料。`
  };
}

function cleanSharedTitle(value) {
  return String(value || "")
    .replace(/^复制打开\S*，?看看/, "")
    .replace(/^\s*[：:，,。]+/, "")
    .replace(/\s*\d{1,2}\/\d{1,2}\s+.*$/, "")
    .replace(/\s+[A-Za-z0-9]{2,}:\/\s*.*$/, "")
    .trim();
}

function inferSharePlatform(url, text) {
  if (/douyin\.com/i.test(url) || /抖音/.test(text)) return "Douyin";
  if (/weixin\.qq\.com|mp\.weixin\.qq\.com/i.test(url) || /公众号|微信/.test(text)) return "微信公众号";
  if (/xueqiu\.com/i.test(url)) return "雪球";
  return "";
}

function inferUpdateSegment(value) {
  const text = String(value || "");
  if (/CPO|硅光|光通信|玻璃桥|光模块/.test(text)) return "CPO与硅光交换机";
  if (/PCB|覆铜板|CCL|电子布/.test(text)) return "覆铜板/CCL";
  if (/光刻胶/.test(text)) return "光刻胶";
  return "";
}

function compactUpdateNotes(current, addition) {
  const existing = String(current || "").trim();
  if (existing.includes(addition)) return existing;
  return existing ? `${existing}\n\n${addition}` : addition;
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
