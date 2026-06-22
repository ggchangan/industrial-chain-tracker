import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStateStore } from "../server/state-store.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const dataDir = path.resolve(process.env.DATA_DIR || path.join(rootDir, ".runtime-data"));

if (!process.env.DATABASE_URL) {
  console.error("缺少 DATABASE_URL，无法迁移到 MySQL。");
  process.exit(1);
}

const source = await createStateStore({ driver: "file", dataDir });
const target = await createStateStore({
  driver: "mysql",
  databaseUrl: process.env.DATABASE_URL,
  tableName: process.env.MYSQL_STATE_TABLE
});

await source.initialize();
await target.initialize();
const state = await source.load();

const recordCount = [
  state.managedChains.length,
  Object.values(state.updatesByChain).flat().length,
  Object.values(state.sourcesByChain).flat().length,
  Object.values(state.logicCardsByChain).flat().length,
  Object.values(state.researchPackagesByChain).flat().length
].reduce((total, value) => total + value, 0);

if (!recordCount && process.env.ALLOW_EMPTY_STATE_MIGRATION !== "true") {
  console.error(`本地状态 ${dataDir} 为空；若确实需要覆盖 MySQL，请设置 ALLOW_EMPTY_STATE_MIGRATION=true。`);
  process.exit(1);
}

await target.save(state);
await target.close();
console.log(`迁移完成：${recordCount} 条内容记录已写入 MySQL。`);
