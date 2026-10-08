/* ============================================================
   ui/profile.js - 角色面板
   ============================================================ */

function initCreationPanel() {
  const m = document.getElementById("monthInput");
  m.innerHTML = "";
  for (let i = 1; i <= 12; i++) {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = LUNAR_MONTHS[i - 1];
    if (i === 6) o.selected = true;
    m.appendChild(o);
  }
  const d = document.getElementById("dayInput");
  d.innerHTML = "";
  for (let i = 1; i <= 30; i++) {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = i + "日";
    d.appendChild(o);
  }
}

function openProfile() {
  if (!S) return;
  renderProfile();
  document.getElementById("profileMask").classList.add("show");
}
function closeProfile() {
  document.getElementById("profileMask").classList.remove("show");
}
function switchProfileTab(t) {
  currentProfileTab = t;
  renderProfile();
}
function switchBagTab(t) {
  currentBagTab = t;
  renderProfile();
}


function renderProfile() {
  const r = REALMS[S.realm];
  const realmText = S.realm === 0 ? "凡人" : `${r.name}·${subName(S.sub)}${S.sub}重`;
  const apt = APTITUDES.find(a => a.id === S.aptitude);

  let html = `
    <div class="profile-header">
      <div class="profile-avatar">${S.name.slice(0, 1)}</div>
      <div class="profile-title">
        <h3>${S.name}</h3>
        <div class="small">${realmText}　${apt.name}　${S.gender}</div>
      </div>
      <button onclick="closeProfile()">关闭</button>
    </div>
    <div class="subtabs">
  `;
  PROFILE_TABS.forEach(t => {
    html += `<div class="subtab ${currentProfileTab === t ? 'active' : ''}" onclick="switchProfileTab('${t}')">${t}</div>`;
  });
  html += `</div>`;

  if (currentProfileTab === "角色信息") html += renderProfileInfo();
  else if (currentProfileTab === "背包") html += renderProfileBag();
  else if (currentProfileTab === "装配") html += renderProfileEquip();
  else if (currentProfileTab === "心法") html += renderProfileHeart();
  else if (currentProfileTab === "技能") html += renderProfileSkills();
  else if (currentProfileTab === "杂务") html += renderProfileChores();
  else if (currentProfileTab === "爱好") html += renderProfileHobbies();

  document.getElementById("profileBox").innerHTML = html;
}


function renderProfileInfo() {
  const sect = S.sect ? SECTS.find(x => x.id === S.sect) : null;
  const peak = S.peak ? PEAKS.find(p => p.id === S.peak) : null;
  const master = S.master ? S.npcMap[S.master] : null;
  const apt = APTITUDES.find(a => a.id === S.aptitude);
  const playerInfo = getPlayerRealmInfo();
  const realmText = playerInfo.realm === 0 ? "凡人" :
    `${REALMS[playerInfo.realm].name}·${subName(playerInfo.lvl)}${playerInfo.lvl}重`;
  const di = getDateInfo();

  const mx = maxRoot(S.roots);
  const rootDisplay = debugShowRoot
    ? ROOT_TYPES.map(x => {
        const v = S.roots[x.id];
        return `<div class="root-bar"><span class="name">${x.name}</span>
          <div class="mini"><div style="width:${v * 10}%"></div></div>
          <span class="val">${v}</span></div>`;
      }).join("")
    : `<p class="small">灵根：？？？（一级宗门无法测出详细）</p>`;

  return `
    <h4>基础信息</h4>
    <div class="card">
      <div class="row"><span>道号</span><b>${S.name}</b></div>
      <div class="row"><span>性别</span><b>${S.gender}</b></div>
      <div class="row"><span>生辰</span><b>${LUNAR_MONTHS[S.birthday.month - 1]}${S.birthday.day}日</b></div>
      <div class="row"><span>当前日期</span><b>逍遥${di.year}·${di.monthName}${di.day}</b></div>
      <div class="row"><span>性格</span><b>${S.ie}</b></div>
      <div class="row"><span>运气</span><b>${S.luck}</b></div>
    </div>
    <h4>境界与天赋</h4>
    <div class="card">
      <div class="row"><span>境界</span><b>${realmText}</b></div>
      <div class="row"><span>年龄</span><b>${Math.floor(S.life)} / ${S.lifeMax}</b></div>
      <div class="row"><span>天赋</span><b>${apt.name}</b></div>
      <div class="row"><span>最高可至</span><b>${REALMS[apt.maxRealm].name}</b></div>
    </div>
    <h4>灵根</h4>
    <div class="card">${rootDisplay}</div>
    <h4>心法悟性</h4>
    <div class="card">
      <div class="row"><span>正悟性</span><b>${S.talent.zheng} / 100</b></div>
      <div class="row"><span>邪悟性</span><b>${S.talent.xie} / 100</b></div>
    </div>
    <h4>宗门</h4>
    <div class="card">
      <div class="row"><span>宗门</span><b>${sect ? sect.name + " Lv." + sect.level : "未入"}</b></div>
      <div class="row"><span>身份</span><b>${S.flags.rank || "杂务"}</b></div>
      ${peak ? `<div class="row"><span>所在峰</span><b>${peak.name}</b></div>` : ''}
      ${master ? `<div class="row"><span>师父</span><b>${master.name}</b></div>` : ''}
      <div class="row"><span>贡献</span><b>${S.contrib}</b></div>
    </div>
    <h4>资产</h4>
    <div class="card">
      <div class="row"><span>铜钱</span><b>${S.money}</b></div>
      <div class="row"><span>灵石</span><b>${S.stone}</b></div>
    </div>
  `;
}


function renderProfileBag() {
  let html = `<div class="subtabs">`;
  BAG_TABS.forEach(t => {
    html += `<div class="subtab ${currentBagTab === t ? 'active' : ''}" onclick="switchBagTab('${t}')">${t}</div>`;
  });
  html += `</div>`;

  if (currentBagTab === "丹药") {
    html += `<h4>丹药/物品</h4>`;
    const itemKeys = Object.keys(S.items).filter(k => S.items[k] > 0);
    if (itemKeys.length === 0) html += `<p class="empty">空空如也。</p>`;
    itemKeys.forEach(k => {
      html += `<div class="row"><span>${k}</span><span>×${S.items[k]}</span></div>`;
    });
    html += `<h4>使用丹药</h4>`;
    ["回血丹", "聚气丹", "静心丹", "延寿丹"].forEach(n => {
      html += `<button onclick="useItem('${n}')" ${!S.items[n] ? "disabled" : ""}>${n}</button>`;
    });
  }
  else if (currentBagTab === "材料") {
    const matKeys = Object.keys(S.mat).filter(k => S.mat[k] > 0);
    if (matKeys.length === 0) html += `<p class="empty">空空如也。</p>`;
    matKeys.forEach(k => {
      html += `<div class="row"><span>${k}</span><span>×${S.mat[k]}</span></div>`;
    });
  }
  else if (currentBagTab === "装备") {
    html += `<h4>未装配</h4>`;
    let has = false;
    for (const id in S.equips) {
      const eq = EQUIPS.find(x => x.id === id);
      if (!eq) continue;
      if (Object.values(S.equipped).includes(id)) continue;
      has = true;
      html += `<div class="card"><b>${eq.name}</b>
        <div class="small">攻+${eq.atk || 0} 防+${eq.def || 0}</div>
        <button onclick="equipItem('${id}')">装配</button></div>`;
    }
    if (!has) html += `<p class="empty">没有闲置装备。</p>`;
  }
  else if (currentBagTab === "其他") {
    /* 工具 */
    html += `<h4>工具</h4>`;
    const tools = Object.keys(S.tools).filter(k => S.tools[k]);
    if (tools.length === 0) html += `<p class="empty">没有工具。</p>`;
    tools.forEach(tid => {
      const it = SHOP_ITEMS.find(x => x.id === tid);
      if (!it) return;
      html += `<div class="card"><b>${it.name}</b>
        <div class="small">${it.desc}</div>
        <button onclick="sellTool('${tid}')">卖出（半价 ${Math.floor(it.price / 2)}）</button>
      </div>`;
    });

    /* 残卷 */
    html += `<h4>心法残卷</h4>`;
    const frags = listOwnedFragments();
    if (frags.length === 0) {
      html += `<p class="empty">没有残卷。</p>`;
    } else {
      frags.forEach(item => {
        html += `<div class="card">
          <b>${item.fragment.name}</b> <span class="tag">${item.art.name}</span>
          <div class="small">解锁 Lv.${item.fragment.start} ~ Lv.${item.fragment.end}</div>
          <div class="small">数量：${item.count}</div>
          <button onclick="useFragment('${item.id}')">使用</button>
        </div>`;
      });
    }
  }
  return html;
}


function useItem(name) {
  if (!S.items[name]) return;
  S.items[name]--;
  if (S.items[name] <= 0) delete S.items[name];
  if (name === "回血丹") S.hp = Math.min(S.hpMax, S.hp + S.hpMax * 0.5);
  save(); renderProfile(); render();
}

function equipItem(id) {
  const eq = EQUIPS.find(x => x.id === id);
  if (!eq) return;
  S.equipped[eq.slot] = id;
  save(); renderProfile(); render();
}

function sellTool(id) {
  const it = SHOP_ITEMS.find(x => x.id === id);
  if (!it) return;
  const price = Math.floor(it.price / 2);
  addCurrency(price);
  delete S.tools[id];
  log(`卖出 ${it.name}，获得 ${price} ${currencyName()}。`, "c-good");
  save(); renderProfile();
}

function renderProfileEquip() {
  const slots = ["weapon", "armor", "ring"];
  let html = `<h4>当前装配</h4>`;
  slots.forEach(s => {
    const id = S.equipped[s];
    const eq = id ? EQUIPS.find(x => x.id === id) : null;
    html += `<div class="row"><span>${slotName(s)}</span>
      <span>${eq ? eq.name : "（空）"}${eq ? ` <button onclick="unequip('${s}')">卸下</button>` : ""}</span></div>`;
  });
  html += `<h4>可装配</h4>`;
  for (const id in S.equips) {
    const eq = EQUIPS.find(x => x.id === id);
    if (!eq) continue;
    if (Object.values(S.equipped).includes(id)) continue;
    html += `<div class="card"><b>${eq.name}</b>
      <div class="small">攻+${eq.atk || 0} 防+${eq.def || 0}</div>
      <button onclick="equipItem('${id}')">装配</button></div>`;
  }
  return html;
}

function unequip(slot) {
  S.equipped[slot] = null;
  save(); renderProfile(); render();
}

function renderProfileHeart() {
  const art = getCurrentArt();
  const prog = art ? getArtProgress(art.id) : { lvl: 0, exp: 0, proficiency: 0 };
  const match = art ? calcArtMatch(art) : 0;
  const playerInfo = getPlayerRealmInfo();
  const isFan = playerInfo.realm === 0;
  const hb = getHeartBonus();

  let html = `
    <h4>心法悟性</h4>
    <div class="row"><span>正悟性</span><b>${S.talent.zheng} / 100</b></div>
    <div class="row"><span>邪悟性</span><b>${S.talent.xie} / 100</b></div>
  `;

  /* 属性等级 */
  html += `<h4>属性等级</h4>
    <div class="card">
      ${ROOT_TYPES.map(r => {
        const v = S.elementLvl ? S.elementLvl[r.id] : 0;
        return `<div class="row"><span>${r.name}</span><b>${v}</b></div>`;
      }).join("")}
    </div>`;

  if (art) {
    html += `<h4>当前心法</h4>
      <div class="card">
        <b>${art.name}</b> <span class="tag">${art.type}</span>
        <span class="tag">${art.category || "无"}</span>
        ${art.element ? `<span class="tag">${ROOT_TYPES.find(r => r.id === art.element).name}</span>` : ''}`;

    if (isFan) {
      html += `<div class="row"><span>熟练度</span><b>${prog.proficiency.toFixed(2)} / 100</b></div>`;
    } else {
      const curLevelData = art.levels.find(l => l.lvl === prog.lvl);
      const need = curLevelData ? curLevelData.expNeed : 0;
      html += `<div class="row"><span>等级</span><b>Lv.${prog.lvl} / ${art.maxLvl}</b></div>
        <div class="row"><span>熟练度</span><b>${prog.proficiency.toFixed(2)} / 100</b></div>
        <div class="row"><span>修为</span><b>${fmt(prog.exp)} / ${fmt(need)}</b></div>`;
    }

    /* 当前提供属性等级 */
    if (art.element) {
      const el = calcElementLvl(prog.lvl, art.maxLvl);
      const elName = ROOT_TYPES.find(r => r.id === art.element).name;
      html += `<div class="row"><span>提供属性</span><b>${elName} ${el}</b></div>`;
    }

    html += `<div class="row"><span>匹配度</span><b>${match}%</b></div>
      </div>`;
  } else {
    html += `<p class="empty">当前没有心法。</p>`;
  }

  /* 心法总加成 */
  html += `<h4>心法总加成（取最高）</h4>
    <div class="card">
      <div class="row"><span>威力</span><b>${hb.power}</b></div>
      <div class="row"><span>攻击</span><b>+${hb.atk}</b></div>
      <div class="row"><span>防御</span><b>+${hb.def}</b></div>
      <div class="row"><span>灵力上限</span><b>+${hb.mp}</b></div>
      <div class="row"><span>气血上限</span><b>+${hb.hp}</b></div>
    </div>`;

  /* 已学心法 */
  html += `<h4>已学心法</h4>`;
  if (S.heartArts.learned.length === 0) {
    html += `<p class="empty">尚未学习任何心法。</p>`;
  } else {
    S.heartArts.learned.forEach(artId => {
      const a = HEART_ARTS.find(x => x.id === artId);
      if (!a) return;
      const p = getArtProgress(artId);
      const isCurrent = S.heartArts.current === artId;
      let progText;
      if (p.lvl === 0) progText = `熟练 ${p.proficiency.toFixed(0)}/100`;
      else progText = `Lv.${p.lvl}/${a.maxLvl}`;

      const elTag = a.element
        ? `<span class="tag">${ROOT_TYPES.find(r => r.id === a.element).name}</span>`
        : '';
      const catTag = a.category ? `<span class="tag">${a.category}</span>` : '';

      html += `<div class="card">
        <b>${a.name}</b> <span class="tag">${a.type}</span> ${catTag} ${elTag}
        ${isCurrent ? '<span class="tag good">使用中</span>' : ''}
        <div class="row"><span>进度</span><span class="small">${progText}</span></div>
        ${!isCurrent ? `<button class="small" onclick="switchHeartArt('${artId}')">切换</button>` : ''}
      </div>`;
    });
  }

  return html;
}


function renderProfileSkills() {
  return `
    <h4>技能等级</h4>
    ${SKILLS.map(k => {
      const sk = S.skills[k];
      return `<div class="skill-bar">
        <span>${k} Lv.${sk.lvl}</span>
        <div class="skill-mini"><div style="width:${sk.exp}%"></div></div>
        <span class="small">${sk.exp.toFixed(2)}/100</span>
      </div>`;
    }).join("")}
  `;
}

function renderProfileChores() {
  const all = [...CHORES_FAN, ...CHORES_MENWAI, ...CHORES_MENNEI];
  return `
    <h4>杂务熟练度</h4>
    ${all.map(c => {
      const v = S.choreSkill[c.id] || 0;
      return `<div class="skill-bar">
        <span>${c.name}</span>
        <div class="skill-mini"><div style="width:${v}%"></div></div>
        <span class="small">${v.toFixed(2)}%</span>
      </div>`;
    }).join("")}
  `;
}

function renderProfileHobbies() {
  if (!S.hobbies || S.hobbies.length === 0) return `<p class="empty">你还没有任何爱好。</p>`;
  return `
    <h4>爱好（最多 3 个）</h4>
    ${S.hobbies.map(h => {
      const v = S.hobbySkill[h] || 0;
      return `<div class="skill-bar">
        <span>${h}</span>
        <div class="skill-mini"><div style="width:${v}%"></div></div>
        <span class="small">${v.toFixed(2)}</span>
      </div>`;
    }).join("")}
    <p class="small">爱好在晚餐后随机触发（35%），消耗 1 行动。</p>
  `;
}