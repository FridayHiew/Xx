/* ============================================================
   core/utils.js - 工具函数
   ============================================================ */

const rnd = (a, b) => Math.random() * (b - a) + a;
const rndInt = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const chance = p => Math.random() < p;

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return "0";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "兆";
  if (n >= 1e8)  return (n / 1e8).toFixed(2) + "亿";
  if (n >= 1e4)  return (n / 1e4).toFixed(2) + "万";
  return Math.floor(n).toString();
}

function subName(zhong) {
  if (zhong <= 3) return "初期";
  if (zhong <= 6) return "中期";
  if (zhong <= 9) return "后期";
  return "圆满";
}

function isBreakPoint(realm, sub) {
  return sub === 3 || sub === 6 || sub === 9;
}

function slotName(slot) {
  return { weapon: "武器", armor: "防具", ring: "饰品" }[slot] || slot;
}

/* 货币 */
function isStoneTier() {
  const rank = S.flags.rank || "杂务";
  return RANKS.indexOf(rank) >= 2;
}
function currencyName() { return isStoneTier() ? "灵石" : "铜钱"; }
function getCurrency()   { return isStoneTier() ? S.stone : S.money; }
function addCurrency(n)  { if (isStoneTier()) S.stone += n; else S.money += n; }
function spendCurrency(n) {
  if (isStoneTier()) {
    if (S.stone < n) return false;
    S.stone -= n; return true;
  } else {
    if (S.money < n) return false;
    S.money -= n; return true;
  }
}

/* 灵根 */
function maxRoot(roots) {
  let mx = 0, key = null;
  for (const k in roots) if (roots[k] > mx) { mx = roots[k]; key = k; }
  return { key, val: mx };
}
function rootRate(roots) {
  const mx = maxRoot(roots);
  if (mx.val === 0) return 0;
  return 0.6 + mx.val * 0.13;
}
function heartRateByRoot(roots) {
  const mx = maxRoot(roots);
  const table = [0, 0.5, 0.7, 0.9, 1.1, 1.3, 1.6, 1.9, 2.3, 2.8];
  return table[Math.min(9, mx.val)] || 0;
}
function genRoots() {
  const roots = {};
  ROOT_TYPES.forEach(r => { roots[r.id] = 0; });
  const roll = Math.random();
  if (roll < 0.10) {
    roots[pick(ROOT_TYPES).id] = rndInt(8, 9);
  } else if (roll < 0.35) {
    const ks = [...ROOT_TYPES].sort(() => Math.random() - 0.5).slice(0, 2).map(x => x.id);
    ks.forEach(k => roots[k] = rndInt(5, 7));
  } else if (roll < 0.65) {
    const ks = [...ROOT_TYPES].sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.id);
    ks.forEach(k => roots[k] = rndInt(3, 5));
  } else if (roll < 0.90) {
    ["jin", "mu", "shui", "huo", "tu"].forEach(k => roots[k] = rndInt(2, 4));
  } else {
    ROOT_TYPES.forEach(r => { if (chance(0.5)) roots[r.id] = rndInt(1, 3); });
    if (Math.max(...Object.values(roots)) < 1) roots[pick(ROOT_TYPES).id] = rndInt(1, 3);
  }
  return roots;
}

/* 心法匹配度 */
function calcArtMatch(art) {
  if (!art) return 50;
  let match;
  if (art.type === "正") {
    match = 100 - Math.abs(S.talent.zheng - art.reqZheng);
  } else if (art.type === "邪") {
    match = 100 - Math.abs(S.talent.xie - art.reqXie);
  } else {
    const m1 = 100 - Math.abs(S.talent.zheng - art.reqZheng);
    const m2 = 100 - Math.abs(S.talent.xie - art.reqXie);
    match = (m1 + m2) / 2;
  }
  return Math.max(0, Math.min(100, Math.round(match)));
}

/* 心法查询 */
function getCurrentArt() {
  if (!S.heartArts || !S.heartArts.current) return null;
  return HEART_ARTS.find(a => a.id === S.heartArts.current);
}
function getArtProgress(artId) {
  if (!S.heartArts.progress[artId]) {
    S.heartArts.progress[artId] = { lvl: 0, exp: 0, proficiency: 0 };
  }
  const prog = S.heartArts.progress[artId];
  if (prog.lvl === undefined) prog.lvl = 0;
  if (prog.exp === undefined) prog.exp = 0;
  if (prog.proficiency === undefined) prog.proficiency = 0;
  return prog;
}

/* 玩家境界信息：{ realm, lvl } */
/* realm: 0=凡人, 1=炼气, 2=筑基, 3=金丹 */
/* lvl: 该境界内的重数（1~10） */
function getPlayerRealmInfo() {
  let bestRealm = 0;
  let bestLvl = 0;

  if (!S.heartArts) return { realm: 0, lvl: 0 };

  for (const artId of S.heartArts.learned) {
    const art = HEART_ARTS.find(a => a.id === artId);
    const prog = S.heartArts.progress[artId];
    if (!art || !prog) continue;

    if (art.realm > bestRealm ||
        (art.realm === bestRealm && prog.lvl > bestLvl)) {
      bestRealm = art.realm;
      bestLvl = prog.lvl;
    }
  }
  return { realm: bestRealm, lvl: bestLvl };
}

/* 兼容旧函数 */
function getPlayerRealm() {
  return getPlayerRealmInfo().lvl;
}

/* 心法加成（每属性取最高值） */
function getHeartBonus() {
  const bonus = { power: 0, atk: 0, def: 0, mp: 0, hp: 0 };
  if (!S.heartArts) return bonus;
  for (const artId of S.heartArts.learned) {
    const art = HEART_ARTS.find(a => a.id === artId);
    const prog = S.heartArts.progress[artId];
    if (!art || !prog || prog.lvl <= 0) continue;
    const levelData = art.levels.find(l => l.lvl === prog.lvl);
    if (!levelData) continue;
    if (levelData.power > bonus.power) bonus.power = levelData.power;
    if (levelData.atk   > bonus.atk)   bonus.atk   = levelData.atk;
    if (levelData.def   > bonus.def)   bonus.def   = levelData.def;
    if (levelData.mp    > bonus.mp)    bonus.mp    = levelData.mp;
    if (levelData.hp    > bonus.hp)    bonus.hp    = levelData.hp;
  }
  return bonus;
}

/* 学心法条件 */
function canLearnArt(artId) {
  const art = HEART_ARTS.find(a => a.id === artId);
  if (!art) return { ok: false, reason: "心法不存在" };
  if (S.heartArts.learned.includes(artId)) return { ok: false, reason: "已学" };

  const playerInfo = getPlayerRealmInfo();

  /* 学筑基心法：需要炼气 10 重圆满 */
  if (art.realm === 2) {
    if (playerInfo.realm < 1 || playerInfo.lvl < 10) {
      return { ok: false, reason: "需炼气 10 重圆满" };
    }
  }
  /* 学金丹心法：需要筑基 10 重圆满 */
  if (art.realm === 3) {
    if (playerInfo.realm < 2 || playerInfo.lvl < 10) {
      return { ok: false, reason: "需筑基 10 重圆满" };
    }
  }
  /* 学炼气心法（realm=1）：需要玩家已在炼气期 */
  if (art.realm === 1 && playerInfo.realm < 1) {
    return { ok: false, reason: `需先突破到炼气期` };
  }

  /* 悟性 */
  if (art.type === "正" && S.talent.zheng < art.reqZheng) {
    return { ok: false, reason: `正悟性不足（需 ${art.reqZheng}）` };
  }
  if (art.type === "邪" && S.talent.xie < art.reqXie) {
    return { ok: false, reason: `邪悟性不足（需 ${art.reqXie}）` };
  }
  if (art.type === "中立") {
    if (S.talent.zheng < art.reqZheng || S.talent.xie < art.reqXie) {
      return { ok: false, reason: `悟性不足` };
    }
  }

  /* 灵根 */
  if (maxRoot(S.roots).val < art.reqRoot) {
    return { ok: false, reason: `最高灵根不足（需 ${art.reqRoot}）` };
  }

  return { ok: true };
}

/* 修炼检查 */
function canCultivateHeart() {
  const art = getCurrentArt();
  if (!art) return { ok: false, reason: "没有心法" };

  const playerInfo = getPlayerRealmInfo();
  if (playerInfo.realm < art.realm) {
    return { ok: false, reason: `需${REALMS[art.realm].name}期以上` };
  }
  if (art.type === "正" && S.talent.zheng < art.reqZheng) {
    return { ok: false, reason: `正悟性不足（需 ${art.reqZheng}）` };
  }
  if (art.type === "邪" && S.talent.xie < art.reqXie) {
    return { ok: false, reason: `邪悟性不足（需 ${art.reqXie}）` };
  }
  if (art.type === "中立") {
    if (S.talent.zheng < art.reqZheng || S.talent.xie < art.reqXie) {
      return { ok: false, reason: `悟性不足` };
    }
  }
  if (maxRoot(S.roots).val < art.reqRoot) {
    return { ok: false, reason: `最高灵根不足（需 ${art.reqRoot}）` };
  }

  const prog = getArtProgress(art.id);
  if (prog.lvl >= art.maxLvl) {
    return { ok: false, reason: `【${art.name}】已满级` };
  }

  return { ok: true };
}

/* 杂务耗时 */
function calcChoreActions(todo, remain) {
  const chore = S.dailyQuest.chore;
  const skillVal = S.choreSkill[chore.id] || 0;
  let reduction = 0;
  if (skillVal >= 100) {
    for (const tid in S.tools) {
      const tool = SHOP_ITEMS.find(x => x.id === tid);
      if (tool && tool.chore === chore.id) {
        if (tool.lvl === 3) reduction = Math.max(reduction, todo - 1);
        else if (tool.lvl === 2) reduction = Math.max(reduction, Math.floor(todo / 2));
      }
    }
  }
  const need = Math.max(1, todo - reduction);
  return Math.min(need, remain);
}


/* ========== 属性等级 ========== */

/* 由心法等级算属性等级：每 2 级 = 1 属性点，上限 = ceil(maxLvl/2) */
function calcElementLvl(artLvl, maxLvl) {
  if (artLvl <= 0) return 0;
  const elementMax = Math.ceil(maxLvl / 2);
  return Math.min(elementMax, Math.ceil(artLvl / 2));
}

/* 更新玩家属性等级（取所有已学心法的最高值） */
function updateElementLvl() {
  if (!S.elementLvl) {
    S.elementLvl = { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0, lei: 0, bing: 0 };
  }
  /* 重置 */
  ROOT_TYPES.forEach(r => { S.elementLvl[r.id] = 0; });

  for (const artId of S.heartArts.learned) {
    const art = HEART_ARTS.find(a => a.id === artId);
    const prog = S.heartArts.progress[artId];
    if (!art || !prog || !art.element) continue;

    const lvl = calcElementLvl(prog.lvl, art.maxLvl);
    if (lvl > S.elementLvl[art.element]) {
      S.elementLvl[art.element] = lvl;
    }
  }
}


/* ========== 加成 + 残卷 ========== */

/* 心法加成（继承境界）：
   1 + min(当前心法等级, 其他心法最高等级) × 0.1 */
function calcRealmBonus(art) {
  const prog = getArtProgress(art.id);

  /* 排除当前心法，其他心法最高等级 */
  let maxOtherLvl = 0;
  for (const artId of S.heartArts.learned) {
    if (artId === art.id) continue;
    const p = S.heartArts.progress[artId];
    if (p && p.lvl > maxOtherLvl) maxOtherLvl = p.lvl;
  }

  const bonusLvl = Math.min(prog.lvl, maxOtherLvl);
  return 1 + bonusLvl * 0.1;
}

/* 按 id 找残卷（跨所有心法） */
function getFragmentById(fragId) {
  for (const art of HEART_ARTS) {
    if (!art.fragments) continue;
    const f = art.fragments.find(x => x.id === fragId);
    if (f) return { fragment: f, art };
  }
  return null;
}

/* 使用残卷 */
function learnFragment(fragId) {
  const found = getFragmentById(fragId);
  if (!found) { log("残卷不存在。", "c-bad"); return; }
  const { fragment, art } = found;

  /* 玩家必须已学该心法 */
  if (!S.heartArts.learned.includes(art.id)) {
    log(`你尚未学习【${art.name}】，无法使用此残卷。`, "c-bad");
    return;
  }

  const prog = getArtProgress(art.id);

  /* 若已达上限，无需使用 */
  if (prog.maxLearn >= fragment.end) {
    log(`【${art.name}】已解锁至 Lv.${prog.maxLearn}，无需此残卷。`, "c-bad");
    return;
  }

  prog.maxLearn = fragment.end;
  log(`【残卷】你参悟了《${fragment.name}》，【${art.name}】解锁至 Lv.${fragment.end}。`, "c-gold");
  save(); render();
  showActionModal("残卷参悟", [
    `使用：${fragment.name}`,
    `【${art.name}】上限提升至 Lv.${fragment.end}`,
  ]);
}