/* ============================================================
   systems/heart-arts.js - 心法系统（残卷制）
   ============================================================ */

/* 切换当前心法 */
function switchHeartArt(artId) {
  if (!S.heartArts.learned.includes(artId)) {
    log("未学该心法。", "c-bad");
    return;
  }
  S.heartArts.current = artId;
  const art = HEART_ARTS.find(a => a.id === artId);
  log(`【心法切换】当前心法：${art.name}`, "c-gold");
  save(); renderProfile(); render();
}

/* 兑换心法（给"上卷"，不直接学） */
function exchangeArt(artId, cost) {
  if (S.contrib < cost) { log("贡献不足。", "c-bad"); return; }
  const check = canLearnArt(artId);
  if (!check.ok) { log(`无法学习：${check.reason}`, "c-bad"); return; }

  S.contrib -= cost;
  addItem(artId + "_f1", 1);

  const art = HEART_ARTS.find(a => a.id === artId);
  log(`【兑换】获得《${art.name}·上卷》，可在背包中参悟。`, "c-gold");
  save(); render();

  showActionModal("兑换成功", [
    `获得：《${art.name}·上卷》`,
    `可在【背包>秘籍】中参悟`,
  ]);
}


/* ============================================================
   残卷系统
   ============================================================ */

/* 玩家是否有某个残卷 */
function hasFragment(fragId) {
  return S.inventory && S.inventory[fragId] > 0;
}

/* 玩家获得残卷 */
function addFragment(fragId, count) {
  count = count || 1;
  addItem(fragId, count);
  const found = getFragmentById(fragId);
  if (found) {
    log(`【获得残卷】${found.fragment.name} ×${count}`, "c-gold");
  }
  save();
}

/* 使用残卷 */
function useFragment(fragId) {
  if (!hasFragment(fragId)) {
    log("你没有此残卷。", "c-bad");
    return;
  }
  const found = getFragmentById(fragId);
  if (!found) {
    log("残卷不存在。", "c-bad");
    return;
  }
  const { fragment, art } = found;

  const learned = S.heartArts.learned.includes(art.id);

  /* ---------- 情况 1：未学本体 ---------- */
  if (!learned) {
    if (fragment.start !== 1) {
      log(`【${art.name}】尚未入门，需先获得 Lv.1 起的起始残卷。`, "c-bad");
      return;
    }

    S.heartArts.learned.push(art.id);
    S.heartArts.progress[art.id] = {
      lvl: 0,
      exp: 0,
      proficiency: 0,
      maxLearn: fragment.end,
    };
    if (!S.heartArts.current) S.heartArts.current = art.id;

    /* 本心变化 */
    const delta = rndInt(1, 3);
    if (art.type === "正") S.morality = Math.min(100, S.morality + delta);
    else if (art.type === "邪") S.morality = Math.max(0, S.morality - delta);

    removeItem(fragId, 1);

    updateElementLvl();

    log(`【入门】你参悟《${fragment.name}》，学会心法《${art.name}》！`, "c-gold");
    save(); renderProfile(); render();
    showActionModal("参悟残卷 · 入门", [
      `使用：${fragment.name}`,
      `学会心法：《${art.name}》`,
      `可修炼至 Lv.${fragment.end}`,
      art.type === "正" ? `本心 +${delta}` : art.type === "邪" ? `本心 -${delta}` : "",
    ].filter(Boolean));
    return;
  }

  /* ---------- 情况 2：已学本体 ---------- */
  const prog = getArtProgress(art.id);

  if (prog.maxLearn >= fragment.end) {
    log(`【${art.name}】已解锁至 Lv.${prog.maxLearn}，无需此残卷。`, "c-bad");
    return;
  }

  if (fragment.start !== prog.maxLearn + 1) {
    log(`【${art.name}】当前上限 Lv.${prog.maxLearn}，需先获得 Lv.${prog.maxLearn + 1} 起的残卷。`, "c-bad");
    return;
  }

  if (prog.lvl < prog.maxLearn) {
    log(`需先将【${art.name}】练至 Lv.${prog.maxLearn} 圆满，才能参悟下一卷。`, "c-bad");
    return;
  }

  removeItem(fragId, 1);

  prog.maxLearn = fragment.end;

  updateElementLvl();

  log(`【参悟残卷】${fragment.name}，【${art.name}】解锁至 Lv.${fragment.end}。`, "c-gold");
  save(); renderProfile(); render();
  showActionModal("参悟残卷", [
    `使用：${fragment.name}`,
    `【${art.name}】上限提升至 Lv.${fragment.end}`,
  ]);
}

/* 列出玩家拥有的所有残卷 */
function listOwnedFragments() {
  const list = [];
  if (!S.inventory) return list;

  for (const fragId in S.inventory) {
    if (S.inventory[fragId] <= 0) continue;
    const item = ITEMS[fragId];
    if (!item || item.type !== "heartFragment") continue;
    const found = getFragmentById(fragId);
    if (!found) continue;
    list.push({
      id: fragId,
      count: S.inventory[fragId],
      fragment: found.fragment,
      art: found.art,
    });
  }
  return list;
}

/* 随机抽一个残卷 */
function getRandomFragment() {
  const all = getAllItemsByType("heartFragment").map(item => {
    const art = HEART_ARTS.find(a => a.id === item.artId);
    if (!art) return null;
    return {
      fragment: { id: item.id, name: item.name, start: item.start, end: item.end },
      art: art,
    };
  }).filter(Boolean);

  if (all.length === 0) return null;
  return pick(all);
}

/* 抽一个"玩家当前可用的下一卷" */
function getUsableFragment() {
  const allFrags = getAllItemsByType("heartFragment");
  const pool = [];

  allFrags.forEach(item => {
    const art = HEART_ARTS.find(a => a.id === item.artId);
    if (!art) return;

    const learned = S.heartArts.learned.includes(art.id);

    if (!learned) {
      if (item.start === 1) {
        pool.push({
          fragment: { id: item.id, name: item.name, start: item.start, end: item.end },
          art: art,
        });
      }
    } else {
      const prog = getArtProgress(art.id);
      if (item.start === prog.maxLearn + 1 && prog.lvl >= prog.maxLearn) {
        pool.push({
          fragment: { id: item.id, name: item.name, start: item.start, end: item.end },
          art: art,
        });
      }
    }
  });

  if (pool.length === 0) return getRandomFragment();
  return pick(pool);
}