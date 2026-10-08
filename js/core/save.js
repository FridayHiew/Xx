/* ============================================================
   core/save.js - 存档
   ============================================================ */

const SAVE_KEY = "xiuxian_life_save";

function save() {
  if (!S) return;
  localStorage.setItem(SAVE_KEY, JSON.stringify(S));
}

function loadSave() {
  const data = localStorage.getItem(SAVE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("存档解析失败", e);
    return null;
  }
}

function exportSave() {
  if (!S) return;
  const data = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  showModal("导出存档",
    `<textarea style="width:100%;height:120px;background:#0a0806;color:#e8c87a;">${data}</textarea>`,
    [{ label: "关闭", fn: closeModal }]);
}

function importSave() {
  showModal("导入存档",
    `<textarea id="importArea" style="width:100%;height:120px;background:#0a0806;color:#e8c87a;"></textarea>`,
    [
      { label: "导入", fn: () => {
          try {
            const t = document.getElementById("importArea").value.trim();
            S = JSON.parse(decodeURIComponent(escape(atob(t))));
            closeModal(); render(); save();
          } catch (e) {
            alert("存档格式错误");
          }
        } },
      { label: "取消", fn: closeModal },
    ]);
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}