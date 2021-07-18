const memmy = game.modules.get("memmy").api;
const title = "Energy Drain";
const cancelButton = {
  icon: "",
  label: "Cancel",
};

if (args[0].tag === "OnUse") {
  // HEAL BUTTON
  let healButton = {
    icon: "",
    label: "Heal",
    callback: () => heal(),
  };

  // REGAIN DIE BUTTON
  let regainButton = {
    icon: "",
    label: "Regain Hit Die",
    callback: () => regainHitDie(),
  };

  // SHOW DIALOG
  new Dialog({
    title: title,
    content: "",
    buttons: {
      heal: healButton,
      regain: regainButton,
      cancel: cancelButton,
    },
    default: "heal",
  }).render(true);
}

function heal() {
  let diceData = memmy.getAllHitDiceForSiphonerFeature(actor);

  // Check Available Dice
  if (diceData.available == 0) {
    ui.notifications.warn("You need to have at least one remaining hit die to activate Energy Drain!");
    return;
  }

  // GET CONTENT HTML
  let availableDice = diceData.dice.filter((d) => d.available > 0);
  let hitDieHtml = getHitDieSelectionHtml("Select hit die to roll:", availableDice, "expend");
  let content = `
     <p>Please select the hit die to use for this ability.</p>
     <form>
      ${hitDieHtml}
      <div class="form-group">
       <label>Enter the damage from your attack</label>
       <input id="damage" type="text" inputmode="numeric"></input>
      </div>
     <form>`;

  // GET ROLL BUTTON
  let rollButton = {
    icon: "",
    label: "Roll",
    callback: (html) => {
      let sourceId = html.find("[id=die]")[0].value;
      let damage = parseInt(html.find("[id=damage]")[0].value);
      let die = diceData.dice.find((d) => d.source._id === sourceId);

      if (!damage) {
        ui.notifications.warn("You need to provide the amount of damage dealt by your attack!");
        return;
      }

      executeHeal(die, damage);
    },
  };

  // SHOW HEAL DIALOG
  new Dialog({
    title: title,
    content: content,
    buttons: {
      ok: rollButton,
      cancel: cancelButton,
    },
    default: "rollButton",
  }).render(true);
}

function executeHeal(die, maxHeal) {
  // update count
  if (die.source.type === "class")
    die.source.update({
      "data.hitDiceUsed": die.used + 1,
    });
  else {
    die.source.update({
      "data.uses.value": die.available - 1,
    });
  }

  // roll healing
  let hp = new Roll(die.size).roll().total;

  // gather data for healing
  let maxHP = actor.data.data.attributes.hp.max;
  let currentHP = actor.data.data.attributes.hp.value;
  let toHeal = Math.min(hp, maxHeal);
  let text;

  if (hp > maxHeal) {
    // user heals to much, and should be limited to maxheal value
    text = `${actor.name} healed ${toHeal}! (limited to damage dealt)`;
  } else {
    // user heals hp
    text = `${actor.name} healed ${toHeal}!`;
  }

  // Heal player
  memmy.siphonerHealAsync(actor, toHeal);

  // Create chat message
  memmy.printChatMessage(text);
  return;
}

function regainHitDie() {
  let diceData = memmy.getAllHitDiceForSiphonerFeature(actor);

  if (diceData.expended === 0) {
    ui.notifications.warn("You already have the max amount of available hit die!");
    return;
  }

  // GET DIALOG CONTENT
  let usedDice = diceData.dice.filter((d) => d.used > 0);
  let content = `
     <p>Please select the hit die to regain.</p>
     <form>
      ${getHitDieSelectionHtml("Select hit die to regain:", usedDice, "regain")}
     <form>`;

  // GET REGAIN BUTTON
  let regainButton = {
    icon: "",
    label: "Regain",
    callback: (html) => {
      let sourceId = html.find("[id=die]")[0].value;
      let die = diceData.dice.find((d) => d.source._id === sourceId);
      executeRegain(die);
    },
  };

  // SHOW DIALOG
  new Dialog({
    title: title,
    content: content,
    buttons: {
      regain: regainButton,
      cancel: cancelButton,
    },
    default: "regain",
  }).render(true);
}

function executeRegain(die) {
  // update count
  if (die.source.type === "class")
    die.source.update({
      "data.hitDiceUsed": die.used - 1,
    });
  else {
    die.source.update({
      "data.uses.value": die.available + 1,
    });
  }

  // print chat message
  let msg = `${actor.name} drains the killed enemy and regains 1 hit die (${die.displayName}).`;
  memmy.printChatMessage(msg);
}

function getHitDieSelectionHtml(text, dice, type) {
  let options = "";
  for (let die of dice) {
    let count;
    switch (type) {
      case "expend":
        count = die.available;
        break;
      case "regain":
        count = die.used;
        break;
    }
    options += `<option value="${die.source._id}">(${count}) ${die.displayName}</option>`;
  }

  let html = `
        <div class="form-group">
         <label>${text}</label>
         <select id="die">${options}</select>
        </div>
    `;

  return html;
}