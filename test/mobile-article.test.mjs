import test from "node:test";
import assert from "node:assert/strict";
import {
  buildArticleBlocks,
  buildReaderToc,
  findArticleTarget
} from "../apps/mobile/src/utils/article.mjs";

const html = [
  '<h1 id="article-0-title">产业链标题</h1>',
  "<p>总览内容</p>",
  '<h2 id="article-1-upstream">上游材料</h2>',
  "<p>PPO树脂与电子布</p>",
  '<h3 id="article-2-company">公司段落</h3>',
  "<p>广合科技进入服务器PCB供应链</p>"
].join("\n");

const toc = [
  { id: "article-0-title", level: 1, text: "产业链标题" },
  { id: "article-1-upstream", level: 2, text: "上游材料" },
  { id: "article-2-company", level: 3, text: "公司段落" }
];

test("mobile article helper splits rendered HTML into navigable blocks", () => {
  const blocks = buildArticleBlocks(html, toc);
  assert.equal(blocks.length, 3);
  assert.equal(blocks[1].title, "上游材料");
  assert.equal(blocks[2].anchorId, "article-block-2");
  assert.deepEqual(
    buildReaderToc(blocks).map(({ level, title }) => ({ level, title })),
    toc.map(({ level, text }) => ({ level, title: text }))
  );
});

test("mobile article helper locates a search result in article body or heading", () => {
  const blocks = buildArticleBlocks(html, toc);
  assert.equal(findArticleTarget(blocks, "PPO树脂"), 1);
  assert.equal(findArticleTarget(blocks, "广合科技"), 2);
  assert.equal(findArticleTarget(blocks, "", "上游材料"), 1);
  assert.equal(findArticleTarget(blocks, "不存在"), -1);
});

test("mobile article helper prefers a dedicated heading over an earlier overview mention", () => {
  const article = [
    '<h1 id="title">PCB产业链</h1><p>PPO树脂供需偏紧</p>',
    '<h2 id="materials">电子级PPO/PPE树脂</h2><p>专节正文</p>'
  ].join("");
  const blocks = buildArticleBlocks(article, [
    { id: "title", level: 1, text: "PCB产业链" },
    { id: "materials", level: 2, text: "电子级PPO/PPE树脂" }
  ]);
  assert.equal(findArticleTarget(blocks, "PPO树脂", "PPO/PPE与特种树脂"), 1);
});

test("mobile article helper prefers an exact company occurrence over a broad category title", () => {
  const article = [
    '<h1 id="title">PCB产业链：从上游到下游制造</h1><p>总览</p>',
    '<h2 id="downstream">下游PCB制造</h2><p>行业概览</p>',
    '<h3 id="server">AI算力服务器PCB龙头</h3><p>广合科技进入供应链</p>'
  ].join("");
  const blocks = buildArticleBlocks(article, [
    { id: "title", level: 1, text: "PCB产业链：从上游到下游制造" },
    { id: "downstream", level: 2, text: "下游PCB制造" },
    { id: "server", level: 3, text: "AI算力服务器PCB龙头" }
  ]);
  assert.equal(findArticleTarget(blocks, "广合科技", "下游：PCB制造与终端"), 2);
});
