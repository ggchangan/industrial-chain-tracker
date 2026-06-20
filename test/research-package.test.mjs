import assert from "node:assert/strict";
import test from "node:test";
import { inspectResearchPackage } from "../server/research-package.mjs";

function packageInput(overrides = {}) {
  const markdown = `# MPO产业链深度解析：测试研究包

![产业链图](assets/map.png)

## 核心逻辑

MPO订单持续增长，MT插芯行业已出现严重缺货。
`;
  const logic = {
    schema_version: "0.2",
    summary: "MPO需求与供给逻辑。",
    logics: [{
      key: "mpo-demand",
      kind: "thesis",
      title: "MPO需求增长",
      statement: "订单和高芯数升级共同驱动需求。",
      status: "strengthening",
      companies: [{ name: "太辰光", ticker: "300570", exchange: "SZSE" }],
      evidence: [{ summary: "插芯缺货。", anchor: "MT插芯行业已出现严重缺货" }],
      monitors: [{
        key: "mpo-orders",
        name: "MPO订单",
        logic: "订单验证需求。",
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
        rules: [{
          metric: "order_growth",
          operator: "greater_than",
          threshold: 0,
          effect: "strengthen"
        }]
      }],
      invalidation: [{ condition: "订单持续下降。", severity: "high" }]
    }]
  };
  return {
    chainId: "optical-module",
    files: [
      { path: "mpo/article.html", content: "<title>MPO产业链深度解析：测试研究包</title>", encoding: "utf8", type: "text/html" },
      { path: "mpo/source-article.md", content: markdown, encoding: "utf8", type: "text/markdown" },
      { path: "mpo/logic.json", content: JSON.stringify(logic), encoding: "utf8", type: "application/json" },
      { path: "mpo/assets/map.png", content: "cG5n", encoding: "base64", type: "image/png" }
    ],
    ...overrides
  };
}

test("research package inspection extracts topic and validates relationships", () => {
  const result = inspectResearchPackage(packageInput());
  assert.equal(result.valid, true);
  assert.equal(result.preview.topicId, "mpo");
  assert.equal(result.preview.topicTitle, "MPO产业链");
  assert.equal(result.preview.logicCount, 1);
  assert.equal(result.preview.monitorCount, 1);
  assert.equal(result.preview.assetCount, 1);
  assert.equal(result.warnings[0].code, "missing_evidence_key");
});

test("research package inspection blocks invalid JSON", () => {
  const input = packageInput();
  input.files.find((file) => file.path.endsWith("logic.json")).content = '{"summary":"未闭合"';
  const result = inspectResearchPackage(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.code === "invalid_json"));
});

test("research package inspection blocks missing anchors and assets", () => {
  const input = packageInput();
  input.files = input.files.filter((file) => !file.path.endsWith("map.png"));
  const logicFile = input.files.find((file) => file.path.endsWith("logic.json"));
  const logic = JSON.parse(logicFile.content);
  logic.logics[0].evidence[0].anchor = "原文不存在的证据";
  logicFile.content = JSON.stringify(logic);
  const result = inspectResearchPackage(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.code === "missing_asset"));
  assert.ok(result.errors.some((item) => item.code === "anchor_not_found"));
});
