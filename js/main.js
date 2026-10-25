/* ============================================================
   main.js - 启动入口
   ============================================================ */

/* ============================================================
   启动
   ============================================================ */

function boot() {
  initCreationPanel();

  const saved = loadSave();
  if (saved) {
    /* 版本检查 */
    if (isSaveTooOld(saved)) {
      log("存档版本过旧，请重开一生。", "c-bad");
      localStorage.removeItem(SAVE_KEY);
      return;
    }

    S = saved;

    /* 榜单初始化 */
    if (typeof initRankBoards === "function") {
      initRankBoards();
    }

    /* ★ A-2：所有字段兜底与旧档迁移统一走 applySaveDefaults */
    applySaveDefaults(S);

    /* 应用 Admin 数据包 */
    if (typeof applyAdminOverrides === "function") {
      applyAdminOverrides();
    }

    /* 显示 */
    document.getElementById("creationPanel").style.display = "none";
    document.getElementById("gameArea").style.display = "block";
    updateProfileIcon();
    log("欢迎回来，道友。", "c-gold");
    render();
  }

  /*
     ★ A-3：去掉 30 秒定时全量 save()（方案 Y）。
     存档改为：每个操作后立即 save()（现有代码已如此） + beforeunload 兜底。
  */

  window.addEventListener("beforeunload", () => {
    if (S) {
      S.lastTime = Date.now();
      save();
    }
  });
}

boot();