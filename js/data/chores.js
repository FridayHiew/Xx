/* ============================================================
   data/chores.js - 杂务 / 杂役铺
   ============================================================ */

/* 杂务（杂务弟子） */
const CHORES_FAN = [
  { id: "tiao", name: "挑水", skill: "掌", baseTime: 60, gain: { 掌: 1.0 } },
  { id: "chai", name: "砍柴", skill: "刀", baseTime: 70, gain: { 刀: 1.0 } },
  { id: "cai",  name: "种菜", skill: "掌", baseTime: 50, gain: { 掌: 0.6, 炼丹: 0.4 } },
  { id: "ji",   name: "养鸡", skill: "兽", baseTime: 40, gain: { 兽: 1.0 } },
];

/* 杂务（门外弟子） */
const CHORES_MENWAI = [
  { id: "lingshou", name: "饲养灵兽", skill: "兽",   baseTime: 80, gain: { 兽: 1.5 } },
  { id: "lingyao",  name: "种灵药",   skill: "炼丹", baseTime: 70, gain: { 炼丹: 1.5 } },
  { id: "daqiao",   name: "打器",     skill: "炼器", baseTime: 90, gain: { 炼器: 1.5 } },
  { id: "cangjing", name: "打理藏经阁", skill: "符", baseTime: 60, gain: { 符: 1.0, 阵法: 0.5 } },
];

/* 杂务（门内弟子） */
const CHORES_MENNEI = [
  { id: "lianyao",  name: "炼药",     skill: "炼丹", baseTime: 100, gain: { 炼丹: 2.0 } },
  { id: "lianqi",   name: "炼器",     skill: "炼器", baseTime: 100, gain: { 炼器: 2.0 } },
  { id: "xunshou",  name: "训练灵兽", skill: "兽",   baseTime: 90,  gain: { 兽: 2.0 } },
  { id: "zhenfa",   name: "维护阵法", skill: "阵法", baseTime: 80,  gain: { 阵法: 2.0 } },
];
