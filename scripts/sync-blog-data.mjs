import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const dataPath = new URL("../blog/assets/data.js", import.meta.url);
const blogIndexPath = new URL("../blog/index.html", import.meta.url);
const dataSource = await readFile(dataPath, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSource, sandbox);

const library = sandbox.window.INDUSTRY_CHAIN_LIBRARY;
if (!library?.chains?.length) {
  throw new Error("blog/assets/data.js does not expose window.INDUSTRY_CHAIN_LIBRARY");
}

for (const chain of library.chains) {
  if (!chain.updateFile) continue;

  const sourcePath = new URL(chain.updateFile, blogIndexPath);
  const source = JSON.parse(await readFile(sourcePath, "utf8"));

  chain.watchlist = source.watchlist.map((item) => ({
    segment: item.segment,
    signals: item.whatToTrack,
    companies: item.companies.join("、")
  }));

  chain.updates = source.updates.map((item) => ({
    date: item.date,
    segment: item.segment,
    signal: item.signal,
    impact: item.impact,
    confidence: item.confidence,
    sourceTitle: item.source.title,
    sourceUrl: item.source.url.startsWith("../raw/")
      ? item.source.url.replace("../raw/", "../content/raw/")
      : item.source.url,
    notes: item.notes
  }));
}

library.meta.updated = new Date().toISOString().slice(0, 10);

await writeFile(
  dataPath,
  `window.INDUSTRY_CHAIN_LIBRARY = ${JSON.stringify(library, null, 2)};\n`,
  "utf8"
);

console.log(`Synced ${library.chains.length} chains to blog/assets/data.js`);
