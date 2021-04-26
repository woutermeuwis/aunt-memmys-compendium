const memmy = game.modules.get('memmy').api;

let betterWhenBleedingEffect = memmy.getEffectByName(memmy.names.features.betterWhenBleeding);
let bulkUpEffect = memmy.getEffectByName(memmy.names.features.bulkUp);
let intensifyEffect = memmy.getEffectByName(memmy.names.features.intensify);
let lockOnEffect = memmy.getEffectByName(memmy.names.features.lockOn);


if (!bulkUpEffect.data.disabled) {
    memmy.enableEffect(betterWhenBleedingEffect);
    memmy.disableEffect(bulkUpEffect);
}

if (!intensifyEffect.data.disabled) {
    memmy.disableEffect(intensifyEffect);
}

if (!lockOnEffect.data.disabled) {
    memmy.disableEffect(lockOnEffect);
}