/* ============================================================
   systems/status.js - 状态管理
   ============================================================ */

/* ============================================================
   加 / 移除 / 检查
   ============================================================ */

function addStatus(unit, statusId, turns) {
  const def = getStatusDef(statusId);
  if (!def) return;
  if (!unit.statuses) unit.statuses = [];

  turns = turns || def.defaultTurns || 1;

  if (def.stackable) {
    const existing = unit.statuses.find(s => s.id === statusId);
    if (existing) {
      existing.stacks = Math.min(
        (existing.stacks || 1) + 1,
        def.maxStacks || 5
      );
      existing.turns = Math.max(existing.turns, turns);
    } else {
      unit.statuses.push({ id: statusId, turns, stacks: 1 });
    }
  } else {
    const existing = unit.statuses.find(s => s.id === statusId);
    if (existing) {
      existing.turns = Math.max(existing.turns, turns);
    } else {
      unit.statuses.push({ id: statusId, turns, stacks: 1 });
    }
  }
}

function removeStatus(unit, statusId) {
  if (!unit.statuses) return;
  unit.statuses = unit.statuses.filter(s => s.id !== statusId);
}

function hasStatus(unit, statusId) {
  if (!unit.statuses) return false;
  return unit.statuses.some(s => s.id === statusId);
}

function isSkipTurn(unit) {
  if (!unit.statuses) return false;
  return unit.statuses.some(s => {
    const def = getStatusDef(s.id);
    return def && def.skipTurn;
  });
}

function isSilenced(unit) {
  if (!unit.statuses) return false;
  return unit.statuses.some(s => {
    const def = getStatusDef(s.id);
    return def && def.noSpell;
  });
}

/* ============================================================
   属性修正
   ============================================================ */

function getStatusMod(unit) {
  const mod = { atk: 0, def: 0, speed: 0 };
  if (!unit.statuses) return mod;

  unit.statuses.forEach(s => {
    const def = getStatusDef(s.id);
    if (!def) return;
    if (def.atkMod) mod.atk += def.atkMod;
    if (def.defMod) mod.def += def.defMod;
    if (def.speedMod) mod.speed += def.speedMod;
  });

  return mod;
}

/* ============================================================
   抗性判定
   ============================================================ */

/* 尝试给目标加状态，返回 { added, reason } */
function tryInflictStatus(target, statusId, baseChance) {
  const def = getStatusDef(statusId);
  if (!def) return { added: false, reason: "unknown" };

  const resist = getResistValue(target, statusId);
  const mod = resistToMod(resist);

  /* 吸收：回血 */
  if (mod.absorb) {
    const dmgBase = def.dmgPerTurn || 5;
    const heal = dmgBase * 2;
    target.hp = Math.min(target.hpMax, target.hp + heal);
    logBattle(`${target.name} 吸收了【${def.name}】，回复 ${heal} 气血`);
    return { added: false, reason: "absorb" };
  }

  /* 免疫 */
  if (mod.immune) {
    logBattle(`${target.name} 免疫【${def.name}】`);
    return { added: false, reason: "immune" };
  }

  /* 触发率判定 */
  const finalChance = baseChance * mod.trigger;
  if (!chance(finalChance)) {
    return { added: false, reason: "miss" };
  }

  addStatus(target, statusId);
  logBattle(`${target.name} 陷入【${def.name}】`);
  return { added: true, reason: "hit" };
}

/* ============================================================
   回合处理
   ============================================================ */

/* 回合开始：DOT 扣血 / regen 回血，返回日志数组 */
function processTurnStart(unit) {
  const logs = [];
  if (!unit.statuses || unit.statuses.length === 0) return logs;

  let totalDmg = 0;
  let totalHeal = 0;

  unit.statuses.forEach(s => {
    const def = getStatusDef(s.id);
    if (!def) return;

    if (def.dmgPerTurn) {
      const stacks = s.stacks || 1;
      const resist = getResistValue(unit, s.id);
      const mod = resistToMod(resist);
      /* dmg 倍率，负数 = 吸收 */
      let dmg = def.dmgPerTurn * stacks * mod.dmg;

      if (dmg < 0) {
        totalHeal += Math.abs(dmg);
      } else {
        totalDmg += dmg;
      }
    }
    if (def.healPerTurn) {
      totalHeal += def.healPerTurn;
    }
  });

  if (totalDmg > 0) {
    applyDamage(unit, totalDmg);
    logs.push(`${unit.name} 受到 ${Math.floor(totalDmg)} 点持续伤害`);
  }
  if (totalHeal > 0) {
    unit.hp = Math.min(unit.hpMax, unit.hp + totalHeal);
    logs.push(`${unit.name} 回复 ${Math.floor(totalHeal)} 点气血`);
  }

  return logs;
}

/* 回合结束：turns-- 并移除过期 */
function processTurnEnd(unit) {
  if (!unit.statuses) return;
  unit.statuses.forEach(s => { s.turns--; });
  unit.statuses = unit.statuses.filter(s => s.turns > 0);
}

/* 战斗结束：清状态
   - 玩家：保留 DOT
   - 敌人：全清
*/
function clearBattleStatuses() {
  if (!battle) return;
  battle.units.forEach(u => {
    if (!u.statuses) return;
    if (u.isPlayer) {
      u.statuses = u.statuses.filter(s => {
        const def = getStatusDef(s.id);
        return def && def.dot;
      });
      S.statuses = u.statuses.slice();
    } else {
      u.statuses = [];
    }
  });
}

/* 新一天：处理玩家残留 DOT */
function processDailyStatus() {
  if (!S.statuses || S.statuses.length === 0) return false;

  let totalDmg = 0;
  S.statuses.forEach(s => {
    const def = getStatusDef(s.id);
    if (def && def.dmgPerTurn) {
      const stacks = s.stacks || 1;
      const resist = (S.resistances && S.resistances[s.id]) || 0;
      const mod = resistToMod(resist);
      let dmg = def.dmgPerTurn * stacks * mod.dmg;
      if (dmg < 0) {
        S.hp = Math.min(totalMaxHp(), S.hp + Math.abs(dmg));
      } else {
        totalDmg += dmg;
      }
    }
    s.turns--;
  });

  if (totalDmg > 0) {
    S.hp -= totalDmg;
    log(`【持续伤害】气血 -${Math.floor(totalDmg)}。`, "c-bad");
  }

  S.statuses = S.statuses.filter(s => s.turns > 0);

  if (S.hp <= 0) {
    S.hp = 0;
    die("毒发身亡。");
    return true;
  }
  return false;
}