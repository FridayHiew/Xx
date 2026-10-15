/* ============================================================
   systems/spells.js - 法术系统
   ============================================================ */

function getSpell(spellId) {
  return SPELLS.find(s => s.id === spellId);
}

function hasSpell(spellId) {
  return S.spells && S.spells.learned.includes(spellId);
}

/* 法宝对法术的威力加成 */
function getSpellBonus() {
  let bonus = 0;
  ["artifact1", "artifact2", "artifact3"].forEach(slot => {
    const id = S.equipped[slot];
    if (!id) return;
    const a = ITEMS[id];
    if (!a || a.type !== "artifact") return;
    bonus += a.spellBonus || 0;
  });
  return bonus;
}

/* 检查法术是否可用 */
function canUseSpell(spellId) {
  const spell = getSpell(spellId);
  if (!spell) return { ok: false, reason: "法术不存在" };
  if (!hasSpell(spellId)) return { ok: false, reason: "尚未学会" };

  if (spell.skillReq) {
    for (const k in spell.skillReq) {
      const lvl = (S.skills[k] && S.skills[k].lvl) || 0;
      if (lvl < spell.skillReq[k]) {
        return { ok: false, reason: `${k} 需 Lv.${spell.skillReq[k]}` };
      }
    }
  }

  if (spell.elementReq) {
    for (const k in spell.elementReq) {
      const lvl = (S.elementLvl && S.elementLvl[k]) || 0;
      if (lvl < spell.elementReq[k]) {
        const elName = (ROOT_TYPES.find(r => r.id === k) || {}).name || k;
        return { ok: false, reason: `${elName}属性需 ${spell.elementReq[k]} 级` };
      }
    }
  }

  if (spell.artReq && spell.artReq.length > 0) {
    for (const artId of spell.artReq) {
      if (!S.heartArts.learned.includes(artId)) {
        const art = HEART_ARTS.find(a => a.id === artId);
        return { ok: false, reason: `需学过《${art ? art.name : artId}》` };
      }
    }
  }

  if (spell.toolReq && spell.toolReq.length > 0) {
    const equippedArtifacts = ["artifact1", "artifact2", "artifact3"]
      .map(s => S.equipped[s])
      .filter(Boolean);
    for (const tid of spell.toolReq) {
      if (!equippedArtifacts.includes(tid)) {
        const a = ITEMS[tid];
        return { ok: false, reason: `需装备 ${a ? a.name : tid}` };
      }
    }
  }

  if (spell.cost && spell.cost.mp) {
    if (S.mp < spell.cost.mp) return { ok: false, reason: "灵力不足" };
  }

  return { ok: true };
}

/* 检查能否学（不检查灵力） */
function canLearnSpell(spellId) {
  const spell = getSpell(spellId);
  if (!spell) return { ok: false, reason: "法术不存在" };
  if (hasSpell(spellId)) return { ok: false, reason: "已学" };

  if (spell.skillReq) {
    for (const k in spell.skillReq) {
      const lvl = (S.skills[k] && S.skills[k].lvl) || 0;
      if (lvl < spell.skillReq[k]) {
        return { ok: false, reason: `${k} 需 Lv.${spell.skillReq[k]}` };
      }
    }
  }

  if (spell.elementReq) {
    for (const k in spell.elementReq) {
      const lvl = (S.elementLvl && S.elementLvl[k]) || 0;
      if (lvl < spell.elementReq[k]) {
        const elName = (ROOT_TYPES.find(r => r.id === k) || {}).name || k;
        return { ok: false, reason: `${elName}属性需 ${spell.elementReq[k]} 级` };
      }
    }
  }

  if (spell.artReq && spell.artReq.length > 0) {
    for (const artId of spell.artReq) {
      if (!S.heartArts.learned.includes(artId)) {
        const art = HEART_ARTS.find(a => a.id === artId);
        return { ok: false, reason: `需学过《${art ? art.name : artId}》` };
      }
    }
  }

  if (spell.toolReq && spell.toolReq.length > 0) {
    const equippedArtifacts = ["artifact1", "artifact2", "artifact3"]
      .map(s => S.equipped[s])
      .filter(Boolean);
    for (const tid of spell.toolReq) {
      if (!equippedArtifacts.includes(tid)) {
        const a = ITEMS[tid];
        return { ok: false, reason: `需装备 ${a ? a.name : tid}` };
      }
    }
  }

  return { ok: true };
}

function learnSpell(spellId) {
  const check = canLearnSpell(spellId);
  if (!check.ok) { log(`无法学习法术：${check.reason}`, "c-bad"); return false; }
  S.spells.learned.push(spellId);
  const spell = getSpell(spellId);
  log(`【学会法术】${spell.name}！`, "c-gold");
  save();
  return true;
}

function useSpellBook(bookId) {
  const book = ITEMS[bookId];
  if (!book || book.type !== "spellbook") { log("秘籍不存在。", "c-bad"); return; }
  if (hasSpell(book.spellId)) {
    log(`已学会【${getSpell(book.spellId).name}】，无需再学。`, "c-bad");
    return;
  }
  const check = canLearnSpell(book.spellId);
  if (!check.ok) { log(`无法学习：${check.reason}`, "c-bad"); return; }

  learnSpell(book.spellId);
  removeItem(bookId, 1);
  save(); renderProfile(); render();
  showActionModal("参悟秘籍", [`学会法术：${getSpell(book.spellId).name}`]);
}

function listLearnedSpells() {
  if (!S.spells) return [];
  return S.spells.learned.map(id => getSpell(id)).filter(Boolean);
}

function listLearnableSpells() {
  return SPELLS.filter(s => !hasSpell(s.id) && canLearnSpell(s.id).ok);
}

function useSkillBook(bookId) {
  const book = ITEMS[bookId];
  if (!book || book.type !== "skillbook") return;
  if (!S.combatSkills) S.combatSkills = { learned: [] };
  if (S.combatSkills.learned.includes(book.skillId)) {
    log("已学该技能。", "c-bad"); return;
  }
  S.combatSkills.learned.push(book.skillId);
  removeItem(bookId, 1);
  log(`【学会技能】${book.name}！`, "c-gold");
  save(); renderProfile(); render();
}

function useSummonBook(bookId) {
  const book = ITEMS[bookId];
  if (!book || book.type !== "summonbook") return;
  if (!S.combatSkills) S.combatSkills = { learned: [] };
  if (S.combatSkills.learned.includes(book.summonId)) {
    log("已学该召唤。", "c-bad"); return;
  }
  S.combatSkills.learned.push(book.summonId);
  removeItem(bookId, 1);
  log(`【学会召唤】${book.name}！`, "c-gold");
  save(); renderProfile(); render();
}