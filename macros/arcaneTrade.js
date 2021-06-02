const memmy = game.modules.get('memmy').api;
const title = 'Arcane Trade';
const cancelButton = {
    icon: '',
    label: 'Cancel'
}

if (args[0].tag === 'OnUse') {

    // get slots
    let slots = memmy.getAllSpellSlots(actor);

    // check if we have slots available
    if (slots.available <= 0) {
        memmy.warn("You have no spell slots available!");
        return;
    }

    // generate html content
    let slotsHtml = ``;
    for (let slot of slots.slots.filter(s => s.available > 0)) {
        slotsHtml += `<option value="${slot.id}">${slot.displayName}(${slot.available})</option>`;
    }
    let content = `
        <p>Please select the spell slot to expend for this ability.</p>
        <form>
            <div class="form-group">
                <select id="spellSlot">
                ${slotsHtml}
                </select>
            </div>
        </form>
    `;

    // generate ok button
    let okButton = {
        icon: '',
        label: 'Ok',
        callback: (html) => {
            let slotId = html.find("[id=spellSlot]")[0].value;
            let slot = slots.slots.find(s => s.id === slotId);
            let dieCount = slot.level;

            regainHitDice(dieCount)
        }
    }

    // generate and show dialog
    let dialog = new Dialog({
        title: title,
        content: content,
        buttons: {
            ok: okButton,
            cancel: cancelButton
        },
        default: 'ok'
    }).render(true);
}

function regainHitDice(dieCount, slotId) {
    let availableDice = memmy.getAllHitDiceForSiphonerFeature(actor).dice.filter(d => d.used > 0);
    let diceHtml = '';

    for (let die of availableDice) {
        diceHtml += `
        <div class="form-group">
            <label for="${die.source.id}">${die.displayName} (Max: ${die.used})</label>
            <input id="${die.source.id}" type="number" name="${die.source.id}" min="0" max="${die.used}"/>
        </div>
        `;
    }


    let content = `
        <p>Please select up to ${dieCount} hit dice to regain:</p>
        <form>
            ${diceHtml}
        </form>
    `;

    let okButton = {
        icon: '',
        label: 'Ok',
        callback: html => {
            let regained = [];
            let i = 0;
            let total = 0;

            // fetch user input
            for (let die of availableDice) {
                let count = parseInt(html.find(`[id=${die.source.id}]`)[0].value);
                if (count && count > 0) {
                    regained[i] = {
                        die: die,
                        count: count
                    };
                    total += count;
                    i++;
                }
            }

            // do nothing
            if (total == 0)
                return;

            // validate input
            if (total > dieCount) {
                memmy.warn(`Please select a maximum of ${dieCount} dice!`);
                return regainHitDice(dieCount);
            }

            // regain hit dice
            regained.forEach((value, index, array) => {
                if (value.die.source.type === 'class') {
                    let newCount = value.die.used - value.count;
                    value.die.source.update({
                        'data.hitDiceUsed': newCount
                    });
                }
                else {
                    let newCount = value.die.available + value.count;
                    value.die.source.update({
                        'data.uses.value': newCount
                    })
                }
            });

        }
    };

    let cancelButton = {
        icon: '',
        label: 'Cancel'
    };

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