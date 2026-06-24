import { request } from "./api";

const TOKEN_KEY = "industry-chain:user-token";
const USER_KEY = "industry-chain:user";

export function getStoredUser() {
  return uni.getStorageSync(USER_KEY) || null;
}

export function getStoredToken() {
  return uni.getStorageSync(TOKEN_KEY) || "";
}

export async function fetchUserSession() {
  const token = getStoredToken();
  const payload = await request("/api/v1/auth/session", { token });
  if (!payload.authenticated) {
    clearStoredSession();
    return { authenticated: false, configured: payload.configured, user: null };
  }
  uni.setStorageSync(USER_KEY, payload.user);
  return payload;
}

export async function loginWithWechat() {
  const loginResult = await uniLogin();
  const payload = await request("/api/v1/auth/wechat-login", {
    method: "POST",
    data: { code: loginResult.code }
  });
  uni.setStorageSync(TOKEN_KEY, payload.token);
  uni.setStorageSync(USER_KEY, payload.user);
  return payload;
}

export async function logoutUser() {
  const token = getStoredToken();
  try {
    if (token) await request("/api/v1/auth/logout", { method: "POST", token });
  } finally {
    clearStoredSession();
  }
}

function clearStoredSession() {
  uni.removeStorageSync(TOKEN_KEY);
  uni.removeStorageSync(USER_KEY);
}

function uniLogin() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: "weixin",
      success(result) {
        if (result.code) resolve(result);
        else reject(new Error("微信登录未返回 code"));
      },
      fail(error) {
        reject(new Error(error.errMsg || "微信登录失败"));
      }
    });
  });
}
