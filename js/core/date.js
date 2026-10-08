/* ============================================================
   core/date.js - 日期 / 节日
   ============================================================ */

/* 起始：逍遥 1000 年 6 月 1 日 = S.day 1 */
/* 每月 30 天，一年 365 天（12 月 × 30 + 岁末 5 天） */

function getDateInfo() {
  const daysSinceStart = S.day - 1;
  const YEAR_DAYS = 365;
  const yearOffset = Math.floor(daysSinceStart / YEAR_DAYS);
  let dayInCycle = daysSinceStart % YEAR_DAYS;
  const year = 1000 + yearOffset;

  /* 月份顺序：6,7,8,9,10,11,12,1,2,3,4,5,岁末 */
  const monthOrder = [6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5];

  let remaining = dayInCycle;
  let month = 6, day = 1;
  let isYearEnd = false;
  let done = false;

  for (let i = 0; i < monthOrder.length; i++) {
    if (remaining < 30) {
      month = monthOrder[i];
      day = remaining + 1;
      done = true;
      break;
    }
    remaining -= 30;
  }

  if (!done) {
    /* 岁末 5 天 */
    month = 12;
    day = 30 + remaining + 1;
    isYearEnd = true;
  }

  const monthName = isYearEnd ? "岁末" : LUNAR_MONTHS[month - 1];
  return { year, month, day, monthName, isYearEnd };
}

function getFestival() {
  const d = getDateInfo();
  if (d.isYearEnd) {
    return d.day === 35 ? { name: "岁末", bonus: "年终" } : null;
  }
  for (const f of FESTIVALS) {
    if (f.month === d.month && f.day === d.day) return f;
  }
  return null;
}

/* 剧情阶段 */
/* 1000 / 1001 / 1002 / 1003a / 1003b / 1004 */
function getStoryStage() {
  const d = getDateInfo();
  if (d.year <= 1000) return "1000";
  if (d.year === 1001) return "1001";
  if (d.year === 1002) return "1002";
  if (d.year === 1003) {
    if (d.month <= 9) return "1003a";
    return "1003b";
  }
  if (d.year >= 1004) return "1004";
  return "end";
}