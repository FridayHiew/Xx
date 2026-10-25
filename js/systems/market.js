/* ============================================================
   systems/market.js - 坊市逻辑
   ============================================================ */

/* 刷新拍卖行 */
function refreshAuctionStock() {
  if (!S.flags.auction || S.flags.auction.refreshDay !== S.day) {
    S.flags.auction = {
      refreshDay: S.day,
      stock: generateAuctionStock(),
      bought: {},
    };
  }
}

/* 杂货铺购买 */
function buyMarketGood(itemId, price) {
  if (S.money < price) { log("铜钱不足。", "c-bad"); return; }
  S.money -= price;
  addItem(itemId, 1);
  const name = ITEMS[itemId] ? ITEMS[itemId].name : itemId;
  log(`【坊市】购买 ${name}（${price} 铜钱）`, "c-gold");
  save(); render();
}

/* 拍卖行购买 */
function buyAuctionItem(index) {
  refreshAuctionStock();
  const item = S.flags.auction.stock[index];
  if (!item) return;
  if (S.flags.auction.bought[index]) { log("已购买。", "c-bad"); return; }
  if (S.stone < item.price) { log("灵石不足。", "c-bad"); return; }

  S.stone -= item.price;
  addItem(item.itemId, 1);
  S.flags.auction.bought[index] = true;
  const name = ITEMS[item.itemId] ? ITEMS[item.itemId].name : item.itemId;
  log(`【拍卖行】拍下 ${name}（${item.price} 灵石）`, "c-gold");
  save(); render();
}

/* 卖东西（半价） */
function sellItemToMarket(itemId) {
  if (!hasItem(itemId)) return;
  const item = ITEMS[itemId];
  if (!item) return;
  const price = Math.max(1, Math.floor((item.price || 10) / 2));
  removeItem(itemId, 1);
  S.money += price;
  log(`【坊市】卖出 ${item.name}（+${price} 铜钱）`, "c-gold");
  save(); render();
}