import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const STATE_FILE = "managed-content.json";
const EMPTY_STATE = {
  managedChains: [],
  articleOverrides: {},
  updatesByChain: {},
  sourcesByChain: {},
  logicCardsByChain: {},
  researchPackagesByChain: {},
  monitorVerificationsByChain: {},
  feedbackItems: [],
  radarDecisionsById: {},
  usersById: {},
  updatedAt: ""
};

export async function createStateStore(options = {}) {
  const driver = String(options.driver || process.env.STATE_STORE_DRIVER || "file").toLowerCase();
  if (driver === "file") return createFileStateStore(options.dataDir);
  if (driver === "mysql") return createMySqlStateStore({
    databaseUrl: options.databaseUrl || process.env.DATABASE_URL,
    tableName: options.tableName || process.env.MYSQL_STATE_TABLE || "industrial_chain_content_state"
  });
  throw configurationError(`不支持的状态存储驱动：${driver}`);
}

function createFileStateStore(dataDir) {
  const resolvedDataDir = path.resolve(dataDir);
  return {
    driver: "file",
    async initialize() {
      await mkdir(resolvedDataDir, { recursive: true });
    },
    async load() {
      try {
        return normalizeState(JSON.parse(await readFile(path.join(resolvedDataDir, STATE_FILE), "utf8")));
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        return structuredClone(EMPTY_STATE);
      }
    },
    async save(state) {
      state.updatedAt = new Date().toISOString();
      const target = path.join(resolvedDataDir, STATE_FILE);
      const temporary = `${target}.tmp`;
      await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, "utf8");
      await rename(temporary, target);
    },
    async close() {}
  };
}

async function createMySqlStateStore({ databaseUrl, tableName }) {
  if (!databaseUrl) throw configurationError("STATE_STORE_DRIVER=mysql 时必须配置 DATABASE_URL");
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) throw configurationError("MYSQL_STATE_TABLE 只能包含字母、数字和下划线");
  let mysql;
  try {
    const mysqlModule = await import("mysql2/promise");
    mysql = mysqlModule.default || mysqlModule;
  } catch {
    throw configurationError("缺少 mysql2 依赖，请先安装项目依赖");
  }
  const url = new URL(databaseUrl);
  if (!["mysql:", "mysql2:"].includes(url.protocol)) throw configurationError("DATABASE_URL 必须使用 mysql://");
  const database = url.pathname.replace(/^\//, "");
  if (!url.hostname || !url.username || !database) {
    throw configurationError("DATABASE_URL 必须包含主机、用户和数据库名");
  }
  const pool = mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 5),
    charset: "utf8mb4",
    ssl: process.env.MYSQL_SSL === "true" ? {} : undefined
  });
  return {
    driver: "mysql",
    async initialize() {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS \`${tableName}\` (
          state_key VARCHAR(64) PRIMARY KEY,
          state_json JSON NOT NULL,
          updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
            ON UPDATE CURRENT_TIMESTAMP(3)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    },
    async load() {
      const [rows] = await pool.execute(
        `SELECT state_json FROM \`${tableName}\` WHERE state_key = ? LIMIT 1`,
        ["primary"]
      );
      if (!rows.length) return structuredClone(EMPTY_STATE);
      const value = typeof rows[0].state_json === "string"
        ? JSON.parse(rows[0].state_json)
        : rows[0].state_json;
      return normalizeState(value);
    },
    async save(state) {
      state.updatedAt = new Date().toISOString();
      await pool.execute(
        `INSERT INTO \`${tableName}\` (state_key, state_json)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE state_json = VALUES(state_json)`,
        ["primary", JSON.stringify(state)]
      );
    },
    async close() {
      await pool.end();
    }
  };
}

function normalizeState(state = {}) {
  return {
    managedChains: Array.isArray(state.managedChains) ? state.managedChains : [],
    articleOverrides: objectValue(state.articleOverrides),
    updatesByChain: objectValue(state.updatesByChain),
    sourcesByChain: objectValue(state.sourcesByChain),
    logicCardsByChain: objectValue(state.logicCardsByChain),
    researchPackagesByChain: objectValue(state.researchPackagesByChain),
    monitorVerificationsByChain: objectValue(state.monitorVerificationsByChain),
    feedbackItems: Array.isArray(state.feedbackItems) ? state.feedbackItems : [],
    radarDecisionsById: objectValue(state.radarDecisionsById),
    usersById: objectValue(state.usersById),
    updatedAt: state.updatedAt || ""
  };
}

function objectValue(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function configurationError(message) {
  const error = new Error(message);
  error.code = "configuration_error";
  return error;
}
