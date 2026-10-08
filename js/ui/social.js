/* ============================================================
   ui/social.js - 社交面板
   ============================================================ */

function renderSocial() {
  const met = S.npcs.filter(n => n.alive && S.metNpcs[n.id]);
  const tiers = ["杂务", "门外", "门内", "长老", "其他宗门"];
  let html = `<h3>相识道友 (${met.length}人)</h3>`;
  if (met.length === 0) {
    html += `<p class="empty">你还没有认识任何同门。</p>`;
    return html;
  }

  tiers.forEach(t => {
    const list = met.filter(n => n.tier === t || (t === "其他宗门" && n.otherSect));
    if (list.length === 0) return;
    html += `<h4>${t}（${list.length}）</h4>`;
    list.forEach(n => {
      const otherSect = n.otherSect ? ` <span class="tag">${n.otherSect}</span>` : '';
      const realmText = n.realm === 0 ? "凡人" : `${REALMS[n.realm].name}·${subName(n.sub)}${n.sub}重`;
      const acted = hasActedToday(n.id);
      const interacted = hasInteractedToday(n.id);
      const gifted = hasGiftedToday(n.id);
      html += `
        <div class="npc-card ${acted ? 'interacted' : ''}">
          <span class="name">${n.name}</span>
          <span class="tag">${n.role}</span>
          <span class="tag ${n.gender === "女" ? "pink" : "blue"}">${n.gender}</span>
          <span class="tag">${realmText}</span>
          ${otherSect}
          <span class="aff">好感 ${n.aff}</span>
          <div class="meta">${n.traits.join("、")}　悟性:${n.talent}　${n.ie}　长相:${n.looks}/10</div>
          <div style="margin-top:4px;">
            <button onclick="openInteract('${n.id}')" ${acted ? "disabled" : ""}>${interacted ? "今日已互动" : "互动"}</button>
            <button onclick="giveGift('${n.id}')" ${acted ? "disabled" : ""}>${gifted ? "今日已送礼" : "送礼(200" + currencyName() + ")"}</button>
          </div>
        </div>`;
    });
  });
  return html;
}