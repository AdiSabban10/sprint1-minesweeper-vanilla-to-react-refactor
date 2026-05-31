/**
 * Random integer in [min, max) — min inclusive, max exclusive.
 * Ported from legacy/js/utils.js
 * @param {number} min
 * @param {number} max
 */
export function getRandomInt(min, max) {
  const minCeil = Math.ceil(min)
  const maxFloor = Math.floor(max)
  return Math.floor(Math.random() * (maxFloor - minCeil) + minCeil)
}
