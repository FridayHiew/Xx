/* ============================================================
   systems/character.js - 角色创建 / 入门
   ============================================================ */

function createCharacter() {
  const name = (document.getElementById("nameInput").value || "无名").slice(0, 8);
  const gender = document.getElementById("genderInput").value;
  const month = parseInt(document.getElementById("monthInput").value) || 1;
  const day = parseInt(document.getElementById("dayInput").value) || 1;

  const ie = ((month + day) % 2 === 0) ? "E" : "I";
  const luck = 3 + ((month * day) % 7);

  const skillTalent = SKILL_TALENTS[(month + day) % SKILL_TALENTS.length];

  const seed1 = (month * 31 + day * 7) % 100;
  const seed2 = (month * 13 + day * 17) % 100;
  const talent = { zheng: seed1, xie: seed2 };

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
    atk: 5, def: 3,
    luck,
    talent,
    skillTalent,

    heartArts: {
      current: null,
      learned: [],
      progress: {},
    },

    elementLvl: { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0, lei: 0, bing: 0 },
    fragments: {},
    dao: 0,

    skills: SKILLS.reduce((o, k) => { o[k] = { lvl: 0, exp: 0 }; return o; }, {}),
    choreSkill: {},
    hobbies,
    hobbySkill: hobbies.reduce((o, h) => { o[h] = 0; return o; }, {}),
    mood: 0,
    life: 12, lifeMax: REALMS[0].life,
    day: 1, hour: 0, actionsUsed: 0,
    money: 300,
    stone: 0,
    contrib: 0,
    mat: {}, items: {},
    equips: {}, equipped: { weapon: null, armor: null, ring: null },
    tools: {},
    arts: [], arts2: [],
    learnedArts: {},
    npcs: [], npcMap: {},
    metNpcs: {},
    lovers: [],
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

  S.items["灵石"] = 10;
  S.equips["e_armor1"] = true;

  document.getElementById("creationPanel").style.display = "none";
  document.getElementById("gameArea").style.display = "block";

  const dateInfo = getDateInfo();
  log(`【${name}】，${gender}，生于${LUNAR_MONTHS[month-1]}${day}日。`, "c-gold");
  log(`当前：逍遥 ${dateInfo.year} 年 · ${dateInfo.monthName}${dateInfo.day}日`, "c-blue");
  log(`悟性：正 ${talent.zheng} / 邪 ${talent.xie}`, "c-blue");
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

function assignSect() {
  const mx = maxRoot(S.roots);
  const candidates = SECTS.filter(s => s.accept.includes("*") || s.accept.includes(mx.key));
  if (candidates.length === 0) candidates.push(...SECTS);
  const sect = pick(candidates);

  const body = `
    <p>修士掐指一算，带你来到一处山门。</p>
    <div class="card">
      <b>${sect.name}</b>
      <span class="tag ${sect.camp === "正道" ? "good" : sect.camp === "邪道" ? "bad" : "gold"}">${sect.camp}</span>
      <span class="tag">Lv.${sect.level}</span>
      <div class="small">特色：${sect.specialty}　心法：${sect.art}</div>
      <div class="small">${sect.desc}</div>
    </div>
  `;
  showModal("宗门安排", body, [
    { label: "拜入", fn: () => { closeModal(); joinSect(sect.id); } }
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

  const body = `
    <p>一位执事模样的修士迎了上来，扔给你一套粗布制服。</p>
    <p class="small">「穿上吧，这是${sect.name}杂务弟子的制服。」</p>
    <p>他拍了拍你的肩：</p>
    <p class="small">「心法残卷，靠你自己去寻。宗门藏经阁、秘境、山野……都有可能。」</p>
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
        log(`【入门】你穿上了${sect.name}的制服。`, "c-gold");
        if (sameTime.length > 0) {
          log(`【同期】你结识了 ${sameTime.map(n => n.name).join("、")}。`, "c-blue");
        }
        save(); render();
        setTimeout(() => morningPrompt(), 300);
      } }
  ]);
}