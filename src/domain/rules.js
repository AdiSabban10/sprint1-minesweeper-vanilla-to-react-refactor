import { createEmptyBoard } from './board.js'
import {
  DEFAULT_HINTS_COUNT,
  DEFAULT_SAFE_CLICK_COUNT,
  EMPTY,
  MARK,
  MINE,
} from './constants.js'
import { LEVELS } from './levels.js'

/**
 * @typedef {Object} CellDisplayOptions
 * @property {boolean} isGameOn Whether the game is still in progress
 * @property {boolean} [forceReveal] Temporarily show content (hint / mega-hint preview)
 */

/**
 * Fresh meta counters for a new round (ported from legacy resetGame).
 * @param {import('./types.js').LevelConfig} level
 * @returns {import('./types.js').GameMeta}
 */
export function createInitialMeta(level) {
  return {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    shownMinesCount: 0,
    livesCount: level.lives,
    hintsCount: DEFAULT_HINTS_COUNT,
    isHintOn: false,
    safeCount: DEFAULT_SAFE_CLICK_COUNT,
    isMegaHintOn: false,
    megaHintLocations: [],
    megaHintIsUsable: true,
    isTimerRunning: false,
    isVictory: null,
  }
}

/**
 * Full state for a new game at the chosen level.
 * @param {import('./types.js').LevelConfig} [level]
 * @returns {import('./types.js').GameState}
 */
export function createInitialGameState(level = LEVELS.beginner) {
  return {
    level,
    board: createEmptyBoard(level.size),
    meta: createInitialMeta(level),
  }
}

/** @param {import('./types.js').GameMeta} meta */
export function isGameActive(meta) {
  return meta.isOn
}

/** First click not yet made — flags disabled in legacy until then. */
export function hasGameStarted(meta) {
  return meta.shownCount > 0
}

/**
 * Remaining mines to flag (legacy renderMinesCountUserNeedToMark).
 * @param {import('./types.js').LevelConfig} level
 * @param {import('./types.js').GameMeta} meta
 */
export function getRemainingMinesCount(level, meta) {
  return level.mines - meta.shownMinesCount - meta.markedCount
}

/**
 * Custom win rule from legacy checkIsVictory.
 * @param {import('./types.js').LevelConfig} level
 * @param {import('./types.js').GameMeta} meta
 */
export function checkVictory(level, meta) {
  const cellsThatShouldBeShown =
    level.size ** 2 - level.mines + meta.shownMinesCount
  const cellsThatShouldBeMarked = level.mines - meta.shownMinesCount

  return (
    meta.shownCount === cellsThatShouldBeShown &&
    meta.markedCount === cellsThatShouldBeMarked
  )
}

/**
 * What to render inside a cell (ported from legacy renderCell).
 * @param {import('./types.js').Cell} cell
 * @param {CellDisplayOptions} options
 * @returns {string}
 */
export function getCellDisplay(cell, { isGameOn, forceReveal = false }) {
  let value = ''

  if (cell.isShown || forceReveal) {
    if (cell.isMine) value = MINE
    else if (cell.minesAroundCount) value = String(cell.minesAroundCount)
    else value = EMPTY
  }

  if (cell.isMarked) {
    if (cell.isMine && !isGameOn) {
      value = MINE
    } else {
      value = MARK
    }
  }

  return value
}

/** @param {boolean} isVictory */
export function getGameOverMessage(isVictory) {
  return isVictory ? 'VICTORY' : 'GAME OVER'
}

/**
 * Smiley button face (legacy updated in gameOver / mine hit).
 * @param {import('./types.js').GameMeta} meta
 */
export function getSmileyEmoji(meta) {
  if (meta.isVictory === true) return '😎'
  if (meta.isVictory === false) return '🤯'
  return '😀'
}
