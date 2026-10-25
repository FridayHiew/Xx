/* ============================================================
   data/items/30-generate.js - 动态生成品级材料 / 品级丹药
   ------------------------------------------------------------
   规则：
   - 阶（1~9）：对应境界。1 阶炼气、2 阶筑基、3 阶金丹、4 阶元婴、
     5 阶化神、6 阶合体、7 阶大乘、8 阶半仙、9 阶真仙。
   - 品（0~5）：0 品废丹不能吃，1 品 20% 效果，5 品 100% 效果。
   - 品级物品运行时生成（不预先定义），炼丹时按成功率算品级。
   - 模板 id：`回春丹_1阶`
   - 实际物品 id：`回春丹_1阶_3品`
   ============================================================ */

/* ============================================================
   1. 品级材料
   ============================================================ */

const MAT_BASE = [
  /* 已有材料 */
  { id: "洗骨花",     name: "洗骨花",     maxGrade: 9, basePrice: 5   },
  { id: "草木灰",     name: "草木灰",     maxGrade: 9, basePrice: 2   },
  { id: "清泉水",     name: "清泉水",     maxGrade: 9, basePrice: 3   },
  { id: "玉髓芝",     name: "玉髓芝",     maxGrade: 7, basePrice: 20  },
  { id: "寒血果",     name: "寒血果",     maxGrade: 7, basePrice: 25  },
  { id: "紫猴花",     name: "紫猴花",     maxGrade: 7, basePrice: 22  },
  { id: "水系妖丹",   name: "水系妖丹",   maxGrade: 7, basePrice: 30  },
  { id: "千年降压草", name: "千年降压草", maxGrade: 9, basePrice: 100 },
  { id: "火精枣",     name: "火精枣",     maxGrade: 9, basePrice: 80  },
  { id: "妖兽精血",   name: "妖兽精血",   maxGrade: 9, basePrice: 150 },
  { id: "天地灵乳",   name: "天地灵乳",   maxGrade: 9, basePrice: 300 },

  /* 新增：丹药核心材料 */
  { id: "妖丹",       name: "妖丹",       maxGrade: 9, basePrice: 30  },
  { id: "赤血草",     name: "赤血草",     maxGrade: 9, basePrice: 10  },
  { id: "紫芝草",     name: "紫芝草",     maxGrade: 9, basePrice: 10  },
  { id: "清灵草",     name: "清灵草",     maxGrade: 9, basePrice: 15  },

  /* 新增：饲灵丸材料 */
  { id: "诱妖草",     name: "诱妖草",     maxGrade: 3, basePrice: 8   },
  { id: "清心花",     name: "清心花",     maxGrade: 3, basePrice: 8   },
  { id: "聚妖草",     name: "聚妖草",     maxGrade: 6, basePrice: 20  },
  { id: "妖肉",       name: "妖肉",       maxGrade: 6, basePrice: 25  },
  { id: "龙心九叶芝", name: "龙心九叶芝", maxGrade: 9, basePrice: 200 },
];

MAT_BASE.forEach(m => {
  for (let g = 1; g <= m.maxGrade; g++) {
    ITEMS[m.id + "_" + g] = {
      type: "mat",
      name: m.name,
      baseId: m.id,
      grade: g,
      maxGrade: m.maxGrade,
      price: m.basePrice * g,
      desc: `${g} 阶材料`,
    };
  }
});

/* ============================================================
   2. 品级丹药模板
   ------------------------------------------------------------
   每个模板只定义"阶"（它是哪个境界的丹药）。
   品级在炼丹时按成功率生成（0~5 品）。
   
   字段说明：
   - tier: 阶（1~9），必须显式给出
   - realmReq: 服用最低境界
   - baseEffect: 5 品基础效果（品级% 在运行时乘）
   - danDu: { 1: 0.1, 2: 0.08, ... } 按品级的丹毒系数（1品最高，5品0）
   - dailyLimit: 每日上限（可选）
   - recipe: 配方材料（baseId → 数量）
   - noGrade: 不分品级（如饲灵丸）
   ============================================================ */

const PILL_BASE = [
  /* ============================================================
     回血 / 回灵（1~9 阶全做）
     ============================================================ */

  ...makeTiered("回春丹", "回血丹", 1, 9, {
    type: "heal",
    baseEffect: { 1: 200, 2: 500, 3: 800, 4: 1200, 5: 1800, 6: 2600, 7: 3600, 8: 5000, 9: 7000 },
    danDu: { 1: 0.1, 2: 0.2, 3: 0.3, 4: 0.4, 5: 0.5, 6: 0.6, 7: 0.7, 8: 0.8, 9: 0.9 },
    recipe: () => ({ 洗骨花: 1, 赤血草: 2 }),
    desc: "恢复气血",
  }),

  ...makeTiered("回元丹", "回灵丹", 1, 9, {
    type: "healMp",
    baseEffect: { 1: 200, 2: 500, 3: 800, 4: 1200, 5: 1800, 6: 2600, 7: 3600, 8: 5000, 9: 7000 },
    danDu: { 1: 0.1, 2: 0.2, 3: 0.3, 4: 0.4, 5: 0.5, 6: 0.6, 7: 0.7, 8: 0.8, 9: 0.9 },
    recipe: () => ({ 洗骨花: 1, 紫芝草: 2 }),
    desc: "恢复灵力",
  }),

  /* ============================================================
     增修为（境界专属）
     ============================================================ */

  makePill("聚气丹", 1, {
    realmReq: 1,
    type: "exp",
    baseEffect: { 1: 100 },
    danDu: { 1: 0.5 },
    dailyLimit: 3,
    recipe: { 妖丹: 3, 草木灰: 5, 清泉水: 1 },
    desc: "+100 练气修为",
  }),

  makePill("聚灵丹", 2, {
    realmReq: 2,
    type: "exp",
    baseEffect: { 2: 300 },
    danDu: { 2: 0.8 },
    dailyLimit: 3,
    recipe: { 妖丹: 2, 紫猴花: 1 },
    desc: "+300 筑基修为",
  }),

  makePill("聚凝丹", 3, {
    realmReq: 3,
    type: "exp",
    baseEffect: { 3: 1000 },
    danDu: { 3: 1.0 },
    dailyLimit: 3,
    recipe: { 妖丹: 1, 千年降压草: 1, 火精枣: 3, 妖兽精血: 1 },
    desc: "+1000 金丹修为",
  }),

  /* ============================================================
     特殊
     ============================================================ */

  makePill("养精丹", 2, {
    realmReq: 2,
    type: "cureAllNonDot",
    baseEffect: {},
    danDu: { 2: 0.1 },
    recipe: { 洗骨花: 1, 赤血草: 2, 清灵草: 1 },
    desc: "解除所有非 dot 负面",
  }),

  makePill("辟谷丹", 2, {
    realmReq: 2,
    type: "fasting",
    baseEffect: { 2: 30 },
    danDu: { 2: 0.1 },
    recipe: { 妖丹: 1, 草木灰: 3, 清泉水: 2 },
    desc: "30 天免饥饿",
  }),

  makePill("定颜丹", 3, {
    realmReq: 3,
    type: "pending",
    baseEffect: {},
    danDu: { 3: 0.5 },
    recipe: { 妖丹: 2, 紫猴花: 2, 清泉水: 1 },
    desc: "（效果待定）",
  }),

  makePill("生肌续骨膏", 3, {
    realmReq: 3,
    type: "pending",
    baseEffect: {},
    danDu: { 3: 2.0 },
    recipe: { 妖丹: 3, 妖兽精血: 2 },
    desc: "（效果待定）",
  }),

  makePill("隐息丹", 3, {
    realmReq: 3,
    type: "reduceEncounter",
    baseEffect: { 3: 0.3 },
    danDu: { 3: 0.5 },
    recipe: { 妖丹: 1, 紫猴花: 2, 清灵草: 1 },
    desc: "减少遇见敌人概率",
  }),

  makePill("回煞丸", 3, {
    realmReq: 3,
    type: "pending",
    baseEffect: {},
    danDu: { 3: 3.0 },
    recipe: { 洗骨花: 1, 紫芝草: 2, 妖兽精血: 1 },
    desc: "（效果待定）",
  }),

  makePill("萦香丸", 3, {
    realmReq: 3,
    type: "pending",
    baseEffect: {},
    danDu: { 3: 0.5 },
    recipe: { 妖丹: 1, 紫猴花: 2, 清泉水: 1 },
    desc: "（框架，效果待定）",
  }),

  makePill("忘尘丹", 3, {
    realmReq: 3,
    type: "pending",
    baseEffect: {},
    danDu: { 3: 0.5 },
    recipe: { 妖丹: 2, 紫猴花: 2, 千年降压草: 1 },
    desc: "（框架，效果待定）",
  }),

  /* ============================================================
     状态（dot）
     ============================================================ */

  makePill("清灵散", 3, {
    realmReq: 3,
    type: "cure",
    statusId: "poison",
    baseEffect: {},
    danDu: { 3: 0.3 },
    recipe: { 洗骨花: 2, 玉髓芝: 1 },
    desc: "解除中毒",
  }),

  makePill("冰灵丹", 3, {
    realmReq: 3,
    type: "cure",
    statusId: "burn",
    baseEffect: {},
    danDu: { 3: 0.3 },
    recipe: { 洗骨花: 2, 寒血果: 1 },
    desc: "解除灼烧",
  }),

  makePill("止血丹", 3, {
    realmReq: 3,
    type: "cure",
    statusId: "bleed",
    baseEffect: {},
    danDu: { 3: 0.3 },
    recipe: { 洗骨花: 2, 草木灰: 1 },
    desc: "解除流血",
  }),

  /* ============================================================
     突破
     ============================================================ */

  makePill("筑基丹", 2, {
    realmReq: 1,
    type: "breakBonus",
    baseEffect: { 2: 0.30 },
    danDu: { 2: 3.0 },
    dailyLimit: 2,
    recipe: { 妖丹: 3, 玉髓芝: 2, 紫猴花: 2 },
    desc: "炼气→筑基 +30%",
  }),

  makePill("降尘丹", 3, {
    realmReq: 2,
    type: "breakBonus",
    baseEffect: { 3: 0.20 },
    danDu: { 3: 5.0 },
    dailyLimit: 2,
    recipe: { 妖丹: 3, 寒血果: 2, 紫猴花: 2 },
    desc: "筑基→金丹 +20%",
  }),

  /* ============================================================
     灵兽
     ============================================================ */

  ...makeTiered("饲灵丸", "兽粮", 1, 9, {
    type: "petFood",
    baseEffect: { 1: 50, 2: 100, 3: 200, 4: 400, 5: 700, 6: 1100, 7: 1600, 8: 2200, 9: 3000 },
    danDu: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    recipe: (t) => {
      if (t <= 3) return { 诱妖草: 1, 清心花: 1 };
      if (t <= 6) return { 聚妖草: 1, 妖肉: 1 };
      return { 龙心九叶芝: 1, 妖丹: 1 };
    },
    desc: "灵兽粮（饥饿 +5，修为 +N）",
    extra: { hunger: 5 },
    noGrade: true,
  }),

  ...makeTiered("清虚丹", "忠诚丹", 1, 5, {
    type: "petLoyalty",
    baseEffect: { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50 },
    danDu: { 1: 0.1, 2: 0.2, 3: 0.3, 4: 0.4, 5: 0.5 },
    recipe: () => ({ 妖丹: 2, 紫猴花: 1, 千年降压草: 1 }),
    desc: "灵宠忠诚度 +N",
  }),
];

/* ============================================================
   工具：生成单个丹药模板
   ============================================================ */

function makePill(id, tier, opts) {
  return {
    id: id,
    name: opts.name || id,
    tier: tier,
    realmReq: opts.realmReq !== undefined ? opts.realmReq : tier,
    type: opts.type,
    statusId: opts.statusId,
    baseEffect: opts.baseEffect,
    danDu: opts.danDu,
    dailyLimit: opts.dailyLimit,
    recipe: opts.recipe,
    desc: opts.desc || "",
    extra: opts.extra || {},
    noGrade: !!opts.noGrade,
  };
}

/* ============================================================
   工具：生成多阶丹药模板
   ============================================================ */

function makeTiered(idBase, idSuffix, tierMin, tierMax, opts) {
  const list = [];
  for (let t = tierMin; t <= tierMax; t++) {
    const realmReq = opts.realmReq !== undefined ? opts.realmReq : t;
    list.push({
      id: idBase + "_" + t + "阶",
      name: idBase,
      tier: t,
      realmReq: realmReq,
      type: opts.type,
      baseEffect: { [t]: (opts.baseEffect && opts.baseEffect[t]) || 0 },
      danDu: { [t]: (opts.danDu && opts.danDu[t]) || 0 },
      dailyLimit: opts.dailyLimit,
      recipe: typeof opts.recipe === "function" ? opts.recipe(t) : opts.recipe,
      desc: opts.desc || "",
      extra: opts.extra || {},
      noGrade: !!opts.noGrade,
    });
  }
  return list;
}

/* ============================================================
   3. 生成 ITEMS 条目（仅"基础模板"，品级运行时生成）
   ============================================================ */

PILL_BASE.forEach(p => {
  ITEMS[p.id] = {
    type: "pillTemplate",
    name: p.name,
    tier: p.tier,
    realmReq: p.realmReq,
    baseEffect: p.baseEffect,
    danDu: p.danDu,
    dailyLimit: p.dailyLimit,
    recipe: p.recipe,
    desc: p.desc,
    extra: p.extra,
    noGrade: p.noGrade,
  };
});

/* ============================================================
   4. 运行时生成具体品级物品
   ------------------------------------------------------------
   - 不分品级（如饲灵丸）：直接返回基础模板转成的实际物品
   - 0 品：废丹
   - 1~5 品：按品级% 生成
   ============================================================ */

function getOrCreatePillItem(templateId, grade) {
  const template = ITEMS[templateId];
  if (!template || template.type !== "pillTemplate") return null;

  /* 不分品级：直接把模板转成实际物品 */
  if (template.noGrade) {
    const id = templateId + "_基础";
    if (!ITEMS[id]) {
      const baseValue = template.baseEffect[template.tier] || 0;
      ITEMS[id] = {
        type: "pill",
        name: template.name,
        baseId: templateId,
        tier: template.tier,
        grade: 1,
        price: 10,
        desc: template.desc,
        usableIn: "field",
        effect: buildPillEffect(template, 1, baseValue),
        danDu: 0,
        dailyLimit: template.dailyLimit,
        noGrade: true,
      };
      if (typeof registerItemToBucket === "function") registerItemToBucket(id);
    }
    return ITEMS[id];
  }

  /* 0 品废丹 */
  if (grade === 0) {
    const id = templateId + "_0品";
    if (!ITEMS[id]) {
      ITEMS[id] = {
        type: "pill",
        name: template.name + "（废丹）",
        baseId: templateId,
        tier: template.tier,
        grade: 0,
        price: 1,
        desc: "废丹，毒性大于药性，不能服用，只能卖。",
        usableIn: "none",
        noGrade: false,
      };
      if (typeof registerItemToBucket === "function") registerItemToBucket(id);
    }
    return ITEMS[id];
  }

  /* 1~5 品 */
  const id = templateId + "_" + grade + "品";
  if (ITEMS[id]) return ITEMS[id];

  /* 品级效果百分比 */
  const gradePct = [0, 0.2, 0.4, 0.6, 0.8, 1.0][grade] || 0;
  const baseValue = template.baseEffect[template.tier] || 0;
  const realValue = baseValue * gradePct;

  /* 丹毒（按品级递减：1品100%，2品80%，3品60%，4品40%，5品0%） */
  const danDuBase = template.danDu[template.tier] || 0;
  const danDuPct = [0, 1.0, 0.8, 0.6, 0.4, 0][grade] || 0;
  const realDanDu = danDuBase * danDuPct;

  ITEMS[id] = {
    type: "pill",
    name: template.name + "（" + grade + "品）",
    baseId: templateId,
    tier: template.tier,
    grade: grade,
    price: Math.max(1, Math.floor(baseValue / 10 * gradePct)),
    desc: template.desc + `（${grade}品）`,
    usableIn: "field",
    effect: buildPillEffect(template, grade, realValue),
    danDu: realDanDu,
    dailyLimit: template.dailyLimit,
    noGrade: false,
  };
  if (typeof registerItemToBucket === "function") registerItemToBucket(id);
  return ITEMS[id];
}

/* 根据模板 + 品级生成 effect */
function buildPillEffect(template, grade, realValue) {
  switch (template.type) {
    case "heal":
      return { type: "heal", value: realValue };
    case "healMp":
      return { type: "healMp", value: realValue };
    case "exp":
      return { type: "exp", value: realValue };
    case "cure":
      return { type: "cure", status: template.statusId };
    case "cureAllNonDot":
      return { type: "cureAllNonDot" };
    case "breakBonus":
      return { type: "breakBonus", value: realValue };
    case "fasting":
      return { type: "fasting", days: realValue };
    case "reduceEncounter":
      return { type: "reduceEncounter", value: realValue };
    case "petFood":
      return { type: "petFood", exp: realValue, hunger: (template.extra && template.extra.hunger) || 5 };
    case "petLoyalty":
      return { type: "petLoyalty", value: realValue };
    case "pending":
      return { type: "pending", note: template.desc };
    default:
      return {};
  }
}