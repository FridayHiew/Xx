/* ============================================================
   data/dialogues.js - 对白库 / 剧情事件 / 结局文本
   ============================================================ */

/* ========== NPC 名字库 ========== */
const NPC_SURNAMES = ["李","王","张","刘","陈","杨","赵","黄","周","吴","徐","孙","胡","朱","高","林","何","郭","马","罗","邱"];

const NPC_GIVEN_M = ["青云","无极","长风","玄机","天行","子墨","孤鸿","若尘","寒江","明轩","沧澜","星河","逸尘","承影","踏雪"];
const NPC_GIVEN_F = ["清月","若雪","红袖","青鸾","紫烟","轻语","含烟","流苏","水瑶","绮罗","映雪","灵犀","黛眉","笙歌","霜华"];


/* ========== 执事语气（15 条） ========== */
const ZHISHI_QUOTES = [
  (n, c) => ({ text: `「新来的，今天把${c}做${n}次，做完再吃饭。」`, tone: "c-normal" }),
  (n, c) => ({ text: `「哼，看你细皮嫩肉的。${c}${n}次，别偷懒。」`, tone: "c-bad" }),
  (n, c) => ({ text: `「宗门不养闲人。今日${c} ×${n}，去罢。」`, tone: "c-normal" }),
  (n, c) => ({ text: `「${c}${n}次。做不完，晚饭就别吃了。」`, tone: "c-bad" }),
  (n, c) => ({ text: `「今日的任务：${c} ×${n}。我知道你行。」`, tone: "c-good" }),
  (n, c) => ({ text: `「来吧，${c}${n}次。别让我失望。」`, tone: "c-normal" }),
  (n, c) => ({ text: `「新人，规矩你懂的。${c}${n}次，做完来领饭。」`, tone: "c-normal" }),
  (n, c) => ({ text: `「唉，又是新人……${c}${n}次，去吧去吧。」`, tone: "c-normal" }),
  (n, c) => ({ text: `「今日份：${c} ×${n}。愿你手快些。」`, tone: "c-good" }),
  (n, c) => ({ text: `「杂务不重，但${c}要 ${n} 次。做完休息。」`, tone: "c-normal" }),
  (n, c) => ({ text: `「${c}${n}次，别磨蹭。太阳下山前要完。」`, tone: "c-bad" }),
  (n, c) => ({ text: `「早啊，今日${c}${n}次。做得好有奖励。」`, tone: "c-good" }),
  (n, c) => ({ text: `「例行公事：${c} ×${n}。去吧。」`, tone: "c-normal" }),
  (n, c) => ({ text: `「你今日的活：${c}${n}次。做完来食堂。」`, tone: "c-normal" }),
  (n, c) => ({ text: `「小家伙，今日 ${c} ×${n}。做得完才算入门。」`, tone: "c-gold" }),
];

/* ========== 对白库 ========== */
/* 格式：{ stage, playerRank, speaker, text } */
/* stage: "1000" / "1001" / "1002" / "1003a" / "1003b" / "1004" */
/* playerRank: 玩家最低身份 */
/* speaker: 对方身份 */
const DIALOGUES = [
  /* ===== 1000 年（杂务） ===== */
  { stage: "1000", playerRank: "杂务", speaker: "执事",   text: "「小家伙，别多问。做好你的事就行。」" },
  { stage: "1000", playerRank: "杂务", speaker: "执事",   text: "「听说北边打起来了，跟我们没关系。」" },
  { stage: "1000", playerRank: "杂务", speaker: "执事",   text: "「你灵根不明，但心性不错。」" },
  { stage: "1000", playerRank: "杂务", speaker: "执事",   text: "「每月俸禄不多，省着点花。」" },
  { stage: "1000", playerRank: "杂务", speaker: "执事",   text: "「有空多练基本功，别偷懒。」" },
  { stage: "1000", playerRank: "杂务", speaker: "师兄",   text: "「你也是新来的？我叫 XXX。」" },
  { stage: "1000", playerRank: "杂务", speaker: "师兄",   text: "「哎，今天又要砍柴，手都磨破了。」" },
  { stage: "1000", playerRank: "杂务", speaker: "师弟",   text: "「听说门内师兄能飞天遁地，真羡慕。」" },
  { stage: "1000", playerRank: "杂务", speaker: "师姐",   text: "「好好修炼，莫问外事。」" },
  { stage: "1000", playerRank: "杂务", speaker: "师妹",   text: "「正邪之争，自古就有。」" },
  { stage: "1000", playerRank: "杂务", speaker: "师妹",   text: "「一级宗门，只知灵根有无，不知深浅。」" },


  /* ===== 1001 年 ===== */
  { stage: "1001", playerRank: "杂务", speaker: "执事",   text: "「今年宗内比拼，听说邪道也派人来了。」" },
  { stage: "1001", playerRank: "杂务", speaker: "执事",   text: "「外面不太平，你少出门。」" },
  { stage: "1001", playerRank: "杂务", speaker: "执事",   text: "「长老们最近都在开会，不知道商量什么。」" },
  { stage: "1001", playerRank: "门外", speaker: "师兄",   text: "「师兄，今年 6 月比拼，你上不上？」" },
  { stage: "1001", playerRank: "门外", speaker: "师兄",   text: "「听说联盟比拼的对手都很强。」" },
  { stage: "1001", playerRank: "门外", speaker: "长老",   text: "「你修为尚可，6 月比拼可以试试。」" },
  { stage: "1001", playerRank: "门外", speaker: "长老",   text: "「宗门需要一个能扛事的弟子。」" },
  { stage: "1001", playerRank: "门外", speaker: "长老",   text: "「邪道近来越来越活跃了。」" },

  /* ===== 1002 年 ===== */
  { stage: "1002", playerRank: "门内", speaker: "师兄",   text: "「师弟，你的修为进展很快。」" },
  { stage: "1002", playerRank: "门内", speaker: "师兄",   text: "「听说 1003 年会开秘境。」" },
  { stage: "1002", playerRank: "门内", speaker: "师兄",   text: "「宗主最近很忧心。」" },
  { stage: "1002", playerRank: "门内", speaker: "长老",   text: "「你已经入门内了，要担起责任。」" },
  { stage: "1002", playerRank: "门内", speaker: "长老",   text: "「今年联盟比拼，你代表本峰去。」" },
  { stage: "1002", playerRank: "门内", speaker: "长老",   text: "「宗门未来，靠你们了。」" },
  { stage: "1002", playerRank: "真传", speaker: "长老",   text: "「本门真传，你要担起大任。」" },
  { stage: "1002", playerRank: "真传", speaker: "长老",   text: "「邪道联盟已经得到了秘境的消息。」" },

  /* ===== 1003 年 1-9 月（备战） ===== */
  { stage: "1003a", playerRank: "门内", speaker: "师兄",   text: "「秘境入口据说在北方。」" },
  { stage: "1003a", playerRank: "门内", speaker: "师兄",   text: "「门内以上才能参加。」" },
  { stage: "1003a", playerRank: "门内", speaker: "长老",   text: "「秘境 10 月开，你要去。」" },
  { stage: "1003a", playerRank: "门内", speaker: "长老",   text: "「小心邪道的人。」" },
  { stage: "1003a", playerRank: "真传", speaker: "长老",   text: "「秘境将开，本门必须抢先。」" },
  { stage: "1003a", playerRank: "真传", speaker: "长老",   text: "「你是本门希望。」" },

  /* ===== 1003 年 10-12 月（秘境 + 危机） ===== */
  { stage: "1003b", playerRank: "杂务", speaker: "执事",   text: "「秘境开了，你没资格去。」" },
  { stage: "1003b", playerRank: "杂务", speaker: "执事",   text: "「听天由命吧。」" },
  { stage: "1003b", playerRank: "门内", speaker: "师兄",   text: "「你在秘境里看到了什么？」" },
  { stage: "1003b", playerRank: "门内", speaker: "师兄",   text: "「混元珠……被谁得到了？」" },
  { stage: "1003b", playerRank: "门内", speaker: "长老",   text: "「你回来了，很好。」" },
  { stage: "1003b", playerRank: "门内", speaker: "长老",   text: "「混元珠的去向，决定一切。」" },

  /* ===== 1004 年（末日） ===== */
  { stage: "1004", playerRank: "杂务", speaker: "师兄",   text: "「4 月……真的会来吗？」" },
  { stage: "1004", playerRank: "杂务", speaker: "师兄",   text: "「你说，我们还有明天吗？」" },
  { stage: "1004", playerRank: "杂务", speaker: "师兄",   text: "「如果有来生，我还修仙。」" },
  { stage: "1004", playerRank: "门外", speaker: "师兄",   text: "「我不怕死，但我怕死得不明不白。」" },
  { stage: "1004", playerRank: "门外", speaker: "师兄",   text: "「我后悔了，我想回家。」" },
  { stage: "1004", playerRank: "门内", speaker: "长老",   text: "「能打的都上，不能打的撤。」" },
  { stage: "1004", playerRank: "门内", speaker: "长老",   text: "「宗门存亡，在此一战。」" },
  { stage: "1004", playerRank: "门内", speaker: "长老",   text: "「你们……都是好孩子。」" },
  { stage: "1004", playerRank: "真传", speaker: "长老",   text: "「明日，生死未卜。」" },
  { stage: "1004", playerRank: "真传", speaker: "长老",   text: "「若本门覆灭，你要活下去。」" },
  { stage: "1004", playerRank: "真传", speaker: "长老",   text: "「记住，你是本门弟子。」" },
  { stage: "1004", playerRank: "真传", speaker: "执事",   text: "「你就是新来的杂役？去把丹房的药渣倒了，别偷懒。」" },
  { stage: "1004", playerRank: "真传", speaker: "执事",   text: "「后山灵田的杂草三天没除了，你是来修仙还是来养老的？」" },


  /* ===== 通用 ===== */
  { stage: "any", playerRank: "杂务", speaker: "师兄",   text: "「你们聊了几句。」" },
  { stage: "any", playerRank: "杂务", speaker: "长老",   text: "「今天没什么好说的。」" },
];

/* ========== 周日事件（20 条） ========== */
const SUNDAY_EVENTS = [
  { stage: "1000", text: "「听说北方的 X 宗，能测出灵根几何……」" },
  { stage: "1000", text: "「1 级宗门，只知有无灵根，不知道深浅。」" },
  { stage: "1000", text: "「正邪两派，已经打了三百年。」" },
  { stage: "1000", text: "「联盟每 6 年大比一次，今年轮到我们这。」" },
  { stage: "1001", text: "「X 宗被邪道灭了，一个活口都没留。」" },
  { stage: "1001", text: "「听说 2 级宗门的弟子，个个都是天才。」" },
  { stage: "1001", text: "「联盟已经开始备战了。」" },
  { stage: "1002", text: "「邪道联盟集结了 5 个宗门。」" },
  { stage: "1002", text: "「正道也在集结，怕是要大战。」" },
  { stage: "1002", text: "「听说秘境里有上古传承。」" },
  { stage: "1003a", text: "「秘境开了，门内以上才能去。」" },
  { stage: "1003b", text: "「邪道的人也去了秘境。」" },
  { stage: "1003b", text: "「混元珠……那是传说中的宝物。」" },
  { stage: "1004", text: "「4 月，就是决战之日。」" },
  { stage: "1004", text: "「我已经写好了遗书。」" },
  { stage: "1004", text: "「若宗门能存，我死而无憾。」" },
];

/* ========== 战斗敌人 ========== */
const FIGHT_ENEMIES = {
  normal: [
    { name: "野狼",   hp: 60,  atk: 8,  def: 2,  exp: 30,  stone: 10 },
    { name: "黑蛇",   hp: 80,  atk: 12, def: 4,  exp: 50,  stone: 15 },
    { name: "山猪",   hp: 100, atk: 10, def: 6,  exp: 60,  stone: 20 },
    { name: "毒蜂",   hp: 50,  atk: 15, def: 1,  exp: 40,  stone: 12 },
  ],
  elite: [
    { name: "妖虎",   hp: 200, atk: 25, def: 10, exp: 150, stone: 60 },
    { name: "灵狐",   hp: 180, atk: 30, def: 8,  exp: 160, stone: 70 },
    { name: "血蝠",   hp: 220, atk: 28, def: 12, exp: 180, stone: 80 },
  ],
  boss: [
    { name: "混沌兽", hp: 500, atk: 60, def: 25, exp: 600, stone: 300 },
  ],
};

/* ========== 秘境事件 ========== */
const SECRET_EVENTS = {
  layer1: [
    { type: "fight",  enemy: "normal", text: "一只野狼从树后跃出。" },
    { type: "choice", text: "你在林间发现一株灵草。",
      options: [
        { label: "采摘", effect: { mat: { 灵草: 1 } } },
        { label: "前进", effect: {} },
      ] },
    { type: "choice", text: "你看到一个宝箱。",
      options: [
        { label: "打开", effect: { random: true } },
        { label: "前进", effect: {} },
      ] },
    { type: "fight",  enemy: "normal", text: "一只黑蛇挡住去路。" },
    { type: "choice", text: "你看到一座石碑。",
      options: [
        { label: "参悟", effect: { dao: 1 } },
        { label: "前进", effect: {} },
      ] },
  ],
  layer2: [
    { type: "fight",  enemy: "elite", text: "一只妖虎咆哮着扑来。" },
    { type: "choice", text: "一个敌对修士挡住去路。",
      options: [
        { label: "战斗", effect: { fight: "elite" } },
        { label: "交谈", effect: { talk: true } },
        { label: "逃跑", effect: {} },
      ] },
    { type: "choice", text: "你看到一处上古遗迹。",
      options: [
        { label: "探索", effect: { random: true } },
        { label: "前进", effect: {} },
      ] },
  ],
  layer3: [
    { type: "fight",  enemy: "boss", text: "混沌兽睁开眼睛。" },
  ],
};

/* ========== 结局文本 ========== */
const ENDING_TEXTS = {
  "战死": {
    title: "战死",
    text: `一道寒光闪过。
你想躲开，但身体已经不听使唤。
你低头，看到胸口插着一柄剑。
鲜血顺着剑锋滴落。
你跪倒在地。
周围的声音越来越远……
一切都结束了。
你死了。`,
  },
  "宗门英雄": {
    title: "宗门英雄",
    text: `你拼死护住同门。
一个又一个同门从你身后撤离。
你的剑已经卷刃，气血几乎耗尽。
最后一批同门安全撤离。
你转过身，面对数十名敌修。
「来吧。」
你笑了一下。
剑光闪烁，你冲入敌阵。
——
多年后，宗门的幸存者们重建了山门。
大殿里挂着一幅画像。
画像上是你年轻的面容。
「那是我们的师兄，」
他们说，
「他用命，换来了我们所有人。」
你是宗门英雄。`,
  },
  "逃脱流浪": {
    title: "逃脱流浪",
    text: `你转身，头也不回地走了。
身后是燃烧的宗门，
是死去的同门，
是你曾经的家。
你没有回头。
你走了很远很远。
你成了一个流浪修士。
你走遍天下，见识更广阔的世界。
你听说，还有 2 级、3 级、甚至 6 级宗门。
你听说，那些宗门能测出弟子的灵根。
你听说，那些宗门的弟子，能飞天遁地。
而你，只能一个人走下去。
你成了流浪修士。
江湖路远，后会有期。`,
  },
  "隐居山林": {
    title: "隐居山林",
    text: `你走了很久。
你在一片无名的山谷停下。
这里没有宗门，没有争斗，
没有正邪，没有大劫。
你盖了一间小屋。
你种了一片药园。
你养了一只灵猫。
你每天打坐、炼丹、写字。
你偶尔想起宗门，
想起那些死去的同门，
想起那个还没有结局的故事。
但你不再去想了。
你活了很久。
你活了很久。
你隐居山林，安度余生。`,
  },
  "放弃回老家": {
    title: "放弃回老家",
    text: `你回到了自己出生的地方。
那个小村子，还是老样子。
挑水的、砍柴的、种菜的，
一切如故。
你找到了自己的老屋。
老屋已经破败，院子里长了杂草。
你站在那里，很久很久。
你想起当年那个上山砍柴的自己。
那时你不知道什么是灵根，
不知道什么是修仙，
不知道什么是宗门。
你笑了。
你决定留下来。
你重新拿起了锄头，
种地、养鸡、娶妻、生子。
你活了七八十年。
你死的时候，很安详。
你的儿子问你：
「爹，你年轻的时候做什么的？」
你说：
「我啊……以前修仙的。」
儿子以为你在开玩笑。
你回到了凡间。
仙途，与你再无关系。`,
  },
  "被俘": {
    title: "被俘",
    text: `你拼尽全力，但敌人太多。
你倒在地上。
几个敌修上前，把你绑了起来。
「这个不错，带回去。」
你被押走。
你不知道等待你的是什么。
——
多年后，有人在敌对联盟的矿场里，
看到一个疯癫的老人。
他嘴里念叨着：
「我是 XX 门的……我是 XX 门的……」
你被俘了。
你的故事，到此为止。`,
  },
};