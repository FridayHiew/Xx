/* ============================================================
   data/heaven-defying.js - 逆天宝物（迷雾 → 逐层揭示）
   
   设计：
   - 阶段 0：未知（name 模糊，无效果）
   - 阶段 1：揭示（name 真名，有效果）
   - 以后可加阶段 2/3
   
   字段：
   - id / effect / slot
   - name / desc          // 阶段 0（默认）
   - stages: [            // 各阶段
       { stage, name, desc, effects: {...} },
       ...
     ]
   - revealConditions: [  // 揭示条件
       { stage, type, count }
       type: "meditate" | "breakthrough" | "explore" | "kill" | ...
     ]
   ============================================================ */

const HEAVEN_DEFYING = [
  {
    id: "hd_tianni",
    effect: "tianni",
    slot: "heavenDefying",
    name: "不知名珠子",
    desc: "感觉不一样的珠子",
    stages: [
      { stage: 0, name: "不知名珠子", desc: "感觉不一样的珠子", effects: {} },
      { stage: 1, name: "天逆珠", desc: "时间流速 ×2（修炼 +100%）", effects: { cultivateMul: 1.0 } },
    ],
    revealConditions: [
      { stage: 1, type: "meditate", count: 3 },
    ],
  },

  {
    id: "hd_zhangtian",
    effect: "zhangtian",
    slot: "heavenDefying",
    name: "不知名小瓶",
    desc: "泛着绿光的小瓶",
    stages: [
      { stage: 0, name: "不知名小瓶", desc: "泛着绿光的小瓶", effects: {} },
      { stage: 1, name: "掌天瓶", desc: "每日凝聚 1 滴造化露（未开放）", effects: { special: "dailyLiquid" } },
    ],
    revealConditions: [
      { stage: 1, type: "meditate", count: 10 },
    ],
  },

  {
    id: "hd_tailing",
    effect: "tailing",
    slot: "heavenDefying",
    name: "残破书页",
    desc: "看不懂文字的残页",
    stages: [
      { stage: 0, name: "残破书页", desc: "看不懂文字的残页", effects: {} },
      { stage: 1, name: "太灵经残卷", desc: "突破成功率 +50%", effects: { breakRate: 0.5 } },
    ],
    revealConditions: [
      { stage: 1, type: "breakthrough", count: 1 },
    ],
  },

  {
    id: "hd_hunyuan",
    effect: "hunyuan",
    slot: "heavenDefying",
    name: "沉重小鼎",
    desc: "刻满古老纹路的鼎",
    stages: [
      { stage: 0, name: "沉重小鼎", desc: "刻满古老纹路的鼎", effects: {} },
      { stage: 1, name: "混元乾坤鼎", desc: "炼器附加词条满值（未开放）", effects: { special: "perfectCraft" } },
    ],
    revealConditions: [
      { stage: 1, type: "explore", count: 5 },
    ],
  },

  {
    id: "hd_hunfan",
    effect: "hunfan",
    slot: "heavenDefying",
    name: "漆黑小幡",
    desc: "散发阴气的小幡",
    stages: [
      { stage: 0, name: "漆黑小幡", desc: "散发阴气的小幡", effects: {} },
      { stage: 1, name: "百万魂幡", desc: "法术暴击 +10%，吸血 +10%（战斗部分未开放）", effects: { spellCrit: 0.1, lifesteal: 0.1 } },
    ],
    revealConditions: [
      { stage: 1, type: "kill", count: 10 },
    ],
  },

  {
    id: "hd_hulu",
    effect: "hulu",
    slot: "heavenDefying",
    name: "紫金小葫",
    desc: "泛着紫光的小葫芦",
    stages: [
      { stage: 0, name: "紫金小葫", desc: "泛着紫光的小葫芦", effects: {} },
      { stage: 1, name: "紫金乾坤葫", desc: "吞噬残血敌人（未开放）", effects: { special: "devour" } },
    ],
    revealConditions: [
      { stage: 1, type: "kill", count: 20 },
    ],
  },

  {
    id: "hd_shengsi",
    effect: "shengsi",
    slot: "heavenDefying",
    name: "泛黄纸页",
    desc: "不知名的泛黄纸页",
    stages: [
      { stage: 0, name: "泛黄纸页", desc: "不知名的泛黄纸页", effects: {} },
      { stage: 1, name: "生死簿残页", desc: "免死一次（12 天冷却）；幸运 +5", effects: { special: "revive", luckBonus: 5 } },
    ],
    revealConditions: [
      { stage: 1, type: "meditate", count: 30 },
    ],
  },

  {
    id: "hd_qinglian",
    effect: "qinglian",
    slot: "heavenDefying",
    name: "青色小莲子",
    desc: "蕴含生机的莲子",
    stages: [
      { stage: 0, name: "青色小莲子", desc: "蕴含生机的莲子", effects: {} },
      { stage: 1, name: "混沌青莲子", desc: "气血上限 +200%；每回合回血 5%", effects: { hpMul: 2.0, regen: 0.05 } },
    ],
    revealConditions: [
      { stage: 1, type: "meditate", count: 20 },
    ],
  },

  {
    id: "hd_lushen",
    effect: "lushen",
    slot: "heavenDefying",
    name: "锈蚀小剑",
    desc: "锈迹斑斑的小剑",
    stages: [
      { stage: 0, name: "锈蚀小剑", desc: "锈迹斑斑的小剑", effects: {} },
      { stage: 1, name: "九转戮神剑", desc: "每杀敌 +1% 攻击（上限 99 层）；破甲 30%", effects: { special: "killStack", armorPierce: 0.3 } },
    ],
    revealConditions: [
      { stage: 1, type: "kill", count: 50 },
    ],
  },

  {
    id: "hd_luopan",
    effect: "luopan",
    slot: "heavenDefying",
    name: "残破罗盘",
    desc: "指针乱转的罗盘",
    stages: [
      { stage: 0, name: "残破罗盘", desc: "指针乱转的罗盘", effects: {} },
      { stage: 1, name: "诸天星罗盘", desc: "传送 / 秘境扫描（未开放）", effects: { special: "teleport" } },
    ],
    revealConditions: [
      { stage: 1, type: "explore", count: 10 },
    ],
  },
];

/* ============================================================
   工具函数
   ============================================================ */

function getHeavenDefying(id) {
  return HEAVEN_DEFYING.find(h => h.id === id);
}

/* 当前阶段 */
function getHeavenDefyingStage(id) {
  if (!S.heavenDefying || !S.heavenDefying.stages) return 0;
  return S.heavenDefying.stages[id] || 0;
}

/* 当前阶段数据 */
function getHeavenDefyingStageData(id) {
  const hd = getHeavenDefying(id);
  if (!hd) return null;
  const stage = getHeavenDefyingStage(id);
  return hd.stages.find(s => s.stage === stage) || hd.stages[0];
}

/* 显示用 name / desc */
function getHeavenDefyingDisplay(id) {
  const data = getHeavenDefyingStageData(id);
  if (!data) return null;
  return {
    name: data.name,
    desc: data.desc,
    stage: data.stage,
  };
}

/* 当前效果（按阶段） */
function getHeavenDefyingEffect(id) {
  const data = getHeavenDefyingStageData(id);
  return data ? (data.effects || {}) : {};
}