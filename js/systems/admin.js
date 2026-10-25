/* ============================================================
   systems/admin.js - 数据维护核心逻辑
   ------------------------------------------------------------
   功能：
   1. 启动时应用 overrides（localStorage）到内存数据
   2. 保存 overrides
   3. 导出 custom-pack.js
   4. 导入 custom-pack.js
   5. 重置 overrides
   ============================================================ */

const ADMIN_STORAGE_KEY = "xiuxian_admin_overrides";
const ADMIN_VERSION = "1.0";

/* ============================================================
   启动时应用
   ============================================================ */

function applyAdminOverrides() {
  /* 1. 优先应用 custom-pack.js */
  if (window.CUSTOM_PACK && window.CUSTOM_PACK.data) {
    applyDataPack(window.CUSTOM_PACK.data);
    console.log("[Admin] 已应用 custom-pack.js");
  }

  /* 2. 应用 localStorage overrides（优先级更高） */
  const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (raw) {
    try {
      const override = JSON.parse(raw);
      if (override && override.data) {
        applyDataPack(override.data);
        console.log("[Admin] 已应用 localStorage overrides");
      }
    } catch (e) {
      console.error("[Admin] overrides 解析失败", e);
    }
  }
}

/* 把数据包应用到内存数据 */
function applyDataPack(data) {
  if (!data) return;

  /* 对象类：浅合并（key 级别覆盖） */
  if (data.ITEMS && typeof ITEMS !== "undefined") {
    for (const id in data.ITEMS) {
      ITEMS[id] = data.ITEMS[id];
    }
  }
  if (data.FIGHT_ENEMIES && typeof FIGHT_ENEMIES !== "undefined") {
    for (const tier in data.FIGHT_ENEMIES) {
      if (!FIGHT_ENEMIES[tier]) FIGHT_ENEMIES[tier] = [];
      /* FIGHT_ENEMIES 是 {normal: [...], elite: [...], boss: [...]}
         每个 tier 是数组：整体替换 */
      if (Array.isArray(data.FIGHT_ENEMIES[tier])) {
        FIGHT_ENEMIES[tier] = data.FIGHT_ENEMIES[tier];
      }
    }
  }

  /* 数组类：整体替换 */
  const arrayDataMap = {
    RECIPES:             "RECIPES",
    HEART_ARTS:          "HEART_ARTS",
    FORGE_RECIPES:       "FORGE_RECIPES",
    FORGE_AFFIXES:       "FORGE_AFFIXES",
    FORGE_MATERIALS_BASE:"FORGE_MATERIALS_BASE",
    PET_TALENTS:         "PET_TALENTS",
    PET_BLOODLINES:      "PET_BLOODLINES",
    SECTS:               "SECTS",
    PEAKS:               "PEAKS",
  };

  for (const key in arrayDataMap) {
    if (data[key] && Array.isArray(data[key])) {
      /* 不能用 let 重新赋值（const），只能原地替换 */
      const target = arrayDataMap[key];
      try {
        /* 清空并重新填充 */
        window[target].length = 0;
        data[key].forEach(item => window[target].push(item));
      } catch (e) {
        console.warn(`[Admin] 无法替换 ${target}`, e);
      }
    }
  }
}

/* ============================================================
   保存 overrides
   ============================================================ */

function saveAdminOverrides(data) {
  const override = {
    version: ADMIN_VERSION,
    updatedAt: Date.now(),
    data: data,
  };
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(override));
}

function getAdminOverrides() {
  const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearAdminOverrides() {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
}

/* ============================================================
   收集所有数据
   ============================================================ */

function collectAllData() {
  const data = {};

  if (typeof ITEMS !== "undefined") data.ITEMS = ITEMS;
  if (typeof FIGHT_ENEMIES !== "undefined") data.FIGHT_ENEMIES = FIGHT_ENEMIES;
  if (typeof RECIPES !== "undefined") data.RECIPES = RECIPES;
  if (typeof HEART_ARTS !== "undefined") data.HEART_ARTS = HEART_ARTS;
  if (typeof FORGE_RECIPES !== "undefined") data.FORGE_RECIPES = FORGE_RECIPES;
  if (typeof FORGE_AFFIXES !== "undefined") data.FORGE_AFFIXES = FORGE_AFFIXES;
  if (typeof FORGE_MATERIALS_BASE !== "undefined") data.FORGE_MATERIALS_BASE = FORGE_MATERIALS_BASE;
  if (typeof PET_TALENTS !== "undefined") data.PET_TALENTS = PET_TALENTS;
  if (typeof PET_BLOODLINES !== "undefined") data.PET_BLOODLINES = PET_BLOODLINES;
  if (typeof SECTS !== "undefined") data.SECTS = SECTS;
  if (typeof PEAKS !== "undefined") data.PEAKS = PEAKS;

  return data;
}

/* ============================================================
   导出
   ============================================================ */

function exportAdminPack() {
  const data = collectAllData();
  const pack = {
    version: ADMIN_VERSION,
    updatedAt: Date.now(),
    data: data,
  };

  const jsonStr = JSON.stringify(pack, null, 2);
  const jsContent = `/* ============================================================
   custom-pack.js - 自定义数据包（由 Admin 面板导出）
   导出时间：${new Date().toLocaleString()}
   ============================================================ */

window.CUSTOM_PACK = ${jsonStr};
`;

  /* 触发下载 */
  const blob = new Blob([jsContent], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `custom-pack.js`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  log(`【Admin】已导出数据包 custom-pack.js`, "c-gold");
}

/* ============================================================
   导入
   ============================================================ */

function importAdminPack() {
  /* 弹窗：输入或上传 */
  const body = `
    <p class="small">粘贴 <code>custom-pack.js</code> 的内容，或直接上传文件。</p>
    <input type="file" id="adminPackFile" accept=".js,.json" style="width:100%;margin:8px 0;">
    <textarea id="adminPackText" placeholder="或粘贴内容..." style="width:100%;height:120px;background:#0a0806;color:#e8c87a;font-family:monospace;font-size:11px;"></textarea>
  `;

  showModal("导入数据包", body, [
    { label: "取消", fn: closeModal },
    { label: "导入", primary: true, fn: () => {
      const fileInput = document.getElementById("adminPackFile");
      const textArea = document.getElementById("adminPackText");

      const processText = (text) => {
        try {
          let data;
          /* 尝试两种格式：
             1. 完整 js: window.CUSTOM_PACK = { ... };
             2. 纯 json: { "version": ..., "data": {...} }
          */
          text = text.trim();

          /* 如果包含 window.CUSTOM_PACK */
          const match = text.match(/window\.CUSTOM_PACK\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
          if (match) {
            data = JSON.parse(match[1]);
          } else {
            data = JSON.parse(text);
          }

          if (!data || !data.data) {
            throw new Error("数据包格式错误");
          }

          saveAdminOverrides(data.data);
          applyDataPack(data.data);

          closeModal();
          log(`【Admin】已导入数据包，覆盖 ${Object.keys(data.data).length} 个模块`, "c-gold");
          showModal("导入成功", `
            <p>数据包已导入。</p>
            <p class="small">当前修改立即生效，下次启动也会自动加载。</p>
          `, [{ label: "好", fn: closeModal }]);

          /* 刷新界面 */
          if (typeof render === "function") render();
        } catch (e) {
          alert("导入失败：" + e.message);
        }
      };

      /* 优先文件，其次文本 */
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => processText(e.target.result);
        reader.readAsText(fileInput.files[0]);
      } else if (textArea && textArea.value.trim()) {
        processText(textArea.value);
      } else {
        alert("请选择文件或粘贴内容");
      }
    }},
  ]);
}

/* ============================================================
   重置（清空 overrides）
   ============================================================ */

function resetAdminOverrides() {
  showModal("重置数据", `
    <p>将清空所有 Admin 修改，恢复到源码原始数据。</p>
    <p class="small">此操作不可撤销。</p>
  `, [
    { label: "取消", fn: closeModal },
    { label: "确定重置", primary: true, fn: () => {
      clearAdminOverrides();
      closeModal();
      showModal("重置完成", `
        <p>已清空 Admin 修改。</p>
        <p class="small">即将刷新页面...</p>
      `, [{ label: "刷新", fn: () => { location.reload(); } }]);
      setTimeout(() => location.reload(), 1500);
    }},
  ]);
}

/* ============================================================
   单项编辑（保存到 localStorage）
   ============================================================ */

function saveAdminItem(moduleKey, itemId, newData, isDelete) {
  const overrides = getAdminOverrides() || { version: ADMIN_VERSION, data: {} };
  if (!overrides.data) overrides.data = {};
  if (!overrides.data[moduleKey]) {
    /* 从内存收集该模块的当前数据作为基础 */
    overrides.data[moduleKey] = getCurrentModuleData(moduleKey);
  }

  const moduleData = overrides.data[moduleKey];

  if (isDelete) {
    if (Array.isArray(moduleData)) {
      overrides.data[moduleKey] = moduleData.filter(item => (item.id || item.name) !== itemId);
    } else {
      delete moduleData[itemId];
    }
  } else {
    if (Array.isArray(moduleData)) {
      const idx = moduleData.findIndex(item => (item.id || item.name) === itemId);
      if (idx >= 0) {
        moduleData[idx] = newData;
      } else {
        moduleData.push(newData);
      }
    } else {
      moduleData[itemId] = newData;
    }
  }

  saveAdminOverrides(overrides.data);
  applyDataPack(overrides.data);
}

/* 从内存取模块当前数据 */
function getCurrentModuleData(moduleKey) {
  switch (moduleKey) {
    case "ITEMS":              return ITEMS;
    case "FIGHT_ENEMIES":      return FIGHT_ENEMIES;
    case "RECIPES":            return RECIPES.slice();
    case "HEART_ARTS":         return HEART_ARTS.slice();
    case "FORGE_RECIPES":      return FORGE_RECIPES.slice();
    case "FORGE_AFFIXES":      return FORGE_AFFIXES.slice();
    case "FORGE_MATERIALS_BASE": return FORGE_MATERIALS_BASE.slice();
    case "PET_TALENTS":        return PET_TALENTS.slice();
    case "PET_BLOODLINES":     return PET_BLOODLINES.slice();
    case "SECTS":              return SECTS.slice();
    case "PEAKS":              return PEAKS.slice();
    default: return [];
  }
}

/* ============================================================
   玩家数据（S）直接操作
   ============================================================ */

function adminSetPlayerField(field, value) {
  if (!S) return;
  try {
    /* 支持 a.b.c 路径 */
    const parts = field.split(".");
    let obj = S;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
      if (obj === undefined) throw new Error("路径不存在");
    }
    /* 尝试解析为 JSON */
    let parsed = value;
    try { parsed = JSON.parse(value); } catch (e) { /* 保持字符串 */ }
    obj[parts[parts.length - 1]] = parsed;
    save();
    log(`【Admin】设置 S.${field} = ${JSON.stringify(parsed)}`, "c-gold");
  } catch (e) {
    log(`【Admin】设置失败：${e.message}`, "c-bad");
  }
}