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
  tabs.push("基本功");
  tabs.push("心法");
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
  else if (currentSectTab === "基本功") {
    html += renderTeachArts(sect);
  }
  else if (currentSectTab === "心法") {
    html += renderSectArts(sect);
  }
  else if (currentSectTab === "阵法") {
    html += `<h4>宗门阵法</h4><p class="small">门内弟子可学习阵法。</p>`;
  }
  else if (currentSectTab === "藏经阁") {
    html += renderLibrary();
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
    const it = SHOP_ITEMS.find(x => x.id === itemId);
    if (!it) return;
    const owned = !!S.tools[it.id];
    html += `<div class="card">
      <b>${it.name}</b> <span class="tag">${it.cat}类</span>
      <div class="small">${it.desc}</div>
      <div class="small">价格：${it.price} ${currencyName()}</div>
      ${owned ? '<span class="tag good">已购买</span>' : `<button onclick="buyShopItem('${it.id}')" ${cur < it.price ? "disabled" : ""}>购买</button>`}
    </div>`;
  });
  return html;
}

function renderTeachArts(sect) {
  let html = `<h4>基本功</h4>`;
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

/* 心法页 = 残卷兑换页 */
function renderSectArts(sect) {
  let html = `<h4>残卷兑换</h4>`;
  html += `<p class="small">本门不授完整心法，只以残卷相传。用贡献兑换你当前能接续的下一卷。</p>`;

  let any = false;

  /* 1) 未入门的心法：显示 start=1 的起始残卷 */
  /* 2) 已入门的心法：显示 start = maxLearn+1 的下一卷（且需当前段圆满） */
  const allArts = HEART_ARTS;

  allArts.forEach(art => {
    if (!art.fragments || art.fragments.length === 0) return;

    /* 只列本门或通用 */
    if (art.sect !== null && art.sect !== S.sect) return;

    const learned = S.heartArts.learned.includes(art.id);

    if (!learned) {
      const f = art.fragments.find(x => x.start === 1);
      if (!f) return;
      any = true;
      const price = FRAGMENT_PRICE[f.end] || 100;
      const owned = (S.fragments && S.fragments[f.id]) || 0;
      html += `<div class="card">
        <b>${f.name}</b> <span class="tag">${art.name}</span>
        <div class="small">入门残卷，解锁 Lv.${f.start} ~ Lv.${f.end}</div>
        <div class="small">价格：${price} 贡献　已拥有：${owned}</div>
        <button onclick="exchangeFragment('${f.id}', ${price})" ${S.contrib < price ? "disabled" : ""}>
          兑换（${price}贡献）
        </button>
      </div>`;
    } else {
      const prog = getArtProgress(art.id);
      const nextStart = prog.maxLearn + 1;
      const f = art.fragments.find(x => x.start === nextStart);
      if (!f) return;

      any = true;
      const price = FRAGMENT_PRICE[f.end] || 100;
      const owned = (S.fragments && S.fragments[f.id]) || 0;
      const needFull = prog.lvl < prog.maxLearn;
      const fullHint = needFull
        ? `<div class="small" style="color:#d05a4a;">需先练至 Lv.${prog.maxLearn} 圆满</div>`
        : "";

      html += `<div class="card">
        <b>${f.name}</b> <span class="tag">${art.name}</span>
        <div class="small">续卷，解锁 Lv.${f.start} ~ Lv.${f.end}</div>
        <div class="small">当前上限 Lv.${prog.maxLearn}　当前等级 Lv.${prog.lvl}</div>
        <div class="small">价格：${price} 贡献　已拥有：${owned}</div>
        ${fullHint}
        <button onclick="exchangeFragment('${f.id}', ${price})" ${S.contrib < price ? "disabled" : ""}>
          兑换（${price}贡献）
        </button>
      </div>`;
    }
  });

  if (!any) {
    html += `<p class="empty">暂无可兑换的残卷。</p>`;
  }

  return html;
}

function renderLibrary() {
  let html = `<h4>藏经阁</h4>`;
  html += `<p class="small">用贡献兑换丹药、材料。</p>`;
  html += `<div class="row"><span>回血丹</span><span><button onclick="exchange('回血丹',20)" ${S.contrib < 20 ? "disabled" : ""}>20贡献</button></span></div>`;
  html += `<div class="row"><span>聚气丹</span><span><button onclick="exchange('聚气丹',40)" ${S.contrib < 40 ? "disabled" : ""}>40贡献</button></span></div>`;
  return html;
}

/* ========== 洞府 ========== */
function renderCave() {
  const c = S.cave;
  const rank = S.flags.rank || "杂务";
  if (RANKS.indexOf(rank) < 2) {
    return `<h3>洞府</h3><p class="small">门内弟子才有资格拥有洞府。</p>`;
  }
  const up = (key, name, cost) => {
    const lvl = c[key];
    const price = cost * (lvl + 1);
    return `<div class="row"><span>${name} Lv.${lvl}</span>
      <span><button onclick="upgradeCave('${key}',${price})" ${S.stone < price ? "disabled" : ""}>升级(${price})</button></span></div>`;
  };
  return `
    <h3>洞府 Lv.${c.level}　灵气 ${1 + c.spirit}/11</h3>
    ${up("alchemy", "炼丹房", 50)}
    ${up("garden", "药园", 40)}
    ${up("spirit", "聚灵阵", 120)}
  `;
}