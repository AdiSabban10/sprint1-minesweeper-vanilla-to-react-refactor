import {
  cloneBoard,
  getSafePositions,
  patchCell,
  pickRandomPosition,
  prepareBoardAfterFirstClick,
  revealAllMines,
  revealCellAndFlood,
  toggleCellMark,
} from './board.js'
import { getLevelBySize } from './levels.js'
import {
  checkVictory,
  createInitialGameState,
  hasGameStarted,
} from './rules.js'

/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').GameMeta} GameMeta */
/** @typedef {import('./types.js').Board} Board */
/** @typedef {import('./types.js').LevelConfig} LevelConfig */

/**
 * Meta fields restored on undo (legacy dataOfGamesMoves).
 * @typedef {Pick<GameMeta, 'shownCount' | 'markedCount' | 'shownMinesCount' | 'livesCount'>} UndoMetaSnapshot
 */

/**
 * @typedef {Object} ReducerState
 * @property {GameState} game
 * @property {Board[]} boardHistory
 * @property {UndoMetaSnapshot[]} metaHistory
 * @property {string[]} peekCellKeys Temporary reveal for hint / mega-hint (UI clears via CLEAR_PEEK)
 * @property {string | null} safeHighlightKey Cell highlighted by safe-click (no content reveal)
 */

export const ACTIONS = {
  NEW_GAME: 'NEW_GAME',
  SET_LEVEL: 'SET_LEVEL',
  REVEAL_CELL: 'REVEAL_CELL',
  TOGGLE_MARK: 'TOGGLE_MARK',
  ACTIVATE_HINT: 'ACTIVATE_HINT',
  ACTIVATE_MEGA_HINT: 'ACTIVATE_MEGA_HINT',
  USE_SAFE_CLICK: 'USE_SAFE_CLICK',
  CLEAR_PEEK: 'CLEAR_PEEK',
  UNDO: 'UNDO',
}

/** @param {LevelConfig} [level] */
export function createReducerState(level) {
  const game = createInitialGameState(level)
  return {
    game,
    boardHistory: [],
    metaHistory: [],
    peekCellKeys: [],
    safeHighlightKey: null,
  }
}

/** @param {GameMeta} meta */
function pickUndoMeta(meta) {
  return {
    shownCount: meta.shownCount,
    markedCount: meta.markedCount,
    shownMinesCount: meta.shownMinesCount,
    livesCount: meta.livesCount,
  }
}

/**
 * @param {ReducerState} state
 * @param {GameState} game
 * @param {boolean} [recordHistory]
 */
function commitGame(state, game, recordHistory = true) {
  const next = { ...state, game, peekCellKeys: [], safeHighlightKey: null }

  if (!recordHistory) return next

  return {
    ...next,
    boardHistory: [...state.boardHistory, cloneBoard(game.board)],
    metaHistory: [...state.metaHistory, pickUndoMeta(game.meta)],
  }
}

/** @param {Board} board @param {number} row @param {number} col */
function cellKey(row, col) {
  return `${row},${col}`
}

/** @param {Board} board @param {number} centerRow @param {number} centerCol */
function getHintPeekKeys(board, centerRow, centerCol) {
  /** @type {string[]} */
  const keys = []

  for (let row = centerRow - 1; row <= centerRow + 1; row++) {
    if (row < 0 || row >= board.length) continue
    for (let col = centerCol - 1; col <= centerCol + 1; col++) {
      if (col < 0 || col >= board[row].length) continue
      if (board[row][col].isShown) continue
      keys.push(cellKey(row, col))
    }
  }

  return keys
}

/**
 * @param {Board} board
 * @param {number} row1
 * @param {number} col1
 * @param {number} row2
 * @param {number} col2
 */
function getRectPeekKeys(board, row1, col1, row2, col2) {
  /** @type {string[]} */
  const keys = []
  const firstRow = Math.min(row1, row2)
  const lastRow = Math.max(row1, row2)
  const firstCol = Math.min(col1, col2)
  const lastCol = Math.max(col1, col2)

  for (let row = firstRow; row <= lastRow; row++) {
    if (row < 0 || row >= board.length) continue
    for (let col = firstCol; col <= lastCol; col++) {
      if (col < 0 || col >= board[row].length) continue
      if (board[row][col].isShown) continue
      keys.push(cellKey(row, col))
    }
  }

  return keys
}

/**
 * @param {Board} board
 * @param {number} centerRow
 * @param {number} centerCol
 */
function unmarkIn3x3(board, centerRow, centerCol) {
  let nextBoard = board
  let markedDelta = 0

  for (let row = centerRow - 1; row <= centerRow + 1; row++) {
    if (row < 0 || row >= board.length) continue
    for (let col = centerCol - 1; col <= centerCol + 1; col++) {
      if (col < 0 || col >= board[row].length) continue
      if (!board[row][col].isMarked) continue
      nextBoard = patchCell(nextBoard, row, col, { isMarked: false })
      markedDelta--
    }
  }

  return { board: nextBoard, markedDelta }
}

/**
 * @param {Board} board
 * @param {number} row1
 * @param {number} col1
 * @param {number} row2
 * @param {number} col2
 */
function unmarkInRect(board, row1, col1, row2, col2) {
  let nextBoard = board
  let markedDelta = 0
  const firstRow = Math.min(row1, row2)
  const lastRow = Math.max(row1, row2)
  const firstCol = Math.min(col1, col2)
  const lastCol = Math.max(col1, col2)

  for (let row = firstRow; row <= lastRow; row++) {
    if (row < 0 || row >= board.length) continue
    for (let col = firstCol; col <= lastCol; col++) {
      if (col < 0 || col >= board[row].length) continue
      if (!board[row][col].isMarked) continue
      nextBoard = patchCell(nextBoard, row, col, { isMarked: false })
      markedDelta--
    }
  }

  return { board: nextBoard, markedDelta }
}

/**
 * @param {GameMeta} meta
 * @param {boolean | null} isVictory
 */
function endGame(meta, isVictory) {
  return {
    ...meta,
    isOn: false,
    isVictory,
    isTimerRunning: false,
    isHintOn: false,
    isMegaHintOn: false,
    megaHintLocations: [],
  }
}

/**
 * @param {ReducerState} state
 * @param {number} row
 * @param {number} col
 */
function handleHintReveal(state, row, col) {
  const { game } = state
  const unmark = unmarkIn3x3(game.board, row, col)
  const nextMeta = {
    ...game.meta,
    isHintOn: false,
    markedCount: game.meta.markedCount + unmark.markedDelta,
  }

  return {
    ...state,
    game: { ...game, board: unmark.board, meta: nextMeta },
    peekCellKeys: getHintPeekKeys(unmark.board, row, col),
    safeHighlightKey: null,
  }
}

/**
 * @param {ReducerState} state
 * @param {number} row
 * @param {number} col
 */
function handleMegaHintCorner(state, row, col) {
  const { game } = state
  const { meta, board } = game
  const existing = meta.megaHintLocations

  if (
    existing.length !== 0 &&
    (existing[0].row > row || existing[0].col > col)
  ) {
    return state
  }

  const nextLocations = [...existing, { row, col }]

  if (nextLocations.length < 2) {
    return {
      ...state,
      game: {
        ...game,
        meta: { ...meta, megaHintLocations: nextLocations },
      },
    }
  }

  const [{ row: row1, col: col1 }, { row: row2, col: col2 }] = nextLocations
  const unmark = unmarkInRect(board, row1, col1, row2, col2)
  const nextMeta = {
    ...meta,
    markedCount: meta.markedCount + unmark.markedDelta,
    isMegaHintOn: false,
    megaHintIsUsable: false,
    megaHintLocations: [],
  }

  return {
    ...state,
    game: { ...game, board: unmark.board, meta: nextMeta },
    peekCellKeys: getRectPeekKeys(unmark.board, row1, col1, row2, col2),
    safeHighlightKey: null,
  }
}

/**
 * @param {ReducerState} state
 * @param {number} row
 * @param {number} col
 */
function handleRevealCell(state, row, col) {
  const { game } = state
  let { board, meta, level } = game
  const cell = board[row][col]

  if (!meta.isOn || cell.isShown) return state

  if (meta.isHintOn) {
    return handleHintReveal(state, row, col)
  }

  if (meta.isMegaHintOn) {
    return handleMegaHintCorner(state, row, col)
  }

  const isFirstClick = !hasGameStarted(meta)

  if (!isFirstClick) {
    if (cell.isMarked) return state

    if (cell.isMine) {
      meta = {
        ...meta,
        livesCount: meta.livesCount - 1,
        shownMinesCount: meta.shownMinesCount + 1,
      }

      if (meta.livesCount === 0) {
        meta = endGame(meta, false)
        board = revealAllMines(board)
      }
    }
  }

  if (isFirstClick) {
    board = prepareBoardAfterFirstClick(board, level.mines, row, col)
    meta = { ...meta, isTimerRunning: true }
  }

  const { board: revealedBoard, revealedCount } = revealCellAndFlood(
    board,
    row,
    col,
  )
  board = revealedBoard
  meta = { ...meta, shownCount: meta.shownCount + revealedCount }

  if (meta.isOn && checkVictory(level, meta)) {
    meta = endGame(meta, true)
  }

  return commitGame(state, { ...game, board, meta })
}

/**
 * @param {ReducerState} state
 * @param {number} row
 * @param {number} col
 */
function handleToggleMark(state, row, col) {
  const { game } = state
  const { board, meta, level } = game
  const cell = board[row][col]

  if (!meta.isOn || !hasGameStarted(meta) || cell.isShown) return state

  const nextBoard = toggleCellMark(board, row, col)
  const wasMarked = cell.isMarked
  let nextMeta = {
    ...meta,
    markedCount: meta.markedCount + (wasMarked ? -1 : 1),
  }

  if (checkVictory(level, nextMeta)) {
    nextMeta = endGame(nextMeta, true)
  }

  return commitGame(state, { ...game, board: nextBoard, meta: nextMeta })
}

/**
 * @param {ReducerState} state
 * @param {{ type: string, level?: LevelConfig, size?: number, row?: number, col?: number }} action
 */
export function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.NEW_GAME: {
      const level = action.level ?? state.game.level
      return createReducerState(level)
    }

    case ACTIONS.SET_LEVEL: {
      const level =
        action.level ??
        (action.size != null ? getLevelBySize(action.size) : state.game.level)
      return createReducerState(level)
    }

    case ACTIONS.REVEAL_CELL:
      return handleRevealCell(state, action.row, action.col)

    case ACTIONS.TOGGLE_MARK:
      return handleToggleMark(state, action.row, action.col)

    case ACTIONS.ACTIVATE_HINT: {
      const { meta } = state.game
      if (meta.isHintOn || !hasGameStarted(meta) || meta.hintsCount === 0) {
        return state
      }
      return {
        ...state,
        game: {
          ...state.game,
          meta: {
            ...meta,
            isHintOn: true,
            hintsCount: meta.hintsCount - 1,
          },
        },
      }
    }

    case ACTIONS.ACTIVATE_MEGA_HINT: {
      const { meta } = state.game
      if (
        !meta.megaHintIsUsable ||
        !hasGameStarted(meta) ||
        meta.isMegaHintOn
      ) {
        return state
      }
      return {
        ...state,
        game: {
          ...state.game,
          meta: {
            ...meta,
            isMegaHintOn: true,
            megaHintLocations: [],
          },
        },
      }
    }

    case ACTIONS.USE_SAFE_CLICK: {
      const { game } = state
      const { board, meta } = game
      if (!meta.isOn || meta.safeCount === 0) return state

      const pos = pickRandomPosition(getSafePositions(board))
      if (!pos) return state

      return {
        ...state,
        game: {
          ...game,
          meta: { ...meta, safeCount: meta.safeCount - 1 },
        },
        safeHighlightKey: cellKey(pos.row, pos.col),
        peekCellKeys: [],
      }
    }

    case ACTIONS.CLEAR_PEEK:
      return {
        ...state,
        peekCellKeys: [],
        safeHighlightKey: null,
      }

    case ACTIONS.UNDO: {
      const { game, boardHistory, metaHistory } = state
      if (!game.meta.isOn || boardHistory.length < 2) return state

      const prevBoard = boardHistory[boardHistory.length - 2]
      const prevMeta = metaHistory[metaHistory.length - 2]

      return {
        ...state,
        game: {
          ...game,
          board: cloneBoard(prevBoard),
          meta: { ...game.meta, ...prevMeta },
        },
        boardHistory: boardHistory.slice(0, -1),
        metaHistory: metaHistory.slice(0, -1),
        peekCellKeys: [],
        safeHighlightKey: null,
      }
    }

    default:
      return state
  }
}

/** Action creators for use with dispatch */
export const gameActions = {
  newGame: (level) => ({ type: ACTIONS.NEW_GAME, level }),
  setLevel: (level) => ({ type: ACTIONS.SET_LEVEL, level }),
  setLevelBySize: (size) => ({ type: ACTIONS.SET_LEVEL, size }),
  revealCell: (row, col) => ({ type: ACTIONS.REVEAL_CELL, row, col }),
  toggleMark: (row, col) => ({ type: ACTIONS.TOGGLE_MARK, row, col }),
  activateHint: () => ({ type: ACTIONS.ACTIVATE_HINT }),
  activateMegaHint: () => ({ type: ACTIONS.ACTIVATE_MEGA_HINT }),
  useSafeClick: () => ({ type: ACTIONS.USE_SAFE_CLICK }),
  clearPeek: () => ({ type: ACTIONS.CLEAR_PEEK }),
  undo: () => ({ type: ACTIONS.UNDO }),
}

/**
 * Whether a cell should use forceReveal in getCellDisplay.
 * @param {ReducerState} state
 * @param {number} row
 * @param {number} col
 */
export function isCellPeekActive(state, row, col) {
  return state.peekCellKeys.includes(cellKey(row, col))
}

/**
 * Whether a cell has safe-click highlight styling.
 * @param {ReducerState} state
 * @param {number} row
 * @param {number} col
 */
export function isCellSafeHighlight(state, row, col) {
  return state.safeHighlightKey === cellKey(row, col)
}
