import crypto from "node:crypto";

const USER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export function createUserAuth(options = {}) {
  const appId = options.wechatAppId ?? process.env.WECHAT_MINIAPP_APPID ?? "";
  const appSecret = options.wechatAppSecret ?? process.env.WECHAT_MINIAPP_SECRET ?? "";
  const secret = options.sessionSecret ?? process.env.USER_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? "";
  const exchangeCode = options.exchangeCode || exchangeWechatCode;
  const revokedTokens = new Map();

  function isConfigured() {
    return Boolean(appId && appSecret && secret.length >= 32);
  }

  async function loginWithWechat(code) {
    if (!isConfigured()) {
      throw authError("wechat_login_not_configured", "服务器尚未配置微信小程序登录");
    }
    const normalizedCode = String(code || "").trim();
    if (!normalizedCode) throw authError("invalid_wechat_code", "缺少微信登录 code", 400);

    const session = await exchangeCode({ appId, appSecret, code: normalizedCode });
    if (!session.openid) throw authError("wechat_login_failed", "微信登录未返回 openid", 502);
    const user = {
      id: `wx:${session.openid}`,
      provider: "wechat-miniapp",
      openid: session.openid,
      unionid: session.unionid || "",
      loggedInAt: new Date().toISOString()
    };
    return {
      token: issueToken(user),
      expiresIn: USER_SESSION_TTL_SECONDS,
      user: publicUser(user)
    };
  }

  function authenticate(request) {
    const token = bearerToken(request);
    if (!token) return null;
    return verifyToken(token);
  }

  function logout(request) {
    const token = bearerToken(request);
    if (!token) return;
    const session = verifyToken(token, { allowRevoked: true });
    if (session?.jti) revokedTokens.set(session.jti, session.exp);
    pruneRevoked(revokedTokens);
  }

  function issueToken(user) {
    const exp = Math.floor(Date.now() / 1000) + USER_SESSION_TTL_SECONDS;
    const payload = Buffer.from(JSON.stringify({
      exp,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID(),
      user
    }), "utf8").toString("base64url");
    return `${payload}.${sign(payload)}`;
  }

  function verifyToken(token, options = {}) {
    if (!secret) return null;
    const [payload, signature] = String(token || "").split(".");
    if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
    try {
      const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      if (Number(session.exp) <= Math.floor(Date.now() / 1000)) return null;
      if (!options.allowRevoked && session.jti && revokedTokens.has(session.jti)) return null;
      return { ...session, user: publicUser(session.user || {}) };
    } catch {
      return null;
    }
  }

  function sign(payload) {
    return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  }

  return {
    authenticate,
    isConfigured,
    loginWithWechat,
    logout
  };
}

async function exchangeWechatCode({ appId, appSecret, code }) {
  const url = new URL("https://api.weixin.qq.com/sns/jscode2session");
  url.searchParams.set("appid", appId);
  url.searchParams.set("secret", appSecret);
  url.searchParams.set("js_code", code);
  url.searchParams.set("grant_type", "authorization_code");
  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok || payload.errcode) {
    throw authError(
      "wechat_login_failed",
      payload.errmsg || `微信登录失败（${response.status}）`,
      502
    );
  }
  return payload;
}

function publicUser(user) {
  return {
    id: user.id,
    provider: user.provider || "wechat-miniapp",
    openid: user.openid,
    unionid: user.unionid || "",
    loggedInAt: user.loggedInAt || ""
  };
}

function bearerToken(request) {
  const authorization = request.headers.authorization || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function pruneRevoked(revokedTokens) {
  const now = Math.floor(Date.now() / 1000);
  for (const [jti, exp] of revokedTokens.entries()) {
    if (Number(exp) <= now) revokedTokens.delete(jti);
  }
}

function authError(code, message, statusCode = 503) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}
