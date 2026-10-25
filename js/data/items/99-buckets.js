/* ============================================================
   data/items/99-buckets.js - ITEMS 按 type 预分桶
   ------------------------------------------------------------
   ★ 必须放在所有往 ITEMS 追加的代码之后加载：
     - items/30-generate.js
     - heart-arts.js（末尾追加 xxx_f1）
     - forge-materials.js（末尾追加 材料_id）
   ============================================================ */

const ITEMS_BY_TYPE = {};

function rebuildItemsByType() {
  for (const k in ITEMS_BY_TYPE) delete ITEMS_BY_TYPE[k];
  for (const id in ITEMS) {
    const t = ITEMS[id].type;
    if (!t) continue;
    if (!ITEMS_BY_TYPE[t]) ITEMS_BY_TYPE[t] = [];
    ITEMS_BY_TYPE[t].push(id);
  }
}

/* 运行时新增物品时手动同步桶（如 forge.js 的 generateForgedEquip） */
function registerItemToBucket(id) {
  const it = ITEMS[id];
  if (!it || !it.type) return;
  const bucket = ITEMS_BY_TYPE[it.type];
  if (!bucket) {
    ITEMS_BY_TYPE[it.type] = [id];
    return;
  }
  if (!bucket.includes(id)) bucket.push(id);
}

function unregisterItemFromBucket(id) {
  for (const t in ITEMS_BY_TYPE) {
    const idx = ITEMS_BY_TYPE[t].indexOf(id);
    if (idx >= 0) ITEMS_BY_TYPE[t].splice(idx, 1);
  }
}

/* 加载时构建一次 */
rebuildItemsByType();