/* ============================================================
   data/combat-skills.js - 技能（基本功招式）
   ============================================================ */

const COMBAT_SKILLS = [
  /* ===== 剑 ===== */
  { id: "sk_sword1", name: "基础剑招", type: "剑", target: "enemySingle",
    skillReq: { "剑": 1 }, cost: { hp: 5 }, power: 1.3,
    desc: "基础剑法，消耗少量血气" },

  { id: "sk_sword2", name: "连环剑", type: "剑", target: "enemyAll",
    skillReq: { "剑": 4 }, cost: { hp: 15 }, power: 1.2,
    desc: "连环三剑，攻击全体敌人" },

  { id: "sk_sword3", name: "剑意斩", type: "剑", target: "enemySingle",
    skillReq: { "剑": 7 }, cost: { hp: 30 }, power: 3.0,
    inflict: { bleed: 0.4 },
    desc: "剑意凝形，一击必杀" },

  /* ===== 刀 ===== */
  { id: "sk_blade1", name: "劈砍", type: "刀", target: "enemySingle",
    skillReq: { "刀": 1 }, cost: { hp: 5 }, power: 1.3,
    desc: "基础刀法" },

  { id: "sk_blade2", name: "狂刀斩", type: "刀", target: "enemySingle",
    skillReq: { "刀": 4 }, cost: { hp: 18 }, power: 2.2,
    inflict: { bleed: 0.3 },
    desc: "狂暴刀法，可能流血" },

  /* ===== 拳 ===== */
  { id: "sk_fist1", name: "直拳", type: "拳", target: "enemySingle",
    skillReq: { "拳": 1 }, cost: { hp: 4 }, power: 1.2,
    desc: "基础拳法" },

  { id: "sk_fist2", name: "崩拳", type: "拳", target: "enemySingle",
    skillReq: { "拳": 4 }, cost: { hp: 15 }, power: 2.0,
    desc: "崩山拳" },

  /* ===== 掌 ===== */
  { id: "sk_palm1", name: "推掌", type: "掌", target: "enemySingle",
    skillReq: { "掌": 1 }, cost: { hp: 5 }, power: 1.3,
    desc: "基础掌法" },

  { id: "sk_palm2", name: "摧心掌", type: "掌", target: "enemySingle",
    skillReq: { "掌": 5 }, cost: { hp: 20 }, power: 2.3,
    desc: "摧心掌力" },

  /* ===== 棍 ===== */
  { id: "sk_staff1", name: "横扫", type: "棍", target: "enemyAll",
    skillReq: { "棍": 1 }, cost: { hp: 6 }, power: 1.0,
    desc: "横扫千军，攻击全体敌人" },

  /* ===== 鞭 ===== */
  { id: "sk_whip1", name: "鞭击", type: "鞭", target: "enemySingle",
    skillReq: { "鞭": 1 }, cost: { hp: 6 }, power: 1.4,
    desc: "基础鞭法" },

  /* ===== 兽 ===== */
  { id: "sk_beast1", name: "兽吼", type: "兽", target: "enemySingle",
    skillReq: { "兽": 1 }, cost: { hp: 8 }, power: 1.2,
    desc: "以兽力震慑" },

  /* ===== 特殊：牺牲 ===== */
  { id: "sk_sacrifice", name: "牺牲", type: "拳", target: "enemySingle",
    skillReq: { "拳": 5 }, cost: { hp: 0.5 }, power: 5.0,
    canKill: true,
    desc: "以半数气血换取致命一击，可能致死" },
];

function getCombatSkill(id) {
  return COMBAT_SKILLS.find(s => s.id === id);
}

function listUsableSkills(unit) {
  if (!unit.skills) return [];
  return unit.skills.filter(id => {
    const sk = getCombatSkill(id);
    if (!sk) return false;
    if (sk.skillReq) {
      for (const k in sk.skillReq) {
        if ((unit.skillLv && unit.skillLv[k] || 0) < sk.skillReq[k]) return false;
      }
    }
    if (sk.cost && sk.cost.hp) {
      if (unit.hp < sk.cost.hp) return false;
    }
    return true;
  });
}