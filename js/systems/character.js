/* ============================================================
   systems/character.js - 角色创建 / 入门
   ============================================================ */

const RANDOM_DAO_NAMES = [
  "云逸", "长生", "青虚", "太玄", "问道", "灵素", "若尘", "凌霄",
  "玄玑", "紫阳", "墨渊", "玉衡", "沧澜", "天枢", "玄真", "清微",
  "丹青", "素心", "南华", "守拙", "无极", "知秋", "扶摇", "飞鸿"
];

function randomizeName() {
  const input = document.getElementById("nameInput");
  if (!input) return;
  const picked = RANDOM_DAO_NAMES[Math.floor(Math.random() * RANDOM_DAO_NAMES.length)];
  input.value = picked;
}

function createCharacter() {
  const name = (document.getElementById("nameInput").value || "无名").slice(0, 8);
  const gender = document.getElementById("genderInput").value;
  const month = parseInt(document.getElementById("monthInput").value) || 1;
  const day = parseInt(document.getElementById("dayInput").value) || 1;

  if (window.xianxiaAudio && !window.xianxiaAudio.isPlaying) {
    window.xianxiaAudio.play();
  }

  const ie = ((month + day) % 2 === 0) ? "E" : "I";
  const luck = rndInt(0, 9);
  const skillTalent = SKILL_TALENTS[(month + day) % SKILL_TALENTS.length];

  const morality = rndInt(45, 60);

  const aptSeed = (month * 31 + day * 7 + luck) % 100;
  let apt;
  if (aptSeed < 40) apt = APTITUDES[0];
  else if (aptSeed < 70) apt = APTITUDES[1];
  else if (aptSeed < 88) apt = APTITUDES[2];
  else if (aptSeed < 97) apt = APTITUDES[3];
  else apt = APTITUDES[4];

  const hobbyCount = rndInt(1, 2);
  const shuffledHobbies = [...ALL_HOBBIES].sort(() => Math.random() - 0.5);
  const hobbies = shuffledHobbies.slice(0, hobbyCount);

  S = {
    name, gender, ie,
    birthday: { month, day },
    roots: null,
    sect: null,
    peak: null,
    master: null,
    aptitude: apt.id,
    realm: 0, sub: 0, exp: 0,
    hp: 60, hpMax: 60,
    mp: 0, mpMax: 0,
    atk: 5, def: 3, speed: 10,
    luck,
    morality,
    skillTalent,

    heartArts: {
      current: null,
      learned: [],
      progress: {},
    },

    elementLvl: { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0, lei: 0, bing: 0 },
    dao: 0,

    spells: {
      learned: [],
    },
    combatSkills: {
      learned: [],
    },

    statuses: [],
    resistances: {
      poison: 0, burn: 0, bleed: 0,
      stun: 0, freeze: 0, silence: 0, atkDown: 0,
    },

    skills: SKILLS.reduce((o, k) => { o[k] = { lvl: 0, exp: 0 }; return o; }, {}),
    choreSkill: {},
    hobbies,
    hobbySkill: hobbies.reduce((o, h) => { o[h] = 0; return o; }, {}),
    mood: 0,
    life: 12, lifeMax: rnd(12.5, 80),
    day: 1, hour: 0, actionsUsed: 0,
    weekday: 3,
    money: 300,
    stone: 0,
    contrib: 0,

    inventory: {},
    equipped: {
      head: null, rightHand: null, leftHand: null, body: null, shoes: null,
      accessory1: null, accessory2: null,
      artifact1: null, artifact2: null, artifact3: null,
      pet: null, mount: null, heavenDefying: null,
    },
    tools: {},

    arts: [], arts2: [],
    learnedArts: {},
    npcs: [], npcMap: {},
    metNpcs: {},
    lovers: [],

    pets: {
      list: [],
      nextUid: 1,
    },

    /* 逆天宝物 */
    heavenDefying: {
      owned: {},
      stages: {},
      killStacks: 0,
      reviveCooldown: 0,
      liquid: 0,
    },

    flags: {
      rank: "杂务",
      rootRevealed: false,
      sectJoined: false,
      hungerStreak: 0,
      breakAttemptedToday: false,
      lastPayDay: 0,
      npcDailyInteraction: {},
      npcDailyGift: {},
      npcDailyDay: 1,
      introDone: false,
      festivalYear: {},
      story: {
        year1000: {},
        year1001: {},
        year1002: {},
        year1003: {},
        year1004: {},
      },
      secretRealm: { opened: false, completed: false, gotOrb: false },
      lastSundayDay: 0,
      lastStoryStage: "1000",
    },
    dailyQuest: null,
    lastTime: Date.now(),
    cave: { level: 0, alchemy: 0, garden: 0, spirit: 0 },
    meditateCount: 1,
  };

  S.stone = 10; 
  S.inventory["e_armor1"] = 1;

  document.getElementById("creationPanel").style.display = "none";
  document.getElementById("gameArea").style.display = "block";

  const dateInfo = getDateInfo();
  log(`【${name}】，${gender}，生于${LUNAR_MONTHS[month-1]}${day}日。`, "c-gold");
  log(`当前：逍遥 ${dateInfo.year} 年 · ${dateInfo.monthName}${dateInfo.day}日`, "c-blue");
  log(`本心：${moralityLabel(morality)}（${morality}）`, "c-blue");
  log(`爱好：${hobbies.join("、")}`, "c-purple");

  updateProfileIcon();
  setTimeout(() => introStory(), 300);
}

function introStory() {
  showModal("入门 · 缘起", `
    <p>你本是凡间一个普通少年，某日上山砍柴，忽见一道流光从天而降。</p>
    <p>那是一位路过的修士，他上下打量你，眉头微皱，随即又舒展：</p>
    <p>「小家伙，你身上……有灵根。」</p>
  `, [{ label: "随他而去", fn: () => { closeModal(); revealRoot(); } }]);
}

function revealRoot() {
  S.roots = genRoots();
  S.flags.rootRevealed = true;
  log(`【灵根验证】测出你有灵根。`, "c-gold");

  showModal("灵根验证", `
    <p>修士将一块灵石放在你掌心，灵石泛起微光。</p>
    <p>「你有灵根。」</p>
    <p class="small">（一级宗门只能验出有无，无法测出详细。）</p>
  `, [{ label: "拜入仙门", fn: () => { closeModal(); assignSect(); } }]);
}

//debug 用 - 开局选宗门
function assignSect() {
  const body = `
    <p>修士掐指一算，带你来到一处山门前。</p>
    <p class="small">「选一个你想拜入的宗门吧。」</p>
  `;

  const actions = SECTS.map(sect => ({
    label: `${sect.name}（${sect.camp}·${sect.specialty}）`,
    fn: () => { closeModal(); confirmSect(sect.id); },
  }));

  actions.push({ label: "取消", fn: closeModal });

  showModal("选择宗门", body, actions);
}

function confirmSect(sectId) {
  const sect = SECTS.find(s => s.id === sectId);
  if (!sect) return;

  const body = `
    <div class="card">
      <b>${sect.name}</b>
      <span class="tag ${sect.camp === "正道" ? "good" : sect.camp === "邪道" ? "bad" : "gold"}">${sect.camp}</span>
      <span class="tag">Lv.${sect.level}</span>
      <div class="small">特色：${sect.specialty}　心法：${sect.art}</div>
      <div class="small">${sect.desc}</div>
    </div>
    <p class="small">确认拜入？</p>
  `;

  showModal("拜入宗门", body, [
    { label: "确认", fn: () => { closeModal(); joinSect(sectId); } },
    { label: "返回", fn: () => { closeModal(); assignSect(); } },
  ]);
}

function joinSect(sectId) {
  const sect = SECTS.find(s => s.id === sectId);
  S.sect = sectId;
  S.flags.sectJoined = true;
  S.flags.rank = "杂务";

  const sectArt = HEART_ARTS.find(a => a.sect === sectId);
  S.arts2.push(sectArt ? sectArt.id : sect.art);

  S.flags.lastPayDay = S.day;

  closeModal();
  log(`【拜入门派】你成为【${sect.name}】的一名杂务弟子。`, "c-gold");

  initNPCs();
  setTimeout(() => introRitual(), 400);
}

function introRitual() {
  const sect = SECTS.find(s => s.id === S.sect);
  const zhishi = S.npcs.find(n => n.role === "执事" && n.alive);
  if (zhishi) S.metNpcs[zhishi.id] = true;

  const candidates = S.npcs.filter(n => n.alive && n.tier === "杂务" && n.id !== (zhishi && zhishi.id));
  const sameTime = candidates.slice(0, 3);
  sameTime.forEach(n => { S.metNpcs[n.id] = true; });

  /* 给开局心法 + 召唤技能 */
  giveStartingArt();
  giveStartingSummonSkill();
  const startArt = getCurrentArt();

  const body = `
    <p>一位执事模样的修士迎了上来，扔给你一套粗布制服。</p>
    <p class="small">「穿上吧，这是${sect.name}杂务弟子的制服。」</p>
    <p>他又递来一本泛黄的小册子。</p>
    <p class="small">「这是本门基础心法《${startArt.name}》，闲时可参悟。后续残卷，靠你自己去寻。」</p>
    <hr style="border-color:#2a2216;margin:8px 0;">
    <p>执事环顾四周，指了指旁边同样稚嫩的几人：</p>
    <p class="small">「这几个也是今日入门的，和你一样是杂务弟子。」</p>
    <div style="margin-top:6px;">
      ${sameTime.map(n => `<span class="tag ${n.gender === "女" ? "pink" : "blue"}">${n.name}（${n.role}）</span>`).join(" ")}
    </div>
  `;
  showModal("入门仪式", body, [
    { label: "明白了", fn: () => {
        closeModal();
        S.flags.introDone = true;
        log(`【入门】你穿上了${sect.name}的制服，获得心法《${startArt.name}》。`, "c-gold");
        if (sameTime.length > 0) {
          log(`【同期】你结识了 ${sameTime.map(n => n.name).join("、")}。`, "c-blue");
        }
        save(); render();
        setTimeout(() => morningPrompt(), 300);
      } }
  ]);
}

function giveStartingSummonSkill() {
  const skill = getSectSummonSkill(S.sect);
  if (skill) {
    if (!S.combatSkills) S.combatSkills = { learned: [] };
    if (!S.combatSkills.learned.includes(skill.id)) {
      S.combatSkills.learned.push(skill.id);
    }
  }
}

/* 开局赠送基础心法 */
function giveStartingArt() {
  const artId = "lianqi_basic";
  const art = HEART_ARTS.find(a => a.id === artId);

  S.heartArts.learned.push(artId);
  S.heartArts.current = artId;
  S.heartArts.progress[artId] = {
    lvl: 0,
    exp: 0,
    proficiency: 0,
    maxLearn: 3,
  };

  updateElementLvl();
}