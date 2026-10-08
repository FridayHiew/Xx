/* ============================================================
   systems/cultivate.js - 修炼 / 突破 / 属性计算
   ============================================================ */

/* 属性 */
function totalAtk() {
  let a = S.atk;
  for (const slot in S.equipped) {
    const id = S.equipped[slot];
    if (id) {
      const eq = EQUIPS.find(x => x.id === id);
      if (eq) a += eq.atk || 0;
    }
  }
  a += getHeartBonus().atk;
  return a;
}
function totalDef() {
  let d = S.def;
  for (const slot in S.equipped) {
    const id = S.equipped[slot];
    if (id) {
      const eq = EQUIPS.find(x => x.id === id);
      if (eq) d += eq.def || 0;
    }
  }
  d += getHeartBonus().def;
  return d;
}
function totalMaxHp() {
  return S.hpMax + getHeartBonus().hp;
}
function totalMaxMp() {
  return S.mpMax + getHeartBonus().mp;
}

/* 修炼速度 */
function cultivateGain() {
  const art = getCurrentArt();
  const rr = rootRate(S.roots);
  const match = art ? calcArtMatch(art) : 50;
  const matchBonus = 0.5 + match / 100;

  let caveSpirit;
  const rank = S.flags.rank || "杂务";
  if (rank === "杂务" || rank === "门外") caveSpirit = 1;
  else caveSpirit = 1 + S.cave.spirit;

  let base = 5 * rr * matchBonus * caveSpirit;
  base *= [0.5, 0.8, 1.0, 1.2, 1.5][S.mood + 2];
  if ((S.flags.hungerStreak || 0) >= 3) base *= 0.8;
  return base;
}

/* 打坐 */

function doCultivate(count) {
  count = count || 1;
  const remain = ACTIONS_PER_SLOT - S.actionsUsed;
  count = Math.min(count, remain);
  if (count <= 0) return;

  const check = canCultivateHeart();
  if (!check.ok) { log(`无法修炼：【${check.reason}】`, "c-bad"); return; }

  const art = getCurrentArt();
  const prog = getArtProgress(art.id);

  let totalHeart = 0;
  let totalExp = 0;
  let stopped = false;
  let fragmentStop = false;

  const realmBonus = calcRealmBonus(art);

  for (let i = 0; i < count; i++) {
    if (S.actionsUsed >= ACTIONS_PER_SLOT) { stopped = true; break; }

    /* 熟练度 */
    const rr = heartRateByRoot(S.roots);
    const inc = rnd(0.15, 0.6) * rr;
    prog.proficiency = Math.min(100, prog.proficiency + inc);
    totalHeart += inc;

    /* 熟练度 100 → 修为涨 */
    if (prog.proficiency >= 100) {
      const curLevelData = art.levels.find(l => l.lvl === prog.lvl);

      if (prog.lvl === 0) {
        /* 凡人阶段：不涨修为 */
      } else if (prog.lvl >= prog.maxLearn) {
        /* 达到残卷上限，停止涨修为 */
        fragmentStop = true;
      } else if (curLevelData && prog.lvl < art.maxLvl) {
        const expGain = 10 * rr * realmBonus * rnd(0.9, 1.1);
        prog.exp += expGain;
        totalExp += expGain;
        if (prog.exp >= curLevelData.expNeed) {
          prog.exp = Math.min(prog.exp, curLevelData.expNeed);
        }
      }
    }

    S.actionsUsed++;
  }

  recalcPlayerStats();

  const detail = [];
  if (totalHeart > 0) detail.push(`熟练度 +${totalHeart.toFixed(2)}（${prog.proficiency.toFixed(2)}/100）`);
  if (realmBonus > 1) detail.push(`境界加成 ×${realmBonus.toFixed(1)}`);
  if (totalExp > 0) {
    const curLevelData = art.levels.find(l => l.lvl === prog.lvl);
    const need = curLevelData ? curLevelData.expNeed : 0;
    detail.push(`修为 +${fmt(totalExp)}（${fmt(prog.exp)}/${fmt(need)}）`);
  }
  if (fragmentStop) detail.push(`⚠ 已达残卷上限 Lv.${prog.maxLearn}，需寻找后续残卷`);
  detail.push(`消耗 ${count} 行动`);
  if (stopped) detail.push("已达上限，提前结束");

  log(`打坐 ${count} 次，` + detail[0], "c-good");

  if (S.actionsUsed >= ACTIONS_PER_SLOT && S.hour < 2) {
    S.hour++;
    S.actionsUsed = 0;
    log(`【时间】进入${HOURS[S.hour]}。`, "c-blue");
    if (S.hour === 2) setTimeout(() => { nightPrompt(); }, 300);
  }

  save(); render();
  showActionModal("打坐修炼", detail);
}


/* 属性重算 */
function recalcPlayerStats() {
  const info = getPlayerRealmInfo();
  const hb = getHeartBonus();

  const baseHp = 60 + info.lvl * 25 + (info.realm - 1) * 100;
  S.hpMax = baseHp + hb.hp;
  S.hp = Math.min(S.hp, S.hpMax);

  if (info.realm === 0) {
    S.mpMax = 0;
    S.mp = 0;
  } else {
    const baseMp = 20 + info.lvl * 6 + (info.realm - 1) * 50;
    S.mpMax = baseMp + hb.mp;
    S.mp = Math.min(S.mp, S.mpMax);
  }
}

/* 灵石修炼 */
function cultivateWithStoneItem() {
  const info = getPlayerRealmInfo();
  if (info.realm === 0) { log("凡人阶段无法使用灵石辅助。", "c-bad"); return; }
  const stoneCount = S.items["灵石"] || 0;
  if (stoneCount < 1) { log("背包中没有灵石。", "c-bad"); return; }
  if (S.actionsUsed >= ACTIONS_PER_SLOT) { log("本时段行动已用完。", "c-bad"); return; }

  const check = canCultivateHeart();
  if (!check.ok) { log(`无法修炼：【${check.reason}】`, "c-bad"); return; }

  S.actionsUsed++;
  S.items["灵石"]--;
  if (S.items["灵石"] <= 0) delete S.items["灵石"];

  const art = getCurrentArt();
  const prog = getArtProgress(art.id);

  if (prog.proficiency < 100) {
    log("熟练度未满 100，灵石修炼无效。", "c-bad");
    S.items["灵石"] = (S.items["灵石"] || 0) + 1;
    S.actionsUsed--;
    return;
  }

  const rr = heartRateByRoot(S.roots);
  const gain = 30 * rr * rnd(0.9, 1.1);
  const curLevelData = art.levels.find(l => l.lvl === prog.lvl);
  if (prog.lvl > 0 && curLevelData && prog.lvl < art.maxLvl) {
    prog.exp = Math.min(prog.exp + gain, curLevelData.expNeed);
    log(`使用灵石修炼，修为 +${fmt(gain)}。`, "c-gold");
  } else {
    log("当前心法无法通过灵石提升。", "c-bad");
    S.items["灵石"] = (S.items["灵石"] || 0) + 1;
    S.actionsUsed--;
    return;
  }

  recalcPlayerStats();
  consumeAction(() => showActionModal("灵石修炼", [`修为 +${fmt(gain)}`, `灵石 -1`]));
}

/* ========== 突破 ========== */

function calcFanBreakRate() {
  const mx = maxRoot(S.roots);
  if (mx.val === 0) return 0.005;

  const art = getCurrentArt();
  const match = art ? calcArtMatch(art) : 50;

  let rate = 0;
  rate += mx.val * 0.07;
  rate += (match - 50) / 1000;
  rate += S.luck * 0.05;

  if (S.mood > 0) rate += Math.random() * (S.mood * 0.05);
  else if (S.mood < 0) rate -= Math.random() * (Math.abs(S.mood) * 0.05);

  return Math.max(0.005, Math.min(0.90, rate));
}

function tryBreak() {
  const art = getCurrentArt();
  if (!art) { log("没有心法。", "c-bad"); return; }
  const prog = getArtProgress(art.id);

  /* 凡人阶段：突破 → 炼气 1 重 */
  if (prog.lvl === 0) {
    if (prog.proficiency < 100) { log("熟练度尚未圆满。", "c-bad"); return; }
    if (S.flags.breakAttemptedToday) { log("今日已尝试突破。", "c-bad"); return; }

    const check = canCultivateHeart();
    if (!check.ok) { log(`无法突破：【${check.reason}】`, "c-bad"); return; }

    const rate = calcFanBreakRate();
    const mx = maxRoot(S.roots);
    const match = calcArtMatch(art);
    const moodEmoji = MOOD_EMOJI[S.mood + 2];
    const moodName = MOOD_NAMES[S.mood + 2];

    let moodHint = "";
    if (S.mood > 0) moodHint = `<span style="color:#7fbf5f;">加成 0 ~ +${S.mood * 5}%</span>`;
    else if (S.mood < 0) moodHint = `<span style="color:#d05a4a;">惩罚 -${Math.abs(S.mood) * 5}% ~ 0</span>`;
    else moodHint = `<span style="color:#8a7a5a;">无影响</span>`;

    showModal("突破 · 凡人 → 炼气", `
      <p>你心法《${art.name}》已圆满，尝试引气入体。</p>
      <p><b>突破成功率：${(rate * 100).toFixed(1)}%</b></p>
      <div class="card">
        <div class="row"><span>灵根 ${mx.val} × 7%</span><span>+${(mx.val * 7).toFixed(1)}%</span></div>
        <div class="row"><span>心法匹配 ${match}%</span><span>${((match - 50) / 10 >= 0 ? "+" : "")}${((match - 50) / 10).toFixed(1)}%</span></div>
        <div class="row"><span>运气 ${S.luck} × 5%</span><span>+${(S.luck * 5).toFixed(1)}%</span></div>
        <div class="row"><span>心情 ${moodName} ${moodEmoji}</span><span>${moodHint}</span></div>
      </div>
      <p class="small">失败：熟练度 -30，气血 -30%，心情 -1。</p>
    `, [
      { label: "开始突破", fn: () => doFanBreak(rate) },
      { label: "取消", fn: closeModal },
    ]);
    return;
  }

  /* 炼气以上：修为满 → 升到下一级 */
  if (prog.lvl >= art.maxLvl) {
    log("心法已满级，请兑换更高心法。", "c-bad");
    return;
  }
  const curLevelData = art.levels.find(l => l.lvl === prog.lvl);
  if (!curLevelData || prog.exp < curLevelData.expNeed) {
    log("修为尚未圆满。", "c-bad");
    return;
  }

  doBreak(prog.lvl + 1);
}

function doFanBreak(rate) {
  closeModal();
  S.flags.breakAttemptedToday = true;
  const art = getCurrentArt();
  const prog = getArtProgress(art.id);

  if (Math.random() < rate) {
    prog.lvl = 1;
    prog.proficiency = 100;
    prog.exp = 0;

    const r = REALMS[1];
    S.lifeMax = r.life;

    recalcPlayerStats();
    updateElementLvl();
    updateElementLvl();
    S.hp = S.hpMax;
    S.mp = S.mpMax;

    log(`【引气入体】你成功踏入炼气期！`, "c-gold");
    S.mood = 2;
    save(); render();
    showActionModal("突破成功", [
      "你成功踏入炼气期·1重！",
      "寿元 +40",
      "心情 +2",
      `心法《${art.name}》达到 Lv.1`,
    ]);
  } else {
    prog.proficiency = Math.max(0, prog.proficiency - 30);
    S.hp -= Math.floor(S.hpMax * 0.3);
    S.mood = Math.max(-2, S.mood - 1);
    log(`【突破失败】熟练度 -30，气血受损。`, "c-bad");
    save(); render();
    if (S.hp <= 0) { die("引气失败，气血耗尽而亡。"); return; }
    showActionModal("突破失败", ["熟练度 -30", "气血 -30%", "心情 -1"]);
  }
}

function doBreak(nextLvl) {
  closeModal();
  const art = getCurrentArt();
  const prog = getArtProgress(art.id);

  prog.lvl = nextLvl;
  prog.exp = 0;
  prog.proficiency = 100;

  recalcPlayerStats();

  const info = getPlayerRealmInfo();
  log(`【突破成功】${art.name} 达到 Lv.${prog.lvl}！`, "c-gold");
  save(); render();
  showActionModal("突破成功", [
    `心法《${art.name}》达到 Lv.${prog.lvl}`,
    `境界：${REALMS[info.realm].name}·${info.lvl}重`,
  ]);
}