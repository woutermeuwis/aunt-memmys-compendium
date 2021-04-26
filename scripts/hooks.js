import * as classItemExtensions from "./classItemExtensions.js";
import * as actorExtensions from "./actorExtensions.js";
import * as effectExtensions from "./effectExtensions.js";
import * as chatExtensions from "./chatExtensions.js";
import * as notificationExensions from "./notificationExtensions.js";
import * as siphoner from "./siphoner.js";
import * as constants from "./constants.js";

Hooks.once("setup", () => {
  console.log("Wiring up Aunt Memmy's module!");
  game.modules.get("memmy").api = {
    // Constants
    names: constants.names,
    types: constants.types,

    // Class Item Extensions
    getClassHitDice: classItemExtensions.getClassHitDice,

    // Actor Extensions
    getClassItemsFromActor: actorExtensions.getClassItemsFromActor,
    getItemByNameAndType: actorExtensions.getItemByNameAndType,
    getAllHitDice: actorExtensions.getAllHitDice,
    getAllSpellSlots: actorExtensions.getAllSpellSlots,
    GetSpellSlotDetails: actorExtensions.GetSpellSlotDetails,
    ExpendSpellSlot: actorExtensions.ExpendSpellSlot,
    RegainSpellSlot: actorExtensions.RegainSpellSlot,
    getEffectByName: actorExtensions.getEffectByName,
    getEffectById: actorExtensions.getEffectById,
    setTemporaryHitPoints: actorExtensions.setTemporaryHitPoints,
    addTemporaryHitPoints: actorExtensions.addTemporaryHitPoints,
    getTemporaryHitPoints: actorExtensions.getTemporaryHitPoints,
    getHitPoints: actorExtensions.getHitPoints,
    getMaxHitPoints: actorExtensions.getMaxHitPoints,
    getMissingHitPoint: actorExtensions.getMissingHitPoint,
    getHitPointDetails: actorExtensions.getHitPointDetails,
    setHitPoints: actorExtensions.setHitPoints,
    addHitPoints: actorExtensions.addHitPoints,

    // Effect Extensions
    enableEffect: effectExtensions.enableEffect,
    disableEffect: effectExtensions.disableEffect,

    // Chat Extensions
    printChatMessage: chatExtensions.printChatMessage,

    // Notification Extensions
    warn: notificationExensions.warn,

    // Siphoner
    getAllHitDiceForSiphonerFeature: siphoner.getAllHitDiceForSiphonerFeature,
    siphonerHealAsync: siphoner.siphonerHealAsync,
  };
});
