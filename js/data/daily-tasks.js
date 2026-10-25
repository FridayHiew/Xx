/* ============================================================
   data/daily-tasks.js - 宗门任务
   ============================================================ */

const DAILY_TASKS = [
  {
    id: "task_low_1",
    name: "采药",
    desc: "去山脚森林采 5 株洗骨花。",
    rank: "门外",
    realmMin: 1,
    type: "gather",
    deadline: 3,
    rewards: { stone: 20, contrib: 5, exp: 30 },
    penalty: { stone: 10, mood: -1 },
  },
  {
    id: "task_low_2",
    name: "驱赶妖兽",
    desc: "山脚的野狼骚扰灵田，去赶走它们。",
    rank: "门外",
    realmMin: 1,
    type: "battle",
    deadline: 2,
    enemyId: "e_wolf",
    rewards: { stone: 30, contrib: 8, exp: 50 },
    penalty: { stone: 15, mood: -1 },
  },
  {
    id: "task_low_3",
    name: "采集妖丹",
    desc: "去妖林取 3 枚妖丹。",
    rank: "门外",
    realmMin: 1,
    type: "gather",
    deadline: 3,
    rewards: { stone: 25, contrib: 6, exp: 40 },
    penalty: { stone: 12, mood: -1 },
  },
  {
    id: "task_mid_1",
    name: "探查灵脉",
    desc: "去雪灵山探查新发现的灵脉，击杀守护妖兽。",
    rank: "门内",
    realmMin: 2,
    type: "battle",
    deadline: 3,
    enemyId: "e_tiger",
    rewards: { stone: 100, contrib: 30, exp: 200 },
    penalty: { stone: 50, contrib: 15, mood: -1 },
  },
  {
    id: "task_mid_2",
    name: "寻访高人",
    desc: "拜访隐居山中的老药农，带回他的药方。",
    rank: "门内",
    realmMin: 2,
    type: "special",
    deadline: 5,
    rewards: { stone: 80, contrib: 25, exp: 150, items: { "回春丹_2阶_1品": 2 } },
    penalty: { stone: 40, contrib: 10, mood: -1 },
  },
  {
    id: "task_high_1",
    name: "镇守边疆",
    desc: "边疆告急，代表本门前往镇守七日。",
    rank: "真传",
    realmMin: 3,
    type: "battle",
    deadline: 7,
    enemyId: "e_chaos",
    rewards: { stone: 300, contrib: 100, exp: 500 },
    penalty: { stone: 200, contrib: 80, mood: -2 },
  },
];

function getTaskById(id) {
  return DAILY_TASKS.find(t => t.id === id);
}

function getAvailableTasks() {
  const rank = S.flags.rank || "杂务";
  const info = getPlayerRealmInfo();
  const realm = info.realm;
  const rankIdx = RANKS.indexOf(rank);

  return DAILY_TASKS.filter(t => {
    if (RANKS.indexOf(t.rank) > rankIdx) return false;
    if (t.realmMin && realm < t.realmMin) return false;
    return true;
  });
}