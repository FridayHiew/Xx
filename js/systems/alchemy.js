/* ============================================================
   systems/alchemy.js - 炼丹系统
   ============================================================ */

/* ============================================================
   基础查询
   ============================================================ */

/* 炼丹房等级 */
function getAlchemyCaveLv() {
  return (S.cave && S.cave.alchemy) || 0;
}

/* 炼丹技能等级 */
function getAlchemySkillLv() {
  return (S.skills && S.skills["炼丹"] && S.skills["炼丹"].lvl) || 0;
}

/* 炼丹房是否解锁（Lv.1+） */
function isAlchemyUnlocked() {
  return getAlchemyCaveLv() >= 1;
}

/* ============================================================
   丹方解锁
   ============================================================ */

/* 是否已解锁丹方 */
function isRecipeKnown(recipeId) {
  return !!(S.flags && S.flags.knownRecipes && S.flags.knownRecipes[recipeId]);
}

/* 解锁丹方（扣贡献） */
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
   ------------------------------------------------------------
   基础产出 = 1
   炼丹房加成 = (Lv - 1) × 0.5
   炼丹技能：
     Lv.0~2  → +0
     Lv.3~5  → +0.5
     Lv.6~8  → +1
     Lv.9~10 → +2
   凝火丹 buff：+1
   心情 ≥ +1：+0.5
   总产出 = min(10, floor(1 + 所有加成))
   ============================================================ */

function calcAlchemyOutput() {
  const caveLv = getAlchemyCaveLv();
  let bonus = 0;

  /* 炼丹房 */
  if (caveLv >= 1) bonus += (caveLv - 1) * 0.5;

  /* 炼丹技能 */
  const lv = getAlchemySkillLv();
  if (lv >= 9) bonus += 2;
  else if (lv >= 6) bonus += 1;
  else if (lv >= 3) bonus += 0.5;

  /* 凝火丹 buff */
  if (S.flags.alchemyBuff && S.flags.alchemyBuff.output > 0) {
    bonus += S.flags.alchemyBuff.output;
  }

  /* 心情 */
  if (S.mood >= 1) bonus += 0.5;

  return Math.max(1, Math.min(10, Math.floor(1 + bonus)));
}

/* 炼丹成功率 */
function calcAlchemyRate(recipeId, grade) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return 0;

  let rate = recipe.rate || 0.5;

  /* 炼丹技能加成：每级 +1% */
  rate += getAlchemySkillLv() * 0.01;

  /* 凝火丹 buff：+20% */
  if (S.flags.alchemyBuff && S.flags.alchemyBuff.rate > 0) {
    rate += S.flags.alchemyBuff.rate;
  }

  /* 心情 */
  if (S.mood >= 1) rate += 0.03;
  else if (S.mood <= -1) rate -= 0.05;

  /* 品级惩罚：品级越高越难 */
  rate -= (grade - 1) * 0.02;

  return Math.max(0.05, Math.min(0.99, rate));
}

/* ============================================================
   材料检查
   ============================================================ */

/* 检查某个丹方 + 品级 + 数量 所需材料是否齐全
   返回：{ ok, list: [{itemId, baseId, need, have, ok}] } */
function checkAlchemyMaterial(recipeId, grade, count) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return { ok: false, list: [] };

  const list = [];
  let allOk = true;

  for (const baseId in recipe.mat) {
    const perOne = recipe.mat[baseId];
    const need = perOne * count;
    const itemId = `${baseId}_${grade}`;
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

/* 
   一次炼丹：
   - 消耗 count 倍材料
   - count 粒逐粒判定成功率
   - 成功粒数 = 成功次数
   - 炼丹技能熟练度 += 成功粒数 × 0.5
   - 一次炼丹消耗 1 行动
   count 上限 = calcAlchemyOutput()（最大产出）
*/
function doAlchemy(recipeId, grade) {
  /* 基础检查 */
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

  if (grade < 1 || grade > recipe.maxGrade) {
    log("品级越界。", "c-bad");
    return;
  }

  /* 行动检查 */
  if (S.actionsUsed >= ACTIONS_PER_SLOT) {
    log("本时段行动已用完。", "c-bad");
    return;
  }

  /* 最大产出 */
  const maxOutput = calcAlchemyOutput();

  /* 材料检查 */
  const check = checkAlchemyMaterial(recipeId, grade, maxOutput);
  if (!check.ok) {
    /* 找出能做多少粒 */
    let canDo = 0;
    for (let c = maxOutput; c >= 1; c--) {
      if (checkAlchemyMaterial(recipeId, grade, c).ok) {
        canDo = c;
        break;
      }
    }
    if (canDo <= 0) {
      log("材料不足，无法炼丹。", "c-bad");
      return;
    }
    /* 自动降到能做的数量 */
    showModal("材料不足", `
      <p>你想炼 <b>${maxOutput}</b> 粒，但材料不足。</p>
      <p>当前最多可炼 <b>${canDo}</b> 粒。</p>
      <p class="small">是否炼 ${canDo} 粒？</p>
    `, [
      { label: `炼 ${canDo} 粒`, fn: () => { closeModal(); executeAlchemy(recipeId, grade, canDo); } },
      { label: "取消", fn: closeModal },
    ]);
    return;
  }

  /* 材料齐全，炼满 */
  executeAlchemy(recipeId, grade, maxOutput);
}

/* 实际执行（count 粒） */
function executeAlchemy(recipeId, grade, count) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return;

  /* 扣材料 */
  for (const baseId in recipe.mat) {
    const need = recipe.mat[baseId] * count;
    const itemId = `${baseId}_${grade}`;
    removeItem(itemId, need);
  }

  /* 逐粒判定 */
  const rate = calcAlchemyRate(recipeId, grade);
  let success = 0;
  for (let i = 0; i < count; i++) {
    if (chance(rate)) success++;
  }

  const pillId = recipe.name + "_" + grade;
  const pillName = `${recipe.name}（${grade} 品）`;

  /* 消耗 1 行动 */
  S.actionsUsed++;

  /* 炼丹技能熟练度 */
  if (success > 0) {
    const inc = success * 0.5;
    if (!S.skills["炼丹"]) S.skills["炼丹"] = { lvl: 0, exp: 0 };
    S.skills["炼丹"].exp = +(S.skills["炼丹"].exp + inc).toFixed(2);

    while (S.skills["炼丹"].exp >= SKILL_LVL_EXP
           && S.skills["炼丹"].lvl < MAX_SKILL_LVL) {
      S.skills["炼丹"].exp = +(S.skills["炼丹"].exp - SKILL_LVL_EXP).toFixed(2);
      S.skills["炼丹"].lvl++;
      log(`【技能提升】炼丹 提升到 Lv.${S.skills["炼丹"].lvl}！`, "c-gold");
    }

    addItem(pillId, success);
    log(`炼丹成功 ${success} / ${count} 粒，获得 ${pillName} ×${success}。`, "c-gold");
  } else {
    log(`炼丹 ${count} 粒全部失败……`, "c-bad");
  }

  /* 若跨时段 */
  if (S.actionsUsed >= ACTIONS_PER_SLOT && S.hour < 2) {
    S.hour++;
    S.actionsUsed = 0;
    log(`【时间】进入${HOURS[S.hour]}。`, "c-blue");
    if (S.hour === 2) setTimeout(() => { nightPrompt(); }, 300);
  }

  save(); render();

  /* 结算弹窗 */
  const detail = [];
  detail.push(`丹方：${recipe.name}（${grade} 品）`);
  detail.push(`投入：${count} 份材料`);
  detail.push(`成功率：${(rate * 100).toFixed(1)}%`);
  detail.push(`成功：${success} / ${count} 粒`);
  if (success > 0) {
    detail.push(`获得：${pillName} ×${success}`);
    detail.push(`炼丹熟练度 +${(success * 0.5).toFixed(2)}`);
  }
  detail.push(`消耗 1 行动`);

  showActionModal("炼丹结束", detail);
}

/* ============================================================
   炼丹房 UI 辅助（弹窗）
   ============================================================ */

/* 点击丹方的 "?" → 显示 1~maxGrade 的详细信息 */
function showRecipeDetail(recipeId) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return;

  /* 配方文本 */
  const matText = Object.entries(recipe.mat)
    .map(([base, cnt]) => `${base} ×${cnt}`).join(" + ");

  /* 各品级效果描述 */
  /* 用 PILL_BASE 的 effect 计算 */
  const pillBase = PILL_BASE.find(p => p.name === recipe.name);
  const lines = [];

  for (let g = 1; g <= recipe.maxGrade; g++) {
    /* 尝试从 ITEMS 里找到对应丹药的描述 */
    const itemId = recipe.name + "_" + g;
    const item = ITEMS[itemId];
    const rate = calcAlchemyRate(recipeId, g);

    let effectText = "";
    if (item && item.effect) {
      effectText = formatPillEffect(item.effect);
    } else if (pillBase && pillBase.effect) {
      effectText = formatPillEffect(scalePillEffect(pillBase.effect, g));
    }

    lines.push(`<div class="row">
      <span><b>${g} 品</b>　${effectText}</span>
      <span class="small">成功率 ${(rate * 100).toFixed(1)}%</span>
    </div>`);
  }

  showModal(`${recipe.name} · 详情`, `
    <p><b>配方：</b>${matText}</p>
    <p class="small">每品消耗对应品级材料（如 3 品需 洗骨花_3）</p>
    <p class="small">基础成功率：${(recipe.rate * 100).toFixed(0)}%（品级越高越难）</p>
    <hr style="border-color:#2a2216;margin:8px 0;">
    <h4>各品级效果</h4>
    <div class="card">${lines.join("")}</div>
  `, [{ label: "关闭", fn: closeModal }]);
}

/* 格式化丹药效果文本（用于 ? 弹窗） */
function formatPillEffect(e) {
  if (!e) return "—";
  switch (e.type) {
    case "heal":     return `恢复 ${(e.value * 100).toFixed(0)}% 气血`;
    case "healMp":   return `恢复 ${(e.value * 100).toFixed(0)}% 灵力`;
    case "cure":     return `解除【${(getStatusDef(e.status) || {}).name || e.status}】`;
    case "cureAll":  return `解除所有负面`;
    case "survive":  return `濒死保命（血量 <${(e.value * 100).toFixed(0)}%）`;
    case "exp":      return `+${fmt(e.value)} 修为${e.dailyLimit ? "（每日限 " + e.dailyLimit + "）" : ""}`;
    case "breakBonus": return `突破率 +${(e.value * 100).toFixed(0)}%`;
    case "root":     return `灵根 +${e.value}`;
    case "mood":     return `心情 +${e.value}`;
    case "life":     return `寿元 +${e.value}`;
    case "permanent":return `${e.stat} +${e.value}`;
    case "social":   return `NPC 好感 +${e.value}`;
    case "buff":     return `施加【${(getStatusDef(e.statusId) || {}).name || e.statusId}】`;
    case "inflict":  return `使敌人【${(getStatusDef(e.status) || {}).name || e.status}】`;
    case "special":  return `特殊效果`;
    case "petSpecial": return `灵兽特殊`;
    default:         return "—";
  }
}

/* 点击"炼" → 弹出品级选择 */
function showRecipeGradeSelect(recipeId) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return;
  if (!isRecipeKnown(recipeId)) {
    log("尚未解锁该丹方。", "c-bad");
    return;
  }

  const output = calcAlchemyOutput();
  const lines = [];

  for (let g = 1; g <= recipe.maxGrade; g++) {
    const check = checkAlchemyMaterial(recipeId, g, 1); /* 检查 1 粒的消耗 */
    const rate = calcAlchemyRate(recipeId, g);

    /* 材料明细 */
    const matLines = check.list.map(m => {
      const color = m.ok ? "#7fbf5f" : "#d05a4a";
      return `<span style="color:${color};">${m.baseId}_${g} ×${m.need}（有 ${m.have}）</span>`;
    }).join(" + ");

    const canMake = check.ok;
    lines.push(`<div class="card" style="background:#14110c;">
      <div class="row">
        <span><b>${g} 品</b>　成功率 ${(rate * 100).toFixed(1)}%</span>
        <span>${canMake
          ? `<button onclick="closeModal(); doAlchemy('${recipeId}', ${g})">炼（${output}粒）</button>`
          : `<span class="small" style="color:#d05a4a;">材料不足</span>`}</span>
      </div>
      <div class="small" style="margin-top:2px;">${matLines}</div>
    </div>`);
  }

  showModal(`炼制 ${recipe.name}`, `
    <p class="small">选择品级，每炼一次产出 ${output} 粒（材料按 ${output} 倍消耗）</p>
    ${lines.join("")}
  `, [{ label: "关闭", fn: closeModal }]);
}

/* ============================================================
   Buff 处理（凝火丹、聚火丹、定魂丹等）
   ============================================================ */

/* 使用凝火丹 → 设 buff */
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

/* 每日清理 */
function processDailyAlchemyBuff() {
  if (S.flags.alchemyBuff) {
    delete S.flags.alchemyBuff;
  }
}