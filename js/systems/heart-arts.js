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

/* 兑换心法 —— 宗门已不卖本体，此函数保留但不建议使用 */
function exchangeArt(artId, cost) {
  if (S.contrib < cost) { log("贡献不足。", "c-bad"); return; }
  const check = canLearnArt(artId);
  if (!check.ok) { log(`无法学习：${check.reason}`, "c-bad"); return; }

  S.contrib -= cost;
  S.heartArts.learned.push(artId);
  const art = HEART_ARTS.find(a => a.id === artId);
  S.heartArts.progress[artId] = {
    lvl: 0,
    exp: 0,
    proficiency: 0,
    maxLearn: 1,
  };

  updateElementLvl();
  log(`【兑换】你学会了心法《${art.name}》！`, "c-gold");
  save(); render();
  showActionModal("兑换成功", [
    `学会心法：${art.name}`,
    `可在【角色>心法】切换使用`,
  ]);
}


/* ============================================================
   残卷系统
   ============================================================ */

/* 玩家是否有某个残卷 */
function hasFragment(fragId) {
  return S.fragments && S.fragments[fragId] > 0;
}

/* 玩家获得残卷 */
function addFragment(fragId, count) {
  count = count || 1;
  if (!S.fragments) S.fragments = {};
  S.fragments[fragId] = (S.fragments[fragId] || 0) + count;

  const found = getFragmentById(fragId);
  if (found) {
    log(`【获得残卷】${found.fragment.name} ×${count}`, "c-gold");
  }
  save();
}

/* 使用残卷
   规则：
   1. 未学本体时，只有 start === 1 的残卷能入门
   2. 已学本体时，必须 start === maxLearn + 1 才能接续
   3. B 规则：必须 lvl === maxLearn（当前段圆满）才能用下一卷
   4. 已达该残卷上限则无需使用
*/
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

    /* 自动入门 */
    S.heartArts.learned.push(art.id);
    S.heartArts.progress[art.id] = {
      lvl: 0,
      exp: 0,
      proficiency: 0,
      maxLearn: fragment.end,
    };
    if (!S.heartArts.current) S.heartArts.current = art.id;

    /* 消耗残卷 */
    S.fragments[fragId]--;
    if (S.fragments[fragId] <= 0) delete S.fragments[fragId];

    updateElementLvl();

    log(`【入门】你参悟《${fragment.name}》，学会心法《${art.name}》！`, "c-gold");
    save(); renderProfile(); render();
    showActionModal("参悟残卷 · 入门", [
      `使用：${fragment.name}`,
      `学会心法：《${art.name}》`,
      `可修炼至 Lv.${fragment.end}`,
    ]);
    return;
  }

  /* ---------- 情况 2：已学本体 ---------- */
  const prog = getArtProgress(art.id);

  /* 已达该残卷上限 */
  if (prog.maxLearn >= fragment.end) {
    log(`【${art.name}】已解锁至 Lv.${prog.maxLearn}，无需此残卷。`, "c-bad");
    return;
  }

  /* 链式接续检查 */
  if (fragment.start !== prog.maxLearn + 1) {
    log(`【${art.name}】当前上限 Lv.${prog.maxLearn}，需先获得 Lv.${prog.maxLearn + 1} 起的残卷。`, "c-bad");
    return;
  }

  /* B 规则：当前段必须圆满 */
  if (prog.lvl < prog.maxLearn) {
    log(`需先将【${art.name}】练至 Lv.${prog.maxLearn} 圆满，才能参悟下一卷。`, "c-bad");
    return;
  }

  /* 消耗残卷 */
  S.fragments[fragId]--;
  if (S.fragments[fragId] <= 0) delete S.fragments[fragId];

  prog.maxLearn = fragment.end;

  updateElementLvl();

  log(`【参悟残卷】${fragment.name}，【${art.name}】解锁至 Lv.${fragment.end}。`, "c-gold");
  save(); renderProfile(); render();
  showActionModal("参悟残卷", [
    `使用：${fragment.name}`,
    `【${art.name}】上限提升至 Lv.${fragment.end}`,
  ]);
}

/* 列出玩家拥有的所有残卷（用于 UI） */
function listOwnedFragments() {
  const list = [];
  if (!S.fragments) return list;
  for (const fragId in S.fragments) {
    if (S.fragments[fragId] <= 0) continue;
    const found = getFragmentById(fragId);
    if (!found) continue;
    list.push({
      id: fragId,
      count: S.fragments[fragId],
      fragment: found.fragment,
      art: found.art,
    });
  }
  return list;
}

/* 随机抽一个残卷（用于探索/秘境掉落） */
function getRandomFragment() {
  const all = [];
  for (const art of HEART_ARTS) {
    if (!art.fragments) continue;
    for (const f of art.fragments) {
      all.push({ fragment: f, art });
    }
  }
  if (all.length === 0) return null;
  return pick(all);
}

/* 抽一个"玩家当前可用的下一卷"（可选，给掉落用）
   优先级：未入门且 start=1 的 > 已入门且接得上的下一卷 */
function getUsableFragment() {
  const pool = [];
  for (const art of HEART_ARTS) {
    if (!art.fragments) continue;
    const learned = S.heartArts.learned.includes(art.id);

    if (!learned) {
      const f = art.fragments.find(x => x.start === 1);
      if (f) pool.push({ fragment: f, art });
    } else {
      const prog = getArtProgress(art.id);
      const f = art.fragments.find(x => x.start === prog.maxLearn + 1);
      if (f && prog.lvl >= prog.maxLearn) pool.push({ fragment: f, art });
    }
  }
  if (pool.length === 0) return getRandomFragment();
  return pick(pool);
}