const memmy = game.modules.get('memmy').api;
const title = 'Bloody Bastion';
const cancelButton = {
    icon: '',
    label: 'Cancel'
}

if (args[0].tag === 'OnUse') {
    let hitDice = memmy.getAllHitDiceForSiphonerFeature(actor).dice.filter(d => d.available > 0);
    let spellSlots = memmy.getAllSpellSlots(actor).slots.filter(s => s.available > 0);

    if(!hitDice || hitDice.lenght === 0){
        memmy.warn('You have no remaining hit dice!');
        return;
    }

    if(!spellSlots || spellSlots.length === 0){
        memmy.warn('You have no remaining spell slots!');
        return;
    }

    let diceHtml = '';
    for (let die of hitDice) {
        diceHtml += `<option value="${die.source._id}">(${die.available}) ${die.displayName}</option>`;
    }

    let slotsHtml = '';
    for (let slot of spellSlots) {
        slotsHtml += `<option value="${slot.id}">(${slot.available}) ${slot.displayName}</option>`;
    }

    let content = `
        <form>
            <p>Choose the spell slot and hit die to expend:</p>
            <div class="form-group">
                <label for="die">Hit Die: </label>
                <select id="die">
                    ${diceHtml}
                </select>
            </div>
            <div class="form-group">
                <label for="spellSlot">Spell Slot: </label>
                <select id="spellSlot">
                    ${slotsHtml}
                </select>
            </div>
        </form>
    `;

    let okButton = {
        icon: '',
        label: 'Heal',
        callback: html => {
            let sourceId = html.find("[id=die]")[0].value;
            let die = hitDice.find((d) => d.source._id === sourceId);

            let slotId = html.find("[id=spellSlot]")[0].value;

            //update spell slot count
            memmy.ExpendSpellSlot(actor, slotId, 1);

            // update hit die count
            if (die.source.type === "class")
                die.source.update({
                    "data.hitDiceUsed": die.used + 1,
                });
            else {
                die.source.update({
                    "data.uses.value": die.available - 1,
                });
            }

            let hitPoints = new Roll(die.size).roll().total;
            memmy.siphonerHealAsync(actor, hitPoints);

            // print chat message
            let msg = `${actor.name} Heals ${hitPoints} HP`;
            memmy.printChatMessage(msg);

        }
    }

    new Dialog({
        title: title,
        content: content,
        buttons: {
            ok: okButton,
            cancel: cancelButton
        },
        default: 'ok'
    }).render(true);

}