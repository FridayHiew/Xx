/* ============================================================
   ui/adventure.js - 冒险地界面（设计二：推进流）
   ============================================================ */

function renderAdventureScreen() {
  const adv = S.flags.adventure;
  if (!adv) {
    /* 兜底：没状态就不显示界面 */
    const el = document.getElementById("adventureScreen");
    if (el) el.style.display = "none";
    return;
  }

  const zone = getAdventureZone(adv.zoneId);
  if (!zone) return;

  /* 顶部标题 */
  const titleEl = document.getElementById("advTitle");
  const subEl = document.getElementById("advSub");
  if (titleEl) titleEl.textContent = `${zone.icon} ${zone.name}`;
  if (subEl) subEl.textContent = `第 ${adv.layer} 层 · ${adv.tree.layerTitle}`;

  /* 路径条 */
  renderAdvPathBar();

  /* 事件卡片 */
  renderAdvEventCard();

  /* 底部选择 */
  renderAdvChoices();
}

/* 路径条：最近 5 步 */
function renderAdvPathBar() {
  const adv = S.flags.adventure;
  const bar = document.getElementById("advPathBar");
  if (!bar) return;

  const recent = adv.path.slice(-5);
  let html = "";
  recent.forEach((node, i) => {
    const isLast = i === recent.length - 1;
    const cls = isLast ? "current" : "past";
    html += `
      <div class="path-step ${cls}">
        <div class="step-icon">${node.icon}</div>
        <div class="step-name">${node.name}</div>
      </div>
    `;
  });
  html += `
    <div class="path-step unknown">
      <div class="step-icon">❓</div>
      <div class="step-name">？？？</div>
    </div>
  `;
  bar.innerHTML = html;
  setTimeout(() => { bar.scrollLeft = bar.scrollWidth; }, 10);
}

/* 事件卡片 */
function renderAdvEventCard() {
  const adv = S.flags.adventure;
  const card = document.getElementById("advEventCard");
  if (!card) return;

  const cur = adv.path[adv.path.length - 1];
  if (!cur) { card.innerHTML = ""; return; }

  /* 最近 3 条日志显示在卡片下 */
  const logList = (S.flags.adventureLog || []).slice(-3);
  const logHtml = logList.map(l =>
    `<div class="log-line ${l.cls || ''}">· ${l.text}</div>`
  ).join("");

  card.innerHTML = `
    <div class="card-icon">${cur.icon}</div>
    <div class="card-title">${cur.name}</div>
    <div class="card-desc">${getAdvNodeDesc(cur)}</div>
    ${logHtml ? `<div class="card-logs">${logHtml}</div>` : ""}
  `;
}

function getAdvNodeDesc(node) {
  switch (node.type) {
    case "start":   return "你站在冒险的入口。";
    case "fight":   return "一股危险的气息从前方传来。";
    case "event":   return (node.data.event && node.data.event.text) || "你四处张望。";
    case "storage": return "一个储存袋静静地躺在那里。";
    case "empty":   return "这里空无一物。";
    case "portal":  return "一道传送门散发着幽光。";
    case "exit":    return "你看到了通往外界的出口。";
    default:        return "……";
  }
}

/* 底部选择 */
function renderAdvChoices() {
  const adv = S.flags.adventure;
  const list = document.getElementById("advChoiceList");
  if (!list) return;

  if (!adv.choices || adv.choices.length === 0) {
    list.innerHTML = `<div class="empty-hint">没有更多选择了。</div>`;
    return;
  }

  let html = "";
  adv.choices.forEach((c, i) => {
    const isEnd = (c.type === "exit" || c.type === "portal");
    html += `
      <button class="choice-btn ${isEnd ? 'exit-choice' : ''}" onclick="onAdvChoose(${i})">
        <div class="choice-icon">${c.icon}</div>
        <div class="choice-text">
          <span class="choice-name">${c.name}</span>
          <span class="choice-sub">${advNodeTypeLabel(c.type)}</span>
        </div>
      </button>
    `;
  });
  list.innerHTML = html;
}

function advNodeTypeLabel(type) {
  return {
    start: "起点", exit: "出口", portal: "传送门",
    fight: "战斗", event: "事件", storage: "储物",
    empty: "空地",
  }[type] || "";
}

/* 玩家点击选择 */
function onAdvChoose(i) {
  adventureChoose(i);
}

function onAdvLeave() {
  /* 直接弹确认，不依赖 S.flags.adventure 存在与否 */
  showModal("离开冒险地", `
    <p>确定要离开这片区域吗？</p>
  `, [
    { label: "取消", fn: closeModal },
    { label: "确定离开", primary: true, fn: () => {
      S.flags.adventure = null;
      S.flags.adventureLog = null;
      S.flags.adventureCombat = null;
      closeModal();

      /* 关界面 */
      const el = document.getElementById("adventureScreen");
      if (el) el.style.display = "none";

      save();
      render();
    }},
  ]);
}