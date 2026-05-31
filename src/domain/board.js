import { deepCopyMatrix } from '../utils/matrix.js'
import { getRandomInt } from '../utils/random.js'

/** @returns {import('./types.js').Cell} */
export function createEmptyCell() {
  return {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false,
  }
}

/**
 * Empty board with no mines placed (pre–first click).
 * @param {number} size
 * @returns {import('./types.js').Board}
 */
export function createEmptyBoard(size) {
  const board = []
  for (let row = 0; row < size; row++) {
    const rowCells = []
    for (let col = 0; col < size; col++) {
      rowCells.push(createEmptyCell())
    }
    board.push(rowCells)
  }
  return board
}

/**
 * @param {import('./types.js').Board} board
 * @returns {import('./types.js').Board}
 */
export function cloneBoard(board) {
  return deepCopyMatrix(board)
}

/**
 * Count mines in the 8 neighbors of (row, col).
 * @param {import('./types.js').Board} board
 * @param {number} row
 * @param {number} col
 */
export function countMinesAround(board, row, col) {
  let minesCount = 0

  for (let i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (let j = col - 1; j <= col + 1; j++) {
      if (j < 0 || j >= board[i].length) continue
      if (i === row && j === col) continue
      if (board[i][j].isMine) minesCount++
    }
  }

  return minesCount
}

/**
 * Recompute minesAroundCount for every cell (run after placing mines).
 * @param {import('./types.js').Board} board
 * @returns {import('./types.js').Board}
 */
export function computeNeighborCounts(board) {
  return board.map((row, rowIdx) =>
    row.map((cell, colIdx) => ({
      ...cell,
      minesAroundCount: countMinesAround(board, rowIdx, colIdx),
    })),
  )
}

/**
 * @param {import('./types.js').Board} board
 * @param {(cell: import('./types.js').Cell, row: number, col: number) => boolean} predicate
 * @returns {import('./types.js').Position[]}
 */
export function collectPositions(board, predicate) {
  /** @type {import('./types.js').Position[]} */
  const positions = []

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (predicate(board[row][col], row, col)) {
        positions.push({ row, col })
      }
    }
  }

  return positions
}

/** Positions that are not mines (for mine placement). */
export function getNonMinePositions(board) {
  return collectPositions(board, (cell) => !cell.isMine)
}

/** Hidden, non-mine cells (for safe-click hint). */
export function getSafePositions(board) {
  return collectPositions(board, (cell) => !cell.isMine && !cell.isShown)
}

/**
 * @param {import('./types.js').Position[]} positions
 * @returns {import('./types.js').Position | null}
 */
export function pickRandomPosition(positions) {
  if (positions.length === 0) return null
  const idx = getRandomInt(0, positions.length)
  return positions[idx]
}

/**
 * Fisher–Yates shuffle (copy; does not mutate argument).
 * @template T
 * @param {T[]} items
 */
export function shuffle(items) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Place mines on first click, excluding the safe cell.
 * Improved vs legacy: shuffle all candidate cells instead of repeated random picks.
 *
 * @param {import('./types.js').Board} board
 * @param {number} mineCount
 * @param {number} safeRow
 * @param {number} safeCol
 * @returns {import('./types.js').Board}
 */
export function placeMines(board, mineCount, safeRow, safeCol) {
  const candidates = getNonMinePositions(board).filter(
    ({ row, col }) => row !== safeRow || col !== safeCol,
  )

  const mineSlots = shuffle(candidates).slice(0, mineCount)
  const mineKeys = new Set(mineSlots.map(({ row, col }) => `${row},${col}`))

  return board.map((row, rowIdx) =>
    row.map((cell, colIdx) =>
      mineKeys.has(`${rowIdx},${colIdx}`) ? { ...cell, isMine: true } : cell,
    ),
  )
}

/**
 * First click: plant mines, then compute neighbor counts.
 * @param {import('./types.js').Board} board
 * @param {number} mineCount
 * @param {number} safeRow
 * @param {number} safeCol
 */
export function prepareBoardAfterFirstClick(board, mineCount, safeRow, safeCol) {
  const withMines = placeMines(board, mineCount, safeRow, safeCol)
  return computeNeighborCounts(withMines)
}

/**
 * @param {import('./types.js').Board} board
 * @param {number} row
 * @param {number} col
 * @param {Partial<import('./types.js').Cell>} patch
 */
export function patchCell(board, row, col, patch) {
  return board.map((rowCells, rowIdx) =>
    rowIdx === row
      ? rowCells.map((cell, colIdx) =>
          colIdx === col ? { ...cell, ...patch } : cell,
        )
      : rowCells,
  )
}

/**
 * Reveal one cell. Returns a new board.
 * @param {import('./types.js').Board} board
 * @param {number} row
 * @param {number} col
 */
export function revealCell(board, row, col) {
  return patchCell(board, row, col, { isShown: true })
}

/**
 * Toggle flag on one cell.
 * @param {import('./types.js').Board} board
 * @param {number} row
 * @param {number} col
 */
export function toggleCellMark(board, row, col) {
  const cell = board[row][col]
  return patchCell(board, row, col, { isMarked: !cell.isMarked })
}

/**
 * Flood-reveal around an already-revealed empty cell (minesAroundCount === 0).
 * Ported from legacy expandShown (without hint/mega-hint guards — handled in reducer).
 *
 * @param {import('./types.js').Board} board
 * @param {number} startRow
 * @param {number} startCol
 * @returns {{ board: import('./types.js').Board, revealedCount: number }}
 */
export function revealFlood(board, startRow, startCol) {
  let nextBoard = cloneBoard(board)
  let revealedCount = 0

  function expand(rowIdx, colIdx) {
    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
      if (i < 0 || i >= nextBoard.length) continue
      for (let j = colIdx - 1; j <= colIdx + 1; j++) {
        if (j < 0 || j >= nextBoard[i].length) continue
        if (i === rowIdx && j === colIdx) continue

        const cell = nextBoard[i][j]
        if (cell.isMarked || cell.isMine || cell.isShown) continue

        nextBoard[i][j] = { ...cell, isShown: true }
        revealedCount++

        if (nextBoard[i][j].minesAroundCount === 0) {
          expand(i, j)
        }
      }
    }
  }

  expand(startRow, startCol)
  return { board: nextBoard, revealedCount }
}

/**
 * Reveal a cell and flood-fill when it is a non-mine empty region.
 * @param {import('./types.js').Board} board
 * @param {number} row
 * @param {number} col
 * @returns {{ board: import('./types.js').Board, revealedCount: number }}
 */
export function revealCellAndFlood(board, row, col) {
  const cell = board[row][col]
  if (cell.isShown) {
    return { board, revealedCount: 0 }
  }

  let nextBoard = revealCell(board, row, col)
  let revealedCount = 1
  const revealed = nextBoard[row][col]

  if (revealed.minesAroundCount === 0 && !revealed.isMine) {
    const flood = revealFlood(nextBoard, row, col)
    nextBoard = flood.board
    revealedCount += flood.revealedCount
  }

  return { board: nextBoard, revealedCount }
}

/**
 * Reveal every mine (game over).
 * @param {import('./types.js').Board} board
 */
export function revealAllMines(board) {
  return board.map((row) =>
    row.map((cell) => (cell.isMine ? { ...cell, isShown: true } : cell)),
  )
}
