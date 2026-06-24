export function getClientPlatform() {
  // #ifdef MP-WEIXIN
  return "mp-weixin";
  // #endif

  // #ifdef APP-PLUS
  return "app";
  // #endif

  // #ifdef H5
  return "h5";
  // #endif

  return "unknown";
}

export function getClientPlatformLabel() {
  return {
    "mp-weixin": "微信小程序",
    app: "App",
    h5: "网页预览",
    unknown: "当前客户端"
  }[getClientPlatform()];
}

export function getLoginProviderLabel() {
  return {
    "mp-weixin": "微信登录",
    app: "账号登录",
    h5: "账号登录",
    unknown: "登录"
  }[getClientPlatform()];
}

export function isWechatMiniProgram() {
  return getClientPlatform() === "mp-weixin";
}

export function isNativeApp() {
  return getClientPlatform() === "app";
}
