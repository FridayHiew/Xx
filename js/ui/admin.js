/* ============================================================
   ui/admin.js - 数据维护界面
   ------------------------------------------------------------
   入口：顶部栏 🔧 图标 → 打开 Admin 面板
   ============================================================ */

/* ============================================================
   状态
   ============================================================ */
let adminCurrentTab = "ITEMS";
let adminSearchText = "";
let adminEditingItem = null;   /* 正在编辑的条目 */
let adminEditingKey = null;    /* 正在编辑的模块 key */

/* ============================================================
   打开 / 关闭
   ============================================================ */
function openAdmin() {
  if (!S) return;
  renderAdminScreen();
  const el = document.getElementById("adminScreen");
  if (el) {
    el.style.display = "flex";
    el.style.zIndex = "2500";   // ★ 降到 2500
  }
}

function closeAdmin() {
  const el = document.getElementById("adminScreen");
  if (el) el.style.display = "none";
  adminEditingItem = null;
  adminEditingKey = null;
}

/* ============================================================
   渲染主界面
   ============================================================ */
function renderAdminScreen() {
  const screen = document.getElementById("adminScreen");
  if (!screen) return;

  screen.innerHTML = `
    <div class="admin-header">
      <div class="admin-title">
        🔧 数据维护
      </div>
      <div class="admin-actions-top">
        <button onclick="exportAdminPack()">📤 导出</button>
        <button onclick="importAdminPack()">📥 导入</button>
        <button onclick="resetAdminOverrides()">🗑 重置</button>
        <button onclick="closeAdmin()" class="admin-close">✕</button>
      </div>
    </div>

    <div class="admin-tabs" id="adminTabs"></div>

    <div class="admin-toolbar">
      <input type="text" id="adminSearchInput" placeholder="🔍 搜索 ID / 名称 / 描述..."
        value="${escapeHtml(adminSearchText)}"
        oninput="onAdminSearch(this.value)">
      <span class="small" id="adminCount"></span>
      <button class="small" onclick="onAdminAdd()">+ 新增</button>
    </div>

    <div class="admin-content" id="adminContent"></div>
  `;

  renderAdminTabs();
  renderAdminContent();
}

/* ============================================================
   Tab 渲染
   ============================================================ */
const ADMIN_TABS = [
  { id: "ITEMS",              label: "道具",     type: "object" },
  { id: "RECIPES",            label: "丹方",     type: "array" },
  { id: "FORGE_RECIPES",      label: "炼器配方", type: "array" },
  { id: "FIGHT_ENEMIES",      label: "怪物",     type: "object-array" },
  { id: "HEART_ARTS",         label: "心法",     type: "array" },
  { id: "FORGE_AFFIXES",      label: "词条",     type: "array" },
  { id: "PET_TALENTS",        label: "灵宠天赋", type: "array" },
  { id: "PLAYER",             label: "玩家",     type: "player" },
];

function renderAdminTabs() {
  const el = document.getElementById("adminTabs");
  if (!el) return;

  let html = "";
  ADMIN_TABS.forEach(t => {
    html += `<div class="admin-tab ${adminCurrentTab === t.id ? 'active' : ''}"
      onclick="switchAdminTab('${t.id}')">${t.label}</div>`;
  });
  el.innerHTML = html;
}

function switchAdminTab(tab) {
  adminCurrentTab = tab;
  adminSearchText = "";
  renderAdminScreen();
}

/* ============================================================
   搜索
   ============================================================ */
function onAdminSearch(text) {
  adminSearchText = text.trim().toLowerCase();
  renderAdminContent();
}

/* ============================================================
   内容渲染
   ============================================================ */
function renderAdminContent() {
  const el = document.getElementById("adminContent");
  if (!el) return;

  const tabMeta = ADMIN_TABS.find(t => t.id === adminCurrentTab);
  if (!tabMeta) return;

  if (tabMeta.id === "PLAYER") {
    renderAdminPlayer(el);
    return;
  }

  const items = getAdminTabItems(adminCurrentTab, tabMeta.type);
  const filtered = filterAdminItems(items, adminSearchText);

  /* 更新计数 */
  const countEl = document.getElementById("adminCount");
  if (countEl) {
    countEl.textContent = `共 ${items.length} 条${adminSearchText ? `，匹配 ${filtered.length} 条` : ""}`;
  }

  if (filtered.length === 0) {
    el.innerHTML = `<p class="empty">没有匹配的条目。</p>`;
    return;
  }

  /* 只显示前 200 条，避免卡顿 */
  const limit = 200;
  const showList = filtered.slice(0, limit);

  let html = "";
  showList.forEach(item => {
    const key = item.__key;
    const name = item.__name;
    const preview = item.__preview;

    html += `
      <div class="admin-item-card">
        <div class="admin-item-header">
          <div class="admin-item-name">
            <b>${escapeHtml(name)}</b>
            <span class="tag" style="font-size:9px;">${escapeHtml(key)}</span>
          </div>
          <div class="admin-item-actions">
            <button class="small" onclick="onAdminEdit('${adminCurrentTab}', '${escapeJs(key)}')">编辑</button>
            <button class="small admin-del" onclick="onAdminDelete('${adminCurrentTab}', '${escapeJs(key)}')">删除</button>
          </div>
        </div>
        <div class="admin-item-preview small">${escapeHtml(preview)}</div>
      </div>
    `;
  });

  if (filtered.length > limit) {
    html += `<p class="small" style="text-align:center;padding:10px;">只显示前 ${limit} 条。请用搜索缩小范围。</p>`;
  }

  el.innerHTML = html;
}

/* ============================================================
   获取 tab 内的数据
   ============================================================ */
function getAdminTabItems(tabId, type) {
  let list = [];

  if (tabId === "ITEMS") {
    if (typeof ITEMS === "undefined") return [];
    for (const id in ITEMS) {
      const item = ITEMS[id];
      list.push({
        __key: id,
        __name: item.name || id,
        __preview: `${item.type || "?"} · ${item.desc || ""}`.slice(0, 80),
        __raw: item,
      });
    }
  }
  else if (tabId === "RECIPES") {
    if (typeof RECIPES === "undefined") return [];
    RECIPES.forEach(r => {
      list.push({
        __key: r.id,
        __name: r.name || r.id,
        __preview: `配方：${Object.entries(r.mat || {}).map(([k, v]) => `${k}×${v}`).join(" ")} · 成功率 ${(r.rate * 100).toFixed(0)}%`,
        __raw: r,
      });
    });
  }
  else if (tabId === "FORGE_RECIPES") {
    if (typeof FORGE_RECIPES === "undefined") return [];
    FORGE_RECIPES.forEach(r => {
      list.push({
        __key: r.id,
        __name: r.name || r.id,
        __preview: `${r.grade}品 · ${Object.entries(r.mats || {}).map(([k, v]) => `${k}×${v}`).join(" ")} · 成功率 ${(r.rate * 100).toFixed(0)}%`,
        __raw: r,
      });
    });
  }
  else if (tabId === "FIGHT_ENEMIES") {
    if (typeof FIGHT_ENEMIES === "undefined") return [];
    for (const tier in FIGHT_ENEMIES) {
      FIGHT_ENEMIES[tier].forEach(e => {
        list.push({
          __key: `${tier}::${e.id}`,
          __name: `${e.name} (${tier})`,
          __preview: `HP ${e.hp} · ATK ${e.atk} · DEF ${e.def} · realm ${e.realm}`,
          __raw: e,
          __tier: tier,
        });
      });
    }
  }
  else if (tabId === "HEART_ARTS") {
    if (typeof HEART_ARTS === "undefined") return [];
    HEART_ARTS.forEach(a => {
      list.push({
        __key: a.id,
        __name: a.name || a.id,
        __preview: `realm ${a.realm} · maxLvl ${a.maxLvl} · ${a.type} · ${a.category || ""}`,
        __raw: a,
      });
    });
  }
  else if (tabId === "FORGE_AFFIXES") {
    if (typeof FORGE_AFFIXES === "undefined") return [];
    FORGE_AFFIXES.forEach(a => {
      list.push({
        __key: a.id,
        __name: a.name || a.id,
        __preview: `stat ${a.stat} · base ${a.baseRange.join("~")} · scale ${a.gradeScale}`,
        __raw: a,
      });
    });
  }
  else if (tabId === "PET_TALENTS") {
    if (typeof PET_TALENTS === "undefined") return [];
    PET_TALENTS.forEach(t => {
      list.push({
        __key: t.id,
        __name: t.name || t.id,
        __preview: `maxRealm ${t.maxRealm} · growth ${t.growth} · weight ${t.weight}`,
        __raw: t,
      });
    });
  }

  return list;
}

function filterAdminItems(items, search) {
  if (!search) return items;
  return items.filter(it => {
    const key = (it.__key || "").toLowerCase();
    const name = (it.__name || "").toLowerCase();
    const preview = (it.__preview || "").toLowerCase();
    return key.includes(search) || name.includes(search) || preview.includes(search);
  });
}

/* ============================================================
   编辑器
   ============================================================ */

function onAdminEdit(tabId, key) {
  const items = getAdminTabItems(tabId, null);
  const found = items.find(it => it.__key === key);
  if (!found) {
    log("未找到条目", "c-bad");
    return;
  }

  adminEditingItem = found.__raw;
  adminEditingKey = found.__key;
  adminEditingTab = tabId;

  renderAdminEditor(found);
}

function renderAdminEditor(found) {
  const isArray = ["RECIPES", "FORGE_RECIPES", "HEART_ARTS", "FORGE_AFFIXES", "PET_TALENTS"].includes(adminEditingTab);
  const isFightEnemy = adminEditingTab === "FIGHT_ENEMIES";

  /* JSON 视图（用于复杂字段） */
  const jsonText = JSON.stringify(found.__raw, null, 2);

  const body = `
    <p class="small">模块：<b>${adminEditingTab}</b>　ID：<code>${escapeHtml(found.__key)}</code></p>
    <textarea id="adminEditJson" style="width:100%;height:300px;background:#0a0806;color:#e8c87a;font-family:monospace;font-size:12px;padding:8px;">${escapeHtml(jsonText)}</textarea>
    <p class="small" style="margin-top:6px;color:var(--text-dim);">
      💡 直接编辑 JSON。保存后立即生效。
    </p>
  `;

  showModal("编辑条目", body, [
    { label: "取消", fn: closeModal },
    { label: "保存", primary: true, fn: () => {
      const text = document.getElementById("adminEditJson").value;
      try {
        const newData = JSON.parse(text);

        if (isFightEnemy) {
          /* 保存怪物：需要按 tier 处理 */
          const tier = found.__tier;
          const idx = FIGHT_ENEMIES[tier].findIndex(e => e.id === found.__raw.id);
          if (idx >= 0) {
            FIGHT_ENEMIES[tier][idx] = newData;
          } else {
            FIGHT_ENEMIES[tier].push(newData);
          }
          /* 保存到 overrides */
          const overrides = getAdminOverrides() || { version: "1.0", data: {} };
          if (!overrides.data.FIGHT_ENEMIES) {
            overrides.data.FIGHT_ENEMIES = {
              normal: FIGHT_ENEMIES.normal.slice(),
              elite: FIGHT_ENEMIES.elite.slice(),
              boss: FIGHT_ENEMIES.boss.slice(),
            };
          }
          overrides.data.FIGHT_ENEMIES[tier] = FIGHT_ENEMIES[tier].slice();
          saveAdminOverrides(overrides.data);
        } else if (adminEditingTab === "ITEMS") {
          ITEMS[found.__key] = newData;
          saveAdminItem("ITEMS", found.__key, newData, false);
        } else {
          /* 数组类 */
          const arr = window[adminEditingTab];
          const idx = arr.findIndex(x => x.id === found.__raw.id);
          if (idx >= 0) {
            arr[idx] = newData;
          } else {
            arr.push(newData);
          }
          saveAdminItem(adminEditingTab, found.__raw.id, newData, false);
        }

        closeModal();
        log(`【Admin】已保存 ${found.__key}`, "c-gold");
        renderAdminContent();
      } catch (e) {
        alert("JSON 格式错误：" + e.message);
      }
    }},
  ]);
}

/* ============================================================
   删除
   ============================================================ */

function onAdminDelete(tabId, key) {
  showModal("确认删除", `
    <p>删除条目：<code>${escapeHtml(key)}</code></p>
    <p class="small" style="color:var(--c-bad);">此操作会立即生效并保存。</p>
  `, [
    { label: "取消", fn: closeModal },
    { label: "删除", primary: true, fn: () => {
      if (tabId === "ITEMS") {
        delete ITEMS[key];
        saveAdminItem("ITEMS", key, null, true);
      } else if (tabId === "FIGHT_ENEMIES") {
        const [tier, id] = key.split("::");
        FIGHT_ENEMIES[tier] = FIGHT_ENEMIES[tier].filter(e => e.id !== id);
        const overrides = getAdminOverrides() || { version: "1.0", data: {} };
        if (!overrides.data.FIGHT_ENEMIES) overrides.data.FIGHT_ENEMIES = {};
        overrides.data.FIGHT_ENEMIES[tier] = FIGHT_ENEMIES[tier].slice();
        saveAdminOverrides(overrides.data);
      } else {
        const arr = window[tabId];
        const idx = arr.findIndex(x => x.id === key);
        if (idx >= 0) {
          arr.splice(idx, 1);
          saveAdminItem(tabId, key, null, true);
        }
      }
      closeModal();
      log(`【Admin】已删除 ${key}`, "c-gold");
      renderAdminContent();
    }},
  ]);
}

/* ============================================================
   新增
   ============================================================ */

function onAdminAdd() {
  showModal("新增条目", `
    <p>请输入 JSON 格式的新条目数据。</p>
    <textarea id="adminAddJson" style="width:100%;height:200px;background:#0a0806;color:#e8c87a;font-family:monospace;font-size:12px;padding:8px;">{
  "id": "new_id",
  "name": "新条目",
  "desc": "描述"
}</textarea>
    <p class="small" style="margin-top:6px;color:var(--text-dim);">
      提示：对象类（ITEMS）需要 id 字段；数组类需要 id 字段（用于保存）。
    </p>
  `, [
    { label: "取消", fn: closeModal },
    { label: "添加", primary: true, fn: () => {
      const text = document.getElementById("adminAddJson").value;
      try {
        const newData = JSON.parse(text);
        if (!newData.id) {
          alert("缺少 id 字段");
          return;
        }

        if (adminCurrentTab === "ITEMS") {
          ITEMS[newData.id] = newData;
          saveAdminItem("ITEMS", newData.id, newData, false);
        } else if (adminCurrentTab === "FIGHT_ENEMIES") {
          /* 默认加到 normal */
          FIGHT_ENEMIES.normal.push(newData);
          const overrides = getAdminOverrides() || { version: "1.0", data: {} };
          if (!overrides.data.FIGHT_ENEMIES) overrides.data.FIGHT_ENEMIES = {};
          overrides.data.FIGHT_ENEMIES.normal = FIGHT_ENEMIES.normal.slice();
          saveAdminOverrides(overrides.data);
        } else {
          const arr = window[adminCurrentTab];
          arr.push(newData);
          saveAdminItem(adminCurrentTab, newData.id, newData, false);
        }

        closeModal();
        log(`【Admin】已新增 ${newData.id}`, "c-gold");
        renderAdminContent();
      } catch (e) {
        alert("JSON 格式错误：" + e.message);
      }
    }},
  ]);
}

/* ============================================================
   玩家数据编辑
   ============================================================ */
function renderAdminPlayer(el) {
  if (!S) {
    el.innerHTML = `<p class="empty">未进入游戏。</p>`;
    return;
  }

  const fields = [
    { key: "name",     label: "道号",       type: "string" },
    { key: "gender",   label: "性别",       type: "string" },
    { key: "money",    label: "铜钱",       type: "number" },
    { key: "stone",    label: "灵石",       type: "number" },
    { key: "contrib",  label: "贡献",       type: "number" },
    { key: "exp",      label: "修为",       type: "number" },
    { key: "hp",       label: "气血",       type: "number" },
    { key: "mp",       label: "灵力",       type: "number" },
    { key: "morality", label: "本心",       type: "number" },
    { key: "mood",     label: "心情 -2~2",  type: "number" },
    { key: "luck",     label: "幸运",       type: "number" },
    { key: "day",      label: "天数",       type: "number" },
    { key: "life",     label: "年龄",       type: "number" },
    { key: "lifeMax",  label: "寿元上限",   type: "number" },
  ];

  let html = `<div class="admin-player-panel">`;
  fields.forEach(f => {
    html += `
      <div class="admin-field-row">
        <label>${f.label}</label>
        <input type="text" id="adminP_${f.key}" value="${escapeHtml(String(S[f.key] !== undefined ? S[f.key] : ""))}">
        <button class="small" onclick="onAdminSetPlayer('${f.key}')">设置</button>
      </div>
    `;
  });
  html += `</div>`;

  /* 快捷操作 */
  html += `
    <h4 style="margin-top:14px;">快捷操作</h4>
    <div class="admin-quick-actions">
      <button onclick="adminQuick('hp_full')">气血灵力全满</button>
      <button onclick="adminQuick('money')">铜钱 +1000</button>
      <button onclick="adminQuick('stone')">灵石 +1000</button>
      <button onclick="adminQuick('contrib')">贡献 +100</button>
      <button onclick="adminQuick('all_recipes')">解锁全部丹方</button>
      <button onclick="adminQuick('all_heart_arts')">学全部心法</button>
    </div>
  `;

  /* 完整 S 查看 */
  html += `
    <h4 style="margin-top:14px;">完整 S 数据（只读）</h4>
    <textarea readonly style="width:100%;height:300px;background:#0a0806;color:#e8c87a;font-family:monospace;font-size:11px;padding:8px;">${escapeHtml(JSON.stringify(S, null, 2))}</textarea>
  `;

  el.innerHTML = html;
}

function onAdminSetPlayer(field) {
  const input = document.getElementById("adminP_" + field);
  if (!input) return;
  const value = input.value;
  adminSetPlayerField(field, value);
  renderAdminPlayer(document.getElementById("adminContent"));
}

function adminQuick(action) {
  if (!S) return;
  switch (action) {
    case "hp_full":
      S.hp = totalMaxHp();
      S.mp = totalMaxMp();
      log(`【Admin】气血灵力全满`, "c-gold");
      break;
    case "money":
      S.money += 1000;
      log(`【Admin】铜钱 +1000`, "c-gold");
      break;
    case "stone":
      S.stone += 1000;
      log(`【Admin】灵石 +1000`, "c-gold");
      break;
    case "contrib":
      S.contrib += 100;
      log(`【Admin】贡献 +100`, "c-gold");
      break;
    case "all_recipes":
      if (!S.flags.knownRecipes) S.flags.knownRecipes = {};
      RECIPES.forEach(r => { S.flags.knownRecipes[r.id] = true; });
      log(`【Admin】解锁全部丹方`, "c-gold");
      break;
    case "all_heart_arts":
      /* 学全部心法（Lv.1） */
      HEART_ARTS.forEach(a => {
        if (!S.heartArts.learned.includes(a.id)) {
          S.heartArts.learned.push(a.id);
          S.heartArts.progress[a.id] = { lvl: 1, exp: 0, proficiency: 0, maxLearn: a.maxLearn };
        }
      });
      if (!S.heartArts.current) S.heartArts.current = HEART_ARTS[0].id;
      log(`【Admin】学会全部心法`, "c-gold");
      break;
  }
  save();
  renderAdminPlayer(document.getElementById("adminContent"));
}

/* ============================================================
   工具函数
   ============================================================ */
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeJs(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}