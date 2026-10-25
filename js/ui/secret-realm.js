/* ============================================================
   ui/secret-realm.js - 秘境界面（剧情场景）
   ============================================================ */

function renderSecretScreen() {
  const cur = S.flags.currentSecretRealm;
  if (!cur) return;
  const ev = getSecretEventById(cur.id);
  if (!ev) return;
  const scene = ev.scenes[cur.sceneKey];
  if (!scene) return;

  /* 顶部标题 */
  const titleEl = document.getElementById("secretTitle");
  const subEl = document.getElementById("secretSub");
  if (titleEl) titleEl.textContent = `📜 ${ev.name}`;
  if (subEl) subEl.textContent = scene.title || "";

  /* 卡片 */
  const card = document.getElementById("secretCard");
  card.innerHTML = `
    <div class="scene-visual">${scene.visual || "📜"}</div>
    <div class="story-title">${scene.title || ""}</div>
    <div class="story-text">
      ${(scene.text || []).map(p => `<p>${p}</p>`).join("")}
    </div>
  `;
  card.style.animation = "none";
  void card.offsetWidth;
  card.style.animation = "storyIn .4s cubic-bezier(.2,.8,.3,1)";

  /* 选项 */
  const list = document.getElementById("secretChoiceList");
  if (!scene.choices || scene.choices.length === 0) {
    list.innerHTML = "";
    return;
  }
  let html = "";
  scene.choices.forEach((c, i) => {
    const isEnd = c.next === "END";
    const cls = [
      "story-choice",
      c.special ? "special" : "",
      isEnd ? "exit-choice" : "",
    ].filter(Boolean).join(" ");

    html += `
      <button class="${cls}" onclick="onSecretChoose(${i})">
        <span class="choice-num">${i + 1}</span>
        <span class="choice-text">${c.label}${c.reward && c.reward.note ? ` <span style="color:var(--text-gold);">（${c.reward.note}）</span>` : ""}</span>
      </button>
    `;
  });
  list.innerHTML = html;
}

function onSecretChoose(i) {
  secretChoose(i);
}

function onSecretLeave() {
  leaveSecretRealm();
}