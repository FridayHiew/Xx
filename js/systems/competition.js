/* ============================================================
   systems/competition.js - 宗门小比（每月 15 号擂台战）
   ============================================================ */

/* 触发检查（每月 15 号） */
function checkMonthlyCompetition() {
  const d = getDateInfo();
  if (d.day !== 15) return;

  const rank = S.flags.rank || "杂务";
  if (rank === "杂务") return; // 杂务不参加

  const key = `${d.year}-${d.month}-comp`;
  if (!S.flags.compRecord) S.flags.compRecord = {};
  if (S.flags.compRecord[key]) return;
  S.flags.compRecord[key] = true;

  showModal("宗门小比", `
    <p>今日是宗门每月一次的<b>小比</b>。</p>
    <p>外门擂台已经搭起，同门弟子纷纷上台切磋。</p>
    <p class="small">是否参加？</p>
  `, [
    { label: "不参加", fn: closeModal },
    { label: "参加", primary: true, fn: () => {
      closeModal();
      startCompetition();
    }},
  ]);
}

/* 开始小比（车轮战） */
function startCompetition() {
  /* 生成 3 个对手 */
  const info = getPlayerRealmInfo();
  const baseRealm = info.realm;
  const baseSub = Math.max(1, info.lvl);

  const opponents = [];
  for (let i = 0; i < 3; i++) {
    opponents.push({
      name: genRandomName(chance(0.5) ? "男" : "女"),
      realm: baseRealm,
      sub: Math.max(1, baseSub + (i - 1)),   // 稍弱-稍强
    });
  }

  S.flags.competition = {
    opponents: opponents,
    current: 0,
    wins: 0,
    inProgress: true,
  };

  showModal("小比开始", `
    <p>你走上擂台，第一位对手已经等候。</p>
    <div class="card">
      <b>${opponents[0].name}</b>
      <div class="small">${REALMS[opponents[0].realm].name}·${opponents[0].sub}重</div>
    </div>
  `, [
    { label: "放弃", fn: () => { S.flags.competition = null; closeModal(); } },
    { label: "开战", primary: true, fn: () => {
      closeModal();
      fightCompetitionOpponent();
    }},
  ]);
}

/* 打当前对手 */
function fightCompetitionOpponent() {
  const comp = S.flags.competition;
  if (!comp || !comp.inProgress) return;

  const opp = comp.opponents[comp.current];
  if (!opp) {
    finishCompetition();
    return;
  }

  /* 构造战斗敌人 */
  S.flags.competitionBattle = true;

  startBattle([{
    customEnemy: {
      name: opp.name,
      realm: opp.realm,
      sub: opp.sub,
      isBeast: false,
      ai: "simple",
      exp: 30,
      stone: 0,
    }
  }]);
}

/* 战斗胜利后调用（从 battle.js 里） */
function handleCompetitionWin() {
  if (!S.flags.competitionBattle) return;
  S.flags.competitionBattle = null;

  const comp = S.flags.competition;
  if (!comp) return;

  comp.wins++;
  comp.current++;

  if (comp.current >= comp.opponents.length) {
    /* 全打完了 */
    setTimeout(finishCompetition, 500);
  } else {
    /* 下一位 */
    const next = comp.opponents[comp.current];
    setTimeout(() => {
      showModal("小比继续", `
        <p>你击败了对手，赢得 <b>${comp.wins}</b> 场胜利！</p>
        <p>下一位对手上台：</p>
        <div class="card">
          <b>${next.name}</b>
          <div class="small">${REALMS[next.realm].name}·${next.sub}重</div>
        </div>
      `, [
        { label: "放弃", fn: () => { closeModal(); finishCompetition(); } },
        { label: "继续", primary: true, fn: () => {
          closeModal();
          fightCompetitionOpponent();
        }},
      ]);
    }, 500);
  }
}

/* 战斗失败 */
function handleCompetitionLose() {
  if (!S.flags.competitionBattle) return;
  S.flags.competitionBattle = null;

  const comp = S.flags.competition;
  if (!comp) return;

  /* 失败：结束 */
  setTimeout(() => {
    showModal("小比淘汰", `
      <p>你被对手击败，退出擂台。</p>
      <p>本次小比共胜 <b>${comp.wins}</b> 场。</p>
    `, [
      { label: "结束", primary: true, fn: () => { closeModal(); finishCompetition(); } },
    ]);
  }, 500);
}

/* 结束小比 */
function finishCompetition() {
  const comp = S.flags.competition;
  if (!comp) return;

  const wins = comp.wins;
  const detail = [];
  let contrib = 0;
  let stone = 0;

  if (wins === 3) {
    contrib = 50;
    stone = 100;
    S.mood = Math.min(2, S.mood + 1);
    detail.push("🎉 全胜！");
  } else if (wins === 2) {
    contrib = 25;
    stone = 50;
    S.mood = Math.min(2, S.mood + 1);
  } else if (wins === 1) {
    contrib = 10;
    stone = 20;
  } else {
    S.mood = Math.max(-2, S.mood - 1);
    detail.push("心情 -1");
  }

  if (contrib > 0) {
    S.contrib += contrib;
    detail.push(`贡献 +${contrib}`);
  }
  if (stone > 0) {
    S.stone += stone;
    detail.push(`灵石 +${stone}`);
  }

  log(`【宗门小比】胜 ${wins} / 3 场。`, "c-gold");

  S.flags.competition = null;
  save();
  showActionModal("小比结束", detail);
  render();
}