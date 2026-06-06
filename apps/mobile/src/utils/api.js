const API_BASE = String(import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");

export function getChains() {
  return request("/api/v1/chains");
}

export function getChain(id) {
  return request(`/api/v1/chains/${encodeURIComponent(id)}?article=html`);
}

export function searchChains(query) {
  return request(`/api/v1/search?q=${encodeURIComponent(query)}&limit=30`);
}

export function assetUrl(relativePath) {
  const path = String(relativePath || "").replace(/^\.\//, "");
  return `${API_BASE}/${path}`;
}

function request(path) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${path}`,
      method: "GET",
      header: { Accept: "application/json" },
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data);
          return;
        }
        reject(new Error(response.data?.message || `请求失败（${response.statusCode}）`));
      },
      fail(error) {
        reject(new Error(error.errMsg || "无法连接内容服务"));
      }
    });
  });
}
