import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export async function createObjectStorage(options = {}) {
  const driver = String(options.driver || process.env.OBJECT_STORAGE_DRIVER || "local").toLowerCase();
  if (driver === "local") return createLocalObjectStorage(options.dataDir);
  if (driver === "cos") return createCosObjectStorage(options);
  throw configurationError(`不支持的对象存储驱动：${driver}`);
}

function createLocalObjectStorage(dataDir) {
  const root = path.resolve(dataDir);
  return {
    driver: "local",
    root,
    async initialize() {
      await mkdir(root, { recursive: true });
    },
    async putObject(key, contents) {
      const target = resolveKey(root, key);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, contents);
      return this.urlFor(key);
    },
    async getObject(key) {
      return readFile(resolveKey(root, key));
    },
    async deleteObject(key) {
      await rm(resolveKey(root, key), { force: true });
    },
    urlFor(key) {
      return `/managed/${normalizeKey(key)}`;
    }
  };
}

function createCosObjectStorage(options) {
  const config = {
    secretId: options.secretId || process.env.COS_SECRET_ID,
    secretKey: options.secretKey || process.env.COS_SECRET_KEY,
    region: options.region || process.env.COS_REGION,
    bucket: options.bucket || process.env.COS_BUCKET,
    publicBaseUrl: options.publicBaseUrl || process.env.COS_PUBLIC_BASE_URL
  };
  return {
    driver: "cos",
    async initialize() {
      const missing = Object.entries(config)
        .filter(([key, value]) => key !== "publicBaseUrl" && !value)
        .map(([key]) => key);
      if (missing.length) throw configurationError(`COS 配置不完整：${missing.join(", ")}`);
      throw configurationError("腾讯云 COS 驱动接口已预留，当前版本尚未启用；请暂用 OBJECT_STORAGE_DRIVER=local");
    },
    async putObject() { throw configurationError("COS 驱动尚未启用"); },
    async getObject() { throw configurationError("COS 驱动尚未启用"); },
    async deleteObject() { throw configurationError("COS 驱动尚未启用"); },
    urlFor(key) {
      return config.publicBaseUrl
        ? `${config.publicBaseUrl.replace(/\/$/, "")}/${normalizeKey(key)}`
        : "";
    }
  };
}

export function objectKeyFromUrl(value) {
  if (!String(value || "").startsWith("/managed/")) return "";
  return normalizeKey(String(value).replace(/^\/managed\//, ""));
}

function resolveKey(root, key) {
  const target = path.resolve(root, normalizeKey(key));
  const prefix = `${root}${path.sep}`;
  if (!target.startsWith(prefix)) throw new Error("对象路径越界");
  return target;
}

function normalizeKey(value) {
  const normalized = String(value || "").replaceAll("\\", "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) throw new Error("对象路径无效");
  return normalized;
}

function configurationError(message) {
  const error = new Error(message);
  error.code = "configuration_error";
  return error;
}
