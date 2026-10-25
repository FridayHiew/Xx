/* ============================================================
   systems/seclusion.js - 闭关
   ============================================================ */

/* 开始闭关 */
function startSeclusion(days) {
  const rank = S.flags.rank || "杂务";
  if (rank !== "真传") {
    log("只有真传弟子才可闭关。", "c-bad");
    return;
  }

  if (days < 1 || days > 30) {
    log("闭关天数需在 1~30 之间。", "c-bad");
    return;
  }

  const art = getCurrentArt();
  if (!art) {
    log("没有心法，无法闭关。", "c-bad");
    return;
  }

  const prog = getArtProgress(art.id);
  if (prog.lvl >= prog.maxLearn && prog.exp >= (art.levels.find(l => l.lvl === prog.lvl)?.expNeed || 0)) {
    log("当前心法已圆满，闭关无益。", "c-bad");
    return;
  }

  showModal("闭关确认", `
    <p>你将在洞府中闭关 <b>${days}</b> 天。</p>
    <p class="small">期间无法做别的事，寿元消耗 ${days} 年。</p>
    <p class="small">修炼效率 ×1.2~1.5 倍。</p>
    <p class="small" style="color:var(--c-bad);">⚠ 闭关期间仍会受毒伤、灵宠仍会饥饿、月俸/节日照常结算。</p>
  `, [
    { label: "取消", fn: closeModal },
    { label: "开始闭关", primary: true, fn: () => {
      closeModal();
      doSeclusion(days);
    }},
  ]);
}

function doSeclusion(days) {
  const art = getCurrentArt();
  const prog = getArtProgress(art.id);
  const rr = heartRateByRoot(S.roots);
  const realmBonus = calcRealmBonus(art);

  let totalExp = 0;
  let totalProficiency = 0;
  const origDay = S.day;

  /* 记录闭关途中被动事件 */
  const passiveEvents = [];
  let died = false;
  let deathReason = "";

  for (let i = 0; i < days; i++) {
    /* -------- 每天修炼 -------- */
    const effMul = 1.2 + Math.random() * 0.3;
    const profInc = rnd(0.15, 0.6) * rr;
    prog.proficiency = Math.min(100, prog.proficiency + profInc);
    totalProficiency += profInc;

    if (prog.proficiency >= 100) {
      const curLevelData = art.levels.find(l => l.lvl === prog.lvl);
      if (curLevelData && prog.lvl > 0 && prog.lvl < art.maxLvl && prog.exp < curLevelData.expNeed) {
        const gain = 10 * rr * realmBonus * effMul * rnd(0.9, 1.1);
        prog.exp = Math.min(curLevelData.expNeed, prog.exp + gain);
        totalExp += gain;
      }
    }

    /* -------- 时间推进（C4 修复：同步 weekday） -------- */
    S.day++;
    S.weekday = (S.weekday + 1) % 7;
    S.life += 1 / 365;

    /* -------- 寿元检查 -------- */
    if (S.life >= S.lifeMax) {
      died = true;
      deathReason = "寿元耗尽，坐化于洞府之中。";
      break;
    }

    /* -------- C5 修复：被动日结 -------- */
    const tick = runSeclusionDailyTick(i + 1, origDay);
    if (tick.events.length > 0) {
      passiveEvents.push(...tick.events);
    }
    if (tick.died) {
      died = true;
      deathReason = tick.deathReason;
      break;
    }
  }

  recalcPlayerStats();
  S.hp = totalMaxHp();
  S.mp = totalMaxMp();

  /* 出关清理交互状态 */
  S.hour = 0;
  S.actionsUsed = 0;
  S.dailyQuest = null;
  morningPrompted = false;
  nightPrompted = false;
  hobbyPrompted = false;
  S.flags.npcDailyInteraction = {};
  S.flags.npcDailyGift = {};
  S.flags.npcDailyDay = S.day;
  S.flags.breakAttemptedToday = false;
  S.flags.dailyChallenge = 0;

  /* 如果闭关途中死了 */
  if (died) {
    log(`【闭关中断】${deathReason}`, "c-bad");
    save();
    die(deathReason);
    return;
  }

  /* 出关 */
  log(`【闭关结束】你闭关 ${days} 天。`, "c-gold");
  log(`修为 +${fmt(totalExp)}，熟练度 +${totalProficiency.toFixed(1)}`, "c-good");

  /* 被动事件写日志 */
  passiveEvents.forEach(e => log(e.text, e.cls));

  save();
  render();

  /* 出关汇总弹窗 */
  const detail = [
    `闭关 ${days} 天（第 ${origDay + 1} ~ ${S.day} 天）`,
    `修为 +${fmt(totalExp)}`,
    `熟练度 +${totalProficiency.toFixed(2)}`,
    `寿元消耗 ${days} 年`,
  ];
  if (passiveEvents.length > 0) {
    detail.push("—— 闭关期间 ——");
    passiveEvents.forEach(e => detail.push(e.text));
  }

  showActionModal("闭关结束", detail);
}

/* ============================================================
   闭关被动日结（C5 修复）
   ------------------------------------------------------------
   每天调用一次，模拟"不出门"情况下的被动事件：
   - 丹药 buff 天数扣减
   - 毒发 DOT（可能致死）
   - 灵宠饥饿（可能饿死）
   - 月俸（15 天一次）
   - 节日（特定日期）
   - 逆天宝物冷却
   不触发：小比、秘境、任务过期、传功堂、巡逻、日常杂务。
   ============================================================ */
function runSeclusionDailyTick(dayIdx, origDay) {
  const events = [];
  let died = false;
  let deathReason = "";

  /* 1. 丹药 buff 天数扣减 */
  if (typeof processDailyPillBuff === "function") {
    processDailyPillBuff();
  }

  /* 2. 毒发 DOT（残留状态扣血） */
  if (typeof processDailyStatus === "function") {
    /* processDailyStatus 内部若致死会调 die()，会直接弹窗；
       这里为避免嵌套死亡弹窗，先在闭关内自己算 DOT，
       不调用 processDailyStatus，避免它直接 die()。 */
    if (S.statuses && S.statuses.length > 0) {
      let totalDmg = 0;
      S.statuses.forEach(s => {
        const def = getStatusDef(s.id);
        if (def && def.dmgPerTurn) {
          const stacks = s.stacks || 1;
          const resist = (S.resistances && S.resistances[s.id]) || 0;
          const mod = resistToMod(resist);
          let dmg = def.dmgPerTurn * stacks * mod.dmg;
          if (dmg < 0) {
            S.hp = Math.min(totalMaxHp(), S.hp + Math.abs(dmg));
          } else {
            totalDmg += dmg;
          }
        }
        s.turns--;
      });
      S.statuses = S.statuses.filter(s => s.turns > 0);
      if (totalDmg > 0) {
        S.hp -= totalDmg;
        events.push({ text: `第 ${dayIdx} 天：毒发，气血 -${Math.floor(totalDmg)}`, cls: "c-bad" });
        if (S.hp <= 0) {
          S.hp = 0;
          died = true;
          deathReason = "闭关中剧毒发作，毒发身亡。";
        }
      }
    }
  }

  /* 3. 灵宠饥饿 */
  if (!died && typeof processDailyPets === "function") {
    const deadPets = processDailyPets();
    if (deadPets && deadPets.length > 0) {
      const names = deadPets.map(p => p.name).join("、");
      events.push({ text: `第 ${dayIdx} 天：灵宠 ${names} 因饥饿而死。`, cls: "c-bad" });
    }
  }

  /* 4. 月俸（15 天一次） */
  if (!died && typeof checkMonthlyPay === "function") {
    const prevDay = S.day - 1;
    checkMonthlyPay();
    if (S.flags.lastPayDay === S.day) {
      events.push({ text: `第 ${dayIdx} 天：领取月俸。`, cls: "c-gold" });
    }
  }

  /* 5. 节日 */
  if (!died && typeof checkFestival === "function") {
    checkFestival();
  }

  /* 6. 逆天宝物冷却 */
  if (!died && typeof processDailyHeavenDefying === "function") {
    processDailyHeavenDefying();
  }

  return { events, died, deathReason };
}