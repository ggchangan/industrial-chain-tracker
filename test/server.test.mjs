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
    sourcesByChain: {},
    logicCardsByChain: {},
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
  const pcb = library.chains.find((chain) => chain.id === "pcb");
  assert.ok(!pcb.sources.some((source) =>
    source.markdownUrl === pcb.article || source.originalUrl === pcb.article
  ));
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

test("maintainer can inspect and import a standard research package", async () => {
  const cookie = await login();
  const files = [
    {
      path: "mpo/article.html",
      type: "text/html",
      encoding: "utf8",
      content: "<!doctype html><title>MPO产业链深度解析：测试导入</title><h1>MPO产业链</h1>"
    },
    {
      path: "mpo/source-article.md",
      type: "text/markdown",
      encoding: "utf8",
      content: "# MPO产业链深度解析：测试导入\n\n![图](assets/map.png)\n\n## 核心逻辑\n\nMPO订单增长。"
    },
    {
      path: "mpo/logic.json",
      type: "application/json",
      encoding: "utf8",
      content: JSON.stringify({
        schema_version: "0.2",
        summary: "MPO测试逻辑。",
        logics: [{
          key: "mpo-orders",
          kind: "thesis",
          title: "MPO订单增长",
          statement: "订单验证需求。",
          status: "strengthening",
          companies: [{ name: "太辰光", ticker: "300570", exchange: "SZSE" }],
          evidence: [{ summary: "订单增长。", anchor: "MPO订单增长" }],
          monitors: [{
            key: "order-growth",
            name: "订单增长",
            logic: "订单是需求验证。",
            strengthening_signal: "订单增长。",
            weakening_signal: "订单下降。",
            data_sources: [{
              type: "company-filing",
              providers: ["太辰光"],
              document: "季度报告",
              frequency: "quarterly",
              access: "exchange-announcement",
              automation_target: "automatic",
              execution_status: "planned"
            }],
            rules: [{ metric: "order_growth", operator: "greater_than", threshold: 0, effect: "strengthen" }]
          }],
          invalidation: [{ condition: "订单持续下降。", severity: "high" }]
        }]
      })
    },
    {
      path: "mpo/assets/map.png",
      type: "image/png",
      encoding: "base64",
      content: "cG5n"
    }
  ];

  const inspectResponse = await fetch(
    `${baseUrl}/api/v1/admin/chains/optical-module/research-packages/inspect`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ files })
    }
  );
  assert.equal(inspectResponse.status, 200);
  const inspection = await inspectResponse.json();
  assert.equal(inspection.valid, true);
  assert.equal(inspection.preview.topicId, "mpo");

  const importResponse = await fetch(
    `${baseUrl}/api/v1/admin/chains/optical-module/research-packages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ files })
    }
  );
  assert.equal(importResponse.status, 201);
  const imported = (await importResponse.json()).researchPackage;
  assert.match(imported.articleUrl, /^\/managed\/research-packages\/optical-module\/mpo\//);

  const library = await fetch(`${baseUrl}/api/v1/library`).then((response) => response.json());
  const chain = library.chains.find((item) => item.id === "optical-module");
  assert.ok(chain.researchPackages.some((item) => item.packageId === imported.packageId));
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

  const sourceMarkdown = "# CCL价格传导测试资料\n\n这是一份保存到产业链资料档案的完整 Markdown 原文，用于验证独立资料不会覆盖产业链基准原文。";
  const sourceResponse = await fetch(`${baseUrl}/api/v1/admin/chains/pcb/sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      date: "2026-06-13",
      type: "research-article",
      platform: "自有研究",
      title: "CCL价格传导测试资料",
      originalUrl: "",
      summary: "验证资料归档与原文持久化。",
      segment: "覆铜板 CCL",
      companies: "生益科技、国际复材",
      tags: "价格传导、CCL",
      status: "draft",
      markdown: sourceMarkdown
    })
  });
  assert.equal(sourceResponse.status, 201);
  const savedSource = (await sourceResponse.json()).source;
  assert.match(savedSource.markdownUrl, /^\/managed\/sources\/pcb\//);

  const chainPayload = await fetch(`${baseUrl}/api/v1/chains/pcb?article=html`)
    .then((response) => response.json());
  const testUpdate = chainPayload.chain.updates.find(
    (item) => item.sourceUrl === "https://example.com/article"
  );
  assert.equal(testUpdate.type, "产业事件");
  assert.match(chainPayload.article.html, /维护测试章节/);
  assert.match(chainPayload.chain.article, /^\/managed\/raw\//);
  assert.ok(chainPayload.chain.sources.some((source) => source.title === "CCL价格传导测试资料"));
  assert.ok(chainPayload.chain.sources.some((source) => source.originalUrl === "https://example.com/article"));

  const cclSource = chainPayload.chain.sources.find((source) =>
    source.title === "PCB产业链深度研究：为什么CCL是最大赢家，以及这套逻辑何时会变？"
  );
  assert.equal(cclSource.illustrations.length, 2);
  const editableSource = await fetch(
    `${baseUrl}/api/v1/admin/chains/pcb/sources/${cclSource.id}`,
    { headers: { Cookie: cookie } }
  ).then((response) => response.json());
  assert.match(editableSource.markdown, /为什么CCL是最大赢家/);

  const sourceUpdateResponse = await fetch(
    `${baseUrl}/api/v1/admin/chains/pcb/sources/${cclSource.id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        ...editableSource.source,
        summary: "后台已接管这份文章及其配图。",
        markdown: `${editableSource.markdown
          .replace(/^#\s+.+\r?\n+/, "")
          .trim()}\n\n## 后台资料包测试\n\n文章与配图作为一个集合更新。\n`
      })
    }
  );
  assert.equal(sourceUpdateResponse.status, 200);
  const updatedCclSource = (await sourceUpdateResponse.json()).source;
  assert.match(updatedCclSource.markdownUrl, /^\/managed\/sources\/pcb\//);
  assert.equal(updatedCclSource.illustrations.length, 2);
  const updatedCclMarkdown = await readFile(
    path.join(dataDir, updatedCclSource.markdownUrl.replace(/^\/managed\//, "")),
    "utf8"
  );
  assert.match(
    updatedCclMarkdown,
    /^# PCB产业链深度研究：为什么CCL是最大赢家，以及这套逻辑何时会变？/
  );

  const logicCardsResponse = await fetch(`${baseUrl}/api/v1/admin/chains/pcb/logic-cards`, {
    headers: { Cookie: cookie }
  });
  assert.equal(logicCardsResponse.status, 200);
  const editableLogicCards = await logicCardsResponse.json();
  assert.equal(editableLogicCards.cards.length, 5);
  const existingLogicCard = editableLogicCards.cards.find((card) => card.id === "triple-squeeze");
  const existingLogicUpdate = await fetch(
    `${baseUrl}/api/v1/admin/chains/pcb/logic-cards/${existingLogicCard.id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        ...existingLogicCard,
        content: { points: existingLogicCard.points },
        summary: `${existingLogicCard.summary}（维护测试）`
      })
    }
  );
  assert.equal(existingLogicUpdate.status, 200);
  const updatedExistingLogic = (await existingLogicUpdate.json()).card;
  assert.equal(updatedExistingLogic.sources[0].url, updatedCclSource.markdownUrl);
  assert.deepEqual(updatedExistingLogic.attachments, existingLogicCard.attachments);

  const draftLogicResponse = await fetch(`${baseUrl}/api/v1/admin/chains/pcb/logic-cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      trackId: "ccl-price-transmission",
      trackTitle: "CCL价格传导机制",
      trackSummary: "验证资料提炼、草稿隔离与公开发布。",
      sourceId: cclSource.id,
      kicker: "测试逻辑",
      title: "草稿逻辑卡不会提前公开",
      summary: "维护端可以先保存和修订逻辑卡，再决定何时发布。",
      display: "points",
      content: {
        points: [
          { label: "草稿", description: "只在维护端可见。" },
          { label: "发布", description: "发布后进入公开逻辑组。" }
        ]
      },
      attachments: [
        { type: "segment", label: "覆铜板 CCL", target: "pcb:chain:2" },
        { type: "company", label: "生益科技" }
      ],
      sources: [{
        label: "阅读全文",
        type: "article",
        title: cclSource.title,
        url: updatedCclSource.markdownUrl,
        anchor: "CCL的超涨能力来自三重挤压"
      }],
      articleAnchor: "CCL的超涨能力来自三重挤压",
      order: 6,
      status: "draft"
    })
  });
  assert.equal(draftLogicResponse.status, 201);
  const draftLogicCard = (await draftLogicResponse.json()).card;

  const draftPublicChain = await fetch(`${baseUrl}/api/v1/chains/pcb`)
    .then((response) => response.json());
  assert.ok(!draftPublicChain.chain.logicTracks
    .flatMap((track) => track.coreInsights || [])
    .some((card) => card.id === draftLogicCard.id));

  const publishLogicResponse = await fetch(
    `${baseUrl}/api/v1/admin/chains/pcb/logic-cards/${draftLogicCard.id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ status: "published", order: 1 })
    }
  );
  assert.equal(publishLogicResponse.status, 200);

  const publishedChain = await fetch(`${baseUrl}/api/v1/chains/pcb`)
    .then((response) => response.json());
  const publishedTrack = publishedChain.chain.logicTracks
    .find((track) => track.id === "ccl-price-transmission");
  const publishedLogicCard = publishedTrack.coreInsights
    .find((card) => card.id === draftLogicCard.id);
  assert.equal(publishedTrack.coreInsights[0].id, draftLogicCard.id);
  assert.equal(publishedLogicCard.attachments[0].target, "pcb:chain:2");
  assert.equal(publishedLogicCard.sources[0].url, updatedCclSource.markdownUrl);
  assert.equal(publishedLogicCard.sources[0].anchor, "CCL的超涨能力来自三重挤压");

  const updateId = chainPayload.chain.updates.find(
    (item) => item.sourceUrl === "https://example.com/article"
  ).id;
  const editUpdateResponse = await fetch(
    `${baseUrl}/api/v1/admin/chains/pcb/updates/${updateId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        date: "2026-06-12",
        type: "机构逻辑",
        segment: "覆铜板 CCL",
        signal: "维护后台修订测试动态",
        impact: "验证已有动态可以修订而不是重复新增。",
        confidence: "已核验",
        sourceTitle: "产业进展文章",
        sourceUrl: "https://example.com/article",
        notes: "仅用于自动测试。"
      })
    }
  );
  assert.equal(editUpdateResponse.status, 200);

  const refreshedChain = await fetch(`${baseUrl}/api/v1/chains/pcb`)
    .then((response) => response.json());
  assert.equal(refreshedChain.chain.sources.filter((source) => source.id === cclSource.id).length, 1);
  assert.equal(refreshedChain.chain.updates.filter((update) => update.id === updateId).length, 1);
  assert.match(
    refreshedChain.chain.updates.find((update) => update.sourceTitle === cclSource.title).sourceUrl,
    /^\/managed\/sources\/pcb\//
  );
  assert.ok(
    refreshedChain.chain.logicTracks
      .flatMap((track) => track.coreInsights || [])
      .flatMap((insight) => insight.sources || [])
      .filter((source) => source.title === cclSource.title)
      .every((source) => /^\/managed\/sources\/pcb\//.test(source.url))
  );
  assert.equal(
    refreshedChain.chain.updates.find((update) => update.id === updateId).signal,
    "维护后台修订测试动态"
  );

  const persisted = JSON.parse(await readFile(path.join(dataDir, "managed-content.json"), "utf8"));
  assert.match(persisted.articleOverrides.pcb, /^\/managed\/raw\//);
  assert.equal(persisted.updatesByChain.pcb[0].signal, "维护后台修订测试动态");
  assert.ok(persisted.sourcesByChain.pcb.some((source) => source.title === "CCL价格传导测试资料"));
  assert.ok(persisted.logicCardsByChain.pcb.some((card) =>
    card.id === draftLogicCard.id && card.status === "published"
  ));
  const persistedMarkdown = await readFile(
    path.join(
      dataDir,
      persisted.sourcesByChain.pcb
        .find((source) => source.title === "CCL价格传导测试资料")
        .markdownUrl
        .replace(/^\/managed\//, "")
    ),
    "utf8"
  );
  assert.match(persistedMarkdown, /不会覆盖产业链基准原文/);
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
