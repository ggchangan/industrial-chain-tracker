import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const mobileRoot = path.join(root, "apps", "mobile");
const checks = [];

function pass(name, detail = "") {
  checks.push({ name, ok: true, detail });
}

function fail(name, detail = "") {
  checks.push({ name, ok: false, detail });
}

function assert(name, condition, detail = "") {
  if (condition) pass(name, detail);
  else fail(name, detail);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonc(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const withoutBlockComments = raw.replace(/\/\*[\s\S]*?\*\//g, "");
  const withoutLineComments = withoutBlockComments.replace(/(^|[^:])\/\/.*$/gm, "$1");
  return JSON.parse(withoutLineComments);
}

function readEnv(filePath) {
  return Object.fromEntries(
    fs.readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

const mobilePackage = readJson(path.join(mobileRoot, "package.json"));
const manifest = readJsonc(path.join(mobileRoot, "src", "manifest.json"));
const pages = readJson(path.join(mobileRoot, "src", "pages.json"));
const productionEnv = readEnv(path.join(mobileRoot, ".env.production"));
const authSource = fs.readFileSync(path.join(mobileRoot, "src", "utils", "auth.js"), "utf8");
const platformSource = fs.readFileSync(path.join(mobileRoot, "src", "utils", "platform.js"), "utf8");

const scripts = mobilePackage.scripts || {};
const ios = manifest["app-plus"]?.distribute?.ios || {};
const bundleId = manifest["app-plus"]?.distribute?.apple?.bundleId || ios.id || "";
const pagePaths = new Set((pages.pages || []).map((item) => item.path));

assert("App build script exists", Boolean(scripts["build:app-ios"] || scripts["build:app"]));
assert("iOS Bundle ID is configured", /^([A-Za-z0-9-]+\.)+[A-Za-z0-9-]+$/.test(bundleId), bundleId);
assert("iOS deployment target is set", Boolean(ios.deploymentTarget), ios.deploymentTarget || "");
assert("iOS universal device target is set", ios.devices === "universal", ios.devices || "");
assert("Production API uses HTTPS", /^https:\/\//.test(productionEnv.VITE_API_BASE_URL || ""), productionEnv.VITE_API_BASE_URL || "");
assert("Production static assets use HTTPS", /^https:\/\//.test(productionEnv.VITE_STATIC_BASE_URL || ""), productionEnv.VITE_STATIC_BASE_URL || "");
assert("Index page is registered", pagePaths.has("pages/index/index"));
assert("Detail page is registered", pagePaths.has("pages/detail/detail"));
assert("Platform helper detects App runtime", platformSource.includes("APP-PLUS") && platformSource.includes('return "app"'));
assert("Non-WeChat clients do not call WeChat login", authSource.includes("isWechatMiniProgram()") && authSource.includes("登录待接入"));

for (const item of checks) {
  const icon = item.ok ? "✓" : "✗";
  console.log(`${icon} ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
}

const failed = checks.filter((item) => !item.ok);
if (failed.length) {
  console.error(`\n${failed.length} iOS App readiness check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} iOS App readiness checks passed.`);
