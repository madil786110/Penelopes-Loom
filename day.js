const START_DATE = new Date('2026-07-28T00:00:00Z').getTime();

const today = Date.now();
const day = Math.floor((today - START_DATE) / 86400000) + 1;

console.log(day);
