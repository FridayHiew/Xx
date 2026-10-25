/* ============================================================
   data/rank-boards.js - 宗门战力榜数据
   ============================================================ */

/* 生成一个虚拟榜单 */
function generateRankBoard(boardId, count = 20) {
  const board = [];
  const surnames = ["李","王","张","刘","陈","杨","赵","黄","周","吴","徐","孙","胡","朱","高"];
  const givenM = ["青云","无极","长风","玄机","天行","子墨","孤鸿","若尘","寒江","明轩"];
  const givenF = ["清月","若雪","红袖","青鸾","紫烟","轻语","含烟","流苏","水瑶","绮罗"];

  /* 门外榜：炼气 3~8 重 */
  /* 门内榜：筑基 1~8 重 */
  const isMenwai = boardId === "menwai";
  const baseRealm = isMenwai ? 1 : 2;
  const baseSub = isMenwai ? 3 : 1;
  const subSpread = isMenwai ? 5 : 7;

  for (let i = 0; i < count; i++) {
    const gender = chance(0.5) ? "男" : "女";
    const name = pick(surnames) + (gender === "男" ? pick(givenM) : pick(givenF));

    /* 排名越靠前（i 越小），境界越高 */
    const ratio = 1 - (i / count);
    const sub = Math.min(10, baseSub + Math.floor(ratio * subSpread));
    const realm = (i < 3 && !isMenwai) ? baseRealm + 1 : baseRealm;

    board.push({
      id: "rank_" + boardId + "_" + i,
      rank: i + 1,
      name: name,
      gender: gender,
      realm: realm,
      sub: sub,
      isPlayer: false,
      isRankNpc: true,
    });
  }
  return board;
}

/* 初始化榜单（存到 S.flags） */
function initRankBoards() {
  if (!S.flags.rankBoards) {
    S.flags.rankBoards = {
      menwai: generateRankBoard("menwai", 20),
      mennei: generateRankBoard("mennei", 20),
    };
  }
  if (!S.flags.playerRank) {
    S.flags.playerRank = { menwai: 999, mennei: 999 };
  }
}

/* 获取玩家当前排名（999=未上榜） */
function getPlayerRank(boardId) {
  return (S.flags.playerRank && S.flags.playerRank[boardId]) || 999;
}

/* 获取榜单（包含玩家） */
function getBoardWithPlayer(boardId) {
  const board = S.flags.rankBoards[boardId];
  if (!board) return [];
  const pRank = getPlayerRank(boardId);

  /* 把玩家塞进去 */
  if (pRank <= board.length && pRank >= 1) {
    const newBoard = board.slice();
    const info = getPlayerRealmInfo();
    newBoard[pRank - 1] = {
      id: "player",
      rank: pRank,
      name: S.name,
      realm: info.realm,
      sub: info.lvl,
      isPlayer: true,
      isRankNpc: false,
    };
    return newBoard;
  }
  return board;
}

/* 获取可挑战目标：玩家当前排名前面的前 3 名（或未上榜时挑最后 3 名） */
function getChallengableTargets(boardId) {
  const board = getBoardWithPlayer(boardId);
  const pRank = getPlayerRank(boardId);

  if (pRank > board.length) {
    return board.slice(-3);
  }

  /* 只能挑战上面 3 名 */
  const targets = [];
  for (let i = Math.max(0, pRank - 4); i < pRank - 1; i++) {
    if (board[i] && !board[i].isPlayer) targets.push(board[i]);
  }
  return targets;
}