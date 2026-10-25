/* ============================================================
   ui/status.js - 状态栏 / Tab 栏 (仙道神阁 UI)
   ============================================================ */

function updateProfileIcon() {
  if (!S) return;
  const el = document.getElementById("profileIcon");
  if (el) el.textContent = S.name ? S.name.slice(0, 1) : "道";
}

function renderStatus() {
  const playerInfo = getPlayerRealmInfo();
  let realmText;
  if (playerInfo.realm === 0) {
    realmText = "凡胎肉体";
  } else {
    realmText = `${REALMS[playerInfo.realm].name} · ${subName(playerInfo.lvl)}${playerInfo.lvl}重`;
  }

  const sectName = S.sect ? SECTS.find(s => s.id === S.sect).name : "暂无宗门";
  const rank = S.flags.rank || "杂务弟子";
  const mx = S.roots ? maxRoot(S.roots) : { val: 0, key: "jin" };
  const rootType = ROOT_TYPES.find(x => x.id === mx.key);
  const rootStr = debugShowRoot
    ? (mx.val > 0 ? `${rootType.name}${mx.val}` : "无")
    : "暗藏玄机";

  const art = getCurrentArt();
  const artName = art ? art.name : "未修心法";
  const moodEmoji = MOOD_EMOJI[S.mood + 2];
  const moodDesc = MOOD_NAMES[S.mood + 2];
  const currencyLbl = currencyName();
  const currencyVal = isStoneTier() ? S.stone : S.money;
  const di = getDateInfo();
  const fest = getFestival();

  const maxHp = totalMaxHp();
  const maxMp = totalMaxMp() || 1;
  const hpPct = Math.max(0, Math.min(100, (S.hp / maxHp) * 100));
  const mpPct = Math.max(0, Math.min(100, (S.mp / maxMp) * 100));

  const genderText = S.gender === "男" ? "乾道" : (S.gender === "女" ? "坤道" : "修真");

  const el = document.getElementById("statusBar");
  if (!el) return;

  el.innerHTML = `
    <div class="status-hero-row">
      <div class="status-avatar-block">
        <div class="status-avatar-circle" onclick="openProfile()" title="查看道体信息">
          <img src="./src/assets/images/cultivator_avatar_1792114545622.jpg" alt="${S.name}" referrerPolicy="no-referrer">
        </div>
        <div class="status-name-meta">
          <div class="status-name-line">
            <span class="player-name">${S.name}</span>
            <span class="status-realm-badge">${realmText}</span>
          </div>
          <div class="status-sub-meta">
            <span>${sectName}</span>
            <span>·</span>
            <span>${rank}</span>
            <span>·</span>
            <span>${genderText}</span>
          </div>
        </div>
      </div>
      <div>
        <span class="tag gold" style="cursor:pointer;" onclick="openProfile()" title="查看人物面板">
          📜 道体
        </span>
      </div>
    </div>

    <div class="gauge-cluster">
      <div class="bar-row">
        <span class="label">气血</span>
        <div class="bar-wrap">
          <div class="bar-fill bar-hp" style="width:${hpPct}%"></div>
          <div class="bar-text">${Math.floor(S.hp)} / ${maxHp}</div>
        </div>
      </div>
      <div class="bar-row">
        <span class="label">灵力</span>
        <div class="bar-wrap">
          <div class="bar-fill bar-mp" style="width:${mpPct}%"></div>
          <div class="bar-text">${Math.floor(S.mp)} / ${maxMp}</div>
        </div>
      </div>
    </div>

    <div class="status-grid">
      <div class="status-grid-item" title="当前所修本命心法">
        <span class="k">主修心法</span>
        <span class="v">${artName}</span>
      </div>
      <div class="status-grid-item" title="修仙资财">
        <span class="k">${currencyLbl}</span>
        <span class="v">${currencyVal}</span>
      </div>
      <div class="status-grid-item" title="宗门积累贡献">
        <span class="k">宗门贡献</span>
        <span class="v">${S.contrib}</span>
      </div>
      <div class="status-grid-item" title="当前道心心境">
        <span class="k">道心心境</span>
        <span class="v">${moodEmoji} ${moodDesc}</span>
      </div>
      <div class="status-grid-item" style="grid-column: 1 / 3;" title="逍遥纪元天地历">
        <span class="k">纪元天地历</span>
        <span class="v">逍遥${di.year}年 · ${di.monthName}${di.day}日 周${WEEKDAYS[S.weekday]}</span>
      </div>
      <div class="status-grid-item" style="grid-column: 3 / 5;" title="宿命灵根">
        <span class="k">宿命灵根</span>
        <span class="v">${rootStr}</span>
      </div>
      ${fest ? `
        <div class="festival-banner">
          <span class="tag festival-tag">${fest.name}</span>
          <span style="color:#ffe699;">今日吉相：${fest.bonus}</span>
        </div>
      ` : ''}
    </div>
  `;
}

function renderTabs() {
  const rank = S.flags.rank || "杂务";
  const canCave = RANKS.indexOf(rank) >= 2;
  const tabMeta = {
    day:    { icon: "📜", label: "日常修行" },
    sect:   { icon: "🏯", label: "宗门道统" },
    social: { icon: "🍵", label: "红尘道友" },
    cave:   { icon: "🌌", label: "洞天福地" },
  };

  const tabsEl = document.getElementById("tabs");
  if (!tabsEl) return;

  tabsEl.innerHTML = TABS.map(t => {
    const meta = tabMeta[t.id] || { icon: "✨", label: t.name };
    if (t.id === "cave" && !canCave) {
      return `<div class="tab locked" title="晋升门内弟子后方可开辟洞府">${meta.icon} ${meta.label} 🔒</div>`;
    }
    const isActive = currentTab === t.id;
    return `
      <div class="tab ${isActive ? 'active' : ''}" onclick="switchTab('${t.id}')">
        <span>${meta.icon}</span>
        <span>${meta.label}</span>
      </div>
    `;
  }).join("");
}

function switchTab(id) {
  if (id === "cave") {
    const rank = S.flags.rank || "杂务";
    if (RANKS.indexOf(rank) < 2) {
      log("门内弟子才有资格开辟洞府。", "c-bad");
      return;
    }
  }
  currentTab = id;
  render();
}