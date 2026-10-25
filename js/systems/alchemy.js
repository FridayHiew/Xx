/* ============================================================
   systems/alchemy.js - 炼丹系统（品级版）
   ============================================================ */

/* ============================================================
   基础查询
   ============================================================ */

function getAlchemyCaveLv() {
  return (S.cave && S.cave.alchemy) || 0;
}

function getAlchemySkillLv() {
  return (S.skills && S.skills["炼丹"] && S.skills["炼丹"].lvl) || 0;
}

function isAlchemyUnlocked() {
  return getAlchemyCaveLv() >= 1;
}

/* ============================================================
   丹方解锁
   ============================================================ */

function isRecipeKnown(recipeId) {
  return !!(S.flags && S.flags.knownRecipes && S.flags.knownRecipes[recipeId]);
}

function unlockRecipe(recipeId, cost) {
  if (isRecipeKnown(recipeId)) return { ok: false, reason: "已解锁" };
  const recipe = getRecipe(recipeId);
  if (!recipe) return { ok: false, reason: "丹方不存在" };
  if (S.contrib < cost) return { ok: false, reason: "贡献不足" };

  S.contrib -= cost;
  if (!S.flags.knownRecipes) S.flags.knownRecipes = {};
  S.flags.knownRecipes[recipeId] = true;

  log(`【丹方阁】解锁丹方《${recipe.name}》（${cost} 贡献）。`, "c-gold");
  return { ok: true };
}

/* ============================================================
   产出公式
   ============================================================ */

function calcAlchemyOutput() {
  const caveLv = getAlchemyCaveLv();
  let bonus = 0;

  if (caveLv >= 1) bonus += (caveLv - 1) * 0.5;

  const lv = getAlchemySkillLv();
  if (lv >= 9) bonus += 2;
  else if (lv >= 6) bonus += 1;
  else if (lv >= 3) bonus += 0.5;

  if (S.flags.alchemyBuff && S.flags.alchemyBuff.output > 0) {
    bonus += S.flags.alchemyBuff.output;
  }

  if (S.mood >= 1) bonus += 0.5;

  return Math.max(1, Math.min(10, Math.floor(1 + bonus)));
}

/* 炼丹成功率（不含品级惩罚，品级由 roll 决定） */
function calcAlchemyRate(recipeId) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return 0;

  let rate = recipe.rate || 0.5;
  rate += getAlchemySkillLv() * 0.01;

  if (S.flags.alchemyBuff && S.flags.alchemyBuff.rate > 0) {
    rate += S.flags.alchemyBuff.rate;
  }

  if (S.mood >= 1) rate += 0.03;
  else if (S.mood <= -1) rate -= 0.05;

  return Math.max(0.05, Math.min(0.99, rate));
}

/* ============================================================
   品级分布
   ------------------------------------------------------------
   成功时（roll 到成功）：
   - 1 品：50%
   - 2 品：30%
   - 3 品：15%
   - 4 品：4%
   - 5 品：1%
   ============================================================ */

function rollPillGrade() {
  const r = Math.random();
  if (r < 0.50) return 1;
  if (r < 0.80) return 2;
  if (r < 0.95) return 3;
  if (r < 0.99) return 4;
  return 5;
}

/* ============================================================
   材料检查
   ============================================================ */

function checkAlchemyMaterial(recipeId, count) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return { ok: false, list: [] };

  const list = [];
  let allOk = true;

  for (const baseId in recipe.mat) {
    const perOne = recipe.mat[baseId];
    const need = perOne * count;
    const itemId = `${baseId}_${recipe.tier}`;
    const have = (S.inventory && S.inventory[itemId]) || 0;
    const ok = have >= need;
    if (!ok) allOk = false;
    list.push({ itemId, baseId, need, have, ok });
  }

  return { ok: allOk, list };
}

/* ============================================================
   炼丹
   ============================================================ */

function doAlchemy(recipeId) {
  if (!isAlchemyUnlocked()) {
    log("炼丹房尚未解锁（需先在洞府设施中升级）。", "c-bad");
    return;
  }

  if (!isRecipeKnown(recipeId)) {
    log("尚未解锁该丹方，请到宗门【丹方阁】购买。", "c-bad");
    return;
  }

  const recipe = getRecipe(recipeId);
  if (!recipe) { log("丹方不存在。", "c-bad"); return; }

  if (S.actionsUsed >= ACTIONS_PER_SLOT) {
    log("本时段行动已用完。", "c-bad");
    return;
  }

  const maxOutput = calcAlchemyOutput();

  const check = checkAlchemyMaterial(recipeId, maxOutput);
  if (!check.ok) {
    let canDo = 0;
    for (let c = maxOutput; c >= 1; c--) {
      if (checkAlchemyMaterial(recipeId, c).ok) {
        canDo = c;
        break;
      }
    }
    if (canDo <= 0) {
      log("材料不足，无法炼丹。", "c-bad");
      return;
    }
    showModal("材料不足", `
      <p>你想炼 <b>${maxOutput}</b> 粒，但材料不足。</p>
      <p>当前最多可炼 <b>${canDo}</b> 粒。</p>
      <p class="small">是否炼 ${canDo} 粒？</p>
    `, [
      { label: `炼 ${canDo} 粒`, fn: () => { closeModal(); executeAlchemy(recipeId, canDo); } },
      { label: "取消", fn: closeModal },
    ]);
    return;
  }

  executeAlchemy(recipeId, maxOutput);
}

function executeAlchemy(recipeId, count) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return;

  /* 扣材料 */
  for (const baseId in recipe.mat) {
    const need = recipe.mat[baseId] * count;
    const itemId = `${baseId}_${recipe.tier}`;
    removeItem(itemId, need);
  }

  /* 逐粒判定 */
  const rate = calcAlchemyRate(recipeId);
  const templateId = recipe.name + "_" + recipe.tier + "阶";

  /* 品级统计 */
  const gradeCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (let i = 0; i < count; i++) {
    if (chance(rate)) {
      /* 成功 → roll 品级 */
      const g = rollPillGrade();
      gradeCount[g]++;
    } else {
      /* 失败 → 0 品 */
      gradeCount[0]++;
    }
  }

  /* 添加物品 */
  const detail = [];
  const itemNames = [];
  for (let g = 0; g <= 5; g++) {
    if (gradeCount[g] <= 0) continue;
    const item = getOrCreatePillItem(templateId, g);
    if (!item) continue;
    addItem(item.id, gradeCount[g]);
    itemNames.push(`${item.name} ×${gradeCount[g]}`);
  }

  /* 消耗 1 行动 */
  S.actionsUsed++;

  /* 炼丹技能熟练度：成功粒数 × 0.5 */
  const successCount = count - gradeCount[0];
  if (successCount > 0) {
    const inc = successCount * 0.5;
    if (!S.skills["炼丹"]) S.skills["炼丹"] = { lvl: 0, exp: 0 };
    S.skills["炼丹"].exp = +(S.skills["炼丹"].exp + inc).toFixed(2);

    while (S.skills["炼丹"].exp >= SKILL_LVL_EXP
           && S.skills["炼丹"].lvl < MAX_SKILL_LVL) {
      S.skills["炼丹"].exp = +(S.skills["炼丹"].exp - SKILL_LVL_EXP).toFixed(2);
      S.skills["炼丹"].lvl++;
      log(`【技能提升】炼丹 提升到 Lv.${S.skills["炼丹"].lvl}！`, "c-gold");
    }
  }

  log(`炼丹 ${count} 粒：成功 ${successCount} 粒（${itemNames.join("、") || "无"}）${gradeCount[0] > 0 ? "，失败 " + gradeCount[0] + " 粒" : ""}`, successCount > 0 ? "c-gold" : "c-bad");

  /* 若跨时段 */
  if (S.actionsUsed >= ACTIONS_PER_SLOT && S.hour < 2) {
    S.hour++;
    S.actionsUsed = 0;
    log(`【时间】进入${HOURS[S.hour]}。`, "c-blue");
    if (S.hour === 2) setTimeout(() => { nightPrompt(); }, 300);
  }

  save(); render();

  /* 结算弹窗 */
  const lines = [];
  lines.push(`丹方：${recipe.name}（${recipe.tier} 阶）`);
  lines.push(`投入：${count} 份材料`);
  lines.push(`成功率：${(rate * 100).toFixed(1)}%`);
  lines.push(`—— 产出 ——`);
  for (let g = 5; g >= 0; g--) {
    if (gradeCount[g] <= 0) continue;
    const label = g === 0 ? "废丹" : `${g} 品`;
    lines.push(`${label}：${gradeCount[g]} 粒`);
  }
  if (successCount > 0) {
    lines.push(`炼丹熟练度 +${(successCount * 0.5).toFixed(2)}`);
  }
  lines.push(`消耗 1 行动`);

  showActionModal("炼丹结束", lines);
}

/* ============================================================
   丹方详情弹窗
   ============================================================ */

function showRecipeDetail(recipeId) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return;

  const matText = Object.entries(recipe.mat)
    .map(([base, cnt]) => `${base}_${recipe.tier} ×${cnt}`).join(" + ");

  const template = ITEMS[recipe.name + "_" + recipe.tier + "阶"];
  let effectLine = recipe.desc || "—";
  if (template && template.baseEffect && template.baseEffect[recipe.tier]) {
    effectLine += `（5 品基础值 ${template.baseEffect[recipe.tier]}）`;
  }

  showModal(`${recipe.name} · 详情`, `
    <p><b>阶位：</b>${recipe.tier} 阶</p>
    <p><b>配方：</b>${matText}</p>
    <p><b>效果：</b>${effectLine}</p>
    <p class="small">基础成功率：${(recipe.rate * 100).toFixed(0)}%</p>
    <p class="small">品级分布：1品 50%，2品 30%，3品 15%，4品 4%，5品 1%</p>
    <p class="small">失败产出：0 品废丹</p>
  `, [{ label: "关闭", fn: closeModal }]);
}

/* ============================================================
   点击"炼" → 直接开始炼丹
   ============================================================ */

function showRecipeGradeSelect(recipeId) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return;
  if (!isRecipeKnown(recipeId)) {
    log("尚未解锁该丹方。", "c-bad");
    return;
  }

  const output = calcAlchemyOutput();
  const check = checkAlchemyMaterial(recipeId, 1);
  const rate = calcAlchemyRate(recipeId);

  const matLines = check.list.map(m => {
    const color = m.ok ? "#7fbf5f" : "#d05a4a";
    return `<span style="color:${color};">${m.baseId}_${recipe.tier} ×${m.need}（有 ${m.have}）</span>`;
  }).join(" + ");

  showModal(`炼制 ${recipe.name}`, `
    <p class="small">${recipe.tier} 阶丹药，每炼一次产出 ${output} 粒</p>
    <p><b>成功率：</b>${(rate * 100).toFixed(1)}%</p>
    <div class="card">
      <div class="small">${matLines}</div>
    </div>
    <p class="small">品级分布：1品 50%，2品 30%，3品 15%，4品 4%，5品 1%</p>
    <p class="small">失败产出：0 品废丹</p>
  `, [
    { label: "取消", fn: closeModal },
    { label: check.ok ? `开始炼制` : "材料不足", primary: true, fn: () => {
      if (!check.ok) return;
      closeModal();
      doAlchemy(recipeId);
    }},
  ]);
}

/* ============================================================
   Buff 处理
   ============================================================ */

function applyAlchemyBuff(pill) {
  if (!pill.effect) return;
  const key = pill.effect.key;
  if (key === "alchemyBuff") {
    if (!S.flags.alchemyBuff) S.flags.alchemyBuff = {};
    S.flags.alchemyBuff.rate = Math.max(S.flags.alchemyBuff.rate || 0, pill.effect.rate || 0);
    S.flags.alchemyBuff.output = Math.max(S.flags.alchemyBuff.output || 0, pill.effect.output || 0);
    log(`【凝火丹】炼丹成功率 +${(S.flags.alchemyBuff.rate * 100).toFixed(0)}%，产出 +${S.flags.alchemyBuff.output}。`, "c-gold");
  }
}

function processDailyAlchemyBuff() {
  if (S.flags.alchemyBuff) {
    delete S.flags.alchemyBuff;
  }
}