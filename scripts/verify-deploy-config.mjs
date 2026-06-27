#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const composePath = path.join(root, "deploy", "docker-compose.yml");
const compose = fs.readFileSync(composePath, "utf8");

const checks = [
  {
    name: "compose uses raw .env file",
    ok: /env_file:\s*\n\s*-\s*path:\s*\.\.\/\.env\s*\n\s*format:\s*raw/.test(compose)
  },
  {
    name: "STATE_STORE_DRIVER is not overridden by compose interpolation",
    ok: !/STATE_STORE_DRIVER\s*:/.test(compose)
  },
  {
    name: "OBJECT_STORAGE_DRIVER is not overridden by compose interpolation",
    ok: !/OBJECT_STORAGE_DRIVER\s*:/.test(compose)
  }
];

for (const check of checks) {
  console.log(`${check.ok ? "✓" : "✗"} ${check.name}`);
}

const failed = checks.filter((check) => !check.ok);
if (failed.length) {
  console.error(`\n${failed.length} deploy config check(s) failed.`);
  process.exit(1);
}

console.log("\nDeploy config checks passed.");
