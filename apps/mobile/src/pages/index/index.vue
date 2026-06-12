<template>
  <view class="page">
    <view class="header">
      <text class="eyebrow">INDUSTRY CHAIN WATCH</text>
      <text class="title">产业链研究库</text>
      <text class="subtitle">用图谱理解行业结构，用动态追踪关键变化。</text>
      <view class="search">
        <input
          v-model="query"
          confirm-type="search"
          placeholder="搜索产业链、公司、环节"
          @confirm="runSearch"
        />
        <button v-if="query" class="clear" @click="clearSearch">清除</button>
      </view>
    </view>

    <view v-if="loading" class="state">正在加载产业链…</view>
    <view v-else-if="error" class="state error">
      <text>{{ error }}</text>
      <button class="retry" @click="loadChains">重新加载</button>
    </view>

    <view v-else class="content">
      <view v-if="searching || results.length" class="section">
        <view class="section-head">
          <text class="section-title">搜索结果</text>
          <text class="count">{{ results.length }} 条</text>
        </view>
        <view v-if="searching" class="state compact">正在搜索…</view>
        <view v-else-if="!results.length" class="state compact">没有找到相关内容</view>
        <view
          v-for="item in results"
          :key="`${item.chainId}-${item.type}-${item.title}`"
          class="result"
          @click="openSearchResult(item)"
        >
          <text class="result-meta">{{ item.type }} · {{ item.chainTitle }}</text>
          <text class="result-title">{{ item.title }}</text>
          <text class="result-excerpt">{{ item.excerpt }}</text>
        </view>
      </view>

      <view class="section">
        <view class="section-head">
          <text class="section-title">全部产业链</text>
          <text class="count">{{ chains.length }} 条</text>
        </view>
        <view
          v-for="chain in chains"
          :key="chain.id"
          class="chain-row"
          @click="openChain(chain.id)"
        >
          <view class="chain-copy">
            <text class="chain-title">{{ chain.title }}</text>
            <text class="chain-theme">{{ chain.theme }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getChains, searchChains } from "../../utils/api";

export default {
  data() {
    return {
      chains: [],
      error: "",
      loading: true,
      query: "",
      results: [],
      searchTimer: null,
      searching: false
    };
  },
  watch: {
    query() {
      clearTimeout(this.searchTimer);
      if (!this.query.trim()) {
        this.results = [];
        this.searching = false;
        return;
      }
      this.searchTimer = setTimeout(this.runSearch, 260);
    }
  },
  onLoad() {
    this.loadChains();
  },
  methods: {
    async loadChains() {
      this.loading = true;
      this.error = "";
      try {
        const payload = await getChains();
        this.chains = payload.chains;
      } catch (error) {
        this.error = error.message || "产业链加载失败";
      } finally {
        this.loading = false;
      }
    },
    async runSearch() {
      const query = this.query.trim();
      if (!query) return;
      this.searching = true;
      try {
        const payload = await searchChains(query);
        this.results = payload.results;
      } catch (error) {
        uni.showToast({ title: error.message || "搜索失败", icon: "none" });
      } finally {
        this.searching = false;
      }
    },
    clearSearch() {
      this.query = "";
      this.results = [];
    },
    openSearchResult(item) {
      this.openChain(item.chainId, this.query, item.title);
    },
    openChain(id, query = "", targetTitle = "") {
      const suffix = query ? `&q=${encodeURIComponent(query)}` : "";
      const target = targetTitle ? `&target=${encodeURIComponent(targetTitle)}` : "";
      uni.navigateTo({ url: `/pages/detail/detail?id=${id}${suffix}${target}` });
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
}

.header {
  border-bottom: 1rpx solid #263244;
  padding: 70rpx 32rpx 36rpx;
}

.eyebrow {
  color: #22d3ee;
  display: block;
  font-size: 22rpx;
  font-weight: 700;
}

.title {
  color: #f8fafc;
  display: block;
  font-size: 60rpx;
  font-weight: 800;
  margin-top: 16rpx;
}

.subtitle {
  color: #94a3b8;
  display: block;
  font-size: 27rpx;
  line-height: 1.7;
  margin-top: 12rpx;
}

.search {
  align-items: center;
  border: 1rpx solid #334155;
  display: flex;
  margin-top: 32rpx;
  min-height: 88rpx;
  padding: 0 18rpx 0 24rpx;
}

.search input {
  color: #f8fafc;
  flex: 1;
  font-size: 28rpx;
  min-width: 0;
}

.clear {
  background: transparent;
  color: #67e8f9;
  font-size: 24rpx;
  line-height: 1;
  margin: 0;
  padding: 20rpx;
}

.clear::after,
.retry::after {
  border: 0;
}

.content {
  padding: 0 32rpx 70rpx;
}

.section {
  padding-top: 42rpx;
}

.section-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.section-title {
  color: #f8fafc;
  font-size: 34rpx;
  font-weight: 750;
}

.count,
.result-meta {
  color: #67e8f9;
  font-size: 22rpx;
}

.chain-row,
.result {
  border-top: 1rpx solid #263244;
  padding: 26rpx 0;
}

.chain-row {
  align-items: center;
  display: flex;
}

.chain-copy {
  flex: 1;
  min-width: 0;
}

.chain-title,
.result-title {
  color: #f8fafc;
  display: block;
  font-size: 31rpx;
  font-weight: 700;
}

.chain-theme,
.result-excerpt {
  color: #94a3b8;
  display: block;
  font-size: 25rpx;
  line-height: 1.65;
  margin-top: 10rpx;
}

.arrow {
  color: #22d3ee;
  font-size: 52rpx;
  margin-left: 20rpx;
}

.result-title {
  margin-top: 10rpx;
}

.state {
  color: #94a3b8;
  padding: 100rpx 32rpx;
  text-align: center;
}

.state.compact {
  padding: 40rpx 0;
}

.state.error {
  color: #fda4af;
}

.retry {
  background: transparent;
  border: 1rpx solid #22d3ee;
  color: #67e8f9;
  font-size: 25rpx;
  margin-top: 26rpx;
  width: 220rpx;
}
</style>
