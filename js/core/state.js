/* ============================================================
   core/state.js - 全局状态
   ============================================================ */

/* 玩家拥有的残卷（不需要在这里定义 S.fragments，S 是玩家对象） */

let S = null;

let currentTab = "day";
let currentBagTab = "丹药";
let currentSectTab = "简介";
let currentProfileTab = "角色信息";

let currentShopDay = 0;
let currentShopStock = [];

let pendingFight = null;

let morningPrompted = false;
let nightPrompted = false;
let hobbyPrompted = false;

let logBuffer = [];
let logUnread = 0;

let debugShowRoot = false;