/* ============================================================
   ui/render.js - 主渲染入口
   ============================================================ */

function render() {
  if (!S) return;
  renderStatus();
  renderTabs();

  const box = document.getElementById("panelContent");
  if (currentTab === "day") box.innerHTML = renderDay();
  else if (currentTab === "sect") box.innerHTML = renderSect();
  else if (currentTab === "social") box.innerHTML = renderSocial();
  else if (currentTab === "cave") box.innerHTML = renderCave();
  else if (currentTab === "cultivatePage") box.innerHTML = renderCultivatePage();
}

/* ========== Debug ========== */
function debugComplete() {
  const art = getCurrentArt();
  if (!art) { log("没有心法。", "c-bad"); return; }
  const prog = getArtProgress(art.id);
  prog.proficiency = 100;
  /* 修为也填满 */
  if (prog.lvl === 0) {
    /* 凡人：直接可突破 */
  } else if (prog.lvl < art.maxLvl) {
    const curLevelData = art.levels.find(l => l.lvl === prog.lvl);
    if (curLevelData) prog.exp = curLevelData.expNeed;
  }
  log(`[DEBUG] ${art.name} 熟练度 100，修为满`, "c-gold");
  save(); render();
}




function debugAddMoney() {
  S.money += 1000;
  log("[DEBUG] 铜钱 +1000", "c-gold");
  save(); render();
}

function debugAddStone() {
  S.stone += 1000;
  log("[DEBUG] 灵石 +1000", "c-gold");
  save(); render();
}

function debugAddProficiency() {
  const art = getCurrentArt();
  if (!art) { log("[DEBUG] 没有心法", "c-bad"); return; }
  const prog = getArtProgress(art.id);
  prog.proficiency = 100;
  log(`[DEBUG] ${art.name} 熟练度设为 100`, "c-gold");
  save(); render();
}

function debugAddContrib() {
  S.contrib += 100;
  log("[DEBUG] 宗门贡献 +100", "c-gold");
  save(); render();
}

function toggleDebugRoot() {
  debugShowRoot = !debugShowRoot;
  log(`[DEBUG] 灵根显示：${debugShowRoot ? "开" : "关"}`, "c-gold");
  render();
}

/* ========== 结局 ========== */
function die(reason) {
  showModal("身死道消", `<p>${reason}</p><p>道号：${S.name}　享年：${Math.floor(S.life)}岁</p>`, [
    { label: "重开一生", fn: () => { closeModal(); resetGame(); } }
  ]);
  S.hp = 0;
  save();
}

function win() {
  showModal("飞升成仙", `<p>你渡过天劫，白日飞升！</p>`, [
    { label: "重开一生", fn: () => { closeModal(); resetGame(); } }
  ]);
}


function debugAddFragment() {
  const frag = getRandomFragment();
  if (!frag) { log("[DEBUG] 无残卷", "c-bad"); return; }
  addFragment(frag.fragment.id, 1);
  log(`[DEBUG] 获得 ${frag.fragment.name}`, "c-gold");
  save(); render();
}
