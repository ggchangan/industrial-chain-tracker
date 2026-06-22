import crypto from "node:crypto";

const REQUIRED_FILES = ["article.html", "source-article.md", "logic.json"];
const STATUSES = new Set(["new", "strengthening", "stable", "weakening", "challenged", "invalidated"]);
const KINDS = new Set(["thesis", "risk"]);
const EFFECTS = new Set(["strengthen", "weaken", "challenge", "invalidate"]);
const SEVERITIES = new Set(["low", "medium", "high", "critical"]);
const AUTOMATION = new Set(["automatic", "semi-automatic", "manual"]);
const EXECUTION = new Set(["planned", "active", "paused", "retired"]);
const EXCHANGES = new Set(["SSE", "SZSE", "BSE", "HKEX", "NASDAQ", "NYSE"]);

export function inspectResearchPackage(input) {
  const files = normalizeFiles(input.files);
  const byPath = new Map(files.map((file) => [file.path, file]));
  const errors = [];
  const warnings = [];
  for (const name of REQUIRED_FILES) {
    if (!byPath.has(name)) errors.push(issue("missing_file", `缺少必需文件：${name}`, name));
  }
  if (![...byPath.keys()].some((name) => name.startsWith("assets/"))) {
    warnings.push(issue("missing_assets", "资料包没有 assets/ 资源文件。", "assets/"));
  }

  const markdown = text(byPath.get("source-article.md"));
  const html = text(byPath.get("article.html"));
  let logic;
  try {
    logic = JSON.parse(text(byPath.get("logic.json")));
  } catch (error) {
    errors.push(issue("invalid_json", `logic.json 不是有效 JSON：${error.message}`, "logic.json"));
  }

  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || "";
  const topicTitle = title.match(/^(.+?产业链)(?:深度解析|深度研究|全景梳理|：|:|$)/)?.[1]?.trim() || "";
  const abbreviation = topicTitle.match(/^([A-Za-z0-9+-]+)产业链/)?.[1];
  const topicId = input.topicId || abbreviation?.toLowerCase().replaceAll("+", "-plus") || "";
  if (!title) errors.push(issue("missing_title", "source-article.md 缺少一级标题。", "source-article.md"));
  if (!topicTitle) errors.push(issue("topic_not_detected", "无法从一级标题识别研究主题。", "source-article.md"));
  if (!/^[a-z0-9-]+$/.test(topicId)) errors.push(issue("topic_id_not_detected", "无法生成稳定的主题 ID。", "source-article.md"));

  for (const match of markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const asset = normalizePath(match[1]);
    if (!byPath.has(asset)) errors.push(issue("missing_asset", `Markdown 引用的资源不存在：${asset}`, asset));
  }
  const summary = validateLogic(logic, markdown, errors, warnings);
  const htmlTitle = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
  if (title && htmlTitle && title !== htmlTitle) warnings.push(issue("title_mismatch", "HTML 与 Markdown 标题不一致。", "article.html"));

  const digest = crypto.createHash("sha256");
  for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path))) digest.update(file.path).update(file.contents);
  const fileHash = digest.digest("hex");
  const importedAt = new Date().toISOString();
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    preview: {
      chainId: input.chainId,
      packageId: `${input.chainId}-${topicId}-${importedAt.slice(0, 10).replaceAll("-", "")}-${fileHash.slice(0, 8)}`,
      topicId, topicTitle, title, htmlTitle, importedAt, fileHash,
      files: files.map((file) => ({ path: file.path, size: file.size, type: file.type })),
      assetCount: files.filter((file) => file.path.startsWith("assets/")).length,
      ...summary
    },
    files,
    logic
  };
}

function validateLogic(logic, markdown, errors, warnings) {
  if (!logic) return { logicCount: 0, monitorCount: 0, companyCount: 0 };
  if (logic.schema_version !== "0.2") errors.push(issue("invalid_schema", "schema_version 必须为 0.2。", "logic.json"));
  if (!logic.summary?.trim()) errors.push(issue("missing_summary", "logic.json 缺少 summary。", "logic.json"));
  if (!logic.logics?.length) errors.push(issue("missing_logics", "logic.json 至少需要一条逻辑。", "logic.json"));
  const plain = anchorText(markdown);
  const logicKeys = new Set(), monitorKeys = new Set(), companies = new Set();
  for (const [index, item] of (logic.logics || []).entries()) {
    const location = `logic.json#logics[${index}]`;
    if (!item.key) errors.push(issue("missing_logic_key", "逻辑缺少 key。", location));
    else if (logicKeys.has(item.key)) errors.push(issue("duplicate_logic_key", `逻辑 key 重复：${item.key}`, location));
    else logicKeys.add(item.key);
    if (!KINDS.has(item.kind)) errors.push(issue("invalid_logic_kind", `kind 无效：${item.kind}`, location));
    if (!STATUSES.has(item.status)) errors.push(issue("invalid_logic_status", `status 无效：${item.status}`, location));
    if (!item.title?.trim() || !item.statement?.trim()) errors.push(issue("incomplete_logic", "逻辑缺少 title 或 statement。", location));
    for (const [evidenceIndex, evidence] of (item.evidence || []).entries()) {
      const evidenceLocation = `${location}.evidence[${evidenceIndex}]`;
      if (!evidence.summary || !evidence.anchor) errors.push(issue("incomplete_evidence", "证据缺少 summary 或 anchor。", evidenceLocation));
      else if (!plain.includes(anchorText(evidence.anchor))) errors.push(issue("anchor_not_found", `证据锚点未命中：${evidence.anchor}`, evidenceLocation));
      if (!evidence.key) warnings.push(issue("missing_evidence_key", "建议为证据增加稳定 key。", evidenceLocation));
    }
    for (const company of item.companies || []) {
      if (!company.name || !/^\d{6}$/.test(company.ticker || "") || !EXCHANGES.has(company.exchange)) errors.push(issue("invalid_company", `公司信息无效：${company.name || "未命名"}`, location));
      else companies.add(`${company.exchange}:${company.ticker}`);
    }
    for (const [monitorIndex, monitor] of (item.monitors || []).entries()) {
      const monitorLocation = `${location}.monitors[${monitorIndex}]`;
      if (!monitor.key) errors.push(issue("missing_monitor_key", "监控项缺少 key。", monitorLocation));
      else if (monitorKeys.has(monitor.key)) errors.push(issue("duplicate_monitor_key", `监控 key 重复：${monitor.key}`, monitorLocation));
      else monitorKeys.add(monitor.key);
      for (const field of ["name", "logic", "strengthening_signal", "weakening_signal"]) if (!monitor[field]?.trim()) errors.push(issue("incomplete_monitor", `监控项缺少 ${field}。`, monitorLocation));
      if (!monitor.data_sources?.length) errors.push(issue("missing_data_sources", "监控项缺少 data_sources。", monitorLocation));
      for (const source of monitor.data_sources || []) {
        if (!source.type || !source.providers?.length || !source.document || !source.frequency || !source.access) errors.push(issue("incomplete_data_source", "监控数据来源不完整。", monitorLocation));
        if (!AUTOMATION.has(source.automation_target)) errors.push(issue("invalid_automation_target", `automation_target 无效：${source.automation_target}`, monitorLocation));
        if (!EXECUTION.has(source.execution_status)) errors.push(issue("invalid_execution_status", `execution_status 无效：${source.execution_status}`, monitorLocation));
      }
      if (!monitor.rules?.length) errors.push(issue("missing_monitor_rules", "监控项缺少 rules。", monitorLocation));
      for (const rule of monitor.rules || []) if (!rule.metric || !rule.operator || rule.threshold === undefined || !EFFECTS.has(rule.effect)) errors.push(issue("invalid_monitor_rule", "监控规则字段无效。", monitorLocation));
    }
    if (!item.invalidation?.length) errors.push(issue("missing_invalidation", "逻辑缺少 invalidation。", location));
    for (const invalidation of item.invalidation || []) if (!invalidation.condition || !SEVERITIES.has(invalidation.severity)) errors.push(issue("invalid_invalidation", "失效条件格式无效。", location));
  }
  return { logicCount: logicKeys.size, monitorCount: monitorKeys.size, companyCount: companies.size };
}

function normalizeFiles(value) {
  return (Array.isArray(value) ? value : []).map((file) => {
    const filePath = normalizePath(file.path);
    if (!filePath || filePath.includes("..")) throw invalidPackage("资料包包含非法文件路径");
    const contents = Buffer.from(String(file.content || ""), file.encoding === "base64" ? "base64" : "utf8");
    return { path: filePath, type: String(file.type || ""), size: contents.length, contents };
  }).filter((file) => !isIgnoredPackageFile(file.path));
}

function normalizePath(value) {
  return String(value || "").replaceAll("\\", "/").replace(/^\.?\//, "").replace(/^.*?\/(?=(?:article\.html|source-article\.md|logic\.json|assets\/))/, "");
}

function isIgnoredPackageFile(filePath) {
  const segments = String(filePath || "").split("/");
  const name = segments.at(-1) || "";
  return (
    name === ".DS_Store" ||
    name === "Thumbs.db" ||
    name.startsWith("._") ||
    segments.includes("__MACOSX")
  );
}

function text(file) { return file ? file.contents.toString("utf8") : ""; }
function anchorText(value) { return String(value || "").replace(/[*_`~]/g, "").replace(/\s+/g, " ").trim(); }
function issue(code, message, location) { return { code, message, location }; }
function invalidPackage(message) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = "invalid_research_package";
  return error;
}
