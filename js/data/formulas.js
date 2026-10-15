/* ============================================================
   data/formulas.js - 战斗公式 / 常量
   
   集中所有战斗数值。改公式只改这里。
   纯函数，不依赖 S。
   ============================================================ */

/* ============================================================
   伤害公式
   ============================================================ */

const FORMULA = {
  /* 普通攻击 */
  attackDamage: (atk, def) =>
    Math.max(1, Math.floor(atk * rnd(0.9, 1.2) - def * 0.5)),

  /* 法术 */
  spellDamage: (atk, power, bonus, def) =>
    Math.max(1, Math.floor(atk * power * (1 + bonus) * rnd(0.9, 1.2) - def * 0.3)),

  /* 技能 */
  skillDamage: (atk, power, def) =>
    Math.max(1, Math.floor(atk * power * rnd(0.9, 1.2) - def * 0.5)),

  /* 暴击倍率 */
  critMult: 2.0,

  /* 防御减伤（1 = 100%） */
  defendReduce: 0.5,

  /* 逃跑 */
  playerFleeBase: 0.5,
  playerFleeSpeedFactor: 0.02,
  playerFleeMin: 0.1,
  playerFleeMax: 0.9,

  /* 收服基础率 */
  tameBaseRate: 0.1,
};

/* ============================================================
   暴击
   ============================================================ */

const CRIT = {
  base: 0.05,
  luckFactor: 0.01,
  max: 0.5,
};

function calcCritRate(unit) {
  const luck = (unit && unit.luck) || 0;
  return Math.min(CRIT.max, CRIT.base + luck * CRIT.luckFactor);
}

/* ============================================================
   战斗常量
   ============================================================ */

const BATTLE_CONST = {
  /* 敌人强度缩放：scale = pow(base, max(0, realm - 1)) */
  enemyScaleBase: 1.6,

  /* 战斗日志上限 */
  logMax: 50,

  /* 技能消耗 hp 最低保留（普通技能） */
  hpFloorNormal: 1,

  /* 防御持续回合 */
  defendDuration: 1,
};

/* ============================================================
   敌人 AI
   ============================================================ */

const AI_CONFIG = {
  /* 血低于这个比例 → 用回血丹 */
  healHpThreshold: 0.3,

  /* 灵力至少这个值 → 可能用法术 */
  spellMpThreshold: 20,

  /* 血气至少这个值 → 可能用技能 */
  skillHpThreshold: 20,

  /* 逃跑血线 */
  fleeHpThreshold: 0.2,

  /* 各动作权重（随机时用） */
  weights: {
    attack: 50,
    spell: 20,
    skill: 20,
    item: 5,
    defend: 5,
  },
};

/* ============================================================
   逃跑
   ============================================================ */

function calcPlayerFleeRate(playerUnit, enemyUnit) {
  if (!enemyUnit) return 1;
  const diff = (playerUnit.speed || 0) - (enemyUnit.speed || 0);
  const rate = FORMULA.playerFleeBase + diff * FORMULA.playerFleeSpeedFactor;
  return Math.max(FORMULA.playerFleeMin, Math.min(FORMULA.playerFleeMax, rate));
}

/* ============================================================
   敌人强度缩放
   ============================================================ */

function calcEnemyScale(realm) {
  return Math.pow(BATTLE_CONST.enemyScaleBase, Math.max(0, realm - 1));
}