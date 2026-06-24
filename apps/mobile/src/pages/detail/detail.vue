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

      <view id="focus" class="section focus-section">
        <text class="section-label">当前重点</text>
        <view class="mobile-nav">
          <button
            v-for="section in mobileSummary.sections"
            :key="section.id"
            class="mobile-nav-item"
            @click="scrollToSection(section.id)"
          >
            <text>{{ section.title }}</text>
            <text>{{ section.count }}</text>
          </button>
        </view>
        <view v-if="mobileSummary.highlights.length" class="focus-grid">
          <view
            v-for="item in mobileSummary.highlights"
            :key="`${item.type}-${item.title}`"
            class="focus-card"
            @click="scrollToSection(item.target)"
          >
            <text class="focus-label">{{ item.label }}</text>
            <text class="focus-title">{{ item.title }}</text>
            <text class="focus-body">{{ item.body }}</text>
            <text v-if="item.date" class="focus-date">{{ item.date }}</text>
          </view>
        </view>
      </view>

      <view id="structure" class="diagram-section">
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

      <view id="logic" class="section">
        <text class="section-label">核心逻辑</text>
        <view v-for="(item, index) in chain.logic" :key="item.title" class="logic">
          <text class="logic-index">{{ index + 1 }}</text>
          <view class="logic-copy">
            <text class="item-name">{{ item.title }}</text>
            <text class="item-detail">{{ item.body }}</text>
          </view>
        </view>
      </view>

      <view id="tracking" class="section">
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

      <view id="research" class="section">
        <text class="section-label">最新研究</text>
        <view
          v-for="source in mobileSummary.latestResearch"
          :key="source.id || source.title"
          class="research"
        >
          <view class="update-meta-row">
            <text class="update-date">{{ source.date || "日期待补" }}</text>
            <text class="update-type">{{ source.platform || source.type || "资料" }}</text>
          </view>
          <text class="item-name">{{ source.title }}</text>
          <text class="item-detail">{{ source.summary || "已归档，等待进一步整理。" }}</text>
          <view v-if="source.companies && source.companies.length" class="signals">
            <text v-for="company in source.companies" :key="company" class="signal">{{ company }}</text>
          </view>
        </view>
        <view v-if="!mobileSummary.latestResearch.length" class="empty-card">
          <text>暂无独立研究资料，先阅读核心逻辑和原文。</text>
        </view>
      </view>

      <view class="section">
        <text class="section-label">最新动态</text>
        <view v-for="item in chain.updates" :key="`${item.date}-${item.signal}`" class="update">
          <view class="update-meta-row">
            <text class="update-date">{{ item.date }}</text>
            <text class="update-type">{{ item.type || "产业事件" }}</text>
            <text class="update-detail">{{ item.segment }} · {{ item.confidence }}</text>
          </view>
          <text class="item-name">{{ item.signal }}</text>
          <text class="item-detail">{{ item.impact }}</text>
        </view>
      </view>

      <view id="stocks" class="section">
        <text class="section-label">个股集中营</text>
        <view class="stock-summary">
          <view>
            <text class="stock-number">{{ mobileSummary.stocks.total }}</text>
            <text class="stock-label">相关公司</text>
          </view>
          <view>
            <text class="stock-number">{{ mobileSummary.stocks.mapped }}</text>
            <text class="stock-label">已有行情入口</text>
          </view>
        </view>
        <view class="signals">
          <text
            v-for="company in mobileSummary.stocks.examples"
            :key="company.name"
            class="signal"
          >
            {{ company.name }}{{ company.mapped ? " · 已补代码" : "" }}
          </text>
        </view>
      </view>

      <view id="article" class="section article-section">
        <view id="article-reader" class="reader-head">
          <view>
            <text class="section-label">原文阅读</text>
            <text v-if="currentHeading" class="current-heading">{{ currentHeading }}</text>
            <text v-else class="current-heading">完整原文按需加载，适合深度阅读和搜索定位。</text>
          </view>
          <button class="toc-open" @click="openToc">{{ articleLoaded ? "目录" : "加载原文" }}</button>
        </view>
        <view v-if="!articleLoaded" class="article-load-card">
          <text class="item-name">先看摘要，深读时再打开全文</text>
          <text class="item-detail">这样小程序和 App 首屏更快；需要查原文、目录或搜索定位时再加载完整 HTML。</text>
          <button class="article-load-button" :disabled="articleLoading" @click="loadArticle(true)">
            {{ articleLoading ? "正在加载…" : "加载完整原文" }}
          </button>
          <text v-if="articleError" class="article-load-error">{{ articleError }}</text>
        </view>
        <view
          v-for="(block, index) in articleBlocks"
          :id="block.anchorId"
          :key="block.anchorId"
          class="article-block"
          :class="{ 'search-hit': index === searchTargetIndex }"
        >
          <rich-text class="article" :nodes="block.html" />
        </view>
      </view>

      <button v-if="articleLoaded" class="reader-fab" @click="openToc">目录</button>

      <view v-if="tocVisible" class="toc-layer" @click="closeToc">
        <view class="toc-sheet" @click.stop>
          <view class="toc-head">
            <view>
              <text class="toc-title">文章目录</text>
              <text class="toc-progress">{{ readingProgress }}% 已读</text>
            </view>
            <button class="toc-close" @click="closeToc">关闭</button>
          </view>
          <scroll-view class="toc-list" scroll-y :scroll-into-view="activeTocAnchor">
            <button
              v-for="item in readerToc"
              :id="`toc-${item.anchorId}`"
              :key="item.anchorId"
              class="toc-item"
              :class="[`level-${item.level}`, { active: item.blockIndex === activeBlockIndex }]"
              @click="jumpToBlock(item.blockIndex)"
            >
              {{ item.title }}
            </button>
          </scroll-view>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import { assetUrl, getChain, getChainArticle } from "../../utils/api";
import { buildArticleBlocks, buildReaderToc, findArticleTarget } from "../../utils/article.mjs";

export default {
  data() {
    return {
      activeBlockIndex: 0,
      articleBlocks: [],
      articleError: "",
      articleLoaded: false,
      articleLoading: false,
      blockOffsets: [],
      chain: null,
      error: "",
      lastScrollTop: 0,
      loading: true,
      query: "",
      readerEnd: 0,
      readingProgress: 0,
      restoreTimer: null,
      saveTimer: null,
      searchTargetIndex: -1,
      targetTitle: "",
      tocVisible: false,
      viewportHeight: 0
    };
  },
  onLoad(options) {
    this.query = decodeURIComponent(options.q || "");
    this.targetTitle = decodeURIComponent(options.target || "");
    this.viewportHeight = uni.getSystemInfoSync().windowHeight || 0;
    this.loadChain(options.id);
  },
  onPageScroll(event) {
    if (!this.articleBlocks.length) return;
    this.updateReadingPosition(event.scrollTop);
  },
  onHide() {
    this.saveReadingPosition();
  },
  onUnload() {
    clearTimeout(this.restoreTimer);
    clearTimeout(this.saveTimer);
    this.saveReadingPosition();
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
        uni.setNavigationBarTitle({ title: this.chain.shortTitle || this.chain.title });
        if (this.query || this.targetTitle) await this.loadArticle(false);
      } catch (error) {
        this.error = error.message || "内容加载失败";
      } finally {
        this.loading = false;
      }
    },
    previewDiagram() {
      const url = assetUrl(this.chain.diagram);
      uni.previewImage({ current: url, urls: [url] });
    },
    async loadArticle(scrollAfterLoad = false) {
      if (this.articleLoaded || this.articleLoading || !this.chain?.id) {
        if (scrollAfterLoad && this.articleLoaded) this.scrollToSection("article");
        return;
      }
      this.articleLoading = true;
      this.articleError = "";
      try {
        const payload = await getChainArticle(this.chain.id);
        this.chain = payload.chain;
        this.articleBlocks = buildArticleBlocks(payload.article.html, payload.article.toc).map((block) => ({
          ...block,
          html: decorateArticleHtml(block.html)
        }));
        this.searchTargetIndex = findArticleTarget(
          this.articleBlocks,
          this.query,
          this.targetTitle
        );
        this.articleLoaded = true;
        this.$nextTick(() => {
          this.restoreTimer = setTimeout(
            () => this.measureBlocks(() => {
              if (this.query || this.targetTitle) this.restoreReadingPosition();
              else if (scrollAfterLoad) this.scrollToSection("article");
            }),
            160
          );
        });
      } catch (error) {
        this.articleError = error.message || "原文加载失败";
        if (!scrollAfterLoad) throw error;
      } finally {
        this.articleLoading = false;
      }
    },
    async openToc() {
      if (!this.articleLoaded) {
        await this.loadArticle(true);
        if (!this.articleLoaded) return;
      }
      this.tocVisible = true;
    },
    closeToc() {
      this.tocVisible = false;
    },
    async scrollToSection(id) {
      if (id === "article" && !this.articleLoaded) {
        await this.loadArticle(true);
        return;
      }
      const selector = id === "article" ? "#article-reader" : `#${id}`;
      uni.pageScrollTo({ selector, duration: 260 });
    },
    jumpToBlock(index, highlight = false) {
      const block = this.articleBlocks[index];
      if (!block) return;
      this.tocVisible = false;
      if (highlight) this.searchTargetIndex = index;
      uni.pageScrollTo({
        selector: `#${block.anchorId}`,
        duration: 280,
        success: () => {
          this.activeBlockIndex = index;
          this.saveReadingPosition(this.blockOffsets[index]);
        }
      });
    },
    measureBlocks(done) {
      uni.createSelectorQuery()
        .in(this)
        .selectAll(".article-block")
        .boundingClientRect((rects) => {
          const currentScroll = this.lastScrollTop || 0;
          this.blockOffsets = (rects || []).map((rect) => rect.top + currentScroll);
          const lastRect = rects?.[rects.length - 1];
          this.readerEnd = lastRect ? lastRect.bottom + currentScroll : 0;
          if (typeof done === "function") done();
        })
        .exec();
    },
    restoreReadingPosition() {
      if (this.searchTargetIndex >= 0) {
        this.jumpToBlock(this.searchTargetIndex, true);
        return;
      }
      const saved = uni.getStorageSync(this.storageKey);
      const savedIndex = this.articleBlocks.findIndex(
        (block) => block.headingId && block.headingId === saved?.headingId
      );
      if (savedIndex >= 0 && savedIndex !== Number(saved?.blockIndex || 0)) {
        this.jumpToBlock(savedIndex);
        return;
      }
      const scrollTop = Number(saved?.scrollTop || 0);
      if (scrollTop > 0) {
        uni.pageScrollTo({ scrollTop, duration: 0 });
        this.activeBlockIndex = Number(saved.blockIndex || 0);
      }
    },
    updateReadingPosition(scrollTop) {
      this.lastScrollTop = scrollTop;
      if (!this.blockOffsets.length) return;
      const marker = scrollTop + 120;
      let nextIndex = 0;
      this.blockOffsets.forEach((offset, index) => {
        if (offset <= marker) nextIndex = index;
      });
      this.activeBlockIndex = nextIndex;
      const first = this.blockOffsets[0] || 0;
      const last = Math.max(this.readerEnd - this.viewportHeight, first + 1);
      this.readingProgress = Math.max(
        0,
        Math.min(100, Math.round(((scrollTop - first) / Math.max(last - first, 1)) * 100))
      );
      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => this.saveReadingPosition(scrollTop), 350);
    },
    saveReadingPosition(scrollTop = this.lastScrollTop || 0) {
      if (!this.chain?.id || !this.articleLoaded || scrollTop <= 0) return;
      uni.setStorageSync(this.storageKey, {
        blockIndex: this.activeBlockIndex,
        headingId: this.articleBlocks[this.activeBlockIndex]?.headingId || "",
        scrollTop,
        updatedAt: Date.now()
      });
    }
  },
  computed: {
    activeTocAnchor() {
      const active = this.readerToc.find((item) => item.blockIndex === this.activeBlockIndex);
      return active ? `toc-${active.anchorId}` : "";
    },
    currentHeading() {
      return this.articleBlocks[this.activeBlockIndex]?.title || "";
    },
    readerToc() {
      return buildReaderToc(this.articleBlocks);
    },
    mobileSummary() {
      const fallbackSections = [
        { id: "focus", title: "当前重点", count: 0 },
        { id: "research", title: "最新研究", count: this.chain?.sources?.length || 0 },
        { id: "logic", title: "核心逻辑", count: this.chain?.logic?.length || 0 },
        { id: "structure", title: "产业结构", count: this.chain?.chain?.length || 0 },
        { id: "tracking", title: "跟踪验证", count: this.chain?.trackingProfile?.metrics?.length || 0 },
        { id: "stocks", title: "个股集中营", count: 0 },
        { id: "article", title: "原文阅读", count: 1 }
      ];
      return {
        sections: fallbackSections,
        highlights: [],
        latestResearch: [],
        stocks: { total: 0, mapped: 0, examples: [] },
        ...(this.chain?.mobileSummary || {})
      };
    },
    storageKey() {
      return `reader-progress:${this.chain?.id || "unknown"}`;
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

.focus-section {
  border-bottom: 1rpx solid #263244;
  padding-bottom: 10rpx;
}

.mobile-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 18rpx;
}

.mobile-nav-item {
  align-items: center;
  background: #101827;
  border: 1rpx solid #263244;
  color: #cbd5e1;
  display: flex;
  font-size: 23rpx;
  gap: 10rpx;
  line-height: 1;
  margin: 0;
  padding: 16rpx 18rpx;
}

.mobile-nav-item::after {
  border: 0;
}

.mobile-nav-item text:last-child {
  color: #67e8f9;
  font-weight: 800;
}

.focus-grid {
  display: grid;
  gap: 16rpx;
  margin-top: 22rpx;
}

.focus-card,
.research,
.empty-card {
  background: linear-gradient(180deg, rgba(34, 211, 238, 0.08), rgba(15, 23, 42, 0.2));
  border: 1rpx solid #263244;
  padding: 22rpx;
}

.focus-label {
  color: #34d399;
  display: block;
  font-size: 21rpx;
  font-weight: 800;
}

.focus-title {
  color: #f8fafc;
  display: block;
  font-size: 30rpx;
  font-weight: 750;
  line-height: 1.45;
  margin-top: 10rpx;
}

.focus-body {
  color: #94a3b8;
  display: block;
  font-size: 25rpx;
  line-height: 1.7;
  margin-top: 8rpx;
}

.focus-date {
  color: #67e8f9;
  display: block;
  font-size: 22rpx;
  margin-top: 12rpx;
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

.research {
  margin-top: 18rpx;
}

.empty-card {
  color: #94a3b8;
  font-size: 25rpx;
  line-height: 1.7;
  margin-top: 18rpx;
}

.stock-summary {
  display: grid;
  gap: 14rpx;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 18rpx;
}

.stock-summary > view {
  border: 1rpx solid #263244;
  padding: 22rpx;
}

.stock-number {
  color: #f8fafc;
  display: block;
  font-size: 42rpx;
  font-weight: 850;
}

.stock-label {
  color: #94a3b8;
  display: block;
  font-size: 23rpx;
  margin-top: 6rpx;
}

.update-meta {
  margin-bottom: 10rpx;
}

.update-meta-row {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 10rpx;
}

.update-date,
.update-detail {
  color: #94a3b8;
  font-size: 22rpx;
}

.update-type {
  background: rgba(34, 211, 238, 0.1);
  border: 1rpx solid rgba(34, 211, 238, 0.35);
  color: #a5f3fc;
  font-size: 21rpx;
  font-weight: 700;
  padding: 5rpx 10rpx;
}

.article-section {
  overflow: hidden;
}

.article-load-card {
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.08), rgba(15, 23, 42, 0.18));
  border: 1rpx solid #334155;
  margin-top: 22rpx;
  padding: 24rpx;
}

.article-load-button {
  background: #0e7490;
  color: #ecfeff;
  font-size: 25rpx;
  font-weight: 750;
  line-height: 1;
  margin: 22rpx 0 0;
  padding: 22rpx 26rpx;
}

.article-load-button::after {
  border: 0;
}

.article-load-button[disabled] {
  opacity: 0.72;
}

.article-load-error {
  color: #fda4af;
  display: block;
  font-size: 23rpx;
  line-height: 1.5;
  margin-top: 14rpx;
}

.reader-head,
.toc-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.current-heading {
  color: #94a3b8;
  display: block;
  font-size: 23rpx;
  line-height: 1.5;
  margin-top: 8rpx;
  max-width: 520rpx;
}

.toc-open,
.toc-close {
  background: transparent;
  border: 1rpx solid #334155;
  color: #67e8f9;
  font-size: 23rpx;
  line-height: 1;
  margin: 0;
  padding: 18rpx 22rpx;
}

.toc-open::after,
.toc-close::after,
.toc-item::after,
.reader-fab::after {
  border: 0;
}

.article-block {
  border-left: 4rpx solid transparent;
  padding-left: 14rpx;
  transition: background-color 180ms ease;
}

.article-block.search-hit {
  background: #2b2413;
  border-left-color: #fbbf24;
  margin-top: 18rpx;
  padding-bottom: 12rpx;
  padding-right: 12rpx;
}

.article {
  display: block;
  margin-top: 12rpx;
  overflow-wrap: anywhere;
}

.reader-fab {
  background: #0e7490;
  bottom: 38rpx;
  box-shadow: 0 10rpx 28rpx rgba(0, 0, 0, 0.38);
  color: #ecfeff;
  font-size: 24rpx;
  line-height: 1;
  margin: 0;
  padding: 22rpx 24rpx;
  position: fixed;
  right: 28rpx;
  z-index: 20;
}

.toc-layer {
  background: rgba(2, 6, 23, 0.7);
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 40;
}

.toc-sheet {
  background: #111827;
  border-top: 1rpx solid #334155;
  bottom: 0;
  left: 0;
  max-height: 78vh;
  padding: 30rpx 28rpx calc(24rpx + env(safe-area-inset-bottom));
  position: absolute;
  right: 0;
}

.toc-title {
  color: #f8fafc;
  display: block;
  font-size: 34rpx;
  font-weight: 750;
}

.toc-progress {
  color: #34d399;
  display: block;
  font-size: 22rpx;
  margin-top: 6rpx;
}

.toc-list {
  height: 62vh;
  margin-top: 22rpx;
}

.toc-item {
  background: transparent;
  border-left: 3rpx solid #334155;
  color: #94a3b8;
  display: block;
  font-size: 25rpx;
  line-height: 1.5;
  margin: 0;
  padding: 18rpx 18rpx;
  text-align: left;
  width: 100%;
}

.toc-item.level-2 {
  padding-left: 28rpx;
}

.toc-item.level-3 {
  font-size: 23rpx;
  padding-left: 48rpx;
}

.toc-item.active {
  background: #102132;
  border-left-color: #22d3ee;
  color: #f8fafc;
}
</style>
