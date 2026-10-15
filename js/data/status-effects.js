/* ============================================================
   data/status-effects.js - 状态效果
   ============================================================ */

const STATUS_EFFECTS = {
  /* ===== DOT ===== */
  poison: {
    name: "中毒", type: "debuff", icon: "☠",
    dmgPerTurn: 5, defaultTurns: 3,
    stackable: true, maxStacks: 3,
    dot: true,
  },
  burn: {
    name: "灼烧", type: "debuff", icon: "🔥",
    dmgPerTurn: 8, defaultTurns: 2,
    stackable: true, maxStacks: 3,
    dot: true,
  },
  bleed: {
    name: "流血", type: "debuff", icon: "🩸",
    dmgPerTurn: 6, defaultTurns: 3,
    stackable: true, maxStacks: 5,
    dot: true,
  },

  /* ===== 控制 ===== */
  stun: {
    name: "眩晕", type: "debuff", icon: "💫",
    skipTurn: true, defaultTurns: 1,
    stackable: false,
  },
  freeze: {
    name: "冰冻", type: "debuff", icon: "❄",
    skipTurn: true, defaultTurns: 1,
    stackable: false,
  },
  silence: {
    name: "沉默", type: "debuff", icon: "🔇",
    noSpell: true, defaultTurns: 2,
    stackable: false,
  },

  /* ===== Buff ===== */
  atkUp: {
    name: "攻击提升", type: "buff", icon: "⬆",
    atkMod: 0.5, defaultTurns: 3,
    stackable: false,
  },
  defUp: {
    name: "防御提升", type: "buff", icon: "🛡",
    defMod: 1.0, defaultTurns: 2,
    stackable: false,
  },

  /* ===== Debuff ===== */
  atkDown: {
    name: "攻击下降", type: "debuff", icon: "⬇",
    atkMod: -0.3, defaultTurns: 3,
    stackable: false,
  },

  /* ===== 特殊 ===== */
  regen: {
    name: "回复", type: "buff", icon: "💚",
    healPerTurn: 10, defaultTurns: 3,
    stackable: false,
  },
  shield: {
    name: "护盾", type: "buff", icon: "🔵",
    shieldValue: 50, defaultTurns: 2,
    stackable: false,
  },
};

function getStatusDef(id) {
  return STATUS_EFFECTS[id];
}