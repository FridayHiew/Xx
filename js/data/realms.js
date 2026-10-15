
/* 天赋（决定最高境界） */

const APTITUDES = [
  { id: "fan",   name: "凡骨", maxRealm: 2, desc: "资质平庸，最多修到金丹。" },
  { id: "zhong", name: "中品", maxRealm: 3, desc: "资质尚可，可至元婴。" },
  { id: "shang", name: "上品", maxRealm: 5, desc: "资质上佳，可至化神。" },
  { id: "tian",  name: "天灵", maxRealm: 7, desc: "天纵之资，可至合体。" },
  { id: "xian",  name: "仙骨", maxRealm: 9, desc: "天生仙骨，可至渡劫飞升。" },
];

/* 灵根类型 */
const ROOT_TYPES = [
  { id: "jin",  name: "金" },
  { id: "mu",   name: "木" },
  { id: "shui", name: "水" },
  { id: "huo",  name: "火" },
  { id: "tu",   name: "土" },
  { id: "lei",  name: "雷" },
  { id: "bing", name: "冰" },
];


/* 境界（realm 索引：0=凡人, 1=炼气, 2=筑基, 3=金丹, 4=元婴, 5=化神, 6=炼虚, 7=合体, 8=大乘, 9=渡劫） */
const REALMS = [
  { name: "凡人", life: 80 },
  { name: "炼气", life: 120 },
  { name: "筑基", life: 200 },
  { name: "金丹", life: 400 },
  { name: "元婴", life: 800 },
  { name: "化神", life: 1500 },
  { name: "炼虚", life: 3000 },
  { name: "合体", life: 6000 },
  { name: "大乘", life: 12000 },
  { name: "渡劫", life: 20000 },
];