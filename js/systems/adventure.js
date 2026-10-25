/* ============================================================
   systems/adventure.js - 冒险地核心逻辑
   ------------------------------------------------------------
   流程：
   1. 玩家选冒险地 → enterAdventure(zoneId)
   2. 生成第 1 层路径树 → 玩家在层内推进
   3. 到达传送门 → 进入下一层
   4. 到达出口 → 离开冒险地
   
   玩家状态（临时）：
   - S.flags.adventure = {
       zoneId: "black_forest",
       layer: 1,
       path: [],           // 走过的节点
       currentNodeId: null,
       choices: [],        // 当前可选项
     }
   ============================================================ */

/* ============================================================
   进入 / 离开
   ============================================================ */

function enterAdventure(zoneId) {
  const zone = getAdventureZone(zoneId);
  if (!zone) return;

  /* ★ 先清空旧的冒险状态 */
  S.flags.adventure = null;
  S.flags.adventureLog = null;
  S.flags.adventureCombat = null;

  /* 境界检查 */
  const info = getPlayerRealmInfo();
  if (info.realm < zone.realmMin || info.realm > zone.realmMax) {
    log(`【${zone.name}】境界不足或过高，无法进入。`, "c-bad");
    showModal("无法进入", `
      <p>【${zone.name}】需要 ${REALMS[zone.realmMin].name} ~ ${REALMS[zone.realmMax].name} 的境界。</p>
      <p class="small">你当前：${info.realm === 0 ? "凡人" : REALMS[info.realm].name}</p>
    `, [{ label: "关闭", fn: closeModal }]);
    return;
  }

  /* 行动检查 */
  if (S.actionsUsed >= ACTIONS_PER_SLOT) {
    showModal("行动不足", `
      <p>本时段行动已用完（${S.actionsUsed} / ${ACTIONS_PER_SLOT}）。</p>
      <p class="small">睡一觉或等下一时段再试。</p>
    `, [{ label: "关闭", fn: closeModal }]);
    return;
  }

  /* 扣行动 */
  S.actionsUsed += zone.actionCost;

  /* 初始化状态 */
  S.flags.adventure = {
    zoneId: zoneId,
    layer: 1,
    path: [],
    currentNodeId: null,
    choices: [],
  };

  /* 生成第 1 层 */
  const layerConf = zone.layers[0];
  generateAdventureLayer(zone, layerConf);

  log(`【${zone.name}】你踏入了${layerConf.title}。`, "c-gold");
  save();
  openAdventureScreen();
}

function leaveAdventure() {
  if (!S.flags.adventure) return;
  const zone = getAdventureZone(S.flags.adventure.zoneId);
  const zoneName = zone ? zone.name : "冒险地";

  showModal("离开冒险地", `
    <p>你离开了【${zoneName}】。</p>
  `, [
    { label: "确定", primary: true, fn: () => {
      S.flags.adventure = null;
      closeModal();
      closeAdventureScreen();
      save();
      render();
    }},
  ]);
}

/* ============================================================
   生成一层路径树
   ------------------------------------------------------------
   数据结构（临时存到 S.flags.adventure.tree）：
   tree = {
     layers: [ [节点], [节点], ... ],
     startId: "n_0_0",
   }
   每个节点：{ id, type, name, icon, depth, index, children: [idx], data? }
   ============================================================ */
function generateAdventureLayer(zone, layerConf) {
  const depth = layerConf.depth;             /* 中间层数（不含起始和终点）*/
  const finalType = layerConf.finalType;
  const finalCount = layerConf.finalCount;
  const escapeRate = layerConf.escapeRate !== undefined ? layerConf.escapeRate : 0.4;
  const enemies = layerConf.enemies || [];
  const storageCount = layerConf.storageCount || [1, 2];
  const storagePool = layerConf.storage || [];
  const eventPool = layerConf.events || [];

  /* 生成 layers */
  const layers = [];

  /* 第 0 层：入口 */
  layers.push([{
    id: "n_0_0",
    type: "start",
    name: "冒险入口",
    icon: "🚪",
    depth: 0,
    index: 0,
    children: [],
  }]);

  /* 1 ~ depth 层：中间节点 */
  for (let d = 1; d <= depth; d++) {
    const prevLayer = layers[d - 1];
    const thisLayer = [];

    /* 决定本层节点数 */
    const prevCount = prevLayer.length;
    let thisCount = Math.max(2, Math.min(4, prevCount + rndInt(-1, 1)));

    for (let i = 0; i < thisCount; i++) {
      /* 随机决定节点类型 */
      const t = randomNodeType(d, depth);
      const node = {
        id: `n_${d}_${i}`,
        type: t,
        name: "",
        icon: "",
        depth: d,
        index: i,
        children: [],
      };

      /* 填内容 */
      fillNodeContent(node, t, { enemies, storagePool, eventPool });

      thisLayer.push(node);
    }

    /* 连接上一层 → 本层（每个父节点连 1~2 个子） */
    prevLayer.forEach((p, pi) => {
      const subCount = rndInt(1, Math.min(2, thisLayer.length));
      const start = pi % thisLayer.length;
      for (let k = 0; k < subCount; k++) {
        const ci = (start + k) % thisLayer.length;
        if (!p.children.includes(ci)) p.children.push(ci);
      }
    });

    /* 保证每个本层节点都有父 */
    thisLayer.forEach((c, ci) => {
      const hasParent = prevLayer.some(p => p.children.includes(ci));
      if (!hasParent) {
        const p = prevLayer[rndInt(0, prevLayer.length - 1)];
        p.children.push(ci);
      }
    });

    layers.push(thisLayer);
  }

  /* 最后一层：传送门 / 出口 */
  const lastLayer = [];
  for (let i = 0; i < finalCount; i++) {
    const isFinal = (finalType === "exit");
    lastLayer.push({
      id: `end_${i}`,
      type: isFinal ? "exit" : "portal",
      name: isFinal ? "出口" : "通往下一层",
      icon: isFinal ? "🚶" : "🌀",
      depth: depth + 1,
      index: i,
      children: [],
    });
  }

  const prevLast = layers[depth];
  prevLast.forEach((p, pi) => {
    const ci = pi % lastLayer.length;
    p.children.push(ci);
  });
  lastLayer.forEach((c, ci) => {
    const hasParent = prevLast.some(p => p.children.includes(ci));
    if (!hasParent) {
      prevLast[rndInt(0, prevLast.length - 1)].children.push(ci);
    }
  });

  layers.push(lastLayer);

  /* 储存袋分配：随机选一些节点改成 storage（不改入口和终点） */
  const storageNum = rndInt(storageCount[0], storageCount[1]);
  const candidateNodes = [];
  for (let d = 1; d <= depth; d++) {
    layers[d].forEach(n => {
      if (n.type !== "storage") candidateNodes.push(n);
    });
  }
  for (let i = 0; i < storageNum && candidateNodes.length > 0; i++) {
    const idx = rndInt(0, candidateNodes.length - 1);
    const n = candidateNodes.splice(idx, 1)[0];
    n.type = "storage";
    n.icon = "🎒";
    n.name = "储存袋";
    n.data = { storage: pick(storagePool) };
  }

  /* 存到状态 */
  S.flags.adventure.tree = {
    layers: layers,
    startId: "n_0_0",
    escapeRate: escapeRate,
    layerTitle: layerConf.title,
    layerConf: layerConf,
  };

  /* 进入起点 */
  const startNode = layers[0][0];
  S.flags.adventure.path = [startNode];
  S.flags.adventure.currentNodeId = startNode.id;
  S.flags.adventure.choices = startNode.children.map(i => layers[1][i]);
}

/* 随机节点类型 */
function randomNodeType(depth, totalDepth) {
  /* 越深层，越倾向战斗/储存袋 */
  const ratio = depth / totalDepth;
  const roll = Math.random();

  if (roll < 0.35 + ratio * 0.15) return "fight";
  if (roll < 0.70 + ratio * 0.1) return "event";
  if (roll < 0.85) return "empty";
  return "storage";      /* 概率低，实际由 storage 分配逻辑覆盖 */
}

/* 填节点内容 */
function fillNodeContent(node, type, pools) {
  switch (type) {
    case "fight": {
      node.icon = "⚔️";
      node.name = "妖兽出没";
      /* 从敌人池随机选一个 */
      const enemyId = pools.enemies.length > 0
        ? pick(pools.enemies)
        : "e_wolf";
      node.data = { enemyId };
      break;
    }
    case "event": {
      node.icon = "🌿";
      node.name = "荒野";
      if (pools.eventPool.length > 0) {
        node.data = { event: pick(pools.eventPool) };
      } else {
        node.data = { event: { text: "你走了很久。", effect: {} } };
      }
      break;
    }
    case "empty": {
      node.icon = "🪨";
      node.name = "空地";
      node.data = {};
      break;
    }
    case "storage": {
      node.icon = "🎒";
      node.name = "储存袋";
      node.data = {};
      break;
    }
    default:
      node.icon = "🪨";
      node.name = "未知";
      node.data = {};
  }
}

/* ============================================================
   玩家选择
   ============================================================ */
function adventureChoose(choiceIdx) {
  const adv = S.flags.adventure;
  if (!adv) return;

  const choice = adv.choices[choiceIdx];
  if (!choice) return;

  /* 前进 */
  adv.path.push(choice);
  adv.currentNodeId = choice.id;

  /* 触发事件 */
  adventureTriggerNode(choice);

  /* 刷新 choices */
  const tree = adv.tree;
  const nextLayer = tree.layers[choice.depth + 1];
  if (nextLayer) {
    adv.choices = choice.children.map(i => nextLayer[i]).filter(Boolean);
  } else {
    adv.choices = [];
  }

  save();
  renderAdventureScreen();
}

/* ============================================================
   触发节点事件
   ============================================================ */
function adventureTriggerNode(node) {
  switch (node.type) {
    case "fight": {
      const enemyId = node.data.enemyId;
      const escapeRate = S.flags.adventure.tree.escapeRate || 0.4;
      const canFlee = chance(escapeRate);
      showModal("遭遇妖兽", `
        <p>【${node.name}】窜出一只妖兽！</p>
        ${canFlee ? `<p class="small" style="color:var(--text-dim);">你似乎可以绕开它。</p>` : `<p class="small" style="color:var(--c-bad);">它挡住了去路！</p>`}
      `, [
        { label: "迎战", primary: true, fn: () => {
          closeModal();
          startAdventureBattle(enemyId);
        }},
        canFlee ? { label: "绕开", fn: () => {
          closeModal();
          adventureLog(`你绕开了妖兽，继续前行。`, "dim");
          renderAdventureScreen();
        }} : null,
      ].filter(Boolean));
      break;
    }

    case "event": {
      const ev = node.data.event || { text: "你走了一会儿。", effect: {} };
      const effect = ev.effect || {};
      const detail = [];

      /* 处理奖励 */
      if (effect.mat) {
        for (const baseId in effect.mat) {
          const count = effect.mat[baseId];
          const gradeRange = effect.gradeRange || [1, 1];
          const grade = rndInt(gradeRange[0], gradeRange[1]);
          const itemId = baseId + "_" + grade;
          addItem(itemId, count);
          detail.push(`获得：${baseId}（${grade}品）×${count}`);
        }
      }
      if (effect.stone) {
        S.stone += effect.stone;
        detail.push(`灵石 +${effect.stone}`);
      }
      if (effect.exp) {
        S.exp += effect.exp;
        detail.push(`修为 +${effect.exp}`);
      }
      if (effect.item) {
        for (const id in effect.item) {
          addItem(id, effect.item[id]);
          detail.push(`获得：${ITEMS[id] ? ITEMS[id].name : id} ×${effect.item[id]}`);
        }
      }

      adventureLog(ev.text, "blue");
      if (detail.length > 0) {
        adventureLog(detail.join("，"), "good");
      }
      renderAdventureScreen();
      break;
    }

    case "empty":
      adventureLog(`【${node.name}】空无一物。`, "dim");
      renderAdventureScreen();
      break;

    case "storage": {
      const storage = node.data.storage || { type: "stone", amount: [10, 30] };
      const detail = [];
      grantStorageReward(storage, detail);
      adventureLog(`你发现一个储存袋，${detail.join("、")}。`, "gold");
      renderAdventureScreen();
      break;
    }

    case "portal":
      showModal("传送门", `
        <p>你走到了一道传送门前。</p>
        <p class="small" style="color:var(--text-dim);">进入下一层？</p>
      `, [
        { label: "继续探索", fn: closeModal },
        { label: "进入下一层", primary: true, fn: () => {
          closeModal();
          adventureGoToNextLayer();
        }},
      ]);
      break;

    case "exit":
      showModal("到达出口", `
        <p>你看到了出口。</p>
        <p class="small" style="color:var(--text-dim);">是否离开冒险地？</p>
      `, [
        { label: "继续探索", fn: closeModal },
        { label: "离开冒险地", primary: true, fn: () => {
          closeModal();
          leaveAdventure();
        }},
      ]);
      break;
  }
}

/* 发放储存袋奖励 */
function grantStorageReward(storage, detail) {
  if (storage.type === "stone") {
    const amount = rndInt(storage.amount[0], storage.amount[1]);
    S.stone += amount;
    detail.push(`灵石 +${amount}`);
  } else if (storage.type === "mat") {
    const grade = rndInt(storage.gradeRange[0], storage.gradeRange[1]);
    const itemId = storage.baseId + "_" + grade;
    addItem(itemId, storage.count);
    detail.push(`${storage.baseId}（${grade}阶）×${storage.count}`);
  } else if (storage.type === "item") {
    /* ★ 如果是模板 id（如 "回春丹_1阶"），先 getOrCreatePillItem 注册 */
    let finalId = storage.id;
    if (!ITEMS[storage.id] && storage.id.indexOf("_阶") > 0) {
      const item = getOrCreatePillItem(storage.id, 1);
      if (item) finalId = item.id;
    }
    addItem(finalId, storage.count);
    const name = ITEMS[finalId] ? ITEMS[finalId].name : finalId;
    detail.push(`${name} ×${storage.count}`);
  }
}

/* ============================================================
   进入下一层
   ============================================================ */
function adventureGoToNextLayer() {
  const adv = S.flags.adventure;
  if (!adv) return;
  const zone = getAdventureZone(adv.zoneId);
  if (!zone) return;

  const nextLayer = adv.layer + 1;
  const layerConf = zone.layers.find(l => l.layer === nextLayer);
  if (!layerConf) {
    log(`【${zone.name}】没有更多层了。`, "c-bad");
    return;
  }

  adv.layer = nextLayer;
  generateAdventureLayer(zone, layerConf);
  adventureLog(`你进入了【${layerConf.title}】。`, "gold");
  save();
  renderAdventureScreen();
}

/* ============================================================
   战斗：进入战斗后返回
   ============================================================ */
function startAdventureBattle(enemyId) {
  /* 记录：战斗结束后要回到冒险地 */
  S.flags.adventureCombat = {
    enemyId: enemyId,
    returnTo: "adventure",
  };
  startBattle([{ enemyId: enemyId }]);
}

/* ============================================================
   日志（临时用 S.flags.adventureLog）
   ============================================================ */
function adventureLog(text, cls) {
  if (!S.flags.adventureLog) S.flags.adventureLog = [];
  S.flags.adventureLog.push({ text, cls });
  if (S.flags.adventureLog.length > 50) S.flags.adventureLog.shift();
}

/* ============================================================
   UI 交互：打开 / 关闭冒险界面
   （具体渲染在 ui/adventure.js）
   ============================================================ */
function openAdventureScreen() {
  if (typeof renderAdventureScreen === "function") {
    renderAdventureScreen();
  }
  const el = document.getElementById("adventureScreen");
  if (el) {
    el.style.display = "flex";
    el.style.zIndex = "2400";
  }
}

function closeAdventureScreen() {
  const el = document.getElementById("adventureScreen");
  if (el) el.style.display = "none";
}