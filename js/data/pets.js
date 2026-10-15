/* ============================================================
   data/pets.js - 灵宠数据
   ============================================================ */

/* ===== 天赋 ===== */
const PET_TALENTS = [
  { id: "fan",   name: "凡骨", maxRealm: 2, growth: 1.0, weight: 40, desc: "最多筑基" },
  { id: "zhong", name: "中品", maxRealm: 3, growth: 1.2, weight: 30, desc: "最多金丹" },
  { id: "shang", name: "上品", maxRealm: 4, growth: 1.5, weight: 18, desc: "最多元婴" },
  { id: "tian",  name: "天灵", maxRealm: 6, growth: 2.0, weight: 9,  desc: "最多炼虚" },
  { id: "xian",  name: "仙骨", maxRealm: 9, growth: 3.0, weight: 3,  desc: "可至渡劫" },
];

/* ===== 血脉 ===== */
const PET_BLOODLINES = [
  { id: "none", name: "无", element: null,   resistBonus: {} },
  { id: "huo",  name: "火", element: "huo",  resistBonus: { burn: 30, freeze: -20 } },
  { id: "bing", name: "冰", element: "bing", resistBonus: { freeze: 30, burn: -20 } },
  { id: "lei",  name: "雷", element: "lei",  resistBonus: { stun: 20 } },
  { id: "du",   name: "毒", element: "mu",   resistBonus: { poison: 50 } },
  { id: "xue",  name: "血", element: "shui", resistBonus: { bleed: 50 } },
  { id: "jin",  name: "金", element: "jin",  resistBonus: { bleed: 20 } },
  { id: "tu",   name: "土", element: "tu",   resistBonus: { stun: 30 } },
  { id: "mu",   name: "木", element: "mu",   resistBonus: { poison: 20, bleed: 20 } },
  { id: "shui", name: "水", element: "shui", resistBonus: { freeze: 20 } },
];

/* ===== 突破材料需求（按当前 realm） ===== */
const PET_BREAK_REQ = {
  0: { item: "灵兽丹", count: 1 },
  1: { item: "灵兽丹", count: 3 },
  2: { item: "灵兽丹", count: 6 },
  3: { item: "灵兽丹", count: 10 },
  4: { item: "灵兽丹", count: 20 },
  5: { item: "灵兽丹", count: 40 },
  6: { item: "灵兽丹", count: 80 },
  7: { item: "灵兽丹", count: 160 },
  8: { item: "灵兽丹", count: 320 },
};

/* ===== 召唤技能 ===== */
const SUMMON_SKILLS = [
  /* 4 个宗门专属 */
  { id: "summon_beast",  name: "召唤灵兽", type: "召唤", petType: "beast",
    cost: { mp: 30 }, sect: "wanshou",  desc: "召唤灵兽出战" },
  { id: "summon_blood",  name: "激发血脉", type: "召唤", petType: "blood",
    cost: { mp: 30 }, sect: "xuemou",   desc: "激发血脉，化身出战" },
  { id: "summon_soul",   name: "招魂帆",   type: "召唤", petType: "soul",
    cost: { mp: 30 }, sect: "youming",  desc: "招魂帆，亡魂出战" },
  { id: "summon_puppet", name: "机关术",   type: "召唤", petType: "puppet",
    cost: { mp: 30 }, sect: "tianji",   desc: "机关术，傀儡出战" },

  /* 通用 */
  { id: "summon_sword",  name: "召唤仙剑", type: "召唤", petType: "sword",
    cost: { mp: 30 }, sect: null,       desc: "召唤仙剑出战" },
];

/* ===== 工具函数 ===== */

function getSummonSkill(id) {
  return SUMMON_SKILLS.find(s => s.id === id);
}

function getPetTalent(id) {
  return PET_TALENTS.find(t => t.id === id) || PET_TALENTS[0];
}

function getPetBloodline(id) {
  return PET_BLOODLINES.find(b => b.id === id) || PET_BLOODLINES[0];
}

/* 灵宠升级需求 */
function petExpNeed(lvl) {
  return 50 + lvl * 30;
}

/* 按权重随机天赋 */
function randomPetTalent() {
  const total = PET_TALENTS.reduce((s, t) => s + t.weight, 0);
  let roll = Math.random() * total;
  for (const t of PET_TALENTS) {
    roll -= t.weight;
    if (roll <= 0) return t;
  }
  return PET_TALENTS[0];
}

/* 找本门召唤技能（没有则用通用） */
function getSectSummonSkill(sectId) {
  const sectSkill = SUMMON_SKILLS.find(s => s.sect === sectId);
  if (sectSkill) return sectSkill;
  return SUMMON_SKILLS.find(s => s.sect === null);
}