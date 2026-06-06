<template>
  <view class="page">
    <view v-if="loading" class="state">正在加载研究内容…</view>
    <view v-else-if="error" class="state error">{{ error }}</view>
    <template v-else>
      <view class="hero">
        <text class="eyebrow">INDUSTRY CHAIN</text>
        <text class="title">{{ chain.title }}</text>
        <text class="theme">{{ chain.theme }}</text>
        <text v-if="query" class="query">当前搜索：{{ query }}</text>
      </view>

      <view class="diagram-section">
        <text class="section-label">产业链图谱</text>
        <image
          class="diagram"
          mode="widthFix"
          :src="assetUrl(chain.diagram)"
          @click="previewDiagram"
        />
      </view>

      <view class="section">
        <text class="section-label">产业链骨架</text>
        <view v-for="section in chain.chain" :key="section.id" class="chain-section">
          <text class="section-title">{{ section.title || section.name }}</text>
          <text class="section-role">{{ section.role }}</text>
          <view
            v-for="item in section.items || section.segments"
            :key="item.name"
            class="chain-item"
          >
            <text class="item-name">{{ item.name }}</text>
            <text class="item-detail">{{ item.detail || item.logic }}</text>
            <text class="companies">{{ item.companies }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-label">核心逻辑</text>
        <view v-for="(item, index) in chain.logic" :key="item.title" class="logic">
          <text class="logic-index">{{ index + 1 }}</text>
          <view class="logic-copy">
            <text class="item-name">{{ item.title }}</text>
            <text class="item-detail">{{ item.body }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-label">{{ chain.trackingProfile.title }}</text>
        <text class="tracking-summary">{{ chain.trackingProfile.summary }}</text>
        <view
          v-for="metric in chain.trackingProfile.metrics"
          :key="metric.name"
          class="metric"
        >
          <text class="item-name">{{ metric.name }}</text>
          <text class="item-detail">{{ metric.why }}</text>
          <view class="signals">
            <text v-for="signal in metric.signals" :key="signal" class="signal">{{ signal }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-label">最新动态</text>
        <view v-for="item in chain.updates" :key="`${item.date}-${item.signal}`" class="update">
          <text class="update-meta">{{ item.date }} · {{ item.segment }} · {{ item.confidence }}</text>
          <text class="item-name">{{ item.signal }}</text>
          <text class="item-detail">{{ item.impact }}</text>
        </view>
      </view>

      <view class="section article-section">
        <text class="section-label">原文阅读</text>
        <rich-text class="article" :nodes="articleHtml" />
      </view>
    </template>
  </view>
</template>

<script>
import { assetUrl, getChain } from "../../utils/api";

export default {
  data() {
    return {
      articleHtml: "",
      chain: null,
      error: "",
      loading: true,
      query: ""
    };
  },
  onLoad(options) {
    this.query = decodeURIComponent(options.q || "");
    this.loadChain(options.id);
  },
  onShareAppMessage() {
    return {
      title: this.chain?.title || "产业链研究库",
      path: `/pages/detail/detail?id=${this.chain?.id || ""}`
    };
  },
  methods: {
    assetUrl,
    async loadChain(id) {
      try {
        const payload = await getChain(id);
        this.chain = payload.chain;
        this.articleHtml = decorateArticleHtml(payload.article.html);
        uni.setNavigationBarTitle({ title: this.chain.shortTitle || this.chain.title });
      } catch (error) {
        this.error = error.message || "内容加载失败";
      } finally {
        this.loading = false;
      }
    },
    previewDiagram() {
      const url = assetUrl(this.chain.diagram);
      uni.previewImage({ current: url, urls: [url] });
    }
  }
};

function decorateArticleHtml(html) {
  return String(html || "")
    .replace(/<h1([^>]*)>/g, '<h1$1 style="font-size:28px;line-height:1.35;color:#f8fafc;margin:28px 0 18px;">')
    .replace(/<h2([^>]*)>/g, '<h2$1 style="font-size:23px;line-height:1.45;color:#f8fafc;margin:34px 0 14px;border-top:1px solid #334155;padding-top:22px;">')
    .replace(/<h3([^>]*)>/g, '<h3$1 style="font-size:19px;line-height:1.5;color:#e2e8f0;margin:26px 0 12px;">')
    .replace(/<p([^>]*)>/g, '<p$1 style="font-size:16px;line-height:1.9;color:#cbd5e1;margin:12px 0;">')
    .replace(/<li([^>]*)>/g, '<li$1 style="font-size:16px;line-height:1.85;color:#cbd5e1;margin:7px 0;">')
    .replace(/<blockquote([^>]*)>/g, '<blockquote$1 style="font-size:16px;line-height:1.8;color:#dbeafe;border-left:3px solid #22d3ee;background:#102132;padding:14px;margin:18px 0;">')
    .replace(/<table([^>]*)>/g, '<table$1 style="width:100%;border-collapse:collapse;font-size:12px;margin:18px 0;">')
    .replace(/<th([^>]*)>/g, '<th$1 style="border:1px solid #334155;padding:8px;color:#f8fafc;background:#172033;">')
    .replace(/<td([^>]*)>/g, '<td$1 style="border:1px solid #334155;padding:8px;color:#cbd5e1;">')
    .replace(/<code([^>]*)>/g, '<code$1 style="color:#67e8f9;background:#172033;padding:2px 4px;">');
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 80rpx;
}

.state {
  color: #94a3b8;
  padding: 140rpx 32rpx;
  text-align: center;
}

.state.error {
  color: #fda4af;
}

.hero,
.section,
.diagram-section {
  padding: 38rpx 32rpx 0;
}

.hero {
  border-bottom: 1rpx solid #263244;
  padding-bottom: 38rpx;
  padding-top: 64rpx;
}

.eyebrow,
.section-label,
.update-meta {
  color: #22d3ee;
  display: block;
  font-size: 22rpx;
  font-weight: 700;
}

.title {
  color: #f8fafc;
  display: block;
  font-size: 50rpx;
  font-weight: 800;
  line-height: 1.3;
  margin-top: 14rpx;
}

.theme,
.tracking-summary {
  color: #94a3b8;
  display: block;
  font-size: 26rpx;
  line-height: 1.7;
  margin-top: 14rpx;
}

.query {
  border-left: 4rpx solid #fbbf24;
  color: #fde68a;
  display: block;
  font-size: 24rpx;
  margin-top: 24rpx;
  padding-left: 16rpx;
}

.diagram {
  border: 1rpx solid #334155;
  margin-top: 18rpx;
  width: 100%;
}

.chain-section,
.metric {
  border-top: 1rpx solid #263244;
  margin-top: 20rpx;
  padding-top: 26rpx;
}

.section-title {
  color: #f8fafc;
  display: block;
  font-size: 34rpx;
  font-weight: 750;
}

.section-role,
.item-detail {
  color: #94a3b8;
  display: block;
  font-size: 25rpx;
  line-height: 1.7;
  margin-top: 8rpx;
}

.chain-item {
  border-left: 2rpx solid #34d399;
  margin-top: 24rpx;
  padding-left: 20rpx;
}

.item-name {
  color: #f8fafc;
  display: block;
  font-size: 29rpx;
  font-weight: 700;
}

.companies {
  color: #67e8f9;
  display: block;
  font-size: 23rpx;
  line-height: 1.65;
  margin-top: 10rpx;
}

.logic {
  border-top: 1rpx solid #263244;
  display: flex;
  gap: 22rpx;
  margin-top: 20rpx;
  padding-top: 24rpx;
}

.logic-index {
  color: #fbbf24;
  font-size: 34rpx;
  font-weight: 800;
  width: 44rpx;
}

.logic-copy {
  flex: 1;
}

.signals {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 18rpx;
}

.signal {
  border: 1rpx solid #334155;
  color: #cbd5e1;
  font-size: 22rpx;
  padding: 8rpx 12rpx;
}

.update {
  border-top: 1rpx solid #263244;
  margin-top: 20rpx;
  padding-top: 24rpx;
}

.update-meta {
  margin-bottom: 10rpx;
}

.article-section {
  overflow: hidden;
}

.article {
  display: block;
  margin-top: 12rpx;
  overflow-wrap: anywhere;
}
</style>
