/* ============================================================
   ui/rank-board.js - 榜单界面
   ============================================================ */

function renderRankBoard(boardId) {
  initRankBoards();

  const board = getBoardWithPlayer(boardId);
  const pRank = getPlayerRank(boardId);
  const remainChallenges = Math.max(0, 2 - (S.flags.dailyChallenge || 0));

  const boardName = boardId === "menwai" ? "门外战力榜" : "门内战榜";
  let html = `<h4>⚔️ ${boardName}</h4>`;
  html += `<p class="small">今日剩余挑战：<b style="color:var(--text-gold);">${remainChallenges}</b> / 2</p>`;
  html += `<p class="small">你的排名：<b style="color:var(--c-blue);">${pRank > 20 ? "未上榜" : "第 " + pRank + " 名"}</b></p>`;

  if (boardId === "menwai") {
    html += `<p class="small" style="color:var(--text-dim);">前 10 名可申请晋升门内弟子。</p>`;
  } else {
    html += `<p class="small" style="color:var(--text-dim);">前 3 名可申请晋升真传弟子。</p>`;
  }

  const canChallengeSet = new Set();
  getChallengableTargets(boardId).forEach(t => canChallengeSet.add(t.id));

  html += `<div class="card" style="padding:0;">`;
  board.forEach(npc => {
    const isPlayer = npc.isPlayer;
    const canChallenge = canChallengeSet.has(npc.id);

    let rowStyle = "";
    if (isPlayer) rowStyle = "background:#2a1e0d;";
    else if (canChallenge) rowStyle = "background:#1a1a0d;";

    html += `<div class="row" style="${rowStyle}">
      <span style="width:34px; text-align:center; font-weight:bold; color:${npc.rank <= 3 ? 'var(--text-gold)' : 'var(--text-dim)'};">
        ${npc.rank}
      </span>
      <span style="flex:1; color:${isPlayer ? 'var(--text-gold)' : 'inherit'};">
        ${npc.name}${isPlayer ? ' <span class="tag gold">(你)</span>' : ''}
      </span>
      <span class="small" style="width:80px; text-align:right;">
        ${npc.realm === 0 ? "凡人" : REALMS[npc.realm].name + "·" + npc.sub + "重"}
      </span>
      <span style="width:60px; text-align:right;">
        ${canChallenge && remainChallenges > 0
          ? `<button class="small" onclick="doChallengeRank('${boardId}', '${npc.id}')">挑战</button>`
          : canChallenge
          ? `<span class="tag bad" style="font-size:10px;">无次数</span>`
          : ""}
      </span>
    </div>`;
  });
  html += `</div>`;

  return html;
}