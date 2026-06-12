import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createAppServer } from "../server/server.mjs";

const rootDir = new URL("..", import.meta.url).pathname;
let server;
let baseUrl;
let dataDir;

test.before(async () => {
  dataDir = await mkdtemp(path.join(os.tmpdir(), "chain-tracker-test-"));
  await writeFile(path.join(dataDir, "managed-content.json"), JSON.stringify({
    managedChains: [{ id: "semiconductor-material-industry-chain" }],
    articleOverrides: {},
    updatesByChain: {},
    updatedAt: ""
  }));
  server = await createAppServer({
    rootDir,
    dataDir,
    adminPassword: "correct-horse-battery",
    sessionSecret: "test-session-secret-that-is-long-enough-123456"
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  server.close();
  await rm(dataDir, { recursive: true, force: true });
});

test("health and library APIs expose synchronized content", async () => {
  const health = await fetch(`${baseUrl}/api/v1/health`).then((response) => response.json());
  assert.equal(health.status, "ok");
  assert.ok(health.chains >= 20);

  const library = await fetch(`${baseUrl}/api/v1/library`).then((response) => response.json());
  assert.equal(library.chains.length, health.chains);
  assert.ok(library.chains.some((chain) => chain.id === "physical-ai"));
  assert.ok(library.chains.some((chain) => chain.id === "semiconductor-material"));
  assert.ok(!library.chains.some((chain) => chain.id === "semiconductor-material-industry-chain"));
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

test("admin APIs require authentication", async () => {
  const response = await fetch(`${baseUrl}/api/v1/admin/chains`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "未授权产业链" })
  });
  assert.equal(response.status, 401);
});

test("authenticated maintainer can update an existing article and append an update", async () => {
  const cookie = await login();
  const createResponse = await fetch(`${baseUrl}/api/v1/admin/chains`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ title: "不应由维护台直接创建" })
  });
  assert.equal(createResponse.status, 404);

  const currentPayload = await fetch(`${baseUrl}/api/v1/admin/chains/pcb`, {
    headers: { Cookie: cookie }
  }).then((response) => response.json());
  assert.match(currentPayload.markdown, /PCB产业链/);

  const markdown = `${currentPayload.markdown.trim()}\n\n## 维护测试章节\n\n验证后台原文覆盖能够持久化。\n`;
  const articleResponse = await fetch(`${baseUrl}/api/v1/admin/chains/pcb`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ markdown })
  });
  assert.equal(articleResponse.status, 200);
  assert.equal((await articleResponse.json()).chain.id, "pcb");

  const updateResponse = await fetch(`${baseUrl}/api/v1/admin/chains/pcb/updates`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      date: "2026-06-12",
      type: "产业事件",
      segment: "全产业链",
      signal: "维护后台追加测试动态",
      impact: "验证动态追踪持久化。",
      confidence: "待核验",
      sourceTitle: "产业进展文章",
      sourceUrl: "https://example.com/article",
      notes: "仅用于自动测试。"
    })
  });
  assert.equal(updateResponse.status, 201);

  const chainPayload = await fetch(`${baseUrl}/api/v1/chains/pcb?article=html`)
    .then((response) => response.json());
  assert.equal(chainPayload.chain.updates[0].sourceUrl, "https://example.com/article");
  assert.equal(chainPayload.chain.updates[0].type, "产业事件");
  assert.match(chainPayload.article.html, /维护测试章节/);
  assert.match(chainPayload.chain.article, /^\/managed\/raw\//);

  const persisted = JSON.parse(await readFile(path.join(dataDir, "managed-content.json"), "utf8"));
  assert.match(persisted.articleOverrides.pcb, /^\/managed\/raw\//);
  assert.equal(persisted.updatesByChain.pcb[0].signal, "维护后台追加测试动态");
});

async function login() {
  const response = await fetch(`${baseUrl}/api/v1/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "correct-horse-battery" })
  });
  assert.equal(response.status, 200);
  return response.headers.get("set-cookie").split(";")[0];
}
