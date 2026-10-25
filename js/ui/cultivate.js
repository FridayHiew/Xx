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
    const isBP = isBreakPoint(prog.lvl);
    const curLevelData = art.levels.find(l => l.lvl === prog.lvl);

    /* ★ 新增：判断是否已达残卷上限 */
    const isMaxed = prog.lvl >= prog.maxLearn;

    if (isMaxed) {
      /* 已满级：不显示突破按钮，显示提示 */
      primaryBtn += `<p class="small" style="color:#d05a4a; text-align:center; margin-top:10px;">
        ⚠ 【${art.name}】已达当前残卷上限 Lv.${prog.maxLearn}。<br>
        需在背包中使用中卷/下卷残卷解锁更高等级。
      </p>`;
    } else if (isBP) {
      /* 突破点：显示突破按钮 */
      let ready = false;
      if (prog.lvl === 0) ready = prog.proficiency >= 100;
      else ready = curLevelData && prog.exp >= curLevelData.expNeed;

      if (ready && !S.flags.breakAttemptedToday && check.ok) {
        const rate = calcBreakRate();
        const label = prog.lvl === 0 ? "尝试突破" : `突破到 Lv.${prog.lvl + 1}`;
        primaryBtn += `<button class="primary block" onclick="tryBreak()">${label}（成功率 ${(rate * 100).toFixed(1)}%）</button>`;
      }
    } else {
      /* 非突破点：修为满直接升 */
      if (prog.lvl < art.maxLvl && curLevelData && prog.exp >= curLevelData.expNeed) {
        primaryBtn += `<button class="primary block" onclick="tryBreak()">提升到 Lv.${prog.lvl + 1}</button>`;
      }
    }
  }


  /*
     ★ 修复（P2-2）：
     原代码 `S.inventory["灵石"]` 已不存在（main.js 迁移时合并到 S.stone 并删除），
     导致 stoneCount 永远是 0，按钮永远 disabled。
     改用 S.stone。
  */
  const stoneCount = S.stone || 0;
  return `
    <h3>打坐修炼</h3>
    ${header}
    ${primaryBtn}
    <button class="block" onclick="switchTab('day')">返回日常</button>
    <h4>使用灵石辅助修炼</h4>
    <p class="small">需熟练度满 100，每次消耗 1 块灵石。</p>
    <p class="small">当前灵石：${stoneCount} 块</p>
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