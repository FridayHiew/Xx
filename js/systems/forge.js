/* ============================================================
   systems/forge.js - 炼器核心逻辑
   ============================================================ */

/* ============================================================
   基础查询
   ============================================================ */

function getForgeCaveLv() {
  return (S.cave && S.cave.forge) || 0;
}

function getForgeSkillLv() {
  return (S.skills && S.skills["炼器"] && S.skills["炼器"].lvl) || 0;
}

function isForgeUnlocked() {
  return getForgeCaveLv() >= 1;
}

/* ============================================================
   成功率公式
   ------------------------------------------------------------
   基础成功率（配方） 
   + 炼器房加成：(Lv - 1) × 5%
   + 炼器技能加成
   + 心情加成
   - 品级惩罚
   ============================================================ */

function calcForgeRate(recipe) {
  let rate = recipe.rate || 0.5;

  /* 炼器房 */
  const caveLv = getForgeCaveLv();
  if (caveLv >= 1) {
    rate += (caveLv - 1) * 0.05;
  }

  /* 炼器技能 */
  const skillLv = getForgeSkillLv();
  if (skillLv >= 9) rate += 0.15;
  else if (skillLv >= 6) rate += 0.10;
  else if (skillLv >= 3) rate += 0.05;

  /* 聚火丹 buff */
  if (S.flags.forgeBuff && S.flags.forgeBuff.rate) {
    rate += S.flags.forgeBuff.rate;
  }

  /* 心情 */
  if (S.mood >= 1) rate += 0.03;
  else if (S.mood <= -1) rate -= 0.05;

  return Math.max(0.05, Math.min(0.95, rate));
}

/* ============================================================
   材料检查
   ============================================================ */

function checkForgeMaterial(recipe) {
  const list = [];
  let allOk = true;

  for (const baseId in recipe.mats) {
    const need = recipe.mats[baseId];
    /* 材料品级按"装备品级"决定：比如炼 3 品装备，用 3 品玄铁 */
    const grade = recipe.grade;
    const itemId = baseId + "_" + grade;
    const have = (S.inventory && S.inventory[itemId]) || 0;
    const ok = have >= need;
    if (!ok) allOk = false;
    list.push({ itemId, baseId, grade, need, have, ok });
  }

  /* 灵石检查 */
  const stoneOk = S.stone >= (recipe.spiritStone || 0);

  return { ok: allOk && stoneOk, list, stoneOk };
}

/* ============================================================
   炼器
   ============================================================ */
function doForge(recipeId) {
  if (!isForgeUnlocked()) {
    log("炼器房尚未解锁（需先在洞府设施中升级）。", "c-bad");
    return;
  }

  const recipe = getForgeRecipe(recipeId);
  if (!recipe) { log("配方不存在。", "c-bad"); return; }

  if (S.actionsUsed >= ACTIONS_PER_SLOT) {
    log("本时段行动已用完。", "c-bad");
    return;
  }

  /* 材料检查 */
  const check = checkForgeMaterial(recipe);
  if (!check.ok) {
    log("材料或灵石不足，无法炼器。", "c-bad");
    return;
  }

  /* 弹确认 */
  const rate = calcForgeRate(recipe);
  showModal(`炼制 · ${recipe.name}`, `
    <p>目标品级：<span class="tag gold">${recipe.grade} 品</span></p>
    <p>成功率：<b style="color:var(--text-gold);">${(rate * 100).toFixed(1)}%</b></p>
    <div class="card">
      ${check.list.map(m => `<div class="row"><span>${m.baseId}_${m.grade}</span><span>${m.need}（有 ${m.have}）</span></div>`).join("")}
      <div class="row"><span>灵石</span><span>${recipe.spiritStone}（有 ${S.stone}）</span></div>
    </div>
    <p class="small">消耗 1 行动。失败可能炸炉（损失气血）。</p>
  `, [
    { label: "取消", fn: closeModal },
    { label: "开始炼制", primary: true, fn: () => { closeModal(); executeForge(recipe); } },
  ]);
}

function executeForge(recipe) {
  /* 扣材料 */
  for (const baseId in recipe.mats) {
    const need = recipe.mats[baseId];
    const itemId = baseId + "_" + recipe.grade;
    removeItem(itemId, need);
  }
  /* 扣灵石 */
  S.stone -= recipe.spiritStone || 0;

  /* 消耗 1 行动 */
  S.actionsUsed++;

  /* 成功率判定 */
  const rate = calcForgeRate(recipe);
  const success = chance(rate);

  /* 炸炉判定：失败时 3% 概率炸炉 */
  const exploded = !success && chance(0.03);

  const detail = [];

  if (success) {
    /* 生成装备 */
    const equip = generateForgedEquip(recipe);
    addItem(equip.id, 1);

    /* 炼器技能熟练度 */
    if (!S.skills["炼器"]) S.skills["炼器"] = { lvl: 0, exp: 0 };
    S.skills["炼器"].exp = +(S.skills["炼器"].exp + 0.5).toFixed(2);
    while (S.skills["炼器"].exp >= SKILL_LVL_EXP && S.skills["炼器"].lvl < MAX_SKILL_LVL) {
      S.skills["炼器"].exp = +(S.skills["炼器"].exp - SKILL_LVL_EXP).toFixed(2);
      S.skills["炼器"].lvl++;
      log(`【技能提升】炼器 提升到 Lv.${S.skills["炼器"].lvl}！`, "c-gold");
    }

    log(`【炼器成功】你炼出了 ${equip.name}！`, "c-gold");
    detail.push(`成功：${equip.name}`);
    detail.push(`品级：${recipe.grade} 品`);
    if (equip.affixes && equip.affixes.length > 0) {
      detail.push(`词条：${equip.affixes.map(a => a.name).join("、")}`);
    }
    detail.push(`炼器熟练度 +0.5`);

    /* 显示详细 */
    showForgedEquipModal(equip);
  } else {
    if (exploded) {
      const dmg = Math.floor(totalMaxHp() * 0.15);
      S.hp = Math.max(1, S.hp - dmg);
      S.mood = Math.max(-2, S.mood - 1);
      log(`【炼器失败】炸炉！气血 -${dmg}，心情 -1。`, "c-bad");
      detail.push("炼器失败：炸炉！");
      detail.push(`气血 -${dmg}`);
      detail.push("心情 -1");
    } else {
      log(`【炼器失败】材料尽毁，未能成器。`, "c-bad");
      detail.push("炼器失败");
    }
  }

  if (S.actionsUsed >= ACTIONS_PER_SLOT && S.hour < 2) {
    S.hour++;
    S.actionsUsed = 0;
    log(`【时间】进入${HOURS[S.hour]}。`, "c-blue");
    if (S.hour === 2) setTimeout(() => { nightPrompt(); }, 300);
  }

  save();
  render();

  if (!success || !detail.length) {
    showActionModal("炼器结束", detail);
  }
}

/* ============================================================
   生成装备
   ============================================================ */
function generateForgedEquip(recipe) {
  const grade = recipe.grade;
  const gradeNames = ["", "凡品", "下品", "中品", "上品", "极品", "灵品", "仙品"];
  const gradePrefix = gradeNames[grade] || "";

  /* 基础属性（按品级 + 配方） */
  const baseAtk = recipe.slot === "rightHand" ? grade * 8 : 0;
  const baseDef = (recipe.slot === "body" || recipe.slot === "leftHand") ? grade * 5 : 0;
  const baseHp = (recipe.slot === "body" || recipe.slot === "accessory") ? grade * 20 : 0;
  const baseMp = (recipe.slot === "accessory") ? grade * 8 : 0;

  /* 词条 */
  const affixes = rollAffixes(grade);

  /* 生成唯一 id（避免和旧装备冲突） */
  const id = `forged_${recipe.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const equip = {
    id: id,
    type: "equip",
    name: `${gradePrefix}${recipe.name}`,
    slot: recipe.slot,
    grade: grade,
    atk: baseAtk,
    def: baseDef,
    hp: baseHp,
    mp: baseMp,
    price: grade * 100,
    desc: `${gradePrefix}炼制品（${affixes.length} 词条）`,
    affixes: affixes,
    forged: true,
  };

  /* 注册到 ITEMS */
  ITEMS[id] = equip;
  /* ★ A-1：同步桶 */
  if (typeof registerItemToBucket === "function") {
    registerItemToBucket(id);
  }

  /* ★ 存到 S.forgedItems（存档持久化） */
  if (!S.forgedItems) S.forgedItems = {};
  S.forgedItems[id] = equip;

  return equip;
}

/* ============================================================
   展示装备详情
   ============================================================ */
function showForgedEquipModal(equip) {
  const affixHtml = (equip.affixes || []).map(a =>
    `<div class="row"><span>${a.name}</span><b>${formatAffixValue(a)}</b></div>`
  ).join("") || "<p class='empty'>无词条</p>";

  showModal("炼器成功", `
    <div style="text-align:center; margin-bottom:10px;">
      <div style="font-size:36px;">⚒️</div>
      <div style="font-family:var(--font-serif); color:var(--text-gold); font-size:16px; letter-spacing:2px; margin-top:6px;">
        ${equip.name}
      </div>
    </div>
    <div class="card">
      <div class="row"><span>品级</span><b>${equip.grade} 品</b></div>
      <div class="row"><span>部位</span><b>${SLOT_NAMES[equip.slot] || equip.slot}</b></div>
      <div class="row"><span>攻击</span><b>+${equip.atk || 0}</b></div>
      <div class="row"><span>防御</span><b>+${equip.def || 0}</b></div>
      <div class="row"><span>气血</span><b>+${equip.hp || 0}</b></div>
      <div class="row"><span>灵力</span><b>+${equip.mp || 0}</b></div>
    </div>
    <h4>词条</h4>
    <div class="card">${affixHtml}</div>
  `, [
    { label: "收下", primary: true, fn: closeModal },
  ]);
}

/* 词条数值格式化 */
function formatAffixValue(affix) {
  let str = affix.format;
  str = str.replace("%s", affix.value);
  str = str.replace("%d", affix.value);
  return str;
}

/* ============================================================
   词条属性聚合（供 totalAtk 等函数调用）
   ============================================================ */

/* 从所有已装备的物品中汇总词条属性 */
function getAffixBonuses() {
  const bonus = {
    atk: 0, def: 0, hpMax: 0, mpMax: 0,
    critRate: 0, critMult: 0,
    lifesteal: 0, reflect: 0, spellBonus: 0, hitRate: 0, hpRegen: 0,
  };

  if (!S.equipped) return bonus;

  for (const slot in S.equipped) {
    const id = S.equipped[slot];
    if (!id) continue;
    const eq = ITEMS[id];
    if (!eq || !eq.affixes) continue;

    eq.affixes.forEach(a => {
      if (bonus[a.stat] !== undefined) {
        bonus[a.stat] += a.value;
      }
    });
  }

  return bonus;
}

/* 存储袋 / 战利品中产出的随机装备（用于冒险地/秘境掉落） */
function randomForgedEquip(grade) {
  const pool = FORGE_RECIPES.filter(r => r.grade === grade);
  if (pool.length === 0) return null;
  const recipe = pick(pool);
  return generateForgedEquip(recipe);
}