/* ============================================================
   systems/battle.js - 战斗核心
   ============================================================ */

let battle = null;

/* ============================================================
   开战
   ============================================================ */

function startBattle(enemyDefs) {
  const enemies = enemyDefs.map((def, i) => {
    /* ★ 支持自定义敌人（如榜单 NPC） */
    let base = def.customEnemy || (def.enemyId ? getEnemyById(def.enemyId) : def);
    if (!base) return null;

    /* 如果没有 hp（榜单 NPC），按境界自动计算 */
    if (!base.hp) {
      base.hp = 80 + (base.sub || 1) * 25 + (base.realm || 0) * 100;
      base.mp = 10 + (base.sub || 1) * 5;
      base.atk = 6 + (base.sub || 1) * 3 + (base.realm || 0) * 5;
      base.def = 2 + (base.sub || 1) * 1 + (base.realm || 0) * 3;
      base.speed = 10 + (base.sub || 1);
      base.exp = base.exp || (20 * (base.realm || 0) + 10 * (base.sub || 1));
      base.stone = base.stone || (30 + 20 * (base.realm || 0));
    }

    const scale = calcEnemyScale(base.realm || 0);
    return {
      id: "enemy_" + i,
      defId: base.id,
      side: "enemy",
      name: base.name,
      realm: base.realm || 0,
      sub: base.sub || 0,
      hp: Math.floor(base.hp * scale),
      hpMax: Math.floor(base.hp * scale),
      mp: Math.floor((base.mp || 0) * scale),
      mpMax: Math.floor((base.mp || 0) * scale),
      atk: Math.floor(base.atk * scale),
      def: Math.floor(base.def * scale),
      speed: base.speed || 10,
      skills: base.skills || [],
      spells: base.spells || [],
      items: buildEnemyItems(base.items || {}),
      skillLv: {},
      ai: base.ai || "simple",
      isBeast: !!base.isBeast,
      tameRate: base.tameRate || 0,
      canFlee: !!base.canFlee,
      fleeRate: base.fleeRate || 0,
      attackInflict: base.attackInflict || null,
      resistances: Object.assign({}, base.resistances || {}),
      exp: Math.floor((base.exp || 0) * scale),
      stone: Math.floor((base.stone || 0) * scale),
      alive: true,
      escaped: false,
      tamed: false,
      defending: false,
      statuses: [],
    };
  });

  const playerUnit = buildPlayerUnit();

  battle = {
    units: [playerUnit, ...enemies],
    order: [],
    currentIdx: 0,
    round: 1,
    log: [],
    pendingPets: [],
  };

  logBattle(`遭遇：${enemies.map(e => e.name).join("、")}`);
  nextRound();
  save();
  renderBattle();
}

/* 构造玩家单位 */
function buildPlayerUnit() {
  const info = getPlayerRealmInfo();

  const skillLv = {};
  for (const k in S.skills) skillLv[k] = S.skills[k].lvl;

  return {
    id: "player",
    side: "player",
    isPlayer: true,
    name: S.name,
    realm: info.realm,
    sub: info.lvl,

    get hp() { return S.hp; },
    set hp(v) { S.hp = v; },
    get hpMax() { return totalMaxHp(); },
    get mp() { return S.mp; },
    set mp(v) { S.mp = v; },
    get mpMax() { return totalMaxMp(); },
    get atk() { return totalAtk(); },
    get def() { return totalDef(); },
    get speed() { return totalSpeed(); },
    get luck() { return totalLuck(); },

    skills: listUsableSkills({
      skills: COMBAT_SKILLS.map(s => s.id),
      skillLv: skillLv,
      hp: S.hp,
    }),
    skillLv: skillLv,
    spells: S.spells ? S.spells.learned.slice() : [],
    items: S.inventory,
    resistances: totalResistances(),
    statuses: S.statuses ? JSON.parse(JSON.stringify(S.statuses)) : [],
    alive: true,
    defending: false,
  };
}

/* ============================================================
   回合流程
   ============================================================ */

function nextRound() {
  if (!battle) return;

  applyPendingPets();

  battle.order = battle.units
    .filter(u => u.alive && !u.escaped && !u.tamed)
    .sort((a, b) => getEffectiveSpeed(b) - getEffectiveSpeed(a));

  battle.currentIdx = 0;
  logBattle(`—— 第 ${battle.round} 回合 ——`);
  nextTurn();
}

function nextTurn() {
  if (!battle) return;
  if (checkBattleEnd()) return;

  while (battle.currentIdx < battle.order.length) {
    const u = battle.order[battle.currentIdx];
    if (u.alive && !u.escaped && !u.tamed) break;
    battle.currentIdx++;
  }

  if (battle.currentIdx >= battle.order.length) {
    battle.round++;
    nextRound();
    return;
  }

  const u = battle.order[battle.currentIdx];
  u.defending = false;

  const startLogs = processTurnStart(u);
  startLogs.forEach(l => logBattle(l));

  if (!u.alive) {
    processTurnEnd(u);
    if (!checkBattleEnd()) advanceTurn();
    return;
  }

  if (isSkipTurn(u)) {
    logBattle(`${u.name} 被控制，无法行动`);
    processTurnEnd(u);
    if (battle && !checkBattleEnd()) {
      renderBattle();
      advanceTurn();
    }
    return;
  }

  if (u.isPlayer) {
    renderBattle();
  } else if (u.isPet) {
    setTimeout(() => petTurn(u), 500);
  } else {
    setTimeout(() => enemyTurn(u), 500);
  }
}

function advanceTurn() {
  if (!battle) return;
  battle.currentIdx++;
  nextTurn();
}

/* ============================================================
   玩家动作
   ============================================================ */

function playerAction(action, params) {
  if (!battle) return;
  const u = battle.order[battle.currentIdx];
  if (!u || !u.isPlayer) return;

  params = params || {};

  switch (action) {
    case "attack": doAttack(u, params.targetId); break;
    case "spell":  doSpell(u, params.spellId, params.targetId); break;
    case "skill":  doSkill(u, params.skillId, params.targetId); break;
    case "item":   doItem(u, params.itemId, params.targetId); break;
    case "flee":   doFlee(u); break;
    case "defend": doDefend(u); break;
    case "tame":   doTame(u, params.targetId); break;
    case "summon": doSummon(u, params.skillId); break;
  }

  processTurnEnd(u);
  if (battle && !checkBattleEnd()) {
    renderBattle();
    advanceTurn();
  }
}

/* ============================================================
   敌人 AI
   ============================================================ */

function enemyTurn(u) {
  if (!battle || !u.alive) return;

  const action = chooseEnemyAction(u);

  switch (action.type) {
    case "attack": doAttack(u); break;
    case "spell":  doSpell(u, action.spellId); break;
    case "skill":  doSkill(u, action.skillId); break;
    case "item":   doItem(u, action.itemId); break;
    case "flee":   doFlee(u); break;
    case "defend": doDefend(u); break;
  }

  processTurnEnd(u);
  if (battle && !checkBattleEnd()) {
    renderBattle();
    advanceTurn();
  }
}

function chooseEnemyAction(u) {
  const hpRate = u.hp / u.hpMax;

  if (hpRate < AI_CONFIG.healHpThreshold) {
    /* 敌人用回春丹（任意阶任意品） */
    for (const id in u.items) {
      if (u.items[id] <= 0) continue;
      const item = ITEMS[id];
      if (item && item.type === "pill" && item.effect && item.effect.type === "heal") {
        return { type: "item", itemId: id };
      }
    }
  }

  if (u.canFlee && hpRate < AI_CONFIG.fleeHpThreshold && chance(u.fleeRate)) {
    return { type: "flee" };
  }

  if (!isSilenced(u) && u.mp >= AI_CONFIG.spellMpThreshold && u.spells.length > 0) {
    const sid = pick(u.spells);
    const sp = getSpell(sid);
    if (sp && u.mp >= sp.cost.mp) {
      return { type: "spell", spellId: sid };
    }
  }

  if (u.hp >= AI_CONFIG.skillHpThreshold && u.skills.length > 0) {
    const sid = pick(u.skills);
    const sk = getCombatSkill(sid);
    if (sk) {
      return { type: "skill", skillId: sid };
    }
  }

  return { type: "attack" };
}

/* ============================================================
   目标
   ============================================================ */

function getTargetsByType(caster, targetType, pickedTargetId) {
  if (!battle) return [];

  const enemySide = caster.side === "player" ? "enemy" : "player";
  const allySide = caster.side;

  const aliveEnemies = battle.units.filter(u =>
    u.side === enemySide && u.alive && !u.escaped && !u.tamed
  );
  const aliveAllies = battle.units.filter(u =>
    u.side === allySide && u.alive
  );

  switch (targetType) {
    case "enemySingle": {
      if (pickedTargetId) {
        const t = aliveEnemies.find(u => u.id === pickedTargetId);
        return t ? [t] : [];
      }
      return aliveEnemies.length > 0 ? [pick(aliveEnemies)] : [];
    }
    case "enemyAll":
      return aliveEnemies;
    case "allySingle": {
      if (pickedTargetId) {
        const t = aliveAllies.find(u => u.id === pickedTargetId);
        return t ? [t] : [];
      }
      return aliveAllies.length > 0 ? [pick(aliveAllies)] : [];
    }
    case "allyAll":
      return aliveAllies;
    case "all":
      return battle.units.filter(u => u.alive && !u.escaped && !u.tamed);
    default:
      return aliveEnemies.length > 0 ? [pick(aliveEnemies)] : [];
  }
}

function targetNeedsPick(targetType) {
  return targetType === "enemySingle" || targetType === "allySingle";
}

/* ============================================================
   有效属性
   ============================================================ */

function getEffectiveAtk(unit) {
  const mod = getStatusMod(unit);
  return Math.max(1, Math.floor(unit.atk * (1 + mod.atk)));
}

function getEffectiveDef(target, attacker) {
  const mod = getStatusMod(target);
  let def = Math.max(0, Math.floor(target.def * (1 + mod.def)));

  if (attacker && attacker.isPlayer) {
    const hd = getCurrentHeavenDefyingEffect();
    if (hd && hd.armorPierce) def *= (1 - hd.armorPierce);
  }

  return Math.floor(def);
}

function getEffectiveSpeed(unit) {
  const mod = getStatusMod(unit);
  return Math.max(1, Math.floor(unit.speed * (1 + mod.speed)));
}

/* ============================================================
   动作实现
   ============================================================ */

function doAttack(attacker, pickedTargetId) {
  const targets = getTargetsByType(attacker, "enemySingle", pickedTargetId);
  if (targets.length === 0) return;
  const target = targets[0];

  const crit = chance(calcCritRate(attacker));
  let dmg = FORMULA.attackDamage(getEffectiveAtk(attacker), getEffectiveDef(target, attacker));
  if (crit) dmg = Math.floor(dmg * FORMULA.critMult);
  applyDamage(target, dmg);
  logBattle(`${attacker.name} 攻击 ${target.name}，造成 ${dmg} 伤害${crit ? "（暴击）" : ""}`);

  if (attacker.attackInflict && target.alive) {
    for (const sid in attacker.attackInflict) {
      tryInflictStatus(target, sid, attacker.attackInflict[sid]);
    }
  }
}

function doSpell(caster, spellId, pickedTargetId) {
  const spell = getSpell(spellId);
  if (!spell) return;
  if (caster.mp < spell.cost.mp) return;
  if (isSilenced(caster)) {
    logBattle(`${caster.name} 被沉默，无法施法`);
    return;
  }

  const targetType = spell.target || "enemySingle";
  const targets = getTargetsByType(caster, targetType, pickedTargetId);
  if (targets.length === 0) return;

  caster.mp -= spell.cost.mp;
  const bonus = getSpellBonusForUnit(caster);

  targets.forEach(target => {
    const crit = chance(calcCritRate(caster));
    let dmg = FORMULA.spellDamage(getEffectiveAtk(caster), spell.power, bonus, getEffectiveDef(target, caster));
    if (crit) dmg = Math.floor(dmg * FORMULA.critMult);
    applyDamage(target, dmg);
    logBattle(`${caster.name} 施展【${spell.name}】对 ${target.name}，造成 ${dmg} 伤害${crit ? "（暴击）" : ""}`);

    if (spell.inflict && target.alive) {
      for (const sid in spell.inflict) {
        tryInflictStatus(target, sid, spell.inflict[sid]);
      }
    }
  });
}

function doSkill(caster, skillId, pickedTargetId) {
  const sk = getCombatSkill(skillId);
  if (!sk) return;

  const cost = getSkillCost(sk, caster);
  if (caster.hp < cost.hp) return;

  const targetType = sk.target || "enemySingle";
  const targets = getTargetsByType(caster, targetType, pickedTargetId);
  if (targets.length === 0) return;

  if (sk.canKill) {
    caster.hp -= cost.hp;
  } else {
    caster.hp = Math.max(BATTLE_CONST.hpFloorNormal, caster.hp - cost.hp);
  }

  targets.forEach(target => {
    const crit = chance(calcCritRate(caster));
    let dmg = FORMULA.skillDamage(getEffectiveAtk(caster), sk.power, getEffectiveDef(target, caster));
    if (crit) dmg = Math.floor(dmg * FORMULA.critMult);
    applyDamage(target, dmg);
    logBattle(`${caster.name} 使用【${sk.name}】对 ${target.name}，造成 ${dmg} 伤害${crit ? "（暴击）" : ""}`);

    if (sk.inflict && target.alive) {
      for (const sid in sk.inflict) {
        tryInflictStatus(target, sid, sk.inflict[sid]);
      }
    }
  });

  if (caster.hp <= 0) {
    caster.hp = 0;
    caster.alive = false;
    logBattle(`${caster.name} 力竭倒下`);
  }
}

/* ============================================================
   使用道具
   ============================================================ */

function doItem(u, itemId, targetId) {
  const item = ITEMS[itemId];
  if (!item || item.type !== "pill" || !item.effect) return;

  if (u.isPlayer) {
    if (!hasItem(itemId)) return;

    if (item.effect.type === "inflict") {
      let target;
      if (targetId) {
        target = battle.units.find(x => x.id === targetId && x.alive);
      } else {
        target = pick(battle.units.filter(x =>
          x.side === "enemy" && x.alive && !x.escaped && !x.tamed
        ));
      }
      if (!target) return;
      tryInflictStatus(target, item.effect.status, item.effect.chance || 0.8);
      logBattle(`${u.name} 使用【${item.name}】`);
      removeItem(itemId, 1);
      return;
    }

    const ok = applyPillEffect(item, u, true);
    if (!ok) return;
    removeItem(itemId, 1);
    return;
  }

  if (!u.items[itemId] || u.items[itemId] <= 0) return;

  if (item.effect.type === "inflict") return;

  applyPillEffect(item, u, true);
  u.items[itemId]--;
  if (u.items[itemId] <= 0) delete u.items[itemId];
}

function applyPillEffect(item, unit, inBattle) {
  const e = item.effect;
  if (!e) return false;

  switch (e.type) {
    case "heal": {
      const v = Math.floor(unit.hpMax * (e.value || 0.5));
      if (unit.hp >= unit.hpMax) return false;
      unit.hp = Math.min(unit.hpMax, unit.hp + v);
      if (inBattle) logBattle(`${unit.name} 使用【${item.name}】，回复 ${v} 气血`);
      return true;
    }
    case "healMp": {
      const v = Math.floor((unit.mpMax || 0) * (e.value || 0.5));
      if (!unit.mpMax || unit.mp >= unit.mpMax) return false;
      unit.mp = Math.min(unit.mpMax, unit.mp + v);
      if (inBattle) logBattle(`${unit.name} 使用【${item.name}】，回复 ${v} 灵力`);
      return true;
    }
    case "cure": {
      if (!unit.statuses) return false;
      const had = unit.statuses.some(s => s.id === e.status);
      if (!had) return false;
      removeStatus(unit, e.status);
      if (inBattle) logBattle(`${unit.name} 使用【${item.name}】，解除【${getStatusDef(e.status).name}】`);
      return true;
    }
    case "cureAll": {
      if (!unit.statuses) return false;
      const before = unit.statuses.length;
      unit.statuses = unit.statuses.filter(s => {
        const def = getStatusDef(s.id);
        return def && def.type === "buff";
      });
      if (unit.statuses.length === before) return false;
      if (inBattle) logBattle(`${unit.name} 使用【${item.name}】，净化所有负面`);
      return true;
    }
    case "buff": {
      if (!inBattle) return false;
      addStatus(unit, e.statusId, e.turns);
      logBattle(`${unit.name} 使用【${item.name}】`);
      return true;
    }
    case "survive": {
      if (!inBattle) return false;
      if (!unit._survive) unit._survive = [];
      unit._survive.push({ threshold: e.value || 0.3, used: false });
      logBattle(`${unit.name} 使用【${item.name}】，获得濒死保护`);
      return true;
    }
    default:
      return false;
  }
}

function doDefend(u) {
  u.defending = true;
  logBattle(`${u.name} 进入防御姿态`);
}

function doFlee(u) {
  if (u.isPlayer) {
    const enemy = pickTarget(u);
    const rate = calcPlayerFleeRate(u, enemy);
    if (chance(rate)) {
      logBattle("逃跑成功");
      endBattle("flee");
      return;
    }
    logBattle("逃跑失败");
    if (enemy) doAttack(enemy, u.id);
  } else {
    if (!u.canFlee) return;
    if (chance(u.fleeRate)) {
      u.escaped = true;
      logBattle(`${u.name} 逃跑了`);
    } else {
      logBattle(`${u.name} 逃跑失败`);
    }
  }
}

function doTame(u, targetId) {
  if (S.sect !== "wanshou") {
    logBattle("只有万兽门弟子才能收服妖兽");
    return;
  }

  let target;
  if (targetId) {
    target = battle.units.find(x =>
      x.id === targetId && x.alive && x.isBeast && !x.tamed
    );
  } else {
    target = pickAliveBeast();
  }
  if (!target) { logBattle("没有可收服的妖兽"); return; }

  if (chance(target.tameRate)) {
    target.tamed = true;
    target.alive = false;

    const pet = genPet(target.defId, target.name);
    S.pets.list.push(pet);

    logBattle(`成功收服 ${target.name}！`);
  } else {
    logBattle(`收服 ${target.name} 失败`);
  }
}

/* ============================================================
   工具
   ============================================================ */

function pickTarget(u) {
  const enemySide = u.side === "player" ? "enemy" : "player";
  const alive = battle.units.filter(x =>
    x.side === enemySide && x.alive && !x.escaped && !x.tamed
  );
  return alive.length > 0 ? pick(alive) : null;
}

function pickAliveBeast() {
  const beasts = battle.units.filter(u =>
    u.side === "enemy" && u.alive && u.isBeast && !u.tamed
  );
  return beasts.length > 0 ? pick(beasts) : null;
}

function getSkillCost(sk, unit) {
  const cost = sk.cost || {};
  let hp = cost.hp || 0;
  if (hp > 0 && hp <= 1) hp = Math.floor(unit.hp * hp);
  return { hp };
}

function getSpellBonusForUnit(u) {
  if (u.isPlayer) return getSpellBonus();
  return 0;
}

function applyDamage(target, dmg) {
  if (target.isPlayer && target._survive && target._survive.length > 0) {
    const cur = target.hp;
    const after = cur - dmg;
    if (after <= 0) {
      const s = target._survive.find(x => !x.used);
      if (s) {
        s.used = true;
        target.hp = Math.max(1, Math.floor(target.hpMax * (s.threshold || 0.3)));
        logBattle(`${target.name} 的续命丹碎裂，留下一线生机！`);
        return;
      }
    }
  }

  if (target.defending) {
    dmg = Math.floor(dmg * (1 - FORMULA.defendReduce));
    target.defending = false;
  }

  if (target.statuses) {
    const shield = target.statuses.find(s => s.id === "shield");
    if (shield) {
      const def = getStatusDef("shield");
      const sv = def.shieldValue || 0;
      if (sv >= dmg) {
        shield.turns = 0;
        logBattle(`${target.name} 的护盾吸收了全部伤害`);
        return;
      } else {
        dmg -= sv;
        shield.turns = 0;
        logBattle(`${target.name} 的护盾抵消了 ${sv} 伤害`);
      }
    }
  }

  target.hp -= dmg;
  if (target.hp <= 0) {
    target.hp = 0;
    target.alive = false;
  }
}

function logBattle(text) {
  if (!battle) return;
  battle.log.push(text);
  if (battle.log.length > BATTLE_CONST.logMax) battle.log.shift();
}

/* ============================================================
   胜负
   ============================================================ */

function checkBattleEnd() {
  if (!battle) return true;

  const playerAlive = battle.units.some(u => u.side === "player" && u.alive);
  const enemyAlive = battle.units.some(u =>
    u.side === "enemy" && u.alive && !u.escaped && !u.tamed
  );

  if (!playerAlive) { endBattle("lose"); return true; }
  if (!enemyAlive) {
    const anyTamed = battle.units.some(u => u.side === "enemy" && u.tamed);
    const anyKilled = battle.units.some(u =>
      u.side === "enemy" && !u.alive && !u.tamed && !u.escaped
    );
    if (anyTamed && !anyKilled) {
      endBattle("tame");
    } else {
      endBattle("win");
    }
    return true;
  }
  return false;
}

function endBattle(result) {
  if (!battle) return;

  const b = battle;

  if (result === "win" || result === "tame") {
    let totalExp = 0, totalStone = 0;
    const killed = [];
    b.units.forEach(u => {
      if (u.side === "enemy" && !u.alive && !u.escaped && !u.tamed) {
        totalExp += u.exp || 0;
        totalStone += u.stone || 0;
        killed.push(u);
      }
    });
    S.exp += totalExp;
    S.stone += totalStone;

    /* 逆天宝物：杀敌叠层 */
    killed.forEach(() => addKillStack());

    /* 逆天宝物：杀敌揭示 */
    if (killed.length > 0) {
      checkHeavenDefyingReveal("kill");
    }

    const deadPets = handlePetsAfterBattle(b.units, killed);

    /* ★ 战利品掉落 */
    const droppedItems = [];
    killed.forEach(enemyUnit => {
      const enemyDef = getEnemyById(enemyUnit.defId);
      if (!enemyDef || !enemyDef.drops) return;
      enemyDef.drops.forEach(drop => {
        if (!chance(drop.chance || 1)) return;
        if (drop.type === "mat") {
          const grade = rndInt(drop.gradeRange[0], drop.gradeRange[1]);
          const itemId = drop.baseId + "_" + grade;
          addItem(itemId, drop.count);
          droppedItems.push(`${drop.baseId}（${grade}品）×${drop.count}`);
        } else if (drop.type === "stone") {
          const amount = rndInt(drop.amount[0], drop.amount[1]);
          S.stone += amount;
          droppedItems.push(`灵石 +${amount}`);
        } else if (drop.type === "item") {
          addItem(drop.id, drop.count);
          const name = ITEMS[drop.id] ? ITEMS[drop.id].name : drop.id;
          droppedItems.push(`${name} ×${drop.count}`);
        }
      });
    });

    if (result === "win") {
      logBattle(`战斗胜利！获得修为 ${totalExp}，灵石 ${totalStone}`);
      if (droppedItems.length > 0) {
        logBattle(`战利品：${droppedItems.join("、")}`);
      }

      /* ★ 榜单战斗胜利 */
      if (S.flags.rankBattle && typeof handleRankBattleWin === "function") {
        handleRankBattleWin();
      }

      /* ★ 小比战斗胜利 */
      if (S.flags.competitionBattle && typeof handleCompetitionWin === "function") {
        handleCompetitionWin();
      }

    } else {
      logBattle(`收服成功！获得修为 ${totalExp}，灵石 ${totalStone}`);
    }

    /* ★ 如果是从冒险地进入的战斗，记录结果 */
    if (S.flags && S.flags.adventureCombat) {
      S.flags.adventureCombat.result = result;
    }

    clearBattleStatuses();
    battle = null;
    save();
    render();
    showBattleResult(result, totalExp, totalStone);

    if (deadPets && deadPets.length > 0) {
      const names = deadPets.map(p => p.name).join("、");
      setTimeout(() => {
        showModal("灵宠陨落", `<p>${names} 在战斗中陨落。</p>`, [
          { label: "知道了", fn: closeModal }
        ]);
      }, 500);
    }

  } else if (result === "lose") {
    handlePetsAfterBattle(b.units, []);
    if (S.flags && S.flags.adventureCombat) {
      S.flags.adventureCombat.result = "lose";
    }

    /* ★ 榜单战斗失败 */
    if (S.flags.rankBattle && typeof handleRankBattleLose === "function") {
      handleRankBattleLose();
    }

    /* ★ 小比战斗失败 */
    if (S.flags.competitionBattle && typeof handleCompetitionLose === "function") {
      handleCompetitionLose();
    }

    clearBattleStatuses();

    battle = null;
    save();
    render();
    showBattleResult("lose");

    /*
       ★ 修复（P0-3）：
       原代码战败只显示「战死」画面，不真正触发死亡，
       玩家点「重开」只关掉界面，角色还活着。
       改为：0.8 秒后调用 die()，由 die() 走真正的死亡流程
       （内部会先 checkRevive()，有逆天宝物则免死）。
    */
    setTimeout(() => {
      if (typeof die === "function") {
        die("战斗失利，身死道消。");
      }
    }, 800);

  } else if (result === "flee") {
    handlePetsAfterBattle(b.units, []);
    if (S.flags && S.flags.adventureCombat) {
      S.flags.adventureCombat.result = "flee";
    }

    /*
       ★ 修复（P1-4）：
       小比中玩家逃跑时，原代码不调 handleCompetitionLose()，
       导致 S.flags.competitionBattle 永远为 true，下次小比冲突。
       这里补上：逃跑 = 放弃小比，按失败处理（结束本次小比）。
    */
    if (S.flags.rankBattle && typeof handleRankBattleLose === "function") {
      handleRankBattleLose();
    }
    if (S.flags.competitionBattle && typeof handleCompetitionLose === "function") {
      handleCompetitionLose();
    }

    clearBattleStatuses();
    battle = null;
    save();
    render();
    showBattleResult("flee");
  }
}

/* 敌人道具：把模板 id 转成实际物品 id */
function buildEnemyItems(templateItems) {
  const result = {};
  for (const key in templateItems) {
    const val = templateItems[key];
    /* 如果 key 已经是实际物品（含 "_1品" 等后缀），直接用 */
    if (ITEMS[key]) {
      result[key] = val;
      continue;
    }
    /* 如果是模板 id（如 "回春丹_1阶"），按 1 品生成 */
    const item = getOrCreatePillItem(key, 1);
    if (item) result[item.id] = val;
  }
  return result;
}