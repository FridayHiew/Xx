/* ============================================================
   ui/render.js - 主渲染入口
   ============================================================ */

function render() {
  if (!S) return;
  renderStatus();
  renderTabs();

  const box = document.getElementById("panelContent");
  if (currentTab === "day") box.innerHTML = renderDay();
  else if (currentTab === "sect") box.innerHTML = renderSect();
  else if (currentTab === "social") box.innerHTML = renderSocial();
  else if (currentTab === "cave") box.innerHTML = renderCave();
  else if (currentTab === "cultivatePage") box.innerHTML = renderCultivatePage();
}

/* ========== Debug ========== */
function debugComplete() {
  const art = getCurrentArt();
  if (!art) { log("没有心法。", "c-bad"); return; }
  const prog = getArtProgress(art.id);
  prog.proficiency = 100;
  if (prog.lvl === 0) {
    /* 凡人：直接可突破 */
  } else if (prog.lvl < art.maxLvl) {
    const curLevelData = art.levels.find(l => l.lvl === prog.lvl);
    if (curLevelData) prog.exp = curLevelData.expNeed;
  }
  log(`[DEBUG] ${art.name} 熟练度 100，修为满`, "c-gold");
  save(); render();
}

function debugStartBattle() {
  const options = [];
  for (const tier in FIGHT_ENEMIES) {
    FIGHT_ENEMIES[tier].forEach(e => {
      options.push({ label: `${e.name}（${tier}）`, fn: () => {
        closeModal();
        startBattle([{ enemyId: e.id }]);
      }});
    });
  }
  options.push({ label: "取消", fn: closeModal });

  showModal("测试战斗 · 选择敌人", "<p>选一个敌人开战：</p>", options);
}

function debugFullHeal() {
  S.hp = totalMaxHp();
  S.mp = totalMaxMp();
  log(`[DEBUG] 气血、灵力全满`, "c-gold");
  save(); render();
}

function debugRestoreHp() {
  S.hp = totalMaxHp();
  log(`[DEBUG] 气血全满`, "c-gold");
  save(); render();
}

function debugRestoreMp() {
  S.mp = totalMaxMp();
  log(`[DEBUG] 灵力全满`, "c-gold");
  save(); render();
}

function debugPromoteToMennei() {
  S.flags.rank = "门内";
  if (!S.peak) {
    S.peak = pick(PEAKS).id;
  }
  addNPCsForRank("门内");
  log("[DEBUG] 晋升门内", "c-gold");
  save(); render();
}

function debugStartBattleMulti() {
  const options = [
    { label: "1 只野狼", fn: () => { closeModal(); startBattle([{ enemyId: "e_wolf" }]); } },
    { label: "2 只（野狼 + 黑蛇）", fn: () => { closeModal(); startBattle([
      { enemyId: "e_wolf" }, { enemyId: "e_snake" }
    ]); } },
    { label: "3 只（野狼 + 黑蛇 + 山猪）", fn: () => { closeModal(); startBattle([
      { enemyId: "e_wolf" }, { enemyId: "e_snake" }, { enemyId: "e_boar" }
    ]); } },
    { label: "取消", fn: closeModal },
  ];
  showModal("测试群战", "<p>选择怪物数量：</p>", options);
}

function debugAddMoney() {
  S.money += 1000;
  log("[DEBUG] 铜钱 +1000", "c-gold");
  save(); render();
}

function debugAddStone() {
  S.stone += 1000;
  log("[DEBUG] 灵石 +1000", "c-gold");
  save(); render();
}

function debugAddProficiency() {
  const art = getCurrentArt();
  if (!art) { log("[DEBUG] 没有心法", "c-bad"); return; }
  const prog = getArtProgress(art.id);
  prog.proficiency = 100;
  log(`[DEBUG] ${art.name} 熟练度设为 100`, "c-gold");
  save(); render();
}

function debugAddContrib() {
  S.contrib += 100;
  log("[DEBUG] 宗门贡献 +100", "c-gold");
  save(); render();
}

function toggleDebugRoot() {
  debugShowRoot = !debugShowRoot;
  log(`[DEBUG] 灵根显示：${debugShowRoot ? "开" : "关"}`, "c-gold");
  render();
}

/* ========== Debug：加材料 ========== */

function debugAddMaterial() {
  if (typeof MAT_BASE === "undefined" || !MAT_BASE) {
    log("[DEBUG] 材料数据未加载", "c-bad");
    return;
  }

  /* 第一步：选材料 */
  const options = MAT_BASE.map(m => ({
    label: `${m.name}（1~${m.maxGrade} 品）`,
    fn: () => { closeModal(); debugAddMaterialGrade(m); },
  }));
  options.push({ label: "取消", fn: closeModal });

  showModal("加材料 · 选择材料", "<p>选择要加入背包的材料：</p>", options);
}

function debugAddMaterialGrade(mat) {
  /* 第二步：选品级 */
  const options = [];
  for (let g = 1; g <= mat.maxGrade; g++) {
    options.push({
      label: `${g} 品`,
      fn: () => { closeModal(); debugAddMaterialCount(mat, g); },
    });
  }
  options.push({ label: "取消", fn: closeModal });

  showModal(`加材料 · ${mat.name}`, "<p>选择品级：</p>", options);
}

function debugAddMaterialCount(mat, grade) {
  /* 第三步：选数量 */
  const itemId = mat.id + "_" + grade;
  const amounts = [1, 10, 100];
  const options = amounts.map(n => ({
    label: `+${n}`,
    fn: () => {
      closeModal();
      addItem(itemId, n);
      log(`[DEBUG] 获得 ${mat.name}_${grade} ×${n}`, "c-gold");
      save(); render();
    },
  }));
  options.push({
    label: "+1000",
    fn: () => {
      closeModal();
      addItem(itemId, 1000);
      log(`[DEBUG] 获得 ${mat.name}_${grade} ×1000`, "c-gold");
      save(); render();
    },
  });
  options.push({ label: "取消", fn: closeModal });

  showModal(`加材料 · ${mat.name}（${grade} 品）`, "<p>选择数量：</p>", options);
}

/* ========== Debug：加丹方 ========== */

function debugAddRecipe() {
  if (typeof RECIPES === "undefined" || !RECIPES) {
    log("[DEBUG] 丹方数据未加载", "c-bad");
    return;
  }

  const unknown = RECIPES.filter(r => !isRecipeKnown(r.id));
  if (unknown.length === 0) {
    log("[DEBUG] 已解锁全部丹方", "c-gold");
    return;
  }

  /* 分页或全部列出：这里简单列全部 */
  const options = unknown.map(r => ({
    label: `${r.name}（${r.maxGrade} 品）`,
    fn: () => {
      closeModal();
      if (!S.flags.knownRecipes) S.flags.knownRecipes = {};
      S.flags.knownRecipes[r.id] = true;
      log(`[DEBUG] 解锁丹方《${r.name}》`, "c-gold");
      save(); render();
    },
  }));

  /* 全部解锁 */
  options.unshift({
    label: "★ 全部解锁 ★",
    fn: () => {
      closeModal();
      if (!S.flags.knownRecipes) S.flags.knownRecipes = {};
      RECIPES.forEach(r => { S.flags.knownRecipes[r.id] = true; });
      log(`[DEBUG] 解锁全部丹方（${RECIPES.length} 个）`, "c-gold");
      save(); render();
    },
  });

  options.push({ label: "取消", fn: closeModal });

  showModal("加丹方 · 未解锁列表", `<p>共 ${unknown.length} 个未解锁：</p>`, options);
}

/* ========== 结局 ========== */

function die(reason) {
  /* 逆天宝物：免死 */
  if (typeof checkRevive === "function" && checkRevive()) {
    save(); render();
    return;
  }

  showModal("身死道消", `<p>${reason}</p><p>道号：${S.name}　享年：${Math.floor(S.life)}岁</p>`, [
    { label: "重开一生", fn: () => { closeModal(); resetGame(); } }
  ]);
  S.hp = 0;
  save();
}

function win() {
  showModal("飞升成仙", `<p>你渡过天劫，白日飞升！</p>`, [
    { label: "重开一生", fn: () => { closeModal(); resetGame(); } }
  ]);
}

function debugAddFragment() {
  const frag = getRandomFragment();
  if (!frag) { log("[DEBUG] 无残卷", "c-bad"); return; }
  addFragment(frag.fragment.id, 1);
  log(`[DEBUG] 获得 ${frag.fragment.name}`, "c-gold");
  save(); render();
}

function debugAddHeavenDefying() {
  const allHd = HEAVEN_DEFYING.filter(h => !S.heavenDefying.owned[h.id]);
  if (allHd.length === 0) { log("[DEBUG] 已拥有全部逆天宝物", "c-bad"); return; }
  const hd = pick(allHd);
  addHeavenDefying(hd.id);
  const disp = getHeavenDefyingDisplay(hd.id);
  log(`[DEBUG] 获得逆天宝物：${disp.name}`, "c-gold");
  save(); render();
}