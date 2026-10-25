/* ============================================================
   systems/rank-board.js - 榜单战斗逻辑
   ============================================================ */

/* 玩家发起挑战 */
function doChallengeRank(boardId, targetId) {
  if (S.actionsUsed >= ACTIONS_PER_SLOT) {
    log("本时段行动已用完。", "c-bad");
    return;
  }
  if ((S.flags.dailyChallenge || 0) >= 2) {
    log("今日挑战次数已用完。", "c-bad");
    return;
  }

  const board = S.flags.rankBoards[boardId];
  const target = board.find(n => n.id === targetId);
  if (!target) return;

  /* 确认 */
  showModal("挑战", `
    <p>你要挑战 <b>${target.name}</b>（第 ${target.rank} 名，${REALMS[target.realm]?.name || '凡人'}·${target.sub}重）吗？</p>
    <p class="small">消耗 1 行动，失败不掉排名。</p>
  `, [
    { label: "取消", fn: closeModal },
    { label: "开战", primary: true, fn: () => {
      closeModal();
      S.actionsUsed++;
      S.flags.dailyChallenge = (S.flags.dailyChallenge || 0) + 1;

      /* 构造战斗敌人 */
      const enemyUnit = {
        name: target.name,
        realm: target.realm,
        sub: target.sub,
        isBeast: false,
        ai: "simple",
        exp: 20 * target.realm + 10 * target.sub,
        stone: 30 + 20 * target.realm,
        /* 保存挑战信息，战斗结束要用 */
      };

      /* 记录当前是榜单战斗 */
      S.flags.rankBattle = {
        boardId: boardId,
        targetId: targetId,
        targetRank: target.rank,
      };

      startBattle([{ enemyId: null, customEnemy: enemyUnit }]);
    }},
  ]);
}

/* 战斗胜利处理（由 battle.js 调用） */
function handleRankBattleWin() {
  const rb = S.flags.rankBattle;
  if (!rb) return;
  S.flags.rankBattle = null;

  const { boardId, targetId, targetRank } = rb;
  const pRank = getPlayerRank(boardId);

  /* 玩家上位 */
  S.flags.playerRank[boardId] = targetRank;
  log(`【战榜】你击败了第 ${targetRank} 名，取而代之！`, "c-gold");
  save();
}

/* 战斗失败 / 逃跑处理 */
function handleRankBattleLose() {
  const rb = S.flags.rankBattle;
  if (!rb) return;
  S.flags.rankBattle = null;
  log("【战榜】挑战失败，排名未变。", "c-dim");
  save();
}

/* 每日被挑战（新的一天） */
function processDailyRankChallenge() {
  const rank = S.flags.rank || "杂务";
  const info = getPlayerRealmInfo();
  let boardId = null;

  if (rank === "门外") boardId = "menwai";
  else if (rank === "门内" || rank === "真传") boardId = "mennei";

  if (!boardId) return;

  const pRank = getPlayerRank(boardId);
  if (pRank > 20) return;

  /* 2 次被挑战 */
  let drops = 0;
  for (let i = 0; i < 2; i++) {
    /* 胜利概率：玩家境界越高越安全 */
    const winRate = 0.4 + info.realm * 0.08 + info.lvl * 0.02;
    if (!chance(Math.min(0.9, winRate))) {
      drops++;
    }
  }

  if (drops > 0) {
    const newRank = Math.min(20, pRank + drops);
    S.flags.playerRank[boardId] = newRank;
    log(`【战榜】你被同门挑战 ${drops} 次，排名掉落至第 ${newRank} 名。`, "c-bad");
    save();
  }
}