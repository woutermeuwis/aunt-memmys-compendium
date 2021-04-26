import { getClassHitDice } from "./classItemExtensions.js";
import { types } from "./constants.js";

export function getClassItemsFromActor(actor) {
  return actor.items.filter((i) => i.type == types.class);
}

export function getItemByNameAndType(actor, name, type) {
  return actor.items.find((i) => i.name === name && (!type || i.type === type));
}

export function getEffectByName(actor, name) {
  return actor.effects.entries.find(e=> e.data.label === name);
}

export function getEffectById(actor, id) {
  return actor.effects.entries.find(e=>e.data._id === id);
}

export function getAllHitDice(actor) {
  let dice = getClassItemsFromActor(actor).map(getClassHitDice);

  let total = dice.reduce((acc, val) => acc + val.max, 0);
  let available = dice.reduce((acc, val) => acc + val.available, 0);

  return {
    dice: dice,
    total: total,
    available: available,
    expended: total - available,
  };
}

export function getAllSpellSlots(actor) {  
  let slots = Object.entries(actor.data.data.spells).map(([id, slot]) => mapSpellSlot(id, slot));

  let total = slots.reduce((acc, val) => acc + val.max, 0);
  let available = slots.reduce((acc, val) => acc + val.available, 0);
  let used = slots.reduce((acc, val) => acc + val.used, 0);

  return {
    slots: slots,
    total: total,
    available: available,
    used: used,
  };
}

export function GetSpellSlotDetails(actor, id){
  return actor.data.data.spells[id];
}

export function ExpendSpellSlot(actor, id, amountToExpend){
  let slotData = GetSpellSlotDetails(actor,id);
  let available = Math.max(slotData.value - amountToExpend, 0);
  
  var updateData = {};
  updateData['data.spells.${id}.value'] = available;
  actor.update(updateData);
}

export function RegainSpellSlot(actor, id, amountToRegain){
  let slotData = GetSpellSlotDetails(actor,id);
  let available = Math.min(slotData.value + amountToRegain, slotData.max);
  
  var updateData = {};
  updateData[`data.spells.${id}.value`] = available;
  actor.update(updateData);
}

export function setTemporaryHitPoints(actor, tmpHitPoints) {
  actor.update({
    "data.attributes.hp.temp": tmpHitPoints,
  });
}

export function addTemporaryHitPoints(actor, tmpHitPoints) {
  tmpHitPoints += actor.data.data.attributes.hp.temp;
  setTemporaryHitPoints(actor, tmpHitPoints);
}

export function setHitPoints(actor, hitPoints) {
  actor.update({
    "data.attributes.hp.value": hitPoints
  });
}

export function addHitPoints(actor, hitPoints) {
  hitPoints += getHitPoints(actor);
  var max = getMaxHitPoints(actor);
  var newValue = Math.min(hitPoints, max);
  setHitPoints(actor, newValue);
}

export function getTemporaryHitPoints(actor) {
  return actor.data.data.attributes.hp.temp;
}

export function getHitPoints(actor) {
  return actor.data.data.attributes.hp.value;
}

export function getMaxHitPoints(actor){
  return actor.data.data.attributes.hp.max;
}

export function getMissingHitPoint(actor){
  return actor.data.data.attributes.hp.max - actor.data.data.attributes.hp.value;
}

export function getHitPointDetails(actor){
  return actor.data.data.attributes.hp;
}

function mapSpellSlot(spellSlotId, spellSlot) {
  let level;
  let displayName;

  switch (spellSlotId) {
    case "pact":
      displayName = "pact";
      level = spellSlot.level;
      break;
    case "spell1":
      displayName = "1st level";
      level = 1;
      break;
    case "spell2":
      displayName = '"2st level';
      level = 2;
      break;
    case "spell3":
      displayName = "3st level";
      level = 3;
      break;
    case "spell4":
      displayName = "4st level";
      level = 4;
      break;
    case "spell5":
      displayName = "5st level";
      level = 5;
      break;
    case "spell6":
      displayName = "6st level";
      level = 6;
      break;
    case "spell7":
      displayName = "7st level";
      level = 7;
      break;
    case "spell8":
      displayName = "8st level";
      level = 8;
      break;
    case "spell9":
      displayName = "9st level";
      level = 9;
      break;
  }

  return {
    id: spellSlotId,
    displayName: displayName,
    level: level,
    max: spellSlot.max,
    used: spellSlot.max - spellSlot.value,
    available: spellSlot.value,
    source: spellSlot
  };
}
