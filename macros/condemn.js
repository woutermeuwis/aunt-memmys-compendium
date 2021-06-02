const memmy = game.modules.get('memmy').api;
const title = 'Conemn';
const cancelButton = {
    icon: '',
    label: 'Cancel'
}

if (args[0].tag === 'OnUse') {
    let availableDice = memmy.getAllHitDiceForSiphonerFeature(actor).dice.filter(d => d.available > 0);
    if (availableDice.available === 0) {
        memmy.warn(`You need to have at least 1 hit die available.`);
        return;
    }
    regainHitDice(availableDice);
}

function regainHitDice(availableDice) {
    let maxDice = actor.data.data.attributes.prof;

    let diceHtml = '';
    for (let die of availableDice) {
        diceHtml += `
        <div class="form-group">
            <label for="${die.source.id}">${die.displayName} (Max: ${die.available})</label>
            <input id="${die.source.id}" type="number" name="${die.source.id}" min="0" max="${die.available}"/>
        </div>
        `;
    }

    let content = `
        <p>Please select up to ${maxDice} hit dice to regain:</p>
        <form>
            ${diceHtml}
        </form>
    `;

    let okButton = {
        icon: '',
        label: 'OK',
        callback: html => {
            let regained = [];
            let total = 0;
            let i = 0;

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
            if (total > maxDice) {
                memmy.warn(`Please select a maximum of ${maxDice} dice!`);
                regainHitDice();
            }

            let dice = {};

            // expend hit dice
            regained.forEach((value, index, array) => {
                if (value.die.source.type === 'class') {
                    let newCount = value.die.used + value.count
                    value.die.source.update({
                        'data.hitDiceUsed': newCount
                    });
                }
                else {
                    let newCount = value.die.available - value.count;
                    value.die.source.update({
                        'data.uses.value': newCount
                    });
                }

                if (!dice[value.die.size])
                    dice[value.die.size] = 0;
                dice[value.die.size] = dice[value.die.size] + value.count;
            });

            rollDamage(dice, actor, args)
        }
    }

    new Dialog({
        title: title,
        content: content,
        buttons: {
            ok: okButton,
            cancel: cancelButton,
        },
        default: "ok"
    }).render(true);
}

function rollDamage(dice, actor, args) {
    let formula;
    for (let [key, value] of Object.entries(dice)) {
        let newPart = `${value}${key}`;

        if (formula)
            formula += `+${newPart}`;
        else
            formula = newPart;
    }

    let damageRoll = new Roll(formula).roll();
    let targets = args[0].targets;
    new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "necrotic",  targets, damageRoll, {flavor: `${title} - Damage Roll (Necrotic)`, itemData: args[0].item});
}