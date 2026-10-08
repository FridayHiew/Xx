/* ============================================================
   systems/story.js - 剧情 / 事件 / 对白触发 / 秘境
   ============================================================ */

/* 对白触发 */
function pickDialogue(npc) {
  if (!npc) return null;
  const stage = getStoryStage();
  const rank = S.flags.rank || "杂务";

  const candidates = DIALOGUES.filter(d => {
    if (d.stage !== "any" && d.stage !== stage) return false;
    if (RANKS.indexOf(rank) < RANKS.indexOf(d.playerRank)) return false;
    if (d.speaker !== npc.role && d.speaker !== npc.tier) return false;
    return true;
  });

  if (candidates.length === 0) return null;
  return pick(candidates).text;
}

/* 周日事件 */
function checkSundayEvent() {
  if (S.day - S.flags.lastSundayDay < 7) return;
  S.flags.lastSundayDay = S.day;

  const stage = getStoryStage();
  const candidates = SUNDAY_EVENTS.filter(e => e.stage === stage);
  if (candidates.length === 0) return;

  const ev = pick(candidates);
  log(`【闲谈】${ev.text}`, "c-blue");

  showModal("周日闲谈", `
    <p>你在院中遇到几位同门。</p>
    <p>他们正在低声讨论。</p>
    <p class="small">${ev.text}</p>
  `, [{ label: "继续", fn: closeModal }]);
}

/* 年度宗内比拼（6 月 1 日） */
function checkSectCompetition() {
  const d = getDateInfo();
  if (d.month !== 6 || d.day !== 1) return;

  const bucket = "year" + d.year;
  if (!S.flags.story[bucket]) S.flags.story[bucket] = {};
  const key = `${d.year}-sect`;
  if (S.flags.story[bucket][key]) return;
  S.flags.story[bucket][key] = true;

  const rank = S.flags.rank || "杂务";
  if (rank === "杂务") {
    showModal("宗内比拼 · 观战", `
      <p>6 月 1 日，宗门大殿。</p>
      <p>长老站在高台上：「一年一度的宗内比拼，现在开始。」</p>
      <p>你站在人群外，看着台上的师兄师姐比试。</p>
      <p class="small">你暗下决心：明年，我也要上台。</p>
    `, [{ label: "继续", fn: closeModal }]);
  } else {
    showModal("宗内比拼 · 参赛", `
      <p>6 月 1 日，宗门大殿。</p>
      <p>你走上擂台。</p>
      <p class="small">（本版暂不做完整比拼）</p>
    `, [{ label: "继续", fn: closeModal }]);
  }
}

/* 联盟比拼（8 月 1 日） */
function checkUnionCompetition() {
  const d = getDateInfo();
  if (d.month !== 8 || d.day !== 1) return;

  const bucket = "year" + d.year;
  if (!S.flags.story[bucket]) S.flags.story[bucket] = {};
  const key = `${d.year}-union`;
  if (S.flags.story[bucket][key]) return;
  S.flags.story[bucket][key] = true;

  const rank = S.flags.rank || "杂务";
  if (rank === "杂务") {
    showModal("联盟比拼 · 观战", `
      <p>8 月 1 日，联盟会场。</p>
      <p>各宗门精英齐聚。</p>
      <p class="small">你只能远远看着。</p>
    `, [{ label: "继续", fn: closeModal }]);
  } else {
    showModal("联盟比拼", `
      <p>8 月 1 日，联盟会场。</p>
      <p>你作为本门代表，走上擂台。</p>
      <p class="small">（本版暂不做完整比拼）</p>
    `, [{ label: "继续", fn: closeModal }]);
  }
}

/* 秘境（1003 年 10 月 1 日） */
function checkSecretRealm() {
  const d = getDateInfo();
  if (d.year !== 1003 || d.month !== 10 || d.day !== 1) return;
  if (S.flags.secretRealm.opened) return;
  S.flags.secretRealm.opened = true;

  const rank = S.flags.rank || "杂务";
  if (rank === "杂务" || rank === "门外") {
    showModal("秘境 · 通知", `
      <p>10 月 1 日，宗门大殿。</p>
      <p>长老：「秘境入口已经开启。」</p>
      <p>「门内以上弟子可前往探索。」</p>
      <p class="small">你资格不够。</p>
    `, [{ label: "继续", fn: closeModal }]);
  } else {
    showModal("秘境 · 通知", `
      <p>10 月 1 日，宗门大殿。</p>
      <p>长老：「秘境入口已经开启。」</p>
      <p>「门内以上弟子可前往探索。」</p>
      <p class="small">据说，里面有上古宝物……</p>
    `, [
      { label: "前往秘境", fn: () => { closeModal(); enterSecretRealm(); } },
      { label: "不去", fn: closeModal },
    ]);
  }
}

/* 进入秘境 */

function enterSecretRealm() {
  showModal("秘境 · 第 1 层", `
    <p>你踏入秘境。</p>
    <p>迷雾森林中，前方隐约有身影。</p>
    <p>当前气血：${Math.floor(S.hp)}/${S.hpMax}</p>
    <p>当前灵力：${Math.floor(S.mp)}/${S.mpMax}</p>
  `, [
    { label: "深入", fn: () => {
        closeModal();
        const events = SECRET_EVENTS.layer1;
        const ev = pick(events);
        if (ev.type === "fight") {
          const enemy = FIGHT_ENEMIES[ev.enemy][0];
          startFight(enemy);
        } else if (ev.type === "choice") {
          showModal("秘境事件", `
            <p>${ev.text}</p>
          `, ev.options.map(o => ({
            label: o.label,
            fn: () => {
              closeModal();
              if (o.effect.mat) {
                for (const k in o.effect.mat) S.mat[k] = (S.mat[k] || 0) + o.effect.mat[k];
                log(`获得 ${Object.entries(o.effect.mat).map(([k, v]) => `${k}×${v}`).join("、")}`, "c-good");
              }
              if (o.effect.dao) S.dao = (S.dao || 0) + o.effect.dao;
              if (o.effect.fight) startFight(FIGHT_ENEMIES[o.effect.fight][0]);
              /* 10% 概率掉残卷 */
              if (chance(0.10)) {
                const frag = getRandomFragment();
                if (frag) addFragment(frag.fragment.id, 1);
              }
              save(); render();
            }
          })));
        }
      } },
    { label: "离开", fn: () => { closeModal(); log("你离开了秘境。", "c-normal"); } },
  ]);
}


/* 师父之死（真传触发，1003 年 11 月） */
function checkMasterDeath() {
  const d = getDateInfo();
  if (d.year !== 1003 || d.month !== 11 || d.day !== 1) return;
  const key = `1003-master-death`;
  if (!S.flags.story.year1003) S.flags.story.year1003 = {};
  if (S.flags.story.year1003[key]) return;
  S.flags.story.year1003[key] = true;

  if (S.flags.rank !== "真传") return;
  if (!S.master) return;

  const master = S.npcMap[S.master];
  if (!master) return;

  showModal("师父重伤", `
    <p>11 月 1 日，深夜。</p>
    <p>师父被抬回了宗门。</p>
    <p>「秘境中……遇到了埋伏……」</p>
    <p class="small">师父气息奄奄。</p>
  `, [{ label: "继续", fn: closeModal }]);
}

/* 最终战（1004 年 4 月 1 日） */
function checkFinalBattle() {
  const d = getDateInfo();
  if (d.year !== 1004 || d.month !== 4 || d.day !== 1) return;
  if (!S.flags.story.year1004) S.flags.story.year1004 = {};
  if (S.flags.story.year1004.final) return;
  S.flags.story.year1004.final = true;

  triggerFinalBattle();
}