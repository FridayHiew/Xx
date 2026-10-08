/* ============================================================
   systems/chores.js - 杂务 / 日常
   ============================================================ */

/* 杂务熟练度增长 +0.5~1.0，有工具 +0.5 */
function gainChoreSkill(chore, amount = 1) {
  const cur = S.choreSkill[chore.id] || 0;
  let inc = rnd(0.5, 1.0) * amount;

  for (const tid in S.tools) {
    const tool = SHOP_ITEMS.find(x => x.id === tid);
    if (tool && tool.chore === chore.id) inc += 0.5 * amount;
  }

  inc = +inc.toFixed(2);
  S.choreSkill[chore.id] = Math.min(100, +(cur + inc).toFixed(2));

  const skillGains = [];
  for (const k in chore.gain) {
    if (S.skills[k]) {
      S.skills[k].exp = +(S.skills[k].exp + chore.gain[k] * amount).toFixed(2);
      let leveled = false;
      while (S.skills[k].exp >= SKILL_LVL_EXP && S.skills[k].lvl < MAX_SKILL_LVL) {
        S.skills[k].exp = +(S.skills[k].exp - SKILL_LVL_EXP).toFixed(2);
        S.skills[k].lvl++;
        log(`【技能提升】你的 ${k} 提升到 Lv.${S.skills[k].lvl}！`, "c-gold");
        leveled = true;
      }
      skillGains.push(`${k} +${(chore.gain[k] * amount).toFixed(1)}${leveled ? " (升级!)" : ""}`);
    }
  }
  return { inc, skillGains };
}

/* 执行今日杂务 */
function doChore() {
  const q = S.dailyQuest;
  if (!q || q.done >= q.amount) { log("今日杂务已完成。", "c-normal"); return; }
  if (S.actionsUsed >= ACTIONS_PER_SLOT) { log("本时段行动已用完。", "c-bad"); return; }
  if (S.hour === 2) { log("晚上不做杂务。", "c-bad"); return; }

  const remain = ACTIONS_PER_SLOT - S.actionsUsed;
  const todo = Math.min(q.amount - q.done, remain);

  const chore = q.chore;
  const actualNeed = calcChoreActions(todo, remain);

  let totalInc = 0;
  const detail = [];
  for (let i = 0; i < todo; i++) {
    q.done++;
    const { inc } = gainChoreSkill(chore, 1);
    totalInc += inc;
  }
  S.actionsUsed += actualNeed;

  const rank = S.flags.rank || "杂务";
  if (rank !== "杂务") {
    S.contrib += 1;
    detail.push(`宗门贡献 +1`);
  }

  log(`完成 ${todo} 次${chore.name}（耗时 ${actualNeed} 行动），熟练 +${totalInc.toFixed(2)}。`, "c-normal");
  detail.unshift(`执行了 ${todo} 次${chore.name}（消耗 ${actualNeed} 行动）`);
  detail.push(`熟练度 +${totalInc.toFixed(2)}（当前 ${S.choreSkill[chore.id].toFixed(2)}%）`);
  detail.push(`任务进度：${q.done}/${q.amount}`);
  if (q.done >= q.amount) {
    log(`今日 ${chore.name} 全部完成。`, "c-good");
    detail.push("今日任务完成！");
  } else {
    detail.push("今日任务未完成，晚餐需自费");
  }

  if (S.actionsUsed >= ACTIONS_PER_SLOT && S.hour < 2) {
    S.hour++;
    S.actionsUsed = 0;
    log(`【时间】进入${HOURS[S.hour]}。`, "c-blue");
    if (S.hour === 2) setTimeout(() => { nightPrompt(); }, 300);
  }

  save(); render();
  showActionModal("杂务 · " + chore.name, detail);
}

/* 打零工 */
function doPartTime() {
  if (S.actionsUsed >= ACTIONS_PER_SLOT) { log("本时段行动已用完。", "c-bad"); return; }
  S.actionsUsed++;
  const rank = S.flags.rank || "杂务";
  const chores = rank === "杂务" ? CHORES_FAN : rank === "门外" ? CHORES_MENWAI : CHORES_MENNEI;
  const chore = pick(chores);
  const { inc, skillGains } = gainChoreSkill(chore, 1);

  let moneyGain = 0, stoneGain = 0;
  const art = getCurrentArt();
  const moneyBonus = (art && art.bonus && art.bonus.money) ? art.bonus.money : 0;

  if (isStoneTier()) {
    stoneGain = Math.floor(rndInt(3, 8) * (1 + moneyBonus));
    S.stone += stoneGain;
  } else {
    moneyGain = Math.floor(rndInt(2, 6) * (1 + moneyBonus));
    S.money += moneyGain;
  }

  log(`你打了一份零工（${chore.name}）。`, "c-normal");
  const detail = [`零工：${chore.name}`, `熟练 +${inc}（${S.choreSkill[chore.id].toFixed(2)}%）`];
  skillGains.forEach(s => detail.push(`技能 ${s}`));
  if (stoneGain > 0) detail.push(`灵石 +${stoneGain}`);
  if (moneyGain > 0) detail.push(`铜钱 +${moneyGain}`);

  consumeAction(() => showActionModal("打零工", detail));
}

/* 清晨执事安排任务 */
function morningPrompt() {
  if (morningPrompted) return;
  if (S.hour !== 0) return;
  if (S.dailyQuest) return;
  morningPrompted = true;

  const rank = S.flags.rank || "杂务";
  const chores = rank === "杂务" ? CHORES_FAN : rank === "门外" ? CHORES_MENWAI : CHORES_MENNEI;
  const chore = pick(chores);

  /* 门内以上用"训练灵兽"等；这里根据身份发任务者 */
  let giver;
  if (rank === "杂务") {
    giver = S.npcs.find(n => n.role === "执事" && n.alive);
  } else {
    giver = S.npcs.find(n => (n.role === "长老" || n.role === "峰主" || n.role === "门外长老") && n.alive);
  }

  let amount;
  if (giver) {
    if (giver.aff >= 70) amount = rndInt(1, 3);
    else if (giver.aff >= 40) amount = rndInt(3, 6);
    else if (giver.aff >= 20) amount = rndInt(5, 9);
    else amount = rndInt(8, 12);
  } else {
    amount = rndInt(4, 8);
  }
  S.dailyQuest = { chore, amount, done: 0 };

  const quoteFn = pick(ZHISHI_QUOTES);
  const q = quoteFn(amount, chore.name);
  log(`【${giver ? giver.role : "长老"}】今日安排：${chore.name} ×${amount}。`, "c-gold");

  showModal(`${giver ? giver.role : "长老"}安排`, `
    <p>${giver ? giver.name : "长老"}：</p>
    <p class="${q.tone}" style="font-size:14px;">${q.text}</p>
    <p class="small">今日任务：<b>${chore.name} × ${amount}</b></p>
  `, [{ label: "知道了", fn: () => { closeModal(); render(); } }]);
}

/* 夜晚晚餐 */
function nightPrompt() {
  if (nightPrompted) return;
  if (S.hour !== 2) return;
  nightPrompted = true;

  const done = S.dailyQuest && S.dailyQuest.done >= S.dailyQuest.amount;
  const canFree = done;

  let body, actions;
  if (canFree) {
    body = `<p>傍晚的食堂热闹非凡。</p><p>你今日任务已完成，<b>晚餐免费</b>。</p>`;
    actions = [{ label: "吃晚餐（免费）", fn: () => { eatDinner(true); } }];
  } else {
    const cur = getCurrency();
    if (cur >= 50) {
      body = `<p>傍晚的食堂热闹非凡。</p>
        <p>你今日任务未完成，晚餐需要 <b>50 ${currencyName()}</b>。</p>
        <p class="small">当前${currencyName()}：${cur}</p>`;
      actions = [
        { label: `花 50 ${currencyName()}吃`, fn: () => { eatDinner(false); } },
        { label: "饿肚子", fn: () => { skipDinner(); } },
      ];
    } else {
      body = `<p>傍晚的食堂热闹非凡。</p><p>你今日任务未完成，且钱不够。</p><p class="small">只能饿肚子了。</p>`;
      actions = [{ label: "饿肚子", fn: () => { skipDinner(); } }];
    }
  }
  showModal("食堂晚餐", body, actions);
}


function eatDinner(free) {
  const cost = 50;
  if (!free) {
    if (!spendCurrency(cost)) {
      log("钱不够。", "c-bad");
      closeModal(); render();
      return;
    }
  }

  S.mood = Math.min(2, S.mood + 1);
  S.flags.hungerStreak = 0;

  /* 恢复气血/灵力各 10% */
  const hpGain = Math.floor(totalMaxHp() * 0.1);
  const mpGain = Math.floor(totalMaxMp() * 0.1);
  S.hp = Math.min(totalMaxHp(), S.hp + hpGain);
  S.mp = Math.min(totalMaxMp(), S.mp + mpGain);

  log(`你在食堂吃了一顿晚餐，心情 +1，气血 +${hpGain}，灵力 +${mpGain}。`, "c-good");

  const detail = [
    `心情 +1`,
    free ? "免费" : `${currencyName()} -${cost}`,
    `气血 +${hpGain}`,
    `灵力 +${mpGain}`,
  ];

  if (chance(0.4)) {
    const npc = pickAliveNPC();
    if (npc) {
      npc.aff += 2;
      S.metNpcs[npc.id] = true;
      log(`你在食堂遇到 ${npc.name}，聊了几句，好感+2。`, "c-blue");
      detail.push(`遇到 ${npc.name}，好感 +2`);
    }
  }

  closeModal();
  showActionModal("晚餐", detail, () => {
    save(); render();
    setTimeout(() => hobbyPrompt(), 300);
  });
}


function skipDinner() {
  S.mood = Math.max(-2, S.mood - 1);
  S.flags.hungerStreak = (S.flags.hungerStreak || 0) + 1;
  log(`你饿着肚子回到屋里。心情-1（连续 ${S.flags.hungerStreak} 天）`, "c-bad");

  const detail = ["心情 -1", `连续饿肚子 ${S.flags.hungerStreak} 天`];
  if (S.flags.hungerStreak >= 3) {
    S.hp -= 10;
    log(`【虚弱】气血 -10。`, "c-bad");
    detail.push("虚弱：气血 -10");
    if (S.hp <= 0) { closeModal(); die("饥寒交迫，倒在了屋中。"); return; }
  }
  closeModal();
  showActionModal("饿肚子", detail, () => {
    save(); render();
    setTimeout(() => hobbyPrompt(), 300);
  });
}

/* 爱好（35% 触发） */
function hobbyPrompt() {
  if (hobbyPrompted) return;
  hobbyPrompted = true;
  if (!S.hobbies || S.hobbies.length === 0) return;
  if (!chance(0.35)) return;

  const remain = ACTIONS_PER_SLOT - S.actionsUsed;
  if (remain <= 0) return;

  const hobby = pick(S.hobbies);
  const quote = HOBBY_QUOTES[hobby] || `你花时间在【${hobby}】上。`;
  S.actionsUsed++;
  S.hobbySkill[hobby] = Math.min(100, (S.hobbySkill[hobby] || 0) + rnd(0.1, 0.5));
  S.mood = Math.min(2, S.mood + 1);

  log(`【爱好】你花时间在【${hobby}】上。`, "c-pink");
  log(`  心情 +1，${hobby} 熟练度提升。`, "c-good");

  save(); render();
  showActionModal(`晚餐后 · ${hobby}`, [
    quote,
    "心情 +1",
    `${hobby} 熟练度 +0.1~0.5`,
    `消耗 1 行动（剩 ${ACTIONS_PER_SLOT - S.actionsUsed}）`,
  ]);
}

/* 月俸（15 天一次） */
function checkMonthlyPay() {
  if (S.day > 0 && S.day % 15 === 0 && S.flags.lastPayDay !== S.day) {
    const rank = S.flags.rank || "杂务";
    const realmMultiplier = 1 + S.realm * 0.5;
    const basePay = RANK_PAY[rank] || 10;
    const pay = Math.floor(basePay * realmMultiplier);
    addCurrency(pay);
    S.flags.lastPayDay = S.day;
    log(`【月俸】第 ${S.day} 天，你领取了俸禄：${pay} ${currencyName()}。`, "c-gold");
  }
}

/* 节日 */
function checkFestival() {
  const fest = getFestival();
  if (!fest) return;
  const di = getDateInfo();
  const key = `${di.year}-${fest.name}`;
  if (S.flags.festivalYear[key]) return;
  S.flags.festivalYear[key] = true;

  const rank = S.flags.rank || "杂务";
  const base = FESTIVAL_BASE;
  const rankBonus = FESTIVAL_RANK_BONUS[rank] || 10;
  const contribBonus = Math.floor(S.contrib * 0.1 * rnd(0.5, 1.5));
  const amount = base + rankBonus + contribBonus;

  /* 杂务发铜钱，其他发灵石 */
  if (rank === "杂务") {
    S.money += amount;
    log(`【节日·${fest.name}】宗门派发 ${amount} 铜钱！`, "c-gold");
    showModal(`节日 · ${fest.name}`, `
      <p>今日是<b>${fest.name}</b>，宗门大派利是。</p>
      <p>你收到 <b>${amount} 铜钱</b>（基础 ${base} + 身份 ${rankBonus} + 贡献 ${contribBonus}）。</p>
      <p class="small">祝你${fest.bonus}愉快！</p>
    `, [{ label: "谢谢", fn: closeModal }]);
  } else {
    S.stone += amount;
    log(`【节日·${fest.name}】宗门派发 ${amount} 灵石！`, "c-gold");
    showModal(`节日 · ${fest.name}`, `
      <p>今日是<b>${fest.name}</b>，宗门大派利是。</p>
      <p>你收到 <b>${amount} 灵石</b>（基础 ${base} + 身份 ${rankBonus} + 贡献 ${contribBonus}）。</p>
      <p class="small">祝你${fest.bonus}愉快！</p>
    `, [{ label: "谢谢", fn: closeModal }]);
  }
}