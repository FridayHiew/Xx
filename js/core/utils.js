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
  const m = S.morality || 50;

  let match;
  if (art.type === "正") match = m;
  else if (art.type === "邪") match = 100 - m;
  else match = 100 - Math.abs(m - 50) * 2;

  return Math.max(0, Math.min(100, Math.round(match)));
}

/* 本心标签 */
function moralityLabel(m) {
  if (m <= 40) return "邪";
  if (m <= 60) return "中";
  return "正";
}

/* 检查心法本心要求 */
function checkMorality(art) {
  const m = S.morality || 50;
  if (art.reqMorality) {
    if (art.reqMorality.min !== undefined && m < art.reqMorality.min) return false;
    if (art.reqMorality.max !== undefined && m > art.reqMorality.max) return false;
    return true;
  }
  if (art.type === "正") return m >= 61;
  if (art.type === "邪") return m <= 40;
  return true;
}

/* 心法本心需求文本（UI） */
function moralityReqText(art) {
  if (art.reqMorality) {
    const parts = [];
    if (art.reqMorality.min !== undefined) parts.push(`本心 ≥ ${art.reqMorality.min}`);
    if (art.reqMorality.max !== undefined) parts.push(`本心 ≤ ${art.reqMorality.max}`);
    return parts.join(" 且 ");
  }
  if (art.type === "正") return "本心 正";
  if (art.type === "邪") return "本心 邪";
  return "无限制";
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

/* ============================================================
   玩家境界信息：{ realm, lvl }
   realm: 0=凡人, 1=炼气, 2=筑基, 3=金丹
   lvl: 该境界内的重数（1~10），0 表示凡人

   规则：
   - 每本心法的 realm 表示它属于哪个大境界
   - prog.lvl = 0 表示还没进入该大境界
     · realm=1 且 lvl=0 → 凡人
     · realm=2 且 lvl=0 → 炼气圆满
     · realm=3 且 lvl=0 → 筑基圆满
   - prog.lvl > 0 → 该大境界的 lvl 重
   - 取所有已学心法里能推算出的最高境界
   ============================================================ */
function getPlayerRealmInfo() {
  let bestRealm = 0;
  let bestLvl = 0;

  if (!S.heartArts) return { realm: 0, lvl: 0 };

  for (const artId of S.heartArts.learned) {
    const art = HEART_ARTS.find(a => a.id === artId);
    const prog = S.heartArts.progress[artId];
    if (!art || !prog) continue;

    const realm = art.realm || 1;

    let r, l;
    if (prog.lvl === 0) {
      r = realm - 1;
      l = 10;
      if (r === 0) { r = 0; l = 0; }   /* realm=1 且 lvl=0 → 凡人 */
    } else {
      r = realm;
      l = prog.lvl;
    }

    if (r > bestRealm || (r === bestRealm && l > bestLvl)) {
      bestRealm = r;
      bestLvl = l;
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
  const bonus = { power: 0, atk: 0, def: 0, mp: 0, hp: 0, speed: 0 };
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
    if ((levelData.speed || 0) > bonus.speed) bonus.speed = levelData.speed || 0;
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

  /* 明火心法：需炼气期以上 */
  if (artId === "minghuo_heart" && playerInfo.realm < 1) {
    return { ok: false, reason: "需炼气期以上" };
  }

  /* 本心 */
  if (!checkMorality(art)) {
    return { ok: false, reason: `本心不足（${moralityReqText(art)}）` };
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
  if (playerInfo.realm < art.realm - 1) {
    return { ok: false, reason: `需${REALMS[art.realm - 1].name}期以上` };
  }
  if (!checkMorality(art)) {
    return { ok: false, reason: `本心不足（${moralityReqText(art)}）` };
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
      const tool = ITEMS[tid];
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
  const item = ITEMS[fragId];
  if (!item || item.type !== "heartFragment") return null;
  const art = HEART_ARTS.find(a => a.id === item.artId);
  if (!art) return null;
  return {
    fragment: { id: fragId, name: item.name, start: item.start, end: item.end },
    art: art,
  };
}

/*
   ★ A-4：findEquipById 改为直查 ITEMS[id]
   原来用 EQUIPS / ARTIFACTS 两个加载时快照，会与运行时追加（如炼器）不同步。
   直查 ITEMS 是唯一真相源。
*/
function findEquipById(id) {
  const eq = ITEMS[id];
  if (eq && (eq.type === "equip" || eq.type === "artifact")) return eq;
  if (typeof HEAVEN_DEFYING !== "undefined") {
    return HEAVEN_DEFYING.find(x => x.id === id) || null;
  }
  return null;
}


/* ============================================================
   抗性汇总
   ============================================================ */

function totalResistances() {
  const res = {
    poison: 0, burn: 0, bleed: 0,
    stun: 0, freeze: 0, silence: 0, atkDown: 0,
  };

  /* 基础 */
  if (S.resistances) {
    for (const k in S.resistances) {
      res[k] = (res[k] || 0) + S.resistances[k];
    }
  }

  /* 装备 */
  for (const slot in S.equipped) {
    const id = S.equipped[slot];
    if (!id) continue;
    const eq = findEquipById(id);
    if (eq && eq.resist) {
      for (const k in eq.resist) {
        res[k] = (res[k] || 0) + eq.resist[k];
      }
    }
  }

  /* 心法（当前等级） */
  for (const artId of S.heartArts.learned) {
    const art = HEART_ARTS.find(a => a.id === artId);
    if (!art) continue;
    const prog = S.heartArts.progress[artId];
    if (!prog || prog.lvl <= 0) continue;
    const levelData = art.levels.find(l => l.lvl === prog.lvl);
    if (levelData && levelData.resist) {
      for (const k in levelData.resist) {
        res[k] = (res[k] || 0) + levelData.resist[k];
      }
    }
  }

  /* 上限夹紧 -100 ~ 100 */
  for (const k in res) {
    res[k] = Math.max(-100, Math.min(100, res[k]));
  }

  return res;
}