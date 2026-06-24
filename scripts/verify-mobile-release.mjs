#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const args = new Set(process.argv.slice(2));
const apiArg = process.argv.slice(2).find((item) => /^https?:\/\//.test(item));
const shouldBuildApp = args.has("--build-app");
const shouldCheckApi = args.has("--api") || Boolean(apiArg) || Boolean(process.env.API_BASE_URL);
const apiBaseUrl = apiArg || process.env.API_BASE_URL || "https://api.industry.ygys30ds.cloud";

const steps = [
  {
    name: "iOS App readiness",
    command: ["node", "scripts/verify-ios-app-readiness.mjs"],
    cwd: root
  },
  {
    name: "Android App readiness",
    command: ["node", "scripts/verify-android-app-readiness.mjs"],
    cwd: root
  },
  {
    name: "Project tests",
    command: ["node", "--test"],
    cwd: root
  }
];

if (shouldCheckApi) {
  steps.push({
    name: `Production user feature API checks (${apiBaseUrl})`,
    command: ["node", "scripts/verify-user-features.mjs", apiBaseUrl],
    cwd: root
  });
}

if (shouldBuildApp) {
  steps.push({
    name: "uni-app App platform build",
    command: ["node", "./node_modules/@dcloudio/vite-plugin-uni/bin/uni.js", "build", "-p", "app", "--mode", "production"],
    cwd: path.join(root, "apps", "mobile")
  });
}

const results = [];

for (const step of steps) {
  console.log(`\n▶ ${step.name}`);
  const result = runStep(step);
  results.push({ name: step.name, ok: result.status === 0 });
  if (result.status !== 0) break;
}

console.log("\nMobile release verification summary:");
for (const result of results) {
  console.log(`${result.ok ? "✓" : "✗"} ${result.name}`);
}

if (results.some((item) => !item.ok) || results.length !== steps.length) {
  console.error("\nMobile release verification failed.");
  process.exit(1);
}

console.log("\nMobile release verification passed.");

function runStep(step) {
  const [command, ...commandArgs] = step.command;
  const env = { ...process.env, ...(step.env || {}) };
  const result = spawnSync(command, commandArgs, {
    cwd: step.cwd,
    env,
    encoding: "utf8"
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) {
    console.error(result.error.message);
    return { status: 1 };
  }
  return result;
}
