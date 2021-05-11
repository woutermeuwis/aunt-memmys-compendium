import {
  getClassItemsFromActor,
  getItemByNameAndType,
  addHitPoints,
  getAllSpellSlots,
  RegainSpellSlot,
  getHitPointDetails,
  getTemporaryHitPoints,
  setTemporaryHitPoints,
} from "./actorExtensions.js";
import { getClassHitDice } from "./classItemExtensions.js";
import { printChatMessage } from "./chatExtensions.js"
import { names, types } from "./constants.js"
import { warn } from "./notificationExtensions.js";

export function getAllHitDiceForSiphonerFeature(actor) {
  let dice = getClassItemsFromActor(actor).map(getClassHitDice);
  let bmDice = getBeyondMortalityDice(actor);

  dice.push(bmDice);

  let total = dice.reduce((acc, val) => acc + val.max, 0);
  let available = dice.reduce((acc, val) => acc + val.available, 0);

  return {
    dice: dice,
    total: total,
    available: available,
    expended: total - available,
  };
}

export async function siphonerHealAsync(actor, hitPoints) {
  // check arcane conversion, return if a spellslot was regained
  if (await HandleArcaneConversionAsync(actor, hitPoints))
    return;

  let hpDetails = getHitPointDetails(actor);
  let missing = hpDetails.max - hpDetails.value;
  let toHeal = Math.min(hitPoints, missing);
  let overheal = hitPoints - toHeal;

  if (toHeal > 0)
    addHitPoints(actor, toHeal);

  if (overheal > 0)
    HandleOverheal(actor, overheal);
}

async function HandleArcaneConversionAsync(actor, hitPoints) {
  // Return false if actor has no access to the Arcana Conversion feature
  if (!hasArcanaConversion(actor))
    return false;

  // We can regain a spell slot of a level equal to one fifth of the hit points regained, rounded down
  // If we heal less than 5, conversion is pointless...
  if (hitPoints < 5)
    return false;

  let maxLevel = Math.floor(hitPoints / 5);
  let slots = getAllSpellSlots(actor).slots.filter(
    (s) => s.level <= maxLevel && s.used > 0
  );

  // If we have no spent spell slots, regaining any is pointless!
  if (slots.length == 0)
    return false;

  // CONTENT HTML
  let slotsHtml = getSpellSlotSelectionHtml(
    "Select spell slot to regain:",
    slots,
    "regain"
  );
  let content = `
     <p>Pick wether you would like to heal, or regain a spell slot!</p>
     <form>
      ${slotsHtml}
     <form>`;



  let tcs = new Promise((resolve, reject) => {
    // HEAL BUTTON
    let healButton = {
      icon: "",
      label: "Heal",
      callback: () => {
        resolve(false);
      },
    };

    // REGAIN SPELLS SLOT BUTTON
    let regainButton = {
      icon: "",
      label: "Spell Slot",
      callback: (html) => {
        let id = html.find("[id=slot]")[0].value;
        let slot = slots.find(s => s.id === id)
        RegainSpellSlot(actor, id, 1);
        printChatMessage(`${actor.name} Redirects the drained energy to forego their healing, and regain a spell slot of ${slot.displayName}.`);
        resolve(true);
      },
    };

    new Dialog({
      title: "Arcane Conversion",
      content: content,
      buttons: {
        heal: healButton,
        regain: regainButton
      },
      default: "heal"
    }).render(true);
  });

  return await tcs;
}

function HandleOverheal(actor, overheal) {

  if (!hasOverheal(actor))
    return;

  let tempHitPoints = Math.floor(overheal / 2);

  if (overheal < getTemporaryHitPoints(actor)) {
    warn("You already have more temporary hit points than this ability would gain you!");
    return;
  }

  setTemporaryHitPoints(actor, tempHitPoints);
  printChatMessage(`${actor.name} overhealed ${tempHitPoints} temporary hit points.`);
}

function getBeyondMortalityDice(actor) {
  let siphoner = getItemByNameAndType(actor, "Siphoner", "class");
  let bm = getItemByNameAndType(actor, "Beyond Mortality", "feat");
  let uses = bm.data.data.uses;

  return {
    displayName: `${siphoner.data.data.hitDice} [${bm.data.name}]`,
    size: siphoner.data.data.hitDice,
    max: uses.max,
    available: uses.value,
    used: uses.max - uses.value,
    source: bm,
  };
}

function hasArcanaConversion(actor) {
  return getItemByNameAndType(actor, names.features.arcanaConversion, types.feature)
}

function hasOverheal(actor) {
  return getItemByNameAndType(actor, names.features.overHeal, types.feature)
}

//#region html helpers

function getSpellSlotSelectionHtml(text, slots, type) {
  let options = "";
  for (let slot of slots) {
    let count;
    switch (type) {
      case "expend":
        count = slot.available;
        break;
      case "regain":
        count = slot.used;
        break;
    }
    options += `<option value="${slot.id}">(${count}) ${slot.displayName}</option>`;
  }

  let html = `
        <div class="form-group">
         <label>${text}</label>
         <select id="slot">${options}</select>
        </div>
    `;

  return html;
}

//#endregion
