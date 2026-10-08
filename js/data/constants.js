/* ============================================================
   data/constants.js - 全局常量
   ============================================================ */

/* 心法 / 技能 */
const MAX_HEART = 100;
const MAX_SKILL_LVL = 10;
const SKILL_LVL_EXP = 100;

/* 时间 */
const HOURS = ["早", "午", "晚"];
const ACTIONS_PER_SLOT = 4;

/* 身份 */
const RANKS = ["杂务", "门外", "门内", "真传"];

/* 心情 */
const MOOD_EMOJI = ["😭", "😔", "😐", "🙂", "😄"];
const MOOD_NAMES = ["大悲", "低落", "平静", "愉悦", "大喜"];

/* 主菜单 */
const TABS = [
  { id: "day",    name: "日常" },
  { id: "sect",   name: "宗门" },
  { id: "social", name: "社交" },
  { id: "cave",   name: "洞府" },
];

/* 角色面板 */
const PROFILE_TABS = ["角色信息", "背包", "装配", "心法", "技能", "杂务", "爱好"];
const BAG_TABS = ["丹药", "材料", "装备", "其他"];

/* 月俸 */
const RANK_PAY = {
  "杂务": 50,
  "门外": 100,
  "门内": 5,
  "真传": 15,
};

/* 晋升条件 */
const RANK_REQ = {
  "门外": {
    money: 2000, contrib: 0, realm: 1, subMin: 3,
    npcAff: 50, npcRole: "执事",
    desc: "炼气 3 重 + 2000 铜钱 + 执事好感 ≥ 50",
  },
  "门内": {
    money: 0, contrib: 150, realm: 1, subMin: 0,
    npcAff: 50, npcRole: "长老",
    desc: "贡献 150 + 炼气以上 + 长老好感 ≥ 50",
  },
  "真传": {
    money: 0, contrib: 400, realm: 2, subMin: 0,
    npcAff: 50, npcRole: "长老",
    desc: "贡献 400 + 筑基以上 + 长老好感 ≥ 50",
  },
};

/* 节日发放 */
const FESTIVAL_BASE = 10;
const FESTIVAL_RANK_BONUS = {
  "杂务": 100,
  "门外": 300,
  "门内": 10,
  "真传": 60,
};

/* 杂役铺刷新 */
const SHOP_SIZE = 10;
const SHOP_REFRESH_COST = 150;

/* 战斗 */
const CRIT_RATE = 0.05;
const CRIT_MULT = 2.0;

/* 其他 */
const LUNAR_MONTHS = [
  "正月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "冬月", "腊月",
]

/* 晋升奖励 */
const PROMOTION_REWARDS = {
  "门外": {
    art: "lianqi_advanced",
    weapon: "e_sword_promotion",
    armor: "e_robe_promotion",
    special: "choosePeak",
  },
  "门内": {
    art: "lianqi_essence",
    weapon: "e_sword_mennei",
    armor: "e_robe_mennei",
  },
  "真传": {
    art: "lianqi_truth",
    weapon: "e_sword_zhenchuan",
    armor: "e_robe_zhenchuan",
  },
};

/* 残卷兑换价格（按 end 等级） */
const FRAGMENT_PRICE = {
  3:  80,
  5:  150,
  6:  200,
  7:  300,
  10: 500,
};