import { request } from "./api";
import { getClientPlatformLabel, isWechatMiniProgram } from "./platform";

const TOKEN_KEY = "industry-chain:user-token";
const USER_KEY = "industry-chain:user";
const PROFILE_KEY = "industry-chain:user-profile";

export function getStoredUser() {
  return uni.getStorageSync(USER_KEY) || null;
}

export function getStoredToken() {
  return uni.getStorageSync(TOKEN_KEY) || "";
}

export function getStoredProfile() {
  return uni.getStorageSync(PROFILE_KEY) || null;
}

export async function fetchUserSession() {
  const token = getStoredToken();
  const payload = await request("/api/v1/auth/session", { token });
  if (!payload.authenticated) {
    clearStoredSession();
    return { authenticated: false, configured: payload.configured, user: null };
  }
  uni.setStorageSync(USER_KEY, payload.user);
  await fetchUserProfile();
  return payload;
}

export async function loginWithWechat() {
  if (!isWechatMiniProgram()) {
    throw new Error(`${getClientPlatformLabel()}登录待接入；当前版本可先浏览、搜索和阅读产业链。`);
  }
  const loginResult = await uniLogin();
  const payload = await request("/api/v1/auth/wechat-login", {
    method: "POST",
    data: { code: loginResult.code }
  });
  uni.setStorageSync(TOKEN_KEY, payload.token);
  uni.setStorageSync(USER_KEY, payload.user);
  await fetchUserProfile();
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

export async function fetchUserProfile() {
  const token = requireToken();
  const payload = await request("/api/v1/me", { token });
  uni.setStorageSync(PROFILE_KEY, payload.profile);
  return payload.profile;
}

export async function setFavoriteChain(chainId, active) {
  return updateProfile(`/api/v1/me/favorites/chains/${encodeURIComponent(chainId)}`, active ? "PUT" : "DELETE");
}

export async function setSubscribedChain(chainId, active) {
  return updateProfile(`/api/v1/me/subscriptions/chains/${encodeURIComponent(chainId)}`, active ? "PUT" : "DELETE");
}

export async function saveReadingProgress(chainId, progress) {
  const token = getStoredToken();
  if (!token) return getStoredProfile();
  const payload = await request(`/api/v1/me/reading-history/chains/${encodeURIComponent(chainId)}`, {
    method: "PUT",
    token,
    data: progress
  });
  uni.setStorageSync(PROFILE_KEY, payload.profile);
  return payload.profile;
}

async function updateProfile(path, method) {
  const payload = await request(path, { method, token: requireToken() });
  uni.setStorageSync(PROFILE_KEY, payload.profile);
  return payload.profile;
}

function clearStoredSession() {
  uni.removeStorageSync(TOKEN_KEY);
  uni.removeStorageSync(USER_KEY);
  uni.removeStorageSync(PROFILE_KEY);
}

function requireToken() {
  const token = getStoredToken();
  if (!token && !isWechatMiniProgram()) {
    throw new Error(`${getClientPlatformLabel()}登录待接入；当前版本可先浏览、搜索和阅读产业链。`);
  }
  if (!token) throw new Error("请先登录");
  return token;
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
