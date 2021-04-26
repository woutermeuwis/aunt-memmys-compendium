export function enableEffect(effect) {
    effect.update({'disabled': false});
}

export function disableEffect(effect) {
    effect.update({'disabled': true});
}