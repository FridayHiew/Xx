/* ============================================================
   main.js - 启动入口
   ============================================================ */

function boot() {
  initCreationPanel();

  const saved = loadSave();
  if (saved) {
    /* 兼容性检查：旧存档没有 heartArts → 清档 */
    if (!saved.heartArts) {
      log("存档版本过旧，请重开一生。", "c-bad");
      localStorage.removeItem(SAVE_KEY);
      return;
    }

    S = saved;

    /* 兼容旧字段 */
    if (!S.tools) S.tools = {};
    if (!S.hobbies) S.hobbies = [];
    if (!S.hobbySkill) S.hobbySkill = {};
    if (!S.flags) S.flags = {};
    if (!S.flags.festivalYear) S.flags.festivalYear = {};
    if (!S.flags.npcDailyInteraction) S.flags.npcDailyInteraction = {};
    if (!S.flags.npcDailyGift) S.flags.npcDailyGift = {};
    if (!S.flags.npcDailyDay) S.flags.npcDailyDay = S.day;
    if (!S.flags.story) S.flags.story = { year1000: {}, year1001: {}, year1002: {}, year1003: {}, year1004: {} };
    if (!S.flags.secretRealm) S.flags.secretRealm = { opened: false, completed: false, gotOrb: false };
    if (S.flags.lastSundayDay === undefined) S.flags.lastSundayDay = 0;
    if (S.peak === undefined) S.peak = null;
    if (S.master === undefined) S.master = null;
    if (S.meditateCount === undefined) S.meditateCount = 1;
    if (!S.cave) S.cave = { level: 0, alchemy: 0, garden: 0, spirit: 0 };

    /* 兼容：旧档把 elementLvl / fragments 存在 heartArts 下 */
    if (S.heartArts) {
      if (!S.elementLvl && S.heartArts.elementLvl) {
        S.elementLvl = S.heartArts.elementLvl;
      }
      if (!S.fragments && S.heartArts.fragments) {
        S.fragments = S.heartArts.fragments;
      }
    }

    /* 顶层字段兜底 */
    if (!S.elementLvl) S.elementLvl = { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0, lei: 0, bing: 0 };
    if (!S.fragments) S.fragments = {};
    if (S.dao === undefined) S.dao = 0;

    document.getElementById("creationPanel").style.display = "none";
    document.getElementById("gameArea").style.display = "block";
    updateProfileIcon();
    log("欢迎回来，道友。", "c-gold");
    render();
  }

  /* 定时保存 */
  setInterval(() => {
    if (S) {
      S.lastTime = Date.now();
      save();
    }
  }, 30000);

  window.addEventListener("beforeunload", () => {
    if (S) {
      S.lastTime = Date.now();
      save();
    }
  });
}

boot();