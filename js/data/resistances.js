/* ============================================================
   data/resistances.js - 抗性系统
   
   抗性值 -100 ~ 100：
   - 100+      ：吸收（回血）
   - 80~99     ：完全免疫（不触发）
   - 0~79      ：线性降低触发率和伤害
   - 0         ：正常
   - -1~-100   ：线性提高触发率和伤害
   ============================================================ */

/* 抗性 → 倍率 */
function resistToMod(resist) {
  resist = resist || 0;

  /* 吸收 */
  if (resist >= 100) {
    return { trigger: 0, dmg: -1, absorb: true };
  }
  /* 免疫 */
  if (resist >= 80) {
    return { trigger: 0, dmg: 0, immune: true };
  }

  if (resist >= 0) {
    /* 0~79：线性降低 1.0 → 0.1 */
    const t = resist / 80;
    const m = 1 - t * 0.9;
    return { trigger: m, dmg: m };
  } else {
    /* -1~-100：线性提高 1.0 → 3.0 */
    const t = Math.min(1, -resist / 100);
    const m = 1 + t * 2;
    return { trigger: m, dmg: m };
  }
}

/* 单位对某 status 的抗性值 */
function getResistValue(unit, statusId) {
  if (!unit || !unit.resistances) return 0;
  return unit.resistances[statusId] || 0;
}

/* 抗性描述（UI） */
function resistLabel(resist) {
  if (resist >= 100) return "吸收";
  if (resist >= 80) return "免疫";
  if (resist >= 40) return "高抗";
  if (resist >= 1) return "抗性";
  if (resist === 0) return "普通";
  if (resist >= -40) return "弱点";
  return "极弱";
}