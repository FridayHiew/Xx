/* ============================================================
   data/spells.js - 法术
   ============================================================ */

const SPELLS = [
  /* ===== 剑系 ===== */
  { id: "huojian", name: "火剑", type: "剑", target: "enemySingle",
    skillReq: { "剑": 1 },
    elementReq: { huo: 1 },
    artReq: ["minghuo_heart"],
    toolReq: [],
    cost: { mp: 10 },
    power: 1.5,
    inflict: { burn: 0.3 },
    desc: "以剑引火，灼烧敌人。" },

  { id: "huoyanjian", name: "火焰剑", type: "剑", target: "enemyAll",
    skillReq: { "剑": 4 },
    elementReq: { huo: 2 },
    artReq: ["minghuo_heart"],
    toolReq: [],
    cost: { mp: 25 },
    power: 1.2,
    inflict: { burn: 0.4 },
    desc: "剑气化焰，攻击全体敌人。" },

  { id: "lieyanjian", name: "烈焰剑", type: "剑", target: "enemySingle",
    skillReq: { "剑": 7 },
    elementReq: { huo: 3 },
    artReq: ["minghuo_heart"],
    toolReq: ["huo_fu"],
    cost: { mp: 50 },
    power: 3.5,
    inflict: { burn: 0.5 },
    desc: "烈焰焚天，需火系法器辅助。" },

  { id: "jianqi_zhan", name: "剑气斩", type: "剑", target: "enemySingle",
    skillReq: { "剑": 1 },
    elementReq: {},
    artReq: [],
    toolReq: [],
    cost: { mp: 15 },
    power: 2.0,
    inflict: { bleed: 0.2 },
    desc: "基础剑法，无需属性。" },

  /* ===== 拳系 ===== */
  { id: "bengquan", name: "崩拳", type: "拳", target: "enemySingle",
    skillReq: { "拳": 1 },
    elementReq: {},
    artReq: [],
    toolReq: [],
    cost: { mp: 8 },
    power: 1.4,
    desc: "基础拳法。" },

  { id: "liehuoquan", name: "烈火拳", type: "拳", target: "enemySingle",
    skillReq: { "拳": 4 },
    elementReq: { huo: 2 },
    artReq: ["minghuo_heart"],
    toolReq: [],
    cost: { mp: 22 },
    power: 2.0,
    inflict: { burn: 0.3 },
    desc: "拳带烈焰。" },

  /* ===== 掌系 ===== */
  { id: "bingzhang", name: "冰霜掌", type: "掌", target: "enemySingle",
    skillReq: { "掌": 2 },
    elementReq: { bing: 1 },
    artReq: [],
    toolReq: [],
    cost: { mp: 12 },
    power: 1.6,
    inflict: { freeze: 0.2 },
    desc: "寒冰掌力，可能冰冻。" },

  /* ===== 刀系 ===== */
  { id: "kuangdao", name: "狂刀斩", type: "刀", target: "enemySingle",
    skillReq: { "刀": 3 },
    elementReq: {},
    artReq: [],
    toolReq: [],
    cost: { mp: 18 },
    power: 1.8,
    inflict: { bleed: 0.3 },
    desc: "狂暴刀法。" },

  /* ===== 棍系 ===== */
  { id: "saodi", name: "扫地铁棍", type: "棍", target: "enemyAll",
    skillReq: { "棍": 2 },
    elementReq: {},
    artReq: [],
    toolReq: [],
    cost: { mp: 12 },
    power: 1.0,
    desc: "横扫千军。" },

  /* ===== 通用 ===== */
  { id: "lingqi_bo", name: "灵气波", type: "通用", target: "enemySingle",
    skillReq: {},
    elementReq: {},
    artReq: [],
    toolReq: [],
    cost: { mp: 20 },
    power: 1.3,
    desc: "以灵力攻击，无属性要求。" },
];
