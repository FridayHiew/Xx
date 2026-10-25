/* ============================================================
   data/recipes.js - 炼丹配方
   ------------------------------------------------------------
   每个配方对应 PILL_BASE 里的一个模板。
   炼丹时按成功率生成 0~5 品。
   ============================================================ */

const RECIPES = [
  /* ============================================================
     回血 / 回灵（1~9 阶）
     ============================================================ */

  ...makeRecipeTiered("huichun", "回春丹_", 1, 9,
    () => ({ 洗骨花: 1, 赤血草: 2 }),
    0.85, 30, "恢复气血"),

  ...makeRecipeTiered("huiyuan", "回元丹_", 1, 9,
    () => ({ 洗骨花: 1, 紫芝草: 2 }),
    0.85, 30, "恢复灵力"),

  /* ============================================================
     增修为（境界专属）
     ============================================================ */

  { id: "juqi", name: "聚气丹_1阶", tier: 1, rate: 0.85, realm: 1, price: 60,
    mat: { 妖丹: 3, 草木灰: 5, 清泉水: 1 },
    desc: "+100 练气修为" },

  { id: "juling", name: "聚灵丹_2阶", tier: 2, rate: 0.80, realm: 2, price: 150,
    mat: { 妖丹: 2, 紫猴花: 1 },
    desc: "+300 筑基修为" },

  { id: "juning", name: "聚凝丹_3阶", tier: 3, rate: 0.70, realm: 3, price: 500,
    mat: { 妖丹: 1, 千年降压草: 1, 火精枣: 3, 妖兽精血: 1 },
    desc: "+1000 金丹修为" },

  /* ============================================================
     特殊
     ============================================================ */

  { id: "yangjing", name: "养精丹_2阶", tier: 2, rate: 0.75, realm: 2, price: 150,
    mat: { 洗骨花: 1, 赤血草: 2, 清灵草: 1 },
    desc: "解除所有非 dot 负面" },

  { id: "bigudan", name: "辟谷丹_2阶", tier: 2, rate: 0.70, realm: 2, price: 100,
    mat: { 妖丹: 1, 草木灰: 3, 清泉水: 2 },
    desc: "30 天免饥饿" },

  { id: "dingyan", name: "定颜丹_3阶", tier: 3, rate: 0.50, realm: 3, price: 500,
    mat: { 妖丹: 2, 紫猴花: 2, 清泉水: 1 },
    desc: "（效果待定）" },

  { id: "shengji", name: "生肌续骨膏_3阶", tier: 3, rate: 0.40, realm: 3, price: 800,
    mat: { 妖丹: 3, 妖兽精血: 2 },
    desc: "（效果待定）" },

  { id: "yinxi", name: "隐息丹_3阶", tier: 3, rate: 0.60, realm: 3, price: 300,
    mat: { 妖丹: 1, 紫猴花: 2, 清灵草: 1 },
    desc: "减少遇见敌人概率" },

  { id: "huisha", name: "回煞丸_3阶", tier: 3, rate: 0.40, realm: 3, price: 600,
    mat: { 洗骨花: 1, 紫芝草: 2, 妖兽精血: 1 },
    desc: "（效果待定）" },

  { id: "yingxiang", name: "萦香丸_3阶", tier: 3, rate: 0.55, realm: 3, price: 200,
    mat: { 妖丹: 1, 紫猴花: 2, 清泉水: 1 },
    desc: "（框架，效果待定）" },

  { id: "wangchen", name: "忘尘丹_3阶", tier: 3, rate: 0.45, realm: 3, price: 300,
    mat: { 妖丹: 2, 紫猴花: 2, 千年降压草: 1 },
    desc: "（框架，效果待定）" },

  /* ============================================================
     状态（dot）
     ============================================================ */

  { id: "qingling", name: "清灵散_3阶", tier: 3, rate: 0.85, realm: 3, price: 80,
    mat: { 洗骨花: 2, 玉髓芝: 1 },
    desc: "解除中毒" },

  { id: "bingling", name: "冰灵丹_3阶", tier: 3, rate: 0.85, realm: 3, price: 80,
    mat: { 洗骨花: 2, 寒血果: 1 },
    desc: "解除灼烧" },

  { id: "zhixue", name: "止血丹_3阶", tier: 3, rate: 0.85, realm: 3, price: 80,
    mat: { 洗骨花: 2, 草木灰: 1 },
    desc: "解除流血" },

  /* ============================================================
     突破
     ============================================================ */

  { id: "zhuji", name: "筑基丹_2阶", tier: 2, rate: 0.50, realm: 1, price: 500,
    mat: { 妖丹: 3, 玉髓芝: 2, 紫猴花: 2 },
    desc: "炼气→筑基 +30%" },

  { id: "jiangchen", name: "降尘丹_3阶", tier: 3, rate: 0.40, realm: 2, price: 1000,
    mat: { 妖丹: 3, 寒血果: 2, 紫猴花: 2 },
    desc: "筑基→金丹 +20%" },

  /* ============================================================
     灵兽
     ============================================================ */

  ...makeRecipeTieredPet("silin", "饲灵丸_", 1, 9,
    (t) => {
      if (t <= 3) return { 诱妖草: 1, 清心花: 1 };
      if (t <= 6) return { 聚妖草: 1, 妖肉: 1 };
      return { 龙心九叶芝: 1, 妖丹: 1 };
    },
    0.80, 10, "灵兽粮"),

  ...makeRecipeTiered("qingxu", "清虚丹_", 1, 5,
    () => ({ 妖丹: 2, 紫猴花: 1, 千年降压草: 1 }),
    0.70, 200, "灵宠忠诚度"),
];

/* ============================================================
   工具：生成多阶配方
   ============================================================ */

function makeRecipeTiered(idBase, namePrefix, tierMin, tierMax, matFn, rate, price, desc) {
  const list = [];
  for (let t = tierMin; t <= tierMax; t++) {
    list.push({
      id: idBase + "_" + t,
      name: namePrefix + t + "阶",
      tier: t,
      rate: rate,
      realm: t,
      price: price,
      mat: matFn(t),
      desc: desc,
    });
  }
  return list;
}

/* 灵兽专用（价格按阶递增） */
function makeRecipeTieredPet(idBase, namePrefix, tierMin, tierMax, matFn, rate, basePrice, desc) {
  const list = [];
  const priceTable = [10, 20, 50, 100, 200, 400, 800, 1500, 3000];
  for (let t = tierMin; t <= tierMax; t++) {
    list.push({
      id: idBase + "_" + t,
      name: namePrefix + t + "阶",
      tier: t,
      rate: rate,
      realm: t,
      price: priceTable[t - 1] || basePrice,
      mat: matFn(t),
      desc: desc,
    });
  }
  return list;
}

/* ============================================================
   工具函数
   ============================================================ */

function getRecipe(id) {
  return RECIPES.find(r => r.id === id);
}

/* ============================================================
   兼容旧引用
   ============================================================ */

const BREAK_ITEMS = [
  { id: "zhuji",     name: "筑基丹_2阶", realmBonus: 0.30, realmOnly: [1], desc: "炼气→筑基 +30%" },
  { id: "jiangchen", name: "降尘丹_3阶", realmBonus: 0.20, realmOnly: [2], desc: "筑基→金丹 +20%" },
];