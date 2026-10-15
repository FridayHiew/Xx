/* ============================================================
   ui/battle.js - 全屏战斗界面
   ============================================================ */

let _pendingBattleAction = null;

const TARGET_LABEL = {
  enemySingle: "敌单",
  enemyAll: "敌全",
  allySingle: "我单",
  allyAll: "我全",
  all: "全体",
};


function renderBattle() {
  if (!battle) return;

  const container = document.getElementById("battleScreen");
  if (!container) return;

  const current = battle.order[battle.currentIdx];
  const isPlayerTurn = current && current.isPlayer;

  let html = `
    <div class="battle-header">
      <span>第 ${battle.round} 回合</span>
      <span class="small">${isPlayerTurn ? "轮到你行动" : "敌方行动中…"}</span>
    </div>
  `;

  html += `<div class="battle-side">
    <h4>敌方</h4>`;
  battle.units.filter(u => u.side === "enemy").forEach(u => {
    html += renderBattleUnit(u);
  });
  html += `</div>`;

  html += `<div class="battle-side">
    <h4>我方</h4>`;
  battle.units.filter(u => u.side === "player").forEach(u => {
    html += renderBattleUnit(u);
  });
  html += `</div>`;

  html += `<div class="battle-log">`;
  battle.log.slice(-8).forEach(line => {
    html += `<div>${line}</div>`;
  });
  html += `</div>`;

  if (isPlayerTurn) {
    html += renderBattleActions(current);
  } else {
    html += `<div class="battle-actions"><p class="small">敌方行动中…</p></div>`;
  }

  container.innerHTML = html;
  container.style.display = "flex";
}

function renderBattleUnit(u) {
  const hpPct = Math.max(0, u.hp / u.hpMax * 100);
  const mpPct = u.mpMax > 0 ? Math.max(0, u.mp / u.mpMax * 100) : 0;
  const realmText = u.realm === 0 ? "凡人" : `${REALMS[u.realm].name}·${u.sub}重`;
  const dead = !u.alive || u.escaped || u.tamed;
  const status = u.escaped ? "（已逃）" : u.tamed ? "（已收服）" : !u.alive ? "（已倒）" : "";

  let statusHtml = "";
  if (u.statuses && u.statuses.length > 0) {
    statusHtml = `<span class="statuses">` + u.statuses.map(s => {
      const def = getStatusDef(s.id);
      if (!def) return "";
      const stack = s.stacks > 1 ? `×${s.stacks}` : "";
      return `<span class="status-icon" title="${def.name}（${s.turns}回合）">${def.icon}${stack}</span>`;
    }).join("") + `</span>`;
  }

  return `<div class="battle-unit ${dead ? "dead" : ""} ${u.isPlayer ? "player" : ""}">
    <div class="row">
      <b>${u.name}</b>
      ${statusHtml}
      <span class="small">${realmText} ${status}</span>
    </div>
    <div class="bar-row">
      <span class="label">气血</span>
      <div class="bar-wrap"><div class="bar-fill bar-hp" style="width:${hpPct}%"></div>
        <div class="bar-text">${Math.floor(u.hp)}/${u.hpMax}</div></div>
    </div>
    ${u.mpMax > 0 ? `<div class="bar-row">
      <span class="label">灵力</span>
      <div class="bar-wrap"><div class="bar-fill bar-mp" style="width:${mpPct}%"></div>
        <div class="bar-text">${Math.floor(u.mp)}/${u.mpMax}</div></div>
    </div>` : ""}
  </div>`;
}

function renderBattleActions(u) {
  const canTame = S.sect === "wanshou";
  const hasBeast = canTame && battle.units.some(x =>
    x.side === "enemy" && x.alive && x.isBeast && !x.tamed
  );

  const summonSkills = (S.combatSkills && S.combatSkills.learned || [])
    .filter(id => getSummonSkill(id));
  const hasSummon = summonSkills.length > 0
    && !battle.units.some(x => x.isPet && x.alive);

  return `<div class="battle-actions">
    <button onclick="battleAction('attack')">攻击</button>
    <button onclick="battleAction('spell')">法术</button>
    <button onclick="battleAction('item')">道具</button>
    <button onclick="battleAction('defend')">防御</button>
    <button onclick="battleAction('flee')">逃跑</button>
    ${hasBeast ? `<button onclick="battleAction('tame')">收服</button>` : ""}
    ${hasSummon ? `<button onclick="battleAction('summon')">召唤</button>` : ""}
  </div>`;
}

function battleAction(type) {
  if (!battle) return;
  const player = battle.order[battle.currentIdx];
  if (!player || !player.isPlayer) return;

  if (type === "attack") {
    showBattleTargetSelect("attack");
    return;
  }
  if (type === "defend" || type === "flee") {
    playerAction(type);
    return;
  }
  if (type === "tame") {
    showBattleTameSelect();
    return;
  }
  if (type === "summon") {
    showBattleSummonSelect();
    return;
  }
  if (type === "spell") {
    showBattleSpellSelect();
    return;
  }
  if (type === "item") {
    showBattleItemSelect();
    return;
  }
}

/* ============================================================
   选目标
   ============================================================ */

function showBattleTargetSelect(actionType, extra) {
  const player = battle.order[battle.currentIdx];

  let targetType = "enemySingle";
  if (actionType === "spell") {
    const sp = getSpell(extra.spellId);
    targetType = sp ? (sp.target || "enemySingle") : "enemySingle";
  } else if (actionType === "skill") {
    const sk = getCombatSkill(extra.skillId);
    targetType = sk ? (sk.target || "enemySingle") : "enemySingle";
  }

  if (!targetNeedsPick(targetType)) {
    if (actionType === "attack") playerAction("attack");
    else if (actionType === "spell") playerAction("spell", { spellId: extra.spellId });
    else if (actionType === "skill") playerAction("skill", { skillId: extra.skillId });
    return;
  }

  const side = targetType === "allySingle" ? player.side :
               (player.side === "player" ? "enemy" : "player");
  const candidates = battle.units.filter(u =>
    u.side === side && u.alive && !u.escaped && !u.tamed
  );

  if (candidates.length === 0) {
    logBattle("没有可选目标");
    renderBattle();
    return;
  }

  if (candidates.length === 1) {
    const targetId = candidates[0].id;
    if (actionType === "attack") playerAction("attack", { targetId });
    else if (actionType === "spell") playerAction("spell", { spellId: extra.spellId, targetId });
    else if (actionType === "skill") playerAction("skill", { skillId: extra.skillId, targetId });
    return;
  }

  _pendingBattleAction = { actionType, extra };

  const html = candidates.map(e => {
    const hpPct = Math.max(0, e.hp / e.hpMax * 100);
    return `<button class="list-btn" onclick="pickBattleTarget('${e.id}')">
      ${e.name}（气血 ${Math.floor(hpPct)}%）
    </button>`;
  }).join("");

  showBattleSubmenu("选择目标", html);
}

function pickBattleTarget(targetId) {
  closeBattleSubmenu();
  const pending = _pendingBattleAction;
  _pendingBattleAction = null;
  if (!pending) return;

  const { actionType, extra } = pending;
  if (actionType === "attack") {
    playerAction("attack", { targetId });
  } else if (actionType === "spell") {
    playerAction("spell", { spellId: extra.spellId, targetId });
  } else if (actionType === "skill") {
    playerAction("skill", { skillId: extra.skillId, targetId });
  }
}

/* ============================================================
   法术选择
   ============================================================ */
function showBattleSpellSelect() {
  const player = battle.order[battle.currentIdx];

  if (isSilenced(player)) {
    logBattle("你被沉默，无法施法");
    renderBattle();
    return;
  }

  const usable = player.spells
    .map(id => getSpell(id))
    .filter(sp => sp && player.mp >= sp.cost.mp);

  if (usable.length === 0) {
    logBattle("没有可用的法术");
    renderBattle();
    return;
  }

  const html = usable.map(sp => {
    const tl = TARGET_LABEL[sp.target || "enemySingle"] || "敌单";
    return `<button class="list-btn" onclick="pickBattleSpell('${sp.id}')">
      ${sp.name}（${tl}，灵力 ${sp.cost.mp}，威力 ×${sp.power}）
    </button>`;
  }).join("");

  showBattleSubmenu("选择法术", html);
}

function pickBattleSpell(spellId) {
  closeBattleSubmenu();
  showBattleTargetSelect("spell", { spellId: spellId });
}


/* ============================================================
   道具选择
   ============================================================ */

function showBattleItemSelect() {
  const player = battle.order[battle.currentIdx];

  /* 只显示战斗中可用的丹药 */
  const usable = Object.keys(S.inventory).filter(k => {
    const item = ITEMS[k];
    if (!item || item.type !== "pill" || S.inventory[k] <= 0) return false;
    return item.usableIn === "battle" || item.usableIn === "both";
  });

  if (usable.length === 0) {
    logBattle("没有可用道具");
    renderBattle();
    return;
  }

  const html = usable.map(id => {
    const item = ITEMS[id];
    const gradeTag = item.grade ? ` <span class="tag gold">${item.grade}品</span>` : "";
    return `<button class="list-btn" onclick="pickBattleItem('${id}')">
      ${item.name}${gradeTag} ×${S.inventory[id]}
    </button>`;
  }).join("");

  showBattleSubmenu("选择道具", html);
}

function pickBattleItem(itemId) {
  const item = ITEMS[itemId];
  if (!item || !item.effect) return;

  /* 需要选敌人的丹药 */
  if (item.effect.type === "inflict") {
    closeBattleSubmenu();
    showBattleItemTargetSelect(itemId);
    return;
  }

  closeBattleSubmenu();
  playerAction("item", { itemId: itemId });
}

/* 丹药选目标 */
function showBattleItemTargetSelect(itemId) {
  const player = battle.order[battle.currentIdx];
  const candidates = battle.units.filter(u =>
    u.side === "enemy" && u.alive && !u.escaped && !u.tamed
  );

  if (candidates.length === 0) {
    logBattle("没有可选目标");
    renderBattle();
    return;
  }
  if (candidates.length === 1) {
    playerAction("item", { itemId, targetId: candidates[0].id });
    return;
  }

  const html = candidates.map(e => {
    const hpPct = Math.max(0, e.hp / e.hpMax * 100);
    return `<button class="list-btn" onclick="pickBattleItemTarget('${itemId}', '${e.id}')">
      ${e.name}（气血 ${Math.floor(hpPct)}%）
    </button>`;
  }).join("");

  showBattleSubmenu("选择目标", html);
}

function pickBattleItemTarget(itemId, targetId) {
  closeBattleSubmenu();
  playerAction("item", { itemId, targetId });
}

/* ============================================================
   收服选择
   ============================================================ */

function showBattleTameSelect() {
  const beasts = battle.units.filter(u =>
    u.side === "enemy" && u.alive && u.isBeast && !u.tamed
  );

  if (beasts.length === 0) {
    logBattle("没有可收服的妖兽");
    renderBattle();
    return;
  }

  if (beasts.length === 1) {
    playerAction("tame", { targetId: beasts[0].id });
    return;
  }

  const html = beasts.map(b => `
    <button class="list-btn" onclick="pickBattleTame('${b.id}')">
      ${b.name}（收服率 ${(b.tameRate * 100).toFixed(0)}%）
    </button>
  `).join("");

  showBattleSubmenu("选择收服目标", html);
}

function pickBattleTame(targetId) {
  closeBattleSubmenu();
  playerAction("tame", { targetId: targetId });
}

/* ============================================================
   子菜单
   ============================================================ */

function showBattleSubmenu(title, html) {
  const container = document.getElementById("battleSubmenu");
  if (!container) return;
  container.innerHTML = `
    <div class="battle-submenu-box">
      <h3>${title}</h3>
      <div class="list">${html}</div>
      <button onclick="closeBattleSubmenu()">返回</button>
    </div>
  `;
  container.style.display = "flex";
}

function closeBattleSubmenu() {
  const container = document.getElementById("battleSubmenu");
  if (container) container.style.display = "none";
}

/* ============================================================
   结算
   ============================================================ */

function showBattleResult(result, exp, stone) {
  const container = document.getElementById("battleScreen");
  if (!container) return;

  let html = "";
  if (result === "win") {
    html = `
      <div class="battle-result">
        <h2>战斗胜利</h2>
        <p>获得修为：${exp}</p>
        <p>获得灵石：${stone}</p>
        <button onclick="closeBattleScreen()">继续</button>
      </div>
    `;
  } else if (result === "lose") {
    html = `
      <div class="battle-result">
        <h2>战死</h2>
        <button onclick="closeBattleScreen()">重开</button>
      </div>
    `;
  } else if (result === "tame") {
    html = `
      <div class="battle-result">
        <h2>收服成功</h2>
        <p>获得修为：${exp}</p>
        <p>获得灵石：${stone}</p>
        <button onclick="closeBattleScreen()">继续</button>
      </div>
    `;
  } else if (result === "flee") {
    html = `
      <div class="battle-result">
        <h2>逃跑成功</h2>
        <button onclick="closeBattleScreen()">继续</button>
      </div>
    `;
  }

  container.innerHTML = html;
  container.style.display = "flex";
}

function closeBattleScreen() {
  const container = document.getElementById("battleScreen");
  if (container) container.style.display = "none";
  closeBattleSubmenu();
  _pendingBattleAction = null;
  render();
}

/* ============================================================
   召唤选择
   ============================================================ */

function showBattleSummonSelect() {
  const skills = (S.combatSkills && S.combatSkills.learned || [])
    .map(id => getSummonSkill(id))
    .filter(Boolean);

  if (skills.length === 0) {
    logBattle("没有召唤技能");
    renderBattle();
    return;
  }

  const player = battle.order[battle.currentIdx];

  const html = skills.map(sk => {
    const canUse = player.mp >= sk.cost.mp;
    return `<button class="list-btn" onclick="pickBattleSummon('${sk.id}')" ${canUse ? "" : "disabled"}>
      ${sk.name}（灵力 ${sk.cost.mp}）
    </button>`;
  }).join("");

  showBattleSubmenu("选择召唤", html);
}

function pickBattleSummon(skillId) {
  closeBattleSubmenu();
  playerAction("summon", { skillId: skillId });
}