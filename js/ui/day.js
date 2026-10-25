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

  let html = `<h3>今日 ${hourLabelHTML()}　第 ${S.day} 天　周${WEEKDAYS[S.weekday]}</h3>
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

/* 宗门任务区 */
if (S.flags.rank !== "杂务" && typeof getAvailableTasks === "function") {
  const available = getAvailableTasks();
  const active = S.flags.activeTasks || [];

  html += `<div class="card" style="background:#1a140c;">
    <b>📜 宗门任务</b>
  `;

  if (active.length > 0) {
    active.forEach(t => {
      const task = getTaskById(t.id);
      if (!task) return;
      const remainingDays = t.expireDay - S.day;
      const isUrgent = remainingDays <= 1;
      const color = isUrgent ? "var(--c-bad)" : "var(--c-good)";
      html += `<div class="small" style="color:${color};">
        【进行中】${task.name} - 剩余 ${remainingDays} 天
      </div>`;
    });
  } else {
    html += `<p class="small">可接取任务：</p>`;
    available.slice(0, 3).forEach(task => {
      html += `<div class="row">
        <span>${task.name}</span>
        <button class="small" onclick="acceptTask('${task.id}')">接取</button>
      </div>`;
    });
  }
  html += `</div>`;
}

  if (S.hour === 2 && remain <= 0) {
    html += `<button class="primary block" onclick="sleepToNextDay()">🌙 安歇入梦 · 进入下一天</button>`;
  } else if (S.hour === 2) {
    html += `<button class="block" onclick="sleepToNextDay()">🌙 提前安歇（放弃剩余行动）</button>`;
  }

  html += `
    <details class="debug-details">
      <summary>🛠️ 洞察玄机 (测试与调试秘术)</summary>
      <div class="debug-btn-grid">
        <button class="debug" onclick="debugComplete()">圆满当前心法</button>
        <button class="debug" onclick="debugAddProficiency()">熟练度满</button>
        <button class="debug" onclick="debugAddMoney()">铜钱 +1000</button>
        <button class="debug" onclick="debugAddStone()">灵石 +1000</button>
        <button class="debug" onclick="debugAddContrib()">贡献 +100</button>
        <button class="debug" onclick="debugAddFragment()">随机残卷</button>
        <button class="debug" onclick="toggleDebugRoot()">显示灵根</button>
        <button class="debug" onclick="debugStartBattleMulti()">测试群战</button>
        <button class="debug" onclick="debugStartBattle()">测试战斗</button>
        <button class="debug" onclick="debugFullHeal()">气血灵力全满</button>
        <button class="debug" onclick="debugRestoreHp()">气血全满</button>
        <button class="debug" onclick="debugRestoreMp()">灵力全满</button>
        <button class="debug" onclick="debugPromoteToMennei()">晋升门内</button>
        <button class="debug" onclick="debugAddMaterial()">加材料</button>
        <button class="debug" onclick="debugAddRecipe()">加丹方</button>
        <button class="debug" onclick="debugResetGame()" style="background:#5a1a1a; border-color:#903030;">清空数据重置</button>
      </div>
    </details>
  `;

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

  if (rank === "真传") {
    btns.push(`<button class="action-btn" onclick="openSeclusion()" ${remain <= 0 ? "disabled" : ""}>闭关</button>`);
  }

  /* ★ 删除了打零工，改为 宗门任务/杂务选择 */
  if (rank === "杂务") {
    btns.push(`<button class="action-btn" onclick="openChoreSelector()" ${remain <= 0 ? "disabled" : ""}>打杂务 / 接任务</button>`);
  } else if (RANKS.indexOf(rank) >= 1) {
    btns.push(`<button class="action-btn" onclick="openTaskSelector()" ${remain <= 0 ? "disabled" : ""}>接取宗门任务</button>`);
  }

  btns.push(`<button class="action-btn" onclick="gotoCultivate()">打坐修炼</button>`);

  if (RANKS.indexOf(rank) >= 1) {
    btns.push(`<button class="action-btn" onclick="doPatrol()" ${remain <= 0 ? "disabled" : ""}>宗门巡逻</button>`);
  }

  if (RANKS.indexOf(rank) >= 2) {
    btns.push(`<button class="action-btn" onclick="doAction('explore')" ${remain <= 0 ? "disabled" : ""}>出门探索</button>`);
    btns.push(`<button class="action-btn" onclick="doAction('garden')" ${remain <= 0 ? "disabled" : ""}>打理药园</button>`);
    btns.push(`<button class="action-btn" onclick="doAction('practice')" ${remain <= 0 ? "disabled" : ""}>练习技能</button>`);
  }
  
  if (rank !== "杂务") {
    btns.push(`<button class="action-btn" onclick="doDuel()" ${remain <= 0 ? "disabled" : ""}>对练基本功</button>`);
  }
  
  if (S.weekday === 0) {
    btns.push(`<button class="action-btn" onclick="doListenLecture()" ${remain <= 0 ? "disabled" : ""}>传功堂听讲</button>`);
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
    /* 药园收获：按玩家境界掉 1~3 品材料 */
    const count = rndInt(1, 3);
    const range = getMaterialGradeRange();
    /* 药园偏向低级材料 */
    const grade = Math.min(range.max, Math.max(1, range.min));
    const matBase = pick(["洗骨花", "草木灰", "清泉水"]);
    const itemId = `${matBase}_${grade}`;
    addItem(itemId, count);
    const item = ITEMS[itemId];
    const gradeText = item && item.grade ? `${item.grade}品` : "";
    log(`你打理药园，收获 ${item ? item.name : matBase}${gradeText} ×${count}。`, "c-good");
    consumeAction(() => showActionModal("打理药园", [
      `收获：${item ? item.name : matBase}（${gradeText}）×${count}`,
    ]));
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
  S.weekday = (S.weekday + 1) % 7;
  S.life += 1 / 365;
  morningPrompted = false;
  nightPrompted = false;
  hobbyPrompted = false;

  S.flags.npcDailyInteraction = {};
  S.flags.npcDailyGift = {};
  S.flags.npcDailyDay = S.day;

  /* ★ 辟谷丹天数递减 */
  if (S.flags.fastingDays && S.flags.fastingDays > 0) {
    S.flags.fastingDays--;
    if (S.flags.fastingDays === 0) {
      log("【辟谷】辟谷结束。", "c-normal");
    }
  }

  /* ★ 隐息丹天数递减（30 天） */
  if (S.flags.reduceEncounter && S.flags.reduceEncounter > 0) {
    S.flags.reduceEncounterDays = (S.flags.reduceEncounterDays || 30) - 1;
    if (S.flags.reduceEncounterDays <= 0) {
      S.flags.reduceEncounter = 0;
      S.flags.reduceEncounterDays = 0;
      log("【隐息丹】效果结束。", "c-normal");
    }
  }

  /* 榜单：重置每日挑战次数 */
  S.flags.dailyChallenge = 0;

  /* 榜单：每日被挑战 */
  if (typeof processDailyRankChallenge === "function") {
    processDailyRankChallenge();
  }

  if (S.life >= S.lifeMax) { die("寿元耗尽，坐化于洞府之中。"); return; }

  /* 处理残留 DOT */
  if (processDailyStatus()) return;

  /* 灵宠日常 */
  const deadPets = processDailyPets();
  if (deadPets.length > 0) {
    setTimeout(() => {
      showModal("灵宠饿死", `<p>${deadPets.map(p => p.name).join("、")} 因饥饿而死。</p>`, [
        { label: "知道了", fn: closeModal }
      ]);
    }, 500);
  }

  /* 逆天宝物日常 */
  if (typeof processDailyHeavenDefying === "function") {
    processDailyHeavenDefying();
  }

  /* 丹药 buff 每日清理 */
  processDailyPillBuff();

  /* 秘境：每月第 5 天检查 */
  if (typeof checkMonthlySecretRealm === "function") {
    checkMonthlySecretRealm();
  }
  if (typeof checkPendingSecretRealmExpire === "function") {
    checkPendingSecretRealmExpire();
  }
  if (typeof checkExpiredTasks === "function") {
    checkExpiredTasks();
  }

  checkMonthlyPay();
  checkFestival();

  /* 宗门小比（每月 15 号） */
  if (typeof checkMonthlyCompetition === "function") {
    checkMonthlyCompetition();
  }

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

  if (S.flags.story.year1004 && S.flags.story.year1004.final) {
    return;
  }

  morningPrompt();
  render();
}


/* ============================================================
   每日清理丹药 buff
   ============================================================ */

function processDailyPillBuff() {
  /* 修炼 buff：扣天数 */
  if (S.flags.cultivateBuff) {
    S.flags.cultivateBuff.days = (S.flags.cultivateBuff.days || 0) - 1;
    if (S.flags.cultivateBuff.days <= 0) {
      delete S.flags.cultivateBuff;
    }
  }

  /* 血煞丹 buff：扣天数 */
  if (S.flags.bloodRage) {
    S.flags.bloodRage.days = (S.flags.bloodRage.days || 0) - 1;
    if (S.flags.bloodRage.days <= 0) {
      delete S.flags.bloodRage;
    }
  }

  /* 突破加成 buff：一次性，新一天清除 */
  if (S.flags.pillBuff && S.flags.pillBuff.breakBonus) {
    /* 保留，等突破时消耗（见 cultivate.js 的 calcBreakRate） */
    /* 这里不动 */
  }

  /* 炼丹 buff：凝火丹（新一天清除） */
  if (S.flags.alchemyBuff) {
    if (typeof processDailyAlchemyBuff === "function") {
      processDailyAlchemyBuff();
    } else {
      delete S.flags.alchemyBuff;
    }
  }

  /* 炼器 buff */
  if (S.flags.forgeBuff) delete S.flags.forgeBuff;
  if (S.flags.forgeProtect) delete S.flags.forgeProtect;

  /* 灵宠每日 buff 相关（保留） */
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


/* ============================================================
   杂务/任务选择弹窗
   ============================================================ */

function openChoreSelector() {
  if (S.actionsUsed >= ACTIONS_PER_SLOT) { log("行动已用完。", "c-bad"); return; }

  const chores = [
    { id: "chai", name: "砍柴", skill: "刀" },
    { id: "tiao", name: "挑水", skill: "掌" },
    { id: "cai",  name: "种菜", skill: "掌" },
    { id: "ji",   name: "养鸡", skill: "兽" }
  ];

  const html = chores.map(c => `
    <button class="block" onclick="startManualChore('${c.id}')">
      ${c.name}（练${c.skill}）
    </button>
  `).join("");

  showModal("选择杂务", `<p>你要做什么活？</p>${html}`, [
    { label: "取消", fn: closeModal }
  ]);
}

function startManualChore(choreId) {
  closeModal();
  const chore = CHORES_FAN.find(c => c.id === choreId);
  if (!chore) return;

  S.actionsUsed++;
  const { inc, skillGains } = gainChoreSkill(chore, 1);

  /* 给一点点铜钱作为打杂收入 */
  const moneyGain = rndInt(2, 6);
  S.money += moneyGain;

  log(`你花了些时间【${chore.name}】。`, "c-normal");
  const detail = [`熟练 +${inc}`, `铜钱 +${moneyGain}`];
  skillGains.forEach(s => detail.push(`技能 ${s}`));

  consumeAction(() => showActionModal("打杂结束", detail));
}

function openTaskSelector() {
  if (S.flags.activeTasks && S.flags.activeTasks.length > 0) {
    showModal("提示", `<p>你有未完成的任务，请先完成。</p>`, [{ label: "好", fn: closeModal }]);
    return;
  }
  
  const available = getAvailableTasks();
  if (available.length === 0) {
    showModal("提示", `<p>当前没有可接取的任务。</p>`, [{ label: "好", fn: closeModal }]);
    return;
  }

  const html = available.map(t => `
    <div class="card">
      <b>${t.name}</b> <span class="tag">截止 ${t.deadline} 天</span>
      <div class="small">${t.desc}</div>
      <button class="block" onclick="closeModal(); acceptTask('${t.id}')">接取任务</button>
    </div>
  `).join("");

  showModal("宗门任务", html, [{ label: "关闭", fn: closeModal }]);
}


function openSeclusion() {
  showModal("闭关", `
    <p>选择闭关天数（1~30）：</p>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
      ${[1, 3, 7, 15, 30].map(d =>
        `<button onclick="closeModal(); startSeclusion(${d})">${d} 天</button>`
      ).join("")}
    </div>
  `, [{ label: "取消", fn: closeModal }]);
}