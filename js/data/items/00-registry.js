/* ============================================================
   data/items/00-registry.js - 物品注册表 + 工具函数
   ------------------------------------------------------------
   所有物品都存进全局 ITEMS 对象。
   其他文件往 ITEMS 里塞数据，本文件只定义容器和操作函数。
   ============================================================ */

const ITEMS = {};

/* ============================================================
   基础查询
   ============================================================ */

function getItem(id) {
  return ITEMS[id];
}

/* ============================================================
   按类型查询（走桶，见 99-buckets.js）
   ============================================================ */

function getItemsByType(type) {
  return ITEMS_BY_TYPE[type] ? ITEMS_BY_TYPE[type].slice() : [];
}

function getAllItemsByType(type) {
  const ids = ITEMS_BY_TYPE[type] || [];
  return ids.map(k => Object.assign({ id: k }, ITEMS[k]));
}

/* ============================================================
   增删查
   ============================================================ */

function addItem(id, count) {
  count = count || 1;
  if (!S.inventory) S.inventory = {};
  S.inventory[id] = (S.inventory[id] || 0) + count;
}

function removeItem(id, count) {
  count = count || 1;
  if (!S.inventory || !S.inventory[id]) return false;
  if (S.inventory[id] < count) return false;
  S.inventory[id] -= count;
  if (S.inventory[id] <= 0) delete S.inventory[id];
  return true;
}

function hasItem(id, count) {
  count = count || 1;
  return (S.inventory && S.inventory[id] || 0) >= count;
}