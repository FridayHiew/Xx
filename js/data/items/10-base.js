/* ============================================================
   data/items/10-base.js - 静态基础物品
   ------------------------------------------------------------
   按 type 分区，未来单 type 太大时可单独拆出。
   ============================================================ */

/* ============================================================
   无品级丹药（旧版残留，保留兼容）
   ============================================================ */
Object.assign(ITEMS, {
  "回血丹": { type: "pill", name: "回血丹", desc: "恢复 50% 气血", price: 20 },
  "聚气丹": { type: "pill", name: "聚气丹", desc: "修炼 +50%，持续 3 天", price: 40 },
  "静心丹": { type: "pill", name: "静心丹", desc: "心情平复", price: 30 },
  "延寿丹": { type: "pill", name: "延寿丹", desc: "寿元 +50", price: 500 },
  "解毒丹": { type: "pill", name: "解毒丹", desc: "解除中毒", price: 15 },

  /* ============================================================
     无品级材料（旧版残留）
     ============================================================ */
  "灵草": { type: "mat", name: "灵草", desc: "炼丹材料", price: 5 },
  "泉水": { type: "mat", name: "泉水", desc: "炼丹材料", price: 3 },
  "妖丹": { type: "mat", name: "妖丹", desc: "妖兽内丹", price: 20 },
  "寒泉": { type: "mat", name: "寒泉", desc: "炼丹材料", price: 10 },
  "千年灵芝": { type: "mat", name: "千年灵芝", desc: "珍稀炼丹材料", price: 200 },
});

/* ============================================================
   兽粮
   ============================================================ */
Object.assign(ITEMS, {
  "food_low":  { type: "food", name: "粗粮", hunger: 30,  price: 10,  desc: "回饥饿 +30" },
  "food_mid":  { type: "food", name: "灵粮", hunger: 60,  price: 50,  desc: "回饥饿 +60" },
  "food_high": { type: "food", name: "仙粮", hunger: 100, price: 200, desc: "回饥饿 +100" },
});

/* ============================================================
   灵宠突破材料
   ============================================================ */
Object.assign(ITEMS, {
  "petBreak_1": { type: "petBreak", name: "灵兽丹·凡", realm: 1, price: 100,  desc: "灵宠突破炼气" },
  "petBreak_2": { type: "petBreak", name: "灵兽丹·中", realm: 2, price: 500,  desc: "灵宠突破筑基" },
  "petBreak_3": { type: "petBreak", name: "灵兽丹·上", realm: 3, price: 2000, desc: "灵宠突破金丹" },
});

/* ============================================================
   杂役铺道具
   ============================================================ */
Object.assign(ITEMS, {
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
});

/* ============================================================
   法术秘籍
   ============================================================ */
Object.assign(ITEMS, {
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
});

/* ============================================================
   技能秘籍
   ============================================================ */
Object.assign(ITEMS, {
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
});

/* ============================================================
   召唤秘籍
   ============================================================ */
Object.assign(ITEMS, {
  "book_summon_beast":  { type: "summonbook", name: "召唤灵兽秘籍", summonId: "summon_beast",  price: 500 },
  "book_summon_blood":  { type: "summonbook", name: "激发血脉秘籍", summonId: "summon_blood",  price: 500 },
  "book_summon_soul":   { type: "summonbook", name: "招魂帆秘籍",   summonId: "summon_soul",   price: 500 },
  "book_summon_puppet": { type: "summonbook", name: "机关术秘籍",   summonId: "summon_puppet", price: 500 },
  "book_summon_sword":  { type: "summonbook", name: "召唤仙剑秘籍", summonId: "summon_sword",  price: 500 },
});

/* ============================================================
   装备
   ============================================================ */
Object.assign(ITEMS, {
  "e_sword1": { type: "equip", name: "青锋剑",   slot: "rightHand", atk: 5,  def: 0,  hp: 0,  mp: 0,  price: 100, desc: "凡铁剑，聊胜于无" },
  "e_sword2": { type: "equip", name: "玄铁重剑", slot: "rightHand", atk: 12, def: 2,  hp: 0,  mp: 0,  price: 500, desc: "玄铁打造，沉重" },
  "e_armor1": { type: "equip", name: "布衣",     slot: "body",      atk: 0,  def: 5,  hp: 20, mp: 0,  price: 100, desc: "粗布衣" },
  "e_armor2": { type: "equip", name: "皮甲",     slot: "body",      atk: 0,  def: 10, hp: 40, mp: 0,  price: 300, desc: "妖兽皮制" },
  "e_ring1":  { type: "equip", name: "聚灵戒",   slot: "accessory", atk: 0,  def: 0,  hp: 0,  mp: 20, price: 200, desc: "聚灵之戒" },
  "e_ring2":  { type: "equip", name: "护心镜",   slot: "accessory", atk: 0,  def: 3,  hp: 30, mp: 0,  price: 200, desc: "护心之镜" },

  "e_sword_promotion": { type: "equip", name: "宗门制式剑", slot: "rightHand", atk: 15, def: 2,  hp: 0,  mp: 0,  price: 0, desc: "宗门发的制式剑" },
  "e_robe_promotion":  { type: "equip", name: "宗门道袍",   slot: "body",      atk: 0,  def: 8,  hp: 30, mp: 0,  price: 0, desc: "宗门发的道袍" },
  "e_sword_mennei":    { type: "equip", name: "精钢剑",     slot: "rightHand", atk: 25, def: 5,  hp: 0,  mp: 0,  price: 0, desc: "门内弟子制式剑" },
  "e_robe_mennei":     { type: "equip", name: "灵纹袍",     slot: "body",      atk: 0,  def: 15, hp: 50, mp: 10, price: 0, desc: "门内弟子道袍" },
  "e_sword_zhenchuan": { type: "equip", name: "玄铁剑",     slot: "rightHand", atk: 40, def: 10, hp: 0,  mp: 0,  price: 0, desc: "真传弟子配剑" },
  "e_robe_zhenchuan":  { type: "equip", name: "真传道袍",   slot: "body",      atk: 0,  def: 25, hp: 80, mp: 20, price: 0, desc: "真传弟子道袍" },

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
});

/* ============================================================
   法宝
   ============================================================ */
Object.assign(ITEMS, {
  "huo_fu":   { type: "artifact", name: "火灵符", slot: "artifact", element: "huo",  atk: 5, spellBonus: 0.10, price: 300, desc: "火系法宝，法术 +10%" },
  "jin_ling": { type: "artifact", name: "金铃",   slot: "artifact", element: "jin",  atk: 4, spellBonus: 0.10, price: 300, desc: "金系法宝，法术 +10%" },
  "mu_teng":  { type: "artifact", name: "木藤环", slot: "artifact", element: "mu",   atk: 3, spellBonus: 0.10, price: 300, desc: "木系法宝，法术 +10%" },
  "shui_zhu": { type: "artifact", name: "水灵珠", slot: "artifact", element: "shui", atk: 4, spellBonus: 0.10, price: 300, desc: "水系法宝，法术 +10%" },
  "tu_yin":   { type: "artifact", name: "土印",   slot: "artifact", element: "tu",   atk: 5, spellBonus: 0.10, price: 300, desc: "土系法宝，法术 +10%" },
  "lei_zhu":  { type: "artifact", name: "雷珠",   slot: "artifact", element: "lei",  atk: 6, spellBonus: 0.10, price: 300, desc: "雷系法宝，法术 +10%" },
  "bing_jing":{ type: "artifact", name: "冰晶",   slot: "artifact", element: "bing", atk: 5, spellBonus: 0.10, price: 300, desc: "冰系法宝，法术 +10%" },

  "shop_art_huo":  { type: "artifact", name: "凡品火符", slot: "artifact", element: "huo",  atk: 3, spellBonus: 0.05, price: 120, desc: "凡品火系法宝，法术 +5%" },
  "shop_art_jin":  { type: "artifact", name: "凡品金铃", slot: "artifact", element: "jin",  atk: 3, spellBonus: 0.05, price: 120, desc: "凡品金系法宝，法术 +5%" },
  "shop_art_mu":   { type: "artifact", name: "凡品木环", slot: "artifact", element: "mu",   atk: 2, spellBonus: 0.05, price: 120, desc: "凡品木系法宝，法术 +5%" },
  "shop_art_shui": { type: "artifact", name: "灵品水珠", slot: "artifact", element: "shui", atk: 6, spellBonus: 0.12, price: 500, desc: "灵品水系法宝，法术 +12%" },
  "shop_art_lei":  { type: "artifact", name: "灵品雷珠", slot: "artifact", element: "lei",  atk: 7, spellBonus: 0.12, price: 500, desc: "灵品雷系法宝，法术 +12%" },
  "shop_art_bing": { type: "artifact", name: "灵品冰晶", slot: "artifact", element: "bing", atk: 6, spellBonus: 0.12, price: 500, desc: "灵品冰系法宝，法术 +12%" },
});

/* ============================================================
   心法残卷（静态）
   ============================================================ */
Object.assign(ITEMS, {
  "lianqi_basic_f2": { type: "heartFragment", name: "练气基础·中卷", artId: "lianqi_basic", start: 4, end: 6, price: 150 },
  "lianqi_basic_f3": { type: "heartFragment", name: "练气基础·下卷", artId: "lianqi_basic", start: 7, end: 10, price: 400 },

  "minghuo_heart_f2": { type: "heartFragment", name: "明火心法·中卷", artId: "minghuo_heart", start: 4, end: 6, price: 150 },
  "minghuo_heart_f3": { type: "heartFragment", name: "明火心法·下卷", artId: "minghuo_heart", start: 7, end: 10, price: 400 },

  "lianqi_advanced_f2": { type: "heartFragment", name: "练气进阶·中卷", artId: "lianqi_advanced", start: 4, end: 6, price: 200 },
  "lianqi_essence_f2": { type: "heartFragment", name: "练气精要·中卷", artId: "lianqi_essence", start: 4, end: 6, price: 200 },

  "lianqi_truth_f2": { type: "heartFragment", name: "练气真解·中卷", artId: "lianqi_truth", start: 4, end: 6, price: 200 },
  "lianqi_truth_f3": { type: "heartFragment", name: "练气真解·下卷", artId: "lianqi_truth", start: 7, end: 10, price: 500 },

  "zhuji_basic_z_f2": { type: "heartFragment", name: "筑基基础·下卷", artId: "zhuji_basic_z", start: 4, end: 5, price: 250 },
  "zhuji_mid_z_f2": { type: "heartFragment", name: "筑基进阶·下卷", artId: "zhuji_mid_z", start: 4, end: 5, price: 300 },
  "zhuji_basic_x_f2": { type: "heartFragment", name: "邪基基础·下卷", artId: "zhuji_basic_x", start: 4, end: 5, price: 250 },
  "zhuji_mid_x_f2": { type: "heartFragment", name: "邪基进阶·下卷", artId: "zhuji_mid_x", start: 4, end: 5, price: 300 },

  "jindan_basic_z_f2": { type: "heartFragment", name: "金丹基础·中卷", artId: "jindan_basic_z", start: 4, end: 6, price: 400 },
  "jindan_basic_z_f3": { type: "heartFragment", name: "金丹基础·下卷", artId: "jindan_basic_z", start: 7, end: 7, price: 600 },
  "jindan_mid_z_f2": { type: "heartFragment", name: "金丹进阶·中卷", artId: "jindan_mid_z", start: 4, end: 6, price: 500 },
  "jindan_mid_z_f3": { type: "heartFragment", name: "金丹进阶·下卷", artId: "jindan_mid_z", start: 7, end: 7, price: 800 },
  "jindan_basic_x_f2": { type: "heartFragment", name: "邪丹基础·中卷", artId: "jindan_basic_x", start: 4, end: 6, price: 400 },
  "jindan_basic_x_f3": { type: "heartFragment", name: "邪丹基础·下卷", artId: "jindan_basic_x", start: 7, end: 7, price: 600 },
  "jindan_mid_x_f2": { type: "heartFragment", name: "邪丹进阶·中卷", artId: "jindan_mid_x", start: 4, end: 6, price: 500 },
  "jindan_mid_x_f3": { type: "heartFragment", name: "邪丹进阶·下卷", artId: "jindan_mid_x", start: 7, end: 7, price: 800 },

  "qingyun_sword_f2": { type: "heartFragment", name: "青云剑诀·下卷", artId: "qingyun_sword", start: 4, end: 5, price: 500 },
  "danxia_heart_f2": { type: "heartFragment", name: "丹霞真经·下卷", artId: "danxia_heart", start: 4, end: 5, price: 500 },
  "xuemou_heart_f2": { type: "heartFragment", name: "血魔真经·下卷", artId: "xuemou_heart", start: 4, end: 5, price: 500 },
  "leiyin_heart_f2": { type: "heartFragment", name: "雷音大法·下卷", artId: "leiyin_heart", start: 4, end: 5, price: 500 },
  "youming_heart_f2": { type: "heartFragment", name: "幽冥鬼典·下卷", artId: "youming_heart", start: 4, end: 5, price: 500 },
  "wanshou_heart_f2": { type: "heartFragment", name: "万兽真经·下卷", artId: "wanshou_heart", start: 4, end: 5, price: 500 },
  "jianzhong_heart_f2": { type: "heartFragment", name: "剑冢剑典·下卷", artId: "jianzhong_heart", start: 4, end: 5, price: 500 },
  "xingchen_heart_f2": { type: "heartFragment", name: "星辰大法·中卷", artId: "xingchen_heart", start: 4, end: 6, price: 600 },
  "xingchen_heart_f3": { type: "heartFragment", name: "星辰大法·下卷", artId: "xingchen_heart", start: 7, end: 7, price: 900 },
});