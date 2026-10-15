/* ============================================================
   systems/heaven-defying.js - 逆天宝物系统
   ============================================================ */

/* 当前装的逆天宝物 id */
function getCurrentHeavenDefyingId() {
  return S.equipped.heavenDefying;
}

/* 当前效果（按阶段） */
function getCurrentHeavenDefyingEffect() {
  const id = getCurrentHeavenDefyingId();
  if (!id) return {};
  return getHeavenDefyingEffect(id);
}

/* 装备 */
function equipHeavenDefying(id) {
  if (!S.heavenDefying.owned[id]) {
    log("未拥有该宝物。", "c-bad");
    return;
  }
  S.equipped.heavenDefying = id;
  const disp = getHeavenDefyingDisplay(id);
  log(`【逆天宝物】装备 ${disp.name}。`, "c-gold");
  save(); renderProfile(); render();
}

/* 卸下 */
function unequipHeavenDefying() {
  S.equipped.heavenDefying = null;
  log("卸下逆天宝物。", "c-normal");
  save(); renderProfile(); render();
}

/* 获得 */
function addHeavenDefying(id) {
  if (!getHeavenDefying(id)) return;
  if (S.heavenDefying.owned[id]) return;

  S.heavenDefying.owned[id] = true;
  S.heavenDefying.stages[id] = 0;   /* 初始阶段 0（未知） */

  const disp = getHeavenDefyingDisplay(id);
  log(`【逆天宝物】获得 ${disp.name}（${disp.desc}）。`, "c-gold");
  save();
}

/* 揭示阶段 */
function revealHeavenDefyingStage(id, stage) {
  const cur = getHeavenDefyingStage(id);
  if (stage <= cur) return false;

  const hd = getHeavenDefying(id);
  if (!hd) return false;
  const stageData = hd.stages.find(s => s.stage === stage);
  if (!stageData) return false;

  S.heavenDefying.stages[id] = stage;

  log(`【逆天宝物觉醒】${stageData.name}：${stageData.desc}`, "c-gold");
  showModal("宝物觉醒", `
    <p>你忽然感觉手中的【${hd.name}】微微发烫。</p>
    <p>光芒散去，它的真容显露：</p>
    <div class="card">
      <b>${stageData.name}</b>
      <div class="small">${stageData.desc}</div>
    </div>
  `, [{ label: "继续", fn: closeModal }]);

  save();
  return true;
}

/* 检查揭示条件 */
function checkHeavenDefyingReveal(triggerType) {
  const id = getCurrentHeavenDefyingId();
  if (!id) return;

  const hd = getHeavenDefying(id);
  if (!hd || !hd.revealConditions) return;

  const cur = getHeavenDefyingStage(id);

  hd.revealConditions.forEach(cond => {
    if (cond.stage <= cur) return;
    if (cond.type !== triggerType) return;

    /* 计数 */
    if (!S.flags) S.flags = {};
    const key = `hd_${id}_${cond.stage}_count`;
    S.flags[key] = (S.flags[key] || 0) + 1;

    if (cond.count && S.flags[key] < cond.count) return;

    revealHeavenDefyingStage(id, cond.stage);
  });
}

/* 杀敌叠层（九转戮神剑） */
function addKillStack() {
  const eff = getCurrentHeavenDefyingEffect();
  if (eff && eff.special === "killStack") {
    S.heavenDefying.killStacks = Math.min(99, S.heavenDefying.killStacks + 1);
  }
}

/* 免死检查 */
function checkRevive() {
  const eff = getCurrentHeavenDefyingEffect();
  if (!eff || eff.special !== "revive") return false;
  if (S.heavenDefying.reviveCooldown > 0) return false;

  S.heavenDefying.reviveCooldown = 12;
  S.hp = totalMaxHp();
  S.mp = totalMaxMp();
  const id = getCurrentHeavenDefyingId();
  const disp = getHeavenDefyingDisplay(id);
  log(`【${disp.name}】碎裂，你原地复活！`, "c-gold");
  return true;
}

/* 每日处理 */
function processDailyHeavenDefying() {
  if (S.heavenDefying.reviveCooldown > 0) {
    S.heavenDefying.reviveCooldown--;
  }
  /* 掌天瓶绿液（未开放） */
}