const memmy = game.modules.get("memmy").api;
const title = "On The Edge";
const cancelButton = {
  icon: "",
  label: "Cancel",
};

const bwb = memmy.names.features.betterWhenBleeding;
const bulkUp = memmy.names.features.bulkUp;
const intensify = memmy.names.features.intensify;
const lockOn = memmy.names.features.lockOn;

const bwbItemLink = "@Item[L7AUdlUWMAum0zhu]{Better When Bleeding}";
const archaicArtsItemLink = "@Item[OM7SdcYcni5VIruv]{Archaic Arts}";

if (args[0].tag === "OnUse") {
  // get bulk up button
  let bulkUpButton = {
    icon: "",
    label: "Bulk Up",
    callback: executeBulkUp,
  };

  // get intensify button
  let intensifyButton = {
    icon: "",
    label: "Intensify",
    callback: executeIntensify,
  };

  // get lock on button
  let lockOnButton = {
    icon: "",
    label: "Lock On",
    callback: executeLockOn,
  };

  // get thick skin button
  let thickSkinButton = {
    icon: "",
    label: "Thick Skin",
    callback: executeThickSkin,
  };

  // render dialog
  new Dialog({
    title: title,
    content: `Please select an effect: `,
    buttons: {
      bulkUp: bulkUpButton,
      intensify: intensifyButton,
      lockOn: lockOnButton,
      thickSkin: thickSkinButton,
      cancel: cancelButton,
    },
    default: "cancel",
  }).render(true);
}

function executeBulkUp() {
  var betterWhenBleedingEffect = memmy.getEffectByName(actor, bwb);
  var bulkUpEffect = memmy.getEffectByName(actor, bulkUp);

  memmy.disableEffect(betterWhenBleedingEffect);
  memmy.enableEffect(bulkUpEffect);

  let chatMessage = `${actor.name} bulks up, and ignores his AC penalty from ${bwbItemLink} until the end of their next turn.`;
  memmy.printChatMessage(chatMessage);
}

function executeIntensify() {
  var intensifyEffect = memmy.getEffectByName(actor, intensify);

  memmy.enableEffect(intensifyEffect);

  let chatMessage = `${actor.name} intensifies, adding their constitution modifier to the damage rolls of their ${archaicArtsItemLink} and weapon attacks until the end of their next turn! `;
  memmy.printChatMessage(chatMessage);
}

function executeLockOn() {
  var lockOnEffect = memmy.getEffectByName(actor, lockOn);

  memmy.enableEffect(lockOnEffect);

  let chatMessage = `${actor.name} locks on to the creature that attacked them, gaining advantage on attack rolls against it until the end of their next turn. The creature also gets disadvanate on saving throws against ${actor.name}'s ${archaicArtsItemLink}!' `;
  memmy.printChatMessage(chatMessage);
}

function executeThickSkin() {
  // generate dialog content
  let content = `
    <form>
        <div class="form-group">
            <label>Please enter the amount of damage you took</label>
            <input id="damage" type="number" min="0"></input>
        </div>
    </form>
  `;

  // generate OK button
  let okButton = {
    icon: "",
    label: "OK",
    callback: (html) => {
      let damage = parseInt(html.find("[id=damage]")[0].value);
      
      if (!damage) {
        memmy.warn("You need to provide the amount of damage you received!");
        return;
      }

      let maxHeal = Math.floor(damage / 2);
      let siphonerLevel = memmy.getItemByNameAndType(actor, "Siphoner", "class").data.data.levels;
      let tempHitPoints = Math.min(siphonerLevel, maxHeal);
      memmy.setTemporaryHitPoints(actor, tempHitPoints);

      let chatMessage = `${actor.name} thickens their skin, gaining ${tempHitPoints} temporary hit points!`;
      memmy.printChatMessage(chatMessage);
    },
  };

  new Dialog({
    title: title,
    content: content,
    buttons: {
      ok: okButton,
      cancel: cancelButton,
    },
  }).render(true);
}