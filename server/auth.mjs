import crypto from "node:crypto";

const SESSION_TTL_SECONDS = 60 * 60 * 12;

export function createAuth(options = {}) {
  const password = options.password || "";
  const secret = options.secret || "";
  const secureCookie = options.secureCookie ?? false;
  const attempts = new Map();

  function isConfigured() {
    return password.length >= 10 && secret.length >= 32;
  }

  function verifyPassword(candidate) {
    if (!isConfigured()) return false;
    return safeEqual(hash(candidate), hash(password));
  }

  function issueCookie() {
    const payload = Buffer.from(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }),
      "utf8"
    ).toString("base64url");
    const signature = sign(payload);
    return serializeCookie("chain_admin", `${payload}.${signature}`, {
      httpOnly: true,
      sameSite: "Strict",
      secure: secureCookie,
      maxAge: SESSION_TTL_SECONDS,
      path: "/"
    });
  }

  function clearCookie() {
    return serializeCookie("chain_admin", "", {
      httpOnly: true,
      sameSite: "Strict",
      secure: secureCookie,
      maxAge: 0,
      path: "/"
    });
  }

  function isAuthenticated(request) {
    if (!isConfigured()) return false;
    const token = parseCookies(request.headers.cookie || "").chain_admin;
    if (!token) return false;

    const [payload, signature] = token.split(".");
    if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;

    try {
      const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      return Number(session.exp) > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }

  function canAttempt(ip) {
    const now = Date.now();
    const record = attempts.get(ip);
    if (!record || now - record.startedAt > 15 * 60 * 1000) {
      attempts.set(ip, { count: 0, startedAt: now });
      return true;
    }
    return record.count < 6;
  }

  function recordFailure(ip) {
    const record = attempts.get(ip) || { count: 0, startedAt: Date.now() };
    record.count += 1;
    attempts.set(ip, record);
  }

  function clearFailures(ip) {
    attempts.delete(ip);
  }

  function sign(payload) {
    return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  }

  return {
    canAttempt,
    clearCookie,
    clearFailures,
    isAuthenticated,
    isConfigured,
    issueCookie,
    recordFailure,
    verifyPassword
  };
}

function hash(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function parseCookies(header) {
  return header.split(";").reduce((cookies, item) => {
    const separator = item.indexOf("=");
    if (separator < 0) return cookies;
    const key = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function serializeCookie(name, value, options) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${options.path}`];
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.secure) parts.push("Secure");
  if (Number.isFinite(options.maxAge)) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join("; ");
}
