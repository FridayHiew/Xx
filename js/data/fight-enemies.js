/* ============================================================
   data/fight-enemies.js - 敌人数据
   
   敌人和玩家一样，是完整单位。
   字段：
   - id / name
   - realm / sub: 境界（0=凡人, 1=炼气...）
   - hp / mp: 基础值，会按玩家境界缩放
   - atk / def / speed
   - skills: 会的技能 id
   - spells: 会的法术 id
   - items: 带的道具 { "回血丹": 2 }
   - ai: "simple" / "aggressive" / "defensive"
   - isBeast: 是否妖兽（可收服）
   - tameRate: 收服率
   - canFlee: 是否能逃跑
   - fleeRate: 逃跑率
   - exp / stone: 战利品
   - drop: 掉落物（可选）
   ============================================================ */
/* ============================================================
   data/fight-enemies.js - 敌人数据
   ============================================================ */

const FIGHT_ENEMIES = {
  /* ===== 凡人期 ===== */
  normal: [
    { id: "e_wolf", name: "野狼", realm: 0, sub: 0,
      hp: 60,  mp: 0,  atk: 8,  def: 2,  speed: 12,
      skills: [], spells: [], items: {},
      resistances: { poison: 0, burn: -20, bleed: 0 },
      ai: "simple",
      isBeast: true, tameRate: 0.15,
      canFlee: true, fleeRate: 0.3,
      exp: 30, stone: 10 },

    { id: "e_snake", name: "黑蛇", realm: 0, sub: 0,
      hp: 80,  mp: 0,  atk: 12, def: 4,  speed: 14,
      skills: [], spells: [], items: {},
      resistances: { poison: 60 },
      attackInflict: { poison: 0.4 },
      ai: "simple",
      isBeast: true, tameRate: 0.12,
      canFlee: true, fleeRate: 0.25,
      exp: 50, stone: 15 },

    { id: "e_boar", name: "山猪", realm: 0, sub: 0,
      hp: 100, mp: 0,  atk: 10, def: 6,  speed: 8,
      skills: [], spells: [], items: {},
      resistances: { stun: 30 },
      ai: "simple",
      isBeast: true, tameRate: 0.10,
      canFlee: false, fleeRate: 0,
      exp: 60, stone: 20 },

    { id: "e_bee", name: "毒蜂", realm: 0, sub: 0,
      hp: 50,  mp: 0,  atk: 15, def: 1,  speed: 18,
      skills: [], spells: [], items: {},
      resistances: { poison: 40 },
      attackInflict: { poison: 0.6 },
      ai: "simple",
      isBeast: true, tameRate: 0.18,
      canFlee: true, fleeRate: 0.4,
      exp: 40, stone: 12 },
  ],

  /* ===== 炼气期 ===== */
  elite: [
    { id: "e_tiger", name: "妖虎", realm: 1, sub: 1,
      hp: 200, mp: 20, atk: 25, def: 10, speed: 15,
      skills: ["sk_fist1"], spells: [], items: {},
      resistances: {},
      ai: "simple",
      isBeast: true, tameRate: 0.08,
      canFlee: true, fleeRate: 0.2,
      exp: 150, stone: 60 },

    { id: "e_fox", name: "灵狐", realm: 1, sub: 2,
      hp: 180, mp: 40, atk: 30, def: 8,  speed: 20,
      skills: [], spells: ["lingqi_bo"], items: {},
      resistances: { burn: 30 },
      ai: "simple",
      isBeast: true, tameRate: 0.10,
      canFlee: true, fleeRate: 0.35,
      exp: 160, stone: 70 },

    { id: "e_bat", name: "血蝠", realm: 1, sub: 1,
      hp: 220, mp: 20, atk: 28, def: 12, speed: 16,
      skills: [], spells: [], items: {},
      resistances: { bleed: 50 },
      attackInflict: { bleed: 0.5 },
      ai: "simple",
      isBeast: true, tameRate: 0.09,
      canFlee: true, fleeRate: 0.25,
      exp: 180, stone: 80 },
  ],

  /* ===== Boss ===== */
  boss: [
    { id: "e_chaos", name: "混沌兽", realm: 2, sub: 5,
      hp: 500, mp: 100, atk: 60, def: 25, speed: 18,
      skills: ["sk_sword2", "sk_blade2"], spells: ["huojian"], items: { "回血丹": 2 },
      resistances: { poison: 50, burn: 50, bleed: 50, stun: 60 },
      ai: "simple",
      isBeast: true, tameRate: 0.02,
      canFlee: false, fleeRate: 0,
      exp: 600, stone: 300 },
  ],
};

function getEnemyById(id) {
  for (const tier in FIGHT_ENEMIES) {
    const found = FIGHT_ENEMIES[tier].find(e => e.id === id);
    if (found) return found;
  }
  return null;
}