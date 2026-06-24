import fs from "node:fs";
import path from "node:path";

export const root = path.resolve(new URL("..", import.meta.url).pathname);
export const mobileRoot = path.join(root, "apps", "mobile");

export function createChecker(label) {
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

  function report() {
    for (const item of checks) {
      const icon = item.ok ? "✓" : "✗";
      console.log(`${icon} ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
    }

    const failed = checks.filter((item) => !item.ok);
    if (failed.length) {
      console.error(`\n${failed.length} ${label} readiness check(s) failed.`);
      process.exit(1);
    }

    console.log(`\nAll ${checks.length} ${label} readiness checks passed.`);
  }

  return { assert, report };
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function readJsonc(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const withoutBlockComments = raw.replace(/\/\*[\s\S]*?\*\//g, "");
  const withoutLineComments = withoutBlockComments.replace(/(^|[^:])\/\/.*$/gm, "$1");
  return JSON.parse(withoutLineComments);
}

export function readEnv(filePath) {
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

export function readMobileProject() {
  const mobilePackage = readJson(path.join(mobileRoot, "package.json"));
  const manifest = readJsonc(path.join(mobileRoot, "src", "manifest.json"));
  const pages = readJson(path.join(mobileRoot, "src", "pages.json"));
  const productionEnv = readEnv(path.join(mobileRoot, ".env.production"));
  const authSource = fs.readFileSync(path.join(mobileRoot, "src", "utils", "auth.js"), "utf8");
  const platformSource = fs.readFileSync(path.join(mobileRoot, "src", "utils", "platform.js"), "utf8");

  return {
    authSource,
    manifest,
    mobileRoot,
    mobilePackage,
    pagePaths: new Set((pages.pages || []).map((item) => item.path)),
    platformSource,
    productionEnv
  };
}

export function assertSharedAppChecks(checker, project) {
  const { authSource, mobileRoot, pagePaths, platformSource, productionEnv } = project;
  checker.assert("Production API uses HTTPS", /^https:\/\//.test(productionEnv.VITE_API_BASE_URL || ""), productionEnv.VITE_API_BASE_URL || "");
  checker.assert("Production static assets use HTTPS", /^https:\/\//.test(productionEnv.VITE_STATIC_BASE_URL || ""), productionEnv.VITE_STATIC_BASE_URL || "");
  checker.assert("Index page is registered", pagePaths.has("pages/index/index"));
  checker.assert("Detail page is registered", pagePaths.has("pages/detail/detail"));
  checker.assert("Legal page is registered", pagePaths.has("pages/legal/legal"));
  checker.assert("Privacy policy URL setting exists", Object.hasOwn(productionEnv, "VITE_PRIVACY_POLICY_URL"));
  checker.assert("Terms URL setting exists", Object.hasOwn(productionEnv, "VITE_TERMS_OF_SERVICE_URL"));
  checker.assert("1024 App icon exists", fs.existsSync(path.join(mobileRoot, "src", "static", "brand", "app-icon-1024.png")));
  checker.assert("Mobile launch image exists", fs.existsSync(path.join(mobileRoot, "src", "static", "brand", "launch-1170x2532.png")));
  checker.assert("Platform helper detects App runtime", platformSource.includes("APP-PLUS") && platformSource.includes('return "app"'));
  checker.assert("Non-WeChat clients do not call WeChat login", authSource.includes("isWechatMiniProgram()") && authSource.includes("登录待接入"));
}
