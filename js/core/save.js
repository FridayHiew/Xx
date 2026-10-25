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

/* 
   清档：必须先把内存里的 S 置空，
   否则 location.reload() 会触发 beforeunload，
   beforeunload 里 `if (S) save()` 又会把旧档写回 localStorage。

   ★ 修复（P0-1）：
   原代码用 localStorage.clear()，会误删：
     - xiuxian_admin_overrides（Admin 自定义数据包）
     - xiuxian_audio_settings（音量 / 曲风设置）
   改为精确删除 SAVE_KEY，其他数据保留。
*/
function resetGame() {
  S = null;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    // ignore
  }
  location.reload();
}