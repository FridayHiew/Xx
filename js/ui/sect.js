/* ============================================================
   ui/sect.js - 宗门面板 / 洞府面板
   ============================================================ */

function renderSect() {
  if (!S.sect) return `<h3>宗门</h3><p class="small">尚未拜入宗门。</p>`;
  const sect = SECTS.find(s => s.id === S.sect);
  const rank = S.flags.rank || "杂务";

  const tabs = ["简介"];
  if (rank !== "杂务") tabs.push("宗门事务");
  if (RANKS.indexOf(rank) >= 2) {
    tabs.push("阵法");
    tabs.push("藏经阁");
  }
  if (rank === "杂务" || rank === "门外") tabs.push("杂役铺");
  tabs.push("传功殿");
  tabs.push("丹方阁");
  tabs.push("装备铺");

  const uniqueTabs = [...new Set(tabs)];

  let html = `<h3>${sect.name} <span class="tag ${sect.camp === "正道" ? "good" : sect.camp === "邪道" ? "bad" : "gold"}">${sect.camp}</span>
    <span class="tag">Lv.${sect.level}</span>
    <button class="help" onclick="showRankHelp()">?</button>
  </h3>`;

  html += `<div class="subtabs">`;
  uniqueTabs.forEach(t => {
    const locked = sectTabLocked(t);
    html += `<div class="subtab ${currentSectTab === t ? 'active' : ''} ${locked ? 'locked' : ''}"
      ${locked ? `title="未解锁"` : `onclick="switchSectTab('${t}')"`}>${t}${locked ? '🔒' : ''}</div>`;
  });
  html += `</div>`;

  if (currentSectTab === "简介") {
    html += renderSectInfo(sect, rank);
  }
  else if (currentSectTab === "宗门事务") {
    html += renderSectTasks(rank);
  }
  else if (currentSectTab === "杂役铺") {
    html += renderShop();
  }
  else if (currentSectTab === "传功殿") {
    html += renderChuanGongDian(sect);
  }
  else if (currentSectTab === "阵法") {
    html += `<h4>宗门阵法</h4><p class="small">门内弟子可学习阵法。</p>`;
  }
  else if (currentSectTab === "藏经阁") {
    html += renderLibrary();
  }
  else if (currentSectTab === "丹方阁") {
    html += renderRecipeShop();
  }
  else if (currentSectTab === "装备铺") {
    html += renderSectEquipShop(sect);
  }
  return html;
}

function renderSectInfo(sect, rank) {
  let html = `<h4>简介</h4>`;
  html += `<div class="card">
    <b>${sect.name}</b> <span class="tag">Lv.${sect.level}</span>
    <div class="small">特色：${sect.specialty}　心法：${sect.art}</div>
    <div class="small">${sect.desc}</div>
  </div>`;
  html += `<h4>我的身份</h4>`;
  html += `<div class="row"><span>身份</span><b>${rank}</b></div>`;
  html += `<div class="row"><span>贡献</span><b>${S.contrib}</b></div>`;
  if (S.peak) {
    const peak = PEAKS.find(p => p.id === S.peak);
    html += `<div class="row"><span>所在峰</span><b>${peak.name}</b></div>`;
  }
  if (S.master) {
    const m = S.npcMap[S.master];
    if (m) html += `<div class="row"><span>师父</span><b>${m.name}</b></div>`;
  }
  html += `<h4>晋升</h4>`;
  const nextRank = RANKS[RANKS.indexOf(rank) + 1];
  if (nextRank) {
    const req = RANK_REQ[nextRank];
    const canUp = canPromoteTo(nextRank);
    html += `<p class="small">下一身份：<b>${nextRank}</b>　要求：${req.desc}</p>`;
    html += `<button class="block" onclick="tryPromote()" ${canUp ? "" : "disabled"}>申请晋升</button>`;
  } else {
    html += `<p class="small">你已是最高身份。</p>`;
  }
  return html;
}

function renderSectTasks(rank) {
  let html = `<h4>宗门事务</h4>`;
  const chores = rank === "杂务" ? CHORES_FAN : rank === "门外" ? CHORES_MENWAI : CHORES_MENNEI;
  chores.forEach(c => {
    html += `<div class="row"><span>${c.name}</span><span class="small">熟练 ${(S.choreSkill[c.id] || 0).toFixed(2)}%</span></div>`;
  });
  return html;
}

function renderShop() {
  let html = `<h4>杂役铺</h4>`;
  html += `<p class="small">每天刷新商品，帮你完成杂务，或找点乐子。</p>`;
  if (currentShopDay !== S.day) refreshShop();

  const cur = getCurrency();
  html += `<div class="row" style="border-bottom:1px solid #3a3020;padding-bottom:6px;">
    <span class="small">不满意？刷新一批新货</span>
    <button onclick="refreshShopPaid()" ${cur < SHOP_REFRESH_COST ? "disabled" : ""}>刷新（${SHOP_REFRESH_COST}${currencyName()}）</button>
  </div>`;

  currentShopStock.forEach(itemId => {
    const it = ITEMS[itemId];
    if (!it) return;
    const owned = !!S.tools[itemId];
    html += `<div class="card">
      <b>${it.name}</b> <span class="tag">${it.cat}类</span>
      <div class="small">${it.desc}</div>
      <div class="small">价格：${it.price} ${currencyName()}</div>
      ${owned ? '<span class="tag good">已购买</span>' : `<button onclick="buyShopItem('${itemId}')" ${cur < it.price ? "disabled" : ""}>购买</button>`}
    </div>`;
  });
  return html;
}

/* ============================================================
   传功殿
   ============================================================ */

function switchCGDTab(t) {
  currentCGDTab = t;
  render();
}

function renderChuanGongDian(sect) {
  let html = `<h4>传功殿</h4>`;

  html += `<div class="subtabs">`;
  ["基本功", "心法", "法术", "召唤"].forEach(t => {
    html += `<div class="subtab ${currentCGDTab === t ? 'active' : ''}"
      onclick="switchCGDTab('${t}')">${t}</div>`;
  });
  html += `</div>`;

  if (currentCGDTab === "基本功") html += renderTeachArts(sect);
  else if (currentCGDTab === "心法") html += renderSectArts(sect);
  else if (currentCGDTab === "法术") html += renderSectSpells(sect);
  else if (currentCGDTab === "召唤") html += renderSectSummons(sect);

  return html;
}

function renderTeachArts(sect) {
  let html = `<h5 style="color:#d8b878;margin:8px 0 4px;">基本功</h5>`;
  html += `<p class="small">花铜钱学习本门基础功法。</p>`;
  const weaponName = sect.weapon || sect.name.slice(0, 2);
  const cur = getCurrency();
  TEACH_ARTS_BASE.forEach(a => {
    const learned = S.learnedArts[a.id];
    const artName = weaponName + a.name;
    html += `<div class="row">
      <span>${artName}（${a.skill}）</span>
      <span>${learned ? '<span class="tag good">已学</span>' : `<button onclick="learnTeachArt('${a.id}', ${a.cost})" ${cur < a.cost ? "disabled" : ""}>${a.cost}${currencyName()}</button>`}</span>
    </div>`;
  });
  return html;
}

function renderSectArts(sect) {
  const playerInfo = getPlayerRealmInfo();
  const playerRealm = playerInfo.realm;

  let html = `<h5 style="color:#d8b878;margin:8px 0 4px;">心法</h5>`;
  html += `<p class="small">用贡献兑换心法"上卷"，可在背包中参悟。</p>`;

  /* ===== 商店区 ===== */
  const allItems = getShopItems(SECT_ART_SHOP, S.sect);
  const available = filterShopByRealm(allItems, playerRealm);

  if (available.length > 0) {
    html += `<h6 style="color:#d8b878;margin:8px 0 4px;">可兑换心法</h6>`;

    available.forEach(item => {
      const art = HEART_ARTS.find(a => a.id === item.artId);
      if (!art) return;
      const bookId = item.artId + "_f1";
      const book = ITEMS[bookId];
      if (!book) return;

      const learned = S.heartArts.learned.includes(item.artId);
      const check = canLearnArt(item.artId);
      const owned = (S.inventory && S.inventory[bookId]) || 0;

      html += `<div class="card">
        <b>${book.name}</b> <span class="tag">${art.type}</span>
        <div class="small">${art.desc || ""}</div>
        <div class="small">解锁 Lv.1 ~ Lv.${book.end}</div>
        <div class="small">需求：${moralityReqText(art)} / 最高灵根 ${art.reqRoot}</div>
        <div class="small">价格：${item.price} 贡献　已拥有：${owned}</div>
        ${learned
          ? '<span class="tag good">已学</span>'
          : (check.ok
              ? `<button onclick="exchangeArt('${item.artId}', ${item.price})" ${S.contrib < item.price ? "disabled" : ""}>兑换（${item.price}贡献）</button>`
              : `<span class="small" style="color:#d05a4a;">${check.reason}</span>`)
        }
      </div>`;
    });
  } else {
    html += `<p class="small">当前境界暂无可兑换心法。</p>`;
  }

  /* ===== 残卷区：只显示已学心法的下一卷 ===== */
  html += `<h6 style="color:#d8b878;margin:14px 0 4px;">残卷兑换</h6>`;
  html += `<p class="small">残卷用于解锁更高等级上限。</p>`;

  let any = false;
  S.heartArts.learned.forEach(artId => {
    const art = HEART_ARTS.find(a => a.id === artId);
    if (!art) return;

    const prog = getArtProgress(artId);
    const nextStart = prog.maxLearn + 1;

    const nextFrag = getAllItemsByType("heartFragment")
      .find(f => f.artId === artId && f.start === nextStart);
    if (!nextFrag) return;

    any = true;

    const price = nextFrag.price || 100;
    const owned = (S.inventory && S.inventory[nextFrag.id]) || 0;
    const needFull = prog.lvl < prog.maxLearn;
    const fullHint = needFull
      ? `<div class="small" style="color:#d05a4a;">需先练至 Lv.${prog.maxLearn} 圆满</div>`
      : "";

    html += `<div class="card">
      <b>${nextFrag.name}</b> <span class="tag">${art.name}</span>
      <div class="small">解锁 Lv.${nextFrag.start} ~ Lv.${nextFrag.end}</div>
      <div class="small">当前上限 Lv.${prog.maxLearn}　当前等级 Lv.${prog.lvl}</div>
      <div class="small">价格：${price} 贡献　已拥有：${owned}</div>
      ${fullHint}
      <button onclick="exchangeFragment('${nextFrag.id}', ${price})" ${S.contrib < price ? "disabled" : ""}>
        兑换（${price}贡献）
      </button>
    </div>`;
  });

  if (!any) {
    html += `<p class="empty">暂无可兑换的残卷。</p>`;
  }

  return html;
}

function renderSectSpells(sect) {
  const playerInfo = getPlayerRealmInfo();
  const playerRealm = playerInfo.realm;

  let html = `<h5 style="color:#d8b878;margin:8px 0 4px;">法术秘籍</h5>`;
  html += `<p class="small">用贡献兑换法术秘籍，可在背包中参悟。</p>`;

  const allItems = getShopItems(SECT_SPELL_SHOP, S.sect);
  const available = filterShopByRealm(allItems, playerRealm);

  if (available.length === 0) {
    html += `<p class="empty">当前境界暂无可兑换的法术。</p>`;
    return html;
  }

  available.forEach(item => {
    const spell = getSpell(item.spellId);
    if (!spell) return;
    const bookId = "book_" + item.spellId;
    const book = ITEMS[bookId];
    if (!book) return;

    const learned = hasSpell(item.spellId);
    const check = canLearnSpell(item.spellId);
    const owned = (S.inventory && S.inventory[bookId]) || 0;

    const reqLines = [];
    if (spell.skillReq) {
      for (const k in spell.skillReq) reqLines.push(`${k} Lv.${spell.skillReq[k]}`);
    }
    if (spell.elementReq) {
      for (const k in spell.elementReq) {
        const elName = (ROOT_TYPES.find(r => r.id === k) || {}).name || k;
        reqLines.push(`${elName}属性 ${spell.elementReq[k]}`);
      }
    }
    if (spell.artReq && spell.artReq.length > 0) {
      spell.artReq.forEach(aid => {
        const a = HEART_ARTS.find(x => x.id === aid);
        reqLines.push(`需《${a ? a.name : aid}》`);
      });
    }

    html += `<div class="card">
      <b>${spell.name}</b> <span class="tag">${spell.type}</span>
      <div class="small">${spell.desc}</div>
      <div class="small">灵力 ${spell.cost.mp}　威力 ×${spell.power}</div>
      ${reqLines.length ? `<div class="small">需求：${reqLines.join("　")}</div>` : ""}
      <div class="small">价格：${item.price} 贡献　已拥有：${owned}</div>
      ${learned
        ? '<span class="tag good">已学</span>'
        : (check.ok
            ? `<button onclick="exchangeSpellBook('${bookId}', ${item.price})" ${S.contrib < item.price ? "disabled" : ""}>兑换（${item.price}贡献）</button>`
            : `<span class="small" style="color:#d05a4a;">${check.reason}</span>`)
      }
    </div>`;
  });

  return html;
}

/* ============================================================
   召唤
   ============================================================ */

function renderSectSummons(sect) {
  const playerInfo = getPlayerRealmInfo();
  const playerRealm = playerInfo.realm;

  let html = `<h5 style="color:#d8b878;margin:8px 0 4px;">召唤秘籍</h5>`;
  html += `<p class="small">用贡献兑换召唤秘籍，可在背包中参悟。</p>`;

  const allItems = getSummonShopItems(S.sect);
  const available = filterShopByRealm(allItems, playerRealm);

  if (available.length === 0) {
    html += `<p class="empty">当前境界暂无可兑换的召唤。</p>`;
    return html;
  }

  available.forEach(item => {
    const skill = getSummonSkill(item.summonId);
    if (!skill) return;
    const bookId = "book_" + item.summonId;
    const book = ITEMS[bookId];
    if (!book) return;

    const learned = S.combatSkills && S.combatSkills.learned.includes(item.summonId);
    const owned = (S.inventory && S.inventory[bookId]) || 0;

    html += `<div class="card">
      <b>${skill.name}</b>
      <div class="small">${skill.desc}</div>
      <div class="small">灵力 ${skill.cost.mp}</div>
      <div class="small">价格：${item.price} 贡献　已拥有：${owned}</div>
      ${learned
        ? '<span class="tag good">已学</span>'
        : `<button onclick="exchangeSummonBook('${bookId}', ${item.price})" ${S.contrib < item.price ? "disabled" : ""}>兑换（${item.price}贡献）</button>`}
    </div>`;
  });

  return html;
}

/* ============================================================
   藏经阁（按品级兑换丹药）
   ============================================================ */

function renderLibrary() {
  let html = `<h4>藏经阁</h4>`;
  html += `<p class="small">用贡献兑换丹药（按品级）。当前贡献：${S.contrib}</p>`;
  html += `<p class="small">贡献价 = 基础价 × 品级 × 2</p>`;

  /* 核心丹药列表（baseId, 最大品级） */
  const exchangeList = [
    { baseId: "回血丹", maxGrade: 5 },
    { baseId: "回灵丹", maxGrade: 5 },
    { baseId: "解毒丹", maxGrade: 5 },
    { baseId: "聚气丹", maxGrade: 9 },
    { baseId: "破境丹", maxGrade: 7 },
    { baseId: "凝神丹", maxGrade: 7 },
    { baseId: "淬体丹", maxGrade: 9 },
  ];

  exchangeList.forEach(({ baseId, maxGrade }) => {
    const baseItem = ITEMS[baseId + "_1"];
    if (!baseItem) return;

    html += `<div class="card">
      <b>${baseItem.name}</b>
      <div class="small">${(baseItem.desc || "").replace(/（1 品）$/, "")}</div>
      <div class="small">可兑换 1 ~ ${maxGrade} 品</div>
    </div>`;

    for (let g = 1; g <= maxGrade; g++) {
      const itemId = baseId + "_" + g;
      const item = ITEMS[itemId];
      if (!item) continue;

      /* 贡献价 = 基础价 × 品级 × 2 */
      const contribCost = Math.floor((item.price || 0) * 2);

      const owned = (S.inventory && S.inventory[itemId]) || 0;
      const canBuy = S.contrib >= contribCost;

      html += `<div class="card" style="background:#14110c;">
        <div class="row">
          <span><b>${item.name}</b> <span class="tag gold">${g} 品</span></span>
          <span class="small">已拥有：${owned}</span>
        </div>
        <div class="small">贡献价：${contribCost}　当前贡献：${S.contrib}</div>
        <button onclick="exchange('${itemId}', ${contribCost})" ${canBuy ? "" : "disabled"}>
          兑换（${contribCost}贡献）
        </button>
      </div>`;
    }
  });

  return html;
}

/* ============================================================
   丹方阁（按贡献兑换丹方）
   ============================================================ */

function renderRecipeShop() {
  let html = `<h4>丹方阁</h4>`;
  html += `<p class="small">用贡献购买丹方，解锁后可在洞府【炼丹房】炼制。</p>`;
  html += `<p class="small">当前贡献：${S.contrib}</p>`;

  if (typeof RECIPES === "undefined" || !RECIPES) {
    return html + `<p class="empty">丹方数据未加载。</p>`;
  }

  /* 按价格分档展示 */
  const knownCount = RECIPES.filter(r => isRecipeKnown(r.id)).length;
  html += `<div class="card">
    <div class="row"><span>已解锁</span><b>${knownCount} / ${RECIPES.length}</b></div>
  </div>`;

  /* 按价格排序 */
  const sorted = [...RECIPES].sort((a, b) => (a.price || 0) - (b.price || 0));

  sorted.forEach(recipe => {
    const known = isRecipeKnown(recipe.id);
    const price = recipe.price || 100;
    const canBuy = S.contrib >= price;

    const matText = Object.entries(recipe.mat)
      .map(([base, cnt]) => `${base} ×${cnt}`).join(" + ");

    html += `<div class="card">
      <div class="row">
        <span>
          <b>${recipe.name}</b>
          <span class="tag gold">${price} 贡献</span>
        </span>
        <span>
          ${known
            ? '<span class="tag good">已解锁</span>'
            : `<button onclick="buyRecipe('${recipe.id}', ${price})" ${canBuy ? "" : "disabled"}>购买</button>`}
        </span>
      </div>
      <div class="small">配方：${matText}</div>
      <div class="small">可炼：1 ~ ${recipe.maxGrade} 品　基础成功率：${(recipe.rate * 100).toFixed(0)}%</div>
      <div class="small">${recipe.desc || ""}</div>
    </div>`;
  });

  return html;
}

/* 购买丹方 */
function buyRecipe(recipeId, price) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return;
  if (isRecipeKnown(recipeId)) { log("已解锁该丹方。", "c-bad"); return; }

  const result = unlockRecipe(recipeId, price);
  if (!result.ok) {
    log(`购买失败：${result.reason}`, "c-bad");
    return;
  }

  save(); render();
  showActionModal("解锁丹方", [
    `获得丹方：《${recipe.name}》`,
    `消耗：${price} 贡献`,
    `可在【洞府 > 炼丹房】炼制`,
  ]);
}

/* ============================================================
   装备铺
   ============================================================ */

function renderSectEquipShop(sect) {
  const playerInfo = getPlayerRealmInfo();
  const playerRealm = playerInfo.realm;

  let html = `<h4>装备铺</h4>`;
  html += `<p class="small">用贡献兑换装备。当前贡献：${S.contrib}</p>`;

  const allItems = getShopItems(SECT_EQUIP_SHOP, S.sect);
  const available = filterShopByRealm(allItems, playerRealm);

  if (available.length === 0) {
    html += `<p class="empty">当前境界暂无可兑换的装备。</p>`;
    return html;
  }

  available.forEach(item => {
    const eq = ITEMS[item.itemId];
    if (!eq) return;

    const owned = hasItem(item.itemId);
    const canBuy = S.contrib >= item.price;
    const extra = eq.spellBonus ? `　法术+${(eq.spellBonus * 100).toFixed(0)}%` : "";

    html += `<div class="card">
      <b>${eq.name}</b> <span class="tag">${SLOT_NAMES[eq.slot] || eq.slot}</span>
      <div class="small">${eq.desc || ""}</div>
      <div class="small">攻+${eq.atk || 0} 防+${eq.def || 0} 血+${eq.hp || 0} 灵+${eq.mp || 0}${extra}</div>
      <div class="small">价格：${item.price} 贡献</div>
      ${owned
        ? '<span class="tag good">已拥有</span>'
        : `<button onclick="buyShopEquip('${item.itemId}', ${item.price})" ${canBuy ? "" : "disabled"}>购买</button>`}
    </div>`;
  });

  return html;
}

/* ============================================================
   洞府
   ============================================================ */

function renderCave() {
  const c = S.cave;
  const rank = S.flags.rank || "杂务";
  if (RANKS.indexOf(rank) < 2) {
    return `<h3>洞府</h3><p class="small">门内弟子才有资格拥有洞府。</p>`;
  }

  const caveTabs = getCaveTabs();

  let html = `<h3>洞府 Lv.${c.level}　灵气 ${1 + c.spirit}/11</h3>`;

  html += `<div class="subtabs">`;
  caveTabs.forEach(t => {
    const locked = t.locked;
    html += `<div class="subtab ${currentCaveTab === t.id ? 'active' : ''} ${locked ? 'locked' : ''}"
      ${locked ? 'title="未开放"' : `onclick="switchCaveTab('${t.id}')"`}>${t.name}${locked ? '🔒' : ''}</div>`;
  });
  html += `</div>`;

  if (currentCaveTab === "facility") {
    const up = (key, name, cost) => {
      const lvl = c[key];
      const price = cost * (lvl + 1);
      return `<div class="row"><span>${name} Lv.${lvl}</span>
        <span><button onclick="upgradeCave('${key}',${price})" ${S.stone < price ? "disabled" : ""}>升级(${price})</button></span></div>`;
    };
    html += up("alchemy", "炼丹房", 50);
    html += up("garden", "药园", 40);
    html += up("spirit", "聚灵阵", 120);
  }
  else if (currentCaveTab === "alchemy") {
    if (typeof renderCaveAlchemy === "function") {
      html += renderCaveAlchemy();
    } else {
      html += `<p class="empty">炼丹房未加载。</p>`;
    }
  }
  else if (currentCaveTab === "pet") {
    html += `<div class="row" style="margin-bottom:6px;">
      <span class="small">兽粮不够？</span>
      <button onclick="openBuyPetFood()">购买兽粮</button>
    </div>`;
    html += renderCavePet();
  }
  else {
    html += `<p class="empty">未开放。</p>`;
  }

  return html;
}

function isShopItemOwned(id) {
  return hasItem(id);
}