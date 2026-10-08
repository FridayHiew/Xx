/* ============================================================
   ui/status.js - 状态栏 / Tab 栏
   ============================================================ */

function updateProfileIcon() {
  if (!S) return;
  const el = document.getElementById("profileIcon");
  if (el) el.textContent = S.name.slice(0, 1);
}

function renderStatus() {
  const playerInfo = getPlayerRealmInfo();
  let realmText;
  if (playerInfo.realm === 0) {
    realmText = "凡人";
  } else {
    realmText = `${REALMS[playerInfo.realm].name}·${subName(playerInfo.lvl)}${playerInfo.lvl}重`;
  }

  const sectName = S.sect ? SECTS.find(s => s.id === S.sect).name : "未入宗门";
  const rank = S.flags.rank || "杂务";
  const mx = S.roots ? maxRoot(S.roots) : { val: 0, key: "jin" };
  const rootType = ROOT_TYPES.find(x => x.id === mx.key);
  const rootStr = debugShowRoot
    ? (mx.val > 0 ? `${rootType.name}${mx.val}` : "无")
    : "？？？";

  const art = getCurrentArt();
  const artName = art ? art.name : "无";
  const moodEmoji = MOOD_EMOJI[S.mood + 2];
  const currencyLbl = currencyName();
  const currencyVal = isStoneTier() ? S.stone : S.money;
  const di = getDateInfo();
  const fest = getFestival();

  document.getElementById("statusBar").innerHTML = `
    <span><span>道号</span><b>${S.name}</b></span>
    <span><span>境界</span><b>${realmText}</b></span>
    <span><span>宗门</span><b>${sectName}</b></span>
    <span><span>身份</span><b>${rank}</b></span>
    <span><span>灵根</span><b>${rootStr}</b></span>
    <span><span>心法</span><b>${artName}</b></span>
    <span><span>心情</span><b style="font-size:16px;">${moodEmoji}</b></span>
    <span><span>${currencyLbl}</span><b>${currencyVal}</b></span>
    <span><span>日期</span><b>逍遥${di.year}·${di.monthName}${di.day}日</b></span>
    <span><span>贡献</span><b>${S.contrib}</b></span>
    ${fest ? `<span style="grid-column:1/-1;"><span class="tag festival-tag">${fest.name}</span> <span class="small">今日${fest.bonus}！</span></span>` : ''}
    <div class="bar-row"><span class="label">气血</span>
      <div class="bar-wrap"><div class="bar-fill bar-hp" style="width:${S.hp / totalMaxHp() * 100}%"></div><div class="bar-text">${Math.floor(S.hp)}/${totalMaxHp()}</div></div></div>
    <div class="bar-row"><span class="label">灵力</span>
      <div class="bar-wrap"><div class="bar-fill bar-mp" style="width:${S.mp / (totalMaxMp() || 1) * 100}%"></div><div class="bar-text">${Math.floor(S.mp)}/${totalMaxMp()}</div></div></div>
  `;
}

function renderTabs() {
  const rank = S.flags.rank || "杂务";
  const canCave = RANKS.indexOf(rank) >= 2;
  document.getElementById("tabs").innerHTML = TABS.map(t => {
    if (t.id === "cave" && !canCave) {
      return `<div class="tab locked" title="门内解锁">${t.name}🔒</div>`;
    }
    return `<div class="tab ${currentTab === t.id ? 'active' : ''}" onclick="switchTab('${t.id}')">${t.name}</div>`;
  }).join("");
}

function switchTab(id) {
  if (id === "cave") {
    const rank = S.flags.rank || "杂务";
    if (RANKS.indexOf(rank) < 2) {
      log("门内弟子才有资格拥有洞府。", "c-bad");
      return;
    }
  }
  currentTab = id;
  render();
}