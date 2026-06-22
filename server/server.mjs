import { createServer as createHttpServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAuth } from "./auth.mjs";
import { createContentStore } from "./content-store.mjs";
import { loadArticle, loadLibrary, searchLibrary } from "./library.mjs";
import { renderMarkdown } from "./markdown.mjs";
import { createStateStore } from "./state-store.mjs";
import { createObjectStorage } from "./object-storage.mjs";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(serverDir, "..");

export async function createAppServer(options = {}) {
  const rootDir = path.resolve(options.rootDir || defaultRoot);
  const baseLibrary = await loadLibrary(rootDir);
  const dataDir = options.dataDir || process.env.DATA_DIR || path.join(rootDir, ".runtime-data");
  const stateStore = options.stateStore || await createStateStore({
    driver: options.stateStoreDriver,
    databaseUrl: options.databaseUrl,
    dataDir
  });
  const objectStorage = options.objectStorage || await createObjectStorage({
    driver: options.objectStorageDriver,
    dataDir
  });
  const contentStore = await createContentStore({
    baseLibrary,
    rootDir,
    dataDir,
    stateStore,
    objectStorage
  });
  const auth = createAuth({
    password: options.adminPassword ?? process.env.ADMIN_PASSWORD,
    secret: options.sessionSecret ?? process.env.ADMIN_SESSION_SECRET,
    secureCookie: options.secureCookie ?? process.env.NODE_ENV === "production"
  });
  const corsOrigin = options.corsOrigin ?? process.env.CORS_ORIGIN ?? "";

  const server = createHttpServer(async (request, response) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
      setSecurityHeaders(response);
      setCorsHeaders(request, response, corsOrigin);

      if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
        response.writeHead(204).end();
        return;
      }

      if (url.pathname.startsWith("/api/v1/")) {
        await handleApi({ request, response, url, contentStore, rootDir, auth });
        return;
      }

      if (url.pathname === "/maintain.html" || url.pathname === "/README.md") {
        if (!auth.isAuthenticated(request)) {
          response.writeHead(302, { Location: `/admin-login.html?next=${encodeURIComponent(url.pathname)}` }).end();
          return;
        }
      }

      await serveStatic(rootDir, contentStore, url.pathname, response);
    } catch (error) {
      console.error(error);
      sendJson(response, error.statusCode || 500, {
        error: error.code || "internal_error",
        message: error.statusCode ? error.message : "服务暂时不可用",
        ...(error.details ? { details: error.details } : {})
      });
    }
  });
  server.on("close", () => {
    contentStore.close().catch((error) => console.error("Failed to close content store", error));
  });
  return server;
}

async function handleApi(context) {
  const { request, response, url, contentStore, rootDir, auth } = context;
  const pathname = url.pathname;
  const library = contentStore.getLibrary();

  if (request.method === "GET" && pathname === "/api/v1/health") {
    sendJson(response, 200, {
      status: "ok",
      chains: library.chains.length,
      updated: library.meta.updated,
      adminConfigured: auth.isConfigured(),
      stateStore: contentStore.stateStoreDriver,
      objectStorage: contentStore.objectStorageDriver
    });
    return;
  }

  if (request.method === "GET" && pathname === "/api/v1/library") {
    sendJson(response, 200, library, { cache: "public, max-age=60" });
    return;
  }

  if (request.method === "GET" && pathname === "/api/v1/chains") {
    sendJson(
      response,
      200,
      {
        meta: library.meta,
        chains: library.chains.map(({ article, cover, diagram, diagramSvg, updateFile, ...chain }) => ({
          ...chain,
          resources: { article, cover, diagram, diagramSvg, updateFile }
        }))
      },
      { cache: "public, max-age=60" }
    );
    return;
  }

  const chainMatch = pathname.match(/^\/api\/v1\/chains\/([a-z0-9-]+)$/);
  if (request.method === "GET" && chainMatch) {
    const chain = library.chains.find((item) => item.id === chainMatch[1]);
    if (!chain) {
      sendJson(response, 404, { error: "chain_not_found" });
      return;
    }
    const articleMode = url.searchParams.get("article");
    const markdown = articleMode ? await loadArticle(rootDir, chain, contentStore.dataDir) : undefined;
    const article = articleMode === "html" ? renderMarkdown(markdown) : markdown;
    sendJson(response, 200, { chain, ...(article === undefined ? {} : { article }) }, { cache: "public, max-age=60" });
    return;
  }

  if (request.method === "GET" && pathname === "/api/v1/search") {
    const query = url.searchParams.get("q") || "";
    const limit = Number.parseInt(url.searchParams.get("limit") || "30", 10);
    sendJson(response, 200, { query, results: searchLibrary(library, query, limit) }, { cache: "public, max-age=30" });
    return;
  }

  if (request.method === "GET" && pathname === "/api/v1/admin/session") {
    sendJson(response, 200, {
      authenticated: auth.isAuthenticated(request),
      configured: auth.isConfigured()
    });
    return;
  }

  if (request.method === "POST" && pathname === "/api/v1/admin/login") {
    if (!auth.isConfigured()) {
      sendJson(response, 503, { error: "admin_not_configured", message: "服务器尚未配置维护密码" });
      return;
    }

    const ip = request.socket.remoteAddress || "unknown";
    if (!auth.canAttempt(ip)) {
      sendJson(response, 429, { error: "too_many_attempts", message: "尝试次数过多，请稍后再试" });
      return;
    }

    const body = await readJsonBody(request);
    if (!auth.verifyPassword(body.password)) {
      auth.recordFailure(ip);
      sendJson(response, 401, { error: "invalid_credentials", message: "密码不正确" });
      return;
    }

    auth.clearFailures(ip);
    response.setHeader("Set-Cookie", auth.issueCookie());
    sendJson(response, 200, { authenticated: true });
    return;
  }

  if (request.method === "POST" && pathname === "/api/v1/admin/logout") {
    response.setHeader("Set-Cookie", auth.clearCookie());
    sendJson(response, 200, { authenticated: false });
    return;
  }

  if (pathname.startsWith("/api/v1/admin/") && !auth.isAuthenticated(request)) {
    sendJson(response, 401, { error: "authentication_required", message: "请先登录维护台" });
    return;
  }

  if (request.method === "GET" && pathname === "/api/v1/admin/chains") {
    sendJson(response, 200, {
      chains: library.chains.map((chain) => ({
        id: chain.id,
        title: chain.title,
        shortTitle: chain.shortTitle,
        updates: chain.updates?.length || 0,
        managed: contentStore.isManagedChain(chain.id)
      }))
    });
    return;
  }

  const managedChainMatch = pathname.match(/^\/api\/v1\/admin\/chains\/([a-z0-9-]+)$/);
  if (request.method === "GET" && managedChainMatch) {
    sendJson(response, 200, await contentStore.getEditableChain(managedChainMatch[1]));
    return;
  }

  if (request.method === "PUT" && managedChainMatch) {
    const body = await readJsonBody(request, 2 * 1024 * 1024);
    const chain = await contentStore.updateArticle(managedChainMatch[1], body);
    sendJson(response, 200, { chain });
    return;
  }

  if (request.method === "DELETE" && managedChainMatch) {
    await contentStore.deleteManagedChain(managedChainMatch[1]);
    sendJson(response, 200, { deleted: true });
    return;
  }

  const updateMatch = pathname.match(/^\/api\/v1\/admin\/chains\/([a-z0-9-]+)\/updates$/);
  if (request.method === "POST" && updateMatch) {
    const body = await readJsonBody(request, 128 * 1024);
    const update = await contentStore.addUpdate(updateMatch[1], body);
    sendJson(response, 201, { update });
    return;
  }

  const editableUpdateMatch = pathname.match(
    /^\/api\/v1\/admin\/chains\/([a-z0-9-]+)\/updates\/([a-z0-9-]+)$/
  );
  if (request.method === "PUT" && editableUpdateMatch) {
    const body = await readJsonBody(request, 128 * 1024);
    const update = await contentStore.updateUpdate(editableUpdateMatch[1], editableUpdateMatch[2], body);
    sendJson(response, 200, { update });
    return;
  }

  const sourceMatch = pathname.match(/^\/api\/v1\/admin\/chains\/([a-z0-9-]+)\/sources$/);
  if (request.method === "POST" && sourceMatch) {
    const body = await readJsonBody(request, 2 * 1024 * 1024);
    const source = await contentStore.addSource(sourceMatch[1], body);
    sendJson(response, 201, { source });
    return;
  }

  const packageInspectMatch = pathname.match(
    /^\/api\/v1\/admin\/chains\/([a-z0-9-]+)\/research-packages\/inspect$/
  );
  if (request.method === "POST" && packageInspectMatch) {
    const body = await readJsonBody(request, 24 * 1024 * 1024);
    sendJson(response, 200, await contentStore.inspectPackage(packageInspectMatch[1], body));
    return;
  }

  const packageImportMatch = pathname.match(
    /^\/api\/v1\/admin\/chains\/([a-z0-9-]+)\/research-packages$/
  );
  if (request.method === "POST" && packageImportMatch) {
    const body = await readJsonBody(request, 24 * 1024 * 1024);
    const researchPackage = await contentStore.importPackage(packageImportMatch[1], body);
    sendJson(response, 201, { researchPackage });
    return;
  }

  const editableSourceMatch = pathname.match(
    /^\/api\/v1\/admin\/chains\/([a-z0-9-]+)\/sources\/([a-z0-9-]+)$/
  );
  if (request.method === "GET" && editableSourceMatch) {
    sendJson(
      response,
      200,
      await contentStore.getEditableSource(editableSourceMatch[1], editableSourceMatch[2])
    );
    return;
  }

  if (request.method === "PUT" && editableSourceMatch) {
    const body = await readJsonBody(request, 12 * 1024 * 1024);
    const source = await contentStore.updateSource(editableSourceMatch[1], editableSourceMatch[2], body);
    sendJson(response, 200, { source });
    return;
  }

  const logicCardsMatch = pathname.match(
    /^\/api\/v1\/admin\/chains\/([a-z0-9-]+)\/logic-cards$/
  );
  if (request.method === "GET" && logicCardsMatch) {
    sendJson(response, 200, await contentStore.listLogicCards(logicCardsMatch[1]));
    return;
  }

  if (request.method === "POST" && logicCardsMatch) {
    const body = await readJsonBody(request, 512 * 1024);
    const card = await contentStore.saveLogicCard(logicCardsMatch[1], "", body);
    sendJson(response, 201, { card });
    return;
  }

  const editableLogicCardMatch = pathname.match(
    /^\/api\/v1\/admin\/chains\/([a-z0-9-]+)\/logic-cards\/([a-z0-9-]+)$/
  );
  if (request.method === "PUT" && editableLogicCardMatch) {
    const body = await readJsonBody(request, 512 * 1024);
    const card = await contentStore.saveLogicCard(
      editableLogicCardMatch[1],
      editableLogicCardMatch[2],
      body
    );
    sendJson(response, 200, { card });
    return;
  }

  if (request.method === "DELETE" && editableLogicCardMatch) {
    await contentStore.deleteLogicCard(editableLogicCardMatch[1], editableLogicCardMatch[2]);
    sendJson(response, 200, { deleted: true });
    return;
  }

  sendJson(response, 404, { error: "not_found" });
}

async function serveStatic(rootDir, contentStore, pathname, response) {
  if (pathname.startsWith("/managed/")) {
    const objectKey = decodeURIComponent(pathname.replace(/^\/managed\//, ""));
    if (!objectKey || objectKey.includes("..")) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    try {
      const contents = await contentStore.readObject(objectKey);
      response.writeHead(200, {
        "Content-Type": contentType(objectKey),
        "Cache-Control": cacheControl(objectKey)
      });
      response.end(contents);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
    }
    return;
  }

  const requested = pathname === "/" ? "/index.html" : pathname;
  const decoded = decodeURIComponent(requested);
  const blockedPrefixes = ["/.env", "/.git", "/server/", "/test/", "/deploy/"];
  if (blockedPrefixes.some((prefix) => decoded === prefix.replace(/\/$/, "") || decoded.startsWith(prefix))) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
    return;
  }
  const filePath = path.resolve(rootDir, `.${decoded}`);
  const rootPrefix = `${rootDir}${path.sep}`;

  if (!filePath.startsWith(rootPrefix)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  await serveFile(filePath, response);
}

async function serveFile(filePath, response) {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");
    const contents = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentType(filePath),
      "Cache-Control": cacheControl(filePath)
    });
    response.end(contents);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
}

async function readJsonBody(request, maxSize = 32 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxSize) {
      const error = new Error("请求内容过大");
      error.statusCode = 413;
      error.code = "payload_too_large";
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    return {};
  }
}

function sendJson(response, status, payload, options = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": options.cache || "no-store"
  });
  response.end(JSON.stringify(payload));
}

function setSecurityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

function setCorsHeaders(request, response, corsOrigin) {
  if (!corsOrigin) return;
  const origin = request.headers.origin;
  if (corsOrigin === "*" || origin === corsOrigin) {
    response.setHeader("Access-Control-Allow-Origin", corsOrigin === "*" ? "*" : origin);
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.setHeader("Vary", "Origin");
  }
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml; charset=utf-8",
    ".webp": "image/webp"
  }[extension] || "application/octet-stream";
}

function cacheControl(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if ([".png", ".svg", ".webp"].includes(extension)) return "public, max-age=604800";
  if ([".css", ".js"].includes(extension)) return "public, max-age=300";
  return "no-cache";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number.parseInt(process.env.PORT || "4173", 10);
  const host = process.env.HOST || "0.0.0.0";
  const server = await createAppServer();
  server.listen(port, host, () => {
    console.log(`Industry Chain Tracker listening on http://${host}:${port}`);
  });
}
