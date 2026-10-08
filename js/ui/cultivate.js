/* ============================================================
   ui/cultivate.js - 修炼面板
   ============================================================ */

function renderCultivatePage() {
  const art = getCurrentArt();
  const prog = art ? getArtProgress(art.id) : { lvl: 0, exp: 0, proficiency: 0, maxLearn: 3 };
  const playerInfo = getPlayerRealmInfo();
  const isFan = playerInfo.realm === 0;
  const remain = ACTIONS_PER_SLOT - S.actionsUsed;

  const realmText = isFan ? "凡人" :
    `${REALMS[playerInfo.realm].name}·${subName(playerInfo.lvl)}${playerInfo.lvl}重`;

  let header = `<p>境界：<b>${realmText}</b></p>`;

  if (art) {
    header += `<p>当前心法：<b>${art.name}</b>（${art.type}`;
    if (!isFan) header += `·Lv.${prog.lvl}/${art.maxLvl}`;
    header += `）</p>`;

    /* 残卷上限提示 */
    if (!isFan && prog.maxLearn < art.maxLvl) {
      header += `<p class="small" style="color:#e8c87a;">残卷上限：Lv.${prog.maxLearn}（可练至 Lv.${art.maxLvl}，需寻后续残卷）</p>`;
    }

    header += `<div class="skill-bar">
      <span>熟练度</span>
      <div class="skill-mini"><div style="width:${prog.proficiency}%"></div></div>
      <span class="small">${prog.proficiency.toFixed(2)}/100${prog.proficiency >= 100 ? " ✓" : ""}</span>
    </div>`;

    if (!isFan && prog.lvl > 0) {
      const curLevelData = art.levels.find(l => l.lvl === prog.lvl);
      const need = curLevelData ? curLevelData.expNeed : 0;
      const pct = need > 0 ? Math.min(100, prog.exp / need * 100) : 0;
      header += `<div class="skill-bar">
        <span>修为</span>
        <div class="skill-mini"><div style="width:${pct}%"></div></div>
        <span class="small">${fmt(prog.exp)}/${fmt(need)}</span>
      </div>`;
    }
  } else {
    header += `<p class="small" style="color:#d05a4a;">⚠ 没有心法</p>`;
  }

  const check = canCultivateHeart();
  if (!check.ok) {
    header += `<p class="small" style="color:#d05a4a;">⚠ ${check.reason}</p>`;
  }

  let sliderHTML = '';
  if (!check.ok) {
    sliderHTML = `<p class="small" style="color:#d05a4a;">无法修炼</p>`;
  } else if (remain > 0) {
    const maxCount = remain;
    if (S.meditateCount > maxCount) S.meditateCount = maxCount;
    if (S.meditateCount < 1) S.meditateCount = 1;
    sliderHTML = `
      <div class="slider-row">
        <button onclick="changeMeditate(-1)">−</button>
        <span class="slider-value">${S.meditateCount}</span>
        <button onclick="changeMeditate(1)">+</button>
        <span class="small">/ ${maxCount}</span>
        <button onclick="setMeditate(${maxCount})">最大</button>
      </div>
      <button class="primary block" onclick="doCultivate(${S.meditateCount})">打坐 ${S.meditateCount} 次</button>
    `;
  } else {
    sliderHTML = `<p class="small">本时段行动已用完。</p>`;
  }

  let primaryBtn = sliderHTML;

  if (art) {
    if (prog.lvl === 0 && prog.proficiency >= 100 && !S.flags.breakAttemptedToday && check.ok) {
      const rate = calcFanBreakRate();
      primaryBtn += `<button class="primary block" onclick="tryBreak()">尝试突破（成功率 ${(rate * 100).toFixed(1)}%）</button>`;
    } else if (prog.lvl > 0 && prog.lvl < art.maxLvl && prog.lvl < prog.maxLearn) {
      const curLevelData = art.levels.find(l => l.lvl === prog.lvl);
      if (curLevelData && prog.exp >= curLevelData.expNeed && prog.exp > 0) {
        primaryBtn += `<button class="primary block" onclick="tryBreak()">突破到 Lv.${prog.lvl + 1}</button>`;
      }
    }
  }

  const stoneCount = S.items["灵石"] || 0;

  return `
    <h3>打坐修炼</h3>
    ${header}
    ${primaryBtn}
    <button class="block" onclick="switchTab('day')">返回日常</button>
    <h4>使用灵石辅助修炼</h4>
    <p class="small">需熟练度满 100，每次消耗 1 灵石。</p>
    <p class="small">当前灵石：${stoneCount} 个</p>
    <button class="block" onclick="cultivateWithStoneItem()" ${(isFan || stoneCount < 1) ? "disabled" : ""}>
      ${isFan ? "凡人阶段无法使用" : stoneCount < 1 ? "灵石不足" : "使用 1 灵石修炼"}
    </button>
  `;
}


function changeMeditate(delta) {
  const remain = ACTIONS_PER_SLOT - S.actionsUsed;
  S.meditateCount = Math.max(1, Math.min(remain, S.meditateCount + delta));
  render();
}
function setMeditate(n) {
  const remain = ACTIONS_PER_SLOT - S.actionsUsed;
  S.meditateCount = Math.max(1, Math.min(remain, n));
  render();
}