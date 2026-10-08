/* ============================================================
   data/recipes.js - 炼丹 / 突破道具 / 装备
   ============================================================ */

/* 炼丹配方 */
const RECIPES = [
  { id: "juqi",   name: "聚气丹", mat: { 灵草: 2, 泉水: 1 }, effect: "修炼+50%，持续3天", rate: 0.85 },
  { id: "pojing", name: "破境丹", mat: { 灵草: 5, 妖丹: 1 }, effect: "突破率+15%", rate: 0.60 },
  { id: "huixue", name: "回血丹", mat: { 灵草: 3 }, effect: "恢复50%气血", rate: 0.90 },
  { id: "jingxin",name: "静心丹", mat: { 灵草: 2, 寒泉: 1 }, effect: "心情平复", rate: 0.75 },
  { id: "yanshou",name: "延寿丹", mat: { 千年灵芝: 1, 妖丹: 2 }, effect: "寿元+50", rate: 0.40 },
];

/* 突破道具 */
const BREAK_ITEMS = [
  { id: "pojing", name: "破境丹", realmBonus: 0.15, desc: "突破成功率+15%" },
  { id: "zhuji",  name: "筑基丹", realmBonus: 0.25, realmOnly: [1, 2], desc: "炼气→筑基、筑基→金丹 +25%" },
  { id: "jindan", name: "金丹丹", realmBonus: 0.30, realmOnly: [2, 3], desc: "筑基→金丹、金丹→元婴 +30%" },
];

/* 装备 */
const EQUIPS = [
  { id: "e_sword1", name: "青锋剑",   slot: "weapon", atk: 5,  def: 0,  hp: 0,  mp: 0,  desc: "凡铁剑，聊胜于无" },
  { id: "e_sword2", name: "玄铁重剑", slot: "weapon", atk: 12, def: 2,  hp: 0,  mp: 0,  desc: "玄铁打造，沉重" },
  { id: "e_armor1", name: "布衣",     slot: "armor",  atk: 0,  def: 5,  hp: 20, mp: 0,  desc: "粗布衣" },
  { id: "e_armor2", name: "皮甲",     slot: "armor",  atk: 0,  def: 10, hp: 40, mp: 0,  desc: "妖兽皮制" },
  { id: "e_ring1",  name: "聚灵戒",   slot: "ring",   atk: 0,  def: 0,  hp: 0,  mp: 20, desc: "聚灵之戒" },
  { id: "e_ring2",  name: "护心镜",   slot: "ring",   atk: 0,  def: 3,  hp: 30, mp: 0,  desc: "护心之镜" },


  /* 晋升奖励装备 */
  { id: "e_sword_promotion", name: "宗门制式剑", slot: "weapon", atk: 15, def: 2, hp: 0,  mp: 0,  desc: "宗门发的制式剑" },
  { id: "e_robe_promotion",  name: "宗门道袍",   slot: "armor",  atk: 0,  def: 8, hp: 30, mp: 0,  desc: "宗门发的道袍" },
  { id: "e_sword_mennei",    name: "精钢剑",     slot: "weapon", atk: 25, def: 5, hp: 0,  mp: 0,  desc: "门内弟子制式剑" },
  { id: "e_robe_mennei",     name: "灵纹袍",     slot: "armor",  atk: 0,  def: 15,hp: 50, mp: 10, desc: "门内弟子道袍" },
  { id: "e_sword_zhenchuan", name: "玄铁剑",     slot: "weapon", atk: 40, def: 10,hp: 0,  mp: 0,  desc: "真传弟子配剑" },
  { id: "e_robe_zhenchuan",  name: "真传道袍",   slot: "armor",  atk: 0,  def: 25,hp: 80, mp: 20, desc: "真传弟子道袍" },
];
