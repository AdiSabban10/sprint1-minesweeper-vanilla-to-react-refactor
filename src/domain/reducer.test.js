import { describe, expect, it } from 'vitest'
import { LEVELS } from './levels.js'
import { hasGameStarted } from './rules.js'
import {
  ACTIONS,
  createReducerState,
  gameActions,
  gameReducer,
} from './reducer.js'

function reveal(state, row, col) {
  return gameReducer(state, gameActions.revealCell(row, col))
}

/** First cell still covered after mines are placed (avoids flaky fixed coordinates). */
function firstHiddenCell(board) {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (!board[row][col].isShown) return { row, col }
    }
  }
  return null
}

describe('reducer', () => {
  it('createReducerState starts with an empty beginner board', () => {
    const state = createReducerState(LEVELS.beginner)
    expect(state.game.level.size).toBe(4)
    expect(state.game.board).toHaveLength(4)
    expect(hasGameStarted(state.game.meta)).toBe(false)
    expect(state.boardHistory).toHaveLength(0)
  })

  it('NEW_GAME resets play and ignores invalid level payloads', () => {
    let state = reveal(createReducerState(LEVELS.beginner), 0, 0)
    const fakeEvent = { type: 'click', target: {} }
    state = gameReducer(state, gameActions.newGame(fakeEvent))
    expect(state.game.board).toHaveLength(4)
    expect(hasGameStarted(state.game.meta)).toBe(false)
    expect(state.game.meta.isTimerRunning).toBe(false)
  })

  it('first REVEAL_CELL places mines, starts timer, and records history', () => {
    const state = reveal(createReducerState(LEVELS.beginner), 0, 0)
    expect(hasGameStarted(state.game.meta)).toBe(true)
    expect(state.game.meta.isTimerRunning).toBe(true)
    expect(state.game.meta.shownCount).toBeGreaterThan(0)
    expect(countMinesOnBoard(state.game.board)).toBe(2)
    expect(state.game.board[0][0].isMine).toBe(false)
    expect(state.boardHistory).toHaveLength(1)
  })

  it('TOGGLE_MARK after start updates markedCount', () => {
    let state = reveal(createReducerState(LEVELS.beginner), 0, 0)
    const hidden = firstHiddenCell(state.game.board)
    expect(hidden).not.toBeNull()
    state = gameReducer(state, gameActions.toggleMark(hidden.row, hidden.col))
    expect(state.game.meta.markedCount).toBe(1)
    expect(state.game.board[hidden.row][hidden.col].isMarked).toBe(true)
  })

  it('ACTIVATE_HINT then REVEAL_CELL uses hint peek without extra history', () => {
    let state = reveal(createReducerState(LEVELS.beginner), 0, 0)
    const historyAfterReveal = state.boardHistory.length
    const hidden = firstHiddenCell(state.game.board)
    expect(hidden).not.toBeNull()
    state = gameReducer(state, gameActions.activateHint())
    expect(state.game.meta.isHintOn).toBe(true)
    state = reveal(state, hidden.row, hidden.col)
    expect(state.game.meta.isHintOn).toBe(false)
    expect(state.peekKind).toBe('hint')
    expect(state.peekCellKeys.length).toBeGreaterThan(0)
    expect(state.boardHistory).toHaveLength(historyAfterReveal)
  })

  it('UNDO restores previous board after two recorded moves', () => {
    let state = reveal(createReducerState(LEVELS.beginner), 0, 0)
    const shownAfterFirst = state.game.meta.shownCount
    const hidden = firstHiddenCell(state.game.board)
    expect(hidden).not.toBeNull()
    state = gameReducer(state, gameActions.toggleMark(hidden.row, hidden.col))
    expect(state.boardHistory.length).toBeGreaterThanOrEqual(2)
    state = gameReducer(state, gameActions.undo())
    expect(state.game.meta.shownCount).toBe(shownAfterFirst)
    expect(state.game.board[hidden.row][hidden.col].isMarked).toBe(false)
  })

  it('SET_LEVEL starts a fresh game at the chosen size', () => {
    const state = gameReducer(
      createReducerState(LEVELS.beginner),
      { type: ACTIONS.SET_LEVEL, size: 8 },
    )
    expect(state.game.level.size).toBe(8)
    expect(state.game.board).toHaveLength(8)
    expect(state.game.level.mines).toBe(14)
  })
})

function countMinesOnBoard(board) {
  let count = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell.isMine) count++
    }
  }
  return count
}
