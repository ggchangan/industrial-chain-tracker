<template>
  <view class="page">
    <view class="hero">
      <text class="eyebrow">{{ document.eyebrow }}</text>
      <text class="title">{{ document.title }}</text>
      <text class="summary">{{ document.summary }}</text>
    </view>

    <view v-if="document.externalUrl" class="external-card">
      <text class="external-title">正式链接</text>
      <text class="external-url">{{ document.externalUrl }}</text>
      <button class="external-button" @click="openExternal">打开正式页面</button>
    </view>

    <view v-if="document.contactEmail" class="external-card">
      <text class="external-title">反馈邮箱</text>
      <text class="external-url">{{ document.contactEmail }}</text>
      <button class="external-button" @click="copyEmail">复制邮箱</button>
    </view>

    <view class="content">
      <view
        v-for="section in document.sections"
        :key="section.title"
        class="legal-section"
      >
        <text class="section-title">{{ section.title }}</text>
        <text class="section-body">{{ section.body }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getLegalDocument } from "../../utils/legal";

export default {
  data() {
    return {
      type: "about"
    };
  },
  onLoad(options) {
    this.type = options.type || "about";
    uni.setNavigationBarTitle({ title: this.document.title });
  },
  methods: {
    openExternal() {
      const url = this.document.externalUrl;
      if (!url) return;

      // #ifdef APP-PLUS
      plus.runtime.openURL(url);
      // #endif

      // #ifndef APP-PLUS
      uni.setClipboardData({
        data: url,
        success: () => uni.showToast({ title: "链接已复制", icon: "none" })
      });
      // #endif
    },
    copyEmail() {
      const email = this.document.contactEmail;
      if (!email) return;
      uni.setClipboardData({
        data: email,
        success: () => uni.showToast({ title: "邮箱已复制", icon: "none" })
      });
    }
  },
  computed: {
    document() {
      return getLegalDocument(this.type);
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 70rpx;
}

.hero {
  border-bottom: 1rpx solid #263244;
  padding: 70rpx 32rpx 36rpx;
}

.eyebrow {
  color: #22d3ee;
  display: block;
  font-size: 22rpx;
  font-weight: 800;
}

.title {
  color: #f8fafc;
  display: block;
  font-size: 48rpx;
  font-weight: 850;
  margin-top: 16rpx;
}

.summary {
  color: #94a3b8;
  display: block;
  font-size: 27rpx;
  line-height: 1.7;
  margin-top: 16rpx;
}

.content {
  display: grid;
  gap: 22rpx;
  padding: 32rpx;
}

.legal-section,
.external-card {
  border: 1rpx solid #263244;
  padding: 26rpx;
}

.section-title,
.external-title {
  color: #f8fafc;
  display: block;
  font-size: 31rpx;
  font-weight: 780;
}

.section-body,
.external-url {
  color: #94a3b8;
  display: block;
  font-size: 26rpx;
  line-height: 1.75;
  margin-top: 12rpx;
}

.external-card {
  margin: 32rpx 32rpx 0;
}

.external-url {
  color: #67e8f9;
  word-break: break-all;
}

.external-button {
  background: #0e7490;
  color: #ecfeff;
  font-size: 25rpx;
  font-weight: 760;
  margin: 22rpx 0 0;
}

.external-button::after {
  border: 0;
}
</style>
