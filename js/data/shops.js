/* ============================================================
   data/shops.js - 宗门商店配置
   
   规则：
   - realm: 数字 → 只在对应境界显示（0=凡人, 1=炼气, 2=筑基, 3=金丹）
   - realm: [数组] → 在列出的境界显示
   - _common: 通用（所有宗门都显示）
   - _sword: 召唤专用（无本门专属时回退）
   - artId: 对应心法 id（代码自动找 + "_f1" 上卷）
   - spellId: 对应法术 id（代码自动找 "book_" + spellId）
   - summonId: 对应召唤 id（代码自动找 "book_" + summonId）
   - itemId: 对应物品 id（装备）
   ============================================================ */

/* ============================================================
   心法商店
   ============================================================ */

const SECT_ART_SHOP = {
  _common: [
    { artId: "lianqi_basic",    realm: [0, 1], price: 50   },
    { artId: "lianqi_jin",      realm: [0, 1], price: 100  },
    { artId: "lianqi_mu",       realm: [0, 1], price: 100  },
    { artId: "minghuo_heart",   realm: [0, 1], price: 200  },
    { artId: "lianqi_advanced", realm: [1, 2], price: 150  },
    { artId: "lianqi_essence",  realm: [1, 2], price: 200  },
    { artId: "lianqi_truth",    realm: [1, 2], price: 300  },
    { artId: "zhuji_basic_z",   realm: 2,      price: 500  },
    { artId: "zhuji_mid_z",     realm: 2,      price: 800  },
    { artId: "zhuji_basic_x",   realm: 2,      price: 500  },
    { artId: "zhuji_mid_x",     realm: 2,      price: 800  },
    { artId: "jindan_basic_z",  realm: 3,      price: 1500 },
    { artId: "jindan_mid_z",    realm: 3,      price: 2500 },
    { artId: "jindan_basic_x",  realm: 3,      price: 1500 },
    { artId: "jindan_mid_x",    realm: 3,      price: 2500 },
  ],

  qingyun: [
    { artId: "qingyun_lianqi", realm: 1, price: 100 },
    { artId: "qingyun_sword",  realm: 2, price: 500 },
  ],
  danxia: [
    { artId: "danxia_lianqi", realm: 1, price: 100 },
    { artId: "danxia_heart",  realm: 2, price: 500 },
  ],
  hehuan: [
    { artId: "hehuan_lianqi", realm: 1, price: 100 },
  ],
  wanshou: [
    { artId: "wanshou_lianqi", realm: 1, price: 100 },
    { artId: "wanshou_heart",  realm: 2, price: 500 },
  ],
  tianji: [
    { artId: "tianji_lianqi", realm: 1, price: 100 },
  ],
  fulu: [
    { artId: "fulu_lianqi", realm: 1, price: 100 },
  ],
  youming: [
    { artId: "youming_lianqi", realm: 1, price: 100 },
    { artId: "youming_heart",  realm: 2, price: 500 },
  ],
  xuemou: [
    { artId: "xuemou_lianqi", realm: 1, price: 100 },
    { artId: "xuemou_heart",  realm: 2, price: 500 },
  ],
  xuanbing: [
    { artId: "xuanbing_lianqi", realm: 1, price: 100 },
  ],
  leiyin: [
    { artId: "leiyin_lianqi", realm: 1, price: 100 },
    { artId: "leiyin_heart",  realm: 2, price: 500 },
  ],
  yaowang: [
    { artId: "yaowang_lianqi", realm: 1, price: 100 },
  ],
  jianzhong: [
    { artId: "jianzhong_lianqi", realm: 1, price: 100 },
    { artId: "jianzhong_heart",  realm: 2, price: 500 },
  ],
  linglong: [
    { artId: "linglong_lianqi", realm: 1, price: 100 },
  ],
  huanyue: [
    { artId: "huanyue_lianqi", realm: 1, price: 100 },
  ],
  xingchen: [
    { artId: "xingchen_lianqi", realm: 1, price: 100 },
    { artId: "xingchen_heart",  realm: [2, 3], price: 800 },
  ],
};

/* ============================================================
   法术商店
   ============================================================ */

const SECT_SPELL_SHOP = {
  _common: [
    { spellId: "jianqi_zhan", realm: 1, price: 80  },
    { spellId: "bengquan",    realm: 1, price: 60  },
    { spellId: "bingzhang",   realm: 1, price: 150 },
    { spellId: "kuangdao",    realm: 1, price: 200 },
    { spellId: "saodi",       realm: 1, price: 120 },
    { spellId: "lingqi_bo",   realm: 1, price: 90  },
    { spellId: "huojian",     realm: 1, price: 100 },
    { spellId: "huoyanjian",  realm: 2, price: 300 },
    { spellId: "lieyanjian",  realm: 2, price: 800 },
    { spellId: "liehuoquan",  realm: 2, price: 260 },
  ],

  qingyun: [],
  danxia:  [],
  hehuan:  [],
  wanshou: [],
  tianji:  [],
  fulu:    [],
  youming: [],
  xuemou:  [],
  xuanbing:[],
  leiyin:  [],
  yaowang: [],
  jianzhong: [],
  linglong: [],
  huanyue:  [],
  xingchen: [],
};

/* ============================================================
   装备商店
   ============================================================ */

const SECT_EQUIP_SHOP = {
  _common: [
    /* 凡品套装（炼气） */
    { itemId: "shop_head1",   realm: 1, price: 30  },
    { itemId: "shop_sword1",  realm: 1, price: 50  },
    { itemId: "shop_shield1", realm: 1, price: 40  },
    { itemId: "shop_body1",   realm: 1, price: 60  },
    { itemId: "shop_shoes1",  realm: 1, price: 25  },
    { itemId: "shop_ring1",   realm: 1, price: 35  },
    { itemId: "shop_ring2",   realm: 1, price: 35  },
    { itemId: "shop_art_huo", realm: 1, price: 120 },
    { itemId: "shop_art_jin", realm: 1, price: 120 },
    { itemId: "shop_art_mu",  realm: 1, price: 120 },

    /* 灵品套装（筑基） */
    { itemId: "shop_head2",   realm: 2, price: 150 },
    { itemId: "shop_sword2",  realm: 2, price: 250 },
    { itemId: "shop_shield2", realm: 2, price: 180 },
    { itemId: "shop_body2",   realm: 2, price: 300 },
    { itemId: "shop_shoes2",  realm: 2, price: 120 },
    { itemId: "shop_ring3",   realm: 2, price: 200 },
    { itemId: "shop_ring4",   realm: 2, price: 200 },
    { itemId: "shop_art_shui",realm: 2, price: 500 },
    { itemId: "shop_art_lei", realm: 2, price: 500 },
    { itemId: "shop_art_bing",realm: 2, price: 500 },
  ],

  qingyun: [],
  danxia:  [],
  hehuan:  [],
  wanshou: [],
  tianji:  [],
  fulu:    [],
  youming: [],
  xuemou:  [],
  xuanbing:[],
  leiyin:  [],
  yaowang: [],
  jianzhong: [],
  linglong: [],
  huanyue:  [],
  xingchen: [],
};

/* ============================================================
   召唤商店
   ============================================================ */

const SECT_SUMMON_SHOP = {
  _common: [],

  /* 4 个特殊宗门（专属召唤） */
  wanshou: [{ summonId: "summon_beast",  realm: 1, price: 500 }],
  xuemou:  [{ summonId: "summon_blood",  realm: 1, price: 500 }],
  youming: [{ summonId: "summon_soul",   realm: 1, price: 500 }],
  tianji:  [{ summonId: "summon_puppet", realm: 1, price: 500 }],

  /* 其他宗门 → 用 _sword（召唤仙剑） */
  _sword: [{ summonId: "summon_sword", realm: 1, price: 500 }],
};

/* ============================================================
   工具函数
   ============================================================ */

/* 取商店条目（通用 + 本门） */
function getShopItems(shopConfig, sectId) {
  const list = [];
  if (shopConfig._common) list.push(...shopConfig._common);
  if (sectId && shopConfig[sectId]) list.push(...shopConfig[sectId]);
  return list;
}

/* 取召唤商店（无本门专属 → 用 _sword） */
function getSummonShopItems(sectId) {
  const list = [];
  if (SECT_SUMMON_SHOP._common) list.push(...SECT_SUMMON_SHOP._common);
  if (sectId && SECT_SUMMON_SHOP[sectId]) {
    list.push(...SECT_SUMMON_SHOP[sectId]);
  } else if (SECT_SUMMON_SHOP._sword) {
    list.push(...SECT_SUMMON_SHOP._sword);
  }
  return list;
}

/* 按玩家境界过滤 */
function filterShopByRealm(items, playerRealm) {
  return items.filter(item => {
    if (Array.isArray(item.realm)) return item.realm.includes(playerRealm);
    return item.realm === playerRealm;
  });
}