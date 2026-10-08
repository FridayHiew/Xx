/* ============================================================
   core/modal.js - 弹窗（通用）
   ============================================================ */

function showModal(title, body, actions) {
  document.getElementById("modalBox").innerHTML =
    `<h3>${title}</h3><div>${body}</div>
     <div class="actions">${actions.map((a, i) =>
       `<button onclick="modalAction(${i})">${a.label}</button>`).join("")}</div>`;
  window._modalActions = actions;
  document.getElementById("modalMask").classList.add("show");
}

function modalAction(i) {
  const a = window._modalActions[i];
  if (a) a.fn();
}

function closeModal() {
  document.getElementById("modalMask").classList.remove("show");
}

function showActionModal(title, detailLines, onClose) {
  const lines = detailLines.map(l => `<div>${l}</div>`).join("");
  showModal(title, `<div class="detail-list">${lines}</div>`, [
    { label: "继续", fn: () => { closeModal(); if (onClose) onClose(); } }
  ]);
}