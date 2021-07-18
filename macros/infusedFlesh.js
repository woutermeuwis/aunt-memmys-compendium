const memmy = game.modules.get("memmy").api;
const title = "Infused Flesh";

if (args[0].tag == "OnUse") {
  // get slots
  let slotsData = memmy.getAllSpellSlots(actor);

  // check if any slot available
  if (slotsData.available <= 0) {
    ui.notifications.warn("You have no spell slots available for this feature!");
    return;
  }

  // generate html content
  let spellSlotsHtml = ``;
  for (let slot of  slotsData.slots.filter((s) => s.available > 0)) {
    spellSlotsHtml += `<option value="${slot.id}">${slot.displayName} (${slot.available})</option>`;
  }
  let content = `
    <p> Please select the spell slot to use for this ability.
    <form>
        <div class="form-group">
            <select id="spellSlot">
                ${spellSlotsHtml}
            </select>
        </div>
    </form>
  `;

  // generate ok button
  let okButton = {
    icon: "",
    label: "Ok",
    callback: (html) => {
      let slotId = html.find("[id=spellSlot]")[0].value;
      let slot = slotsData.slots.find((s) => s.id == slotId);

      var tempHP = actor.data.data.attributes.hp.temp;
      var extraTempHP = 5 * slot.level;
      var spellSlotPath = `data.spells.${slotId}.value`;

      let updateData = {
        "data.attributes.hp.temp": tempHP + extraTempHP,
      };
      updateData[spellSlotPath] = slot.available - 1;

      actor.update(updateData);
    },
  };

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
