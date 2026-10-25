/* ============================================================
   data/forge-affixes.js - 炼器词条池
   ------------------------------------------------------------
   词条 = 装备上的额外加成
   每件装备生成 N 条词条（按品级）
   
   字段：
   - id / name
   - type: "atk" / "def" / "special"
   - stat: 加到的属性（atk / def / hpMax / critRate / critMult / lifesteal / reflect / spellBonus / hpRegen）
   - baseRange: [min, max] 基础数值范围（1 品）
   - gradeScale: 每品级增加倍数
   - format: 显示格式（"+" / "%"）
   ============================================================ */

const FORGE_AFFIXES = [
  /* ===== 攻击类 ===== */
  { id: "atk_flat",   name: "攻击",     type: "atk",
    stat: "atk",       baseRange: [2, 4],    gradeScale: 2.2, format: "+%d" },
  { id: "crit_rate",  name: "暴击率",   type: "atk",
    stat: "critRate",  baseRange: [0.5, 1.0], gradeScale: 0.5, format: "+%s%%", percent: true },
  { id: "crit_mult",  name: "暴击伤害", type: "atk",
    stat: "critMult",  baseRange: [3, 6],     gradeScale: 1.8, format: "+%d%%" },

  /* ===== 防御类 ===== */
  { id: "def_flat",   name: "防御",     type: "def",
    stat: "def",       baseRange: [1, 3],    gradeScale: 1.8, format: "+%d" },
  { id: "hp_max",     name: "气血上限", type: "def",
    stat: "hpMax",     baseRange: [10, 20],  gradeScale: 2.5, format: "+%d" },
  { id: "hp_regen",   name: "气血回复", type: "def",
    stat: "hpRegen",   baseRange: [1, 2],    gradeScale: 1.5, format: "每回合 +%d" },

  /* ===== 特殊类 ===== */
  { id: "lifesteal",  name: "吸血",     type: "special",
    stat: "lifesteal", baseRange: [1, 2],    gradeScale: 0.8, format: "攻击回复 %d%%" },
  { id: "reflect",    name: "反伤",     type: "special",
    stat: "reflect",   baseRange: [1, 2],    gradeScale: 0.8, format: "受击反弹 %d%%" },
  { id: "spell_bonus",name: "法术加成", type: "special",
    stat: "spellBonus",baseRange: [2, 3],    gradeScale: 1.5, format: "法术 +%d%%" },
  { id: "hit_rate",   name: "命中",     type: "special",
    stat: "hitRate",   baseRange: [2, 4],    gradeScale: 1.2, format: "+%d%%" },
];

/* ============================================================
   工具
   ============================================================ */

/* 按品级算出词条实际数值 */
function rollAffixValue(affix, grade) {
  const [min, max] = affix.baseRange;
  const base = rnd(min, max);
  const value = base * Math.pow(affix.gradeScale, grade - 1);
  /* 暴击率这种小数值，保留 1 位小数 */
  if (affix.percent) return +value.toFixed(1);
  return Math.max(1, Math.round(value));
}

/* 每个品级词条数 */
function getAffixCountByGrade(grade) {
  const table = [0, 0, 1, 1, 2, 2, 3, 4];  /* index = grade，0 和 1 品 0 条 */
  return table[grade] || 0;
}

/* 随机生成 N 条词条（不重复） */
function rollAffixes(grade) {
  const count = getAffixCountByGrade(grade);
  if (count === 0) return [];

  const pool = [...FORGE_AFFIXES];
  const result = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const affix = pool.splice(idx, 1)[0];
    result.push({
      id: affix.id,
      name: affix.name,
      stat: affix.stat,
      value: rollAffixValue(affix, grade),
      format: affix.format,
      percent: !!affix.percent,
    });
  }

  return result;
}

/* 把词条格式化成文本 */
function formatAffix(affix) {
  let str = affix.format;
  if (str.includes("%s")) {
    str = str.replace("%s", affix.value);
  } else if (str.includes("%d")) {
    str = str.replace("%d", affix.value);
  }
  return `${affix.name}　${str}`;
}

/* 把词条加到装备对象上 */
function applyAffixesToEquip(equip, affixes) {
  if (!equip) return equip;
  equip.affixes = affixes || [];
  /* 词条的属性加成会在 totalAtk 等函数里被聚合 */
  return equip;
}