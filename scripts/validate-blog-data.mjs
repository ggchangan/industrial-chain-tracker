import { access, readFile } from "node:fs/promises";
import vm from "node:vm";

const dataPath = new URL("../assets/data.js", import.meta.url);
const blogIndexPath = new URL("../index.html", import.meta.url);
const dataSource = await readFile(dataPath, "utf8");
const sandbox = { window: {} };
const errors = [];

vm.createContext(sandbox);
vm.runInContext(dataSource, sandbox);

const library = sandbox.window.INDUSTRY_CHAIN_LIBRARY;
if (!library?.chains?.length) {
  fail("assets/data.js does not expose window.INDUSTRY_CHAIN_LIBRARY.chains");
} else {
  await validateLibrary(library);
}

if (errors.length) {
  console.error(`Found ${errors.length} data issue${errors.length > 1 ? "s" : ""}:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${library.chains.length} chains in assets/data.js`);
}

async function validateLibrary(library) {
  requireString(library.meta?.title, "meta.title");
  requireString(library.meta?.updated, "meta.updated");
  requireString(library.meta?.description, "meta.description");

  const ids = new Set();

  for (const chain of library.chains) {
    const label = chain.title || chain.id || "unknown chain";

    requireString(chain.id, `${label}.id`);
    requireString(chain.title, `${label}.title`);
    requireString(chain.theme, `${label}.theme`);
    requireString(chain.status, `${label}.status`);

    if (ids.has(chain.id)) fail(`${label}.id is duplicated: ${chain.id}`);
    ids.add(chain.id);

    await requireExistingPath(chain.article, `${label}.article`);
    await requireExistingPath(chain.cover, `${label}.cover`);
    await requireExistingPath(chain.diagram, `${label}.diagram`);
    await requireExistingPath(chain.diagramSvg, `${label}.diagramSvg`);
    await requireExistingPath(chain.updateFile, `${label}.updateFile`);

    validateChainStructure(chain, label);
    validateTrackingProfile(chain, label);
    await validateUpdateFile(chain, label);
  }
}

function validateChainStructure(chain, label) {
  if (!Array.isArray(chain.chain) || chain.chain.length === 0) {
    fail(`${label}.chain must be a non-empty array`);
  } else {
    chain.chain.forEach((section, index) => {
      const sectionLabel = `${label}.chain[${index}]`;
      requireString(section.id, `${sectionLabel}.id`);
      requireString(section.title || section.name, `${sectionLabel}.title`);
      requireString(section.role, `${sectionLabel}.role`);

      const items = section.items || section.segments;
      if (!Array.isArray(items) || items.length === 0) {
        fail(`${sectionLabel}.items must be a non-empty array`);
      } else {
        items.forEach((item, itemIndex) => {
          const itemLabel = `${sectionLabel}.items[${itemIndex}]`;
          requireString(item.name, `${itemLabel}.name`);
          requireString(item.detail || item.logic, `${itemLabel}.detail`);
          requireString(item.companies, `${itemLabel}.companies`);
        });
      }
    });
  }

  if (!Array.isArray(chain.logic) || chain.logic.length === 0) {
    fail(`${label}.logic must be a non-empty array`);
  } else {
    chain.logic.forEach((item, index) => {
      requireString(item.title, `${label}.logic[${index}].title`);
      requireString(item.body, `${label}.logic[${index}].body`);
    });
  }
}

function validateTrackingProfile(chain, label) {
  const profile = chain.trackingProfile;
  if (!profile) {
    fail(`${label}.trackingProfile is missing`);
    return;
  }

  requireString(profile.title, `${label}.trackingProfile.title`);
  requireString(profile.summary, `${label}.trackingProfile.summary`);

  if (!Array.isArray(profile.metrics) || profile.metrics.length === 0) {
    fail(`${label}.trackingProfile.metrics must be a non-empty array`);
    return;
  }

  profile.metrics.forEach((metric, index) => {
    const metricLabel = `${label}.trackingProfile.metrics[${index}]`;
    requireString(metric.name, `${metricLabel}.name`);
    requireString(metric.why, `${metricLabel}.why`);
    requireStringArray(metric.signals, `${metricLabel}.signals`);
  });
}

async function validateUpdateFile(chain, label) {
  if (!chain.updateFile) return;

  let source;
  try {
    source = JSON.parse(await readFile(new URL(chain.updateFile, blogIndexPath), "utf8"));
  } catch (error) {
    fail(`${label}.updateFile cannot be parsed: ${error.message}`);
    return;
  }

  if (!Array.isArray(source.watchlist)) {
    fail(`${label}.updateFile.watchlist must be an array`);
  } else {
    source.watchlist.forEach((item, index) => {
      const itemLabel = `${label}.updateFile.watchlist[${index}]`;
      requireString(item.segment, `${itemLabel}.segment`);
      requireStringArray(item.whatToTrack, `${itemLabel}.whatToTrack`);
      requireStringArray(item.companies, `${itemLabel}.companies`);
    });
  }

  if (!Array.isArray(source.updates)) {
    fail(`${label}.updateFile.updates must be an array`);
  } else {
    source.updates.forEach((item, index) => {
      const itemLabel = `${label}.updateFile.updates[${index}]`;
      requireString(item.date, `${itemLabel}.date`);
      if (item.type && !["产业事件", "机构逻辑", "公司公告", "数据变化"].includes(item.type)) {
        fail(`${itemLabel}.type must be 产业事件, 机构逻辑, 公司公告, or 数据变化`);
      }
      requireString(item.segment, `${itemLabel}.segment`);
      requireString(item.signal, `${itemLabel}.signal`);
      requireString(item.impact, `${itemLabel}.impact`);
      requireString(item.confidence, `${itemLabel}.confidence`);
      requireString(item.notes, `${itemLabel}.notes`);
      requireString(item.source?.title, `${itemLabel}.source.title`);
      requireString(item.source?.url, `${itemLabel}.source.url`);
    });
  }

  if (Array.isArray(chain.watchlist) && Array.isArray(source.watchlist) && chain.watchlist.length !== source.watchlist.length) {
    fail(`${label}.watchlist length differs from ${chain.updateFile}`);
  }

  if (Array.isArray(chain.updates) && Array.isArray(source.updates) && chain.updates.length !== source.updates.length) {
    fail(`${label}.updates length differs from ${chain.updateFile}`);
  }
}

async function requireExistingPath(path, label) {
  requireString(path, label);
  if (!path) return;

  try {
    await access(new URL(path, blogIndexPath));
  } catch {
    fail(`${label} does not exist: ${path}`);
  }
}

function requireString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    fail(`${label} must be a non-empty string`);
  }
}

function requireStringArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    fail(`${label} must be a non-empty array`);
    return;
  }

  value.forEach((item, index) => requireString(item, `${label}[${index}]`));
}

function fail(message) {
  errors.push(message);
}
