/* ============================================================
   systems/npc.js - NPC 生成与管理
   ============================================================ */

/* NPC 身份 */
const NPC_ROLES = {
  FAN:       { role: "师兄",     tier: "杂务" },
  MENWAI:    { role: "门外",     tier: "门外" },
  MENNEI:    { role: "门内",     tier: "门内" },
  PEAK:      { role: "峰主",     tier: "长老" },
  ELDER:     { role: "长老",     tier: "长老" },
  MASTER:    { role: "宗主",     tier: "长老" },
  EXECUTOR:  { role: "执事",     tier: "杂务" },
};

function genRandomName(gender) {
  const surname = pick(NPC_SURNAMES);
  const given = gender === "男" ? pick(NPC_GIVEN_M) : pick(NPC_GIVEN_F);
  return surname + given;
}

function genNPC(opts = {}) {
  const gender = opts.gender || (chance(0.5) ? "男" : "女");
  const name = opts.name || genRandomName(gender);
  const role = opts.role || "师兄";
  const tier = opts.tier || "杂务";
  const realm = opts.realm !== undefined ? opts.realm : 0;
  const sub = opts.sub !== undefined ? opts.sub : 1;

  const traitPool = ["读书仔", "不读书", "欺负人", "邪恶人", "没目标",
                     "为生活", "爱八卦", "沉默寡言", "热心肠", "爱花钱"];

  const npc = {
    id: opts.id || "npc_" + Math.random().toString(36).slice(2, 8),
    name, gender, role, tier,
    realm, sub,
    aff: opts.aff !== undefined ? opts.aff : rndInt(10, 40),
    mood: 0,
    looks: rndInt(3, 9),
    talent: pick(SKILL_TALENTS),
    ie: chance(0.5) ? "I" : "E",
    traits: [pick(traitPool)],
    friends: [], enemies: [],
    alive: true,
    metDay: 0,
    lastInteract: 0,
    otherSect: opts.otherSect || null,
  };
  if (chance(0.4)) npc.traits.push(pick(traitPool));
  return npc;
}

/* 按玩家身份生成同宗门 NPC */
function initNPCs() {
  S.npcs = [];
  S.npcMap = {};
  const rank = S.flags.rank || "杂务";
  const numPeaks = PEAKS.length;

  if (rank === "杂务") {
    /* 3 个杂务 + 1 个执事 */
    for (let i = 0; i < 3; i++) {
      addNPC({ tier: "杂务", role: i === 0 ? "师兄" : "师弟", realm: 0 });
    }
    addNPC({ tier: "杂务", role: "执事", realm: 1, aff: 30 });
  } else if (rank === "门外") {
    /* 3 个门外 + 1 个门外长老 */
    for (let i = 0; i < 3; i++) {
      addNPC({ tier: "门外", role: i === 0 ? "师兄" : "师弟", realm: 1 });
    }
    addNPC({ tier: "长老", role: "长老", realm: 2, aff: 40 });
  } else if (rank === "门内") {
    /* 5 个门内 + 1 个峰主 */
    for (let i = 0; i < 5; i++) {
      addNPC({ tier: "门内", role: i === 0 ? "师兄" : "师弟", realm: 1, sub: rndInt(5, 10) });
    }
    addNPC({ tier: "长老", role: "峰主", realm: 2, aff: 40 });
  } else if (rank === "真传") {
    /* 5 个真传（每峰 1 个） */
    for (let i = 0; i < 5; i++) {
      addNPC({ tier: "门内", role: "真传", realm: 2 });
    }
  }
}

function addNPC(opts) {
  const npc = genNPC(opts);
  S.npcs.push(npc);
  S.npcMap[npc.id] = npc;
  return npc;
}

/* 玩家晋升时动态追加 NPC */
function addNPCsForRank(newRank) {
  if (newRank === "门外") {
    for (let i = 0; i < 3; i++) {
      addNPC({ tier: "门外", role: i === 0 ? "师兄" : "师弟", realm: 1, sub: rndInt(1, 3) });
    }
    addNPC({ tier: "长老", role: "长老", realm: 2, sub: rndInt(1, 5), aff: 40 });
  } else if (newRank === "门内") {
    for (let i = 0; i < 5; i++) {
      addNPC({ tier: "门内", role: i === 0 ? "师兄" : "师弟", realm: 1, sub: rndInt(5, 10) });
    }
    addNPC({ tier: "长老", role: "峰主", realm: 2, sub: rndInt(1, 5), aff: 40 });
  } else if (newRank === "真传") {
    for (let i = 0; i < 5; i++) {
      addNPC({ tier: "门内", role: "真传", realm: 2, sub: rndInt(1, 5) });
    }
  }
}


/* 每年换 20% */
function refreshNPCs() {
  log("【人事变迁】宗门里换了一批新面孔。", "c-blue");
  const toRemove = S.npcs.filter(n => n.alive && chance(0.2));
  toRemove.forEach(n => { n.alive = false; });

  /* 保底 8 个 */
  const alive = S.npcs.filter(n => n.alive);
  while (alive.length < 8) {
    addNPC({ tier: "杂务", role: "师弟", realm: 0 });
    break;
  }
}

/* 其他宗门：按需生成 */
function genOtherSectNPCs(sectId, count = 3) {
  const sect = SECTS.find(s => s.id === sectId);
  const list = [];
  for (let i = 0; i < count; i++) {
    const g = chance(0.5) ? "男" : "女";
    const role = i === 0 ? "宗主" : (i === 1 ? "长老" : "门内");
    const tier = i === 0 ? "长老" : (i === 1 ? "长老" : "门内");
    const realm = i === 0 ? 3 : (i === 1 ? 2 : 1);
    const npc = genNPC({
      name: genRandomName(g),
      gender: g,
      role,
      tier,
      realm,
      otherSect: sect.name,
    });
    list.push(npc);
  }
  return list;
}

/* 随机选一个活着的 NPC */
function pickAliveNPC() {
  const alive = S.npcs.filter(n => n.alive && S.metNpcs[n.id]);
  if (alive.length === 0) {
    const any = S.npcs.filter(n => n.alive);
    if (any.length > 0) {
      const n = pick(any);
      S.metNpcs[n.id] = true;
      return n;
    }
    return null;
  }
  return pick(alive);
}