/* ============================================================
   data/items.js - 统一物品表
   ============================================================ */

const ITEMS = {
  /* ============================================================
     丹药
     ============================================================ */
  "回血丹": { type: "pill", name: "回血丹", desc: "恢复 50% 气血", price: 20 },
  "聚气丹": { type: "pill", name: "聚气丹", desc: "修炼 +50%，持续 3 天", price: 40 },
  "静心丹": { type: "pill", name: "静心丹", desc: "心情平复", price: 30 },
  "延寿丹": { type: "pill", name: "延寿丹", desc: "寿元 +50", price: 500 },
  "解毒丹": { type: "pill", name: "解毒丹", desc: "解除中毒", price: 15 },

  /* ============================================================
     材料
     ============================================================ */
  "灵草": { type: "mat", name: "灵草", desc: "炼丹材料", price: 5 },
  "泉水": { type: "mat", name: "泉水", desc: "炼丹材料", price: 3 },
  "妖丹": { type: "mat", name: "妖丹", desc: "妖兽内丹", price: 20 },
  "寒泉": { type: "mat", name: "寒泉", desc: "炼丹材料", price: 10 },
  "千年灵芝": { type: "mat", name: "千年灵芝", desc: "珍稀炼丹材料", price: 200 },

  /* ============================================================
     兽粮
     ============================================================ */
  "food_low":  { type: "food", name: "粗粮", hunger: 30,  price: 10,  desc: "回饥饿 +30" },
  "food_mid":  { type: "food", name: "灵粮", hunger: 60,  price: 50,  desc: "回饥饿 +60" },
  "food_high": { type: "food", name: "仙粮", hunger: 100, price: 200, desc: "回饥饿 +100" },

  /* ============================================================
     灵宠突破材料
     ============================================================ */
  "petBreak_1": { type: "petBreak", name: "灵兽丹·凡", realm: 1, price: 100,  desc: "灵宠突破炼气" },
  "petBreak_2": { type: "petBreak", name: "灵兽丹·中", realm: 2, price: 500,  desc: "灵宠突破筑基" },
  "petBreak_3": { type: "petBreak", name: "灵兽丹·上", realm: 3, price: 2000, desc: "灵宠突破金丹" },

  /* ============================================================
     杂役铺道具
     ============================================================ */
  "dao1":  { type: "other", name: "砍柴刀 Lv1",  cat: "A", price: 100, chore: "chai", lvl: 1, desc: "砍柴时熟练 +0.5" },
  "dao2":  { type: "other", name: "砍柴刀 Lv2",  cat: "A", price: 300, chore: "chai", lvl: 2, desc: "砍柴 +0.5，熟练满时回合减半" },
  "dao3":  { type: "other", name: "砍柴刀 Lv3",  cat: "A", price: 800, chore: "chai", lvl: 3, desc: "砍柴 +0.5，熟练满时回合减到1" },
  "bian1": { type: "other", name: "扁担 Lv1",    cat: "A", price: 100, chore: "tiao", lvl: 1, desc: "挑水时熟练 +0.5" },
  "bian2": { type: "other", name: "扁担 Lv2",    cat: "A", price: 300, chore: "tiao", lvl: 2, desc: "挑水 +0.5，熟练满时回合减半" },
  "bian3": { type: "other", name: "扁担 Lv3",    cat: "A", price: 800, chore: "tiao", lvl: 3, desc: "挑水 +0.5，熟练满时回合减到1" },
  "chu1":  { type: "other", name: "锄头 Lv1",    cat: "A", price: 100, chore: "cai",  lvl: 1, desc: "种菜时熟练 +0.5" },
  "chu2":  { type: "other", name: "锄头 Lv2",    cat: "A", price: 300, chore: "cai",  lvl: 2, desc: "种菜 +0.5，熟练满时回合减半" },
  "chu3":  { type: "other", name: "锄头 Lv3",    cat: "A", price: 800, chore: "cai",  lvl: 3, desc: "种菜 +0.5，熟练满时回合减到1" },
  "ji1":   { type: "other", name: "鸡食盆 Lv1",  cat: "A", price: 100, chore: "ji",   lvl: 1, desc: "养鸡时熟练 +0.5" },
  "ji2":   { type: "other", name: "鸡食盆 Lv2",  cat: "A", price: 300, chore: "ji",   lvl: 2, desc: "养鸡 +0.5，熟练满时回合减半" },
  "ji3":   { type: "other", name: "鸡食盆 Lv3",  cat: "A", price: 800, chore: "ji",   lvl: 3, desc: "养鸡 +0.5，熟练满时回合减到1" },
  "w1":    { type: "other", name: "破瓦片", cat: "B", price: 5,   desc: "似乎没什么用" },
  "w2":    { type: "other", name: "干草",   cat: "B", price: 3,   desc: "一捆干草" },
  "w3":    { type: "other", name: "石头",   cat: "B", price: 1,   desc: "地上捡的石头" },
  "w4":    { type: "other", name: "枯枝",   cat: "B", price: 2,   desc: "折断的树枝" },
  "w5":    { type: "other", name: "泥巴",   cat: "B", price: 1,   desc: "一坨泥巴" },
  "h_qin": { type: "other", name: "古琴", cat: "C", price: 500, hobby: "琴", desc: "解锁【琴】爱好" },
  "h_qi":  { type: "other", name: "棋盘", cat: "C", price: 300, hobby: "棋", desc: "解锁【棋】爱好" },
  "h_shu": { type: "other", name: "笔墨", cat: "C", price: 200, hobby: "书", desc: "解锁【书】爱好" },
  "h_hua": { type: "other", name: "画卷", cat: "C", price: 400, hobby: "画", desc: "解锁【画】爱好" },
  "h_hua2":{ type: "other", name: "花种", cat: "C", price: 150, hobby: "花", desc: "解锁【花】爱好" },
  "h_diao":{ type: "other", name: "鱼竿", cat: "C", price: 100, hobby: "钓", desc: "解锁【钓】爱好" },
  "d_gan": { type: "other", name: "干粮", cat: "D", price: 20, desc: "抵消一次饿肚子" },
  "d_re":  { type: "other", name: "热水", cat: "D", price: 10, desc: "心情 +1" },
  "d_gao": { type: "other", name: "药膏", cat: "D", price: 30, desc: "气血 +20" },

  /* ============================================================
     法术秘籍
     ============================================================ */
  "book_huojian":     { type: "spellbook", name: "火剑秘籍",     spellId: "huojian",     price: 100 },
  "book_huoyanjian":  { type: "spellbook", name: "火焰剑秘籍",   spellId: "huoyanjian",  price: 300 },
  "book_lieyanjian":  { type: "spellbook", name: "烈焰剑秘籍",   spellId: "lieyanjian",  price: 800 },
  "book_jianqi_zhan": { type: "spellbook", name: "剑气斩秘籍",   spellId: "jianqi_zhan", price: 80 },
  "book_bengquan":    { type: "spellbook", name: "崩拳秘籍",     spellId: "bengquan",    price: 60 },
  "book_liehuoquan":  { type: "spellbook", name: "烈火拳秘籍",   spellId: "liehuoquan",  price: 260 },
  "book_bingzhang":   { type: "spellbook", name: "冰霜掌秘籍",   spellId: "bingzhang",   price: 150 },
  "book_kuangdao":    { type: "spellbook", name: "狂刀斩秘籍",   spellId: "kuangdao",    price: 200 },
  "book_saodi":       { type: "spellbook", name: "扫地铁棍秘籍", spellId: "saodi",       price: 120 },
  "book_lingqi_bo":   { type: "spellbook", name: "灵气波秘籍",   spellId: "lingqi_bo",   price: 90 },

  /* ============================================================
     技能秘籍
     ============================================================ */
  "book_sk_sword1": { type: "skillbook", name: "基础剑招秘籍", skillId: "sk_sword1", price: 50 },
  "book_sk_sword2": { type: "skillbook", name: "连环剑秘籍",   skillId: "sk_sword2", price: 150 },
  "book_sk_sword3": { type: "skillbook", name: "剑意斩秘籍",   skillId: "sk_sword3", price: 400 },
  "book_sk_blade1": { type: "skillbook", name: "劈砍秘籍",     skillId: "sk_blade1", price: 50 },
  "book_sk_blade2": { type: "skillbook", name: "狂刀斩秘籍",   skillId: "sk_blade2", price: 150 },
  "book_sk_fist1":  { type: "skillbook", name: "直拳秘籍",     skillId: "sk_fist1",  price: 40 },
  "book_sk_fist2":  { type: "skillbook", name: "崩拳秘籍",     skillId: "sk_fist2",  price: 150 },
  "book_sk_palm1":  { type: "skillbook", name: "推掌秘籍",     skillId: "sk_palm1",  price: 40 },
  "book_sk_palm2":  { type: "skillbook", name: "摧心掌秘籍",   skillId: "sk_palm2",  price: 200 },
  "book_sk_staff1": { type: "skillbook", name: "横扫秘籍",     skillId: "sk_staff1", price: 60 },
  "book_sk_whip1":  { type: "skillbook", name: "鞭击秘籍",     skillId: "sk_whip1",  price: 60 },
  "book_sk_beast1": { type: "skillbook", name: "兽吼秘籍",     skillId: "sk_beast1", price: 80 },
  "book_sk_sacrifice": { type: "skillbook", name: "牺牲秘籍",  skillId: "sk_sacrifice", price: 800 },

  /* ============================================================
     召唤秘籍
     ============================================================ */
  "book_summon_beast":  { type: "summonbook", name: "召唤灵兽秘籍", summonId: "summon_beast",  price: 500 },
  "book_summon_blood":  { type: "summonbook", name: "激发血脉秘籍", summonId: "summon_blood",  price: 500 },
  "book_summon_soul":   { type: "summonbook", name: "招魂帆秘籍",   summonId: "summon_soul",   price: 500 },
  "book_summon_puppet": { type: "summonbook", name: "机关术秘籍",   summonId: "summon_puppet", price: 500 },
  "book_summon_sword":  { type: "summonbook", name: "召唤仙剑秘籍", summonId: "summon_sword",  price: 500 },

  /* ============================================================
     装备
     ============================================================ */
  "e_sword1": { type: "equip", name: "青锋剑",   slot: "rightHand", atk: 5,  def: 0,  hp: 0,  mp: 0,  price: 100, desc: "凡铁剑，聊胜于无" },
  "e_sword2": { type: "equip", name: "玄铁重剑", slot: "rightHand", atk: 12, def: 2,  hp: 0,  mp: 0,  price: 500, desc: "玄铁打造，沉重" },
  "e_armor1": { type: "equip", name: "布衣",     slot: "body",      atk: 0,  def: 5,  hp: 20, mp: 0,  price: 100, desc: "粗布衣" },
  "e_armor2": { type: "equip", name: "皮甲",     slot: "body",      atk: 0,  def: 10, hp: 40, mp: 0,  price: 300, desc: "妖兽皮制" },
  "e_ring1":  { type: "equip", name: "聚灵戒",   slot: "accessory", atk: 0,  def: 0,  hp: 0,  mp: 20, price: 200, desc: "聚灵之戒" },
  "e_ring2":  { type: "equip", name: "护心镜",   slot: "accessory", atk: 0,  def: 3,  hp: 30, mp: 0,  price: 200, desc: "护心之镜" },

  /* 晋升奖励装备 */
  "e_sword_promotion": { type: "equip", name: "宗门制式剑", slot: "rightHand", atk: 15, def: 2,  hp: 0,  mp: 0,  price: 0, desc: "宗门发的制式剑" },
  "e_robe_promotion":  { type: "equip", name: "宗门道袍",   slot: "body",      atk: 0,  def: 8,  hp: 30, mp: 0,  price: 0, desc: "宗门发的道袍" },
  "e_sword_mennei":    { type: "equip", name: "精钢剑",     slot: "rightHand", atk: 25, def: 5,  hp: 0,  mp: 0,  price: 0, desc: "门内弟子制式剑" },
  "e_robe_mennei":     { type: "equip", name: "灵纹袍",     slot: "body",      atk: 0,  def: 15, hp: 50, mp: 10, price: 0, desc: "门内弟子道袍" },
  "e_sword_zhenchuan": { type: "equip", name: "玄铁剑",     slot: "rightHand", atk: 40, def: 10, hp: 0,  mp: 0,  price: 0, desc: "真传弟子配剑" },
  "e_robe_zhenchuan":  { type: "equip", name: "真传道袍",   slot: "body",      atk: 0,  def: 25, hp: 80, mp: 20, price: 0, desc: "真传弟子道袍" },

  /* 装备铺 */
  "shop_head1":   { type: "equip", name: "凡品头巾", slot: "head",      atk: 0,  def: 4,  hp: 15, mp: 0,  price: 30,  desc: "凡品头巾" },
  "shop_sword1":  { type: "equip", name: "凡品铁剑", slot: "rightHand", atk: 6,  def: 0,  hp: 0,  mp: 0,  price: 50,  desc: "凡品铁剑" },
  "shop_shield1": { type: "equip", name: "凡品木盾", slot: "leftHand",  atk: 0,  def: 5,  hp: 10, mp: 0,  price: 40,  desc: "凡品木盾" },
  "shop_body1":   { type: "equip", name: "凡品布衣", slot: "body",      atk: 0,  def: 6,  hp: 20, mp: 0,  price: 60,  desc: "凡品布衣" },
  "shop_shoes1":  { type: "equip", name: "凡品草鞋", slot: "shoes",     atk: 0,  def: 2,  hp: 5,  mp: 0,  price: 25,  desc: "凡品草鞋" },
  "shop_ring1":   { type: "equip", name: "凡品灵戒", slot: "accessory", atk: 0,  def: 0,  hp: 0,  mp: 10, price: 35,  desc: "凡品灵戒" },
  "shop_ring2":   { type: "equip", name: "凡品护符", slot: "accessory", atk: 0,  def: 2,  hp: 15, mp: 0,  price: 35,  desc: "凡品护符" },
  "shop_head2":   { type: "equip", name: "灵品头冠", slot: "head",      atk: 0,  def: 10, hp: 40, mp: 0,  price: 150, desc: "灵品头冠" },
  "shop_sword2":  { type: "equip", name: "灵品长剑", slot: "rightHand", atk: 18, def: 2,  hp: 0,  mp: 0,  price: 250, desc: "灵品长剑" },
  "shop_shield2": { type: "equip", name: "灵品盾",   slot: "leftHand",  atk: 0,  def: 12, hp: 30, mp: 0,  price: 180, desc: "灵品盾" },
  "shop_body2":   { type: "equip", name: "灵品道袍", slot: "body",      atk: 0,  def: 15, hp: 50, mp: 10, price: 300, desc: "灵品道袍" },
  "shop_shoes2":  { type: "equip", name: "灵品靴",   slot: "shoes",     atk: 0,  def: 6,  hp: 20, mp: 0,  price: 120, desc: "灵品靴" },
  "shop_ring3":   { type: "equip", name: "灵品戒指", slot: "accessory", atk: 3,  def: 3,  hp: 20, mp: 20, price: 200, desc: "灵品戒指" },
  "shop_ring4":   { type: "equip", name: "灵品项链", slot: "accessory", atk: 0,  def: 5,  hp: 30, mp: 30, price: 200, desc: "灵品项链" },

  /* ============================================================
     法宝
     ============================================================ */
  "huo_fu":   { type: "artifact", name: "火灵符", slot: "artifact", element: "huo",  atk: 5, spellBonus: 0.10, price: 300, desc: "火系法宝，法术 +10%" },
  "jin_ling": { type: "artifact", name: "金铃",   slot: "artifact", element: "jin",  atk: 4, spellBonus: 0.10, price: 300, desc: "金系法宝，法术 +10%" },
  "mu_teng":  { type: "artifact", name: "木藤环", slot: "artifact", element: "mu",   atk: 3, spellBonus: 0.10, price: 300, desc: "木系法宝，法术 +10%" },
  "shui_zhu": { type: "artifact", name: "水灵珠", slot: "artifact", element: "shui", atk: 4, spellBonus: 0.10, price: 300, desc: "水系法宝，法术 +10%" },
  "tu_yin":   { type: "artifact", name: "土印",   slot: "artifact", element: "tu",   atk: 5, spellBonus: 0.10, price: 300, desc: "土系法宝，法术 +10%" },
  "lei_zhu":  { type: "artifact", name: "雷珠",   slot: "artifact", element: "lei",  atk: 6, spellBonus: 0.10, price: 300, desc: "雷系法宝，法术 +10%" },
  "bing_jing":{ type: "artifact", name: "冰晶",   slot: "artifact", element: "bing", atk: 5, spellBonus: 0.10, price: 300, desc: "冰系法宝，法术 +10%" },

  /* 装备铺法宝 */
  "shop_art_huo":  { type: "artifact", name: "凡品火符", slot: "artifact", element: "huo",  atk: 3, spellBonus: 0.05, price: 120, desc: "凡品火系法宝，法术 +5%" },
  "shop_art_jin":  { type: "artifact", name: "凡品金铃", slot: "artifact", element: "jin",  atk: 3, spellBonus: 0.05, price: 120, desc: "凡品金系法宝，法术 +5%" },
  "shop_art_mu":   { type: "artifact", name: "凡品木环", slot: "artifact", element: "mu",   atk: 2, spellBonus: 0.05, price: 120, desc: "凡品木系法宝，法术 +5%" },
  "shop_art_shui": { type: "artifact", name: "灵品水珠", slot: "artifact", element: "shui", atk: 6, spellBonus: 0.12, price: 500, desc: "灵品水系法宝，法术 +12%" },
  "shop_art_lei":  { type: "artifact", name: "灵品雷珠", slot: "artifact", element: "lei",  atk: 7, spellBonus: 0.12, price: 500, desc: "灵品雷系法宝，法术 +12%" },
  "shop_art_bing": { type: "artifact", name: "灵品冰晶", slot: "artifact", element: "bing", atk: 6, spellBonus: 0.12, price: 500, desc: "灵品冰系法宝，法术 +12%" },

  /* ============================================================
     逆天宝物
     ============================================================ */
  "hd_1": { type: "heavenDefying", name: "混沌珠", slot: "heavenDefying", atk: 10, def: 10, hp: 100, mp: 50, price: 0, desc: "传说中的宝物", effect: "unknown" },

  /* ============================================================
     心法残卷
     ============================================================ */

  /* 练气基础 */
  "lianqi_basic_f2": { type: "heartFragment", name: "练气基础·中卷", artId: "lianqi_basic", start: 4, end: 6, price: 150 },
  "lianqi_basic_f3": { type: "heartFragment", name: "练气基础·下卷", artId: "lianqi_basic", start: 7, end: 10, price: 400 },

  /* 明火心法 */
  "minghuo_heart_f2": { type: "heartFragment", name: "明火心法·中卷", artId: "minghuo_heart", start: 4, end: 6, price: 150 },
  "minghuo_heart_f3": { type: "heartFragment", name: "明火心法·下卷", artId: "minghuo_heart", start: 7, end: 10, price: 400 },

  /* 练气进阶 */
  "lianqi_advanced_f2": { type: "heartFragment", name: "练气进阶·中卷", artId: "lianqi_advanced", start: 4, end: 6, price: 200 },

  /* 练气精要 */
  "lianqi_essence_f2": { type: "heartFragment", name: "练气精要·中卷", artId: "lianqi_essence", start: 4, end: 6, price: 200 },

  /* 练气真解 */
  "lianqi_truth_f2": { type: "heartFragment", name: "练气真解·中卷", artId: "lianqi_truth", start: 4, end: 6, price: 200 },
  "lianqi_truth_f3": { type: "heartFragment", name: "练气真解·下卷", artId: "lianqi_truth", start: 7, end: 10, price: 500 },

  /* 筑基基础 */
  "zhuji_basic_z_f2": { type: "heartFragment", name: "筑基基础·下卷", artId: "zhuji_basic_z", start: 4, end: 5, price: 250 },

  /* 筑基进阶 */
  "zhuji_mid_z_f2": { type: "heartFragment", name: "筑基进阶·下卷", artId: "zhuji_mid_z", start: 4, end: 5, price: 300 },

  /* 邪基基础 */
  "zhuji_basic_x_f2": { type: "heartFragment", name: "邪基基础·下卷", artId: "zhuji_basic_x", start: 4, end: 5, price: 250 },

  /* 邪基进阶 */
  "zhuji_mid_x_f2": { type: "heartFragment", name: "邪基进阶·下卷", artId: "zhuji_mid_x", start: 4, end: 5, price: 300 },

  /* 金丹基础 */
  "jindan_basic_z_f2": { type: "heartFragment", name: "金丹基础·中卷", artId: "jindan_basic_z", start: 4, end: 6, price: 400 },
  "jindan_basic_z_f3": { type: "heartFragment", name: "金丹基础·下卷", artId: "jindan_basic_z", start: 7, end: 7, price: 600 },

  /* 金丹进阶 */
  "jindan_mid_z_f2": { type: "heartFragment", name: "金丹进阶·中卷", artId: "jindan_mid_z", start: 4, end: 6, price: 500 },
  "jindan_mid_z_f3": { type: "heartFragment", name: "金丹进阶·下卷", artId: "jindan_mid_z", start: 7, end: 7, price: 800 },

  /* 邪丹基础 */
  "jindan_basic_x_f2": { type: "heartFragment", name: "邪丹基础·中卷", artId: "jindan_basic_x", start: 4, end: 6, price: 400 },
  "jindan_basic_x_f3": { type: "heartFragment", name: "邪丹基础·下卷", artId: "jindan_basic_x", start: 7, end: 7, price: 600 },

  /* 邪丹进阶 */
  "jindan_mid_x_f2": { type: "heartFragment", name: "邪丹进阶·中卷", artId: "jindan_mid_x", start: 4, end: 6, price: 500 },
  "jindan_mid_x_f3": { type: "heartFragment", name: "邪丹进阶·下卷", artId: "jindan_mid_x", start: 7, end: 7, price: 800 },

  /* 青云剑诀 */
  "qingyun_sword_f2": { type: "heartFragment", name: "青云剑诀·下卷", artId: "qingyun_sword", start: 4, end: 5, price: 500 },

  /* 丹霞真经 */
  "danxia_heart_f2": { type: "heartFragment", name: "丹霞真经·下卷", artId: "danxia_heart", start: 4, end: 5, price: 500 },

  /* 血魔真经 */
  "xuemou_heart_f2": { type: "heartFragment", name: "血魔真经·下卷", artId: "xuemou_heart", start: 4, end: 5, price: 500 },

  /* 雷音大法 */
  "leiyin_heart_f2": { type: "heartFragment", name: "雷音大法·下卷", artId: "leiyin_heart", start: 4, end: 5, price: 500 },

  /* 幽冥鬼典 */
  "youming_heart_f2": { type: "heartFragment", name: "幽冥鬼典·下卷", artId: "youming_heart", start: 4, end: 5, price: 500 },

  /* 万兽真经 */
  "wanshou_heart_f2": { type: "heartFragment", name: "万兽真经·下卷", artId: "wanshou_heart", start: 4, end: 5, price: 500 },

  /* 剑冢剑典 */
  "jianzhong_heart_f2": { type: "heartFragment", name: "剑冢剑典·下卷", artId: "jianzhong_heart", start: 4, end: 5, price: 500 },

  /* 星辰大法 */
  "xingchen_heart_f2": { type: "heartFragment", name: "星辰大法·中卷", artId: "xingchen_heart", start: 4, end: 6, price: 600 },
  "xingchen_heart_f3": { type: "heartFragment", name: "星辰大法·下卷", artId: "xingchen_heart", start: 7, end: 7, price: 900 },
};

/* ============================================================
   工具函数
   ============================================================ */

function getItem(id) {
  return ITEMS[id];
}

function getItemsByType(type) {
  return Object.keys(ITEMS).filter(k => ITEMS[k].type === type);
}

function getAllItemsByType(type) {
  return Object.keys(ITEMS)
    .filter(k => ITEMS[k].type === type)
    .map(k => Object.assign({ id: k }, ITEMS[k]));
}

function addItem(id, count) {
  count = count || 1;
  if (!S.inventory) S.inventory = {};
  S.inventory[id] = (S.inventory[id] || 0) + count;
}

function removeItem(id, count) {
  count = count || 1;
  if (!S.inventory || !S.inventory[id]) return false;
  if (S.inventory[id] < count) return false;
  S.inventory[id] -= count;
  if (S.inventory[id] <= 0) delete S.inventory[id];
  return true;
}

function hasItem(id, count) {
  count = count || 1;
  return (S.inventory && S.inventory[id] || 0) >= count;
}

/* ============================================================
   兼容旧名（旧代码不用改）
   ============================================================ */

const EQUIPS = getAllItemsByType("equip");
const ARTIFACTS = getAllItemsByType("artifact");
const SPELL_BOOKS = getAllItemsByType("spellbook").map(b => ({
  id: b.id, name: b.name, spellId: b.spellId, price: b.price,
}));
const PET_FOODS = getAllItemsByType("food").map(f => ({
  id: f.id, name: f.name, hunger: f.hunger, price: f.price,
}));



/* ============================================================
   ============================================================
   品级系统（丹药 45 + 材料 11）—— 追加区
   ============================================================
   ============================================================ */

/* ============================================================
   1. 品级材料（11 × 9 = 99 个）
   ============================================================ */

const MAT_BASE = [
  { id: "洗骨花",     name: "洗骨花",     maxGrade: 9, basePrice: 5   },
  { id: "草木灰",     name: "草木灰",     maxGrade: 9, basePrice: 2   },
  { id: "清泉水",     name: "清泉水",     maxGrade: 9, basePrice: 3   },
  { id: "玉髓芝",     name: "玉髓芝",     maxGrade: 7, basePrice: 20  },
  { id: "寒血果",     name: "寒血果",     maxGrade: 7, basePrice: 25  },
  { id: "紫猴花",     name: "紫猴花",     maxGrade: 7, basePrice: 22  },
  { id: "水系妖丹",   name: "水系妖丹",   maxGrade: 7, basePrice: 30  },
  { id: "千年降压草", name: "千年降压草", maxGrade: 9, basePrice: 100 },
  { id: "火精枣",     name: "火精枣",     maxGrade: 9, basePrice: 80  },
  { id: "妖兽精血",   name: "妖兽精血",   maxGrade: 9, basePrice: 150 },
  { id: "天地灵乳",   name: "天地灵乳",   maxGrade: 9, basePrice: 300 },
];

MAT_BASE.forEach(m => {
  for (let g = 1; g <= m.maxGrade; g++) {
    ITEMS[m.id + "_" + g] = {
      type: "mat",
      name: m.name,
      baseId: m.id,
      grade: g,
      maxGrade: m.maxGrade,
      price: m.basePrice * g,
      desc: `${g} 品材料`,
    };
  }
});

/* ============================================================
   2. 品级丹药（45 个基础 × 品级）
   ============================================================ */

/* 
  effect.type 说明：
  - heal       : 回血（value = 百分比）
  - healMp     : 回灵（value = 百分比）
  - cure       : 解某个状态（status = "poison" 等）
  - cureAll    : 解所有负面
  - survive    : 濒死保命（value = 触发血线）
  - exp        : 加修为（value = 数值）
  - breakBonus : 突破率加成（value = 加成，小数）
  - buff       : 战斗临时 buff（statusId + turns）
  - permanent  : 永久属性（stat + value）
  - life       : 寿元加成
  - social     : 好感加成（target = 1 表示全体）
  - root       : 灵根加成
  - special    : 特殊（代码手动处理，key = 特殊标识）
  
  usableIn 说明：
  - "battle" : 仅战斗内可用
  - "field"  : 仅战斗外可用
  - "both"   : 两处都可用
*/

const PILL_BASE = [
  /* ---------- 通用 / 基础（6） ---------- */
  { id: "回血丹", name: "回血丹", maxGrade: 5, basePrice: 20,
    effect: { type: "heal", value: 0.5 }, usableIn: "both",
    desc: "恢复 50% 气血" },
  { id: "回灵丹", name: "回灵丹", maxGrade: 5, basePrice: 25,
    effect: { type: "healMp", value: 0.5 }, usableIn: "both",
    desc: "恢复 50% 灵力" },
  { id: "解毒丹", name: "解毒丹", maxGrade: 5, basePrice: 15,
    effect: { type: "cure", status: "poison" }, usableIn: "both",
    desc: "解除中毒" },
  { id: "清心丹", name: "清心丹", maxGrade: 5, basePrice: 30,
    effect: { type: "cureAll" }, usableIn: "both",
    desc: "解除心魔 / 所有负面状态" },
  { id: "疗伤丹", name: "疗伤丹", maxGrade: 5, basePrice: 20,
    effect: { type: "heal", value: 0.3 }, usableIn: "field",
    desc: "战后恢复 30% 气血" },
  { id: "续命丹", name: "续命丹", maxGrade: 9, basePrice: 200,
    effect: { type: "survive", value: 0.3 }, usableIn: "battle",
    desc: "濒死保命（血量 <30% 时自动触发）" },

  /* ---------- 练气期（5） ---------- */
  { id: "聚气丹", name: "聚气丹", maxGrade: 9, basePrice: 40,
    effect: { type: "exp", value: 100, dailyLimit: 5 }, usableIn: "field",
    desc: "+100 练气修为（每日上限 5 粒）" },
  { id: "洗髓丹", name: "洗髓丹", maxGrade: 5, basePrice: 150,
    effect: { type: "root", value: 1 }, usableIn: "field",
    desc: "+1 灵根（永久，不可超过上限）" },
  { id: "黄龙丹", name: "黄龙丹", maxGrade: 9, basePrice: 120,
    effect: { type: "exp", value: 300 }, usableIn: "field",
    desc: "+300 练气修为" },
  { id: "金元丹", name: "金元丹", maxGrade: 7, basePrice: 80,
    effect: { type: "breakBonus", value: 0.10 }, usableIn: "field",
    desc: "突破小境界 +10%" },
  { id: "破障丹", name: "破障丹", maxGrade: 7, basePrice: 100,
    effect: { type: "breakBonus", value: 0.15 }, usableIn: "field",
    desc: "突破率 +15%" },

  /* ---------- 筑基期（5） ---------- */
  { id: "筑基丹", name: "筑基丹", maxGrade: 9, basePrice: 400,
    effect: { type: "breakBonus", value: 0.30 }, usableIn: "field",
    desc: "突破率 +30%" },
  { id: "增元丹", name: "增元丹", maxGrade: 9, basePrice: 250,
    effect: { type: "exp", value: 500 }, usableIn: "field",
    desc: "+500 筑基修为" },
  { id: "定神丹", name: "定神丹", maxGrade: 7, basePrice: 180,
    effect: { type: "special", key: "antiDeviation" }, usableIn: "field",
    desc: "防走火入魔" },
  { id: "雪敏丹", name: "雪敏丹", maxGrade: 7, basePrice: 150,
    effect: { type: "heal", value: 0.3 }, usableIn: "battle",
    desc: "战斗回复 30% 气血" },
  { id: "降尘丹", name: "降尘丹", maxGrade: 9, basePrice: 350,
    effect: { type: "breakBonus", value: 0.20 }, usableIn: "field",
    desc: "辅助突破金丹 +20%" },

  /* ---------- 金丹期（5） ---------- */
  { id: "聚凝丹", name: "聚凝丹", maxGrade: 9, basePrice: 500,
    effect: { type: "exp", value: 1000 }, usableIn: "field",
    desc: "+1000 金丹修为" },
  { id: "结金丹", name: "结金丹", maxGrade: 9, basePrice: 600,
    effect: { type: "breakBonus", value: 0.15 }, usableIn: "field",
    desc: "突破率 +15%" },
  { id: "九转还魂丹", name: "九转还魂丹", maxGrade: 9, basePrice: 2000,
    effect: { type: "special", key: "revive" }, usableIn: "field",
    desc: "复活（12 天冷却）" },
  { id: "补天丹", name: "补天丹", maxGrade: 9, basePrice: 800,
    effect: { type: "special", key: "fixRoot" }, usableIn: "field",
    desc: "修复根基" },
  { id: "培金丹", name: "培金丹", maxGrade: 9, basePrice: 700,
    effect: { type: "special", key: "stabilizeJindan" }, usableIn: "field",
    desc: "稳固金丹" },

  /* ---------- 突破辅助（4） ---------- */
  { id: "破境丹", name: "破境丹", maxGrade: 7, basePrice: 100,
    effect: { type: "breakBonus", value: 0.15 }, usableIn: "field",
    desc: "突破率 +15%" },
  { id: "凝元丹", name: "凝元丹", maxGrade: 7, basePrice: 80,
    effect: { type: "breakBonus", value: 0.10 }, usableIn: "field",
    desc: "突破率 +10%（仅炼气）" },
  { id: "固基丹", name: "固基丹", maxGrade: 7, basePrice: 120,
    effect: { type: "breakBonus", value: 0.20 }, usableIn: "field",
    desc: "突破率 +20%（仅筑基）" },
  { id: "护丹丹", name: "护丹丹", maxGrade: 7, basePrice: 150,
    effect: { type: "special", key: "protectBreak" }, usableIn: "field",
    desc: "突破失败熟练度仅 -15" },

  /* ---------- 修炼加速（4） ---------- */
  { id: "凝神丹", name: "凝神丹", maxGrade: 7, basePrice: 100,
    effect: { type: "special", key: "cultivateBuff", mul: 1.5, days: 1 }, usableIn: "field",
    desc: "修炼 +50%，1 天" },
  { id: "悟道丹", name: "悟道丹", maxGrade: 9, basePrice: 300,
    effect: { type: "special", key: "cultivateBuff", mul: 2.0, days: 1 }, usableIn: "field",
    desc: "修炼 +100%，1 天" },
  { id: "聚灵丹", name: "聚灵丹", maxGrade: 5, basePrice: 200,
    effect: { type: "special", key: "extraAction", value: 1 }, usableIn: "field",
    desc: "打坐额外 +1 行动" },
  { id: "静心丹", name: "静心丹", maxGrade: 5, basePrice: 30,
    effect: { type: "mood", value: 1 }, usableIn: "field",
    desc: "心情 +1" },

  /* ---------- 属性永久（6） ---------- */
  { id: "淬体丹", name: "淬体丹", maxGrade: 9, basePrice: 300,
    effect: { type: "permanent", stat: "hpMax", value: 50 }, usableIn: "field",
    desc: "气血上限 +50" },
  { id: "锻骨丹", name: "锻骨丹", maxGrade: 9, basePrice: 300,
    effect: { type: "permanent", stat: "def", value: 5 }, usableIn: "field",
    desc: "防御 +5" },
  { id: "锐金丹", name: "锐金丹", maxGrade: 9, basePrice: 300,
    effect: { type: "permanent", stat: "atk", value: 5 }, usableIn: "field",
    desc: "攻击 +5" },
  { id: "轻身丹", name: "轻身丹", maxGrade: 9, basePrice: 300,
    effect: { type: "permanent", stat: "speed", value: 3 }, usableIn: "field",
    desc: "速度 +3" },
  { id: "延寿丹", name: "延寿丹", maxGrade: 5, basePrice: 500,
    effect: { type: "life", value: 50 }, usableIn: "field",
    desc: "寿元 +50" },
  { id: "驻颜丹", name: "驻颜丹", maxGrade: 5, basePrice: 400,
    effect: { type: "special", key: "youth" }, usableIn: "field",
    desc: "外表不老" },

  /* ---------- 社交 / 特殊（4） ---------- */
  { id: "合欢丹", name: "合欢丹", maxGrade: 5, basePrice: 200,
    effect: { type: "social", value: 10, target: "all" }, usableIn: "field",
    desc: "NPC 好感 +10（全体）" },
  { id: "迷魂丹", name: "迷魂丹", maxGrade: 7, basePrice: 180,
    effect: { type: "inflict", status: "stun", chance: 0.8 }, usableIn: "battle",
    desc: "战斗使敌人眩晕 1 回合" },
  { id: "蚀骨丹", name: "蚀骨丹", maxGrade: 7, basePrice: 200,
    effect: { type: "inflict", status: "poison", chance: 0.9 }, usableIn: "battle",
    desc: "战斗使敌人中毒 3 回合" },
  { id: "爆灵丹", name: "爆灵丹", maxGrade: 7, basePrice: 250,
    effect: { type: "buff", statusId: "atkUp", turns: 1 }, usableIn: "battle",
    desc: "法术威力 +50%，1 回合" },

  /* ---------- 炼器 / 炼丹辅助（3） ---------- */
  { id: "凝火丹", name: "凝火丹", maxGrade: 7, basePrice: 150,
    effect: { type: "special", key: "alchemyBuff", rate: 0.2, output: 1 }, usableIn: "field",
    desc: "炼丹成功率 +20%，产出 +1" },
  { id: "聚火丹", name: "聚火丹", maxGrade: 7, basePrice: 150,
    effect: { type: "special", key: "forgeBuff", rate: 0.2 }, usableIn: "field",
    desc: "炼器成功率 +20%" },
  { id: "定魂丹", name: "定魂丹", maxGrade: 7, basePrice: 200,
    effect: { type: "special", key: "forgeProtect" }, usableIn: "field",
    desc: "炼器防炸炉" },

  /* ---------- 邪道专属（3） ---------- */
  { id: "血煞丹", name: "血煞丹", maxGrade: 7, basePrice: 250,
    effect: { type: "special", key: "bloodRage", atkMul: 0.3, hpCost: 0.1, days: 1 }, usableIn: "field",
    desc: "攻击 +30%，1 天（扣 10% 气血）" },
  { id: "魔元丹", name: "魔元丹", maxGrade: 7, basePrice: 300,
    effect: { type: "breakBonus", value: 0.25, moodCost: -2 }, usableIn: "field",
    desc: "突破率 +25%，心情 -2" },
  { id: "噬魂丹", name: "噬魂丹", maxGrade: 7, basePrice: 350,
    effect: { type: "special", key: "lifesteal", value: 0.2 }, usableIn: "field",
    desc: "击杀回血 20%" },

  /* ---------- 灵兽特殊（8） ---------- */
  { id: "灵兽洗髓丹", name: "灵兽洗髓丹", maxGrade: 7, basePrice: 300,
    effect: { type: "petSpecial", key: "rerollTalent" }, usableIn: "field",
    desc: "灵宠天赋重掷" },
  { id: "灵兽血脉丹", name: "灵兽血脉丹", maxGrade: 7, basePrice: 300,
    effect: { type: "petSpecial", key: "rerollBloodline" }, usableIn: "field",
    desc: "灵宠血脉重掷" },
  { id: "灵兽淬体丹", name: "灵兽淬体丹", maxGrade: 9, basePrice: 400,
    effect: { type: "petSpecial", key: "hpUp", value: 50 }, usableIn: "field",
    desc: "灵宠气血 +50" },
  { id: "灵兽锻骨丹", name: "灵兽锻骨丹", maxGrade: 9, basePrice: 400,
    effect: { type: "petSpecial", key: "defUp", value: 5 }, usableIn: "field",
    desc: "灵宠防御 +5" },
  { id: "灵兽锐爪丹", name: "灵兽锐爪丹", maxGrade: 9, basePrice: 400,
    effect: { type: "petSpecial", key: "atkUp", value: 5 }, usableIn: "field",
    desc: "灵宠攻击 +5" },
  { id: "灵兽轻身丹", name: "灵兽轻身丹", maxGrade: 9, basePrice: 400,
    effect: { type: "petSpecial", key: "speedUp", value: 3 }, usableIn: "field",
    desc: "灵宠速度 +3" },
  { id: "灵兽经验丹", name: "灵兽经验丹", maxGrade: 9, basePrice: 500,
    effect: { type: "petSpecial", key: "expUp", value: 500 }, usableIn: "field",
    desc: "灵宠 +500 修为" },
  { id: "灵兽忠诚丹", name: "灵兽忠诚丹", maxGrade: 5, basePrice: 200,
    effect: { type: "petSpecial", key: "hungerFull" }, usableIn: "field",
    desc: "灵宠饥饿回满" },
];

/* 生成丹药 × 品级 */
PILL_BASE.forEach(p => {
  for (let g = 1; g <= p.maxGrade; g++) {
    ITEMS[p.id + "_" + g] = {
      type: "pill",
      name: p.name,
      baseId: p.id,
      grade: g,
      maxGrade: p.maxGrade,
      price: p.basePrice * g,
      effect: scalePillEffect(p.effect, g),
      usableIn: p.usableIn,
      desc: p.desc + `（${g} 品）`,
    };
  }
});

/* 效果随品级缩放 */
function scalePillEffect(effect, grade) {
  if (!effect) return effect;
  const e = JSON.parse(JSON.stringify(effect));
  const g = grade;

  switch (e.type) {
    case "heal":
    case "healMp":
      /* 5 品以上回满 */
      if (g >= 5) e.value = 1.0;
      else e.value = Math.min(1.0, (e.value || 0.5) + (g - 1) * 0.1);
      break;
    case "exp":
      e.value = (e.value || 0) * g;
      break;
    case "breakBonus":
      e.value = (e.value || 0) + (g - 1) * 0.02;
      break;
    case "permanent":
      e.value = (e.value || 0) * g;
      break;
    case "life":
      e.value = (e.value || 0) * g;
      break;
    case "social":
      e.value = (e.value || 0) * g;
      break;
    case "root":
      /* 洗髓丹：1 品 +1，5 品 +2 */
      e.value = g >= 5 ? 2 : 1;
      break;
    case "mood":
      e.value = Math.min(2, (e.value || 1) + Math.floor((g - 1) / 2));
      break;
    case "survive":
      /* 续命丹：品级越高触发血线越高 */
      e.value = Math.min(0.9, (e.value || 0.3) + (g - 1) * 0.05);
      break;
    case "petSpecial":
      if (e.value) e.value = e.value * g;
      break;
    /* 其他类型不缩放 */
  }
  return e;
}

/* ============================================================
   3. 兼容层：移除旧的无品级丹药 / 材料，避免 id 冲突
   ============================================================ */

/* 删除旧的 5 个丹药（"回血丹" / "聚气丹" / "静心丹" / "延寿丹" / "解毒丹"） */
["回血丹", "聚气丹", "静心丹", "延寿丹", "解毒丹"].forEach(id => {
  if (ITEMS[id] && !ITEMS[id].grade) {
    delete ITEMS[id];
  }
});

/* 删除旧的 5 个材料（"灵草" / "泉水" / "妖丹" / "寒泉" / "千年灵芝"） */
["灵草", "泉水", "妖丹", "寒泉", "千年灵芝"].forEach(id => {
  if (ITEMS[id] && ITEMS[id].type === "mat" && !ITEMS[id].grade) {
    delete ITEMS[id];
  }
});

/* ============================================================
   4. 兼容旧代码：需要旧 id 的地方映射到 1 品
   ============================================================ */

/* 保底：如果某些代码仍引用旧 id，作为别名指向 1 品 */
ITEMS["灵草"] = ITEMS["洗骨花_1"];
ITEMS["泉水"] = ITEMS["清泉水_1"];
ITEMS["妖丹"] = ITEMS["水系妖丹_1"];
ITEMS["寒泉"] = ITEMS["清泉水_2"];
ITEMS["千年灵芝"] = ITEMS["千年降压草_1"];