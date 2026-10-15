/* ============================================================
   systems/pets.js - 灵宠系统
   ============================================================ */

/* ============================================================
   生成灵宠（收服时）
   ============================================================ */

function genPet(defId, name) {
  const talent = randomPetTalent();
  const bloodline = pick(PET_BLOODLINES);

  return {
    uid: "pet_" + S.pets.nextUid++,
    defId: defId,
    name: name,
    talent: talent.id,
    bloodline: bloodline.id,
    lvl: 1,
    realm: 0,
    exp: 0,
    hp: null,
    hunger: 100,
    foodStorage: {},
  };
}

/* ============================================================
   属性计算
   ============================================================ */

function getPetStats(pet) {
  const base = getEnemyById(pet.defId);
  if (!base) return null;

  const talent = getPetTalent(pet.talent);
  const bloodline = getPetBloodline(pet.bloodline);

  const lvlScale = 1 + (pet.lvl - 1) * 0.2;
  const realmScale = Math.pow(1.6, pet.realm);
  const scale = lvlScale * realmScale * talent.growth;

  let hpMax = Math.floor(base.hp * scale);
  let mpMax = Math.floor((base.mp || 0) * scale);
  let atk = Math.floor(base.atk * scale);
  let def = Math.floor(base.def * scale);
  let speed = Math.floor((base.speed || 10) * (1 + (pet.lvl - 1) * 0.05));

  /* 饥饿度修正 */
  const hunger = pet.hunger !== undefined ? pet.hunger : 100;
  let hungerMod = 0;
  if (hunger >= 80) hungerMod = 0;
  else if (hunger >= 40) hungerMod = -0.1;
  else hungerMod = -0.3;

  atk = Math.max(1, Math.floor(atk * (1 + hungerMod)));
  def = Math.max(0, Math.floor(def * (1 + hungerMod)));
  speed = Math.max(1, Math.floor(speed * (1 + hungerMod)));

  /* 抗性 */
  const resistances = Object.assign({}, base.resistances || {});
  for (const k in bloodline.resistBonus) {
    resistances[k] = (resistances[k] || 0) + bloodline.resistBonus[k];
  }
  for (const k in resistances) {
    resistances[k] = Math.max(-100, Math.min(100, resistances[k]));
  }

  return {
    name: pet.name,
    lvl: pet.lvl,
    realm: pet.realm,
    hpMax, mpMax, atk, def, speed,
    skills: base.skills || [],
    spells: base.spells || [],
    resistances,
    bloodline,
    talent,
  };
}

/* ============================================================
   战斗单位构造
   ============================================================ */

function buildPetUnit() {
  const petUid = S.equipped.pet;
  if (!petUid) return null;

  const pet = S.pets.list.find(p => p.uid === petUid);
  if (!pet) return null;

  const stats = getPetStats(pet);
  if (!stats) return null;

  if (pet.hp !== null && pet.hp <= 0) return null;

  const curHp = pet.hp !== null ? Math.min(pet.hp, stats.hpMax) : stats.hpMax;

  return {
    id: "pet_" + pet.uid,
    side: "player",
    isPet: true,
    petUid: pet.uid,
    name: pet.name,
    realm: stats.realm,
    sub: stats.lvl,

    hp: curHp,
    hpMax: stats.hpMax,
    mp: stats.mpMax,
    mpMax: stats.mpMax,
    atk: stats.atk,
    def: stats.def,
    speed: stats.speed,
    luck: 5,

    skills: stats.skills,
    spells: stats.spells,
    items: {},
    resistances: stats.resistances,
    statuses: [],

    alive: true,
    defending: false,
  };
}

/* ============================================================
   召唤
   ============================================================ */

function doSummon(caster, skillId) {
  const skill = getSummonSkill(skillId);
  if (!skill) return;
  if (caster.mp < skill.cost.mp) {
    logBattle("灵力不足");
    return;
  }

  if (battle.units.some(u => u.isPet && u.alive)) {
    logBattle("灵宠已在场上");
    return;
  }

  const petUnit = buildPetUnit();
  if (!petUnit) {
    logBattle("没有可出战的灵宠");
    return;
  }

  caster.mp -= skill.cost.mp;

  battle.units.push(petUnit);
  battle.pendingPets = battle.pendingPets || [];
  battle.pendingPets.push(petUnit);

  logBattle(`${caster.name} 使用【${skill.name}】，${petUnit.name} 即将出战！`);
}

function applyPendingPets() {
  if (!battle || !battle.pendingPets) return;
  if (battle.pendingPets.length === 0) return;

  battle.pendingPets.forEach(p => {
    logBattle(`${p.name} 加入战斗！`);
  });
  battle.pendingPets = [];

  battle.order = battle.units
    .filter(u => u.alive && !u.escaped && !u.tamed)
    .sort((a, b) => getEffectiveSpeed(b) - getEffectiveSpeed(a));
}

/* ============================================================
   灵宠 AI（回合自动）
   ============================================================ */

function petTurn(u) {
  if (!battle || !u.alive) return;

  const action = choosePetAction(u);

  switch (action.type) {
    case "attack": doAttack(u); break;
    case "spell":  doSpell(u, action.spellId); break;
    case "skill":  doSkill(u, action.skillId); break;
    case "defend": doDefend(u); break;
  }

  processTurnEnd(u);
  if (battle && !checkBattleEnd()) {
    renderBattle();
    advanceTurn();
  }
}

function choosePetAction(u) {
  if (u.spells.length > 0 && u.mp >= 20 && chance(0.3)) {
    const sid = pick(u.spells);
    const sp = getSpell(sid);
    if (sp && u.mp >= sp.cost.mp) {
      return { type: "spell", spellId: sid };
    }
  }
  if (u.skills.length > 0 && chance(0.3)) {
    const sid = pick(u.skills);
    const sk = getCombatSkill(sid);
    if (sk) {
      return { type: "skill", skillId: sid };
    }
  }
  return { type: "attack" };
}

/* ============================================================
   战后处理
   ============================================================ */

function handlePetsAfterBattle(battleUnits, killedEnemies) {
  if (!S.pets || !S.pets.list) return [];

  const deadPets = [];

  battleUnits.forEach(u => {
    if (!u.isPet) return;
    const pet = S.pets.list.find(p => p.uid === u.petUid);
    if (!pet) return;

    if (u.alive) {
      pet.hp = u.hp;

      let petExp = 0;
      killedEnemies.forEach(e => {
        petExp += Math.floor((e.exp || 0) * 0.5);
      });
      if (petExp > 0) {
        pet.exp += petExp;
        let need = petExpNeed(pet.lvl);
        while (pet.exp >= need && pet.lvl < 10) {
          pet.exp -= need;
          pet.lvl++;
          need = petExpNeed(pet.lvl);
        }
      }
    } else {
      pet.hp = 0;
      deadPets.push(pet);
    }
  });

  if (deadPets.length > 0) {
    S.pets.list = S.pets.list.filter(p => !deadPets.includes(p));
    if (deadPets.some(p => p.uid === S.equipped.pet)) {
      S.equipped.pet = null;
    }
    return deadPets;
  }

  return [];
}

/* ============================================================
   灵宠突破
   ============================================================ */

function canBreakPet(pet) {
  if (pet.lvl < 10) return { ok: false, reason: "需 Lv.10 圆满" };

  const talent = getPetTalent(pet.talent);
  if (pet.realm >= talent.maxRealm) {
    return { ok: false, reason: `天赋所限，最高${REALMS[talent.maxRealm].name}期` };
  }

  /* petBreak 材料按 realm 找 */
  const petBreakId = "petBreak_" + (pet.realm + 1);
  const item = ITEMS[petBreakId];
  if (!item) return { ok: false, reason: "无法突破" };

  const have = S.inventory[petBreakId] || 0;
  if (have < 1) {
    return { ok: false, reason: `需 ${item.name} ×1（当前 ${have}）` };
  }

  return { ok: true, itemId: petBreakId, item };
}

function breakPet(petUid) {
  const pet = S.pets.list.find(p => p.uid === petUid);
  if (!pet) return;

  const check = canBreakPet(pet);
  if (!check.ok) { log(`灵宠突破失败：${check.reason}`, "c-bad"); return; }

  removeItem(check.itemId, 1);

  pet.realm++;
  pet.lvl = 1;
  pet.exp = 0;
  pet.hp = null;

  const realmName = REALMS[pet.realm].name;
  log(`【灵宠突破】${pet.name} 突破到 ${realmName}期！`, "c-gold");
  save(); renderProfile();
  showActionModal("灵宠突破成功", [
    `${pet.name} 达到 ${realmName}·1重`,
    `消耗 ${check.item.name} ×1`,
  ]);
}

/* ============================================================
   出战 / 休息
   ============================================================ */

function equipPet(uid) {
  const pet = S.pets.list.find(p => p.uid === uid);
  if (!pet) return;
  if (pet.hp !== null && pet.hp <= 0) {
    log("灵宠已重伤，无法出战", "c-bad");
    return;
  }
  S.equipped.pet = uid;
  log(`【灵宠】${pet.name} 出战。`, "c-gold");
  save(); renderProfile();
}

function unequipPet() {
  S.equipped.pet = null;
  log("收回灵宠。", "c-normal");
  save(); renderProfile();
}

/* 每天处理灵宠 */
function processDailyPets() {
  if (!S.pets || !S.pets.list) return [];

  const deadPets = [];

  S.pets.list.forEach(pet => {
    if (pet.hunger === undefined) pet.hunger = 100;
    if (!pet.foodStorage) pet.foodStorage = {};

    pet.hunger = Math.max(0, pet.hunger - rndInt(5, 20));

    const foods = ["food_high", "food_mid", "food_low"];
    for (const fid of foods) {
      while (pet.hunger < 100 && (pet.foodStorage[fid] || 0) > 0) {
        const food = ITEMS[fid];
        if (!food) break;
        pet.foodStorage[fid]--;
        if (pet.foodStorage[fid] <= 0) delete pet.foodStorage[fid];
        pet.hunger += food.hunger;
        if (pet.hunger > 100) pet.hunger = 100;
      }
    }

    if (pet.hunger <= 0) {
      deadPets.push(pet);
    }
  });

  if (deadPets.length > 0) {
    S.pets.list = S.pets.list.filter(p => !deadPets.includes(p));
    if (deadPets.some(p => p.uid === S.equipped.pet)) {
      S.equipped.pet = null;
    }
  }

  return deadPets;
}

/* 把 1 个兽粮放进灵宠存储 */
function feedPet(uid, foodId) {
  const pet = S.pets.list.find(p => p.uid === uid);
  if (!pet) return;
  const food = ITEMS[foodId];
  if (!food || food.type !== "food") return;

  const have = S.inventory[foodId] || 0;
  if (have <= 0) { log("没有这种兽粮。", "c-bad"); return; }

  removeItem(foodId, 1);

  if (!pet.foodStorage) pet.foodStorage = {};
  pet.foodStorage[foodId] = (pet.foodStorage[foodId] || 0) + 1;

  log(`给 ${pet.name} 放入 1 个${food.name}。`, "c-good");
  save(); render();
}

function renamePet(uid, newName) {
  const pet = S.pets.list.find(p => p.uid === uid);
  if (!pet) return;
  newName = (newName || "").trim().slice(0, 8);
  if (!newName) return;
  pet.name = newName;
  log(`灵宠改名为 ${newName}。`, "c-good");
  save(); render();
}

function buyPetFood(foodId) {
  const food = ITEMS[foodId];
  if (!food || food.type !== "food") return;
  if (!spendCurrency(food.price)) { log("钱不够。", "c-bad"); return; }
  addItem(foodId, 1);
  log(`购买 ${food.name} ×1。`, "c-good");
  save(); render();
}