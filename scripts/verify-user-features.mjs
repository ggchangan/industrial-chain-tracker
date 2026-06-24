#!/usr/bin/env node

const baseUrl = String(process.argv[2] || process.env.API_BASE_URL || "https://api.industry.ygys30ds.cloud").replace(/\/$/, "");

const checks = [];

await check("health", async () => {
  const payload = await getJson("/api/v1/health");
  assert(payload.status === "ok", "health.status should be ok");
  assert(Number(payload.chains) > 0, "health.chains should be positive");
});

await check("auth session is public and reports configuration", async () => {
  const payload = await getJson("/api/v1/auth/session");
  assert(payload.authenticated === false, "anonymous session should not be authenticated");
  assert(typeof payload.configured === "boolean", "session.configured should be boolean");
});

await check("personal profile requires login", async () => {
  const response = await request("/api/v1/me");
  assert(response.status === 401, `/api/v1/me should return 401 for anonymous users, got ${response.status}`);
  const payload = await response.json();
  assert(payload.error === "authentication_required", "anonymous /me should report authentication_required");
});

await check("favorite mutation requires login", async () => {
  const response = await request("/api/v1/me/favorites/chains/optical-module", { method: "PUT" });
  assert(response.status === 401, `favorite mutation should return 401, got ${response.status}`);
});

await check("subscription mutation requires login", async () => {
  const response = await request("/api/v1/me/subscriptions/chains/optical-module", { method: "PUT" });
  assert(response.status === 401, `subscription mutation should return 401, got ${response.status}`);
});

await check("reading-history mutation requires login", async () => {
  const response = await request("/api/v1/me/reading-history/chains/optical-module", {
    method: "PUT",
    body: JSON.stringify({ progress: 10 }),
    headers: { "Content-Type": "application/json" }
  });
  assert(response.status === 401, `reading history mutation should return 401, got ${response.status}`);
});

const failed = checks.filter((item) => !item.ok);
for (const item of checks) {
  const mark = item.ok ? "✓" : "✗";
  console.log(`${mark} ${item.name}${item.ok ? "" : ` — ${item.error}`}`);
}

if (failed.length) {
  console.error(`\n${failed.length}/${checks.length} checks failed for ${baseUrl}`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} user feature checks passed for ${baseUrl}`);

async function check(name, fn) {
  try {
    await fn();
    checks.push({ name, ok: true });
  } catch (error) {
    checks.push({ name, ok: false, error: error.message || String(error) });
  }
}

async function getJson(path) {
  const response = await request(path);
  assert(response.ok, `${path} returned ${response.status}`);
  return response.json();
}

function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      ...(options.headers || {})
    },
    body: options.body
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
