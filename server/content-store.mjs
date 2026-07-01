import { readFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { inspectResearchPackage } from "./research-package.mjs";

export async function createContentStore({ baseLibrary, dataDir, rootDir, stateStore, objectStorage }) {
  const resolvedDataDir = path.resolve(dataDir);
  const resolvedRootDir = path.resolve(rootDir);
  await stateStore.initialize();
  await objectStorage.initialize();

  let state = await stateStore.load();
  if (migrateDeprecatedChains(baseLibrary, state)) {
    await stateStore.save(state);
  }
  let library = mergeLibrary(baseLibrary, state);

  async function createChain(input) {
    const article = normalizeArticleInput(input);
    const id = normalizeId(input.id || article.title);
    if (!id) throw validationError("请输入有效的英文产业链 ID");
    if (library.chains.some((chain) => chain.id === id)) {
      throw validationError(`产业链 ID 已存在：${id}`);
    }

    const generated = normalizeChainDraft(input.structure || buildChainDraft({
      ...input,
      id,
      markdown: article.markdown,
      articleTitle: article.title
    }), { ...input, id, articleTitle: article.title });
    const cover = normalizeAsset(input.cover, "封面");
    const diagram = normalizeAsset(input.diagram, "产业链图谱");
    const articleRelativePath = path.join("raw", `${id}-industry-chain-original.md`);
    const diagramRelativePath = path.join("uploads", `${id}-industry-chain-map${diagram.extension}`);
    const coverRelativePath = path.join("uploads", `${id}-industry-chain-cover${cover.extension}`);

    await Promise.all([
      writeManagedFile(objectStorage, articleRelativePath, article.markdown),
      writeManagedBinary(objectStorage, diagramRelativePath, diagram.contents),
      writeManagedBinary(objectStorage, coverRelativePath, cover.contents)
    ]);

    const chain = {
      ...generated,
      article: objectStorage.urlFor(articleRelativePath),
      cover: objectStorage.urlFor(coverRelativePath),
      diagram: objectStorage.urlFor(diagramRelativePath),
      diagramSvg: objectStorage.urlFor(diagramRelativePath),
      updateFile: "",
      watchlist: [],
      updates: []
    };

    state.managedChains.push(chain);
    await stateStore.save(state);
    library = mergeLibrary(baseLibrary, state);
    return structuredClone(library.chains.find((item) => item.id === id));
  }

  async function addUpdate(chainId, input) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");

    const update = normalizeUpdate(input);
    state.updatesByChain[chainId] ||= [];
    state.updatesByChain[chainId].unshift(update);
    await stateStore.save(state);
    library = mergeLibrary(baseLibrary, state);
    return structuredClone(update);
  }

  function getUserProfile(user) {
    const profile = ensureUserProfile(user);
    return publicUserProfile(profile);
  }

  function listUsers() {
    state.usersById ||= {};
    return Object.values(state.usersById)
      .map(publicAdminUserProfile)
      .sort((left, right) =>
        String(right.lastSeenAt || right.createdAt || "").localeCompare(String(left.lastSeenAt || left.createdAt || ""))
      );
  }

  async function updateUserMembership(userId, input) {
    state.usersById ||= {};
    const current = state.usersById[userId];
    if (!current) throw notFoundError("用户不存在");
    state.usersById[userId] = normalizeUserProfile({
      ...current,
      membership: normalizeMembership(input),
      updatedAt: new Date().toISOString()
    });
    await stateStore.save(state);
    return publicAdminUserProfile(state.usersById[userId]);
  }

  async function setFavoriteChain(user, chainId, active) {
    assertKnownChain(chainId);
    const profile = ensureUserProfile(user);
    toggleListItem(profile.favorites.chains, chainId, active);
    profile.updatedAt = new Date().toISOString();
    await stateStore.save(state);
    return publicUserProfile(profile);
  }

  async function setSubscribedChain(user, chainId, active) {
    assertKnownChain(chainId);
    const profile = ensureUserProfile(user);
    toggleListItem(profile.subscriptions.chains, chainId, active);
    profile.updatedAt = new Date().toISOString();
    await stateStore.save(state);
    return publicUserProfile(profile);
  }

  async function saveReadingProgress(user, chainId, input) {
    const chain = assertKnownChain(chainId);
    const profile = ensureUserProfile(user);
    const record = {
      chainId,
      chainTitle: chain.title,
      headingId: String(input.headingId || "").trim(),
      headingTitle: String(input.headingTitle || "").trim(),
      blockIndex: Math.max(0, Number.parseInt(input.blockIndex || 0, 10) || 0),
      scrollTop: Math.max(0, Number.parseInt(input.scrollTop || 0, 10) || 0),
      progress: Math.max(0, Math.min(100, Number.parseInt(input.progress || 0, 10) || 0)),
      updatedAt: new Date().toISOString()
    };
    profile.readingHistory = [
      record,
      ...profile.readingHistory.filter((item) => item.chainId !== chainId)
    ].slice(0, 50);
    profile.updatedAt = record.updatedAt;
    await stateStore.save(state);
    return publicUserProfile(profile);
  }

  function assertKnownChain(chainId) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");
    return chain;
  }

  function ensureUserProfile(user) {
    const userId = String(user?.id || "").trim();
    if (!userId) throw validationError("用户登录态无效");
    state.usersById ||= {};
    state.usersById[userId] = normalizeUserProfile({
      ...state.usersById[userId],
      id: userId,
      provider: user.provider || state.usersById[userId]?.provider || "wechat-miniapp",
      openid: user.openid || state.usersById[userId]?.openid || "",
      unionid: user.unionid || state.usersById[userId]?.unionid || "",
      createdAt: state.usersById[userId]?.createdAt || new Date().toISOString(),
      lastSeenAt: new Date().toISOString()
    });
    return state.usersById[userId];
  }

  async function updateUpdate(chainId, updateId, input) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");
    const current = (chain.updates || []).find((item) => item.id === updateId);
    if (!current) throw notFoundError("动态追踪不存在");

    const update = normalizeUpdate({ ...input, id: updateId });
    state.updatesByChain[chainId] ||= [];
    const index = state.updatesByChain[chainId].findIndex((item) => item.id === updateId);
    if (index >= 0) state.updatesByChain[chainId][index] = update;
    else state.updatesByChain[chainId].unshift(update);
    await stateStore.save(state);
    library = mergeLibrary(baseLibrary, state);
    return structuredClone(update);
  }

  async function addSource(chainId, input) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");

    const source = normalizeSource(input);
    if (source.markdown) {
      const sourceRelativePath = path.join("sources", chainId, `${source.id}.md`);
      await writeManagedFile(objectStorage, sourceRelativePath, source.markdown);
      source.markdownUrl = objectStorage.urlFor(sourceRelativePath);
      delete source.markdown;
    }
    source.illustrations = await persistSourceIllustrations(objectStorage, chainId, source.id, source.illustrations);

    state.sourcesByChain ||= {};
    state.sourcesByChain[chainId] ||= [];
    state.sourcesByChain[chainId].unshift(source);
    await stateStore.save(state);
    library = mergeLibrary(baseLibrary, state);
    return structuredClone(source);
  }

  async function getEditableSource(chainId, sourceId) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");
    const source = (chain.sources || []).find((item) => item.id === sourceId);
    if (!source) throw notFoundError("资料不存在");
    const markdown = source.markdownUrl
      ? await readContentFile(resolvedRootDir, objectStorage, source.markdownUrl)
      : "";
    return { source: structuredClone(source), markdown };
  }

  async function updateSource(chainId, sourceId, input) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");
    const current = (chain.sources || []).find((item) => item.id === sourceId);
    if (!current) throw notFoundError("资料不存在");

    const source = normalizeSource({
      ...current,
      ...input,
      id: sourceId,
      createdAt: current.createdAt
    });
    if (source.markdown) {
      const sourceRelativePath = path.join("sources", chainId, `${source.id}.md`);
      await writeManagedFile(objectStorage, sourceRelativePath, source.markdown);
      source.markdownUrl = objectStorage.urlFor(sourceRelativePath);
      delete source.markdown;
    } else {
      source.markdownUrl = current.markdownUrl || "";
    }
    source.illustrations = await persistSourceIllustrations(
      objectStorage,
      chainId,
      source.id,
      source.illustrations
    );
    delete source.derivedFromUpdate;

    state.sourcesByChain ||= {};
    state.sourcesByChain[chainId] ||= [];
    const index = state.sourcesByChain[chainId].findIndex((item) => item.id === sourceId);
    if (index >= 0) state.sourcesByChain[chainId][index] = source;
    else state.sourcesByChain[chainId].unshift(source);
    await stateStore.save(state);
    library = mergeLibrary(baseLibrary, state);
    return structuredClone(source);
  }

  async function inspectPackage(chainId, input) {
    if (!library.chains.some((item) => item.id === chainId)) throw notFoundError("产业链不存在");
    return publicInspection(inspectResearchPackage({ ...input, chainId }));
  }

  async function importPackage(chainId, input) {
    if (!library.chains.some((item) => item.id === chainId)) throw notFoundError("产业链不存在");
    const inspection = inspectResearchPackage({ ...input, chainId });
    if (!inspection.valid) {
      const error = validationError("资料包检测未通过，不能入库");
      error.details = publicInspection(inspection);
      throw error;
    }
    state.researchPackagesByChain ||= {};
    state.researchPackagesByChain[chainId] ||= [];
    if (state.researchPackagesByChain[chainId].some((item) => item.fileHash === inspection.preview.fileHash)) {
      throw validationError("相同内容的资料包已经入库");
    }
    const root = path.join(
      "research-packages",
      chainId,
      inspection.preview.topicId,
      inspection.preview.packageId
    );
    const uploadedKeys = [];
    try {
      for (const file of inspection.files) {
        const objectKey = path.join(root, file.path);
        await writeManagedBinary(objectStorage, objectKey, file.contents);
        uploadedKeys.push(objectKey);
      }
    } catch (cause) {
      await Promise.allSettled(uploadedKeys.map((key) => objectStorage.deleteObject(key)));
      const error = new Error(storageErrorMessage(cause));
      error.statusCode = cause.statusCode || 502;
      error.code = "object_storage_write_failed";
      throw error;
    }
    const record = {
      ...inspection.preview,
      status: "imported",
      articleUrl: objectStorage.urlFor(path.join(root, "article.html")),
      sourceUrl: objectStorage.urlFor(path.join(root, "source-article.md")),
      logicUrl: objectStorage.urlFor(path.join(root, "logic.json")),
      logic: inspection.logic
    };
    state.researchPackagesByChain[chainId].unshift(record);
    try {
      await stateStore.save(state);
    } catch (cause) {
      state.researchPackagesByChain[chainId] = state.researchPackagesByChain[chainId]
        .filter((item) => item.packageId !== record.packageId);
      await Promise.allSettled(uploadedKeys.map((key) => objectStorage.deleteObject(key)));
      throw cause;
    }
    library = mergeLibrary(baseLibrary, state);
    return structuredClone(record);
  }

  async function addMonitorVerification(chainId, input) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");
    const monitor = (chain.trackingProfile?.metrics || [])
      .find((item) => item.id === input.monitorId && item.topicTitle);
    if (!monitor) throw notFoundError("研究监控项不存在");
    const verification = normalizeMonitorVerification(input, monitor);
    state.monitorVerificationsByChain ||= {};
    state.monitorVerificationsByChain[chainId] ||= [];
    state.monitorVerificationsByChain[chainId].unshift(verification);
    await stateStore.save(state);
    library = mergeLibrary(baseLibrary, state);
    return structuredClone(verification);
  }

  async function addFeedback(input) {
    const feedback = normalizeFeedback(input, library);
    state.feedbackItems ||= [];
    state.feedbackItems.unshift(feedback);
    await stateStore.save(state);
    return structuredClone(feedback);
  }

  function listFeedback() {
    return structuredClone([...(state.feedbackItems || [])].sort((left, right) =>
      String(right.createdAt || "").localeCompare(String(left.createdAt || ""))
    ));
  }

  async function updateFeedback(feedbackId, input) {
    state.feedbackItems ||= [];
    const index = state.feedbackItems.findIndex((item) => item.id === feedbackId);
    if (index < 0) throw notFoundError("反馈不存在");
    state.feedbackItems[index] = normalizeFeedbackUpdate(state.feedbackItems[index], input);
    await stateStore.save(state);
    return structuredClone(state.feedbackItems[index]);
  }

  async function listLogicCards(chainId) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");
    const baseChain = structuredClone(baseLibrary.chains.find((item) => item.id === chainId));
    appendResearchPackageLogicTracks(
      baseChain,
      structuredClone(state.researchPackagesByChain?.[chainId] || [])
    );
    const editable = buildEditableLogicCards(
      baseChain,
      state.logicCardsByChain?.[chainId] || []
    );
    const managedSources = structuredClone(state.sourcesByChain?.[chainId] || []);
    const editableUpdates = mergeUpdates(
      structuredClone(state.updatesByChain?.[chainId] || []),
      structuredClone(baseChain?.updates || [])
    );
    const derivedSources = sourcesFromUpdates(editableUpdates, baseChain?.article);
    applySourceOverrides(
      { updates: [], logicTracks: [{ coreInsights: editable.cards }] },
      managedSources,
      derivedSources
    );
    return editable;
  }

  async function saveLogicCard(chainId, cardId, input) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");
    const existing = (await listLogicCards(chainId)).cards.find((card) => card.id === cardId);
    const card = normalizeLogicCard({ ...existing, ...input, id: cardId || input.id });

    state.logicCardsByChain ||= {};
    state.logicCardsByChain[chainId] ||= [];
    const index = state.logicCardsByChain[chainId].findIndex((item) => item.id === card.id);
    if (index >= 0) state.logicCardsByChain[chainId][index] = card;
    else state.logicCardsByChain[chainId].push(card);
    await stateStore.save(state);
    library = mergeLibrary(baseLibrary, state);
    return structuredClone(card);
  }

  async function deleteLogicCard(chainId, cardId) {
    if (!library.chains.some((item) => item.id === chainId)) throw notFoundError("产业链不存在");
    state.logicCardsByChain ||= {};
    state.logicCardsByChain[chainId] ||= [];
    const existing = (await listLogicCards(chainId)).cards.find((card) => card.id === cardId);
    if (!existing) throw notFoundError("逻辑卡不存在");
    const disabled = normalizeLogicCard({ ...existing, status: "deleted" });
    const index = state.logicCardsByChain[chainId].findIndex((item) => item.id === cardId);
    if (index >= 0) state.logicCardsByChain[chainId][index] = disabled;
    else state.logicCardsByChain[chainId].push(disabled);
    await stateStore.save(state);
    library = mergeLibrary(baseLibrary, state);
  }

  async function getEditableChain(chainId) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");
    const markdown = await readChainArticle(resolvedRootDir, objectStorage, chain.article);
    return { chain: structuredClone(chain), markdown };
  }

  async function updateArticle(chainId, input) {
    const chain = library.chains.find((item) => item.id === chainId);
    if (!chain) throw notFoundError("产业链不存在");
    const article = normalizeArticleInput(input);
    const articleRelativePath = path.join("raw", `${chainId}-industry-chain-original.md`);
    const articleUrl = objectStorage.urlFor(articleRelativePath);
    await writeManagedFile(objectStorage, articleRelativePath, article.markdown);

    const managedIndex = state.managedChains.findIndex((item) => item.id === chainId);
    if (managedIndex >= 0) {
      state.managedChains[managedIndex].article = articleUrl;
    } else {
      state.articleOverrides[chainId] = articleUrl;
    }
    await stateStore.save(state);
    library = mergeLibrary(baseLibrary, state);
    return structuredClone(library.chains.find((item) => item.id === chainId));
  }

  async function deleteManagedChain(chainId) {
    const index = state.managedChains.findIndex((item) => item.id === chainId);
    if (index < 0) throw notFoundError("该产业链不是通过后台创建的，无法删除");
    const [chain] = state.managedChains.splice(index, 1);
    delete state.updatesByChain[chainId];
    const sources = state.sourcesByChain?.[chainId] || [];
    if (state.sourcesByChain) delete state.sourcesByChain[chainId];
    if (state.logicCardsByChain) delete state.logicCardsByChain[chainId];
    if (state.researchPackagesByChain) delete state.researchPackagesByChain[chainId];
    if (state.monitorVerificationsByChain) delete state.monitorVerificationsByChain[chainId];
    await Promise.all([
      removeManagedFile(objectStorage, chain.article),
      removeManagedFile(objectStorage, chain.cover),
      removeManagedFile(objectStorage, chain.diagram),
      ...sources.map((source) => removeManagedFile(objectStorage, source.markdownUrl))
    ]);
    await stateStore.save(state);
    library = mergeLibrary(baseLibrary, state);
  }

  return {
    addSource,
    addUpdate,
    createChain,
    deleteManagedChain,
    getUserProfile,
    listUsers,
    previewChain: (input) => buildChainDraft({
      ...input,
      id: normalizeId(input.id || "new-chain"),
      markdown: normalizeArticleInput(input).markdown,
      articleTitle: normalizeArticleInput(input).title
    }),
    getEditableChain,
    getEditableSource,
    importPackage,
    inspectPackage,
    addMonitorVerification,
    addFeedback,
    listFeedback,
    listLogicCards,
    isManagedChain: (chainId) => state.managedChains.some((chain) => chain.id === chainId),
    updateArticle,
    updateSource,
    updateUpdate,
    saveLogicCard,
    saveReadingProgress,
    updateFeedback,
    updateUserMembership,
    deleteLogicCard,
    setFavoriteChain,
    setSubscribedChain,
    dataDir: resolvedDataDir,
    stateStoreDriver: stateStore.driver,
    objectStorageDriver: objectStorage.driver,
    close: () => stateStore.close(),
    readObject: (key) => objectStorage.getObject(key),
    getLibrary: () => library
  };
}

function storageErrorMessage(error) {
  if (error?.code === "AccessDenied" || error?.statusCode === 403) {
    return "对象存储拒绝写入，请检查 COS 子账号对当前 Bucket 是否具有对象读写权限。";
  }
  if (error?.code === "NoSuchBucket") return "COS Bucket 不存在或地域配置不正确。";
  if (error?.code === "InvalidAccessKeyId") return "COS 密钥无效，请检查服务器环境变量。";
  return `对象存储写入失败：${error?.message || "未知错误"}`;
}

function normalizeFeedback(input = {}, library) {
  const chainId = String(input.chainId || "").trim();
  const chain = chainId ? library.chains.find((item) => item.id === chainId) : null;
  if (chainId && !chain) throw validationError("产业链不存在");

  const type = String(input.type || "suggestion").trim();
  if (!feedbackTypes().has(type)) throw validationError("反馈类型无效");

  const message = required(input.message, "请输入反馈内容");
  if (message.length > 2000) throw validationError("反馈内容不能超过 2000 字");

  return {
    id: `feedback-${crypto.randomUUID().slice(0, 12)}`,
    chainId,
    chainTitle: chain?.title || "",
    type,
    message,
    contact: String(input.contact || "").trim().slice(0, 120),
    pageUrl: String(input.pageUrl || "").trim().slice(0, 500),
    status: "open",
    adminNotes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function normalizeFeedbackUpdate(current, input = {}) {
  const status = String(input.status || current.status || "open").trim();
  if (!feedbackStatuses().has(status)) throw validationError("反馈状态无效");
  const adminNotes = String(input.adminNotes ?? current.adminNotes ?? "").trim();
  if (adminNotes.length > 2000) throw validationError("处理备注不能超过 2000 字");
  return {
    ...current,
    status,
    adminNotes,
    updatedAt: new Date().toISOString()
  };
}

function feedbackTypes() {
  return new Set(["suggestion", "bug", "content", "cooperation", "other"]);
}

function feedbackStatuses() {
  return new Set(["open", "reviewing", "planned", "resolved", "closed"]);
}

function normalizeUserProfile(profile = {}) {
  return {
    id: String(profile.id || "").trim(),
    provider: String(profile.provider || "wechat-miniapp").trim(),
    openid: String(profile.openid || "").trim(),
    unionid: String(profile.unionid || "").trim(),
    favorites: {
      chains: uniqueStrings(profile.favorites?.chains)
    },
    subscriptions: {
      chains: uniqueStrings(profile.subscriptions?.chains)
    },
    membership: normalizeMembership(profile.membership),
    readingHistory: Array.isArray(profile.readingHistory)
      ? profile.readingHistory.map(normalizeReadingRecord).filter((item) => item.chainId).slice(0, 50)
      : [],
    createdAt: profile.createdAt || new Date().toISOString(),
    lastSeenAt: profile.lastSeenAt || "",
    updatedAt: profile.updatedAt || ""
  };
}

function normalizeMembership(membership = {}) {
  const tier = String(membership.tier || "free").trim().toLowerCase();
  const allowedTiers = new Set(["free", "pro", "team", "admin"]);
  const normalizedTier = allowedTiers.has(tier) ? tier : "free";
  return {
    tier: normalizedTier,
    status: String(membership.status || (normalizedTier === "free" ? "inactive" : "active")).trim(),
    expiresAt: String(membership.expiresAt || "").trim()
  };
}

function normalizeReadingRecord(record = {}) {
  return {
    chainId: String(record.chainId || "").trim(),
    chainTitle: String(record.chainTitle || "").trim(),
    headingId: String(record.headingId || "").trim(),
    headingTitle: String(record.headingTitle || "").trim(),
    blockIndex: Math.max(0, Number.parseInt(record.blockIndex || 0, 10) || 0),
    scrollTop: Math.max(0, Number.parseInt(record.scrollTop || 0, 10) || 0),
    progress: Math.max(0, Math.min(100, Number.parseInt(record.progress || 0, 10) || 0)),
    updatedAt: record.updatedAt || ""
  };
}

function publicUserProfile(profile) {
  const normalized = normalizeUserProfile(profile);
  return {
    id: normalized.id,
    provider: normalized.provider,
    favorites: normalized.favorites,
    subscriptions: normalized.subscriptions,
    membership: normalized.membership,
    readingHistory: normalized.readingHistory,
    updatedAt: normalized.updatedAt
  };
}

function publicAdminUserProfile(profile) {
  const normalized = normalizeUserProfile(profile);
  return {
    ...publicUserProfile(normalized),
    openid: normalized.openid,
    unionid: normalized.unionid,
    createdAt: normalized.createdAt,
    lastSeenAt: normalized.lastSeenAt,
    counts: {
      favorites: normalized.favorites.chains.length,
      subscriptions: normalized.subscriptions.chains.length,
      readingHistory: normalized.readingHistory.length
    }
  };
}

function toggleListItem(list, value, active) {
  const item = String(value || "").trim();
  if (!item) return;
  const index = list.indexOf(item);
  if (active && index < 0) list.push(item);
  if (!active && index >= 0) list.splice(index, 1);
}

function uniqueStrings(value) {
  return [...new Set((Array.isArray(value) ? value : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean))];
}

async function readChainArticle(rootDir, objectStorage, articleUrl) {
  return readContentFile(rootDir, objectStorage, articleUrl);
}

async function readContentFile(rootDir, objectStorage, fileUrl) {
  const objectKey = objectStorage.keyFromUrl(fileUrl);
  if (objectKey) {
    return (await objectStorage.getObject(objectKey)).toString("utf8");
  }
  const relativePath = String(fileUrl || "").replace(/^\.\//, "");
  const target = path.resolve(rootDir, relativePath);
  assertInside(rootDir, target);
  return readFile(target, "utf8");
}

async function removeManagedFile(objectStorage, fileUrl) {
  const objectKey = objectStorage.keyFromUrl(fileUrl);
  if (objectKey) await objectStorage.deleteObject(objectKey);
}

function mergeLibrary(baseLibrary, state) {
  const library = structuredClone(baseLibrary);
    for (const chain of library.chains) {
    if (state.articleOverrides?.[chain.id]) {
      chain.article = state.articleOverrides[chain.id];
    }
  }
  const managedChains = structuredClone(state.managedChains || []);
  library.chains.push(...managedChains);

  for (const chain of library.chains) {
    const researchPackages = structuredClone(state.researchPackagesByChain?.[chain.id] || []);
    const monitorVerifications = structuredClone(state.monitorVerificationsByChain?.[chain.id] || []);
    const managedUpdates = structuredClone(state.updatesByChain?.[chain.id] || []);
    const packageUpdates = updatesFromResearchPackages(researchPackages);
    const verificationUpdates = updatesFromMonitorVerifications(monitorVerifications);
    chain.updates = mergeUpdates(
      managedUpdates,
      [...verificationUpdates, ...packageUpdates, ...(chain.updates || [])]
    );
    const managedSources = structuredClone(state.sourcesByChain?.[chain.id] || []);
    const derivedSources = sourcesFromUpdates(chain.updates || [], chain.article);
    const packageSources = sourcesFromResearchPackages(researchPackages);
    chain.sources = mergeSources(managedSources, [...packageSources, ...derivedSources]);
    appendResearchPackageLogicTracks(chain, researchPackages);
    appendResearchPackageMonitors(chain, researchPackages);
    applyLogicCardOverrides(
      chain,
      structuredClone(state.logicCardsByChain?.[chain.id] || [])
    );
    applyMonitorVerifications(chain, monitorVerifications);
    applySourceOverrides(chain, managedSources, derivedSources);
    chain.researchPackages = researchPackages;
  }

  if (state.updatedAt) library.meta.updated = formatChinaDate(state.updatedAt);
  return library;
}

function updatesFromMonitorVerifications(verifications) {
  return verifications.map((verification) => ({
    id: `monitor-verification-update-${verification.id}`,
    date: verification.date,
    type: "数据变化",
    segment: verification.topicTitle,
    signal: `${verification.monitorName}：${verificationStatusLabel(verification.result)}`,
    impact: verification.summary,
    confidence: "已核验",
    sourceTitle: verification.sourceTitle,
    sourceUrl: verification.sourceUrl,
    sourceKind: "文章",
    sourcePlatform: "人工核验",
    notes: verification.notes || "由维护者完成监控核验。",
    logicTrack: {
      id: `research-${verification.topicId}`,
      role: verificationStatusLabel(verification.result),
      contribution: verification.summary
    },
    derivedFromVerification: true,
    verificationId: verification.id
  }));
}

function sourcesFromResearchPackages(packages) {
  return packages.map((researchPackage) => ({
    id: `research-package-${researchPackage.packageId}`,
    date: researchPackage.importedAt?.slice(0, 10) || "",
    createdAt: researchPackage.importedAt || "",
    type: "research-article",
    platform: "自有研究",
    title: researchPackage.title,
    author: "自有研究",
    originalUrl: researchPackage.articleUrl,
    markdownUrl: researchPackage.sourceUrl,
    logicUrl: researchPackage.logicUrl,
    summary: researchPackage.logic?.summary || researchPackage.title,
    segment: researchPackage.topicTitle,
    companies: uniqueCompanies(researchPackage.logic),
    tags: [researchPackage.topicTitle, "逻辑跟踪"],
    status: "published",
    packageId: researchPackage.packageId,
    topicId: researchPackage.topicId
  }));
}

function updatesFromResearchPackages(packages) {
  const ordered = packages
    .map((researchPackage, index) => ({ researchPackage, index }))
    .sort((left, right) =>
      String(left.researchPackage.importedAt || "").localeCompare(String(right.researchPackage.importedAt || "")) ||
      right.index - left.index
    )
    .map((entry) => entry.researchPackage);
  const previousByTopic = new Map();
  return ordered.map((researchPackage) => {
    const previous = previousByTopic.get(researchPackage.topicId);
    previousByTopic.set(researchPackage.topicId, researchPackage);
    const changes = compareResearchLogic(previous?.logic, researchPackage.logic);
    const isFirstVersion = !previous;
    return {
      id: `research-package-update-${researchPackage.packageId}`,
      date: researchPackage.importedAt?.slice(0, 10) || "",
      type: "机构逻辑",
      segment: researchPackage.topicTitle,
      signal: isFirstVersion
        ? `新增研究主题：${researchPackage.topicTitle}`
        : `${researchPackage.topicTitle}研究版本更新`,
      impact: isFirstVersion
        ? `提炼 ${researchPackage.logicCount} 条逻辑，关联 ${researchPackage.companyCount} 家公司，建立 ${researchPackage.monitorCount} 个监控指标。`
        : logicChangeSummary(changes),
      confidence: "资料包已校验",
      sourceTitle: researchPackage.title,
      sourceUrl: researchPackage.articleUrl,
      sourceKind: "文章",
      sourcePlatform: "自有研究",
      notes: isFirstVersion
        ? "研究主题已进入核心逻辑、研究归档和逻辑监控。"
        : logicChangeNotes(changes),
      logicTrack: {
        id: `research-${researchPackage.topicId}`,
        role: isFirstVersion ? "新增主题" : "版本更新",
        contribution: isFirstVersion
          ? `新增 ${researchPackage.logicCount} 条可跟踪逻辑。`
          : logicChangeSummary(changes)
      },
      derivedFromPackage: true,
      packageId: researchPackage.packageId
    };
  });
}

function appendResearchPackageMonitors(chain, packages) {
  if (!chain || !packages.length) return;
  const latestByTopic = new Map();
  for (const researchPackage of packages) {
    if (!latestByTopic.has(researchPackage.topicId)) {
      latestByTopic.set(researchPackage.topicId, researchPackage);
    }
  }
  chain.trackingProfile ||= {
    title: `${chain.title}逻辑监控`,
    summary: "持续验证核心逻辑是否强化、减弱或出现反证。",
    metrics: []
  };
  chain.trackingProfile.title = `${chain.shortTitle || chain.title}逻辑监控`;
  chain.trackingProfile.summary = "同时观察产业链基准指标与近期研究主题的强化、减弱和失效信号。";
  const existing = new Set((chain.trackingProfile.metrics || []).map((item) => item.id || item.name));
  for (const researchPackage of latestByTopic.values()) {
    for (const logic of researchPackage.logic?.logics || []) {
      for (const monitor of logic.monitors || []) {
        const id = `research-${researchPackage.topicId}-${monitor.key}`;
        if (existing.has(id)) continue;
        existing.add(id);
        chain.trackingProfile.metrics.push({
          id,
          name: monitor.name,
          why: monitor.logic,
          signals: [monitor.strengthening_signal, monitor.weakening_signal],
          topicTitle: researchPackage.topicTitle,
          logicTitle: logic.title,
          executionStatus: monitor.data_sources?.some((source) => source.execution_status === "active")
            ? "active"
            : monitor.data_sources?.every((source) => source.execution_status === "retired")
              ? "retired"
              : "planned",
          dataSources: (monitor.data_sources || []).map((source) => ({
            providers: source.providers || [],
            document: source.document,
            frequency: source.frequency,
            automationTarget: source.automation_target,
            executionStatus: source.execution_status
          })),
          rules: monitor.rules || [],
          invalidation: logic.invalidation || [],
          sourceTitle: researchPackage.title,
          sourceUrl: researchPackage.articleUrl,
          updatedAt: researchPackage.importedAt,
          logicKey: logic.key,
          topicId: researchPackage.topicId
        });
      }
    }
  }
}

function applyMonitorVerifications(chain, verifications) {
  const byMonitor = new Map();
  for (const verification of verifications) {
    const history = byMonitor.get(verification.monitorId) || [];
    history.push(verification);
    byMonitor.set(verification.monitorId, history);
  }
  for (const metric of chain.trackingProfile?.metrics || []) {
    const history = (byMonitor.get(metric.id) || [])
      .sort((left, right) =>
        String(right.date).localeCompare(String(left.date)) ||
        String(right.createdAt).localeCompare(String(left.createdAt))
      );
    if (!history.length) continue;
    metric.verificationHistory = history;
    metric.latestVerification = history[0];
    metric.currentStatus = history[0].result;
    metric.executionStatus = "active";
    metric.updatedAt = history[0].date;
  }

  for (const track of chain.logicTracks || []) {
    for (const insight of track.coreInsights || []) {
      const related = verifications.filter((item) =>
        item.topicId && track.id === `research-${item.topicId}` && item.logicKey === insight.id.replace(`${item.topicId}-`, "")
      );
      if (!related.length) continue;
      const latestByMonitor = new Map();
      related
        .sort((left, right) =>
          String(right.date).localeCompare(String(left.date)) ||
          String(right.createdAt).localeCompare(String(left.createdAt))
        )
        .forEach((item) => {
          if (!latestByMonitor.has(item.monitorId)) latestByMonitor.set(item.monitorId, item);
        });
      const aggregate = aggregateVerificationStatus([...latestByMonitor.values()].map((item) => item.result));
      insight.verificationStatus = aggregate;
      insight.kicker = verificationLogicLabel(aggregate);
      insight.verificationHistory = related;
    }
  }
}

function aggregateVerificationStatus(results) {
  for (const status of ["invalidate", "challenge", "weaken", "strengthen", "stable"]) {
    if (results.includes(status)) return status;
  }
  return "";
}

function verificationLogicLabel(status) {
  return {
    strengthen: "核验强化",
    stable: "核验稳定",
    weaken: "核验减弱",
    challenge: "核验反证",
    invalidate: "核验失效"
  }[status] || "待核验";
}

function verificationStatusLabel(status) {
  return {
    strengthen: "强化",
    stable: "稳定",
    weaken: "减弱",
    challenge: "反证",
    invalidate: "失效"
  }[status] || "待判断";
}

function appendResearchPackageLogicTracks(chain, packages) {
  if (!chain || !packages.length) return;
  const latestByTopic = new Map();
  for (const researchPackage of packages) {
    if (!latestByTopic.has(researchPackage.topicId)) {
      latestByTopic.set(researchPackage.topicId, researchPackage);
    }
  }
  chain.logicTracks ||= [];
  for (const researchPackage of latestByTopic.values()) {
    const trackId = `research-${researchPackage.topicId}`;
    const packageTrack = {
      id: trackId,
      title: researchPackage.topicTitle,
      summary: researchPackage.logic?.summary || researchPackage.title,
      coreInsights: (researchPackage.logic?.logics || []).map((item, index) => ({
        id: `${researchPackage.topicId}-${item.key}`,
        kicker: item.kind === "risk" ? "风险逻辑" : logicStatusLabel(item.status),
        title: item.title,
        summary: item.statement,
        display: "points",
        points: [
          ...(item.evidence || []).slice(0, 3).map((evidence) => ({
            label: "支撑证据",
            description: evidence.summary
          })),
          ...(item.monitors || []).slice(0, 2).map((monitor) => ({
            label: "持续监控",
            description: `${monitor.name}：${monitor.strengthening_signal}`
          }))
        ],
        conclusion: (item.invalidation || []).length
          ? `失效条件：${item.invalidation.map((entry) => entry.condition).join("；")}`
          : "",
        attachments: (item.companies || []).map((company) => ({
          type: "company",
          label: company.name,
          ticker: company.ticker,
          exchange: company.exchange
        })),
        sources: [{
          label: "阅读研究原文",
          type: "article",
          title: researchPackage.title,
          url: researchPackage.articleUrl,
          anchor: item.evidence?.[0]?.anchor || ""
        }],
        articleAnchor: item.evidence?.[0]?.anchor || "",
        researchDate: researchPackage.importedAt?.slice(0, 10) || "",
        status: "published",
        order: index + 1
      }))
    };
    const existingIndex = chain.logicTracks.findIndex((track) => track.id === trackId);
    if (existingIndex >= 0) chain.logicTracks[existingIndex] = packageTrack;
    else chain.logicTracks.push(packageTrack);
  }
}

function compareResearchLogic(previousLogic, currentLogic) {
  const previous = new Map((previousLogic?.logics || []).map((item) => [item.key, item]));
  const current = new Map((currentLogic?.logics || []).map((item) => [item.key, item]));
  const added = [...current.keys()].filter((key) => !previous.has(key));
  const removed = [...previous.keys()].filter((key) => !current.has(key));
  const changed = [...current.keys()].filter((key) => {
    const before = previous.get(key);
    const after = current.get(key);
    return before && (before.status !== after.status || before.statement !== after.statement);
  });
  return { added, removed, changed };
}

function logicChangeSummary(changes) {
  const parts = [];
  if (changes.added.length) parts.push(`新增 ${changes.added.length} 条逻辑`);
  if (changes.changed.length) parts.push(`更新 ${changes.changed.length} 条逻辑`);
  if (changes.removed.length) parts.push(`移除 ${changes.removed.length} 条逻辑`);
  return parts.length ? `${parts.join("，")}。` : "研究内容已更新，核心逻辑结论暂未发生结构性变化。";
}

function logicChangeNotes(changes) {
  const keys = [...changes.added, ...changes.changed, ...changes.removed];
  return keys.length ? `发生变化的稳定 key：${keys.join("、")}` : "保留本版本资料，作为后续逻辑变化比较的基线。";
}

function uniqueCompanies(logic) {
  return [...new Set((logic?.logics || [])
    .flatMap((item) => item.companies || [])
    .map((company) => company.name)
    .filter(Boolean))];
}

function normalizeMonitorVerification(input, monitor) {
  const result = String(input.result || "").trim();
  if (!["strengthen", "stable", "weaken", "challenge", "invalidate"].includes(result)) {
    throw validationError("请选择有效的核验结果");
  }
  const date = String(input.date || new Date().toISOString().slice(0, 10)).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw validationError("日期格式应为 YYYY-MM-DD");
  const sourceUrl = String(input.sourceUrl || "").trim();
  if (!/^https?:\/\//i.test(sourceUrl) && !/^\/managed\/[A-Za-z0-9_./-]+$/i.test(sourceUrl)) {
    throw validationError("来源链接应为网页地址或已归档原文");
  }
  return {
    id: `verification-${crypto.randomUUID().slice(0, 12)}`,
    monitorId: monitor.id,
    monitorName: monitor.name,
    topicId: monitor.topicId,
    topicTitle: monitor.topicTitle,
    logicKey: monitor.logicKey,
    logicTitle: monitor.logicTitle,
    date,
    result,
    summary: required(input.summary, "请输入核验事实与判断"),
    sourceTitle: required(input.sourceTitle, "请输入来源标题"),
    sourceUrl,
    notes: String(input.notes || "").trim(),
    createdAt: new Date().toISOString()
  };
}

function logicStatusLabel(status) {
  return {
    new: "新逻辑",
    strengthening: "逻辑强化",
    stable: "逻辑稳定",
    weakening: "逻辑减弱",
    challenged: "出现反证",
    invalidated: "逻辑失效"
  }[status] || "核心逻辑";
}

function formatChinaDate(value) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

function migrateDeprecatedChains(baseLibrary, state) {
  if (!baseLibrary.chains.some((chain) => chain.id === "semiconductor-material")) return false;
  const previousLength = state.managedChains.length;
  state.managedChains = state.managedChains.filter((chain) => chain.id !== "semiconductor-material-industry-chain");
  const hadUpdates = Boolean(state.updatesByChain["semiconductor-material-industry-chain"]);
  const hadOverride = Boolean(state.articleOverrides["semiconductor-material-industry-chain"]);
  const hadSources = Boolean(state.sourcesByChain?.["semiconductor-material-industry-chain"]);
  const hadLogicCards = Boolean(state.logicCardsByChain?.["semiconductor-material-industry-chain"]);
  const hadResearchPackages = Boolean(state.researchPackagesByChain?.["semiconductor-material-industry-chain"]);
  const hadMonitorVerifications = Boolean(state.monitorVerificationsByChain?.["semiconductor-material-industry-chain"]);
  delete state.updatesByChain["semiconductor-material-industry-chain"];
  delete state.articleOverrides["semiconductor-material-industry-chain"];
  if (state.sourcesByChain) delete state.sourcesByChain["semiconductor-material-industry-chain"];
  if (state.logicCardsByChain) delete state.logicCardsByChain["semiconductor-material-industry-chain"];
  if (state.researchPackagesByChain) delete state.researchPackagesByChain["semiconductor-material-industry-chain"];
  if (state.monitorVerificationsByChain) delete state.monitorVerificationsByChain["semiconductor-material-industry-chain"];
  return previousLength !== state.managedChains.length ||
    hadUpdates || hadOverride || hadSources || hadLogicCards || hadResearchPackages || hadMonitorVerifications;
}

function publicInspection(inspection) {
  return {
    valid: inspection.valid,
    errors: inspection.errors,
    warnings: inspection.warnings,
    preview: inspection.preview
  };
}

async function writeManagedFile(objectStorage, relativePath, contents) {
  await objectStorage.putObject(relativePath, Buffer.from(contents, "utf8"));
}

async function writeManagedBinary(objectStorage, relativePath, contents) {
  await objectStorage.putObject(relativePath, contents);
}

function normalizeArticleInput(input) {
  const markdown = String(input.markdown || "").trim();
  if (markdown.length < 80) throw validationError("Markdown 原稿内容过短");
  if (Buffer.byteLength(markdown, "utf8") > 2 * 1024 * 1024) {
    throw validationError("Markdown 原稿不能超过 2MB");
  }

  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || String(input.title || "").trim();
  if (!title) throw validationError("Markdown 原稿缺少一级标题");
  return { markdown: `${markdown}\n`, title };
}

function ensureMarkdownTitle(markdown, title) {
  if (/^#\s+.+$/m.test(markdown)) return markdown;
  const frontmatter = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  if (!frontmatter) return `# ${title}\n\n${markdown}`;
  return `${frontmatter[0]}# ${title}\n\n${markdown.slice(frontmatter[0].length)}`;
}

function buildChainDraft(input) {
  const sections = extractSections(input.markdown);
  const chainSections = buildChainSections(sections);
  const title = String(input.title || input.articleTitle).trim();
  const shortTitle = String(input.shortTitle || title.replace(/产业链.*$/, "")).trim().slice(0, 24);
  const theme = String(input.theme || extractTheme(input.markdown)).trim().slice(0, 240);
  const logic = buildLogic(sections, theme);

  return {
    id: input.id,
    title,
    shortTitle: shortTitle || title,
    theme: theme || "新产业链原稿已上传，等待进一步完善产业逻辑。",
    status: "已建档",
    trackingProfile: {
      title: `${shortTitle || title}专属动态追踪`,
      summary: "从产业进展、订单验证、产能变化和关键公司动态四个方向持续更新。",
      metrics: [
        {
          name: "产业进展",
          why: "判断产业是否从概念验证进入订单和规模化阶段。",
          signals: ["政策与标准", "客户验证", "订单与交付", "产能与良率"]
        }
      ]
    },
    chain: chainSections,
    logic
  };
}

function normalizeChainDraft(draft, input) {
  const title = required(draft.title || input.title || input.articleTitle, "请输入页面标题");
  const shortTitle = required(draft.shortTitle || input.shortTitle, "请输入短标题");
  const theme = required(draft.theme || input.theme, "请输入一句话主题");
  if (!Array.isArray(draft.chain) || !draft.chain.length) throw validationError("产业链骨架不能为空");
  if (!Array.isArray(draft.logic) || !draft.logic.length) throw validationError("核心逻辑不能为空");

  return {
    id: input.id,
    title,
    shortTitle,
    theme,
    status: "已建档",
    trackingProfile: draft.trackingProfile || {
      title: `${shortTitle}专属动态追踪`,
      summary: "围绕产业进展、订单验证、产能变化和关键公司动态持续更新。",
      metrics: [{
        name: "产业进展",
        why: "判断产业是否从概念验证进入订单和规模化阶段。",
        signals: ["政策与标准", "客户验证", "订单与交付", "产能与良率"]
      }]
    },
    chain: draft.chain.map((section, index) => ({
      id: normalizeId(section.id || `section-${index + 1}`) || `section-${index + 1}`,
      title: required(section.title || section.name, "骨架章节标题不能为空"),
      role: required(section.role, "骨架章节说明不能为空"),
      items: (section.items || section.segments || []).map((item) => ({
        name: required(item.name, "骨架环节名称不能为空"),
        detail: required(item.detail || item.logic, "骨架环节说明不能为空"),
        companies: required(item.companies || "待补充", "骨架公司不能为空")
      }))
    })),
    logic: draft.logic.map((item) => ({
      title: required(item.title, "核心逻辑标题不能为空"),
      body: required(item.body, "核心逻辑内容不能为空")
    }))
  };
}

function extractSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const sections = [];
  let current = null;

  for (const line of lines) {
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      current = { level: heading[1].length, title: cleanMarkdown(heading[2]), body: [] };
      sections.push(current);
    } else if (current && line.trim()) {
      current.body.push(cleanMarkdown(line));
    }
  }
  return sections;
}

function buildChainSections(sections) {
  const topLevel = sections.filter((section) =>
    section.level === 2 && !/概览|总结|风险|附录|市场热点|为什么|能力/.test(section.title)
  );
  const candidates = topLevel.slice(0, 5);

  return candidates.map((section, index) => {
    const start = sections.indexOf(section);
    const endOffset = sections.slice(start + 1).findIndex((item) => item.level === 2);
    const end = endOffset < 0 ? sections.length : start + 1 + endOffset;
    const children = sections.slice(start + 1, end).filter((item) => item.level === 3);
    const items = children.slice(0, 8).map((child) => ({
      name: cleanHeading(child.title).slice(0, 42),
      detail: child.body.join(" ").slice(0, 180) || "请根据原稿补充环节说明。",
      companies: extractCompanies(child.body.join(" ")) || "待补充"
    }));

    return {
      id: `section-${index + 1}`,
      title: cleanHeading(section.title),
      role: section.body.join(" ").slice(0, 140) || "根据 Markdown 原稿章节生成，请在发布前检查。",
      items: items.length ? items : [{
        name: cleanHeading(section.title),
        detail: section.body.join(" ").slice(0, 180) || "请根据原稿补充环节说明。",
        companies: extractCompanies(section.body.join(" ")) || "待补充"
      }]
    };
  });
}

function buildLogic(sections, theme) {
  const summary = sections.find((section) => section.level === 2 && /核心逻辑|逻辑总结|核心驱动|产业趋势/.test(section.title));
  let source = [];
  if (summary) {
    const start = sections.indexOf(summary);
    const endOffset = sections.slice(start + 1).findIndex((item) => item.level === 2);
    const end = endOffset < 0 ? sections.length : start + 1 + endOffset;
    source = sections.slice(start + 1, end).filter((section) =>
      section.level === 3 &&
      /驱动|逻辑|催化|趋势/.test(section.title) &&
      !/优先级|风险/.test(section.title)
    );
  }
  if (!source.length) {
    source = sections.filter((section) => section.level === 2 && /驱动|逻辑|总结|催化|趋势|核心/.test(section.title));
  }
  if (!source.length) source = sections.filter((section) => section.level === 2);
  const logic = source.slice(0, 4).map((section) => ({
    title: cleanHeading(section.title).slice(0, 40),
    body: section.body.join(" ").slice(0, 220) || theme
  }));
  return logic.length ? logic : [{ title: "核心逻辑", body: theme }];
}

function extractTheme(markdown) {
  const core = markdown.match(/>\s*\*\*核心驱动\*\*[：:]\s*(.+)/)?.[1];
  if (core) return cleanMarkdown(core);
  return cleanMarkdown(markdown.split(/\n\s*\n/).find((block) => !block.startsWith("#") && block.length > 30) || "");
}

function extractCompanies(text) {
  const matches = [...text.matchAll(/([\u4e00-\u9fa5A-Za-z]{2,16})[（(]\d{6}[）)]/g)].map((match) => match[1]);
  return [...new Set(matches)].slice(0, 12).join("、");
}

function normalizeUpdate(input) {
  const sourceUrl = String(input.sourceUrl || "").trim();
  const validSourceUrl =
    /^https?:\/\//i.test(sourceUrl) ||
    /^\.\/content\/[A-Za-z0-9_./-]+$/i.test(sourceUrl) ||
    /^\/managed\/[A-Za-z0-9_./-]+$/i.test(sourceUrl);
  if (!validSourceUrl) throw validationError("来源链接应为网页地址或已归档的本地原文");
  const type = required(input.type, "请选择动态类型");
  if (!["产业事件", "机构逻辑", "公司公告", "数据变化"].includes(type)) {
    throw validationError("动态类型无效");
  }
  const sourceKind = String(input.sourceKind || "文章").trim();
  if (!["文章", "短视频", "公告", "资料"].includes(sourceKind)) {
    throw validationError("来源类型无效");
  }

  const update = {
    id: String(input.id || createStableId("update", [
      input.date,
      input.sourceUrl,
      input.sourceTitle,
      input.signal
    ])).trim(),
    date: String(input.date || new Date().toISOString().slice(0, 10)).trim(),
    type,
    segment: required(input.segment, "请输入产业链环节"),
    signal: required(input.signal, "请输入动态摘要"),
    impact: required(input.impact, "请输入影响判断"),
    confidence: String(input.confidence || "待核验").trim(),
    sourceTitle: required(input.sourceTitle, "请输入来源标题"),
    sourceUrl,
    sourceKind,
    sourcePlatform: String(input.sourcePlatform || "").trim(),
    notes: String(input.notes || "通过维护台添加，后续持续跟踪。").trim()
  };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(update.date)) throw validationError("日期格式应为 YYYY-MM-DD");
  return update;
}

function normalizeSource(input) {
  const type = required(input.type, "请选择资料类型");
  const allowedTypes = new Set([
    "research-article",
    "short-video",
    "wechat",
    "weibo",
    "announcement",
    "report",
    "news",
    "other"
  ]);
  if (!allowedTypes.has(type)) throw validationError("资料类型无效");

  const title = required(input.title, "请输入资料标题");
  const originalUrl = String(input.originalUrl || "").trim();
  if (originalUrl && !/^https?:\/\//i.test(originalUrl)) {
    throw validationError("原始链接必须以 http:// 或 https:// 开头");
  }

  const rawMarkdown = String(input.markdown || "").trim();
  const markdown = rawMarkdown ? ensureMarkdownTitle(rawMarkdown, title) : "";
  if (markdown && Buffer.byteLength(markdown, "utf8") > 2 * 1024 * 1024) {
    throw validationError("资料原文不能超过 2MB");
  }

  return {
    id: String(input.id || `${formatCompactDate(input.date || formatChinaDate(new Date()))}-${normalizeId(title).slice(0, 40) || "source"}-${crypto.randomUUID().slice(0, 8)}`),
    date: normalizeDate(input.date || formatChinaDate(new Date())),
    type,
    platform: String(input.platform || "").trim(),
    title,
    author: String(input.author || "").trim(),
    originalUrl,
    summary: String(input.summary || "").trim(),
    segment: String(input.segment || "").trim(),
    companies: splitList(input.companies),
    tags: splitList(input.tags),
    status: ["draft", "published", "archived"].includes(input.status) ? input.status : "draft",
    illustrations: normalizeIllustrations(input.illustrations),
    markdown: markdown ? `${markdown}\n` : "",
    createdAt: input.createdAt || new Date().toISOString()
  };
}

function sourcesFromUpdates(updates, baseArticleUrl) {
  const normalizedBaseArticle = normalizeSourceReference(baseArticleUrl);
  return updates
    .filter((item) => {
      if (item.derivedFromPackage) return false;
      if (!item.sourceUrl && !item.sourceTitle) return false;
      return normalizeSourceReference(item.sourceUrl) !== normalizedBaseArticle;
    })
    .map((item, index) => ({
      id: createStableId("source", [item.date, item.sourceUrl, item.sourceTitle]),
      date: item.date,
      type: sourceTypeFromUpdate(item),
      platform: item.sourcePlatform || "",
      title: item.sourceTitle || item.signal,
      originalUrl: /^https?:\/\//i.test(item.sourceUrl || "") ? item.sourceUrl : "",
      markdownUrl: /\.md(?:$|\?)/i.test(item.sourceUrl || "") ? item.sourceUrl : "",
      summary: item.impact || item.signal,
      segment: item.segment || "",
      companies: [],
      tags: [],
      illustrations: normalizeIllustrations(item.sourceIllustrations),
      status: "published",
      derivedFromUpdate: true
    }));
}

function mergeUpdates(managedUpdates, baseUpdates) {
  const normalizeExistingUpdate = (item) => ({
    ...item,
    id: item.id || createStableId("update", [
      item.date,
      item.sourceUrl,
      item.sourceTitle,
      item.signal
    ])
  });
  const normalizedManaged = managedUpdates.map(normalizeExistingUpdate);
  const normalizedBase = baseUpdates.map(normalizeExistingUpdate);
  const seen = new Set();
  return [...normalizedManaged, ...normalizedBase]
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort((left, right) => String(right.date || "").localeCompare(String(left.date || "")));
}

function normalizeSourceReference(value) {
  return String(value || "")
    .trim()
    .replace(/^\.\//, "")
    .replace(/^\/+/, "")
    .split(/[?#]/, 1)[0];
}

function createStableId(prefix, values) {
  const digest = crypto
    .createHash("sha1")
    .update(values.map((value) => String(value || "").trim()).join("|"))
    .digest("hex")
    .slice(0, 12);
  return `${prefix}-${digest}`;
}

function normalizeIllustrations(value) {
  const illustrations = Array.isArray(value) ? value : [];
  return illustrations.slice(0, 12).map((item) => ({
    src: String(item.src || "").trim(),
    alt: String(item.alt || "").trim(),
    caption: String(item.caption || "").trim(),
    afterHeading: String(item.afterHeading || "").trim(),
    ...(item.upload && typeof item.upload === "object" ? { upload: item.upload } : {})
  })).filter((item) => item.src || item.upload);
}

async function persistSourceIllustrations(objectStorage, chainId, sourceId, illustrations) {
  const persisted = [];
  for (let index = 0; index < (illustrations || []).length; index += 1) {
    const illustration = illustrations[index];
    if (!illustration.upload) {
      persisted.push(illustration);
      continue;
    }
    const asset = normalizeAsset(illustration.upload, "资料配图");
    const relativePath = path.join("sources", chainId, sourceId, `image-${index + 1}${asset.extension}`);
    await writeManagedBinary(objectStorage, relativePath, asset.contents);
    persisted.push({
      src: objectStorage.urlFor(relativePath),
      alt: illustration.alt,
      caption: illustration.caption,
      afterHeading: illustration.afterHeading
    });
  }
  return persisted;
}

function mergeSources(managedSources, derivedSources) {
  const seen = new Set();
  return [...managedSources, ...derivedSources]
    .filter((source) => {
      const key = source.id || normalizeSourceReference(source.originalUrl || source.markdownUrl) ||
        `${source.date}:${source.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((left, right) =>
      String(right.date || "").localeCompare(String(left.date || "")) ||
      String(right.createdAt || "").localeCompare(String(left.createdAt || ""))
    );
}

function applySourceOverrides(chain, managedSources, derivedSources) {
  const replacements = new Map();
  for (const managed of managedSources) {
    const derived = derivedSources.find((source) => source.id === managed.id);
    if (!derived || !managed.markdownUrl) continue;
    const previousUrl = derived.markdownUrl || derived.originalUrl;
    if (previousUrl) replacements.set(normalizeSourceReference(previousUrl), managed);
  }
  if (!replacements.size) return;

  chain.updates = (chain.updates || []).map((update) => {
    const replacement = replacements.get(normalizeSourceReference(update.sourceUrl));
    if (!replacement) return update;
    return {
      ...update,
      sourceUrl: replacement.markdownUrl,
      sourceIllustrations: replacement.illustrations || update.sourceIllustrations || []
    };
  });

  for (const track of chain.logicTracks || []) {
    for (const insight of track.coreInsights || []) {
      insight.sources = (insight.sources || []).map((source) => {
        const replacement = replacements.get(normalizeSourceReference(source.url));
        return replacement ? { ...source, url: replacement.markdownUrl } : source;
      });
    }
  }
}

function applyLogicCardOverrides(chain, managedCards) {
  const overrides = new Map(managedCards.map((card) => [card.id, card]));
  const tracks = new Map((chain.logicTracks || []).map((track) => [track.id, {
    ...track,
    coreInsights: (track.coreInsights || []).map((insight, index) => ({
      ...insight,
      id: insight.id || `card-${track.id}-${index + 1}`,
      trackId: track.id,
      trackTitle: track.title,
      trackSummary: track.summary,
      status: "published",
      order: index + 1
    }))
  }]));

  for (const track of tracks.values()) {
    track.coreInsights = track.coreInsights
      .map((card) => overrides.get(card.id) || card)
      .filter((card) => card.status !== "deleted" && card.status !== "draft");
  }

  for (const card of managedCards) {
    if (card.status !== "published") continue;
    const track = tracks.get(card.trackId) || {
      id: card.trackId,
      title: card.trackTitle,
      summary: card.trackSummary,
      coreInsights: []
    };
    if (!tracks.has(card.trackId)) tracks.set(card.trackId, track);
    if (!track.coreInsights.some((item) => item.id === card.id)) track.coreInsights.push(card);
    track.title = card.trackTitle || track.title;
    track.summary = card.trackSummary || track.summary;
  }

  for (const track of tracks.values()) {
    track.coreInsights.sort((left, right) =>
      Number(left.order || 0) - Number(right.order || 0) ||
      String(left.title).localeCompare(String(right.title), "zh-CN")
    );
  }
  chain.logicTracks = [...tracks.values()].filter((track) => track.coreInsights.length);
}

function buildEditableLogicCards(baseChain, managedCards) {
  const cards = [];
  for (const track of baseChain?.logicTracks || []) {
    (track.coreInsights || []).forEach((insight, index) => {
      cards.push(normalizeLogicCard({
        ...insight,
        id: insight.id || `card-${track.id}-${index + 1}`,
        trackId: track.id,
        trackTitle: track.title,
        trackSummary: track.summary,
        status: "published",
        order: index + 1
      }));
    });
  }
  const byId = new Map(cards.map((card) => [card.id, card]));
  managedCards.forEach((card) => byId.set(card.id, normalizeLogicCard(card)));
  return {
    tracks: [...new Map([...byId.values()].map((card) => [
      card.trackId,
      { id: card.trackId, title: card.trackTitle, summary: card.trackSummary }
    ])).values()],
    cards: [...byId.values()]
      .filter((card) => card.status !== "deleted")
      .sort((left, right) =>
        left.trackId.localeCompare(right.trackId) ||
        Number(left.order) - Number(right.order)
      )
  };
}

function normalizeLogicCard(input) {
  const display = ["points", "metrics", "formula", "comparison", "table", "text"]
    .includes(input.display) ? input.display : "text";
  const content = normalizeLogicContent(display, input.content || input);
  const trackTitle = required(input.trackTitle, "请输入逻辑组标题");
  const title = required(input.title, "请输入逻辑卡标题");
  return {
    id: String(input.id || `logic-${crypto.randomUUID().slice(0, 12)}`),
    trackId: normalizeId(input.trackId || trackTitle) || `track-${crypto.randomUUID().slice(0, 8)}`,
    trackTitle,
    trackSummary: String(input.trackSummary || "").trim(),
    sourceId: String(input.sourceId || "").trim(),
    kicker: String(input.kicker || "核心逻辑").trim(),
    title,
    summary: required(input.summary, "请输入逻辑卡摘要"),
    conclusion: String(input.conclusion || "").trim(),
    display,
    ...content,
    attachments: normalizeLogicAttachments(input.attachments),
    sources: normalizeLogicSources(input.sources),
    articleAnchor: String(input.articleAnchor || "").trim(),
    status: ["draft", "published", "deleted"].includes(input.status) ? input.status : "draft",
    order: Math.max(1, Number.parseInt(input.order || "1", 10) || 1),
    updatedAt: new Date().toISOString()
  };
}

function normalizeLogicContent(display, input) {
  if (display === "points") {
    return { points: normalizeObjectRows(input.points, ["label", "description"]) };
  }
  if (display === "metrics") {
    return {
      metrics: normalizeObjectRows(input.metrics, ["label", "value", "description"])
        .map((item) => ({ ...item, scale: Math.max(0, Math.min(100, Number(item.scale) || 0)) }))
    };
  }
  if (display === "formula") {
    return { formula: (Array.isArray(input.formula) ? input.formula : []).map(String).filter(Boolean) };
  }
  if (display === "comparison") {
    return { comparison: normalizeObjectRows(input.comparison, ["name", "position", "reason"]) };
  }
  if (display === "table") {
    return {
      table: {
        columns: (input.table?.columns || []).map(String),
        rows: (input.table?.rows || []).map((row) => row.map(String))
      }
    };
  }
  return {};
}

function normalizeObjectRows(value, keys) {
  return (Array.isArray(value) ? value : []).map((item) =>
    Object.fromEntries([...keys, "scale"].filter((key) => key in item).map((key) => [key, String(item[key] ?? "")]))
  );
}

function normalizeLogicAttachments(value) {
  return (Array.isArray(value) ? value : []).slice(0, 12).map((item) => ({
    type: ["company", "segment", "topic", "chain", "tracking"].includes(item.type) ? item.type : "topic",
    label: String(item.label || "").trim(),
    ...(item.target ? { target: item.target } : {}),
    ...(item.ticker ? { ticker: String(item.ticker).trim() } : {}),
    ...(item.exchange ? { exchange: String(item.exchange).trim() } : {})
  })).filter((item) => item.label);
}

function normalizeLogicSources(value) {
  return (Array.isArray(value) ? value : []).slice(0, 6).map((item) => ({
    label: String(item.label || "阅读全文").trim(),
    type: String(item.type || "article").trim(),
    title: String(item.title || "").trim(),
    url: String(item.url || "").trim(),
    anchor: String(item.anchor || "").trim()
  })).filter((item) => item.url);
}

function sourceTypeFromUpdate(item) {
  if (item.sourceKind === "短视频") return "short-video";
  if (item.sourceKind === "文章") return "research-article";
  if (item.sourceKind === "公告") return "announcement";
  return "other";
}

function splitList(value) {
  return String(value || "")
    .split(/[、,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeDate(value) {
  const date = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw validationError("日期格式应为 YYYY-MM-DD");
  return date;
}

function formatCompactDate(value) {
  return normalizeDate(value).replaceAll("-", "");
}

function required(value, message) {
  const normalized = String(value || "").trim();
  if (!normalized) throw validationError(message);
  return normalized;
}

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/产业链.*$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-industry-chain$/, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function cleanHeading(value) {
  return String(value || "")
    .replace(/^[(（]?[一二三四五六七八九十\d]+[)）.、\s-]*/, "")
    .trim();
}

function cleanMarkdown(value) {
  return String(value || "")
    .replace(/[*_`>#|]/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAsset(asset, label) {
  if (!asset || typeof asset !== "object") throw validationError(`请上传正式${label}文件`);
  const type = String(asset.type || "").toLowerCase();
  const allowed = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/svg+xml": ".svg"
  };
  const extension = allowed[type];
  if (!extension) throw validationError(`${label}仅支持 PNG、JPG、WebP 或 SVG`);
  const data = String(asset.data || "").replace(/^data:[^;]+;base64,/, "");
  const contents = Buffer.from(data, "base64");
  if (!contents.length || contents.length > 8 * 1024 * 1024) {
    throw validationError(`${label}文件无效或超过 8MB`);
  }
  return { contents, extension };
}

function assertInside(rootDir, targetPath) {
  const root = `${path.resolve(rootDir)}${path.sep}`;
  if (!targetPath.startsWith(root)) throw new Error("Managed path escapes data directory");
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = "validation_error";
  return error;
}

function notFoundError(message) {
  const error = new Error(message);
  error.statusCode = 404;
  error.code = "not_found";
  return error;
}
