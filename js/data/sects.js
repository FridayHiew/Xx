/* ============================================================
   data/sects.js - 宗门 / 山峰
   ============================================================ */

/* 宗门 */
/* zheng / xie：心法正邪属性（用于匹配度） */
/* requireZheng / requireXie：入门前的最低悟性（暂不检查） */
/* requireRoot：入门最低灵根（暂不检查） */
const SECTS = [
  { id: "qingyun",  name: "青云宗", camp: "正道", specialty: "剑修", art: "青云吐纳法", weapon: "青峰",
    desc: "剑意凌厉，正道领袖", accept: ["jin", "lei"], level: 1,
    zheng: 85, xie: 15,
    requireZheng: 30, requireXie: 0, requireRoot: { jin: 2, lei: 2 } },

  { id: "danxia",   name: "丹霞谷", camp: "正道", specialty: "炼丹", art: "丹霞凝气诀", weapon: "丹霞",
    desc: "天下丹药出丹霞", accept: ["huo", "mu"], level: 1,
    zheng: 80, xie: 20,
    requireZheng: 30, requireXie: 0, requireRoot: { huo: 2, mu: 2 } },

  { id: "hehuan",   name: "合欢宗", camp: "中立", specialty: "双修", art: "合欢双修法", weapon: "合欢",
    desc: "亦正亦邪，双修圣地", accept: ["*"], level: 1,
    zheng: 50, xie: 50,
    requireZheng: 30, requireXie: 30, requireRoot: { shui: 2 } },

  { id: "wanshou",  name: "万兽门", camp: "中立", specialty: "御兽", art: "万兽心法", weapon: "万兽",
    desc: "御兽共生，兽为战力", accept: ["mu", "tu"], level: 1,
    zheng: 55, xie: 45,
    requireZheng: 30, requireXie: 30, requireRoot: { mu: 2, tu: 2 } },

  { id: "tianji",   name: "天机阁", camp: "中立", specialty: "阵法", art: "天机阵道", weapon: "天机",
    desc: "阵法机关，天下第一", accept: ["tu", "jin"], level: 1,
    zheng: 50, xie: 50,
    requireZheng: 30, requireXie: 30, requireRoot: { tu: 2, jin: 2 } },

  { id: "fulu",     name: "符箓宗", camp: "中立", specialty: "符修", art: "符箓心经", weapon: "符箓",
    desc: "符箓天下闻名", accept: ["jin", "huo"], level: 1,
    zheng: 50, xie: 50,
    requireZheng: 30, requireXie: 30, requireRoot: { jin: 2, huo: 2 } },

  { id: "youming",  name: "幽冥宗", camp: "邪道", specialty: "鬼修", art: "幽冥引魂诀", weapon: "幽冥",
    desc: "操控鬼魂，阴森可怖", accept: ["shui", "bing"], level: 1,
    zheng: 20, xie: 80,
    requireZheng: 0, requireXie: 30, requireRoot: { shui: 2, bing: 2 } },

  { id: "xuemou",   name: "血魔宗", camp: "邪道", specialty: "血修", art: "血魔炼气诀", weapon: "血魔",
    desc: "以血入道，狂暴嗜杀", accept: ["huo", "lei"], level: 1,
    zheng: 15, xie: 85,
    requireZheng: 0, requireXie: 30, requireRoot: { huo: 2, lei: 2 } },

  { id: "xuanbing", name: "玄冰宫", camp: "正道", specialty: "冰修", art: "玄冰凝气诀", weapon: "玄冰",
    desc: "冰封千里，控场为尊", accept: ["bing", "shui"], level: 1,
    zheng: 70, xie: 30,
    requireZheng: 30, requireXie: 0, requireRoot: { bing: 2, shui: 2 } },

  { id: "leiyin",   name: "雷音寺", camp: "正道", specialty: "佛修", art: "雷音梵音诀", weapon: "雷音",
    desc: "雷法降魔，克制邪祟", accept: ["lei", "jin"], level: 1,
    zheng: 90, xie: 10,
    requireZheng: 35, requireXie: 0, requireRoot: { lei: 2, jin: 2 } },

  { id: "yaowang",  name: "药王谷", camp: "正道", specialty: "医修", art: "药王养生诀", weapon: "药王",
    desc: "救死扶伤，医道通神", accept: ["mu", "shui"], level: 1,
    zheng: 85, xie: 15,
    requireZheng: 30, requireXie: 0, requireRoot: { mu: 2, shui: 2 } },

  { id: "jianzhong",name: "剑冢",  camp: "中立", specialty: "剑修", art: "剑冢养剑诀", weapon: "剑冢",
    desc: "剑意可斩神魂", accept: ["jin", "lei"], level: 1,
    zheng: 45, xie: 55,
    requireZheng: 30, requireXie: 30, requireRoot: { jin: 2, lei: 2 } },

  { id: "linglong", name: "玲珑阁", camp: "中立", specialty: "商修", art: "玲珑纳气诀", weapon: "玲珑",
    desc: "富可敌国，商道通天", accept: ["*"], level: 1,
    zheng: 50, xie: 50,
    requireZheng: 30, requireXie: 30, requireRoot: { jin: 2 } },

  { id: "huanyue",  name: "幻月宗", camp: "中立", specialty: "幻修", art: "幻月梦引诀", weapon: "幻月",
    desc: "幻境迷心，梦中杀人", accept: ["shui", "bing"], level: 1,
    zheng: 35, xie: 65,
    requireZheng: 30, requireXie: 30, requireRoot: { shui: 2, bing: 2 } },

  { id: "xingchen", name: "星辰阁", camp: "正道", specialty: "星修", art: "星辰观想诀", weapon: "星辰",
    desc: "观星悟道，全能之选", accept: ["*"], level: 1,
    zheng: 75, xie: 25,
    requireZheng: 30, requireXie: 0, requireRoot: { jin: 2 } },
];

/* 山峰 */
const PEAKS = [
  { id: "zhaoyang", name: "朝阳峰", specialty: "剑修" },
  { id: "luoxia",   name: "落霞峰", specialty: "炼丹" },
  { id: "wangyue",  name: "望月峰", specialty: "阵法" },
  { id: "tingtao",  name: "听涛峰", specialty: "御兽" },
  { id: "wenjian",  name: "问剑峰", specialty: "战斗" },
];