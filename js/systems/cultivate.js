/* ============================================================
   systems/cultivate.js - 修炼 / 突破 / 属性计算
   ============================================================ */

/* ============================================================
   属性（含逆天宝物）
   ============================================================ */

function totalAtk() {
  let a = S.atk;
  for (const slot in S.equipped) {
    if (slot === "heavenDefying") continue;
    const id = S.equipped[slot];
    if (id) {
      const eq = findEquipById(id);
      if (eq) a += eq.atk || 0;
    }
  }
  a += getHeartBonus().atk;

  /* ★ 词条加成 */
  if (typeof getAffixBonuses === "function") {
    const ab = getAffixBonuses();
    a += ab.atk;
  }

  /* 逆天宝物 */
  const hd = getCurrentHeavenDefyingEffect();
  if (hd) {
    if (hd.atkMul) a *= (1 + hd.atkMul);
    if (hd.special === "killStack") a *= (1 + (S.heavenDefying.killStacks || 0) * 0.01);
  }

  /* 血煞丹 buff */
  if (S.flags.bloodRage && S.flags.bloodRage.atkMul) {
    a *= (1 + S.flags.bloodRage.atkMul);
  }

  return Math.floor(a);
}

function totalDef() {
  let d = S.def;
  for (const slot in S.equipped) {
    if (slot === "heavenDefying") continue;
    const id = S.equipped[slot];
    if (id) {
      const eq = findEquipById(id);
      if (eq) d += eq.def || 0;
    }
  }
  d += getHeartBonus().def;

    /* ★ 词条加成 */
  if (typeof getAffixBonuses === "function") {
    const ab = getAffixBonuses();
    d += ab.def;
  }

  const hd = getCurrentHeavenDefyingEffect();
  if (hd && hd.defMul) d *= (1 + hd.defMul);

  return Math.floor(d);
}

function getCritRate() {
  let rate = 0.05 + (totalLuck() || 0) * 0.01;

  /* ★ 词条加成 */
  if (typeof getAffixBonuses === "function") {
    rate += getAffixBonuses().critRate / 100;
  }

  const hd = getCurrentHeavenDefyingEffect();
  if (hd && hd.critRate) rate += hd.critRate;
  return Math.min(0.5, rate);
}

function totalSpeed() {
  let sp = S.speed || 10;
  for (const slot in S.equipped) {
    if (slot === "heavenDefying") continue;
    const id = S.equipped[slot];
    if (id) {
      const eq = findEquipById(id);
      if (eq) sp += eq.speed || 0;
    }
  }
  sp += (getHeartBonus().speed || 0);
  return sp;
}

function totalMaxHp() {
  let hp = S.hpMax + getHeartBonus().hp;

  /* ★ 词条加成 */
  if (typeof getAffixBonuses === "function") {
    hp += getAffixBonuses().hpMax;
  }

  const hd = getCurrentHeavenDefyingEffect();
  if (hd && hd.hpMul) hp *= (1 + hd.hpMul);
  return Math.floor(hp);
}

function totalMaxMp() {
  const info = getPlayerRealmInfo();
  /* 凡人境界灵力上限为 0 */
  if (info.realm === 0) return 0;

  let mp = S.mpMax + getHeartBonus().mp;
  
  /* ★ 词条加成 */
  if (typeof getAffixBonuses === "function") {
    mp += getAffixBonuses().mpMax;
  }
  
  const hd = getCurrentHeavenDefyingEffect();
  if (hd && hd.mpMul) mp *= (1 + hd.mpMul);
  
  return Math.floor(mp);
}

/* 幸运（含逆天宝物） */
function totalLuck() {
  let l = S.luck || 0;
  const hd = getCurrentHeavenDefyingEffect();
  if (hd && hd.luckBonus) l += hd.luckBonus;
  return l;
}

/* 修炼速度（含逆天宝物 / 丹药 buff） */
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

  const hd = getCurrentHeavenDefyingEffect();
  if (hd && hd.cultivateMul) base *= (1 + hd.cultivateMul);

  /* 修炼丹药 buff（凝神丹 / 悟道丹） */
  if (S.flags.cultivateBuff && S.flags.cultivateBuff.mul) {
    base *= S.flags.cultivateBuff.mul;
  }

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

  /* 丹药修炼 buff */
  let pillBuffMul = 1;
  if (S.flags.cultivateBuff && S.flags.cultivateBuff.mul) {
    pillBuffMul = S.flags.cultivateBuff.mul;
  }

  for (let i = 0; i < count; i++) {
    if (S.actionsUsed >= ACTIONS_PER_SLOT) { stopped = true; break; }

    const rr = heartRateByRoot(S.roots);
    const inc = rnd(0.15, 0.6) * rr;
    prog.proficiency = Math.min(100, prog.proficiency + inc);
    totalHeart += inc;


        if (prog.proficiency >= 100) {
          const curLevelData = art.levels.find(l => l.lvl === prog.lvl);

          if (prog.lvl === 0) {
            /* Lv.0：不涨修为，等突破 */
          } else if (curLevelData && prog.lvl < art.maxLvl) {
            /* ★ 允许在当前等级内把修为涨满 */
            if (prog.exp < curLevelData.expNeed) {
              const expGain = 10 * rr * realmBonus * pillBuffMul * rnd(0.9, 1.1);
              prog.exp += expGain;
              totalExp += expGain;
              if (prog.exp >= curLevelData.expNeed) {
                prog.exp = curLevelData.expNeed;
              }
            } else {
              /* 修为已满，且遇到了残卷上限 */
              if (prog.lvl >= prog.maxLearn) {
                fragmentStop = true;
              }
            }
          }
        }

    S.actionsUsed++;
  }

  recalcPlayerStats();

  /* 打坐触发逆天宝物揭示 */
  checkHeavenDefyingReveal("meditate");

  const detail = [];
  if (totalHeart > 0) detail.push(`熟练度 +${totalHeart.toFixed(2)}（${prog.proficiency.toFixed(2)}/100）`);
  if (realmBonus > 1) detail.push(`境界加成 ×${realmBonus.toFixed(1)}`);
  if (pillBuffMul > 1) detail.push(`丹药加成 ×${pillBuffMul.toFixed(1)}`);
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
  /* ★ 打坐结束，气血灵力回满 */
  S.hp = totalMaxHp();
  S.mp = totalMaxMp();

  save(); render();
  showActionModal("打坐修炼", detail);
}

/* 属性重算 */
function recalcPlayerStats() {
  const info = getPlayerRealmInfo();
  const hb = getHeartBonus();

  const baseHp = 60 + info.lvl * 25 + Math.max(0, info.realm - 1) * 100;
  S.hpMax = baseHp + hb.hp;
  S.hp = Math.min(S.hp, totalMaxHp());
  if (S.hp < 0) S.hp = 0;

  if (info.realm === 0) {
    S.mpMax = 0;
    S.mp = 0;
  } else {
    const baseMp = 20 + info.lvl * 6 + Math.max(0, info.realm - 1) * 50;
    S.mpMax = baseMp + hb.mp;
    S.mp = Math.min(S.mp, totalMaxMp());
    if (S.mp < 0) S.mp = 0;
  }
}

/* 灵石修炼 */
function cultivateWithStoneItem() {
  const info = getPlayerRealmInfo();
  if (info.realm === 0) { log("凡人阶段无法使用灵石辅助。", "c-bad"); return; }
  if (S.stone < 1) { log("灵石不足。", "c-bad"); return; }
  if (S.actionsUsed >= ACTIONS_PER_SLOT) { log("本时段行动已用完。", "c-bad"); return; }

  const check = canCultivateHeart();
  if (!check.ok) { log(`无法修炼：【${check.reason}】`, "c-bad"); return; }

  S.actionsUsed++;
  S.stone -= 1;

  const art = getCurrentArt();
  const prog = getArtProgress(art.id);

  if (prog.proficiency < 100) {
    log("熟练度未满 100，灵石修炼无效。", "c-bad");
    S.stone += 1;
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
    S.stone += 1;
    S.actionsUsed--;
    return;
  }

  recalcPlayerStats();
  consumeAction(() => showActionModal("灵石修炼", [`修为 +${fmt(gain)}`, `灵石 -1`]));
}

/* ========== 突破 ========== */

const BREAK_POINTS = [0, 3, 6];

function isBreakPoint(lvl) {
  return BREAK_POINTS.includes(lvl);
}

function calcBreakRate() {
  const art = getCurrentArt();
  const mx = maxRoot(S.roots);
  const match = calcArtMatch(art);

  let rate = 0;
  rate += mx.val * 0.04;
  rate += (match - 50) / 1000;
  rate += (totalLuck() || 0) * 0.02;

  const realmPenalty = (art.realm || 1) * 0.05;
  rate -= realmPenalty;

  if (S.mood > 0) rate += S.mood * 0.03;
  else if (S.mood < 0) rate += S.mood * 0.05;

  /* 逆天宝物 */
  const hd = getCurrentHeavenDefyingEffect();
  if (hd && hd.breakRate) rate += hd.breakRate;

  /* 突破丹药 buff（破境丹 / 筑基丹 / 结金丹等） */
  if (S.flags.pillBuff && S.flags.pillBuff.breakBonus) {
    rate += S.flags.pillBuff.breakBonus;
  }

  return Math.max(0.05, Math.min(0.99, rate));
}


function tryBreak() {
  const art = getCurrentArt();
  if (!art) { log("没有心法。", "c-bad"); return; }
  const prog = getArtProgress(art.id);

  /* ★ 新增：残卷上限判断 */
  if (prog.lvl >= prog.maxLearn) {
    log(`【${art.name}】已达当前残卷上限 Lv.${prog.maxLearn}，请先寻得后续残卷。`, "c-bad");
    return;
  }

  if (S.poison >= 100) {
  log("丹毒已满，境界永久锁定，无法突破。", "c-bad");
  return;
  }

  if (!isBreakPoint(prog.lvl)) {
    if (prog.lvl >= art.maxLvl) {
      log("心法已满级，请换更高境界的心法。", "c-bad");
      return;
    }
    const curLevelData = art.levels.find(l => l.lvl === prog.lvl);
    if (!curLevelData || prog.exp < curLevelData.expNeed) {
      log("修为尚未圆满。", "c-bad");
      return;
    }
    doLevelUp(prog.lvl + 1);
    return;
  }

  if (prog.lvl === 0) {
    if (prog.proficiency < 100) { log("熟练度尚未圆满。", "c-bad"); return; }
  } else {
    const curLevelData = art.levels.find(l => l.lvl === prog.lvl);
    if (!curLevelData || prog.exp < curLevelData.expNeed) {
      log("修为尚未圆满。", "c-bad");
      return;
    }
  }

  if (S.flags.breakAttemptedToday) { log("今日已尝试突破。", "c-bad"); return; }

  const check = canCultivateHeart();
  if (!check.ok) { log(`无法突破：【${check.reason}】`, "c-bad"); return; }

  const rate = calcBreakRate();
  const mx = maxRoot(S.roots);
  const match = calcArtMatch(art);
  const moodEmoji = MOOD_EMOJI[S.mood + 2];
  const moodName = MOOD_NAMES[S.mood + 2];

  /* 丹药加成展示 */
  const pillBonus = (S.flags.pillBuff && S.flags.pillBuff.breakBonus) || 0;
  const pillLine = pillBonus > 0
    ? `<div class="row"><span>丹药加成</span><span style="color:#7fbf5f;">+${(pillBonus * 100).toFixed(1)}%</span></div>`
    : "";

  let title = "突破";
  let desc = "";
  if (prog.lvl === 0) {
    const fromName = art.realm === 1 ? "凡人" : REALMS[art.realm - 1].name + "圆满";
    title = `突破 · ${fromName} → ${REALMS[art.realm].name}`;
    desc = `你心法《${art.name}》已入门圆满，尝试引气入体。`;
  } else if (prog.lvl === 3) {
    title = `突破 · ${REALMS[art.realm].name}初期 → 中期`;
    desc = `你${REALMS[art.realm].name}初期圆满，尝试冲击中期。`;
  } else if (prog.lvl === 6) {
    title = `突破 · ${REALMS[art.realm].name}中期 → 后期`;
    desc = `你${REALMS[art.realm].name}中期圆满，尝试冲击后期。`;
  }

  let moodHint = "";
  if (S.mood > 0) moodHint = `<span style="color:#7fbf5f;">加成 +${(S.mood * 3).toFixed(1)}%</span>`;
  else if (S.mood < 0) moodHint = `<span style="color:#d05a4a;">惩罚 ${(S.mood * 5).toFixed(1)}%</span>`;
  else moodHint = `<span style="color:#8a7a5a;">无影响</span>`;

  showModal(title, `
    <p>${desc}</p>
    <p><b>突破成功率：${(rate * 100).toFixed(1)}%</b></p>
    <div class="card">
      <div class="row"><span>灵根 ${mx.val} × 4%</span><span>+${(mx.val * 4).toFixed(1)}%</span></div>
      <div class="row"><span>心法匹配 ${match}%</span><span>${((match - 50) / 10).toFixed(1)}%</span></div>
      <div class="row"><span>运气 ${totalLuck()} × 2%</span><span>+${(totalLuck() * 2).toFixed(1)}%</span></div>
      <div class="row"><span>境界压制</span><span>-${((art.realm || 1) * 5).toFixed(1)}%</span></div>
      <div class="row"><span>心情 ${moodName} ${moodEmoji}</span><span>${moodHint}</span></div>
      ${pillLine}
    </div>
    <p class="small">失败：熟练度 -30 或修为减半，气血 -30%，心情 -1。</p>
  `, [
    { label: "开始突破", fn: () => doBreakAttempt(rate) },
    { label: "取消", fn: closeModal },
  ]);
}

function doBreakAttempt(rate) {
  closeModal();
  S.flags.breakAttemptedToday = true;

  const art = getCurrentArt();
  const prog = getArtProgress(art.id);
  const isLv0 = prog.lvl === 0;

  /* 突破成功后清除丹药加成 */
  const clearPillBuff = () => {
    if (S.flags.pillBuff && S.flags.pillBuff.breakBonus) {
      delete S.flags.pillBuff.breakBonus;
    }
  };

    /* 排毒：小境界 1~3，大境界 5~12 */
  const isBigBreak = (prog.lvl === 1);   // 大境界 = lvl 0→1
  const poisonReduce = isBigBreak ? rndInt(5, 12) : rndInt(1, 3);
  if (S.poison > 0) {
    S.poison = Math.max(0, S.poison - poisonReduce);
    detail.push(`丹毒 -${poisonReduce}（当前 ${S.poison.toFixed(2)}）`);
  }

  if (Math.random() < rate) {
    /* ★ 记录突破前等级，用于判断大/小境界 */
    const lvlBefore = prog.lvl;

    prog.lvl += 1;
    prog.exp = 0;
    if (isLv0) prog.proficiency = 100;

    recalcPlayerStats();
    updateElementLvl();

    /* ★ 排毒：大境界 5~12，小境界 1~3 */
    const isBigBreak = (lvlBefore === 0);
    const poisonReduce = isBigBreak ? rndInt(5, 12) : rndInt(1, 3);
    let poisonDetail = "";
    if (S.poison > 0) {
      const beforePoison = S.poison;
      S.poison = Math.max(0, S.poison - poisonReduce);
      const actualReduce = beforePoison - S.poison;
      poisonDetail = `丹毒 -${actualReduce.toFixed(2)}（当前 ${S.poison.toFixed(2)}/100）`;
    }
    
    const info = getPlayerRealmInfo();
    const realmName = info.realm === 0 ? "凡人" : `${REALMS[info.realm].name}·${subName(info.lvl)}${info.lvl}重`;

    log(`【突破成功】${art.name} 达到 Lv.${prog.lvl}，境界：${realmName}`, "c-gold");
    
    // 突破视觉光效
    const fx = document.createElement("div");
    fx.className = "breakthrough-fx";
    document.body.appendChild(fx);
    document.body.classList.add("shake-animation");
    setTimeout(() => {
        fx.remove();
        document.body.classList.remove("shake-animation");
    }, 1200);

    S.mood = Math.min(2, S.mood + 1);

    if (isLv0) {
      S.hp = totalMaxHp();
      S.mp = totalMaxMp();
      if (isLv0 && info.realm > 0) S.lifeMax = REALMS[info.realm].life;
    }

    /* 清除丹药加成 */
    clearPillBuff();

    /* 突破触发逆天宝物揭示 */
    checkHeavenDefyingReveal("breakthrough");

    save(); render();
    showActionModal("突破成功", [
      `心法《${art.name}》达到 Lv.${prog.lvl}`,
      `境界：${realmName}`,
      "心情 +1",
      poisonDetail,   // 有排毒时才显示
    ].filter(Boolean));
  } else {
    if (isLv0) prog.proficiency = Math.max(0, prog.proficiency - 30);
    else prog.exp = Math.max(0, Math.floor(prog.exp * 0.5));
    S.hp -= Math.floor(S.hpMax * 0.3);
    S.mood = Math.max(-2, S.mood - 1);

    /* 失败也消耗丹药加成 */
    clearPillBuff();

    log(`【突破失败】${art.name} 突破失败，气血受损。`, "c-bad");
    save(); render();
    if (S.hp <= 0) { die("突破失败，气血耗尽而亡。"); return; }
    showActionModal("突破失败", [
      isLv0 ? "熟练度 -30" : "修为减半",
      "气血 -30%",
      "心情 -1",
    ]);
  }
}

function doLevelUp(nextLvl) {
  const art = getCurrentArt();
  const prog = getArtProgress(art.id);

  prog.lvl = nextLvl;
  prog.exp = 0;

  recalcPlayerStats();
  updateElementLvl();

  const info = getPlayerRealmInfo();
  const realmName = `${REALMS[info.realm].name}·${subName(info.lvl)}${info.lvl}重`;

  log(`【提升】${art.name} 达到 Lv.${prog.lvl}，境界：${realmName}`, "c-good");
  save(); render();
  showActionModal("境界提升", [
    `心法《${art.name}》达到 Lv.${prog.lvl}`,
    `境界：${realmName}`,
  ]);
}