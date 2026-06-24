export const LEGAL_LINKS = {
  privacy: String(import.meta.env.VITE_PRIVACY_POLICY_URL || "").trim(),
  support: String(import.meta.env.VITE_SUPPORT_URL || "").trim(),
  terms: String(import.meta.env.VITE_TERMS_OF_SERVICE_URL || "").trim()
};

export const SUPPORT_EMAIL = String(import.meta.env.VITE_SUPPORT_EMAIL || "").trim();

const documents = {
  about: {
    title: "关于产业链研究库",
    eyebrow: "ABOUT",
    summary: "产业链研究库用于沉淀产业链结构、研究资料、逻辑卡片、跟踪验证和市场验证入口。",
    sections: [
      {
        title: "我们解决什么问题",
        body: "把分散的行业文章、公告、视频和自有研究整理成可复用的产业链知识库，让用户快速理解一条产业链正在发生什么、核心逻辑是什么、后续该跟踪什么。"
      },
      {
        title: "当前版本能力",
        body: "支持产业链列表、搜索、详情页、图谱预览、核心逻辑、最新研究、跟踪验证、原文阅读，以及个股 K 线外链验证。"
      },
      {
        title: "重要提示",
        body: "本产品展示的是研究资料和产业逻辑，不构成投资建议。股价走势入口仅用于观察市场是否交易相关逻辑。"
      }
    ]
  },
  privacy: {
    title: "隐私政策",
    eyebrow: "PRIVACY",
    summary: "正式隐私政策 URL 补齐前，App 内先展示首版数据使用说明，便于测试和审核准备。",
    externalUrl: LEGAL_LINKS.privacy,
    sections: [
      {
        title: "首版数据范围",
        body: "未登录浏览时，应用只请求公开产业链内容、搜索结果、图谱和原文资源。当前不会读取通讯录、相册、定位、相机或手机状态。"
      },
      {
        title: "登录与个人数据",
        body: "微信小程序登录后可同步收藏、订阅和阅读历史。iOS/Android 首版阅读版暂未接入账号登录；接入后会继续复用服务端个人资料接口。"
      },
      {
        title: "网络与存储",
        body: "应用通过 HTTPS 访问内容 API 和静态资源。阅读进度等本地状态可能保存在设备本地，用于改善继续阅读体验。"
      },
      {
        title: "正式政策",
        body: "上线前需要替换为正式隐私政策 URL，并确保应用市场隐私问卷与实际行为一致。"
      }
    ]
  },
  terms: {
    title: "用户协议",
    eyebrow: "TERMS",
    summary: "正式用户协议 URL 补齐前，App 内先展示首版使用边界说明。",
    externalUrl: LEGAL_LINKS.terms,
    sections: [
      {
        title: "内容用途",
        body: "产业链研究库提供行业研究资料整理、逻辑跟踪和阅读辅助能力。所有内容仅用于信息参考和研究交流。"
      },
      {
        title: "非投资建议",
        body: "产品中的产业逻辑、公司信息、K 线外链和跟踪验证不构成证券投资建议，也不承诺任何收益。用户应自行判断风险。"
      },
      {
        title: "资料来源",
        body: "资料可能来自自有研究、公开文章、公告、视频转写和其他公开来源。若发现内容错误或权利问题，应及时联系维护者修正。"
      },
      {
        title: "正式协议",
        body: "上线前需要替换为正式用户协议 URL，并根据 App Store、安卓应用市场和小程序审核要求完善。"
      }
    ]
  },
  support: {
    title: "帮助与反馈",
    eyebrow: "SUPPORT",
    summary: "如果你在使用产业链研究库时遇到问题，可以通过这里查看常见说明，或复制联系方式反馈。",
    externalUrl: LEGAL_LINKS.support,
    contactEmail: SUPPORT_EMAIL,
    sections: [
      {
        title: "内容没有加载出来",
        body: "请先确认网络连接是否正常。应用通过 HTTPS 访问内容 API 和静态资源；弱网或服务器维护时，首页、图谱和原文可能需要稍后重试。"
      },
      {
        title: "搜索不到想看的产业链",
        body: "首版搜索覆盖已建档产业链、公司、环节、核心逻辑和部分原文内容。如果没有结果，说明该产业链可能还没有入库。"
      },
      {
        title: "K 线入口的作用",
        body: "个股 K 线入口用于观察市场是否交易相关产业逻辑，不代表产业逻辑已经得到验证，也不构成投资建议。"
      },
      {
        title: "反馈时建议提供",
        body: "请尽量提供手机型号、系统版本、问题页面、操作步骤和截图。这样更容易复现和修复问题。"
      }
    ]
  }
};

export function getLegalDocument(type = "about") {
  return documents[type] || documents.about;
}
