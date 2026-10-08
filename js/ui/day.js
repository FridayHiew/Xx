/* ============================================================
   ui/day.js - 日常面板
   ============================================================ */

function hourLabelHTML() {
  const cls = S.hour === 0 ? "h-morning" : S.hour === 1 ? "h-noon" : "h-night";
  return `<span class="hour-label ${cls}">${HOURS[S.hour]}</span>`;
}

function renderDay() {
  const rank = S.flags.rank || "杂务";
  const remain = ACTIONS_PER_SLOT - S.actionsUsed;

  let html = `<h3>今日 ${hourLabelHTML()}　第 ${S.day} 天</h3>
    <p class="small">本时段剩余行动：<b>${remain}</b> / ${ACTIONS_PER_SLOT}</p>`;

  if (S.dailyQuest) {
    html += `<div class="card">
      <b>今日任务</b>：${S.dailyQuest.chore.name} ×${S.dailyQuest.amount}
      <span class="small">（${S.dailyQuest.done}/${S.dailyQuest.amount}）</span>
    </div>`;
  }

  html += `<div class="card"><b>行动选择</b>
    <div class="action-row">${renderActionButtons(rank, remain)}</div>
  </div>`;

  if (S.hour === 2 && remain <= 0) {
    html += `<button class="primary block" onclick="sleepToNextDay()">睡觉（进入下一天）</button>`;
  } else if (S.hour === 2) {
    html += `<button class="block" onclick="sleepToNextDay()">提前睡觉（放弃剩余行动）</button>`;
  }

html += `<div style="margin-top:8px;">
    <button class="debug" onclick="debugComplete()">[DEBUG] 圆满当前心法</button>
    <button class="debug" onclick="debugAddProficiency()">[DEBUG] 熟练度满</button>
    <button class="debug" onclick="debugAddMoney()">[DEBUG] 铜钱 +1000</button>
    <button class="debug" onclick="debugAddStone()">[DEBUG] 灵石 +1000</button>
    <button class="debug" onclick="debugAddContrib()">[DEBUG] 贡献 +100</button>
    <button class="debug" onclick="debugAddFragment()">[DEBUG] 随机残卷</button>
    <button class="debug" onclick="toggleDebugRoot()">[DEBUG] 显示灵根</button>

  </div>`;

  return html;
}

function renderActionButtons(rank, remain) {
  const btns = [];
  if (S.hour !== 2) {
    if (S.dailyQuest && S.dailyQuest.done < S.dailyQuest.amount) {
      const todo = calcChoreActions(S.dailyQuest.amount - S.dailyQuest.done, remain);
      btns.push(`<button class="action-btn" onclick="doChore()" ${remain <= 0 ? "disabled" : ""}>今日杂务（+${todo}）</button>`);
    } else {
      btns.push(`<button class="action-btn" disabled>今日杂务（已完成）</button>`);
    }
  }

  btns.push(`<button class="action-btn" onclick="doAction('partTime')" ${remain <= 0 ? "disabled" : ""}>打零工</button>`);
  btns.push(`<button class="action-btn" onclick="gotoCultivate()">打坐修炼</button>`);

  if (RANKS.indexOf(rank) >= 2) {
    btns.push(`<button class="action-btn" onclick="doAction('explore')" ${remain <= 0 ? "disabled" : ""}>出门探索</button>`);
    btns.push(`<button class="action-btn" onclick="doAction('garden')" ${remain <= 0 ? "disabled" : ""}>打理药园</button>`);
    btns.push(`<button class="action-btn" onclick="doAction('practice')" ${remain <= 0 ? "disabled" : ""}>练习技能</button>`);
  }
  if (rank !== "杂务") {
    btns.push(`<button class="action-btn" onclick="doDuel()" ${remain <= 0 ? "disabled" : ""}>对练基本功</button>`);
  }
  return btns.join("");
}

function gotoCultivate() {
  currentTab = "cultivatePage";
  render();
}

function doAction(type) {
  if (S.actionsUsed >= ACTIONS_PER_SLOT) {
    log("本时段行动已用完。", "c-bad");
    return;
  }
  if (type === "partTime") return doPartTime();
  else if (type === "explore") {
    const rank = S.flags.rank || "杂务";
    if (RANKS.indexOf(rank) < 2) { log("你还未获准下山。", "c-bad"); return; }
    S.actionsUsed++;
    doExplore();
  }
  else if (type === "garden") {
    S.actionsUsed++;
    const n = rndInt(1, 3);
    S.mat["灵草"] = (S.mat["灵草"] || 0) + n;
    log(`你打理药园，收获灵草 ×${n}。`, "c-good");
    consumeAction(() => showActionModal("打理药园", [`灵草 +${n}`]));
  }
  else if (type === "practice") {
    S.actionsUsed++;
    const k = pick(SKILLS);
    let inc = rnd(0.05, 0.2);
    const art = getCurrentArt();
    if (art && art.bonus) {
      if (art.bonus.skill === k) inc *= (1 + art.bonus.bonus);
      else if (art.bonus.all) inc *= (1 + art.bonus.all);
    }
    inc = +inc.toFixed(2);
    S.skills[k].exp = +(S.skills[k].exp + inc).toFixed(2);
    let leveled = false;
    while (S.skills[k].exp >= SKILL_LVL_EXP && S.skills[k].lvl < MAX_SKILL_LVL) {
      S.skills[k].exp -= SKILL_LVL_EXP;
      S.skills[k].lvl++;
      log(`【技能提升】你的 ${k} 提升到 Lv.${S.skills[k].lvl}！`, "c-gold");
      leveled = true;
    }
    log(`练习 ${k}，熟练 +${inc}。`, "c-normal");
    const detail = [`${k} 熟练 +${inc}（${S.skills[k].exp.toFixed(2)}/100）`];
    if (leveled) detail.push(`${k} 升级到 Lv.${S.skills[k].lvl}！`);
    consumeAction(() => showActionModal("练习技能 · " + k, detail));
  }
}

function consumeAction(onDone) {
  if (S.actionsUsed >= ACTIONS_PER_SLOT) {
    if (S.hour < 2) {
      S.hour++;
      S.actionsUsed = 0;
      log(`【时间】进入${HOURS[S.hour]}。`, "c-blue");
      if (S.hour === 2) setTimeout(() => { nightPrompt(); }, 300);
    }
  }
  save();
  render();
  if (onDone) onDone();
}

function sleepToNextDay() {
  newDay();
}

/* 新一天 */
function newDay() {
  if (S.dailyQuest && S.dailyQuest.done < S.dailyQuest.amount) {
    const missing = S.dailyQuest.amount - S.dailyQuest.done;
    const zhishi = S.npcs.find(n => n.role === "执事" && n.alive);
    if (zhishi) {
      zhishi.aff = Math.max(0, zhishi.aff - missing * 2);
      log(`【执事】未完成昨日任务，好感 -${missing * 2}。`, "c-bad");
    }
    S.mood = Math.max(-2, S.mood - 1);
  }

  S.dailyQuest = null;
  S.actionsUsed = 0;
  S.flags.breakAttemptedToday = false;
  S.day++;
  S.hour = 0;
  S.life += 1 / 365;
  morningPrompted = false;
  nightPrompted = false;
  hobbyPrompted = false;

  S.flags.npcDailyInteraction = {};
  S.flags.npcDailyGift = {};
  S.flags.npcDailyDay = S.day;

  if (S.life >= S.lifeMax) { die("寿元耗尽，坐化于洞府之中。"); return; }

  checkMonthlyPay();
  checkFestival();

  if (S.day % 365 === 0) {
    log(`【新年】又是一年过去，你已 ${Math.floor(S.life)} 岁。`, "c-gold");
    S.mood = Math.min(2, S.mood + 1);
    refreshNPCs();
  }

  /* 剧情事件 */
  checkSundayEvent();
  checkSectCompetition();
  checkUnionCompetition();
  checkSecretRealm();
  checkMasterDeath();
  checkFinalBattle();

  /* 如果结局已触发，就不再继续 */
  if (S.flags.story.year1004 && S.flags.story.year1004.final) {
    return;
  }

  morningPrompt();
  render();
}

function checkSickness() {
  const risk = (S.mood < -1 ? 0.1 : 0);
  if (chance(risk)) {
    S.hp -= 10;
    S.mood = Math.max(-2, S.mood - 1);
    log("【生病】气血 -10。", "c-bad");
    if (S.hp <= 0) die("积劳成疾，病逝于床榻。");
  }
}