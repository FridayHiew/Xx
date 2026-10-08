/* ============================================================
   systems/fight.js - 战斗 / 探索
   ============================================================ */

/* 攻击 / 防御总合 */
function totalAtk() {
  let a = S.atk;
  for (const slot in S.equipped) {
    const id = S.equipped[slot];
    if (id) {
      const eq = EQUIPS.find(x => x.id === id);
      if (eq) a += eq.atk || 0;
    }
  }
  return a;
}

function totalDef() {
  let d = S.def;
  for (const slot in S.equipped) {
    const id = S.equipped[slot];
    if (id) {
      const eq = EQUIPS.find(x => x.id === id);
      if (eq) d += eq.def || 0;
    }
  }
  return d;
}

/* 探索 */

function doExplore() {
  if (chance(0.35)) {
    startFight(FIGHT_ENEMIES.normal[0]);
    return;
  }

  const events = [
    { t: "你在林间发现一株灵草。", gain: { mat: { 灵草: 1 } } },
    { t: "你在溪边捧起一泓清泉。", gain: { mat: { 泉水: 1 } } },
    { t: "你击杀了一只妖兔，取其内丹。", gain: { mat: { 妖丹: 1 }, exp: 20 } },
    { t: "你发现一处废弃洞府。", gain: { item: { 灵石: 3 } } },
    { t: "你在古树下打坐，忽有所悟。", gain: { exp: 50 } },
  ];
  const ev = pick(events);
  log("· " + ev.t, "c-blue");
  const detail = [ev.t];
  applyGain(ev.gain, detail);

  /* 5% 概率掉落残卷 */
  if (chance(0.05)) {
    const frag = getRandomFragment();
    if (frag) {
      addFragment(frag.fragment.id, 1);
      detail.push(`获得残卷：${frag.fragment.name}`);
    }
  }

  consumeAction(() => showActionModal("探索", detail));
}


function applyGain(g, detail) {
  if (!g) return;
  if (g.exp) { S.exp += g.exp; log(`  修为 +${fmt(g.exp)}`, "c-good"); if (detail) detail.push(`修为 +${fmt(g.exp)}`); }
  if (g.stone) { S.stone += g.stone; log(`  灵石 +${g.stone}`, "c-good"); if (detail) detail.push(`灵石 +${g.stone}`); }
  if (g.item) {
    for (const k in g.item) {
      S.items[k] = (S.items[k] || 0) + g.item[k];
      log(`  物品：${k} ×${g.item[k]}`, "c-good");
      if (detail) detail.push(`${k} +${g.item[k]}`);
    }
  }
  if (g.mat) {
    for (const k in g.mat) {
      S.mat[k] = (S.mat[k] || 0) + g.mat[k];
      log(`  材料：${k} ×${g.mat[k]}`, "c-good");
      if (detail) detail.push(`${k} +${g.mat[k]}`);
    }
  }
  checkSubAdvance();
}

/* 战斗 */
function startFight(enemy) {
  const scale = Math.pow(1.6, Math.max(0, S.realm - 1));
  pendingFight = {
    enemy: {
      name: enemy.name,
      hp: Math.floor(enemy.hp * scale),
      hpMax: Math.floor(enemy.hp * scale),
      atk: Math.floor(enemy.atk * scale),
      def: Math.floor(enemy.def * scale),
      exp: Math.floor(enemy.exp * scale),
      stone: Math.floor(enemy.stone * scale),
    },
    status: {
      stun: 0,
      shield: 0,
      buff: 0,
    },
  };
  showFightModal();
}

function showFightModal() {
  const e = pendingFight.enemy;
  showModal(`遭遇：${e.name}`, `
    <p>敌方：气血 ${Math.max(0, e.hp)}/${e.hpMax}　攻 ${e.atk}　防 ${e.def}</p>
    <p>我方：气血 ${Math.floor(S.hp)}/${S.hpMax}　灵力 ${Math.floor(S.mp)}/${S.mpMax}</p>
  `, [
    { label: "攻击", fn: () => fightAction("attack") },
    { label: "技能", fn: () => fightAction("skill") },
    { label: "逃跑", fn: () => fightAction("flee") },
  ]);
}

function fightAction(action) {
  if (!pendingFight) return;
  const e = pendingFight.enemy;

  if (action === "flee") {
    if (chance(0.5)) {
      log("逃脱成功。", "c-normal");
      pendingFight = null; closeModal(); save(); render();
      return;
    }
  } else if (action === "attack") {
    const crit = chance(CRIT_RATE);
    let dmg = Math.max(1, Math.floor(totalAtk() * rnd(0.9, 1.2) - e.def * 0.5));
    if (crit) dmg = Math.floor(dmg * CRIT_MULT);
    e.hp -= dmg;
    log(`你攻击 ${e.name}，造成 ${dmg} 伤害${crit ? "（暴击！）" : ""}。`, crit ? "c-gold" : "c-normal");
  } else if (action === "skill") {
    /* 简化：用剑技能 */
    if (S.mp < 15) { log("灵力不足！", "c-bad"); }
    else {
      S.mp -= 15;
      const crit = chance(CRIT_RATE);
      let dmg = Math.max(1, Math.floor(totalAtk() * 2.0 * rnd(0.9, 1.2) - e.def * 0.3));
      if (crit) dmg = Math.floor(dmg * CRIT_MULT);
      e.hp -= dmg;
      log(`你使用【剑气斩】，造成 ${dmg} 伤害${crit ? "（暴击！）" : ""}。`, crit ? "c-gold" : "c-normal");
    }
  }

  if (e.hp <= 0) {
    log(`击败 ${e.name}！`, "c-gold");
    S.exp += e.exp;
    S.stone += e.stone;
    pendingFight = null; closeModal(); save(); render();
    showActionModal("战斗胜利", [`击败 ${e.name}`, `修为 +${fmt(e.exp)}`, `灵石 +${e.stone}`]);
    return;
  }

  /* 敌人反击 */
  const dmg = Math.max(1, Math.floor(e.atk * rnd(0.9, 1.2) - totalDef() * 0.5));
  S.hp -= dmg;
  log(`${e.name} 反击，你受到 ${dmg} 伤害。`, "c-bad");

  /* 灵力恢复 */
  S.mp = Math.min(S.mpMax, S.mp + 2);

  if (S.hp <= 0) { die("战死。"); return; }

  showFightModal();
  save(); renderStatus();
}