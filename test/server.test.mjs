import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
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

test("authenticated maintainer can create a chain and append an update", async () => {
  const cookie = await login();
  const markdown = `# 固态电池产业链深度解析

> **核心驱动**：新能源车安全与能量密度升级推动固态电池产业化。

## 一、产业链全景

形成材料、制造与整车应用三层结构。

## 二、上游材料

### 固态电解质

硫化物与氧化物路线并行，材料验证决定量产节奏。

## 三、中游制造

### 电芯制造

设备与工艺需要重新适配。

## 四、下游应用

### 新能源汽车

头部车企推动装车验证。

## 五、核心逻辑总结

产业从实验室验证进入中试阶段。`;

  const createResponse = await fetch(`${baseUrl}/api/v1/admin/chains`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      id: "solid-state-battery-test",
      title: "固态电池产业链",
      shortTitle: "固态电池",
      theme: "产业化验证加速。",
      markdown,
      cover: testSvgAsset("封面"),
      diagram: testSvgAsset("图谱")
    })
  });
  assert.equal(createResponse.status, 201);

  const updateResponse = await fetch(`${baseUrl}/api/v1/admin/chains/solid-state-battery-test/updates`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      date: "2026-06-12",
      segment: "电芯制造",
      signal: "头部企业启动中试线验证",
      impact: "推动设备与材料进入客户认证阶段。",
      confidence: "待核验",
      sourceTitle: "产业进展文章",
      sourceUrl: "https://example.com/article",
      notes: "继续跟踪量产时间。"
    })
  });
  assert.equal(updateResponse.status, 201);

  const chainPayload = await fetch(`${baseUrl}/api/v1/chains/solid-state-battery-test?article=html`)
    .then((response) => response.json());
  assert.equal(chainPayload.chain.updates[0].sourceUrl, "https://example.com/article");
  assert.match(chainPayload.article.html, /固态电池产业链深度解析/);

  const managedDiagram = await fetch(`${baseUrl}${chainPayload.chain.diagram}`);
  assert.equal(managedDiagram.status, 200);
  assert.match(managedDiagram.headers.get("content-type"), /image\/svg/);

  const persisted = JSON.parse(await readFile(path.join(dataDir, "managed-content.json"), "utf8"));
  assert.ok(persisted.managedChains.some((chain) => chain.id === "solid-state-battery-test"));
  assert.equal(persisted.updatesByChain["solid-state-battery-test"][0].signal, "头部企业启动中试线验证");

  const managedPayload = await fetch(`${baseUrl}/api/v1/admin/chains/solid-state-battery-test`, {
    headers: { Cookie: cookie }
  }).then((response) => response.json());
  assert.match(managedPayload.markdown, /固态电池产业链深度解析/);

  const updatedStructure = {
    title: "固态电池材料产业链",
    shortTitle: "固态电池材料",
    theme: "材料体系进入中试验证。",
    trackingProfile: managedPayload.chain.trackingProfile,
    chain: managedPayload.chain.chain,
    logic: managedPayload.chain.logic
  };
  const editResponse = await fetch(`${baseUrl}/api/v1/admin/chains/solid-state-battery-test`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ markdown, structure: updatedStructure })
  });
  assert.equal(editResponse.status, 200);
  assert.equal((await editResponse.json()).chain.title, "固态电池材料产业链");
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

function testSvgAsset(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><text x="10" y="50">${label}</text></svg>`;
  return {
    name: `${label}.svg`,
    type: "image/svg+xml",
    data: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
  };
}
