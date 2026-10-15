/* ============================================================
   systems/fight.js - 探索（战斗已迁移到 battle.js）
   ============================================================ */

/* ============================================================
   按玩家境界掉落材料的品级
   ------------------------------------------------------------
   凡人 / 炼气 → 1~2 品
   筑基       → 3~5 品
   金丹       → 6~7 品
   元婴+      → 8~9 品
   ============================================================ */

function getMaterialGradeRange() {
  const info = getPlayerRealmInfo();
  const realm = info.realm;

  if (realm <= 1) return { min: 1, max: 2 };   /* 凡人 / 炼气 */
  if (realm === 2) return { min: 3, max: 5 };  /* 筑基 */
  if (realm === 3) return { min: 6, max: 7 };  /* 金丹 */
  return { min: 8, max: 9 };                   /* 元婴+ */
}

/* 按品级范围随机掉一个材料 */
function pickRandomMaterialId() {
  const range = getMaterialGradeRange();
  const pool = [];

  if (typeof MAT_BASE === "undefined" || !MAT_BASE) return null;

  MAT_BASE.forEach(m => {
    /* 材料的最大品级要够 */
    const maxG = Math.min(m.maxGrade, range.max);
    for (let g = range.min; g <= maxG; g++) {
      pool.push(m.id + "_" + g);
    }
  });

  if (pool.length === 0) return null;
  return pick(pool);
}

/* 按品级范围随机掉若干个不同材料 */
function pickRandomMaterials(count) {
  const result = {};
  for (let i = 0; i < count; i++) {
    const id = pickRandomMaterialId();
    if (!id) continue;
    result[id] = (result[id] || 0) + 1;
  }
  return result;
}

/* ============================================================
   探索
   ============================================================ */

function doExplore() {
  /* 35% 概率遇敌 */
  if (chance(0.35)) {
    const enemy = pick(FIGHT_ENEMIES.normal);
    startBattle([{ enemyId: enemy.id }]);
    return;
  }

  const detail = [];

  /* 事件类型随机 */
  const roll = Math.random();

  if (roll < 0.50) {
    /* 采药 / 拾取材料：按玩家境界掉 1~3 个 */
    const count = rndInt(1, 3);
    const mats = pickRandomMaterials(count);
    const texts = [];

    for (const matId in mats) {
      const cnt = mats[matId];
      addItem(matId, cnt);
      const item = ITEMS[matId];
      const name = item ? item.name : matId;
      const grade = item && item.grade ? `${item.grade}品` : "";
      texts.push(`${name}${grade ? "（" + grade + "）" : ""} ×${cnt}`);
    }

    const t = pick([
      "你在林间发现一片药草。",
      "你在溪边捧起一泓清泉。",
      "你在崖壁上采到几株灵药。",
      "你在草丛中捡到一些炼丹材料。",
    ]);
    log("· " + t, "c-blue");
    detail.push(t);
    if (texts.length > 0) {
      detail.push(`获得：${texts.join("、")}`);
    }
  }
  else if (roll < 0.65) {
    /* 灵石 / 铜钱 */
    const isStone = isStoneTier();
    if (isStone) {
      const n = rndInt(2, 6);
      S.stone += n;
      log(`· 你在一处废洞中找到几块灵石。`, "c-blue");
      detail.push("发现废弃洞府");
      detail.push(`灵石 +${n}`);
    } else {
      const n = rndInt(5, 15);
      S.money += n;
      log(`· 你在路旁捡到一个钱袋。`, "c-blue");
      detail.push("捡到钱袋");
      detail.push(`铜钱 +${n}`);
    }
  }
  else if (roll < 0.85) {
    /* 修为 */
    const info = getPlayerRealmInfo();
    const base = 10 + info.realm * 30 + info.lvl * 2;
    const n = Math.floor(base * rnd(0.8, 1.3));
    S.exp += n;
    log(`· 你在古树下打坐，忽有所悟。`, "c-blue");
    detail.push("古树下打坐");
    detail.push(`修为 +${fmt(n)}`);
  }
  else {
    /* 无事发生 */
    const t = pick([
      "你走了一圈，没发现什么。",
      "天气不错，你散了一会儿步。",
      "你看到几只山雀在林间跳跃。",
    ]);
    log("· " + t, "c-blue");
    detail.push(t);
  }

  /* 5% 概率掉落残卷 */
  if (chance(0.05)) {
    const frag = getRandomFragment();
    if (frag) {
      addFragment(frag.fragment.id, 1);
      detail.push(`获得残卷：${frag.fragment.name}`);
    }
  }

  /* 3% 概率掉法术秘籍 */
  if (chance(0.03)) {
    const allBooks = getAllItemsByType("spellbook");
    const book = pick(allBooks);
    if (book) {
      addItem(book.id, 1);
      detail.push(`获得秘籍：${book.name}`);
    }
  }

  /* 1% 概率掉逆天宝物（未拥有） */
  if (chance(0.01)) {
    const allHd = HEAVEN_DEFYING.filter(h => !S.heavenDefying.owned[h.id]);
    if (allHd.length > 0) {
      const hd = pick(allHd);
      addHeavenDefying(hd.id);
      const disp = getHeavenDefyingDisplay(hd.id);
      detail.push(`获得宝物：${disp.name}（${disp.desc}）`);
    }
  }

  /* 探索触发逆天宝物揭示 */
  if (typeof checkHeavenDefyingReveal === "function") {
    checkHeavenDefyingReveal("explore");
  }

  consumeAction(() => showActionModal("探索", detail));
}