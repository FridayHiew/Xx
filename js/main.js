/* ============================================================
   main.js - 启动入口
   ============================================================ */

/* ============================================================
   旧档迁移
   ============================================================ */

function migrateInventory(S) {
  if (!S.inventory) S.inventory = {};

  const merge = (obj) => {
    if (!obj) return;
    for (const k in obj) {
      if (!obj[k]) continue;
      const n = (typeof obj[k] === "number") ? obj[k] : 1;
      S.inventory[k] = (S.inventory[k] || 0) + n;
    }
  };

  merge(S.items);
  merge(S.mat);
  merge(S.equips);
  merge(S.fragments);
  if (S.artifacts && S.artifacts.owned) merge(S.artifacts.owned);

  delete S.items;
  delete S.mat;
  delete S.equips;
  delete S.fragments;
  delete S.artifacts;
  delete S.mounts;
}

/* ============================================================
   启动
   ============================================================ */

function boot() {
  initCreationPanel();

  const saved = loadSave();
  if (saved) {
    if (!saved.heartArts) {
      log("存档版本过旧，请重开一生。", "c-bad");
      localStorage.removeItem(SAVE_KEY);
      return;
    }

    S = saved;

    /* ===== 旧档迁移 ===== */
    migrateInventory(S);

    /* ===== 基础字段兜底 ===== */
    if (!S.inventory) S.inventory = {};
    if (!S.tools) S.tools = {};
    if (!S.hobbies) S.hobbies = [];
    if (!S.hobbySkill) S.hobbySkill = {};

    /* ===== 本心 ===== */
    if (S.morality === undefined) {
      if (S.talent) {
        S.morality = Math.round((S.talent.zheng + (100 - S.talent.xie)) / 2);
      } else {
        S.morality = 50;
      }
    }
    delete S.talent;

    /* ===== 星期 ===== */
    if (S.weekday === undefined) S.weekday = 3;

    /* ===== 状态 / 抗性 ===== */
    if (!S.statuses) S.statuses = [];
    if (!S.resistances) {
      S.resistances = {
        poison: 0, burn: 0, bleed: 0,
        stun: 0, freeze: 0, silence: 0, atkDown: 0,
      };
    }

    /* ===== 心法相关 ===== */
    if (!S.elementLvl) S.elementLvl = { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0, lei: 0, bing: 0 };
    if (S.dao === undefined) S.dao = 0;
    if (!S.heartArts) S.heartArts = { current: null, learned: [], progress: {} };
    if (!S.heartArts.progress) S.heartArts.progress = {};

    /* ===== 法术 ===== */
    if (!S.spells) S.spells = { learned: [] };

    /* ===== 技能 ===== */
    if (!S.combatSkills) S.combatSkills = { learned: [] };

    /* ===== 装备 ===== */
    if (!S.equipped) S.equipped = {};
    EQUIP_SLOTS.forEach(s => {
      if (S.equipped[s] === undefined) S.equipped[s] = null;
    });
    delete S.equipped.weapon;
    delete S.equipped.armor;
    delete S.equipped.ring;

    /* ===== 灵宠 ===== */
    if (!S.pets) S.pets = { list: [], nextUid: 1 };
    if (!S.pets.list) S.pets.list = [];
    if (S.pets.nextUid === undefined) S.pets.nextUid = S.pets.list.length + 1;
    if (S.pets.owned) {
      for (const defId in S.pets.owned) {
        const count = S.pets.owned[defId] === true ? 1 : S.pets.owned[defId];
        for (let i = 0; i < count; i++) {
          const enemy = getEnemyById(defId);
          S.pets.list.push({
            uid: "pet_" + S.pets.nextUid++,
            defId: defId,
            name: enemy ? enemy.name : defId,
            talent: "fan",
            bloodline: "none",
            lvl: 1,
            realm: 0,
            exp: 0,
            hp: null,
            hunger: 100,
            foodStorage: {},
          });
        }
      }
      delete S.pets.owned;
    }
    S.pets.list.forEach(pet => {
      if (pet.hunger === undefined) pet.hunger = 100;
      if (!pet.foodStorage) pet.foodStorage = {};
      if (!pet.talent) pet.talent = "fan";
      if (!pet.bloodline) pet.bloodline = "none";
      if (pet.realm === undefined) pet.realm = 0;
      if (pet.lvl === undefined) pet.lvl = 1;
      if (pet.exp === undefined) pet.exp = 0;
    });

    /* ===== 逆天宝物 ===== */
    if (!S.heavenDefying) {
      S.heavenDefying = { owned: {}, stages: {}, killStacks: 0, reviveCooldown: 0, liquid: 0 };
    }
    if (!S.heavenDefying.owned) S.heavenDefying.owned = {};
    if (!S.heavenDefying.stages) S.heavenDefying.stages = {};
    if (S.heavenDefying.killStacks === undefined) S.heavenDefying.killStacks = 0;
    if (S.heavenDefying.reviveCooldown === undefined) S.heavenDefying.reviveCooldown = 0;
    if (S.heavenDefying.liquid === undefined) S.heavenDefying.liquid = 0;

    /* ===== flags 兜底 ===== */
    if (!S.flags) S.flags = {};
    if (!S.flags.festivalYear) S.flags.festivalYear = {};
    if (!S.flags.npcDailyInteraction) S.flags.npcDailyInteraction = {};
    if (!S.flags.npcDailyGift) S.flags.npcDailyGift = {};
    if (!S.flags.npcDailyDay) S.flags.npcDailyDay = S.day;
    if (!S.flags.story) S.flags.story = { year1000: {}, year1001: {}, year1002: {}, year1003: {}, year1004: {} };
    if (!S.flags.secretRealm) S.flags.secretRealm = { opened: false, completed: false, gotOrb: false };
    if (S.flags.lastSundayDay === undefined) S.flags.lastSundayDay = 0;
    if (S.peak === undefined) S.peak = null;
    if (S.master === undefined) S.master = null;
    if (S.meditateCount === undefined) S.meditateCount = 1;
    if (!S.cave) S.cave = { level: 0, alchemy: 0, garden: 0, spirit: 0 };

    /* ===== 显示 ===== */
    document.getElementById("creationPanel").style.display = "none";
    document.getElementById("gameArea").style.display = "block";
    updateProfileIcon();
    log("欢迎回来，道友。", "c-gold");
    render();
  }

  setInterval(() => {
    if (S) {
      S.lastTime = Date.now();
      save();
    }
  }, 30000);

  window.addEventListener("beforeunload", () => {
    if (S) {
      S.lastTime = Date.now();
      save();
    }
  });
}

boot();