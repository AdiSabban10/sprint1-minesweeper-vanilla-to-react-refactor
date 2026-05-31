/**
 * Create a ROWS×COLS matrix filled with placeholder values.
 * Ported from legacy/js/utils.js — used when scaffolding empty grids.
 * @param {number} rows
 * @param {number} cols
 * @param {*} [fillValue='']
 */
export function createMat(rows, cols, fillValue = '') {
  const mat = []
  for (let i = 0; i < rows; i++) {
    const row = []
    for (let j = 0; j < cols; j++) {
      row.push(fillValue)
    }
    mat.push(row)
  }
  return mat
}

/**
 * Deep-copy a 2D matrix of cell objects (for undo snapshots).
 * @template T
 * @param {T[][]} matrix
 * @returns {T[][]}
 */
export function deepCopyMatrix(matrix) {
  return matrix.map((row) => row.map((cell) => ({ ...cell })))
}
