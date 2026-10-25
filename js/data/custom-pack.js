/* ============================================================
   custom-pack.js - 自定义数据包
   ------------------------------------------------------------
   由 Admin 面板导出生成，覆盖原始数据。
   放回源码目录即可永久生效。
   
   启动时由 systems/admin.js 应用：
   - 对象类（ITEMS / FIGHT_ENEMIES）：浅合并（key 级别）
   - 数组类（RECIPES / HEART_ARTS 等）：整体替换
   ============================================================ */

window.CUSTOM_PACK = null;

/* 
   示例格式（Admin 导出后会填到这里）：
   
   window.CUSTOM_PACK = {
     version: "1.0",
     updatedAt: 1699xxxx,
     data: {
       ITEMS: {
         "回血丹_1": { ... 覆盖 ... },
         "新丹药_1": { ... 新增 ... },
       },
       RECIPES: [ ... 完整数组 ... ],
       FIGHT_ENEMIES: { ... },
       HEART_ARTS: [ ... ],
       FORGE_RECIPES: [ ... ],
       FORGE_AFFIXES: [ ... ],
       FORGE_MATERIALS_BASE: [ ... ],
       PET_TALENTS: [ ... ],
       PET_BLOODLINES: [ ... ],
       SECTS: [ ... ],
       PEAKS: [ ... ],
     }
   };
*/