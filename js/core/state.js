/* ============================================================
   core/state.js - 全局状态
   ============================================================ */

let S = null;

let currentTab = "day";
let currentBagTab = "丹药";
let currentSectTab = "简介";
let currentProfileTab = "角色信息";
let currentCGDTab = "基本功";   /* 传功殿内部 tab */

let currentShopDay = 0;
let currentShopStock = [];
let currentCaveTab = "facility";

let pendingFight = null;

let morningPrompted = false;
let nightPrompted = false;
let hobbyPrompted = false;

let logBuffer = [];
let logUnread = 0;

let debugShowRoot = false;