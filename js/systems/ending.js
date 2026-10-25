/* ============================================================
   systems/ending.js - 结局
   ============================================================ */

function triggerFinalBattle() {
  showModal("最终战 · 1004/4/1", `
    <p>天刚破晓，你被一阵急促的钟声惊醒。</p>
    <p>山门外，黑压压一片人影——</p>
    <p>是<b>敌对联盟</b>的大军。</p>
    <p>山门大阵剧烈震动，光芒黯淡。</p>
    <p>长老们御剑而起，弟子们慌乱集结。</p>
    <p>宗主站在大殿之上，声音嘶哑：</p>
    <p>「本门……怕是撑不过今日了。」</p>
    <p>你握紧手中法器，深吸一口气。</p>
  `, [
    { label: "迎战", fn: () => { closeModal(); chooseBattlePreference(); } }
  ]);
}

function chooseBattlePreference() {
  const hasLover = S.lovers && S.lovers.length > 0;
  const options = [
    { label: "掩护同门撤退", fn: () => { closeModal(); doRandomSurvival("cover"); } },
    { label: "直接冲向敌阵", fn: () => { closeModal(); doRandomSurvival("charge"); } },
    { label: "保护师父", fn: () => { closeModal(); doRandomSurvival("master"); } },
  ];
  if (hasLover) {
    options.push({ label: "保护道侣", fn: () => { closeModal(); doRandomSurvival("lover"); } });
  }

  showModal("最终战 · 选择", `
    <p>你站在战场上，环顾四周。</p>
    <p>你的同门在奋力抵抗，</p>
    <p>你的师父在远处苦战。</p>
    <p>现在，你要做什么？</p>
  `, options);
}

function doRandomSurvival(choice) {
  const info = getPlayerRealmInfo();
  const realm = info.realm;

  let baseRate = 0.5;
  if (realm === 1) baseRate += 0.05;
  else if (realm === 2) baseRate += 0.10;
  else if (realm >= 3) baseRate += 0.15;

  if (choice === "cover") baseRate += 0.10;
  if (choice === "charge") baseRate -= 0.20;
  if (choice === "master") baseRate += 0.05;
  if (choice === "lover") baseRate += 0.10;

  baseRate = Math.max(0.2, Math.min(0.8, baseRate));

  if (Math.random() < baseRate) {
    showModal("杀出重围", `
      <p>你杀出重围，回头望去——</p>
      <p>宗门已是一片火海。</p>
      <p>山门倒塌，大殿燃烧。</p>
      <p>你浑身是血，站在山门外。</p>
      <p>现在，你要做什么？</p>
    `, [
      { label: "返回救同门", fn: () => { closeModal(); returnToSave(); } },
      { label: "逃亡他乡", fn: () => { closeModal(); showEnding("逃脱流浪"); } },
      { label: "隐居山林", fn: () => { closeModal(); showEnding("隐居山林"); } },
      { label: "回凡间老家", fn: () => { closeModal(); showEnding("放弃回老家"); } },
    ]);
  } else {
    if (choice === "cover") {
      showEnding("宗门英雄");
    } else {
      showEnding("战死");
    }
  }
}

function returnToSave() {
  if (Math.random() < 0.5) {
    showEnding("宗门英雄");
  } else {
    showModal("救出同门", `
      <p>你冲回宗门。</p>
      <p>火海中，你救出了几个同门。</p>
      <p>你们逃出了宗门。</p>
      <p>现在，你要做什么？</p>
    `, [
      { label: "逃亡他乡", fn: () => { closeModal(); showEnding("逃脱流浪"); } },
      { label: "隐居山林", fn: () => { closeModal(); showEnding("隐居山林"); } },
      { label: "回凡间老家", fn: () => { closeModal(); showEnding("放弃回老家"); } },
    ]);
  }
}

function showEnding(endingKey) {
  const ending = ENDING_TEXTS[endingKey];
  if (!ending) return;

  const info = getPlayerRealmInfo();
  const realmName = info.realm === 0 ? "凡人" :
    `${REALMS[info.realm].name}·${subName(info.lvl)}${info.lvl}重`;

  const summary = `
    <p>道号：${S.name}</p>
    <p>享年：${Math.floor(S.life)} 岁</p>
    <p>境界：${realmName}</p>
    <p>宗门：${S.sect ? SECTS.find(s => s.id === S.sect).name : "无"}</p>
  `;

  showModal(`结局 · ${ending.title}`, `
    <p style="white-space:pre-line;font-size:14px;">${ending.text}</p>
    <hr style="border-color:#2a2216;margin:8px 0;">
    ${summary}
  `, [
    { label: "导出存档（版本 2 伏笔）", fn: () => { closeModal(); exportEndingSave(endingKey); } },
    { label: "重开一生", fn: () => { closeModal(); resetGame(); } },
  ]);
}

function exportEndingSave(endingKey) {
  const info = getPlayerRealmInfo();
  const data = {
    version1Ending: endingKey,
    name: S.name,
    realm: info.realm,
    sub: info.lvl,
    root: S.roots,
    morality: S.morality,
    keyNPCs: S.npcs.filter(n => n.alive).map(n => ({ name: n.name, role: n.role, aff: n.aff })),
    timestamp: Date.now(),
  };
  const str = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  showModal("导出存档", `
    <p class="small">复制以下文本保存，可作为版本 2 的起始存档：</p>
    <textarea style="width:100%;height:150px;background:#0a0806;color:#e8c87a;">${str}</textarea>
  `, [{ label: "关闭", fn: closeModal }]);
}