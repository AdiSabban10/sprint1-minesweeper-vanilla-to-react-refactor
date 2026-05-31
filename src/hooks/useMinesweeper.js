import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { LEVELS } from '../domain/levels.js'
import {
  createReducerState,
  gameActions,
  gameReducer,
  isCellPeekActive,
  isCellSafeHighlight,
} from '../domain/reducer.js'
import {
  getGameOverMessage,
  getRemainingMinesCount,
  getSmileyEmoji,
  hasGameStarted,
  isGameActive,
} from '../domain/rules.js'

/**
 * React bridge to the pure domain reducer.
 * UI components call `actions.*`; they read `board`, `meta`, and derived fields.
 *
 * @param {import('../domain/types.js').LevelConfig} [initialLevel]
 */
export function useMinesweeper(initialLevel = LEVELS.beginner) {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialLevel,
    (level) => createReducerState(level),
  )

  const { game } = state
  const { board, meta, level } = game

  const actions = useMemo(
    () => ({
      newGame: (levelConfig) =>
        dispatch(gameActions.newGame(levelConfig ?? game.level)),
      setLevel: (levelConfig) => dispatch(gameActions.setLevel(levelConfig)),
      setLevelBySize: (size) => dispatch(gameActions.setLevelBySize(size)),
      revealCell: (row, col) => dispatch(gameActions.revealCell(row, col)),
      toggleMark: (row, col) => dispatch(gameActions.toggleMark(row, col)),
      activateHint: () => dispatch(gameActions.activateHint()),
      activateMegaHint: () => dispatch(gameActions.activateMegaHint()),
      useSafeClick: () => dispatch(gameActions.useSafeClick()),
      clearPeek: () => dispatch(gameActions.clearPeek()),
      undo: () => dispatch(gameActions.undo()),
    }),
    [game.level],
  )

  const remainingMines = getRemainingMinesCount(level, meta)
  const smiley = getSmileyEmoji(meta)
  const isPlaying = isGameActive(meta)
  const hasStarted = hasGameStarted(meta)
  const canUndo = isPlaying && state.boardHistory.length >= 2

  const gameOverMessage =
    meta.isVictory === null ? null : getGameOverMessage(meta.isVictory)

  const getCellUiState = useCallback(
    (row, col) => ({
      isPeek: isCellPeekActive(state, row, col),
      isSafeHighlight: isCellSafeHighlight(state, row, col),
    }),
    [state],
  )

  // Legacy used setTimeout on DOM; clear peek / safe highlight after a delay
  useEffect(() => {
    const hasPeek = state.peekCellKeys.length > 0
    const hasSafe = state.safeHighlightKey != null
    if (!hasPeek && !hasSafe) return

    const delayMs = hasPeek && !hasSafe ? 1000 : 2000
    const timerId = setTimeout(() => {
      dispatch(gameActions.clearPeek())
    }, delayMs)

    return () => clearTimeout(timerId)
  }, [state.peekCellKeys, state.safeHighlightKey])

  return {
    /** Full reducer state (game + undo stacks + peek keys) */
    state,
    game,
    board,
    meta,
    level,
    dispatch,
    actions,
    remainingMines,
    smiley,
    isPlaying,
    hasStarted,
    canUndo,
    gameOverMessage,
    getCellUiState,
  }
}
