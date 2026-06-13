import assert from "node:assert/strict";
import test from "node:test";
import { renderMarkdown } from "../server/markdown.mjs";

test("markdown renderer supports research article images and separators", () => {
  const rendered = renderMarkdown([
    "---",
    'title: "Research"',
    "---",
    "",
    "## Mechanism",
    "",
    "Before",
    "",
    "---",
    "",
    "![Chart](./images/chart.png)",
    ""
  ].join("\n"));

  assert.equal(rendered.meta.title, "Research");
  assert.match(rendered.html, /<hr>/);
  assert.match(rendered.html, /<img src="\.\/images\/chart\.png" alt="Chart" loading="lazy">/);
});
