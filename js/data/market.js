/* ============================================================
   data/market.js - 宗门坊市
   ============================================================ */

/* 杂货铺模板（templateId 走品级生成，itemId 直接引用） */
const MARKET_GOODS_TEMPLATE = [
  { templateId: "回春丹_1阶", grade: 1, price: 30 },
  { templateId: "回元丹_1阶", grade: 1, price: 30 },
  { templateId: "清灵散_3阶", grade: 1, price: 50 },
  { templateId: "冰灵丹_3阶", grade: 1, price: 50 },
  { templateId: "止血丹_3阶", grade: 1, price: 50 },
  { itemId: "妖丹_1", price: 30 },
  { itemId: "赤血草_1", price: 10 },
  { itemId: "紫芝草_1", price: 10 },
  { itemId: "洗骨花_1", price: 8 },
];

/* 生成杂货铺（动态注册品级物品） */
function getMarketGoods() {
  const list = [];
  MARKET_GOODS_TEMPLATE.forEach(g => {
    if (g.templateId) {
      const item = getOrCreatePillItem(g.templateId, g.grade);
      if (item) list.push({ itemId: item.id, price: g.price });
    } else {
      list.push({ itemId: g.itemId, price: g.price });
    }
  });
  return list;
}

/* 拍卖行模板 */
const MARKET_AUCTION_POOL_TEMPLATE = [
  { templateId: "回春丹_2阶", grade: 1, basePrice: 80 },
  { templateId: "回元丹_2阶", grade: 1, basePrice: 80 },
  { templateId: "回春丹_3阶", grade: 2, basePrice: 150 },
  { templateId: "聚气丹", grade: 2, basePrice: 150 },
  { templateId: "聚灵丹_2阶", grade: 1, basePrice: 200 },
  { templateId: "聚凝丹_3阶", grade: 1, basePrice: 300 },
  { itemId: "妖丹_2", basePrice: 100 },
  { itemId: "妖丹_3", basePrice: 200 },
  { itemId: "赤血草_2", basePrice: 50 },
  { itemId: "紫芝草_2", basePrice: 50 },
  { itemId: "玉髓芝_2", basePrice: 80 },
  { itemId: "寒血果_2", basePrice: 90 },
  { itemId: "紫猴花_2", basePrice: 85 },
  { itemId: "千年降压草_1", basePrice: 300 },
  { itemId: "妖兽精血_1", basePrice: 250 },
];

/* 生成每日拍卖商品 */
function generateAuctionStock() {
  const pool = [...MARKET_AUCTION_POOL_TEMPLATE];
  const stock = [];
  for (let i = 0; i < 5 && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const g = pool.splice(idx, 1)[0];

    let itemId;
    if (g.templateId) {
      const item = getOrCreatePillItem(g.templateId, g.grade);
      if (!item) continue;
      itemId = item.id;
    } else {
      itemId = g.itemId;
    }

    const price = Math.floor(g.basePrice * (0.7 + Math.random() * 0.6));
    stock.push({ itemId, price });
  }
  return stock;
}