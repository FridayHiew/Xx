/* ============================================================
   data/adventure-zones.js - 冒险地
   
   每个冒险地有：
   - id / name / icon / desc
   - realmMin / realmMax: 可进入的境界范围
   - actionCost: 进入消耗的行动
   - layers: 多层，每层一个 scene
   
   每层：
   - title: 层标题
   - depth: 推进步数（不含起始和终点）
   - finalType: "portal" / "exit"
   - finalCount: 传送门 / 出口数量
   - enemies: 敌人池（id 数组）
   - storage: 储存袋掉落池（生成时随机分配）
   - escapeRate: 遇到战斗时"能绕开"的概率（默认 0.4 = 40% 绕开）
   - events: 事件池（type=event 时随机抽）
   ============================================================ */

const ADVENTURE_ZONES = [
  /* ============================================================
     黑色妖林（凡人 ~ 炼气）
     ============================================================ */
  {
    id: "black_forest",
    name: "黑色妖林",
    icon: "🌲",
    desc: "妖气弥漫的密林，常年有妖兽出没。",
    realmMin: 0,
    realmMax: 2,
    actionCost: 1,

    layers: [
      /* ----- 第 1 层：妖林外围 ----- */
      {
        layer: 1,
        title: "妖林外围",
        depth: 8,
        finalType: "portal",
        finalCount: 2,
        escapeRate: 0.4,        /* 40% 能绕开 */
        enemies: ["e_wolf", "e_snake", "e_boar", "e_bee"],
        storageCount: [1, 2],   /* 1~2 个储存袋 */
        storage: [
          { type: "stone", amount: [20, 50] },
          { type: "mat", baseId: "洗骨花", gradeRange: [1, 2], count: 3 },
          { type: "mat", baseId: "草木灰", gradeRange: [1, 2], count: 5 },
          { type: "item", id: "回春丹_1阶_1品", count: 2 },
        ],
        events: [
          { text: "你在林间发现一片药草。", effect: { mat: { 洗骨花: 2 }, gradeRange: [1, 2] } },
          { text: "你在溪边捧起一泓清泉。", effect: { mat: { 清泉水: 2 }, gradeRange: [1, 2] } },
          { text: "你在一处荒废营地中找到一些杂物。", effect: { stone: 15 } },
          { text: "你在古树下打坐，忽有所悟。", effect: { exp: 30 } },
          { text: "风吹过林间，什么都没发现。", effect: {} },
        ],
      },

      /* ----- 第 2 层：妖林深处 ----- */
      {
        layer: 2,
        title: "妖林深处",
        depth: 10,
        finalType: "exit",
        finalCount: 1,
        escapeRate: 0.3,        /* 30% 能绕开 */
        enemies: ["e_wolf", "e_boar", "e_tiger"],
        storageCount: [2, 3],
        storage: [
          { type: "stone", amount: [50, 100] },
          { type: "mat", baseId: "玉髓芝", gradeRange: [1, 2], count: 2 },
          { type: "mat", baseId: "寒血果", gradeRange: [1, 2], count: 2 },
          { type: "item", id: "回春丹_1阶_1品", count: 3 },
        ],
        events: [
          { text: "你在深处发现一株灵药。", effect: { mat: { 玉髓芝: 1 }, gradeRange: [1, 2] } },
          { text: "妖气弥漫，你感到一丝不安。", effect: {} },
          { text: "你发现一处废弃的洞窟。", effect: { stone: 30 } },
          { text: "你在林中静坐，修为精进。", effect: { exp: 60 } },
        ],
      },
    ],
  },

  /* ============================================================
     雪灵山（炼气 ~ 筑基）
     ============================================================ */
  {
    id: "snow_mountain",
    name: "雪灵山",
    icon: "❄️",
    desc: "终年积雪的高山，灵兽与雪精出没。",
    realmMin: 1,
    realmMax: 3,
    actionCost: 1,

    layers: [
      /* 第 1 层 */
      {
        layer: 1,
        title: "山脚雪林",
        depth: 8,
        finalType: "portal",
        finalCount: 2,
        escapeRate: 0.4,
        enemies: ["e_tiger", "e_bat", "e_fox"],
        storageCount: [1, 2],
        storage: [
          { type: "stone", amount: [80, 150] },
          { type: "mat", baseId: "寒血果", gradeRange: [1, 2], count: 3 },
          { type: "mat", baseId: "紫猴花", gradeRange: [1, 2], count: 2 },
        ],
        events: [
          { text: "你在雪地中挖到一株寒血果。", effect: { mat: { 寒血果: 2 }, gradeRange: [1, 2] } },
          { text: "一只雪精飘过，留下寒气。", effect: {} },
          { text: "你在崖边发现一个冰洞。", effect: { stone: 50 } },
        ],
      },

      /* 第 2 层 */
      {
        layer: 2,
        title: "雪峰山腰",
        depth: 9,
        finalType: "portal",
        finalCount: 2,
        escapeRate: 0.35,
        enemies: ["e_tiger", "e_bat"],
        storageCount: [2, 3],
        storage: [
          { type: "stone", amount: [150, 250] },
          { type: "mat", baseId: "紫猴花", gradeRange: [1, 3], count: 3 },
          { type: "mat", baseId: "水系妖丹", gradeRange: [1, 2], count: 1 },
        ],
        events: [
          { text: "风雪骤起，你找到一处避风石屋。", effect: {} },
          { text: "你在冰壁中发现一株紫猴花。", effect: { mat: { 紫猴花: 2 }, gradeRange: [1, 3] } },
          { text: "你在冰层下挖到一枚妖丹。", effect: { mat: { 水系妖丹: 1 }, gradeRange: [1, 2] } },
        ],
      },

      /* 第 3 层 */
      {
        layer: 3,
        title: "雪峰绝顶",
        depth: 8,
        finalType: "exit",
        finalCount: 1,
        escapeRate: 0.25,
        enemies: ["e_tiger", "e_bat"],
        storageCount: [2, 3],
        storage: [
          { type: "stone", amount: [250, 400] },
          { type: "mat", baseId: "寒血果", gradeRange: [2, 4], count: 3 },
          { type: "mat", baseId: "玉髓芝", gradeRange: [2, 4], count: 2 },
          { type: "item", id: "聚气丹_1品", count: 2 },
        ],
        events: [
          { text: "绝顶之上风雪如刀，你咬牙前行。", effect: {} },
          { text: "你在冰川深处发现一具古尸，尸旁有物。", effect: { stone: 100 } },
          { text: "天地灵气在绝顶汇聚，你参悟良久。", effect: { exp: 200 } },
        ],
      },
    ],
  },

  /* ============================================================
     火焰山（筑基 ~ 金丹）
     ============================================================ */
  {
    id: "flame_mountain",
    name: "火焰山",
    icon: "🔥",
    desc: "常年烈焰不熄的火山，火系妖兽横行。",
    realmMin: 2,
    realmMax: 4,
    actionCost: 1,

    layers: [
      /* 第 1 层 */
      {
        layer: 1,
        title: "火山口",
        depth: 9,
        finalType: "portal",
        finalCount: 2,
        escapeRate: 0.35,
        enemies: ["e_tiger", "e_chaos"],
        storageCount: [2, 3],
        storage: [
          { type: "stone", amount: [200, 350] },
          { type: "mat", baseId: "火精枣", gradeRange: [1, 2], count: 3 },
          { type: "mat", baseId: "妖兽精血", gradeRange: [1, 2], count: 1 },
        ],
        events: [
          { text: "你在岩浆边捡到几枚火精枣。", effect: { mat: { 火精枣: 2 }, gradeRange: [1, 2] } },
          { text: "烈焰扑面，你运功护体。", effect: {} },
          { text: "你在一处熔岩洞中发现古物。", effect: { stone: 80 } },
        ],
      },

      /* 第 2 层 */
      {
        layer: 2,
        title: "地火深处",
        depth: 10,
        finalType: "exit",
        finalCount: 1,
        escapeRate: 0.2,
        enemies: ["e_chaos", "e_tiger"],
        storageCount: [2, 3],
        storage: [
          { type: "stone", amount: [400, 600] },
          { type: "mat", baseId: "妖兽精血", gradeRange: [2, 4], count: 2 },
          { type: "mat", baseId: "千年降压草", gradeRange: [1, 3], count: 2 },
          { type: "item", id: "回春丹_2阶_1品", count: 2 },   // 淬体丹已删除，改成回春丹 2 阶
        ],
        events: [
          { text: "地火汹涌，你感到体内灵力躁动。", effect: {} },
          { text: "你在岩浆中发现一具妖尸，妖丹尚存。", effect: { mat: { 妖兽精血: 1 }, gradeRange: [2, 4] } },
          { text: "你在火山深处觅得地火精粹。", effect: { exp: 400 } },
        ],
      },
    ],
  },
];

/* ============================================================
   工具
   ============================================================ */
function getAdventureZone(id) {
  return ADVENTURE_ZONES.find(z => z.id === id);
}

/* 按玩家境界筛选 */
function getAvailableZones(realm) {
  return ADVENTURE_ZONES.filter(z => realm >= z.realmMin && realm <= z.realmMax);
}