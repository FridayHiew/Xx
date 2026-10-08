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

/* 杂役铺商品 */
const SHOP_ITEMS = [
  /* A 类：实用工具 */
  { id: "dao1",  name: "砍柴刀 Lv1", cat: "A", price: 100, chore: "chai", lvl: 1, desc: "砍柴时熟练 +0.5" },
  { id: "dao2",  name: "砍柴刀 Lv2", cat: "A", price: 300, chore: "chai", lvl: 2, desc: "砍柴 +0.5，熟练满时回合减半" },
  { id: "dao3",  name: "砍柴刀 Lv3", cat: "A", price: 800, chore: "chai", lvl: 3, desc: "砍柴 +0.5，熟练满时回合减到1" },
  { id: "bian1", name: "扁担 Lv1",   cat: "A", price: 100, chore: "tiao", lvl: 1, desc: "挑水时熟练 +0.5" },
  { id: "bian2", name: "扁担 Lv2",   cat: "A", price: 300, chore: "tiao", lvl: 2, desc: "挑水 +0.5，熟练满时回合减半" },
  { id: "bian3", name: "扁担 Lv3",   cat: "A", price: 800, chore: "tiao", lvl: 3, desc: "挑水 +0.5，熟练满时回合减到1" },
  { id: "chu1",  name: "锄头 Lv1",   cat: "A", price: 100, chore: "cai",  lvl: 1, desc: "种菜时熟练 +0.5" },
  { id: "chu2",  name: "锄头 Lv2",   cat: "A", price: 300, chore: "cai",  lvl: 2, desc: "种菜 +0.5，熟练满时回合减半" },
  { id: "chu3",  name: "锄头 Lv3",   cat: "A", price: 800, chore: "cai",  lvl: 3, desc: "种菜 +0.5，熟练满时回合减到1" },
  { id: "ji1",   name: "鸡食盆 Lv1", cat: "A", price: 100, chore: "ji",   lvl: 1, desc: "养鸡时熟练 +0.5" },
  { id: "ji2",   name: "鸡食盆 Lv2", cat: "A", price: 300, chore: "ji",   lvl: 2, desc: "养鸡 +0.5，熟练满时回合减半" },
  { id: "ji3",   name: "鸡食盆 Lv3", cat: "A", price: 800, chore: "ji",   lvl: 3, desc: "养鸡 +0.5，熟练满时回合减到1" },

  /* B 类：废物 */
  { id: "w1", name: "破瓦片", cat: "B", price: 5, desc: "似乎没什么用" },
  { id: "w2", name: "干草",   cat: "B", price: 3, desc: "一捆干草" },
  { id: "w3", name: "石头",   cat: "B", price: 1, desc: "地上捡的石头" },
  { id: "w4", name: "枯枝",   cat: "B", price: 2, desc: "折断的树枝" },
  { id: "w5", name: "泥巴",   cat: "B", price: 1, desc: "一坨泥巴" },

  /* C 类：爱好道具 */
  { id: "h_qin",  name: "古琴", cat: "C", price: 500, hobby: "琴", desc: "解锁【琴】爱好" },
  { id: "h_qi",   name: "棋盘", cat: "C", price: 300, hobby: "棋", desc: "解锁【棋】爱好" },
  { id: "h_shu",  name: "笔墨", cat: "C", price: 200, hobby: "书", desc: "解锁【书】爱好" },
  { id: "h_hua",  name: "画卷", cat: "C", price: 400, hobby: "画", desc: "解锁【画】爱好" },
  { id: "h_hua2", name: "花种", cat: "C", price: 150, hobby: "花", desc: "解锁【花】爱好" },
  { id: "h_diao", name: "鱼竿", cat: "C", price: 100, hobby: "钓", desc: "解锁【钓】爱好" },

  /* D 类：消耗品 */
  { id: "d_gan", name: "干粮", cat: "D", price: 20, desc: "抵消一次饿肚子" },
  { id: "d_re",  name: "热水", cat: "D", price: 10, desc: "心情 +1" },
  { id: "d_gao", name: "药膏", cat: "D", price: 30, desc: "气血 +20" },
];