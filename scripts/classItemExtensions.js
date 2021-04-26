export function getClassHitDice(classItem) {
  let data = classItem.data.data;

  let displayName = `${data.hitDice} [${classItem.data.name}]`;
  let size = data.hitDice;
  let max = data.levels;
  let used =data.hitDiceUsed;
  let available = data.levels - data.hitDiceUsed;

  return {
    displayName: displayName,
    size: size,
    max: max,
    used: used,
    available: available,
    source: classItem,
  };
}
