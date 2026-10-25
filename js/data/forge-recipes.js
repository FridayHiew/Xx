/* ============================================================
   data/forge-recipes.js - 炼器配方（15 个）
   ------------------------------------------------------------
   每个配方：
   - id / name
   - slot: 装备槽位（head / body / rightHand / accessory / shoes / leftHand）
   - baseType: 基础装备类型（用于生成装备）
   - grade: 目标品级（1~7）
   - mats: 材料需求（baseId → 数量）
   - spiritStone: 灵石消耗
   - rate: 基础成功率
   - desc
   ============================================================ */

const FORGE_RECIPES = [
  /* ===== 1 品 ===== */
  {
    id: "f_sword_1",
    name: "凡铁剑",
    slot: "rightHand",
    grade: 1,
    mats: { 玄铁: 3 },
    spiritStone: 10,
    rate: 0.90,
    desc: "最普通的凡铁剑，聊胜于无。",
  },
  {
    id: "f_body_1",
    name: "铁布衣",
    slot: "body",
    grade: 1,
    mats: { 玄铁: 2, 草木灰: 3 },
    spiritStone: 10,
    rate: 0.90,
    desc: "铁片缝制的布衣。",
  },
  {
    id: "f_shield_1",
    name: "木盾",
    slot: "leftHand",
    grade: 1,
    mats: { 玄铁: 1, 草木灰: 5 },
    spiritStone: 8,
    rate: 0.90,
    desc: "木制圆盾。",
  },

  /* ===== 2 品 ===== */
  {
    id: "f_sword_2",
    name: "玄铁重剑",
    slot: "rightHand",
    grade: 2,
    mats: { 寒铁: 3, 妖兽精血: 1 },
    spiritStone: 30,
    rate: 0.75,
    desc: "玄铁打造，沉重厚重。",
  },
  {
    id: "f_body_2",
    name: "皮甲",
    slot: "body",
    grade: 2,
    mats: { 玄铁: 2, 妖兽精血: 1 },
    spiritStone: 25,
    rate: 0.75,
    desc: "妖兽皮制甲。",
  },
  {
    id: "f_ring_1",
    name: "护心镜",
    slot: "accessory",
    grade: 2,
    mats: { 赤铜: 2, 妖兽精血: 1 },
    spiritStone: 25,
    rate: 0.75,
    desc: "护心之镜。",
  },

  /* ===== 3 品 ===== */
  {
    id: "f_body_3",
    name: "灵纹袍",
    slot: "body",
    grade: 3,
    mats: { 秘银: 2, 火精枣: 1 },
    spiritStone: 60,
    rate: 0.60,
    desc: "绣有灵纹的道袍。",
  },
  {
    id: "f_sword_3",
    name: "精钢剑",
    slot: "rightHand",
    grade: 3,
    mats: { 秘银: 3, 火精枣: 2 },
    spiritStone: 70,
    rate: 0.60,
    desc: "精钢锻造的长剑。",
  },
  {
    id: "f_shoes_1",
    name: "风行靴",
    slot: "shoes",
    grade: 3,
    mats: { 秘银: 2, 草木灰: 5 },
    spiritStone: 55,
    rate: 0.65,
    desc: "轻盈如风。",
  },

  /* ===== 4 品 ===== */
  {
    id: "f_sword_4",
    name: "天金剑",
    slot: "rightHand",
    grade: 4,
    mats: { 天金: 3, 天地灵乳: 1 },
    spiritStone: 150,
    rate: 0.45,
    desc: "天金铸剑，锋锐无匹。",
  },
  {
    id: "f_ring_2",
    name: "冰晶戒",
    slot: "accessory",
    grade: 4,
    mats: { 秘银: 3, 寒血果: 5 },
    spiritStone: 120,
    rate: 0.50,
    desc: "冰晶所制，寒气逼人。",
  },

  /* ===== 5 品 ===== */
  {
    id: "f_body_5",
    name: "火麟甲",
    slot: "body",
    grade: 5,
    mats: { 天金: 2, 火精枣: 5, 妖兽精血: 3 },
    spiritStone: 250,
    rate: 0.35,
    desc: "火麟皮炼制的铠甲。",
  },
  {
    id: "f_body_5b",
    name: "星辰袍",
    slot: "body",
    grade: 5,
    mats: { 天金: 3, 天地灵乳: 2 },
    spiritStone: 300,
    rate: 0.35,
    desc: "绣有星辰的道袍。",
  },

  /* ===== 6 品 ===== */
  {
    id: "f_ring_3",
    name: "仙灵戒",
    slot: "accessory",
    grade: 6,
    mats: { 天金: 5, 天地灵乳: 3 },
    spiritStone: 500,
    rate: 0.25,
    desc: "通灵之戒，仙韵流转。",
  },

  /* ===== 7 品 ===== */
  {
    id: "f_sword_7",
    name: "太虚剑",
    slot: "rightHand",
    grade: 7,
    mats: { 天金: 8, 天地灵乳: 5, 妖兽精血: 10 },
    spiritStone: 1000,
    rate: 0.15,
    desc: "传说中可斩虚无的神剑。",
  },
];

/* 按 id 查 */
function getForgeRecipe(id) {
  return FORGE_RECIPES.find(r => r.id === id);
}