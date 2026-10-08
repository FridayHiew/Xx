/* ============================================================
   systems/social.js - 社交 / 互动 / 对练
   ============================================================ */

function hasInteractedToday(id) {
  if (S.flags.npcDailyDay !== S.day) return false;
  return !!S.flags.npcDailyInteraction[id];
}
function hasGiftedToday(id) {
  if (S.flags.npcDailyDay !== S.day) return false;
  return !!S.flags.npcDailyGift[id];
}
function hasActedToday(id) {
  return hasInteractedToday(id) || hasGiftedToday(id);
}

function openInteract(id) {
  const npc = S.npcMap[id];
  if (!npc || !npc.alive) return;
  if (hasActedToday(id)) { log("今日已与对方交流过。", "c-bad"); return; }

  const dialogues = [
    { text: "聊些家常", type: "small" },
    { text: "请教修行", type: "study" },
    { text: "谈天说地", type: "chat" },
  ];
  const shuffled = dialogues.sort(() => Math.random() - 0.5).slice(0, 3);

  const html = shuffled.map(d => `
    <div class="card">
      <b>${d.text}</b>
      <button onclick="resolveInteract('${id}','${d.type}')">选择</button>
    </div>
  `).join("");

  showModal("与 " + npc.name + " 互动", html, [
    { label: "取消", fn: closeModal }
  ]);
}

function resolveInteract(id, type) {
  const npc = S.npcMap[id];
  if (!npc) return;
  if (hasActedToday(id)) { log("今日已与对方交流过。", "c-bad"); closeModal(); return; }
  closeModal();
  S.metNpcs[id] = true;
  S.flags.npcDailyInteraction[id] = true;

  const lookBonus = Math.floor(npc.looks / 3);
  const ieBonus = (S.ie === npc.ie) ? 2 : 0;
  let traitBonus = 0;
  if (type === "small" && npc.traits.includes("热心肠")) traitBonus = 2;
  if (type === "study" && npc.traits.includes("读书仔")) traitBonus = 3;
  if (type === "chat" && npc.traits.includes("爱八卦")) traitBonus = 3;

  const base = rndInt(1, 5) + lookBonus + ieBonus + traitBonus;
  const moodBonus = Math.floor((S.mood + 2) / 2);

  const art = getCurrentArt();
  const socialBonus = (art && art.bonus && art.bonus.social) ? art.bonus.social : 0;

  let affGain = base + moodBonus - 2;
  if (affGain > 0) affGain = Math.floor(affGain * (1 + socialBonus));

  npc.aff = Math.max(0, Math.min(100, npc.aff + affGain));
  npc.lastInteract = S.day;

  const dialogue = pickDialogue(npc);

  const detail = [
    `你选择了：${type === "small" ? "聊家常" : type === "study" ? "请教修行" : "谈天说地"}`,
  ];
  if (dialogue) detail.push(`<i>${dialogue}</i>`);
  detail.push(`好感变化：${affGain >= 0 ? "+" : ""}${affGain}`);
  detail.push(`当前好感：${npc.aff}`);

  if (affGain > 0) log(`与 ${npc.name} 交流愉快，好感 +${affGain}。`, "c-pink");
  else if (affGain < 0) log(`与 ${npc.name} 话不投机，好感 ${affGain}。`, "c-bad");
  else log(`与 ${npc.name} 平淡交流。`, "c-normal");

  save(); render();
  showActionModal("互动 · " + npc.name, detail);
}

function giveGift(id) {
  const npc = S.npcMap[id];
  if (!npc) return;
  if (hasActedToday(id)) { log("今日已与对方交流过。", "c-bad"); return; }
  if (!spendCurrency(200)) { log(`${currencyName()}不足（需 200）。`, "c-bad"); return; }
  S.metNpcs[id] = true;
  S.flags.npcDailyGift[id] = true;

  let affGain = 8;
  if (npc.traits.includes("爱花钱")) affGain += 5;
  if (npc.traits.includes("不读书")) affGain += 2;
  if (npc.traits.includes("邪恶人")) affGain = -5;
  if (npc.traits.includes("没目标")) affGain = 2;
  if (npc.traits.includes("欺负人")) affGain = -3;

  npc.aff = Math.max(0, Math.min(100, npc.aff + affGain));

  const detail = [
    `送礼花费：200 ${currencyName()}`,
    `好感变化：${affGain >= 0 ? "+" : ""}${affGain}`,
    `当前好感：${npc.aff}`,
  ];
  if (affGain > 0) log(`送给 ${npc.name} 礼物，好感 +${affGain}。`, "c-pink");
  else log(`送给 ${npc.name} 礼物，对方不太喜欢。好感 ${affGain}。`, "c-bad");

  save(); render();
  showActionModal("送礼 · " + npc.name, detail);
}

/* 对练 */
function doDuel() {
  if (S.actionsUsed >= ACTIONS_PER_SLOT) {
    log("本时段行动已用完。", "c-bad");
    return;
  }
  const cost = 50;
  if (!spendCurrency(cost)) {
    log(`${currencyName()}不足（需 ${cost}）。`, "c-bad");
    return;
  }

  const candidates = S.npcs.filter(n => n.alive
    && n.id !== S.master
    && (n.tier === "长老" || n.tier === "门内" || n.tier === "门外")
  );

  const master = S.master ? S.npcMap[S.master] : null;
  const list = master ? [master, ...candidates.slice(0, 3)] : candidates.slice(0, 4);

  if (list.length === 0) {
    log("没有合适的对练对象。", "c-bad");
    addCurrency(cost);
    return;
  }

  const html = list.map(n => {
    const realmText = n.realm === 0 ? "凡人" : `炼气·${n.sub}重`;
    return `<div class="card">
      <b>${n.name}</b> <span class="tag">${n.role}</span>
      <div class="small">${realmText}　${n.tier}</div>
      <button onclick="startDuel('${n.id}')">选择对练</button>
    </div>`;
  }).join("");

  showModal("对练基本功", `
    <p>花费 ${cost} ${currencyName()}，与人对练基本功。</p>
    ${html}
  `, [{ label: "取消", fn: () => { addCurrency(cost); closeModal(); } }]);
}

function startDuel(npcId) {
  const npc = S.npcMap[npcId];
  if (!npc) return;
  closeModal();
  S.actionsUsed++;

  const myBasics = ["剑", "刀", "拳", "掌", "棍", "鞭"].map(k => S.skills[k]?.lvl || 0);
  const myAvg = myBasics.reduce((a, b) => a + b, 0) / 6;
  const npcAvg = npc.realm * 2 + (npc.tier === "长老" ? 4 : 1);
  const diff = myAvg - npcAvg;
  const roll = rnd(0, 1) + diff * 0.1;

  let result, gain;
  if (roll > 0.7) { result = "胜"; gain = 1.5; }
  else if (roll > 0.4) { result = "平"; gain = 1.0; }
  else { result = "负"; gain = 0.5; }

  const pickSkill = pick(["剑", "刀", "拳", "掌", "棍", "鞭"]);
  S.skills[pickSkill].exp = +(S.skills[pickSkill].exp + gain).toFixed(2);
  let leveled = false;
  while (S.skills[pickSkill].exp >= SKILL_LVL_EXP && S.skills[pickSkill].lvl < MAX_SKILL_LVL) {
    S.skills[pickSkill].exp -= SKILL_LVL_EXP;
    S.skills[pickSkill].lvl++;
    leveled = true;
  }
  npc.aff = Math.min(100, npc.aff + 1);
  S.metNpcs[npc.id] = true;

  log(`与 ${npc.name} 对练（${result}），${pickSkill} +${gain}。`, "c-gold");
  const detail = [
    `对手：${npc.name}`,
    `结果：${result}`,
    `${pickSkill} 熟练度 +${gain}${leveled ? " (升级!)" : ""}`,
    `${npc.name} 好感 +1`,
  ];

  consumeAction(() => showActionModal("对练结束", detail));
}