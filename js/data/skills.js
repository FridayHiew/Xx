/* ============================================================
   data/skills.js - 技能 / 基本功
   ============================================================ */

/* 11 种技能 */
const SKILL_TALENTS = ["剑", "刀", "拳", "掌", "棍", "鞭", "兽", "炼丹", "炼器", "阵法", "符"];
const SKILLS = SKILL_TALENTS;

/* 基本功（宗门传功） */
const TEACH_ARTS_BASE = [
  { id: "dao",   name: "刀法", skill: "刀", cost: 30 },
  { id: "gun",   name: "棍法", skill: "棍", cost: 30 },
  { id: "tui",   name: "腿法", skill: "拳", cost: 30 },
  { id: "quan",  name: "拳法", skill: "拳", cost: 30 },
  { id: "zhang", name: "掌法", skill: "掌", cost: 30 },
  { id: "zhi",   name: "指法", skill: "掌", cost: 30 },
];