const memmy = game.modules.get("memmy").api;
const title = "Overheal";

if (args[0].tag == "OnUse") {
  // generate dialog content
  let content = `
        <form>
            <div class="form-group">
                <label>How much did you overheal?</label>
                <input id="overheal" type="number" min="0"></input>
            </div>
        </form>
    `;

  // generate OK button
  let okButton = {
    icon: "",
    label: "Ok",
    callback: (html) => {
      let healingValue = parseInt(html.find("[id=overheal]")[0].value);
      overheal(healingValue);
    },
  };

  // generate cancel button
  let cancelButton = {
    icon: "",
    label: "Cancel",
  };

  new Dialog({
    title: title,
    content: content,
    buttons: {
      ok: okButton,
      cancel: cancelButton,
    },
    default: "ok",
  }).render(true);
}

function overheal(healingValue) {
  // check valid input!
  if (!healingValue) {
    ui.notifications.warn("Please provide a valid amount of overhealed hit points!");
    return;
  }

  let tempHitPoints = Math.floor(healingValue / 2);
  if (actor.data.data.attributes.hp.temp >= tempHitPoints) {
    ui.notifications.warn("You already have more temporary hit points than this ability would gain you!");
    return;
  }

  // update temporary hit points
  actor.update({
    "data.attributes.hp.temp": tempHitPoints,
  });

  // print chat message
  let msg = `${actor.name} overhealed ${tempHitPoints} temporary hit points!`;
  memmy.printChatMessage(msg);
}
