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

/* ============================================================
   角色信息
   ============================================================ */

function renderProfileInfo() {
  const sect = S.sect ? SECTS.find(x => x.id === S.sect) : null;
  const peak = S.peak ? PEAKS.find(p => p.id === S.peak) : null;
  const master = S.master ? S.npcMap[S.master] : null;
  const apt = APTITUDES.find(a => a.id === S.aptitude) || APTITUDES[0];
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
      <div class="row"><span>当前日期</span><b>逍遥${di.year}·${di.monthName}${di.day}　周${WEEKDAYS[S.weekday]}</b></div>
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
    <h4>本心</h4>
    <div class="card">
      <div class="row"><span>本心</span><b>${moralityLabel(S.morality)}（${S.morality}）</b></div>
    </div>
    <h4>抗性</h4>
    <div class="card">
      ${Object.keys(S.resistances || {}).map(k => {
        const def = getStatusDef(k);
        const name = def ? def.name : k;
        const val = (S.resistances && S.resistances[k]) || 0;
        const label = resistLabel(val);
        return `<div class="row">
          <span>${name}</span>
          <b>${label}（${val}）</b>
        </div>`;
      }).join("")}
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
    <h4>战斗属性</h4>
    <div class="card">
      <div class="row"><span>攻击</span><b>${totalAtk()}</b></div>
      <div class="row"><span>防御</span><b>${totalDef()}</b></div>
      <div class="row"><span>速度</span><b>${totalSpeed()}</b></div>
      <div class="row"><span>幸运</span><b>${S.luck}</b></div>
      <div class="row"><span>暴击率</span><b>${(getCritRate() * 100).toFixed(1)}%</b></div>
      <div class="row"><span>气血上限</span><b>${totalMaxHp()}</b></div>
      <div class="row"><span>灵力上限</span><b>${totalMaxMp()}</b></div>
    </div>
    <h4>逆天宝物</h4>
    <div class="card">
      ${S.equipped.heavenDefying ? (() => {
        const disp = getHeavenDefyingDisplay(S.equipped.heavenDefying);
        if (!disp) return "<p class='empty'>（未知）</p>";
        return `<div class="row"><span>${disp.name}</span></div>
          <div class="small">${disp.desc}</div>`;
      })() : `<p class="empty">未装备逆天宝物。</p>`}
    </div>    
    <h4>灵宠</h4>
    <div class="card">
      ${renderPetsList()}
    </div>
  `;
}

/* ============================================================
   装配
   ============================================================ */

function renderProfileEquip() {
  let html = `<h4>当前装配</h4>`;
  EQUIP_SLOTS.forEach(s => {
    const id = S.equipped[s];
    let name = "（空）";

    if (id) {
      if (s === "heavenDefying") {
        const disp = getHeavenDefyingDisplay(id);
        name = disp ? disp.name : id;
      } else {
        const eq = findEquipById(id);
        name = eq ? eq.name : id;
      }
    }

    html += `<div class="row">
      <span>${SLOT_NAMES[s]}</span>
      <span>${name}${id ? ` <button onclick="unequip('${s}')">卸下</button>` : ""}</span>
    </div>`;
  });

  html += `<h4>可装配</h4>`;
  const equippedIds = Object.values(S.equipped).filter(Boolean);

  /* 普通装备 + 法宝 */
  ["equip", "artifact"].forEach(type => {
    const ids = getItemsByType(type);
    ids.forEach(id => {
      if (!hasItem(id)) return;
      if (equippedIds.includes(id)) return;
      const eq = ITEMS[id];
      const extra = eq.spellBonus ? `　法术+${(eq.spellBonus * 100).toFixed(0)}%` : "";
      html += `<div class="card">
        <b>${eq.name}</b> <span class="tag">${SLOT_NAMES[eq.slot] || eq.slot}</span>
        <div class="small">攻+${eq.atk || 0} 防+${eq.def || 0}${extra}</div>
        <button onclick="autoEquip('${id}')">装配</button>
      </div>`;
    });
  });

  /* 逆天宝物 */
  Object.keys(S.heavenDefying.owned).forEach(id => {
    if (!S.heavenDefying.owned[id]) return;
    if (equippedIds.includes(id)) return;
    const disp = getHeavenDefyingDisplay(id);
    if (!disp) return;
    html += `<div class="card">
      <b>${disp.name}</b> <span class="tag">逆天宝物</span>
      <div class="small">${disp.desc}</div>
      <button onclick="equipHeavenDefying('${id}')">装配</button>
    </div>`;
  });

  return html;
}


function findFreeSlot(item) {
  const accept = SLOT_ACCEPT[item.slot] || [item.slot];
  for (const s of accept) {
    if (!S.equipped[s]) return s;
  }
  return accept[0];
}

function autoEquip(itemId) {
  if (!hasItem(itemId)) { log("没有这件装备", "c-bad"); return; }
  const item = ITEMS[itemId];
  if (!item) return;
  const slot = findFreeSlot(item);
  S.equipped[slot] = itemId;
  log(`装配 ${item.name} 到 ${SLOT_NAMES[slot] || slot}。`, "c-good");
  save(); renderProfile(); render();
}

function unequip(slot) {
  S.equipped[slot] = null;
  save(); renderProfile(); render();
}

/* ============================================================
   主渲染
   ============================================================ */

function renderProfile() {
  if (!S) return;

  let html = `<h3>${S.name} <button class="help" onclick="closeProfile()">×</button></h3>`;

  /* Tab 栏 */
  html += `<div class="subtabs">`;
  PROFILE_TABS.forEach(t => {
    html += `<div class="subtab ${currentProfileTab === t ? 'active' : ''}"
      onclick="switchProfileTab('${t}')">${t}</div>`;
  });
  html += `</div>`;

  /* 内容 */
  html += `<div class="profile-content">`;
  if (currentProfileTab === "角色信息") html += renderProfileInfo();
  else if (currentProfileTab === "心法") html += renderProfileHeart();
  else if (currentProfileTab === "法术") html += renderProfileSpells();
  else if (currentProfileTab === "装配") html += renderProfileEquip();
  else if (currentProfileTab === "背包") html += renderProfileBag();
  else if (currentProfileTab === "杂务") html += renderProfileChores();
  else if (currentProfileTab === "爱好") html += renderProfileHobbies();
  html += `</div>`;

  document.getElementById("profileBox").innerHTML = html;
}

/* ============================================================
   使用道具（按 effect 分派）
   ============================================================ */

function useItem(name) {
  if (!hasItem(name)) return;
  const item = ITEMS[name];
  if (!item || item.type !== "pill" || !item.effect) return;

  /* 战斗中专用丹药，不能在背包点用 */
  if (item.usableIn === "battle") {
    log(`【${item.name}】只能在战斗中使用。`, "c-bad");
    return;
  }

  const e = item.effect;
  const detail = [];
  let consumed = false;

  switch (e.type) {
    case "heal": {
      const v = Math.floor(totalMaxHp() * (e.value || 0.5));
      if (S.hp >= totalMaxHp()) { log("气血已满。", "c-bad"); return; }
      S.hp = Math.min(totalMaxHp(), S.hp + v);
      detail.push(`气血 +${v}`);
      consumed = true;
      break;
    }
    case "healMp": {
      const v = Math.floor(totalMaxMp() * (e.value || 0.5));
      if (S.mp >= totalMaxMp()) { log("灵力已满。", "c-bad"); return; }
      S.mp = Math.min(totalMaxMp(), S.mp + v);
      detail.push(`灵力 +${v}`);
      consumed = true;
      break;
    }
    case "cure": {
      const had = S.statuses.some(s => s.id === e.status);
      if (!had) { log("没有该状态。", "c-bad"); return; }
      S.statuses = S.statuses.filter(s => s.id !== e.status);
      detail.push(`解除【${getStatusDef(e.status).name}】`);
      consumed = true;
      break;
    }
    case "cureAll": {
      const before = S.statuses.length;
      S.statuses = S.statuses.filter(s => {
        const def = getStatusDef(s.id);
        return def && def.type === "buff";
      });
      detail.push(`净化 ${before - S.statuses.length} 个负面状态`);
      consumed = true;
      break;
    }
    case "exp": {
      /* 每日上限 */
      if (e.dailyLimit) {
        if (!S.flags.pillDaily) S.flags.pillDaily = {};
        const key = `${item.baseId}_${S.day}`;
        const used = S.flags.pillDaily[key] || 0;
        if (used >= e.dailyLimit) {
          log(`【${item.name}】今日已达上限（${e.dailyLimit} 粒）。`, "c-bad");
          return;
        }
        S.flags.pillDaily[key] = used + 1;
      }
      S.exp += e.value;
      detail.push(`修为 +${fmt(e.value)}`);
      consumed = true;
      break;
    }
    case "root": {
      const mx = maxRoot(S.roots);
      if (mx.val >= 9) { log("灵根已达上限。", "c-bad"); return; }
      S.roots[mx.key] = Math.min(9, S.roots[mx.key] + e.value);
      detail.push(`灵根 +${e.value}（${ROOT_TYPES.find(r => r.id === mx.key).name} → ${S.roots[mx.key]}）`);
      consumed = true;
      break;
    }
    case "mood": {
      if (S.mood >= 2) { log("心情已最佳。", "c-bad"); return; }
      S.mood = Math.min(2, S.mood + e.value);
      detail.push(`心情 +${e.value}`);
      consumed = true;
      break;
    }
    case "life": {
      S.lifeMax += e.value;
      detail.push(`寿元上限 +${e.value}`);
      consumed = true;
      break;
    }
    case "permanent": {
      S[e.stat] = (S[e.stat] || 0) + e.value;
      detail.push(`${e.stat} +${e.value}`);
      consumed = true;
      break;
    }
    case "social": {
      S.npcs.forEach(n => {
        if (n.alive) n.aff = Math.min(100, n.aff + e.value);
      });
      detail.push(`全体 NPC 好感 +${e.value}`);
      consumed = true;
      break;
    }
    case "breakBonus": {
      if (!S.flags.pillBuff) S.flags.pillBuff = {};
      S.flags.pillBuff.breakBonus = (S.flags.pillBuff.breakBonus || 0) + e.value;
      detail.push(`突破率 +${(e.value * 100).toFixed(0)}%（下次突破消耗）`);
      consumed = true;
      break;
    }
    case "special": {
      handleSpecialPill(item, e, detail);
      consumed = true;
      break;
    }
    case "petSpecial": {
      handlePetSpecialPill(item, e, detail);
      consumed = true;
      break;
    }
    default:
      log(`【${item.name}】暂未实现效果。`, "c-bad");
      return;
  }

  if (!consumed) return;

  removeItem(name, 1);
  log(`使用 ${item.name}。`, "c-good");
  save(); renderProfile(); render();

  if (detail.length > 0) {
    showActionModal(`使用 ${item.name}`, detail);
  }
}

/* 特殊丹药 */
function handleSpecialPill(item, e, detail) {
  switch (e.key) {
    case "alchemyBuff":
      if (typeof applyAlchemyBuff === "function") {
        applyAlchemyBuff(item);
      } else {
        if (!S.flags.alchemyBuff) S.flags.alchemyBuff = {};
        S.flags.alchemyBuff.rate = Math.max(S.flags.alchemyBuff.rate || 0, e.rate || 0);
        S.flags.alchemyBuff.output = Math.max(S.flags.alchemyBuff.output || 0, e.output || 0);
      }
      detail.push(`炼丹成功率 +${(e.rate * 100).toFixed(0)}%，产出 +${e.output}`);
      break;
    case "forgeBuff":
      if (!S.flags.forgeBuff) S.flags.forgeBuff = {};
      S.flags.forgeBuff.rate = Math.max(S.flags.forgeBuff.rate || 0, e.rate || 0);
      detail.push(`炼器成功率 +${(e.rate * 100).toFixed(0)}%`);
      break;
    case "forgeProtect":
      S.flags.forgeProtect = true;
      detail.push(`炼器防炸炉（下次生效）`);
      break;
    case "cultivateBuff":
      if (!S.flags.cultivateBuff) S.flags.cultivateBuff = {};
      S.flags.cultivateBuff.mul = Math.max(S.flags.cultivateBuff.mul || 0, e.mul || 1.5);
      S.flags.cultivateBuff.days = Math.max(S.flags.cultivateBuff.days || 0, e.days || 1);
      detail.push(`修炼 ×${e.mul}，持续 ${e.days} 天`);
      break;
    case "extraAction":
      S.actionsUsed = Math.max(0, S.actionsUsed - e.value);
      detail.push(`额外行动 +${e.value}`);
      break;
    case "bloodRage":
      if (!S.flags.bloodRage) S.flags.bloodRage = {};
      S.flags.bloodRage.atkMul = e.atkMul;
      S.flags.bloodRage.days = e.days || 1;
      S.hp = Math.max(1, S.hp - Math.floor(totalMaxHp() * e.hpCost));
      detail.push(`攻击 +${(e.atkMul * 100).toFixed(0)}%，气血 -${(e.hpCost * 100).toFixed(0)}%`);
      break;
    case "lifesteal":
      S.flags.lifesteal = e.value;
      detail.push(`击杀回血 ${(e.value * 100).toFixed(0)}%`);
      break;
    case "antiDeviation":
    case "fixRoot":
    case "stabilizeJindan":
    case "youth":
    case "protectBreak":
    case "revive":
      detail.push(`（效果已生效）`);
      break;
    default:
      detail.push(`（特殊效果：${e.key}）`);
  }
}

/* 灵兽特殊丹药 */
function handlePetSpecialPill(item, e, detail) {
  const petUid = S.equipped.pet;
  if (!petUid) {
    detail.push("（没有出战灵宠，效果无效）");
    return;
  }
  const pet = S.pets.list.find(p => p.uid === petUid);
  if (!pet) {
    detail.push("（出战灵宠不存在）");
    return;
  }

  switch (e.key) {
    case "rerollTalent": {
      const old = getPetTalent(pet.talent).name;
      const t = randomPetTalent();
      pet.talent = t.id;
      detail.push(`${pet.name} 天赋重掷：${old} → ${t.name}`);
      break;
    }
    case "rerollBloodline": {
      const old = getPetBloodline(pet.bloodline).name;
      const b = pick(PET_BLOODLINES);
      pet.bloodline = b.id;
      detail.push(`${pet.name} 血脉重掷：${old} → ${b.name}`);
      break;
    }
    case "expUp":
      pet.exp += e.value;
      detail.push(`${pet.name} 修为 +${e.value}`);
      break;
    case "hungerFull":
      pet.hunger = 100;
      detail.push(`${pet.name} 饥饿回满`);
      break;
    case "hpUp":
    case "defUp":
    case "atkUp":
    case "speedUp":
      detail.push(`${pet.name} ${e.key} +${e.value}（未实装）`);
      break;
    default:
      detail.push(`（灵兽效果：${e.key}）`);
  }
}

function sellTool(id) {
  const it = ITEMS[id];
  if (!it) return;
  const price = Math.floor((it.price || 0) / 2);
  addCurrency(price);
  delete S.tools[id];
  log(`卖出 ${it.name}，获得 ${price} ${currencyName()}。`, "c-good");
  save(); renderProfile();
}

/* ============================================================
   心法
   ============================================================ */

function renderProfileHeart() {
  const art = getCurrentArt();
  const prog = art ? getArtProgress(art.id) : { lvl: 0, exp: 0, proficiency: 0 };
  const match = art ? calcArtMatch(art) : 0;
  const playerInfo = getPlayerRealmInfo();
  const isFan = playerInfo.realm === 0;
  const hb = getHeartBonus();

  let html = `
    <h4>本心</h4>
    <div class="row"><span>本心</span><b>${moralityLabel(S.morality)}（${S.morality}）</b></div>
  `;

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

  html += `<h4>心法总加成（取最高）</h4>
    <div class="card">
      <div class="row"><span>威力</span><b>${hb.power}</b></div>
      <div class="row"><span>攻击</span><b>+${hb.atk}</b></div>
      <div class="row"><span>防御</span><b>+${hb.def}</b></div>
      <div class="row"><span>灵力上限</span><b>+${hb.mp}</b></div>
      <div class="row"><span>气血上限</span><b>+${hb.hp}</b></div>
    </div>`;

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

/* ============================================================
   法术（熟练 + 已学法术）
   ============================================================ */

function renderProfileSpells() {
  let html = "";

  /* ===== 段 1：熟练 ===== */
  const learnedSkills = SKILLS.filter(k => (S.skills[k]?.lvl || 0) > 0);
  html += `<h4>熟练</h4>`;
  if (learnedSkills.length === 0) {
    html += `<p class="empty">尚未练习任何技艺。</p>`;
  } else {
    learnedSkills.forEach(k => {
      const sk = S.skills[k];
      html += `<div class="skill-bar">
        <span>${k} Lv.${sk.lvl}</span>
        <div class="skill-mini"><div style="width:${sk.exp}%"></div></div>
        <span class="small">${sk.exp.toFixed(2)}/100</span>
      </div>`;
    });
  }

  /* ===== 段 2：已学法术（按类型分） ===== */
  const learnedSpells = listLearnedSpells();
  html += `<h4>已学法术</h4>`;
  if (learnedSpells.length === 0) {
    html += `<p class="empty">尚未学会任何法术。</p>`;
  } else {
    /* 按 type 分组 */
    const byType = {};
    learnedSpells.forEach(sp => {
      const t = sp.type || "其他";
      if (!byType[t]) byType[t] = [];
      byType[t].push(sp);
    });

    Object.keys(byType).forEach(t => {
      html += `<h5 style="color:#d8b878;margin:8px 0 4px;">${t}</h5>`;
      byType[t].forEach(sp => {
        const usable = canUseSpell(sp.id);
        const tl = {
          enemySingle: "敌单", enemyAll: "敌全",
          allySingle: "我单", allyAll: "我全", all: "全体",
        }[sp.target || "enemySingle"] || "敌单";
        html += `<div class="card">
          <b>${sp.name}</b> <span class="tag">${tl}</span>
          ${usable.ok ? '<span class="tag good">可用</span>' : `<span class="tag bad">${usable.reason}</span>`}
          <div class="small">${sp.desc}</div>
          <div class="small">灵力 ${sp.cost.mp}　威力 ×${sp.power}</div>
        </div>`;
      });
    });
  }

  return html;
}

/* ============================================================
   杂务 / 爱好
   ============================================================ */

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

/* ============================================================
   背包（7 tab）
   ============================================================ */

function renderProfileBag() {
  let html = `<div class="subtabs">`;
  BAG_TABS.forEach(t => {
    html += `<div class="subtab ${currentBagTab === t ? 'active' : ''}" onclick="switchBagTab('${t}')">${t}</div>`;
  });
  html += `</div>`;

  if (currentBagTab === "丹药") {
    html += renderInventoryByType("pill");
    html += renderInventoryByType("petBreak", true);
    html += renderInventoryByType("food", true);
  }
  else if (currentBagTab === "材料") {
    html += renderInventoryByType("mat");
  }
  else if (currentBagTab === "装备") {
    html += renderInventoryByType("equip");
    html += renderInventoryByType("artifact", true);
  }
  else if (currentBagTab === "秘籍") {
    html += renderInventoryByType("heartFragment");
    html += renderInventoryByType("spellbook", true);
    html += renderInventoryByType("summonbook", true);
  }
  else if (currentBagTab === "逆天宝物") {
    html += renderInventoryByType("heavenDefying");
  }
  else if (currentBagTab === "任务道具") {
    html += renderInventoryByType("quest");
  }
  else if (currentBagTab === "其他") {
    html += renderInventoryByType("other");
  }

  return html;
}

function renderInventoryByType(type, shortTitle) {
  const ids = getItemsByType(type).filter(id => S.inventory[id] > 0);
  if (ids.length === 0) return shortTitle ? "" : `<p class="empty">空空如也。</p>`;

  const typeNames = {
    pill: "丹药",
    petBreak: "灵宠突破材料",
    food: "兽粮",
    mat: "材料",
    equip: "装备",
    artifact: "法宝",
    heartFragment: "心法残卷",
    spellbook: "法术秘籍",
    summonbook: "召唤秘籍",
    heavenDefying: "逆天宝物",
    quest: "任务道具",
    other: "其他",
  };

  let html = shortTitle ? `<h5>${typeNames[type] || type}</h5>` : "";

  /* 排序：材料按 baseId + grade；丹药按 baseId + grade；其他保持原序 */
  let sorted = ids;
  if (type === "mat" || type === "pill") {
    sorted = [...ids].sort((a, b) => {
      const ia = ITEMS[a], ib = ITEMS[b];
      const ba = ia.baseId || a, bb = ib.baseId || b;
      if (ba !== bb) return ba.localeCompare(bb);
      return (ia.grade || 0) - (ib.grade || 0);
    });
  }

  sorted.forEach(id => {
    const item = ITEMS[id];
    const count = S.inventory[id];

    /* 品级标签 */
    let gradeTag = "";
    if (item.grade) {
      gradeTag = ` <span class="tag gold">${item.grade} 品</span>`;
    }

    html += `<div class="card">
      <b>${item.name}</b>${gradeTag} ×${count}
      <div class="small">${item.desc || ""}</div>
      ${renderItemActions(id, item)}
    </div>`;
  });

  return html;
}

function renderItemActions(id, item) {
  if (item.type === "pill") {
    /* 战斗中专用丹药不能在背包使用 */
    if (item.usableIn === "battle") {
      return `<span class="small">（仅战斗中可用）</span>`;
    }
    return `<button onclick="useItem('${id}')">使用</button>`;
  }
  if (item.type === "spellbook") {
    if (hasSpell(item.spellId)) return '<span class="tag good">已学</span>';
    const check = canLearnSpell(item.spellId);
    return check.ok
      ? `<button onclick="useSpellBook('${id}')">参悟</button>`
      : `<span class="small" style="color:#d05a4a;">${check.reason}</span>`;
  }
  if (item.type === "skillbook") {
    if (!S.combatSkills) S.combatSkills = { learned: [] };
    if (S.combatSkills.learned.includes(item.skillId)) return '<span class="tag good">已学</span>';
    return `<button onclick="useSkillBook('${id}')">参悟</button>`;
  }
  if (item.type === "summonbook") {
    if (!S.combatSkills) S.combatSkills = { learned: [] };
    if (S.combatSkills.learned.includes(item.summonId)) return '<span class="tag good">已学</span>';
    return `<button onclick="useSummonBook('${id}')">参悟</button>`;
  }
  if (item.type === "equip" || item.type === "artifact" || item.type === "heavenDefying") {
    if (Object.values(S.equipped).includes(id)) {
      return '<span class="tag good">已装备</span>';
    }
    return `<button onclick="autoEquip('${id}')">装配</button>`;
  }
  if (item.type === "food") {
    return `<div class="small">用于灵宠喂食</div>`;
  }
  if (item.type === "petBreak") {
    return `<div class="small">用于灵宠突破</div>`;
  }
  if (item.type === "heartFragment") {
    return `<button onclick="useFragment('${id}')">使用</button>`;
  }
  if (item.type === "other") {
    if (S.tools[id]) {
      return `<button onclick="sellTool('${id}')">卖出（半价 ${Math.floor((item.price || 0) / 2)}）</button>`;
    }
  }
  return "";
}

/* ============================================================
   灵宠列表
   ============================================================ */

function renderPetsList() {
  if (!S.pets || !S.pets.list || S.pets.list.length === 0) {
    return `<p class="empty">尚未收服灵宠。</p>`;
  }

  const equippedUid = S.equipped.pet;

  return S.pets.list.map(pet => {
    const isEquipped = pet.uid === equippedUid;
    const stats = getPetStats(pet);
    const talent = getPetTalent(pet.talent);
    const bloodline = getPetBloodline(pet.bloodline);
    const realmText = REALMS[pet.realm] ? REALMS[pet.realm].name : "凡人";
    const need = petExpNeed(pet.lvl);

    return `<div class="card">
      <b>${pet.name}</b>
      <span class="tag">${talent.name}</span>
      <span class="tag">${bloodline.name}血脉</span>
      ${isEquipped ? '<span class="tag good">出战</span>' : ''}
      <div class="small">境界：${realmText}·${pet.lvl}重</div>
      <div class="small">修为：${pet.exp}/${need}</div>
      ${stats ? `<div class="small">攻 ${stats.atk}　防 ${stats.def}　速 ${stats.speed}　血 ${stats.hpMax}</div>` : ""}
      <div style="margin-top:4px;">
        ${!isEquipped
          ? `<button onclick="equipPet('${pet.uid}')">出战</button>`
          : `<button onclick="unequipPet()">休息</button>`}
        ${pet.lvl >= 10
          ? `<button onclick="breakPet('${pet.uid}')">突破</button>`
          : ""}
      </div>
    </div>`;
  }).join("");
}