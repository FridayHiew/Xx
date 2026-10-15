/* ============================================================
   ui/cave.js - 洞府页面
   ============================================================ */

function getCaveTabs() {
  const sectSummon = {
    wanshou: { id: "pet", name: "灵兽" },
    xuemou:  { id: "blood", name: "血脉" },
    youming: { id: "soul", name: "招魂" },
    tianji:  { id: "puppet", name: "机关" },
  };

  const summon = sectSummon[S.sect] || { id: "sword", name: "仙剑" };
  const alchemyUnlocked = (typeof isAlchemyUnlocked === "function")
    ? isAlchemyUnlocked()
    : ((S.cave && S.cave.alchemy) || 0) >= 1;

  return [
    { id: "facility", name: "洞府设施", locked: false },
    { id: "alchemy",  name: "炼丹房",   locked: !alchemyUnlocked },
    { id: summon.id,  name: summon.name, locked: summon.id !== "pet" },
  ];
}

function switchCaveTab(t) {
  currentCaveTab = t;
  render();
}

/* ========== 灵兽页 ========== */

function renderCavePet() {
  if (!S.pets || !S.pets.list || S.pets.list.length === 0) {
    return `<p class="empty">尚未收服灵宠。</p>`;
  }
  return S.pets.list.map(pet => renderPetCard(pet)).join("");
}

function renderPetCard(pet) {
  const stats = getPetStats(pet);
  const talent = getPetTalent(pet.talent);
  const bloodline = getPetBloodline(pet.bloodline);
  const realmText = REALMS[pet.realm] ? REALMS[pet.realm].name : "凡人";
  const need = petExpNeed(pet.lvl);
  const equipped = S.equipped.pet === pet.uid;
  const hungerPct = Math.max(0, Math.min(100, pet.hunger || 0));

  const foods = ["food_low", "food_mid", "food_high"].map(fid => {
    const f = ITEMS[fid];
    if (!f) return "";
    const count = (pet.foodStorage && pet.foodStorage[fid]) || 0;
    return `<div class="small">${f.name}：${count}</div>`;
  }).join("");

  return `<div class="card">
    <b>${pet.name}</b>
    <span class="tag">${talent.name}</span>
    <span class="tag">${bloodline.name}血脉</span>
    ${equipped ? '<span class="tag good">出战</span>' : ''}

    <div class="small">境界：${realmText}·${pet.lvl}重</div>
    <div class="small">修为：${pet.exp}/${need}</div>

    <div class="bar-row">
      <span class="label">饥饿</span>
      <div class="bar-wrap"><div class="bar-fill" style="width:${hungerPct}%;background:#e8a040;"></div>
        <div class="bar-text">${Math.floor(pet.hunger || 0)}/100</div></div>
    </div>

    ${stats ? `<div class="small">攻 ${stats.atk}　防 ${stats.def}　速 ${stats.speed}　血 ${stats.hpMax}</div>` : ""}

    <div class="small" style="margin-top:4px;">兽粮：</div>
    ${foods}

    <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;">
      <button onclick="openPetDetail('${pet.uid}')">详细</button>
      <button onclick="openPetRename('${pet.uid}')">改名</button>
      <button onclick="openPetFeed('${pet.uid}')">喂食</button>
      ${pet.lvl >= 10 ? `<button onclick="breakPet('${pet.uid}')">突破</button>` : ""}
      ${!equipped
        ? `<button onclick="equipPet('${pet.uid}')">出战</button>`
        : `<button onclick="unequipPet()">休息</button>`}
    </div>
  </div>`;
}

/* ========== 详细 ========== */

function openPetDetail(uid) {
  const pet = S.pets.list.find(p => p.uid === uid);
  if (!pet) return;
  const stats = getPetStats(pet);
  const talent = getPetTalent(pet.talent);
  const bloodline = getPetBloodline(pet.bloodline);
  const realmText = REALMS[pet.realm] ? REALMS[pet.realm].name : "凡人";

  const resistHtml = Object.keys(stats.resistances || {}).map(k => {
    const def = getStatusDef(k);
    const name = def ? def.name : k;
    const v = stats.resistances[k];
    return `<div class="row"><span>${name}抗性</span><b>${resistLabel(v)}（${v}）</b></div>`;
  }).join("");

  showModal("灵宠详细", `
    <h4>${pet.name}</h4>
    <div class="card">
      <div class="row"><span>天赋</span><b>${talent.name}（${talent.desc}）</b></div>
      <div class="row"><span>血脉</span><b>${bloodline.name}</b></div>
      <div class="row"><span>境界</span><b>${realmText}·${pet.lvl}重</b></div>
      <div class="row"><span>修为</span><b>${pet.exp}/${petExpNeed(pet.lvl)}</b></div>
      <div class="row"><span>饥饿</span><b>${Math.floor(pet.hunger || 0)}/100</b></div>
    </div>
    <h4>属性</h4>
    <div class="card">
      <div class="row"><span>攻</span><b>${stats.atk}</b></div>
      <div class="row"><span>防</span><b>${stats.def}</b></div>
      <div class="row"><span>速</span><b>${stats.speed}</b></div>
      <div class="row"><span>气血</span><b>${stats.hpMax}</b></div>
      <div class="row"><span>灵力</span><b>${stats.mpMax}</b></div>
    </div>
    <h4>抗性</h4>
    <div class="card">${resistHtml || "<p class='empty'>无</p>"}</div>
  `, [{ label: "关闭", fn: closeModal }]);
}

/* ========== 改名 ========== */

function openPetRename(uid) {
  const pet = S.pets.list.find(p => p.uid === uid);
  if (!pet) return;

  showModal("改名", `
    <p>当前名字：${pet.name}</p>
    <input id="petNameInput" value="${pet.name}" maxlength="8" style="width:100%;padding:6px;">
    <p class="small">最多 8 个字</p>
  `, [
    { label: "确定", fn: () => {
        const name = document.getElementById("petNameInput").value;
        renamePet(uid, name);
        closeModal();
      } },
    { label: "取消", fn: closeModal },
  ]);
}

/* ========== 喂食 ========== */

function openPetFeed(uid) {
  const pet = S.pets.list.find(p => p.uid === uid);
  if (!pet) return;

  const allFoods = getAllItemsByType("food");
  const availableFoods = allFoods.map(f => {
    const have = S.inventory[f.id] || 0;
    const stored = (pet.foodStorage && pet.foodStorage[f.id]) || 0;
    return `<div class="row">
      <span>${f.name}（+${f.hunger}）</span>
      <span>背包 ${have}　库存 ${stored}
        <button onclick="feedPet('${uid}', '${f.id}')" ${have <= 0 ? "disabled" : ""}>放入 1</button>
      </span>
    </div>`;
  }).join("");

  showModal("喂食 " + pet.name, `
    <p>当前饥饿度：${Math.floor(pet.hunger || 0)}/100</p>
    <h4>放入兽粮</h4>
    <div class="card">${availableFoods}</div>
  `, [{ label: "关闭", fn: closeModal }]);
}

/* ========== 买兽粮 ========== */

function openBuyPetFood() {
  const cur = getCurrency();
  const allFoods = getAllItemsByType("food");
  const html = allFoods.map(f => {
    return `<div class="row">
      <span>${f.name}（+${f.hunger}）</span>
      <span>
        <button onclick="buyPetFood('${f.id}')" ${cur < f.price ? "disabled" : ""}>
          ${f.price} ${currencyName()}
        </button>
      </span>
    </div>`;
  }).join("");

  showModal("购买兽粮", `
    <p>当前${currencyName()}：${cur}</p>
    <div class="card">${html}</div>
  `, [{ label: "关闭", fn: closeModal }]);
}

/* ============================================================
   炼丹房 UI
   ============================================================ */

function renderCaveAlchemy() {
  /* 依赖 alchemy.js，如果没加载，提示 */
  if (typeof isAlchemyUnlocked !== "function") {
    return `<p class="empty">炼丹系统未加载。</p>`;
  }

  if (!isAlchemyUnlocked()) {
    return `<p class="empty">炼丹房尚未解锁，请先在洞府设施中升级。</p>`;
  }

  const caveLv = getAlchemyCaveLv();
  const skillLv = getAlchemySkillLv();
  const output = calcAlchemyOutput();
  const moodEmoji = MOOD_EMOJI[S.mood + 2];
  const moodName = MOOD_NAMES[S.mood + 2];

  /* 产出构成展示 */
  const caveBonus = caveLv >= 1 ? (caveLv - 1) * 0.5 : 0;
  let skillBonus = 0;
  if (skillLv >= 9) skillBonus = 2;
  else if (skillLv >= 6) skillBonus = 1;
  else if (skillLv >= 3) skillBonus = 0.5;

  let html = `<h4>炼丹房 Lv.${caveLv}</h4>
    <div class="card">
      <div class="row"><span>炼丹房加成</span><b>+${caveBonus.toFixed(1)} 粒</b></div>
      <div class="row"><span>炼丹技能 Lv.${skillLv}</span><b>+${skillBonus.toFixed(1)} 粒</b></div>
      <div class="row"><span>心情 ${moodName} ${moodEmoji}</span><b>${S.mood >= 1 ? "+0.5 粒" : "无"}</b></div>
      <div class="row"><span>最大产出</span><b>${output} 粒</b></div>
    </div>`;

  /* RECIPES 可能来自 data/recipes.js */
  if (typeof RECIPES === "undefined" || !RECIPES) {
    return html + `<p class="empty">丹方数据未加载。</p>`;
  }

  /* 已解锁的丹方 */
  const knownRecipes = RECIPES.filter(r => isRecipeKnown(r.id));

  html += `<h4>丹方列表</h4>`;
  html += `<p class="small">已解锁 ${knownRecipes.length} / ${RECIPES.length} 个丹方</p>`;
  html += `<p class="small">未解锁的丹方请到宗门【丹方阁】购买。</p>`;

  if (knownRecipes.length === 0) {
    html += `<p class="empty">尚未解锁任何丹方。</p>`;
    return html;
  }

  knownRecipes.forEach(recipe => {
    /* 配方文本 */
    const matText = Object.entries(recipe.mat)
      .map(([base, cnt]) => `${base} ×${cnt}`).join(" + ");

    /* 检查 1 品是否有材料，用于提示 */
    const checkOne = checkAlchemyMaterial(recipe.id, 1, 1);
    const anyMaterial = checkOne.ok;

    html += `<div class="card">
      <div class="row">
        <span>
          <b>${recipe.name}</b>
          <button class="help" onclick="showRecipeDetail('${recipe.id}')" title="查看各品级">?</button>
        </span>
        <span>
          ${anyMaterial
            ? `<button onclick="showRecipeGradeSelect('${recipe.id}')">炼</button>`
            : `<span class="small" style="color:#d05a4a;">材料不足</span>`}
        </span>
      </div>
      <div class="small">配方：${matText}</div>
      <div class="small">可炼：1 ~ ${recipe.maxGrade} 品　基础成功率：${(recipe.rate * 100).toFixed(0)}%</div>
      <div class="small">${recipe.desc || ""}</div>
    </div>`;
  });

  return html;
}