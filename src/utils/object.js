/**
 * Shallow copy of plain objects (undo meta snapshots).
 * Ported from legacy modifyShallowCopy in utils.js — used in M5 reducer.
 * @param {Record<string, unknown>} obj
 */
export function shallowCopy(obj) {
  return { ...obj }
}
