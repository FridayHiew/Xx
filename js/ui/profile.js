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

let currentSpellFilter = "all";
let currentEquipFilter = "all";

function switchSpellFilter(f) {
  currentSpellFilter = f;
  renderProfile();
}

function switchEquipFilter(f) {
  currentEquipFilter = f;
  renderProfile();
}

/* ============================================================
   图表与槽位映射常量
   ============================================================ */

const SLOT_ICONS = {
  head: "👑", rightHand: "⚔️", leftHand: "🛡️", body: "🥋", shoes: "👢",
  accessory1: "📿", accessory2: "💍",
  artifact1: "🔮", artifact2: "🪞", artifact3: "🪔",
  pet: "🐾", mount: "🐎", heavenDefying: "☯️",
};

const RESIST_MAP = {
  poison:  { icon: "☠️", name: "抗毒" },
  burn:    { icon: "🔥", name: "抗灼" },
  bleed:   { icon: "🩸", name: "抗创" },
  stun:    { icon: "💫", name: "抗眩" },
  freeze:  { icon: "❄️", name: "抗冻" },
  silence: { icon: "🔇", name: "抗默" },
  atkDown: { icon: "📉", name: "抗衰" },
};

const CHORE_ICONS = {
  tiao: "💧", chai: "🪓", cai: "🥬", ji: "🐔",
  lingshou: "🐾", lingyao: "🌿", daqiao: "🔨", cangjing: "📜",
  lianyao: "🧪", lianqi: "⚔️", xunshou: "🐺", zhenfa: "🔮",
  c_kanchai: "🪓", c_tiaoshui: "💧", c_saodi: "🧹", c_caiyao: "🌿",
  c_liandan: "🧪", c_xunshan: "🏔️", c_hufa: "🛡️", c_zhongzhi: "🌾",
  c_sishou: "🥩", c_bushou: "🐾", c_zhenfa: "🔮", c_jiangjing: "📖",
};

const HOBBY_ICONS = {
  "琴": "🪕", "棋": "♟️", "书": "📖", "画": "🎨",
  "花": "🌸", "钓": "🎣", "酒": "🍶", "茶": "🍵",
  "剑舞": "⚔️", "养鸟": "🦜", "养猫": "🐱", "养狗": "🐕",
  "下棋": "♟️", "抚琴": "🪕", "品茗": "🍵", "钓鱼": "🎣",
  "赏月": "🌕", "读书": "📖", "莳花": "🌸", "饮酒": "🍶",
  "试剑": "⚔️", "参禅": "🧘", "观星": "🔭", "作画": "🎨",
};

const SKILL_ICONS = {
  "剑": "🗡️", "刀": "🔪", "拳": "👊", "掌": "✋", "棍": "🥢", "鞭": "➰",
  "兽": "🐾", "炼丹": "🧪", "炼器": "⚔️", "阵法": "🔮", "符": "📜",
};

const SPELL_ICONS = {
  "剑": "🗡️", "拳": "👊", "掌": "✋", "刀": "🔪", "棍": "🥢", "通用": "✨",
};

const ITEM_TYPE_ICONS = {
  pill: "💊", petBreak: "🔮", food: "🍖", mat: "🌿", equip: "⚔️",
  artifact: "🪞", heartFragment: "📜", spellbook: "📖", summonbook: "📜",
  heavenDefying: "☯️", quest: "🏷️", other: "📦",
};

/* ============================================================
   角色信息 (Mobile 友好精简看板)
   ============================================================ */

function renderProfileInfo() {
  const sect = S.sect ? SECTS.find(x => x.id === S.sect) : null;
  const peak = S.peak ? PEAKS.find(p => p.id === S.peak) : null;
  const master = S.master ? S.npcMap[S.master] : null;
  const apt = APTITUDES.find(a => a.id === S.aptitude) || APTITUDES[0];
  const playerInfo = getPlayerRealmInfo();
  const realmText = playerInfo.realm === 0 ? "凡胎肉体" :
    `${REALMS[playerInfo.realm].name} · ${subName(playerInfo.lvl)}${playerInfo.lvl}重`;

  const lifeRatio = Math.max(0, Math.min(100, Math.round((S.life / (S.lifeMax || 100)) * 100)));

  // 五行灵根
  const rootColors = { jin: "#f0cf78", mu: "#5fb865", shui: "#5da8eb", huo: "#db4c3b", tu: "#c29153" };
  let maxRootKey = "jin";
  let maxRootVal = -1;
  if (S.roots) {
    Object.keys(S.roots).forEach(k => {
      if (S.roots[k] > maxRootVal) {
        maxRootVal = S.roots[k];
        maxRootKey = k;
      }
    });
  }

  const rootDisplay = debugShowRoot
    ? `<div class="root-gems-bar">
        ${ROOT_TYPES.map(x => {
          const v = S.roots[x.id] || 0;
          const isDom = x.id === maxRootKey;
          const c = rootColors[x.id] || '#d4a347';
          return `<div class="root-gem-chip ${isDom ? 'dominant' : ''}" title="${x.name}属性灵根">
            <div class="root-gem-name" style="color:${c};">${x.name}${isDom ? '★' : ''}</div>
            <div class="root-gem-bar-mini">
              <div class="root-gem-bar-fill" style="width:${Math.min(100, v * 10)}%; background:${c};"></div>
            </div>
            <div class="root-gem-val">${v}</div>
          </div>`;
        }).join("")}
      </div>`
    : `<p class="small" style="padding:4px 0; color:var(--text-dim); text-align:center;">✨ 暗藏玄机（入高阶宗门或服用测灵丹方可洞察详细）</p>`;

  const hdDisp = S.equipped.heavenDefying ? getHeavenDefyingDisplay(S.equipped.heavenDefying) : null;
  const activePet = S.equipped.pet ? (S.pets?.list?.find(p => p.uid === S.equipped.pet)) : null;

  return `
    <div class="profile-hero-hud">
      <div class="profile-hero-avatar">
        <img src="./src/assets/images/cultivator_avatar_1792114545622.jpg" alt="${S.name}" referrerPolicy="no-referrer">
      </div>
      <div class="profile-hero-info">
        <div class="profile-hero-name-row">
          <span class="profile-hero-name">${S.name}</span>
          <span class="profile-hero-realm-tag">${realmText}</span>
          <span class="tag gold">${sect ? sect.name + ' · ' + (S.flags.rank || '杂务') : '暂无宗门'}</span>
        </div>
        <div class="profile-hero-subline">
          <div class="profile-hero-life-bar" title="寿元消耗">
            <span>寿元</span>
            <div class="life-mini-track">
              <div class="life-mini-fill" style="width:${lifeRatio}%;"></div>
            </div>
            <span style="color:var(--text-bright);">${Math.floor(S.life)}/${S.lifeMax}岁</span>
          </div>
          <span>道心: <b style="color:var(--text-gold);">${moralityLabel(S.morality)}</b></span>
          <span>气运: <b style="color:#5fb865;">${S.luck}</b></span>
        </div>
      </div>
    </div>

    <h4>战斗神能看板</h4>
    <div class="stat-tile-grid">
      <div class="stat-tile">
        <div class="stat-tile-header"><span>⚔️</span><span>攻击</span></div>
        <div class="stat-tile-value">${totalAtk()}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-header"><span>🛡️</span><span>防御</span></div>
        <div class="stat-tile-value">${totalDef()}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-header"><span>⚡</span><span>身法速度</span></div>
        <div class="stat-tile-value">${totalSpeed()}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-header"><span>🎯</span><span>会心暴击</span></div>
        <div class="stat-tile-value">${(getCritRate() * 100).toFixed(1)}%</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-header"><span>❤️</span><span>气血上限</span></div>
        <div class="stat-tile-value">${totalMaxHp()}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-header"><span>💧</span><span>灵力上限</span></div>
        <div class="stat-tile-value">${totalMaxMp()}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-header"><span>🍀</span><span>天命气运</span></div>
        <div class="stat-tile-value">${S.luck}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-header"><span>🪙</span><span>资财</span></div>
        <div class="stat-tile-value">${S.stone}石 / ${S.money}钱</div>
      </div>
    </div>

    <h4>仙门道统与身世</h4>
    <div class="dao-meta-grid">
      <div class="dao-meta-item">
        <span class="lbl">🏔️ 宗门峰脉</span>
        <span class="val">${sect ? sect.name + ' · ' + (peak ? peak.name : '主峰') : '无门无派'}</span>
      </div>
      <div class="dao-meta-item">
        <span class="lbl">🥋 传道恩师</span>
        <span class="val">${master ? master.name : '尚无明师'}</span>
      </div>
      <div class="dao-meta-item">
        <span class="lbl">🌟 根骨资质</span>
        <span class="val">${apt.name} (限${REALMS[apt.maxRealm].name})</span>
      </div>
      <div class="dao-meta-item">
        <span class="lbl">🎖️ 宗门功绩</span>
        <span class="val">${S.contrib} 点</span>
      </div>
      <div class="dao-meta-item">
        <span class="lbl">📅 生辰干支</span>
        <span class="val">${LUNAR_MONTHS[S.birthday.month - 1]}${S.birthday.day}日 (${S.ie})</span>
      </div>
      <div class="dao-meta-item">
        <span class="lbl">☯️ 命格气数</span>
        <span class="val">${S.flags.destinyTitle || '凡胎问道'} (${S.morality >= 0 ? '+' : ''}${S.morality})</span>
      </div>
    </div>

    <h4>宿命五行灵根</h4>
    <div class="card" style="padding:6px 8px;">${rootDisplay}</div>

    <h4>异象抗性</h4>
    <div class="card" style="padding:6px 8px;">
      <div class="resist-badge-cluster">
        ${Object.keys(S.resistances || {}).map(k => {
          const meta = RESIST_MAP[k] || { icon: "🛡️", name: k };
          const val = (S.resistances && S.resistances[k]) || 0;
          const cls = val >= 100 ? "immune" : val > 0 ? "high" : "low";
          return `<div class="resist-badge ${cls}" title="${meta.name}抗性: ${val}">
            <span>${meta.icon}</span>
            <span>${meta.name}</span>
            <b>${val > 0 ? '+' + val : '0'}</b>
          </div>`;
        }).join("")}
      </div>
    </div>

    <h4>随行造化与灵宠</h4>
    <div class="companion-preview-grid">
      <div class="companion-preview-card">
        <div class="companion-preview-icon">☯️</div>
        <div class="companion-preview-text">
          <div class="companion-preview-title">${hdDisp ? hdDisp.name : '（暂无逆天造化）'}</div>
          <div class="companion-preview-sub">${hdDisp ? hdDisp.desc : '通天机缘，可遇不可求'}</div>
        </div>
      </div>
      <div class="companion-preview-card">
        <div class="companion-preview-icon">🐾</div>
        <div class="companion-preview-text">
          <div class="companion-preview-title">${activePet ? activePet.name + ' (出战)' : '（暂无出战灵宠）'}</div>
          <div class="companion-preview-sub">${activePet ? `${REALMS[activePet.realm]?.name || '灵兽'} · ${activePet.lvl}重` : '随身灵宠共 ' + (S.pets?.list?.length || 0) + ' 只'}</div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   装备 (仙躯道体人形八卦阵与交互式槽位配置)
   ============================================================ */

function renderProfileEquip() {
  let html = `
    <div style="text-align:center; margin-bottom:8px;">
      <h4 style="margin:0 0 2px; font-family:var(--font-serif); color:var(--text-gold);">仙躯道体 · 装备矩阵</h4>
      <div class="small" style="color:var(--text-dim);">点击任意仙躯槽位卡片，可直接检索并装配契合宝物</div>
    </div>
  `;

  html += `<div class="paperdoll-container">`;

  html += `
    <div class="paperdoll-center-avatar">
      <div class="paperdoll-avatar-img">
        <img src="./src/assets/images/cultivator_avatar_1792114545622.jpg" alt="${S.name}" referrerPolicy="no-referrer">
      </div>
      <div style="font-family:var(--font-serif); font-size:13px; color:var(--text-gold); font-weight:700; margin-top:3px;">${S.name}</div>
      <div class="small" style="color:var(--text-dim);">战力总和: <b style="color:var(--text-bright);">${totalAtk() + totalDef()}</b></div>
    </div>
  `;

  html += `<div class="gear-matrix-doll">`;

  EQUIP_SLOTS.forEach(s => {
    const id = S.equipped[s];
    let name = "点击配置";
    let sub = SLOT_NAMES[s];
    let isEquipped = !!id;

    if (id) {
      if (s === "heavenDefying") {
        const disp = getHeavenDefyingDisplay(id);
        name = disp ? disp.name : id;
        sub = "逆天造化";
      } else if (s === "pet") {
        const p = S.pets?.list?.find(pt => pt.uid === id);
        name = p ? p.name : id;
        sub = "出战灵宠";
      } else {
        const eq = findEquipById(id);
        if (eq) {
          name = eq.name;
          const stats = [];
          if (eq.atk) stats.push(`攻+${eq.atk}`);
          if (eq.def) stats.push(`防+${eq.def}`);
          sub = stats.join(" ") || SLOT_NAMES[s];
        } else {
          name = id;
        }
      }
    }

    const icon = SLOT_ICONS[s] || "⚔️";
    html += `
      <div class="gear-slot-card ${isEquipped ? 'has-item' : ''}" onclick="openSlotSelector('${s}')" title="点击配置${SLOT_NAMES[s]}">
        <div class="gear-slot-info">
          <div class="gear-slot-icon">${icon}</div>
          <div class="gear-slot-detail">
            <div class="gear-slot-meta">${SLOT_NAMES[s]}</div>
            <div class="gear-slot-name" style="${isEquipped ? '' : 'color:var(--text-muted); font-weight:normal; font-size:12px;'}">${name}</div>
            <div class="small" style="color:var(--text-dim);">${isEquipped ? sub : '空位 (点击装配)'}</div>
          </div>
        </div>
        <span class="tag" style="font-size:10px; background:#20170d; color:var(--text-gold);">更换</span>
      </div>
    `;
  });

  html += `</div></div>`;
  return html;
}

function openSlotSelector(slotKey) {
  const currentId = S.equipped[slotKey];
  let title = `选择【${SLOT_NAMES[slotKey]}】装配`;
  let body = "";

  if (currentId) {
    let curName = currentId;
    let curDesc = "";
    if (slotKey === "heavenDefying") {
      const d = getHeavenDefyingDisplay(currentId);
      if (d) { curName = d.name; curDesc = d.desc; }
    } else if (slotKey === "pet") {
      const p = S.pets?.list?.find(pt => pt.uid === currentId);
      if (p) { curName = p.name; curDesc = `境界：${REALMS[p.realm]?.name || '凡兽'}·${p.lvl}重`; }
    } else {
      const eq = findEquipById(currentId);
      if (eq) { curName = eq.name; curDesc = `攻+${eq.atk||0} 防+${eq.def||0}`; }
    }
    body += `
      <div style="background:#1e160e; border:1px solid var(--border-gold); border-radius:var(--radius-sm); padding:8px 10px; margin-bottom:10px;">
        <div style="font-size:11px; color:var(--text-dim);">当前佩戴</div>
        <div style="font-size:14px; font-weight:700; color:var(--text-gold);">${curName}</div>
        <div style="font-size:11px; color:var(--text-dim);">${curDesc}</div>
        <button class="small" style="margin-top:6px;" onclick="unequipSlotAndClose('${slotKey}')">卸下此宝</button>
      </div>
    `;
  }

  body += `<h5 style="color:var(--text-gold); margin:8px 0 4px;">背包中的可用${SLOT_NAMES[slotKey]}宝物</h5>`;
  let candidatesCount = 0;
  let candidatesHtml = "";

  if (slotKey === "heavenDefying") {
    Object.keys(S.heavenDefying.owned || {}).forEach(id => {
      if (!S.heavenDefying.owned[id]) return;
      candidatesCount++;
      const disp = getHeavenDefyingDisplay(id);
      if (!disp) return;
      candidatesHtml += `
        <div class="bag-item-tile">
          <div class="bag-item-icon-name">
            <div class="bag-item-icon">☯️</div>
            <div class="bag-item-desc-col">
              <div class="bag-item-title"><span>${disp.name}</span><span class="tag gold">逆天宝物</span></div>
              <div class="bag-item-desc">${disp.desc}</div>
            </div>
          </div>
          <button class="small" onclick="selectAndEquip('${slotKey}', '${id}', 'heaven')">装配</button>
        </div>
      `;
    });
  } else if (slotKey === "pet") {
    (S.pets?.list || []).forEach(pet => {
      if (pet.uid === S.equipped.pet) return;
      candidatesCount++;
      const talent = getPetTalent(pet.talent);
      const bloodline = getPetBloodline(pet.bloodline);
      const realmText = REALMS[pet.realm] ? REALMS[pet.realm].name : "凡兽";
      candidatesHtml += `
        <div class="bag-item-tile">
          <div class="bag-item-icon-name">
            <div class="bag-item-icon">🐾</div>
            <div class="bag-item-desc-col">
              <div class="bag-item-title"><span>${pet.name}</span><span class="tag gold">${realmText}·${pet.lvl}重</span><span class="tag">${talent.name}</span></div>
              <div class="bag-item-desc">${bloodline.name}血脉</div>
            </div>
          </div>
          <button class="small" onclick="selectAndEquip('${slotKey}', '${pet.uid}', 'pet')">出战</button>
        </div>
      `;
    });
  } else {
    let targetType = "equip";
    let targetSlotFilter = null;
    if (slotKey.startsWith("artifact")) {
      targetType = "artifact";
    } else if (slotKey.startsWith("accessory")) {
      targetSlotFilter = "accessory";
    } else {
      targetSlotFilter = slotKey;
    }

    const equippedIds = Object.values(S.equipped).filter(Boolean);
    ["equip", "artifact"].forEach(t => {
      const ids = getItemsByType(t);
      ids.forEach(id => {
        if (!hasItem(id) || equippedIds.includes(id)) return;
        const eq = ITEMS[id];
        if (!eq) return;

        let match = false;
        if (targetSlotFilter === "accessory") {
          if (eq.slot === "accessory") match = true;
        } else if (targetType === "artifact") {
          if (eq.type === "artifact" || eq.slot === "artifact") match = true;
        } else {
          if (eq.slot === targetSlotFilter) match = true;
        }

        if (!match) return;
        candidatesCount++;
        const extra = eq.spellBonus ? ` 法术+${(eq.spellBonus * 100).toFixed(0)}%` : "";
        const statLine = `攻+${eq.atk || 0} 防+${eq.def || 0}${extra}`;
        candidatesHtml += `
          <div class="bag-item-tile">
            <div class="bag-item-icon-name">
              <div class="bag-item-icon">${eq.type === 'artifact' ? '🪞' : '⚔️'}</div>
              <div class="bag-item-desc-col">
                <div class="bag-item-title"><span>${eq.name}</span><span class="tag">${SLOT_NAMES[eq.slot] || eq.slot}</span></div>
                <div class="bag-item-desc">${statLine}</div>
              </div>
            </div>
            <button class="small" onclick="selectAndEquip('${slotKey}', '${id}', 'normal')">装配</button>
          </div>
        `;
      });
    });
  }

  if (candidatesCount === 0) {
    body += `<p class="empty">背包中暂无可装配至此处的合适宝物。</p>`;
  } else {
    body += candidatesHtml;
  }

  showModal(title, body, [
    { label: "关闭", fn: () => closeModal() }
  ]);
}

function unequipSlotAndClose(slotKey) {
  if (slotKey === "pet") {
    unequipPet();
  } else {
    unequip(slotKey);
  }
  closeModal();
  renderProfile();
}

function selectAndEquip(slotKey, itemId, type) {
  if (type === "heaven") {
    equipHeavenDefying(itemId);
  } else if (type === "pet") {
    equipPet(itemId);
  } else {
    S.equipped[slotKey] = itemId;
    const item = ITEMS[itemId];
    log(`装配 ${item ? item.name : itemId} 到 ${SLOT_NAMES[slotKey] || slotKey}。`, "c-good");
    save();
  }
  closeModal();
  renderProfile();
  render();
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
   主渲染 (可滑动图文标签)
   ============================================================ */

function renderProfile() {
  if (!S) return;

  const playerInfo = getPlayerRealmInfo();
  const realmText = playerInfo.realm === 0 ? "凡胎肉体" :
    `${REALMS[playerInfo.realm].name} · ${subName(playerInfo.lvl)}${playerInfo.lvl}重`;
  const sect = S.sect ? SECTS.find(x => x.id === S.sect) : null;

  let html = `
    <div class="profile-header">
      <div class="profile-avatar">
        <img src="./src/assets/images/cultivator_avatar_1792114545622.jpg" alt="${S.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" referrerPolicy="no-referrer">
      </div>
      <div class="profile-title">
        <h3>${S.name}</h3>
        <div class="small" style="color:var(--text-gold); font-weight:600;">${realmText} · ${sect ? sect.name : "未入宗门"}</div>
      </div>
      <button class="help" onclick="closeProfile()" title="关闭">×</button>
    </div>
  `;

  const profileTabMeta = {
    "角色信息": { icon: "👤", label: "道体" },
    "心法":     { icon: "📖", label: "心法" },
    "法术":     { icon: "✨", label: "法术" },
    "装备":     { icon: "🛡️", label: "装备" },
    "背包":     { icon: "🎒", label: "背包" },
    "杂务":     { icon: "📜", label: "杂务" },
    "爱好":     { icon: "🍵", label: "爱好" },
  };

  html += `<div class="subtabs scrollable">`;
  PROFILE_TABS.forEach(t => {
    const m = profileTabMeta[t] || { icon: "🔹", label: t };
    html += `<div class="subtab ${currentProfileTab === t ? 'active' : ''}"
      onclick="switchProfileTab('${t}')">${m.icon} ${m.label}</div>`;
  });
  html += `</div>`;

  html += `<div class="profile-content">`;
  if (currentProfileTab === "角色信息") html += renderProfileInfo();
  else if (currentProfileTab === "心法") html += renderProfileHeart();
  else if (currentProfileTab === "法术") html += renderProfileSpells();
  else if (currentProfileTab === "装备") html += renderProfileEquip();
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
  if (!item || item.type !== "pill" || !item.effect) {
    if (item && item.type === "pill" && !item.effect) {
      log(`【${item.name}】效果尚未实现。`, "c-bad");
    }
    return;
  }

  /* 0 品废丹不能吃 */
  if (item.grade === 0) {
    log("废丹不能服用，只能卖。", "c-bad");
    return;
  }

  if (item.usableIn === "battle") {
    log(`【${item.name}】只能在战斗中使用。`, "c-bad");
    return;
  }

  /* 境界检查 */
  const pInfo = getPlayerRealmInfo();
  if (item.tier && item.tier > pInfo.realm + 1) {
    log(`境界不足，无法服用【${item.name}】（需 ${item.tier} 阶）`, "c-bad");
    return;
  }

  /* 丹毒衰减（5 品跳过） */
  const isGrade5 = item.grade === 5;
  const danDuMul = isGrade5 ? 1.0 : (1 - S.poison / 100 * 0.5);

  const e = item.effect;
  const detail = [];
  let consumed = false;

  switch (e.type) {
    case "heal": {
      const baseV = e.value;
      const finalV = Math.floor(baseV * danDuMul);
      if (S.hp >= totalMaxHp()) { log("气血已满。", "c-bad"); return; }
      S.hp = Math.min(totalMaxHp(), S.hp + finalV);
      detail.push(`气血 +${finalV}${danDuMul < 1 ? `（丹毒衰减 ×${danDuMul.toFixed(2)}）` : ""}`);
      consumed = true;
      break;
    }
    case "healMp": {
      const baseV = e.value;
      const finalV = Math.floor(baseV * danDuMul);
      if (S.mp >= totalMaxMp()) { log("灵力已满。", "c-bad"); return; }
      S.mp = Math.min(totalMaxMp(), S.mp + finalV);
      detail.push(`灵力 +${finalV}${danDuMul < 1 ? `（丹毒衰减 ×${danDuMul.toFixed(2)}）` : ""}`);
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
    case "cureAllNonDot": {
      const before = S.statuses.length;
      S.statuses = S.statuses.filter(s => {
        const def = getStatusDef(s.id);
        return def && def.type === "buff" || (def && def.dot);
      });
      detail.push(`解除 ${before - S.statuses.length} 个非 dot 负面`);
      consumed = true;
      break;
    }
    case "exp": {
      if (item.dailyLimit) {
        if (!S.flags.pillDaily) S.flags.pillDaily = {};
        const key = `${item.baseId}_${S.day}`;
        const used = S.flags.pillDaily[key] || 0;
        if (used >= item.dailyLimit) {
          log(`【${item.name}】今日已达上限（${item.dailyLimit} 粒）。`, "c-bad");
          return;
        }
        S.flags.pillDaily[key] = used + 1;
      }
      const finalV = Math.floor(e.value * danDuMul);
      S.exp += finalV;
      detail.push(`修为 +${fmt(finalV)}${danDuMul < 1 ? `（丹毒衰减 ×${danDuMul.toFixed(2)}）` : ""}`);
      consumed = true;
      break;
    }
    case "breakBonus": {
      if (!S.flags.pillBuff) S.flags.pillBuff = {};
      const finalV = e.value * danDuMul;
      S.flags.pillBuff.breakBonus = (S.flags.pillBuff.breakBonus || 0) + finalV;
      detail.push(`突破率 +${(finalV * 100).toFixed(0)}%（下次突破消耗）`);
      consumed = true;
      break;
    }
    case "fasting": {
      S.flags.fastingDays = (S.flags.fastingDays || 0) + Math.floor(e.days);
      detail.push(`辟谷 ${Math.floor(e.days)} 天`);
      consumed = true;
      break;
    }
    case "reduceEncounter": {
      S.flags.reduceEncounter = e.value;
      detail.push(`减少遇敌 ${(e.value * 100).toFixed(0)}%（30 天）`);
      consumed = true;
      break;
    }
    case "petFood": {
      /* 灵兽粮，由 feedPet 处理，不走 useItem */
      log(`【${item.name}】请在灵宠界面喂食。`, "c-bad");
      return;
    }
    case "petLoyalty": {
      const petUid = S.equipped.pet;
      if (!petUid) { log("没有出战灵宠。", "c-bad"); return; }
      const pet = S.pets.list.find(p => p.uid === petUid);
      if (!pet) { log("出战灵宠不存在。", "c-bad"); return; }
      if (pet.loyalty === undefined) pet.loyalty = 50;
      pet.loyalty = Math.min(100, pet.loyalty + e.value);
      detail.push(`${pet.name} 忠诚度 +${e.value}（当前 ${pet.loyalty}）`);
      consumed = true;
      break;
    }
    case "pending": {
      log(`【${item.name}】效果尚未实现。`, "c-bad");
      return;
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

  /* 丹毒累加（5 品不积累） */
  if (!isGrade5 && item.danDu > 0) {
    S.poison = Math.min(100, (S.poison || 0) + item.danDu);
    detail.push(`丹毒 +${item.danDu.toFixed(2)}（当前 ${S.poison.toFixed(2)}/100）`);
    if (S.poison >= 100) {
      detail.push("⚠ 丹毒已满，境界永久锁定！");
    }
  }

  removeItem(name, 1);
  log(`使用 ${item.name}。`, "c-good");
  save(); renderProfile(); render();

  if (detail.length > 0) {
    showActionModal(`使用 ${item.name}`, detail);
  }
}

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

  let html = "";

  if (art) {
    const curLevelData = art.levels ? art.levels.find(l => l.lvl === prog.lvl) : null;
    const need = curLevelData ? curLevelData.expNeed : 100;
    const expPct = Math.min(100, Math.round(((prog.exp || 0) / (need || 1)) * 100));
    const elName = art.element ? (ROOT_TYPES.find(r => r.id === art.element)?.name || "") : "";
    const elLvl = art.element ? calcElementLvl(prog.lvl, art.maxLvl) : 0;

    html += `
      <h4>当前运转心法</h4>
      <div class="heart-featured-card">
        <div class="heart-featured-top">
          <div>
            <span class="heart-featured-title">📖 ${art.name}</span>
            <span class="tag gold">${art.type}</span>
            ${art.category ? `<span class="tag">${art.category}</span>` : ''}
            ${elName ? `<span class="tag" style="background:#2d1e0d; color:#f0cf78;">${elName}系</span>` : ''}
          </div>
          <span class="tag good">⚡ 运转中</span>
        </div>

        <div style="margin: 6px 0;">
          <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">
            <span>${isFan ? '熟练参悟' : `心法境界: Lv.${prog.lvl} / ${art.maxLvl}`}</span>
            <span style="color:var(--text-gold);">${isFan ? prog.proficiency.toFixed(1) + '%' : `${fmt(prog.exp)} / ${fmt(need)} (${expPct}%)`}</span>
          </div>
          <div class="craft-progress-track">
            <div class="craft-progress-fill" style="width:${isFan ? prog.proficiency : expPct}%;"></div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-dim); margin-top:4px;">
          <span>契合道心: <b style="color:${match >= 80 ? '#5fb865' : 'var(--text-gold)'};">${match}%</b></span>
          ${elName ? `<span>五行增益: <b style="color:var(--text-gold);">${elName} +${elLvl}</b></span>` : ''}
          <span>熟练度: <b style="color:var(--text-bright);">${prog.proficiency.toFixed(1)}%</b></span>
        </div>

        <div class="heart-bonus-strip">
          <div class="heart-bonus-item">
            <div style="color:var(--text-dim);">威力</div>
            <div class="v">×${hb.power}</div>
          </div>
          <div class="heart-bonus-item">
            <div style="color:var(--text-dim);">攻击</div>
            <div class="v">+${hb.atk}</div>
          </div>
          <div class="heart-bonus-item">
            <div style="color:var(--text-dim);">防御</div>
            <div class="v">+${hb.def}</div>
          </div>
          <div class="heart-bonus-item">
            <div style="color:var(--text-dim);">气血</div>
            <div class="v">+${hb.hp}</div>
          </div>
          <div class="heart-bonus-item">
            <div style="color:var(--text-dim);">灵力</div>
            <div class="v">+${hb.mp}</div>
          </div>
        </div>
      </div>
    `;
  } else {
    html += `
      <h4>当前运转心法</h4>
      <div class="card" style="text-align:center; padding:12px;">
        <p class="empty" style="margin:0;">暂未运转心法，请在下方点击心法【运转】。</p>
      </div>
    `;
  }

  html += `<h4>五行心境属性</h4>
    <div class="element-mastery-strip">
      ${ROOT_TYPES.map(r => {
        const v = S.elementLvl ? (S.elementLvl[r.id] || 0) : 0;
        const colors = { jin: "#f0cf78", mu: "#5fb865", shui: "#5da8eb", huo: "#db4c3b", tu: "#c29153" };
        return `<div class="element-mastery-chip">
          <span class="el-name" style="color:${colors[r.id] || 'var(--text-dim)'};">${r.name}</span>
          <span class="el-val">${v}</span>
        </div>`;
      }).join("")}
    </div>`;

  html += `<h4>已学心法宝库</h4>`;
  if (!S.heartArts.learned || S.heartArts.learned.length === 0) {
    html += `<p class="empty">尚未习得任何心法，可前往宗门藏经阁或探索机缘寻觅秘籍。</p>`;
  } else {
    html += `<div class="heart-learned-grid">`;
    S.heartArts.learned.forEach(artId => {
      const a = HEART_ARTS.find(x => x.id === artId);
      if (!a) return;
      const p = getArtProgress(artId);
      const isCurrent = S.heartArts.current === artId;
      const el = a.element ? ROOT_TYPES.find(r => r.id === a.element)?.name : null;

      html += `
        <div class="heart-learned-card ${isCurrent ? 'is-active' : ''}">
          <div class="heart-learned-header">
            <span class="heart-learned-title">
              <span>${a.name}</span>
            </span>
            ${isCurrent
              ? '<span class="tag good">使用中</span>'
              : `<button class="small" onclick="switchHeartArt('${artId}')">运转</button>`}
          </div>
          <div class="heart-learned-meta">
            <span class="tag">${a.type}</span>
            ${el ? `<span class="tag" style="color:#f0cf78;">${el}</span>` : ''}
            <span>${p.lvl === 0 ? `熟练 ${p.proficiency.toFixed(0)}%` : `Lv.${p.lvl}/${a.maxLvl}`}</span>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  return html;
}

/* ============================================================
   法术（可筛选 + 紧凑图文条目）
   ============================================================ */

function renderProfileSpells() {
  let html = "";

  const spellFilters = [
    { id: "all", name: "全部" },
    { id: "jian", name: "🗡️ 剑法" },
    { id: "quan", name: "👊 拳掌" },
    { id: "dao", name: "🔪 刀棍" },
    { id: "general", name: "✨ 通用" },
    { id: "skills", name: "📜 百艺" },
  ];

  html += `<div class="filter-pills-bar">`;
  spellFilters.forEach(f => {
    html += `<button type="button" class="filter-pill ${currentSpellFilter === f.id ? 'active' : ''}" onclick="switchSpellFilter('${f.id}')">${f.name}</button>`;
  });
  html += `</div>`;

  if (currentSpellFilter !== "skills") {
    const learnedSpells = listLearnedSpells();
    let filteredSpells = learnedSpells;

    if (currentSpellFilter === "jian") {
      filteredSpells = learnedSpells.filter(s => s.type === "剑");
    } else if (currentSpellFilter === "quan") {
      filteredSpells = learnedSpells.filter(s => s.type === "拳" || s.type === "掌");
    } else if (currentSpellFilter === "dao") {
      filteredSpells = learnedSpells.filter(s => s.type === "刀" || s.type === "棍");
    } else if (currentSpellFilter === "general") {
      filteredSpells = learnedSpells.filter(s => s.type === "通用" || !["剑", "拳", "掌", "刀", "棍"].includes(s.type));
    }

    html += `<h4>已学通玄法术 (${filteredSpells.length})</h4>`;
    if (filteredSpells.length === 0) {
      html += `<p class="empty">此门类下暂无修习法术。</p>`;
    } else {
      filteredSpells.forEach(sp => {
        const usable = canUseSpell(sp.id);
        const icon = SPELL_ICONS[sp.type] || "✨";
        const tl = {
          enemySingle: "敌单", enemyAll: "敌全",
          allySingle: "我单", allyAll: "我全", all: "全体",
        }[sp.target || "enemySingle"] || "敌单";

        html += `
          <div class="spell-tile-compact">
            <div class="spell-tile-left">
              <div class="spell-icon-box">${icon}</div>
              <div class="spell-tile-main">
                <div class="spell-tile-top">
                  <span class="spell-name">${sp.name}</span>
                  <span class="tag">${tl}</span>
                  <span class="spell-cost-chip">💧 ${sp.cost.mp}</span>
                  <span class="spell-power-chip">💥 ×${sp.power}</span>
                </div>
                <div class="spell-desc-line" title="${sp.desc}">${sp.desc}</div>
              </div>
            </div>
            <div style="flex-shrink:0;">
              ${usable.ok ? '<span class="tag good">可用</span>' : `<span class="tag bad">${usable.reason}</span>`}
            </div>
          </div>
        `;
      });
    }
  }

  if (currentSpellFilter === "all" || currentSpellFilter === "skills") {
    html += `<h4>百艺修道造诣</h4>`;
    html += `<div class="craft-micro-grid">`;
    SKILLS.forEach(k => {
      const sk = S.skills[k] || { lvl: 0, exp: 0 };
      const icon = SKILL_ICONS[k] || "📜";
      html += `
        <div class="craft-micro-card">
          <div class="craft-micro-header">
            <span class="craft-micro-title">
              <span>${icon}</span>
              <span>${k}</span>
            </span>
            <span class="craft-micro-lvl">Lv.${sk.lvl}</span>
          </div>
          <div class="craft-progress-track">
            <div class="craft-progress-fill" style="width:${sk.exp || 0}%;"></div>
          </div>
          <div style="font-size:10px; color:var(--text-dim); text-align:right;">${(sk.exp || 0).toFixed(1)}/100</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  return html;
}

/* ============================================================
   杂务（2列看板式微卡片）
   ============================================================ */

function renderProfileChores() {
  const all = [...CHORES_FAN, ...CHORES_MENWAI, ...CHORES_MENNEI];
  return `
    <h4>仙门劳作与杂务熟练</h4>
    <div class="chore-dashboard-grid">
      ${all.map(c => {
        const v = S.choreSkill[c.id] || 0;
        const icon = CHORE_ICONS[c.id] || "📜";
        const isMaster = v >= 80;
        const stage = v >= 100 ? "大圆满" : v >= 60 ? "精通" : v >= 30 ? "熟练" : "初涉";
        return `
          <div class="chore-dash-card ${isMaster ? 'mastered' : ''}">
            <div class="chore-dash-icon">${icon}</div>
            <div class="chore-dash-info">
              <div class="chore-dash-title-row">
                <span class="chore-dash-title">${c.name}</span>
                <span class="chore-dash-pct">${v.toFixed(1)}%</span>
              </div>
              <div class="craft-progress-track">
                <div class="craft-progress-fill" style="width:${Math.min(100, v)}%;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-dim); margin-top:2px;">
                <span>耗时 ${c.baseTime}时</span>
                <span style="color:${isMaster ? 'var(--text-gold)' : 'var(--text-dim)'};">${stage}</span>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

/* ============================================================
   爱好
   ============================================================ */

function renderProfileHobbies() {
  if (!S.hobbies || S.hobbies.length === 0) {
    return `
      <h4>道心雅趣</h4>
      <p class="empty">尚无涉猎之闲情雅致。可在日常生活中机缘顿悟。</p>
    `;
  }

  let html = `<h4>已修雅趣（最多 3 门）</h4>`;
  S.hobbies.forEach(h => {
    const v = S.hobbySkill[h] || 0;
    const icon = HOBBY_ICONS[h] || "🍵";
    const quote = (typeof HOBBY_QUOTES !== "undefined" && HOBBY_QUOTES[h]) ? HOBBY_QUOTES[h] : "修身养性，道法自然。";

    html += `
      <div class="hobby-feature-card">
        <div class="hobby-feature-icon">${icon}</div>
        <div class="hobby-feature-body">
          <div class="hobby-feature-title-row">
            <span class="hobby-feature-name">${h}</span>
            <span class="hobby-feature-score">造诣: ${v.toFixed(1)}</span>
          </div>
          <div class="craft-progress-track">
            <div class="craft-progress-fill" style="width:${Math.min(100, v * 2)}%;"></div>
          </div>
          <div class="hobby-feature-quote">「${quote}」</div>
        </div>
      </div>
    `;
  });

  html += `<p class="small" style="color:var(--text-dim); margin-top:4px;">💡 爱好在晚餐后自发触发修习（35%几率），消耗 1 行动，能有效舒缓心绪，提升心境。</p>`;

  const unlearnedHobbies = (typeof ALL_HOBBIES !== "undefined" ? ALL_HOBBIES : []).filter(h => !S.hobbies.includes(h));
  if (unlearnedHobbies.length > 0) {
    html += `<h4>涉猎百雅</h4>
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
        ${unlearnedHobbies.map(h => {
          const icon = HOBBY_ICONS[h] || "🔹";
          return `<div class="tag" style="background:#151009; border:1px solid #302416; padding:3px 8px;">${icon} ${h}</div>`;
        }).join("")}
      </div>`;
  }

  return html;
}

/* ============================================================
   背包（7 tab + 紧凑图文条目）
   ============================================================ */

function renderProfileBag() {
  const bagTabIcons = {
    "丹药": "💊",
    "材料": "🌿",
    "装备": "⚔️",
    "秘籍": "📜",
    "逆天宝物": "☯️",
    "任务道具": "🏷️",
    "其他": "📦",
  };

  let html = `<div class="subtabs scrollable">`;
  BAG_TABS.forEach(t => {
    const icon = bagTabIcons[t] || "📦";
    html += `<div class="subtab ${currentBagTab === t ? 'active' : ''}" onclick="switchBagTab('${t}')">${icon} ${t}</div>`;
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

/* ============================================================
   ★ 补回：renderInventoryByType + renderItemActions ★
   ============================================================ */

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

  let html = shortTitle ? `<h5 style="color:var(--text-gold); margin:8px 0 4px;">${typeNames[type] || type}</h5>` : "";

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
    const icon = ITEM_TYPE_ICONS[item.type] || "📦";

    let gradeTag = "";
    if (item.grade) {
      gradeTag = ` <span class="tag gold">${item.grade}品</span>`;
    }

    html += `
      <div class="bag-item-tile">
        <div class="bag-item-icon-name">
          <div class="bag-item-icon">${icon}</div>
          <div class="bag-item-desc-col">
            <div class="bag-item-title">
              <span>${item.name}</span>
              ${gradeTag}
              <span class="tag" style="background:#20170d; color:var(--text-bright);">×${count}</span>
            </div>
            <div class="bag-item-desc" title="${item.desc || ''}">${item.desc || ""}</div>
          </div>
        </div>
        <div style="flex-shrink:0;">
          ${renderItemActions(id, item)}
        </div>
      </div>
    `;
  });

  return html;
}

function renderItemActions(id, item) {
  if (item.type === "pill") {
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
    return `<p class="empty">尚未收服灵宠，可在历练或机缘中收服伴生灵兽。</p>`;
  }

  const equippedUid = S.equipped.pet;

  return S.pets.list.map(pet => {
    const isEquipped = pet.uid === equippedUid;
    const stats = getPetStats(pet);
    const talent = getPetTalent(pet.talent);
    const bloodline = getPetBloodline(pet.bloodline);
    const realmText = REALMS[pet.realm] ? REALMS[pet.realm].name : "凡兽";
    const need = petExpNeed(pet.lvl);

    return `
      <div class="bag-item-tile ${isEquipped ? 'has-item' : ''}" style="${isEquipped ? 'border-color:var(--border-gold); background:linear-gradient(180deg,#1c150c,#130e08);' : ''}">
        <div class="bag-item-icon-name">
          <div class="bag-item-icon">🐾</div>
          <div class="bag-item-desc-col">
            <div class="bag-item-title">
              <span>${pet.name}</span>
              <span class="tag gold">${realmText}·${pet.lvl}重</span>
              <span class="tag">${talent.name}</span>
              ${isEquipped ? '<span class="tag good">出战中</span>' : ''}
            </div>
            <div class="bag-item-desc">
              ${bloodline.name}血脉 · 攻${stats ? stats.atk : 0} 防${stats ? stats.def : 0} 速${stats ? stats.speed : 0} 血${stats ? stats.hpMax : 0}
            </div>
          </div>
        </div>
        <div style="flex-shrink:0; display:flex; gap:4px;">
          ${!isEquipped
            ? `<button class="small" onclick="equipPet('${pet.uid}')">出战</button>`
            : `<button class="small" onclick="unequipPet()">休息</button>`}
          ${pet.lvl >= 10
            ? `<button class="small" onclick="breakPet('${pet.uid}')">突破</button>`
            : ""}
        </div>
      </div>
    `;
  }).join("");
}