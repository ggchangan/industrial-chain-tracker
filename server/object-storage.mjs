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
    },
    keyFromUrl(value) {
      return objectKeyFromUrl(value);
    }
  };
}

async function createCosObjectStorage(options) {
  const config = {
    secretId: options.secretId || process.env.COS_SECRET_ID,
    secretKey: options.secretKey || process.env.COS_SECRET_KEY,
    region: options.region || process.env.COS_REGION,
    bucket: options.bucket || process.env.COS_BUCKET,
    publicBaseUrl: options.publicBaseUrl || process.env.COS_PUBLIC_BASE_URL,
    internalBaseUrl: options.internalBaseUrl || process.env.COS_INTERNAL_BASE_URL,
    useInternal: options.useInternal ?? process.env.COS_USE_INTERNAL === "true"
  };
  let client = options.client;
  if (!client) {
    let Cos;
    try {
      const cosModule = await import("cos-nodejs-sdk-v5");
      Cos = cosModule.default || cosModule;
    } catch {
      throw configurationError("缺少 cos-nodejs-sdk-v5 依赖，请先安装项目依赖");
    }
    client = new Cos({
      SecretId: config.secretId,
      SecretKey: config.secretKey,
      ...(config.useInternal ? { Domain: "{Bucket}.cos-internal.{Region}.myqcloud.com" } : {})
    });
  }
  return {
    driver: "cos",
    async initialize() {
      const missing = ["secretId", "secretKey", "region", "bucket"]
        .filter((key) => !config[key]);
      if (missing.length) throw configurationError(`COS 配置不完整：${missing.join(", ")}`);
    },
    async putObject(key, contents) {
      await cosCall(client, "putObject", {
        Bucket: config.bucket,
        Region: config.region,
        Key: normalizeKey(key),
        Body: contents,
        ContentLength: contents.length
      });
      return this.urlFor(key);
    },
    async getObject(key) {
      const result = await cosCall(client, "getObject", {
        Bucket: config.bucket,
        Region: config.region,
        Key: normalizeKey(key)
      });
      return Buffer.isBuffer(result.Body) ? result.Body : Buffer.from(result.Body || "");
    },
    async deleteObject(key) {
      await cosCall(client, "deleteObject", {
        Bucket: config.bucket,
        Region: config.region,
        Key: normalizeKey(key)
      });
    },
    urlFor(key) {
      return `/managed/${normalizeKey(key)}`;
    },
    keyFromUrl(value) {
      return keyFromBaseUrl(value, [
        config.publicBaseUrl,
        config.internalBaseUrl,
        `https://${config.bucket}.cos.${config.region}.myqcloud.com`,
        `http://${config.bucket}.cos-internal.${config.region}.myqcloud.com`
      ]);
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

function keyFromBaseUrl(value, baseUrls) {
  const source = String(value || "");
  for (const baseUrl of baseUrls.filter(Boolean)) {
    const normalizedBase = String(baseUrl).replace(/\/$/, "");
    if (source.startsWith(`${normalizedBase}/`)) {
      return normalizeKey(decodeURIComponent(source.slice(normalizedBase.length + 1)));
    }
  }
  return "";
}

function cosCall(client, method, params) {
  return new Promise((resolve, reject) => {
    client[method](params, (error, data) => error ? reject(error) : resolve(data));
  });
}

function configurationError(message) {
  const error = new Error(message);
  error.code = "configuration_error";
  return error;
}
