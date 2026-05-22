(function () {
  "use strict";

  const SDK = window.__HERMES_PLUGIN_SDK__;
  if (!SDK || !window.__HERMES_PLUGINS__) return;

  const React = SDK.React;
  const h = React.createElement;
  const { useEffect, useMemo, useRef, useState } = SDK.hooks;
  const { Badge, Button, Card, Input } = SDK.components;
  const { cn } = SDK.utils;

  const I18N = {
    en: {
      usage: "Usage",
      skills: "Skills",
      requestBodies: "Bodies",
      groupchat: "GroupChat",
      hideSidebar: "Hide sidebar",
      showSidebar: "Show sidebar",
      overview: "Overview",
      activity: "Activity",
      distribution: "Distribution",
      search: "Search",
      searchPlaceholder: "Search session id, title, or first user message",
      sessions: "Sessions",
      requestBodiesTitle: "Request bodies",
      requestDetail: "Request detail",
      promptEnvelope: "Prompt envelope",
      messages: "Messages",
      rawRequestJson: "Raw request JSON",
      toolSchemas: "Tool schemas",
      selectedSession: "Selected session",
      selectedTotal: "Selected total",
      turn: "Turn",
      api: "API",
      prev: "Prev",
      next: "Next",
      none: "none",
      unknown: "unknown",
      chars: "chars",
      msgs: "msgs",
      schemas: "schemas",
      tok: "tok",
      calls: "calls",
      total: "Total",
      system: "System",
      prefill: "Prefill",
      tools: "Tools",
      apiMessages: "API messages",
      history: "History",
      injectedCtx: "Injected ctx",
      mode: "Mode",
      firstTurn: "first turn",
      noUsageRows: "No usage rows in range.",
      noSkillData: "No skill activity in range.",
      noSessionData: "No session data in range.",
      noSnapshotsYet: "No request snapshots recorded yet.",
      noSnapshotsForSession: "No request snapshots for this session.",
      selectSessionFirst: "Select a session first.",
      selectRequestDetail: "Select a request to inspect the exact payload Hermes sent upstream.",
      loadingUsage: "Loading usage...",
      loadingSkills: "Loading skills...",
      loadingSessions: "Loading sessions...",
      loadingRequests: "Loading requests...",
      loadingRequestDetail: "Loading request detail...",
      noSeparatePromptBlock: "No separate system/instructions block on this request.",
      noMessageArray: "No message array found in this request payload.",
      fullRequestEstimate: "full request estimate",
      memoryPluginAdditions: "memory/plugin additions",
      showingZero: "showing 0",
      showingRange: "showing {start} - {end}",
      rising: "vs previous day",
      sessionsStarted: "Sessions started",
      inputTokens: "Input tokens",
      outputTokens: "Output tokens",
      reasoning: "reasoning",
      apiCalls: "API calls",
      promptSideTotalLabel: "Prompt-side total",
      cacheReadLabel: "Cache read",
      hitRate: "hit rate",
      readVsInput: "Read vs input",
      cacheReadOverInput: "cache_read_tokens / input_tokens",
      hitRateInclWrite: "Hit rate incl. write",
      hitRateInclWriteHint: "cache_read / (input + read + write)",
      hitRateInclWriteShort: "incl. write",
      instructions: "Instructions",
      systemPrompt: "System prompt",
      systemMessage: "System message",
      trendLegendOther: "other",
      usageSummary: "Key pressure",
      usageSummaryDesc: "Keep the spend shape visible without flooding the page.",
      usageToday: "Today sessions",
      usagePrompt: "Prompt load",
      usageOutput: "Output tokens",
      usageCalls: "API calls",
      usageTrend: "Daily pressure",
      usageTrendDesc: "Watch the daily curve first.",
      usageCache: "Cache profile",
      usageCacheDesc: "See whether cache is really offsetting prompt load.",
      usageLead: "Main driver",
      usageLeadDesc: "Largest model/provider slice in the selected range.",
      usagePeak: "Peak day",
      usagePeakDesc: "Highest prompt-side load in the selected range.",
      usageBreakdown: "Model / provider ranking",
      usageBreakdownDesc: "Sorted by prompt load and cache leverage.",
      skillSummary: "Skill usage",
      skillSummaryDesc: "Focus on what gets used most, what just appeared, and what barely gets touched.",
      totalSkillActions: "Total actions",
      skillLoads: "View count",
      skillEdits: "Manage count",
      distinctSkills: "Active skills",
      skillLead: "Most used today",
      skillLeadDesc: "The skill with the most calls today.",
      skillShare: "Top 3 share",
      skillShareDesc: "See whether traffic is concentrated in only a few skills.",
      skillTrend: "Daily distribution",
      skillTrendDesc: "How much was used each day, and which skills dominated.",
      topSkills: "Skill ranking",
      topSkillsDesc: "Sorted by total usage with share and recent activity.",
      latestSkills: "Recently used",
      latestSkillsDesc: "Sorted by last seen time so new activity surfaces first.",
      leastUsedSkills: "Least used",
      leastUsedSkillsDesc: "Rarely used skills that may be stale or overlooked.",
      unusedSkills: "Unused skills",
      unusedSkillsDesc: "Installed skills with no calls in the selected range.",
      lastUsed: "Recent use",
      share: "Share",
      skillModeTop: "Most used",
      skillModeLatest: "Recently used",
      skillModeLeast: "Least used",
      skillModeUnused: "Unused",
      inspectDesc: "Inspect the exact request body Hermes sent upstream.",
      groupchatTitle: "Group chat",
      groupchatDesc: "Rooms, agents, and message flow in one place.",
      rooms: "Rooms",
      roomList: "Room list",
      roomNamePlaceholder: "New room name",
      createRoom: "Create room",
      roomAgents: "Agents",
      profile: "Profile",
      agentName: "Agent name",
      agentNamePlaceholder: "writer",
      agentDescription: "Description",
      agentDescriptionPlaceholder: "What this agent is for",
      addAgent: "Add agent",
      clearRoom: "Clear room",
      refresh: "Refresh",
      send: "Send",
      messagePlaceholder: "Mention an agent, for example @writer ...",
      noRooms: "No rooms yet.",
      noMessages: "No messages in this room yet.",
      useMentionsHint: "Mention an agent by exact handle to trigger a reply.",
      queued: "queued",
      pending: "pending",
      failed: "failed",
      todayWord: "today",
      roomMessages: "Messages",
      roomMembers: "Members",
      createRoomFailed: "Create room failed",
      addAgentFailed: "Add agent failed",
      sendMessageFailed: "Send message failed",
      refreshFailed: "Refresh failed",
      clearRoomConfirm: "Clear all messages in this room?",
      sendShortcutHint: "Enter to send · Shift+Enter for a new line",
      noMentionMatch: "No matching agents",
      movedNotice: "This plugin is now merged into Hermes Web > GroupChat.",
    },
    zh: {
      usage: "用量",
      skills: "技能",
      requestBodies: "请求体",
      groupchat: "群聊",
      hideSidebar: "收起侧栏",
      showSidebar: "显示侧栏",
      overview: "概览",
      activity: "活跃变化",
      distribution: "分布",
      search: "搜索",
      searchPlaceholder: "搜索 session id、标题或首条用户消息",
      sessions: "会话",
      requestBodiesTitle: "请求体",
      requestDetail: "请求详情",
      promptEnvelope: "Prompt 外层结构",
      messages: "消息",
      rawRequestJson: "原始请求 JSON",
      toolSchemas: "工具 schema",
      selectedSession: "当前会话",
      selectedTotal: "当前总量",
      turn: "轮次",
      api: "API",
      prev: "上一页",
      next: "下一页",
      none: "无",
      unknown: "未知",
      chars: "字符",
      msgs: "条消息",
      schemas: "个 schema",
      tok: "tokens",
      calls: "调用",
      total: "总计",
      system: "系统",
      prefill: "预填充",
      tools: "工具",
      apiMessages: "API 消息",
      history: "历史",
      injectedCtx: "注入上下文",
      mode: "模式",
      firstTurn: "首轮",
      noUsageRows: "这段时间没有用量记录。",
      noSkillData: "这段时间没有技能记录。",
      noSessionData: "这段时间没有会话数据。",
      noSnapshotsYet: "暂时还没有记录到请求快照。",
      noSnapshotsForSession: "这个会话没有请求快照。",
      selectSessionFirst: "请先选择一个会话。",
      selectRequestDetail: "选择一个请求，查看 Hermes 实际发往上游的请求体。",
      loadingUsage: "正在读取用量数据...",
      loadingSkills: "正在读取技能数据...",
      loadingSessions: "正在加载会话...",
      loadingRequests: "正在加载请求...",
      loadingRequestDetail: "正在加载请求详情...",
      noSeparatePromptBlock: "这个请求没有独立的 system/instructions 区块。",
      noMessageArray: "这个请求 payload 中没有 message 数组。",
      fullRequestEstimate: "完整请求估算",
      memoryPluginAdditions: "memory/plugin 注入",
      showingZero: "显示 0 条",
      showingRange: "显示 {start} - {end}",
      rising: "较前一日",
      sessionsStarted: "已开始会话",
      inputTokens: "输入 tokens",
      outputTokens: "输出 tokens",
      reasoning: "推理",
      apiCalls: "API 调用",
      promptSideTotalLabel: "提示侧总量",
      cacheReadLabel: "缓存读取",
      hitRate: "命中率",
      readVsInput: "读取/输入",
      cacheReadOverInput: "cache_read_tokens / input_tokens",
      hitRateInclWrite: "含写入命中率",
      hitRateInclWriteHint: "cache_read / (input + read + write)",
      hitRateInclWriteShort: "含写入",
      instructions: "Instructions",
      systemPrompt: "System prompt",
      systemMessage: "System message",
      trendLegendOther: "其他",
      usageSummary: "核心压力",
      usageSummaryDesc: "先看关键指标，再决定往下钻哪里。",
      usageToday: "今日会话",
      usagePrompt: "提示侧负载",
      usageOutput: "输出 tokens",
      usageCalls: "API 调用",
      usageTrend: "每日压力",
      usageTrendDesc: "先看每天变化，再看明细排行。",
      usageCache: "缓存画像",
      usageCacheDesc: "判断缓存到底有没有帮你扛住 prompt 压力。",
      usageLead: "主要来源",
      usageLeadDesc: "当前范围内占比最大的 model/provider 组合。",
      usagePeak: "峰值日期",
      usagePeakDesc: "当前范围内提示侧负载最高的一天。",
      usageBreakdown: "模型 / 提供方排行",
      usageBreakdownDesc: "按提示侧负载排序，顺带看缓存效果。",
      skillSummary: "技能使用",
      skillSummaryDesc: "看哪些技能最常用，调用会不会扎堆，这几天有没有变化。",
      totalSkillActions: "总使用次数",
      skillLoads: "查看次数",
      skillEdits: "管理次数",
      distinctSkills: "活跃技能数",
      unusedSkillCount: "未使用技能",
      skillLead: "今日最常用",
      skillLeadDesc: "今天调用最多的技能。",
      skillShare: "前三占比",
      skillShareDesc: "看调用是不是集中在少数技能。",
      skillTrend: "每日分布",
      skillTrendDesc: "每天用了多少、主要用了哪些技能。",
      topSkills: "技能排行",
      topSkillsDesc: "按使用次数排序，并显示占比和最近使用时间。",
      latestSkills: "最近使用",
      latestSkillsDesc: "按最近使用时间排序，优先看到刚冒出来的技能。",
      leastUsedSkills: "最少使用",
      leastUsedSkillsDesc: "按使用次数从低到高排序，方便找冷门技能。",
      unusedSkills: "未使用",
      unusedSkillsDesc: "当前已安装、但在所选时间范围内完全没有被调用的技能。",
      lastUsed: "最近使用",
      share: "占比",
      skillModeTop: "调用最多",
      skillModeLatest: "最近使用",
      skillModeLeast: "最少使用",
      skillModeUnused: "未使用",
      inspectDesc: "查看 Hermes 实际发往上游的请求体，定位 system prompt、prefill、memory 注入和工具 schema。",
      groupchatTitle: "群聊",
      groupchatDesc: "把房间、成员和消息流放到同一个工作台里。",
      rooms: "房间",
      roomList: "房间列表",
      roomNamePlaceholder: "新房间名称",
      createRoom: "创建房间",
      roomAgents: "成员",
      profile: "Profile",
      agentName: "Agent 名称",
      agentNamePlaceholder: "writer",
      agentDescription: "说明",
      agentDescriptionPlaceholder: "这个 agent 负责什么",
      addAgent: "添加成员",
      clearRoom: "清空房间",
      refresh: "刷新",
      send: "发送",
      messagePlaceholder: "输入消息；如果要触发 agent，请直接 @writer 之类地提及它",
      noRooms: "还没有房间。",
      noMessages: "这个房间还没有消息。",
      useMentionsHint: "只有精确 @ 到成员名时，才会触发对应 agent 回复。",
      queued: "已排队",
      pending: "处理中",
      failed: "失败",
      todayWord: "今天",
      roomMessages: "消息数",
      roomMembers: "成员数",
      createRoomFailed: "创建房间失败",
      addAgentFailed: "添加成员失败",
      sendMessageFailed: "发送消息失败",
      refreshFailed: "刷新失败",
      clearRoomConfirm: "确认清空这个房间的全部消息吗？",
      sendShortcutHint: "Enter 发送，Shift+Enter 换行",
      noMentionMatch: "没有匹配的成员",
      movedNotice: "这个插件已经并入 Hermes Web > 群聊。",
    },
  };

  I18N["zh-hant"] = Object.assign({}, I18N.zh, {
    requestBodies: "請求體",
    hideSidebar: "收起側欄",
    showSidebar: "顯示側欄",
    activity: "活躍變化",
    distribution: "分佈",
    requestDetail: "請求詳情",
    rawRequestJson: "原始請求 JSON",
    selectedSession: "目前會話",
    selectedTotal: "目前總量",
    prev: "上一頁",
    next: "下一頁",
    noUsageRows: "這段時間沒有用量記錄。",
    noSkillData: "這段時間沒有技能記錄。",
    noSessionData: "這段時間沒有會話資料。",
    selectSessionFirst: "請先選擇一個會話。",
    selectRequestDetail: "選擇一個請求，查看 Hermes 實際送往上游的請求體。",
    loadingUsage: "正在讀取用量資料...",
    loadingSkills: "正在讀取技能資料...",
    showingZero: "顯示 0 筆",
    rising: "較前一日",
    usageSummaryDesc: "先看關鍵指標，再決定往下鑽哪裡。",
    usageTrendDesc: "先看每天變化，再看明細排行。",
    skillSummary: "技能使用",
    totalSkillActions: "總使用次數",
    skillLoads: "查看次數",
    skillEdits: "管理次數",
    distinctSkills: "活躍技能數",
    unusedSkillCount: "未使用技能",
    skillLead: "今日最常用",
    skillLeadDesc: "今天呼叫最多的技能。",
    skillShare: "前三占比",
    skillShareDesc: "看呼叫是不是集中在少數技能。",
    skillTrend: "每日分佈",
    topSkills: "技能排行",
    latestSkills: "最近使用",
    leastUsedSkills: "最少使用",
    unusedSkills: "未使用",
    lastUsed: "最近使用",
    skillModeTop: "呼叫最多",
    skillModeLatest: "最近使用",
    skillModeLeast: "最少使用",
    skillModeUnused: "未使用",
    inspectDesc: "查看 Hermes 實際送往上游的請求體，定位 system prompt、prefill、memory 注入和工具 schema。",
    groupchatTitle: "群聊",
    groupchatDesc: "把房間、成員和訊息流放到同一個工作台裡。",
    roomList: "房間列表",
    createRoom: "建立房間",
    roomAgents: "成員",
    agentDescriptionPlaceholder: "這個 agent 負責什麼",
    addAgent: "新增成員",
    clearRoom: "清空房間",
    noRooms: "還沒有房間。",
    noMessages: "這個房間還沒有訊息。",
    useMentionsHint: "只有精確 @ 到成員名時，才會觸發對應 agent 回覆。",
    queued: "已排隊",
    pending: "處理中",
    failed: "失敗",
    refreshFailed: "重新整理失敗",
    clearRoomConfirm: "確認清空這個房間的全部訊息嗎？",
    sendShortcutHint: "Enter 發送，Shift+Enter 換行",
    noMentionMatch: "沒有匹配的成員",
    movedNotice: "這個外掛已經併入 Hermes Web > 群聊。",
  });

  const SKILL_COLORS = ["c1", "c2", "c3", "c4", "c5", "c6"];

  function normalizeLocale(locale) {
    const raw = String(locale || "").trim().toLowerCase().replace(/_/g, "-");
    if (!raw) return "en";
    if (raw === "zh-hant" || raw === "zh-tw" || raw === "zh-hk" || raw === "zh-mo") return "zh-hant";
    if (raw === "zh" || raw.startsWith("zh-")) return "zh";
    if (raw.startsWith("en")) return "en";
    return "en";
  }

  function useLocalI18n() {
    const i18n = typeof SDK.useI18n === "function" ? SDK.useI18n() : null;
    const locale = normalizeLocale(i18n && i18n.locale);
    const messages = I18N[locale] || I18N.en;
    function t(key, vars) {
      let text = Object.prototype.hasOwnProperty.call(messages, key) ? messages[key] : I18N.en[key] || key;
      if (vars && typeof text === "string") {
        for (const name of Object.keys(vars)) {
          text = text.replace(new RegExp("\\{" + name + "\\}", "g"), String(vars[name]));
        }
      }
      return text;
    }
    return { locale, t };
  }

  function api(path, options) {
    return SDK.fetchJSON("/api/plugins/hermes-web" + path, options);
  }

  function groupchatApi(path, options) {
    return SDK.fetchJSON("/api/plugins/groupchat" + path, options);
  }

  function postJson(fetcher, path, body) {
    return fetcher(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
  }

  function safeNumber(value) {
    const n = Number(value || 0);
    return Number.isFinite(n) ? n : 0;
  }

  function fmtInt(value, locale) {
    return safeNumber(value).toLocaleString(locale || "en");
  }

  function fmtCompact(value, locale) {
    const n = safeNumber(value);
    const abs = Math.abs(n);
    const units = [
      { min: 1e12, suffix: "T" },
      { min: 1e9, suffix: "B" },
      { min: 1e6, suffix: "M" },
      { min: 1e3, suffix: "K" },
    ];
    for (const unit of units) {
      if (abs >= unit.min) {
        const scaled = n / unit.min;
        const digits = Math.abs(scaled) >= 100 ? 0 : Math.abs(scaled) >= 10 ? 1 : 2;
        return scaled.toFixed(digits).replace(/\.0+$|(\.\d*[1-9])0+$/, "$1") + unit.suffix;
      }
    }
    return fmtInt(n, locale);
  }

  function fmtMaybe(value, locale) {
    if (value === null || value === undefined || value === "") return "0";
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    return fmtInt(n, locale);
  }

  function fmtMaybeCompact(value, locale) {
    if (value === null || value === undefined || value === "") return "0";
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    return fmtCompact(n, locale);
  }

  function fmtPct(value, locale) {
    return new Intl.NumberFormat(locale || "en", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(safeNumber(value) / 100);
  }

  function fmtRatio(value, locale) {
    return new Intl.NumberFormat(locale || "en", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeNumber(value)) + "x";
  }

  function fmtDelta(current, previous, locale) {
    if (!previous) return null;
    const diff = safeNumber(current) - safeNumber(previous);
    const pct = previous ? (diff / previous) * 100 : 0;
    const sign = diff > 0 ? "+" : "";
    return sign + fmtInt(diff, locale) + " / " + sign + fmtPct(pct, locale);
  }

  function fmtTime(ts, locale, fallbackText) {
    if (!ts) return fallbackText || "unknown";
    try {
      return new Date(Number(ts) * 1000).toLocaleString(locale || "en");
    } catch (_) {
      return String(ts);
    }
  }

  function previewText(value) {
    if (!value) return "";
    const raw = typeof value === "string" ? value : JSON.stringify(value);
    return raw.length > 140 ? raw.slice(0, 140) + "..." : raw;
  }

  function jsonText(value) {
    try {
      return JSON.stringify(value, null, 2);
    } catch (_) {
      return String(value);
    }
  }

  function contentText(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    return jsonText(value);
  }

  function shortId(value) {
    if (!value) return "";
    return String(value).slice(0, 12);
  }

  function extractMessages(payload) {
    if (!payload || typeof payload !== "object") return [];
    if (Array.isArray(payload.messages)) return payload.messages;
    if (Array.isArray(payload.input)) return payload.input;
    return [];
  }

  function extractPromptSections(payload, t) {
    const sections = [];
    if (!payload || typeof payload !== "object") return sections;
    if (payload.instructions) {
      sections.push({ key: "instructions", label: t("instructions"), content: payload.instructions });
    }
    if (payload.system) {
      sections.push({ key: "system", label: t("systemPrompt"), content: payload.system });
    }
    if (Array.isArray(payload.messages) && payload.messages.length > 0) {
      const first = payload.messages[0];
      if (first && first.role === "system") {
        sections.push({ key: "messages-system", label: t("systemMessage"), content: first.content });
      }
    }
    return sections;
  }

  function usageTone(value) {
    const n = safeNumber(value);
    if (n >= 90) return "dbg-metric-tone-mint";
    if (n >= 60) return "dbg-metric-tone-blue";
    return "dbg-metric-tone-accent";
  }

  function tokenTone(value) {
    const n = safeNumber(value);
    if (n >= 30000) return "border-red-500/50 text-red-200";
    if (n >= 15000) return "border-amber-500/50 text-amber-200";
    return "border-current/20 text-muted-foreground";
  }

  function dominantUsageRow(grouped) {
    if (!Array.isArray(grouped) || grouped.length === 0) return null;
    return grouped.slice().sort(function (a, b) {
      return safeNumber(b.prompt_side_total) - safeNumber(a.prompt_side_total);
    })[0];
  }

  function peakUsageDay(byDay) {
    if (!Array.isArray(byDay) || byDay.length === 0) return null;
    return byDay.slice().sort(function (a, b) {
      return safeNumber(b.prompt_side_total) - safeNumber(a.prompt_side_total);
    })[0];
  }

  function latestDay(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows[rows.length - 1] || null;
  }

  function previousDay(rows) {
    if (!Array.isArray(rows) || rows.length < 2) return null;
    return rows[rows.length - 2] || null;
  }

  function topSkillsShare(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return 0;
    const total = rows.reduce(function (sum, row) {
      return sum + safeNumber(row.total_count);
    }, 0);
    if (!total) return 0;
    const topThree = rows.slice().sort(function (a, b) {
      return safeNumber(b.total_count) - safeNumber(a.total_count);
    }).slice(0, 3).reduce(function (sum, row) {
      return sum + safeNumber(row.total_count);
    }, 0);
    return (topThree / total) * 100;
  }

  function sortSkills(rows, mode) {
    const list = Array.isArray(rows) ? rows.slice() : [];
    if (mode === "unused") {
      return list.sort(function (a, b) {
        return String(a.skill || "").localeCompare(String(b.skill || ""));
      });
    }
    if (mode === "latest") {
      return list.sort(function (a, b) {
        return safeNumber(b.last_used_at) - safeNumber(a.last_used_at) ||
          safeNumber(b.total_count) - safeNumber(a.total_count);
      });
    }
    if (mode === "least") {
      return list.sort(function (a, b) {
        return safeNumber(a.total_count) - safeNumber(b.total_count) ||
          safeNumber(b.last_used_at) - safeNumber(a.last_used_at);
      });
    }
    return list.sort(function (a, b) {
      return safeNumber(b.total_count) - safeNumber(a.total_count) ||
        safeNumber(b.view_count) - safeNumber(a.view_count) ||
        safeNumber(b.manage_count) - safeNumber(a.manage_count);
    });
  }

  function metricCard(props) {
    return h(
      "div",
      { className: cn("dbg-metric", props.tone) },
      h("div", { className: "dbg-metric-label" }, props.label),
      h("div", { className: "dbg-metric-value" }, props.value),
      props.hint ? h("div", { className: "dbg-metric-hint" }, props.hint) : null,
    );
  }

  function panel(props) {
    return h(
      Card,
      { className: cn("dbg-panel", props.hero ? "dbg-panel-hero" : "", props.className) },
      props.header
        ? h(
            "div",
            { className: "dbg-panel-header" },
            h("div", { className: "dbg-panel-title-block" },
              props.kicker ? h("div", { className: "dbg-panel-kicker" }, props.kicker) : null,
              h("div", { className: "dbg-panel-title" }, props.header),
              props.subheader ? h("div", { className: "dbg-panel-subtitle" }, props.subheader) : null,
            ),
            props.actions || null,
          )
        : null,
      h("div", { className: cn("dbg-body", props.bodyClassName) }, props.children),
    );
  }

  function rangeSwitch(days, setDays) {
    return h(
      "div",
      { className: "dbg-range-switch" },
      [1, 7, 30].map(function (value) {
        return h(
          Button,
          {
            key: value,
            className: "dbg-range-btn",
            variant: days === value ? "default" : "outline",
            onClick: function () { setDays(value); },
          },
          value,
          "d",
        );
      }),
    );
  }

  function modeSwitch(options, active, onChange) {
    return h(
      "div",
      { className: "dbg-mode-strip" },
      options.map(function (option) {
        return h(
          "button",
          {
            key: option.id,
            type: "button",
            className: cn("dbg-mode-btn", active === option.id ? "is-active" : ""),
            onClick: function () { onChange(option.id); },
          },
          option.label,
        );
      }),
    );
  }

  function progressBar(value, className) {
    return h(
      "div",
      { className: "dbg-progress" },
      h("div", {
        className: cn("dbg-progress-bar", className),
        style: { width: Math.max(0, Math.min(100, safeNumber(value))) + "%" },
      }),
    );
  }

  function usageRow(props) {
    const row = props.row;
    const promptPct = props.maxPromptSide ? (safeNumber(row.prompt_side_total) / props.maxPromptSide) * 100 : 0;
    return h(
      "div",
      { className: "dbg-row dbg-usage-row" },
      h("div", { className: "dbg-row-main" },
        h("div", { className: "dbg-row-title" }, row.model || props.t("unknown")),
        h("div", { className: "dbg-row-meta" }, row.provider || props.t("unknown")),
        h("div", { className: "dbg-row-copy" }, fmtCompact(row.sessions_started, props.locale), " ", props.t("sessions"), " · ", fmtCompact(row.api_calls, props.locale), " ", props.t("calls")),
      ),
      h("div", { className: "dbg-row-cluster" },
        progressBar(promptPct),
        h("div", { className: "dbg-row-copy" },
          fmtCompact(row.prompt_side_total, props.locale), " ", props.t("promptSideTotalLabel"),
          " · ", fmtPct(row.cache_hit_rate_pct, props.locale), " ", props.t("hitRate"),
          " · ", fmtRatio(row.cache_read_vs_input_ratio, props.locale),
        ),
      ),
      h("div", { className: "dbg-row-aside" },
        h("div", { className: "dbg-token" }, fmtCompact(row.input_tokens, props.locale)),
        h("div", null, props.t("inputTokens")),
      ),
    );
  }

  function usageDayRow(props) {
    const row = props.row;
    const promptPct = props.maxPromptSide ? (safeNumber(row.prompt_side_total) / props.maxPromptSide) * 100 : 0;
    const delta = props.previous ? fmtDelta(row.sessions_started, props.previous.sessions_started, props.locale) : null;
    return h(
      "div",
      { className: "dbg-row dbg-day-row" },
      h("div", { className: "dbg-row-main" },
        h("div", { className: "dbg-row-title" }, row.day),
        h("div", { className: "dbg-row-meta" }, fmtCompact(row.sessions_started, props.locale), " ", props.t("sessions")),
      ),
      h("div", { className: "dbg-row-cluster" },
        progressBar(promptPct, "is-mint"),
        h("div", { className: "dbg-row-copy" },
          fmtCompact(row.prompt_side_total, props.locale), " ", props.t("promptSideTotalLabel"),
          " · ", fmtPct(row.cache_hit_rate_pct, props.locale), " ", props.t("hitRate"),
          " · ", fmtCompact(row.api_calls, props.locale), " ", props.t("apiCalls"),
        ),
      ),
      h("div", { className: "dbg-row-aside" },
        h("div", { className: "dbg-token" }, delta || "—"),
        h("div", null, props.t("rising")),
      ),
    );
  }

  function buildSkillSegments(skills, total, t, locale) {
    const list = Array.isArray(skills) ? skills.slice(0, 5) : [];
    const knownTotal = list.reduce(function (sum, skill) {
      return sum + safeNumber(skill.total_count);
    }, 0);
    const segments = list.map(function (skill, index) {
      return {
        label: skill.skill,
        total: safeNumber(skill.total_count),
        pct: total ? (safeNumber(skill.total_count) / total) * 100 : 0,
        className: SKILL_COLORS[index] || "c6",
      };
    });
    if (total > knownTotal) {
      segments.push({
        label: t("trendLegendOther"),
        total: total - knownTotal,
        pct: total ? ((total - knownTotal) / total) * 100 : 0,
        className: "c6",
      });
    }
    return segments.map(function (segment) {
      return h("div", {
        key: segment.label,
        className: "dbg-segment " + segment.className,
        style: { width: Math.max(segment.pct, segment.total > 0 ? 1 : 0) + "%" },
        title: segment.label + ": " + fmtInt(segment.total, locale),
      });
    });
  }

  function skillDayRow(props) {
    const row = props.row;
    const skills = Array.isArray(row.skills) ? row.skills : [];
    const lead = skills[0] || null;
    const delta = props.previous ? fmtDelta(row.total_count, props.previous.total_count, props.locale) : null;
    return h(
      "div",
      { className: "dbg-row dbg-day-row" },
      h("div", { className: "dbg-row-main" },
        h("div", { className: "dbg-row-title" }, row.date),
        h("div", { className: "dbg-row-meta" }, fmtCompact(row.total_count, props.locale), " ", props.t("calls")),
      ),
      h("div", { className: "dbg-row-cluster" },
        h("div", { className: "dbg-segments", title: skills.map(function (skill) {
          return skill.skill + ": " + fmtInt(skill.total_count, props.locale);
        }).join("\n") }, buildSkillSegments(skills, safeNumber(row.total_count), props.t, props.locale)),
        h("div", { className: "dbg-row-copy" },
          fmtCompact(row.view_count, props.locale), " ", props.t("skillLoads"),
          " · ", fmtCompact(row.manage_count, props.locale), " ", props.t("skillEdits"),
          lead ? " · " + lead.skill : "",
        ),
      ),
      h("div", { className: "dbg-row-aside" },
        h("div", { className: "dbg-token" }, delta || "—"),
        h("div", null, props.t("activity")),
      ),
    );
  }

  function skillRankRow(props) {
    const row = props.row;
    const pct = props.maxTotal ? (safeNumber(row.total_count) / props.maxTotal) * 100 : 0;
    const isUnused = props.mode === "unused";
    return h(
      "div",
      { className: "dbg-row dbg-rank-row" },
      h("div", { className: "dbg-row-main" },
        h("div", { className: "dbg-row-title" }, row.skill || props.t("unknown")),
        h("div", { className: "dbg-row-meta" },
          isUnused
            ? props.t("unusedSkillsDesc")
            : props.t("lastUsed") + " · " + fmtTime(row.last_used_at, props.locale, props.t("unknown")),
        ),
      ),
      h("div", { className: "dbg-row-cluster" },
        progressBar(isUnused ? 0 : pct, "is-blue"),
        h("div", { className: "dbg-row-copy" },
          isUnused
            ? props.t("unusedSkills")
            : fmtCompact(row.view_count, props.locale) + " " + props.t("skillLoads") +
              " · " + fmtCompact(row.manage_count, props.locale) + " " + props.t("skillEdits") +
              " · " + fmtPct(row.percentage, props.locale),
        ),
      ),
      h("div", { className: "dbg-row-aside" },
        h("div", { className: "dbg-token" }, isUnused ? "0" : fmtCompact(row.total_count, props.locale)),
        h("div", null, isUnused ? props.t("calls") : props.t("calls")),
      ),
    );
  }

  function messageBlock(props) {
    return h(
      "div",
      { className: "dbg-panel" },
      h("div", { className: "dbg-body" },
        h("div", { className: "dbg-pill-row" },
          h(Badge, { variant: "outline", className: "dbg-badge" }, props.role || props.t("unknown")),
          props.index !== undefined
            ? h(Badge, { variant: "outline", className: "dbg-badge" }, "#", props.index + 1)
            : null,
        ),
        h("pre", { className: "dbg-code" }, contentText(props.content)),
      ),
    );
  }

  function detailPane(detail, t, locale) {
    if (!detail) {
      return panel({
        header: t("requestDetail"),
        kicker: t("requestBodies"),
        subheader: t("selectRequestDetail"),
        children: h("div", { className: "dbg-empty" }, t("selectRequestDetail")),
      });
    }

    const payload = detail.request_payload || {};
    const summary = detail.request_summary || {};
    const messages = extractMessages(payload);
    const promptSections = extractPromptSections(payload, t);
    const tools = payload.tools;

    return h(
      "div",
      { className: "dbg-stack" },
      panel({
        kicker: t("requestBodies"),
        header: t("requestDetail"),
        subheader: t("turn") + " " + (detail.turn_index || "?") + " · " + t("api") + " " + (detail.api_call_index || "?") + " · " + fmtTime(detail.request_started_at, locale, t("unknown")),
        children: h(
          "div",
          { className: "dbg-stack" },
          h("div", { className: "dbg-detail-grid" },
            metricCard({
              label: t("total"),
              value: fmtMaybe(detail.approx_total_tokens, locale),
              hint: t("fullRequestEstimate"),
              tone: "dbg-metric-tone-accent",
            }),
            metricCard({
              label: t("system"),
              value: fmtMaybe(detail.approx_system_tokens, locale),
              hint: fmtInt(summary.effective_system_chars || 0, locale) + " " + t("chars"),
              tone: "dbg-metric-tone-pink",
            }),
            metricCard({
              label: t("prefill"),
              value: fmtMaybe(detail.approx_prefill_tokens, locale),
              hint: fmtMaybe(detail.prefill_count, locale) + " " + t("msgs"),
              tone: "dbg-metric-tone-blue",
            }),
            metricCard({
              label: t("tools"),
              value: fmtMaybe(detail.approx_tools_tokens, locale),
              hint: fmtMaybe(detail.tool_count, locale) + " " + t("schemas"),
              tone: "dbg-metric-tone-mint",
            }),
          ),
          h("div", { className: "dbg-detail-grid" },
            metricCard({
              label: t("apiMessages"),
              value: fmtMaybe(detail.approx_message_tokens, locale),
              hint: fmtMaybe(detail.message_count, locale) + " " + t("msgs"),
            }),
            metricCard({
              label: t("history"),
              value: fmtMaybe(detail.approx_history_tokens, locale),
              hint: fmtMaybe(detail.history_message_count, locale) + " " + t("msgs"),
            }),
            metricCard({
              label: t("injectedCtx"),
              value: fmtMaybe(detail.approx_injected_context_tokens, locale),
              hint: t("memoryPluginAdditions"),
            }),
            metricCard({
              label: t("mode"),
              value: detail.api_mode || "chat",
              hint: detail.provider || t("unknown"),
            }),
          ),
          h("div", { className: "dbg-pill-row" },
            summary.has_memory_context ? h(Badge, { variant: "outline" }, "memory ctx ", fmtInt(summary.memory_context_chars || 0, locale), "c") : null,
            summary.has_plugin_context ? h(Badge, { variant: "outline" }, "plugin ctx ", fmtInt(summary.plugin_context_chars || 0, locale), "c") : null,
            detail.is_first_turn ? h(Badge, { variant: "outline" }, t("firstTurn")) : null,
          ),
        ),
      }),
      panel({
        kicker: t("distribution"),
        header: t("promptEnvelope"),
        children:
          promptSections.length === 0
            ? h("div", { className: "dbg-empty" }, t("noSeparatePromptBlock"))
            : h("div", { className: "dbg-stack" }, promptSections.map(function (section, index) {
                return h(messageBlock, {
                  key: section.key || index,
                  role: section.label,
                  content: section.content,
                  t: t,
                });
              })),
      }),
      panel({
        kicker: t("activity"),
        header: t("messages"),
        children:
          messages.length === 0
            ? h("div", { className: "dbg-empty" }, t("noMessageArray"))
            : h("div", { className: "dbg-stack" }, messages.map(function (msg, index) {
                return h(messageBlock, {
                  key: index,
                  index: index,
                  role: msg.role || msg.type || t("unknown"),
                  content: msg.content !== undefined ? msg.content : msg,
                  t: t,
                });
              })),
      }),
      panel({
        kicker: t("distribution"),
        header: t("rawRequestJson"),
        children: h("pre", { className: "dbg-code" }, jsonText(payload)),
      }),
      tools
        ? panel({
            kicker: t("distribution"),
            header: t("toolSchemas"),
            children: h("pre", { className: "dbg-code" }, jsonText(tools)),
          })
        : null,
    );
  }

  function UsageTab() {
    const i18n = useLocalI18n();
    const t = i18n.t;
    const locale = i18n.locale;
    const [days, setDays] = useState(7);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(function () {
      setLoading(true);
      setError("");
      api("/usage?days=" + encodeURIComponent(String(days)))
        .then(function (data) {
          setUsage(data);
        })
        .catch(function (err) {
          setError(String(err));
          setUsage(null);
        })
        .finally(function () {
          setLoading(false);
        });
    }, [days]);

    const totals = usage && usage.totals ? usage.totals : null;
    const grouped = usage && Array.isArray(usage.by_model_provider) ? usage.by_model_provider : [];
    const byDay = usage && Array.isArray(usage.by_day) ? usage.by_day : [];
    const lead = dominantUsageRow(grouped);
    const peak = peakUsageDay(byDay);
    const today = latestDay(byDay);
    const prev = previousDay(byDay);
    const maxPromptSide = Math.max.apply(null, byDay.map(function (row) {
      return safeNumber(row.prompt_side_total);
    }).concat([0]));
    const maxGroupedPromptSide = Math.max.apply(null, grouped.map(function (row) {
      return safeNumber(row.prompt_side_total);
    }).concat([0]));

    return h(
      "div",
      { className: "dbg-shell" },
      panel({
        kicker: t("overview"),
        header: t("usageSummary"),
        subheader: t("usageSummaryDesc"),
        actions: rangeSwitch(days, setDays),
        children: h(
          "div",
          { className: "dbg-stack" },
          error ? h("div", { className: "dbg-error" }, error) : null,
          h("div", { className: "dbg-grid dbg-grid-hero" },
            metricCard({
              label: t("usageToday"),
              value: loading ? "..." : fmtCompact(today && today.sessions_started, locale),
              hint: today && prev ? (fmtDelta(today.sessions_started, prev.sessions_started, locale) || "—") + " " + t("rising") : (usage ? usage.date_from + " to " + usage.date_to : ""),
              tone: "dbg-metric-tone-accent",
            }),
            metricCard({
              label: t("usagePrompt"),
              value: loading ? "..." : fmtCompact(totals && totals.prompt_side_total, locale),
              hint: totals ? fmtCompact(totals.input_tokens, locale) + " " + t("inputTokens") + " · " + fmtCompact(totals.cache_read_tokens, locale) + " " + t("cacheReadLabel") : "",
              tone: "dbg-metric-tone-mint",
            }),
            metricCard({
              label: t("usageOutput"),
              value: loading ? "..." : fmtCompact(totals && totals.output_tokens, locale),
              hint: totals ? fmtCompact(totals.reasoning_tokens, locale) + " " + t("reasoning") : "",
              tone: "dbg-metric-tone-blue",
            }),
            metricCard({
              label: t("usageCalls"),
              value: loading ? "..." : fmtCompact(totals && totals.api_calls, locale),
              hint: today ? fmtCompact(today.api_calls, locale) + " " + t("apiCalls") + " " + t("todayWord") : "",
              tone: "dbg-metric-tone-pink",
            }),
          ),
        ),
      }),
      h("div", { className: "dbg-grid dbg-grid-two" },
        panel({
          kicker: t("activity"),
          header: t("usageTrend"),
          subheader: t("usageTrendDesc"),
          children:
            loading
              ? h("div", { className: "dbg-empty" }, t("loadingUsage"))
              : byDay.length === 0
                ? h("div", { className: "dbg-empty" }, t("noSessionData"))
                : h("div", { className: "dbg-list" }, byDay.map(function (row, index) {
                    return h(usageDayRow, {
                      key: row.day,
                      row: row,
                      locale: locale,
                      t: t,
                      maxPromptSide: maxPromptSide,
                      previous: index > 0 ? byDay[index - 1] : null,
                    });
                  })),
        }),
        panel({
          kicker: t("distribution"),
          header: t("usageCache"),
          subheader: t("usageCacheDesc"),
          children: h(
            "div",
            { className: "dbg-stack" },
            h("div", { className: "dbg-insight-block" },
              metricCard({
                label: t("cacheReadLabel"),
                value: loading ? "..." : fmtCompact(totals && totals.cache_read_tokens, locale),
                hint: totals ? fmtPct(totals.cache_hit_rate_pct, locale) + " " + t("hitRate") : "",
                tone: loading ? "" : usageTone(totals && totals.cache_hit_rate_pct),
              }),
              metricCard({
                label: t("hitRateInclWrite"),
                value: loading ? "..." : fmtPct(totals && totals.cache_hit_rate_incl_write_pct, locale),
                hint: t("hitRateInclWriteHint"),
                tone: "dbg-metric-tone-blue",
              }),
            ),
            h("div", { className: "dbg-insight-block" },
              h("div", { className: "dbg-section-title" }, t("usageLead")),
              h("div", { className: "dbg-note" }, t("usageLeadDesc")),
              lead
                ? h("div", { className: "dbg-row dbg-day-row" },
                    h("div", { className: "dbg-row-main" },
                      h("div", { className: "dbg-row-title" }, lead.model || t("unknown")),
                      h("div", { className: "dbg-row-meta" }, lead.provider || t("unknown")),
                    ),
                    h("div", { className: "dbg-row-cluster" },
                      progressBar(maxGroupedPromptSide ? (safeNumber(lead.prompt_side_total) / maxGroupedPromptSide) * 100 : 0, "is-blue"),
                      h("div", { className: "dbg-row-copy" }, fmtCompact(lead.prompt_side_total, locale), " ", t("promptSideTotalLabel")),
                    ),
                    h("div", { className: "dbg-row-aside" },
                      h("div", { className: "dbg-token" }, fmtPct(lead.cache_hit_rate_pct, locale)),
                      h("div", null, t("hitRate")),
                    ),
                  )
                : h("div", { className: "dbg-empty" }, t("noUsageRows")),
            ),
            h("div", { className: "dbg-insight-block" },
              h("div", { className: "dbg-section-title" }, t("usagePeak")),
              h("div", { className: "dbg-note" }, t("usagePeakDesc")),
              peak
                ? h("div", { className: "dbg-row dbg-day-row" },
                    h("div", { className: "dbg-row-main" },
                      h("div", { className: "dbg-row-title" }, peak.day),
                      h("div", { className: "dbg-row-meta" }, fmtCompact(peak.sessions_started, locale), " ", t("sessions")),
                    ),
                    h("div", { className: "dbg-row-cluster" },
                      progressBar(100, "is-mint"),
                      h("div", { className: "dbg-row-copy" }, fmtCompact(peak.prompt_side_total, locale), " ", t("promptSideTotalLabel")),
                    ),
                    h("div", { className: "dbg-row-aside" },
                      h("div", { className: "dbg-token" }, fmtCompact(peak.api_calls, locale)),
                      h("div", null, t("apiCalls")),
                    ),
                  )
                : h("div", { className: "dbg-empty" }, t("noSessionData")),
            ),
          ),
        }),
      ),
      panel({
        kicker: t("distribution"),
        header: t("usageBreakdown"),
        subheader: t("usageBreakdownDesc"),
        children:
          loading
            ? h("div", { className: "dbg-empty" }, t("loadingUsage"))
            : grouped.length === 0
              ? h("div", { className: "dbg-empty" }, t("noUsageRows"))
              : h("div", { className: "dbg-list" }, grouped.slice(0, 8).map(function (row, index) {
                  return h(usageRow, {
                    key: (row.provider || "unknown") + ":" + (row.model || "unknown") + ":" + index,
                    row: row,
                    locale: locale,
                    t: t,
                    maxPromptSide: maxGroupedPromptSide,
                  });
                })),
      }),
    );
  }

  function SkillsTab() {
    const i18n = useLocalI18n();
    const t = i18n.t;
    const locale = i18n.locale;
    const [days, setDays] = useState(7);
    const [rankMode, setRankMode] = useState("top");
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(function () {
      setLoading(true);
      setError("");
      api("/skills?days=" + encodeURIComponent(String(days)))
        .then(function (data) {
          setStats(data);
        })
        .catch(function (err) {
          setError(String(err));
          setStats(null);
        })
        .finally(function () {
          setLoading(false);
        });
    }, [days]);

    const summary = stats && stats.summary ? stats.summary : null;
    const byDay = stats && Array.isArray(stats.by_day) ? stats.by_day : [];
    const topSkills = stats && Array.isArray(stats.top_skills) ? stats.top_skills : [];
    const unusedSkills = stats && Array.isArray(stats.unused_skills) ? stats.unused_skills : [];
    const skillRows = rankMode === "unused" ? unusedSkills : topSkills;
    const rankedSkills = useMemo(function () {
      return sortSkills(skillRows, rankMode);
    }, [skillRows, rankMode]);
    const today = latestDay(byDay);
    const prev = previousDay(byDay);
    const topToday = today && Array.isArray(today.skills) && today.skills.length > 0 ? today.skills[0] : null;
    const topShare = topSkillsShare(topSkills);
    const maxSkillTotal = Math.max.apply(null, rankedSkills.map(function (row) {
      return safeNumber(row.total_count);
    }).concat([0]));

    const rankHeader = rankMode === "latest"
      ? t("latestSkills")
      : rankMode === "least"
        ? t("leastUsedSkills")
        : rankMode === "unused"
          ? t("unusedSkills")
        : t("topSkills");
    const rankSubheader = rankMode === "latest"
      ? t("latestSkillsDesc")
      : rankMode === "least"
        ? t("leastUsedSkillsDesc")
        : rankMode === "unused"
          ? t("unusedSkillsDesc")
        : t("topSkillsDesc");

    return h(
      "div",
      { className: "dbg-shell" },
      panel({
        kicker: t("overview"),
        header: t("skillSummary"),
        subheader: t("skillSummaryDesc"),
        actions: rangeSwitch(days, setDays),
        children: h(
          "div",
          { className: "dbg-stack" },
          error ? h("div", { className: "dbg-error" }, error) : null,
          h("div", { className: "dbg-grid dbg-grid-hero" },
            metricCard({
              label: t("totalSkillActions"),
              value: loading ? "..." : fmtCompact(summary && summary.total_skill_actions, locale),
              hint: stats ? stats.date_from + " to " + stats.date_to : "",
              tone: "dbg-metric-tone-accent",
            }),
            metricCard({
              label: t("skillLoads"),
              value: loading ? "..." : fmtCompact(summary && summary.total_skill_loads, locale),
              hint: today ? fmtCompact(today.view_count, locale) + " " + t("todayWord") : "",
              tone: "dbg-metric-tone-mint",
            }),
            metricCard({
              label: t("skillEdits"),
              value: loading ? "..." : fmtCompact(summary && summary.total_skill_edits, locale),
              hint: today ? fmtCompact(today.manage_count, locale) + " " + t("todayWord") : "",
              tone: "dbg-metric-tone-pink",
            }),
            metricCard({
              label: rankMode === "unused" ? t("unusedSkillCount") : t("distinctSkills"),
              value: loading
                ? "..."
                : rankMode === "unused"
                  ? fmtCompact(summary && summary.distinct_skills_unused, locale)
                  : fmtCompact(summary && summary.distinct_skills_used, locale),
              hint: rankMode === "unused"
                ? fmtCompact(summary && summary.distinct_skills_known, locale) + " total"
                : topToday ? topToday.skill : "",
              tone: "dbg-metric-tone-blue",
            }),
          ),
        ),
      }),
      h("div", { className: "dbg-grid dbg-grid-two" },
        panel({
          kicker: t("activity"),
          header: t("skillTrend"),
          subheader: t("skillTrendDesc"),
          children:
            loading
              ? h("div", { className: "dbg-empty" }, t("loadingSkills"))
              : byDay.length === 0
                ? h("div", { className: "dbg-empty" }, t("noSkillData"))
                : h("div", { className: "dbg-list" }, byDay.map(function (row, index) {
                    return h(skillDayRow, {
                      key: row.date,
                      row: row,
                      locale: locale,
                      t: t,
                      previous: index > 0 ? byDay[index - 1] : null,
                    });
                  })),
        }),
        panel({
          kicker: t("distribution"),
          header: t("skillShare"),
          subheader: t("skillShareDesc"),
          children: h(
            "div",
            { className: "dbg-stack" },
            metricCard({
              label: t("share"),
              value: loading ? "..." : fmtPct(topShare, locale),
              hint: topSkills.length ? topSkills.slice(0, 3).map(function (row) { return row.skill; }).join(" · ") : "",
              tone: "dbg-metric-tone-accent",
            }),
            h("div", { className: "dbg-insight-block" },
              h("div", { className: "dbg-section-title" }, t("skillLead")),
              h("div", { className: "dbg-note" }, t("skillLeadDesc")),
              topToday
                ? h("div", { className: "dbg-row dbg-day-row" },
                    h("div", { className: "dbg-row-main" },
                      h("div", { className: "dbg-row-title" }, topToday.skill),
                      h("div", { className: "dbg-row-meta" }, today.date),
                    ),
                    h("div", { className: "dbg-row-cluster" },
                      progressBar(today.total_count ? (safeNumber(topToday.total_count) / safeNumber(today.total_count)) * 100 : 0, "is-blue"),
                      h("div", { className: "dbg-row-copy" },
                        fmtCompact(topToday.view_count, locale), " ", t("skillLoads"),
                        " · ", fmtCompact(topToday.manage_count, locale), " ", t("skillEdits"),
                      ),
                    ),
                    h("div", { className: "dbg-row-aside" },
                      h("div", { className: "dbg-token" }, fmtCompact(topToday.total_count, locale)),
                      h("div", null, t("calls")),
                    ),
                  )
                : h("div", { className: "dbg-empty" }, t("noSkillData")),
            ),
            h("div", { className: "dbg-insight-block" },
              h("div", { className: "dbg-section-title" }, t("activity")),
              h("div", { className: "dbg-note" }, prev ? fmtDelta(today && today.total_count, prev.total_count, locale) || "—" : "—"),
              h("div", { className: "dbg-range-caption" },
                prev ? today.date + " vs " + prev.date : (stats ? stats.date_from + " to " + stats.date_to : ""),
              ),
            ),
          ),
        }),
      ),
      panel({
        kicker: t("distribution"),
        header: rankHeader,
        subheader: rankSubheader,
        actions: modeSwitch([
          { id: "top", label: t("skillModeTop") },
          { id: "latest", label: t("skillModeLatest") },
          { id: "least", label: t("skillModeLeast") },
          { id: "unused", label: t("skillModeUnused") },
        ], rankMode, setRankMode),
        children:
          loading
            ? h("div", { className: "dbg-empty" }, t("loadingSkills"))
            : rankedSkills.length === 0
              ? h("div", { className: "dbg-empty" }, t("noSkillData"))
              : h("div", { className: "dbg-list" }, rankedSkills.slice(0, 10).map(function (row, index) {
                  return h(skillRankRow, {
                    key: (row.skill || "unknown") + ":" + index,
                    row: row,
                    locale: locale,
                    t: t,
                    maxTotal: maxSkillTotal,
                    mode: rankMode,
                  });
                })),
      }),
    );
  }

  function sessionRow(props) {
    const session = props.session;
    return h(
      "button",
      {
        type: "button",
        onClick: function () { props.onSelect(session.id); },
        className: cn("dbg-session-row", props.selected ? "is-selected" : ""),
      },
      h("div", { className: "dbg-row-main" },
        h("div", { className: "dbg-row-title" }, session.title || previewText(session.first_user_message) || session.id),
        h("div", { className: "dbg-row-meta" }, shortId(session.id), " · ", session.source || props.t("unknown")),
      ),
      h("div", { className: "dbg-row-copy" },
        props.t("firstTurn"), ": ",
        props.t("system").toLowerCase(), " ", fmtMaybe(session.first_request_system_tokens, props.locale),
        " · ", props.t("prefill").toLowerCase(), " ", fmtMaybe(session.first_request_prefill_tokens, props.locale),
        " · ", props.t("tools").toLowerCase(), " ", fmtMaybe(session.first_request_tools_tokens, props.locale),
      ),
      h("div", { className: "dbg-pill-row" },
        h(Badge, { variant: "outline", className: tokenTone(session.first_request_tokens) }, fmtMaybe(session.first_request_tokens, props.locale), " ", props.t("tok")),
        h("div", { className: "dbg-note" }, fmtTime(session.last_request_at, props.locale, props.t("unknown"))),
      ),
    );
  }

  function requestRow(props) {
    const row = props.row;
    return h(
      "button",
      {
        type: "button",
        onClick: function () { props.onSelect(row.id); },
        className: cn("dbg-request-row", props.selected ? "is-selected" : ""),
      },
      h("div", { className: "dbg-row-main" },
        h("div", { className: "dbg-row-title" }, props.t("turn"), " ", row.turn_index || "?", " · ", props.t("api"), " ", row.api_call_index || "?"),
        h("div", { className: "dbg-row-meta" }, row.model || props.t("unknown"), " · ", row.api_mode || "chat"),
      ),
      h("div", { className: "dbg-row-copy" },
        props.t("messages").toLowerCase(), " ", fmtMaybe(row.approx_message_tokens, props.locale),
        " · ", props.t("system").toLowerCase(), " ", fmtMaybe(row.approx_system_tokens, props.locale),
        " · ", props.t("tools").toLowerCase(), " ", fmtMaybe(row.approx_tools_tokens, props.locale),
      ),
      h("div", { className: "dbg-pill-row" },
        h(Badge, { variant: "outline", className: tokenTone(row.approx_total_tokens) }, fmtMaybe(row.approx_total_tokens, props.locale), " ", props.t("tok")),
        h("div", { className: "dbg-note" }, fmtTime(row.request_started_at, props.locale, props.t("unknown"))),
      ),
    );
  }

  function RequestsTab() {
    const i18n = useLocalI18n();
    const t = i18n.t;
    const locale = i18n.locale;
    const [query, setQuery] = useState("");
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [sessionOffset, setSessionOffset] = useState(0);
    const [sessionLimit] = useState(20);
    const [sessionsHasMore, setSessionsHasMore] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState("");

    function loadSessions(nextQuery, nextOffset) {
      setSessionsLoading(true);
      setError("");
      api(
        "/sessions?limit=" + encodeURIComponent(String(sessionLimit)) +
        "&offset=" + encodeURIComponent(String(nextOffset || 0)) +
        "&q=" + encodeURIComponent(nextQuery || ""),
      )
        .then(function (data) {
          const rows = Array.isArray(data.sessions) ? data.sessions : [];
          setSessionOffset(Number(data.offset || 0));
          setSessionsHasMore(Boolean(data.has_more));
          setSessions(rows);
          if (rows.length > 0) {
            setSelectedSessionId(function (current) {
              const keep = rows.some(function (row) { return row.id === current; });
              return keep ? current : rows[0].id;
            });
          } else {
            setSelectedSessionId("");
            setRequests([]);
            setSelectedRequestId(null);
            setDetail(null);
          }
        })
        .catch(function (err) {
          setError(String(err));
          setSessions([]);
        })
        .finally(function () {
          setSessionsLoading(false);
        });
    }

    useEffect(function () {
      loadSessions("", 0);
    }, []);

    useEffect(function () {
      if (!selectedSessionId) {
        setRequests([]);
        setSelectedRequestId(null);
        setDetail(null);
        return;
      }
      setRequestsLoading(true);
      api("/sessions/" + encodeURIComponent(selectedSessionId) + "/requests?limit=200")
        .then(function (data) {
          const rows = Array.isArray(data.requests) ? data.requests : [];
          setRequests(rows);
          if (rows.length > 0) {
            setSelectedRequestId(function (current) {
              const keep = rows.some(function (row) { return row.id === current; });
              return keep ? current : rows[0].id;
            });
          } else {
            setSelectedRequestId(null);
            setDetail(null);
          }
        })
        .catch(function (err) {
          setError(String(err));
          setRequests([]);
        })
        .finally(function () {
          setRequestsLoading(false);
        });
    }, [selectedSessionId]);

    useEffect(function () {
      if (!selectedRequestId) {
        setDetail(null);
        return;
      }
      setDetailLoading(true);
      api("/requests/" + encodeURIComponent(String(selectedRequestId)))
        .then(function (data) {
          setDetail(data);
        })
        .catch(function (err) {
          setError(String(err));
          setDetail(null);
        })
        .finally(function () {
          setDetailLoading(false);
        });
    }, [selectedRequestId]);

    const selectedSession = useMemo(function () {
      return sessions.find(function (row) { return row.id === selectedSessionId; }) || null;
    }, [sessions, selectedSessionId]);

    const sessionRangeLabel = useMemo(function () {
      if (sessions.length === 0) return t("showingZero");
      return t("showingRange", {
        start: fmtInt(sessionOffset + 1, locale),
        end: fmtInt(sessionOffset + sessions.length, locale),
      });
    }, [sessions, sessionOffset, locale, t]);

    return h(
      "div",
      { className: "dbg-shell" },
      panel({
        kicker: t("overview"),
        header: t("requestBodiesTitle"),
        subheader: t("inspectDesc"),
        children: h(
          "div",
          { className: "dbg-stack" },
          error ? h("div", { className: "dbg-error" }, error) : null,
          h("div", { className: "dbg-search-row" },
            h(Input, {
              value: query,
              onChange: function (event) { setQuery(event.target.value); },
              placeholder: t("searchPlaceholder"),
            }),
            h(Button, { onClick: function () { loadSessions(query, 0); } }, t("search")),
          ),
          h("div", { className: "dbg-grid dbg-grid-hero" },
            metricCard({
              label: t("sessions"),
              value: sessionsLoading ? "..." : fmtInt(sessions.length, locale),
              hint: sessionRangeLabel,
              tone: "dbg-metric-tone-accent",
            }),
            metricCard({
              label: t("selectedSession"),
              value: selectedSession ? shortId(selectedSession.id) : t("none"),
              hint: selectedSession && selectedSession.title ? selectedSession.title : "",
              tone: "dbg-metric-tone-blue",
            }),
            metricCard({
              label: t("requestBodies"),
              value: requestsLoading ? "..." : fmtInt(requests.length, locale),
              hint: selectedSessionId || "",
              tone: "dbg-metric-tone-mint",
            }),
            metricCard({
              label: t("selectedTotal"),
              value: detailLoading ? "..." : fmtMaybe(detail && detail.approx_total_tokens, locale),
              hint: detail ? t("turn") + " " + (detail.turn_index || "?") + " · " + t("api") + " " + (detail.api_call_index || "?") : "",
              tone: "dbg-metric-tone-pink",
            }),
          ),
        ),
      }),
      h("div", { className: "dbg-grid dbg-grid-three" },
        panel({
          kicker: t("activity"),
          header: t("sessions"),
          subheader: sessionRangeLabel,
          children: h(
            "div",
            { className: "dbg-stack dbg-scroll" },
            h("div", { className: "dbg-pill-row" },
              h(Button, {
                variant: "outline",
                disabled: sessionsLoading || sessionOffset <= 0,
                onClick: function () {
                  const next = Math.max(0, sessionOffset - sessionLimit);
                  loadSessions(query, next);
                },
              }, t("prev")),
              h(Button, {
                variant: "outline",
                disabled: sessionsLoading || !sessionsHasMore,
                onClick: function () {
                  loadSessions(query, sessionOffset + sessionLimit);
                },
              }, t("next")),
            ),
            sessionsLoading
              ? h("div", { className: "dbg-empty" }, t("loadingSessions"))
              : sessions.length === 0
                ? h("div", { className: "dbg-empty" }, t("noSnapshotsYet"))
                : sessions.map(function (session) {
                    return h(sessionRow, {
                      key: session.id,
                      session: session,
                      selected: session.id === selectedSessionId,
                      onSelect: setSelectedSessionId,
                      t: t,
                      locale: locale,
                    });
                  }),
          ),
        }),
        panel({
          kicker: t("activity"),
          header: t("requestBodies"),
          subheader: selectedSessionId ? shortId(selectedSessionId) : t("selectSessionFirst"),
          children: h(
            "div",
            { className: "dbg-stack dbg-scroll" },
            !selectedSessionId
              ? h("div", { className: "dbg-empty" }, t("selectSessionFirst"))
              : requestsLoading
                ? h("div", { className: "dbg-empty" }, t("loadingRequests"))
                : requests.length === 0
                  ? h("div", { className: "dbg-empty" }, t("noSnapshotsForSession"))
                  : requests.map(function (row) {
                      return h(requestRow, {
                        key: row.id,
                        row: row,
                        selected: row.id === selectedRequestId,
                        onSelect: setSelectedRequestId,
                        t: t,
                        locale: locale,
                      });
                    }),
          ),
        }),
        detailLoading
          ? panel({
              kicker: t("distribution"),
              header: t("requestDetail"),
              subheader: t("loadingRequestDetail"),
              children: h("div", { className: "dbg-empty" }, t("loadingRequestDetail")),
            })
          : detailPane(detail, t, locale),
      ),
    );
  }

  function groupchatMessageStatus(message, t) {
    const status = String(message && message.status || "done");
    if (status === "queued") return t("queued");
    if (status === "pending") return t("pending");
    if (status === "error") return t("failed");
    return "";
  }

  function roomRow(props) {
    const room = props.room;
    return h(
      "button",
      {
        type: "button",
        className: cn("dbg-session-row", props.selected ? "is-selected" : ""),
        onClick: function () { props.onSelect(room.id); },
      },
      h("div", { className: "dbg-row-main" },
        h("div", { className: "dbg-row-title" }, room.name || room.id),
        h("div", { className: "dbg-row-meta" }, shortId(room.id)),
      ),
      h("div", { className: "dbg-row-copy" },
        fmtInt(room.agent_count, props.locale), " ", props.t("roomMembers"),
        " · ", fmtInt(room.message_count, props.locale), " ", props.t("roomMessages"),
      ),
      h("div", { className: "dbg-pill-row" },
        h(Badge, { variant: "outline" }, "rev ", fmtInt(room.revision, props.locale)),
        h("div", { className: "dbg-note" }, fmtTime(room.updated_at, props.locale, props.t("unknown"))),
      ),
    );
  }

  function groupMessageRow(props) {
    const message = props.message;
    const statusLabel = groupchatMessageStatus(message, props.t);
    return h(
      "div",
      { className: cn("dbg-chat-row", "is-" + (message.sender_type || "system")) },
      h("div", { className: "dbg-chat-avatar", "aria-hidden": "true" },
        ((message.sender_name || "?").trim().slice(0, 2) || "?").toUpperCase(),
      ),
      h("div", { className: cn("dbg-message-card", "is-" + (message.sender_type || "system")) },
        h("div", { className: "dbg-message-head" },
          h("div", { className: "dbg-message-title" }, message.sender_name || props.t("unknown")),
          h("div", { className: "dbg-message-meta" },
            message.role || props.t("unknown"),
            statusLabel ? " · " + statusLabel : "",
            " · ",
            fmtTime(message.created_at, props.locale, props.t("unknown")),
          ),
        ),
        h("pre", { className: "dbg-message-body" }, contentText(message.content)),
        message.error_text
          ? h("div", { className: "dbg-error dbg-inline-error" }, message.error_text)
          : null,
      ),
    );
  }

  function GroupChatTab() {
    const i18n = useLocalI18n();
    const t = i18n.t;
    const locale = i18n.locale;
    const [snapshot, setSnapshot] = useState(null);
    const [selectedRoomId, setSelectedRoomId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState("");
    const [newRoomName, setNewRoomName] = useState("");
    const [messageDraft, setMessageDraft] = useState("");
    const [agentProfile, setAgentProfile] = useState("");
    const [agentName, setAgentName] = useState("");
    const [agentDescription, setAgentDescription] = useState("");
    const pollRef = useRef(null);
    const messageListRef = useRef(null);
    const composerRef = useRef(null);
    const [mentionState, setMentionState] = useState({
      active: false,
      query: "",
      index: 0,
      start: -1,
    });

    function loadState(roomId, keepLoading) {
      if (keepLoading) setLoading(true);
      setError("");
      return groupchatApi(roomId ? "/state?room_id=" + encodeURIComponent(roomId) : "/state")
        .then(function (data) {
          setSnapshot(data);
          setSelectedRoomId(function (current) {
            if (roomId) return roomId;
            if (current) return current;
            return data.selected_room_id || "";
          });
          const profiles = Array.isArray(data && data.profiles) ? data.profiles : [];
          if (!agentProfile && profiles.length > 0) {
            setAgentProfile(profiles[0].profile || "");
          }
          return data;
        })
        .catch(function (err) {
          setError(String(err));
          throw err;
        })
        .finally(function () {
          if (keepLoading) setLoading(false);
        });
    }

    useEffect(function () {
      loadState("", true).catch(function () {});
    }, []);

    useEffect(function () {
      if (!selectedRoomId) return;
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = window.setInterval(function () {
        loadState(selectedRoomId, false).catch(function () {});
      }, 4000);
      return function () {
        if (pollRef.current) {
          window.clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    }, [selectedRoomId]);

    useEffect(function () {
      if (!snapshot || !snapshot.selected_room_id) return;
      if (!selectedRoomId) {
        setSelectedRoomId(snapshot.selected_room_id);
      }
    }, [snapshot, selectedRoomId]);

    const rooms = snapshot && Array.isArray(snapshot.rooms) ? snapshot.rooms : [];
    const room = snapshot && snapshot.room ? snapshot.room : null;
    const agents = snapshot && Array.isArray(snapshot.agents) ? snapshot.agents : [];
    const messages = snapshot && Array.isArray(snapshot.messages) ? snapshot.messages : [];
    const profiles = snapshot && Array.isArray(snapshot.profiles) ? snapshot.profiles : [];
    const filteredAgents = useMemo(function () {
      const query = String(mentionState.query || "").trim().toLowerCase();
      const list = agents.filter(function (agent) {
        return String(agent.name || "").toLowerCase().includes(query);
      });
      return list.sort(function (a, b) {
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
    }, [agents, mentionState.query]);

    useEffect(function () {
      if (!messageListRef.current) return;
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }, [messages.length, selectedRoomId]);

    function updateMentionState(nextValue, cursorPos) {
      const text = String(nextValue || "");
      let atPos = -1;
      for (let i = cursorPos - 1; i >= 0; i -= 1) {
        const ch = text[i];
        if (ch === "@") {
          atPos = i;
          break;
        }
        if (/\s/.test(ch)) break;
      }
      if (atPos === -1) {
        setMentionState({ active: false, query: "", index: 0, start: -1 });
        return;
      }
      if (atPos > 0 && !/\s/.test(text[atPos - 1])) {
        setMentionState({ active: false, query: "", index: 0, start: -1 });
        return;
      }
      const query = text.slice(atPos + 1, cursorPos);
      if (query.includes(" ") || query.includes("\n")) {
        setMentionState({ active: false, query: "", index: 0, start: -1 });
        return;
      }
      setMentionState(function (current) {
        return {
          active: true,
          query: query,
          start: atPos,
          index: current.query === query ? current.index : 0,
        };
      });
    }

    function applyMention(agentName) {
      const textarea = composerRef.current;
      if (!textarea) return;
      const start = mentionState.start;
      if (start < 0) return;
      const cursor = textarea.selectionStart;
      const before = messageDraft.slice(0, start);
      const after = messageDraft.slice(cursor);
      const next = before + "@" + agentName + " " + after;
      setMessageDraft(next);
      setMentionState({ active: false, query: "", index: 0, start: -1 });
      window.requestAnimationFrame(function () {
        const pos = before.length + agentName.length + 2;
        textarea.focus();
        textarea.setSelectionRange(pos, pos);
      });
    }

    function refresh() {
      return loadState(selectedRoomId, false).catch(function () {
        setError(t("refreshFailed"));
      });
    }

    function createRoom() {
      const name = String(newRoomName || "").trim();
      if (!name) return;
      setBusy("create-room");
      setError("");
      postJson(groupchatApi, "/rooms", { name: name })
        .then(function (data) {
          setNewRoomName("");
          const nextId = data && data.room && data.room.id ? data.room.id : "";
          return loadState(nextId, false);
        })
        .catch(function (err) {
          setError(t("createRoomFailed") + ": " + String(err));
        })
        .finally(function () {
          setBusy("");
        });
    }

    function addAgent() {
      if (!selectedRoomId || !agentProfile) return;
      setBusy("add-agent");
      setError("");
      postJson(groupchatApi, "/rooms/" + encodeURIComponent(selectedRoomId) + "/agents", {
        profile: agentProfile,
        name: agentName || undefined,
        description: agentDescription || "",
      })
        .then(function () {
          setAgentName("");
          setAgentDescription("");
          return loadState(selectedRoomId, false);
        })
        .catch(function (err) {
          setError(t("addAgentFailed") + ": " + String(err));
        })
        .finally(function () {
          setBusy("");
        });
    }

    function sendMessage() {
      const content = String(messageDraft || "").trim();
      if (!selectedRoomId || !content) return;
      setBusy("send-message");
      setError("");
      postJson(groupchatApi, "/rooms/" + encodeURIComponent(selectedRoomId) + "/messages", {
        sender_name: "You",
        content: content,
      })
        .then(function () {
          setMessageDraft("");
          return loadState(selectedRoomId, false);
        })
        .catch(function (err) {
          setError(t("sendMessageFailed") + ": " + String(err));
        })
        .finally(function () {
          setBusy("");
        });
    }

    function onComposerChange(event) {
      const value = event.target.value;
      setMessageDraft(value);
      updateMentionState(value, event.target.selectionStart);
    }

    function onComposerKeyDown(event) {
      if (mentionState.active && filteredAgents.length > 0) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setMentionState(function (current) {
            return Object.assign({}, current, { index: (current.index + 1) % filteredAgents.length });
          });
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setMentionState(function (current) {
            return Object.assign({}, current, { index: (current.index - 1 + filteredAgents.length) % filteredAgents.length });
          });
          return;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          applyMention(filteredAgents[mentionState.index].name);
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setMentionState({ active: false, query: "", index: 0, start: -1 });
          return;
        }
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    }

    function clearRoom() {
      if (!selectedRoomId) return;
      if (!window.confirm(t("clearRoomConfirm"))) return;
      setBusy("clear-room");
      setError("");
      postJson(groupchatApi, "/rooms/" + encodeURIComponent(selectedRoomId) + "/clear", {})
        .then(function () {
          return loadState(selectedRoomId, false);
        })
        .catch(function (err) {
          setError(String(err));
        })
        .finally(function () {
          setBusy("");
        });
    }

    return h(
      "div",
      { className: "dbg-shell" },
      h("div", { className: "dbg-grid dbg-grid-chat" },
        panel({
          kicker: t("distribution"),
          header: t("roomList"),
          subheader: room ? room.name : t("noRooms"),
          className: "dbg-chat-side-panel",
          actions: h("div", { className: "dbg-pill-row" },
            h(Button, {
              variant: "outline",
              disabled: busy === "clear-room",
              onClick: refresh,
            }, t("refresh")),
            h(Button, {
              variant: "outline",
              disabled: !selectedRoomId || busy === "clear-room",
              onClick: clearRoom,
            }, t("clearRoom")),
          ),
          children: h(
            "div",
            { className: "dbg-stack" },
            error ? h("div", { className: "dbg-error" }, error) : null,
            h("div", { className: "dbg-form-row" },
              h(Input, {
                value: newRoomName,
                onChange: function (event) { setNewRoomName(event.target.value); },
                placeholder: t("roomNamePlaceholder"),
              }),
              h(Button, {
                disabled: busy === "create-room" || !String(newRoomName || "").trim(),
                onClick: createRoom,
              }, t("createRoom")),
            ),
            loading
              ? h("div", { className: "dbg-empty" }, t("loadingSessions"))
              : rooms.length === 0
                ? h("div", { className: "dbg-empty" }, t("noRooms"))
                : h("div", { className: "dbg-list dbg-scroll-soft" }, rooms.map(function (roomItem) {
                    return h(roomRow, {
                      key: roomItem.id,
                      room: roomItem,
                      selected: roomItem.id === selectedRoomId,
                      onSelect: function (roomId) {
                        setSelectedRoomId(roomId);
                        loadState(roomId, false).catch(function () {});
                      },
                      locale: locale,
                      t: t,
                    });
                  })),
            h("div", { className: "dbg-divider" }),
            h("div", { className: "dbg-section-title" }, t("roomAgents")),
            h("div", { className: "dbg-note" }, t("useMentionsHint")),
            h("div", { className: "dbg-pill-row" },
              agents.map(function (agent) {
                return h(Badge, { key: agent.id, variant: "outline" }, "@", agent.name, " · ", agent.profile);
              }),
            ),
            h("div", { className: "dbg-form-grid" },
              h("label", { className: "dbg-field" },
                h("span", { className: "dbg-field-label" }, t("profile")),
                h("select", {
                  className: "dbg-select",
                  value: agentProfile,
                  onChange: function (event) { setAgentProfile(event.target.value); },
                }, profiles.map(function (profile) {
                  return h("option", { key: profile.profile, value: profile.profile }, profile.name || profile.profile);
                })),
              ),
              h("label", { className: "dbg-field" },
                h("span", { className: "dbg-field-label" }, t("agentName")),
                h(Input, {
                  value: agentName,
                  onChange: function (event) { setAgentName(event.target.value); },
                  placeholder: t("agentNamePlaceholder"),
                }),
              ),
              h("label", { className: "dbg-field dbg-field-span" },
                h("span", { className: "dbg-field-label" }, t("agentDescription")),
                h("textarea", {
                  className: "dbg-textarea",
                  value: agentDescription,
                  rows: 3,
                  onChange: function (event) { setAgentDescription(event.target.value); },
                  placeholder: t("agentDescriptionPlaceholder"),
                }),
              ),
            ),
            h(Button, {
              disabled: !selectedRoomId || !agentProfile || busy === "add-agent",
              onClick: addAgent,
            }, t("addAgent")),
          ),
        }),
        panel({
          kicker: t("activity"),
          header: room ? room.name : t("groupchatTitle"),
          subheader: room
            ? "@" + agents.map(function (agent) { return agent.name; }).join(" · @") + " · " + fmtInt(room.message_count, locale) + " " + t("roomMessages")
            : t("noRooms"),
          className: "dbg-chat-main-panel",
          bodyClassName: "dbg-chat-main-body",
          children: h(
            "div",
            { className: "dbg-chat-main" },
            h("div", { className: "dbg-chat-toolbar" },
              h("div", { className: "dbg-pill-row" },
                room ? h(Badge, { variant: "outline" }, "rev ", fmtInt(room.revision, locale)) : null,
                room ? h(Badge, { variant: "outline" }, fmtCompact(room.trigger_tokens, locale), " trigger") : null,
                room ? h(Badge, { variant: "outline" }, fmtCompact(room.max_history_tokens, locale), " history") : null,
              ),
              h("div", { className: "dbg-note" }, t("sendShortcutHint")),
            ),
            loading
              ? h("div", { className: "dbg-empty" }, t("loadingRequests"))
              : messages.length === 0
                ? h("div", { className: "dbg-empty" }, t("noMessages"))
                : h("div", { className: "dbg-message-stream", ref: messageListRef }, messages.map(function (message) {
                    return h(groupMessageRow, {
                      key: message.id,
                      message: message,
                      locale: locale,
                      t: t,
                    });
                  })),
            h("div", { className: "dbg-chat-composer" },
              mentionState.active
                ? h("div", { className: "dbg-mention-menu" },
                    filteredAgents.length > 0
                      ? filteredAgents.slice(0, 8).map(function (agent, index) {
                          return h("button", {
                            key: agent.id,
                            type: "button",
                            className: cn("dbg-mention-item", index === mentionState.index ? "is-active" : ""),
                            onMouseDown: function (event) {
                              event.preventDefault();
                              applyMention(agent.name);
                            },
                          }, "@", agent.name, h("span", { className: "dbg-mention-meta" }, agent.profile));
                        })
                      : h("div", { className: "dbg-mention-empty" }, t("noMentionMatch")),
                  )
                : null,
              h("textarea", {
                ref: composerRef,
                className: "dbg-textarea dbg-textarea-compose dbg-chat-textarea",
                value: messageDraft,
                rows: 4,
                placeholder: t("messagePlaceholder"),
                onChange: onComposerChange,
                onKeyDown: onComposerKeyDown,
              }),
              h("div", { className: "dbg-form-actions" },
                h("div", { className: "dbg-note" }, t("useMentionsHint")),
                h(Button, {
                  disabled: !selectedRoomId || !String(messageDraft || "").trim() || busy === "send-message",
                  onClick: sendMessage,
                }, t("send")),
              ),
            ),
          ),
        }),
      ),
    );
  }

  function useDashboardSidebarControl() {
    const [sidebarHidden, setSidebarHidden] = useState(true);
    const originalDisplayRef = useRef(null);

    useEffect(function () {
      function applyState() {
        const sidebar = document.querySelector("#app-sidebar");
        if (!sidebar) return;
        if (originalDisplayRef.current === null) {
          originalDisplayRef.current = sidebar.style.display || "";
        }
        sidebar.style.display = sidebarHidden ? "none" : originalDisplayRef.current;
        document.body.classList.toggle("dbg-dashboard-sidebar-hidden", sidebarHidden);
      }

      applyState();
      const timer = window.setInterval(applyState, 500);
      return function () {
        window.clearInterval(timer);
        const sidebar = document.querySelector("#app-sidebar");
        if (sidebar) {
          sidebar.style.display = originalDisplayRef.current === null ? "" : originalDisplayRef.current;
        }
        document.body.classList.remove("dbg-dashboard-sidebar-hidden");
      };
    }, [sidebarHidden]);

    return [sidebarHidden, setSidebarHidden];
  }

  function HermesWebPage() {
    const i18n = useLocalI18n();
    const t = i18n.t;
    const [activeTab, setActiveTab] = useState("usage");
    const [sidebarHidden, setSidebarHidden] = useDashboardSidebarControl();
    const tabs = [
      { id: "usage", label: t("usage") },
      { id: "skills", label: t("skills") },
      { id: "requestBodies", label: t("requestBodies") },
      { id: "groupchat", label: t("groupchat") },
    ];

    return h(
      "div",
      { className: "dbg-app" },
      h("div", { className: "dbg-workbench" },
        h("aside", { className: "dbg-rail" },
          h(Card, { className: "dbg-panel dbg-rail-card" },
            h("div", { className: "dbg-body dbg-rail-body" },
              h("div", { className: "dbg-rail-nav" },
                tabs.map(function (tab) {
                  return h(
                    "button",
                    {
                      key: tab.id,
                      type: "button",
                      className: cn("dbg-rail-btn", activeTab === tab.id ? "is-active" : ""),
                      onClick: function () { setActiveTab(tab.id); },
                    },
                    tab.label,
                  );
                }),
              ),
              h("div", { className: "dbg-divider" }),
              h(Button, {
                variant: "outline",
                className: "dbg-sidebar-toggle",
                onClick: function () { setSidebarHidden(!sidebarHidden); },
              }, sidebarHidden ? t("showSidebar") : t("hideSidebar")),
            ),
          ),
        ),
        h("main", { className: "dbg-main" },
          activeTab === "usage"
            ? h(UsageTab)
            : activeTab === "skills"
              ? h(SkillsTab)
              : activeTab === "groupchat"
                ? h(GroupChatTab)
                : h(RequestsTab),
        ),
      ),
    );
  }

  window.__HERMES_PLUGINS__.register("hermes-web", HermesWebPage);
})();
