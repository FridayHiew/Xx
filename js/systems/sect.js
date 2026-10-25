/* ============================================================
   systems/sect.js - 宗门 / 晋升 / 杂役铺 / 洞府
   ============================================================ */

function canPromoteTo(rank) {
  const req = RANK_REQ[rank];
  if (!req) return false;
  if (req.contrib && S.contrib < req.contrib) return false;

  /*
     ★ P2-1 已修：req.realm 是大境界，用 getPlayerRealmInfo().realm
  */
  if (req.realm && getPlayerRealmInfo().realm < req.realm) return false;

  if (req.subMin && getPlayerRealm() < req.subMin) return false;
  if (req.money && getCurrency() < req.money) return false;
  if (req.npcRole) {
    const npc = S.npcs.find(n => n.role === req.npcRole && n.alive);
    if (!npc || npc.aff < req.npcAff) return false;
  }

  /* ★ 榜单排名限制 */
  if (rank === "门内") {
    if (typeof getPlayerRank === "function" && getPlayerRank("menwai") > 10) {
      return false;
    }
  }
  if (rank === "真传") {
    if (typeof getPlayerRank === "function" && getPlayerRank("mennei") > 3) {
      return false;
    }
  }

  return true;
}

function sectTabLocked(tab) {
  const rank = S.flags.rank || "杂务";
  const rankIdx = RANKS.indexOf(rank);
  if (tab === "宗门事务") return rankIdx < 1;
  if (tab === "阵法") return rankIdx < 2;
  if (tab === "藏经阁") return rankIdx < 2;
  if (tab === "历练") return rankIdx < 1;
  if (tab === "秘境") return rankIdx < 1;
  return false;
}


/* 杂役铺刷新 */
function refreshShop() {
  currentShopDay = S.day;
  const allIds = getItemsByType("other").filter(id => ITEMS[id].cat);
  currentShopStock = [...allIds].sort(() => Math.random() - 0.5).slice(0, SHOP_SIZE);
}

function refreshShopPaid() {
  const cost = SHOP_REFRESH_COST;
  if (!spendCurrency(cost)) { log(`${currencyName()}不足（需 ${cost}）。`, "c-bad"); return; }
  const allIds = getItemsByType("other").filter(id => ITEMS[id].cat);
  currentShopStock = [...allIds].sort(() => Math.random() - 0.5).slice(0, SHOP_SIZE);
  log(`你花了 ${cost} ${currencyName()} 刷新了杂役铺。`, "c-normal");
  save(); render();
}

function buyShopItem(id) {
  const it = ITEMS[id];
  if (!it) return;
  if (S.tools[id]) { log("已购买过。", "c-bad"); return; }
  if (!spendCurrency(it.price)) { log(`${currencyName()}不足。`, "c-bad"); return; }

  S.tools[id] = true;

  if (it.hobby) {
    if (S.hobbies.length >= 3) { log("爱好已满 3 个。", "c-bad"); addCurrency(it.price); return; }
    if (!S.hobbies.includes(it.hobby)) {
      S.hobbies.push(it.hobby);
      S.hobbySkill[it.hobby] = 0;
    }
  }
  log(`你购买了 ${it.name}。`, "c-gold");
  save(); render();
}

function switchSectTab(t) {
  if (sectTabLocked(t)) { log("尚未解锁该功能。", "c-bad"); return; }
  currentSectTab = t; render();
}

/* 学基本功 */
function learnTeachArt(id, cost) {
  const a = TEACH_ARTS_BASE.find(x => x.id === id);
  if (!a) return;
  if (!spendCurrency(cost)) { log(`${currencyName()}不足。`, "c-bad"); return; }
  S.learnedArts[id] = true;
  if (S.skills[a.skill]) {
    S.skills[a.skill].lvl = Math.min(MAX_SKILL_LVL, S.skills[a.skill].lvl + 1);
    log(`你学会了【${SECTS.find(s => s.id === S.sect).weapon}${a.name}】，${a.skill} Lv.${S.skills[a.skill].lvl}。`, "c-gold");
  }
  save(); render();
}

/* 晋升表 */
function showRankHelp() {
  const rows = RANKS.map(r => {
    const req = RANK_REQ[r];
    if (!req) return `<div class="row"><span>${r}</span><span class="small">初始身份</span></div>`;
    return `<div class="row"><span>${r}</span><span class="small">${req.desc}</span></div>`;
  }).join("");
  showModal("宗门晋升表", `
    <p class="small">身份越高，可解锁的玩法越多。</p>
    ${rows}
  `, [{ label: "关闭", fn: closeModal }]);
}

/* ========== 发放晋升奖励 ========== */

function givePromotionRewards(rank) {
  const rewards = PROMOTION_REWARDS[rank];
  if (!rewards) return;

  const detail = [];

  /* 根据宗门发上卷功法 */
  const sectArt = HEART_ARTS.find(a => a.sect === S.sect);
  if (sectArt) {
    const fragId = sectArt.id + "_f1";
    addItem(fragId, 1);
    detail.push(`获得残卷：《${sectArt.name}·上卷》`);
    log(`【晋升奖励】获得《${sectArt.name}·上卷》，可在背包参悟。`, "c-gold");
  }


  /* 武器 */
  if (rewards.weapon) {
    addItem(rewards.weapon, 1);
    const eq = ITEMS[rewards.weapon];
    if (eq) {
      log(`【晋升奖励】获得 ${eq.name}。`, "c-gold");
      detail.push(`获得武器：${eq.name}`);
    }
  }

  /* 衣服 */
  if (rewards.armor) {
    addItem(rewards.armor, 1);
    const eq = ITEMS[rewards.armor];
    if (eq) {
      log(`【晋升奖励】获得 ${eq.name}。`, "c-gold");
      detail.push(`获得道袍：${eq.name}`);
    }
  }

  /* 残卷 */
  if (rewards.fragments && rewards.fragments.length > 0) {
    rewards.fragments.forEach(fragId => {
      addFragment(fragId, 1);
      const found = getFragmentById(fragId);
      if (found) {
        detail.push(`获得残卷：${found.fragment.name}`);
      }
    });
  }

  if (typeof updateElementLvl === "function") updateElementLvl();

  showModal("晋升奖励", `
    <p>你获得了宗门的赏赐：</p>
    <div class="detail-list">
      ${detail.map(d => `<div>${d}</div>`).join("")}
    </div>
    <p class="small">可在【角色>背包>装备】中装配。</p>
  `, [{ label: "多谢宗门", fn: closeModal }]);
}


/* ========== 尝试晋升 ========== */
/*
   ★ 修复（B6）：
   原代码：req.money 在尝试前扣，req.contrib 在成功后扣，
   但失败文案写"贡献/铜钱不退"，前后矛盾。
   改为：req.contrib 也在尝试前扣，失败不退（与 money 一致）。
   如果不想扣贡献，去改文案；这里我们选"尝试即扣"。
*/
function tryPromote() {
  const rank = S.flags.rank || "杂务";
  const nextRank = RANKS[RANKS.indexOf(rank) + 1];
  if (!nextRank) return;
  if (!canPromoteTo(nextRank)) { log("条件不足。", "c-bad"); return; }
  const req = RANK_REQ[nextRank];

  const npc = S.npcs.find(n => n.role === req.npcRole && n.alive);
  const successRate = npc ? (0.5 + npc.aff * 0.01) : 0.5;

  /* ★ 铜钱、贡献都在尝试前扣，失败不退 */
  if (req.money > 0) {
    if (!spendCurrency(req.money)) { log("钱不够。", "c-bad"); return; }
  }
  if (req.contrib > 0) {
    if (S.contrib < req.contrib) { log("贡献不足。", "c-bad"); return; }
    S.contrib -= req.contrib;
  }

  if (Math.random() < successRate) {
    if (nextRank === "门外") {
      const html = PEAKS.map(p => `
        <div class="card">
          <b>${p.name}</b>
          <div class="small">特色：${p.specialty}</div>
          <button onclick="choosePeak('${p.id}')">选择</button>
        </div>
      `).join("");
      showModal("晋升成功 · 选峰", `
        <p>执事点了点头：「去吧，你已经不是杂役了。」</p>
        <p>你被分配到以下山峰，请选择：</p>
        ${html}
      `, []);
    } else {
      S.flags.rank = nextRank;
      addNPCsForRank(nextRank);
      givePromotionRewards(nextRank);
      log(`【晋升】你晋升为 ${nextRank}！`, "c-gold");
      S.mood = 2;
      save(); render();
      showActionModal("晋升成功", [`身份：${rank} → ${nextRank}`]);
    }
  } else {
    log(`【晋升失败】${npc ? npc.name : "长老"}摇了摇头。铜钱/贡献不退。`, "c-bad");
    save(); render();
  }
}

/* ========== 选峰 ========== */
function choosePeak(peakId) {
  const peak = PEAKS.find(p => p.id === peakId);
  if (!peak) return;
  S.peak = peakId;
  S.flags.rank = "门外";

  addNPCsForRank("门外");

  const master = S.npcs.find(n => n.alive && (n.role === "长老" || n.role === "峰主"));
  if (master) {
    S.master = master.id;
    S.metNpcs[master.id] = true;
  }

  const peers = S.npcs.filter(n => n.alive && n.tier === "门外").slice(0, 3);
  peers.forEach(n => { S.metNpcs[n.id] = true; });

  closeModal();
  log(`【晋升】你成为 ${peak.name} 的门外弟子！`, "c-gold");
  showModal("入门 · " + peak.name, `
    <p>你来到 ${peak.name}，见到师父 ${master ? master.name : "一位长老"}。</p>
    <p class="small">「从今日起，你便是本峰门外弟子。」</p>
    <hr style="border-color:#2a2216;margin:8px 0;">
    <p>你认识了几个同门：</p>
    <div style="margin-top:6px;">
      ${peers.map(n => `<span class="tag ${n.gender === "女" ? "pink" : "blue"}">${n.name}</span>`).join(" ")}
    </div>
  `, [{ label: "拜见师父", fn: () => {
    closeModal();
    givePromotionRewards("门外");
    save(); render();
  } }]);
}

/* ========== 兑换丹药 ========== */
function exchange(item, cost) {
  if (S.contrib < cost) { log("贡献不足。", "c-bad"); return; }
  S.contrib -= cost;
  addItem(item, 1);
  log(`你用贡献兑换了 ${item}。`, "c-gold");
  save(); render();
}

/* ========== 兑换残卷 ========== */
function exchangeFragment(fragId, cost) {
  if (S.contrib < cost) { log("贡献不足。", "c-bad"); return; }
  S.contrib -= cost;
  addItem(fragId, 1);
  log(`你兑换了 1 个残卷。`, "c-gold");
  save(); render();
}

/* ========== 洞府升级 ========== */
function upgradeCave(key, price) {
  if (S.stone < price) return;
  if (key === "spirit" && S.cave.spirit >= 10) { log("灵气密度已达上限。", "c-bad"); return; }
  S.stone -= price;
  S.cave[key]++;
  log(`升级洞府：${key} Lv.${S.cave[key]}。`, "c-gold");
  save(); render();
}

/* ========== 兑换法术秘籍 ========== */
function exchangeSpellBook(bookId, cost) {
  const book = ITEMS[bookId];
  if (!book || book.type !== "spellbook") return;
  if (S.contrib < cost) { log("贡献不足。", "c-bad"); return; }

  if (hasSpell(book.spellId)) { log("已学会该法术。", "c-bad"); return; }

  S.contrib -= cost;
  addItem(bookId, 1);
  log(`你兑换了【${book.name}】，可在背包中参悟。`, "c-gold");
  save(); render();
}

/* ========== 兑换召唤秘籍 ========== */
function exchangeSummonBook(bookId, cost) {
  const book = ITEMS[bookId];
  if (!book || book.type !== "summonbook") return;
  if (S.contrib < cost) { log("贡献不足。", "c-bad"); return; }

  if (S.combatSkills && S.combatSkills.learned.includes(book.summonId)) {
    log("已学会该召唤。", "c-bad"); return;
  }

  S.contrib -= cost;
  addItem(bookId, 1);
  log(`你兑换了【${book.name}】，可在背包中参悟。`, "c-gold");
  save(); render();
}

/* ========== 购买装备 ========== */
function buyShopEquip(id, price) {
  if (S.contrib < price) { log("贡献不足。", "c-bad"); return; }

  const eq = ITEMS[id];
  if (!eq) { log("装备不存在。", "c-bad"); return; }

  if (hasItem(id)) { log("已拥有该装备。", "c-bad"); return; }

  S.contrib -= price;
  addItem(id, 1);

  log(`你购买了【${eq.name}】。`, "c-gold");
  save(); render();
  showActionModal("购买成功", [
    `获得：${eq.name}`,
    `可在【角色>背包>装备】中装配`,
  ]);
}