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
    <div class="battle-arena-banner">
      <div class="battle-header">
        <span>⚔️ 仙魔对决 · 第 <b style="color:var(--text-bright);">${battle.round}</b> 回合</span>
      </div>
      <div style="font-family:var(--font-serif); font-size:12px; color:${isPlayerTurn ? '#5fb865' : '#dfba6c'};">
        ${isPlayerTurn ? "✨ 轮到你出手决断" : "⚡ 敌方蓄势施法中…"}
      </div>
    </div>
  `;

  html += `<div class="battle-side">
    <h4>👹 敌方阵营</h4>`;
  battle.units.filter(u => u.side === "enemy").forEach(u => {
    html += renderBattleUnit(u);
  });
  html += `</div>`;

  html += `<div class="battle-side">
    <h4>🛡️ 我方阵营</h4>`;
  battle.units.filter(u => u.side === "player").forEach(u => {
    html += renderBattleUnit(u);
  });
  html += `</div>`;

  html += `<div class="battle-log">`;
  battle.log.slice(-10).forEach(line => {
    const isCrit = line.includes("暴击") || line.includes("致命") || line.includes("重创");
    const isHeal = line.includes("恢复") || line.includes("气血");
    const color = isCrit ? "#ff6b6b" : isHeal ? "#5fb865" : "#dfd2b5";
    html += `<div style="color:${color}; margin-bottom:2px;">${line}</div>`;
  });
  html += `</div>`;

  if (isPlayerTurn) {
    html += renderBattleActions(current);
  } else {
    html += `<div class="battle-actions"><p class="small" style="text-align:center; color:var(--text-dim); width:100%;">敌方正在运转功法行动中，请静候……</p></div>`;
  }

  container.innerHTML = html;
  container.style.display = "flex";
  container.classList.add("show");
}

function renderBattleUnit(u) {
  const hpPct = Math.max(0, u.hp / u.hpMax * 100);
  const mpPct = u.mpMax > 0 ? Math.max(0, u.mp / u.mpMax * 100) : 0;
  const realmText = u.realm === 0 ? "凡人" : `${REALMS[u.realm]?.name || '修者'}·${u.sub}重`;
  const dead = !u.alive || u.escaped || u.tamed;
  const status = u.escaped ? "（已遁逃）" : u.tamed ? "（已收服）" : !u.alive ? "（道消身死）" : "";

  let statusHtml = "";
  if (u.statuses && u.statuses.length > 0) {
    statusHtml = `<span class="statuses">` + u.statuses.map(s => {
      const def = getStatusDef(s.id);
      if (!def) return "";
      const stack = s.stacks > 1 ? `×${s.stacks}` : "";
      return `<span class="status-icon" title="${def.name}（${s.turns}回合）" style="background:#261b0f; border:1px solid var(--border-gold); padding:1px 4px; border-radius:4px; font-size:10px; margin-left:3px;">${def.icon}${stack}</span>`;
    }).join("") + `</span>`;
  }

  const icon = u.isPlayer ? "🗡️" : (u.isBeast ? "🐾" : "👹");

  return `<div class="battle-unit ${dead ? "dead" : ""} ${u.isPlayer ? "player" : ""}">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:16px;">${icon}</span>
        <b style="color:${u.isPlayer ? '#7ae380' : '#f0d080'}; font-family:var(--font-serif);">${u.name}</b>
        ${statusHtml}
      </div>
      <span class="small" style="color:var(--text-dim);">${realmText} ${status}</span>
    </div>
    <div class="bar-row" style="margin-bottom:3px;">
      <span class="label" style="font-size:11px; color:#ff8b8b;">气血</span>
      <div class="bar-wrap" style="height:10px;"><div class="bar-fill bar-hp" style="width:${hpPct}%; background:linear-gradient(90deg, #c0392b, #e74c3c);"></div>
        <div class="bar-text" style="font-size:9px;">${Math.floor(u.hp)}/${u.hpMax}</div></div>
    </div>
    ${u.mpMax > 0 ? `<div class="bar-row">
      <span class="label" style="font-size:11px; color:#3498db;">灵力</span>
      <div class="bar-wrap" style="height:10px;"><div class="bar-fill bar-mp" style="width:${mpPct}%; background:linear-gradient(90deg, #2980b9, #3498db);"></div>
        <div class="bar-text" style="font-size:9px;">${Math.floor(u.mp)}/${u.mpMax}</div></div>
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
    /*
       ★ 修复（C6）：
       原代码按钮调 closeBattleScreen()，与后续 0.8 秒后自动触发的
       die() 弹窗叠加冲突。
       改为：只显示"战死"画面，不提供按钮，等 die() 自动接管。
    */
    html = `
      <div class="battle-result">
        <h2>战死</h2>
        <p style="color:var(--text-dim);">眼前一黑，天地俱寂……</p>
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

  /* 如果是从冒险地进入的战斗，返回冒险界面 */
  if (S.flags && S.flags.adventureCombat) {
    const info = S.flags.adventureCombat;
    S.flags.adventureCombat = null;

    if (info.result === "win") {
      if (typeof adventureLog === "function") {
        adventureLog(`你击败了妖兽，继续前行。`, "good");
      }
    } else if (info.result === "lose") {
      if (typeof adventureLog === "function") {
        adventureLog(`你被击败，被迫退出冒险地。`, "bad");
      }
      S.flags.adventure = null;
      S.flags.adventureLog = null;
      save();
      render();
      return;
    } else if (info.result === "flee") {
      if (typeof adventureLog === "function") {
        adventureLog(`你逃出了战斗，回到原点。`, "dim");
      }
    }

    if (typeof renderAdventureScreen === "function") {
      renderAdventureScreen();
      const el = document.getElementById("adventureScreen");
      if (el) el.style.display = "flex";
    }
    return;
  }

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