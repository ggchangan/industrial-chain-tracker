import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createAppServer } from "../server/server.mjs";

const rootDir = new URL("..", import.meta.url).pathname;
let server;
let baseUrl;

test.before(async () => {
  server = await createAppServer({
    rootDir,
    adminPassword: "correct-horse-battery",
    sessionSecret: "test-session-secret-that-is-long-enough-123456"
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

test("health and library APIs expose synchronized content", async () => {
  const health = await fetch(`${baseUrl}/api/v1/health`).then((response) => response.json());
  assert.equal(health.status, "ok");
  assert.ok(health.chains >= 20);

  const library = await fetch(`${baseUrl}/api/v1/library`).then((response) => response.json());
  assert.equal(library.chains.length, health.chains);
  assert.ok(library.chains.some((chain) => chain.id === "physical-ai"));
});

test("chain API can include Markdown article content", async () => {
  const response = await fetch(`${baseUrl}/api/v1/chains/physical-ai?article=1`);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.chain.id, "physical-ai");
  assert.match(payload.article, /物理AI产业链深度解析/);
});

test("chain API can render article HTML for mobile clients", async () => {
  const response = await fetch(`${baseUrl}/api/v1/chains/physical-ai?article=html`);
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.match(payload.article.html, /<table>/);
  assert.ok(payload.article.toc.length > 10);
});

test("search API finds content across chain structures", async () => {
  const payload = await fetch(`${baseUrl}/api/v1/search?q=${encodeURIComponent("世界模型")}`)
    .then((response) => response.json());
  assert.ok(payload.results.length > 0);
  assert.ok(payload.results.some((result) => result.chainId === "physical-ai"));
});

test("maintenance page requires a valid signed session", async () => {
  const anonymous = await fetch(`${baseUrl}/maintain.html`, { redirect: "manual" });
  assert.equal(anonymous.status, 302);
  assert.match(anonymous.headers.get("location"), /^\/admin-login\.html/);

  const denied = await fetch(`${baseUrl}/api/v1/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "wrong-password" })
  });
  assert.equal(denied.status, 401);

  const login = await fetch(`${baseUrl}/api/v1/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "correct-horse-battery" })
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie").split(";")[0];

  const protectedPage = await fetch(`${baseUrl}/maintain.html`, {
    headers: { Cookie: cookie }
  });
  assert.equal(protectedPage.status, 200);
  assert.match(await protectedPage.text(), /产业链维护台/);
});

test("runtime secrets and server source are never served as static files", async () => {
  const envResponse = await fetch(`${baseUrl}/.env`);
  const sourceResponse = await fetch(`${baseUrl}/server/server.mjs`);
  assert.equal(envResponse.status, 404);
  assert.equal(sourceResponse.status, 404);
});
