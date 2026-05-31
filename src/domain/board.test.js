import { describe, expect, it } from 'vitest'
import {
  computeNeighborCounts,
  countMinesAround,
  createEmptyBoard,
  patchCell,
  placeMines,
  prepareBoardAfterFirstClick,
  revealCellAndFlood,
  toggleCellMark,
} from './board.js'

function countMinesOnBoard(board) {
  let count = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell.isMine) count++
    }
  }
  return count
}

describe('board', () => {
  it('createEmptyBoard builds a square grid of empty cells', () => {
    const board = createEmptyBoard(4)
    expect(board).toHaveLength(4)
    expect(board[0]).toHaveLength(4)
    expect(board[0][0].isMine).toBe(false)
    expect(board[0][0].minesAroundCount).toBe(0)
  })

  it('countMinesAround counts adjacent mines', () => {
    let board = createEmptyBoard(3)
    board = patchCell(board, 0, 1, { isMine: true })
    board = patchCell(board, 1, 0, { isMine: true })
    expect(countMinesAround(board, 1, 1)).toBe(2)
    expect(countMinesAround(board, 2, 2)).toBe(0)
  })

  it('computeNeighborCounts updates every cell', () => {
    let board = createEmptyBoard(2)
    board = patchCell(board, 0, 0, { isMine: true })
    board = computeNeighborCounts(board)
    expect(board[0][1].minesAroundCount).toBe(1)
    expect(board[1][0].minesAroundCount).toBe(1)
    expect(board[1][1].minesAroundCount).toBe(1)
  })

  it('placeMines never places a mine on the safe first-click cell', () => {
    for (let attempt = 0; attempt < 30; attempt++) {
      const board = placeMines(createEmptyBoard(4), 2, 1, 1)
      expect(board[1][1].isMine).toBe(false)
      expect(countMinesOnBoard(board)).toBe(2)
    }
  })

  it('prepareBoardAfterFirstClick places mines and computes neighbors', () => {
    const board = prepareBoardAfterFirstClick(createEmptyBoard(4), 2, 2, 2)
    expect(board[2][2].isMine).toBe(false)
    expect(countMinesOnBoard(board)).toBe(2)
    expect(board[0][0].minesAroundCount).toBeGreaterThanOrEqual(0)
    expect(board[0][0].minesAroundCount).toBeLessThanOrEqual(8)
  })

  it('revealCellAndFlood expands from an empty cell', () => {
    let board = createEmptyBoard(3)
    board = patchCell(board, 1, 1, { isMine: false, minesAroundCount: 0 })
    const { board: next, revealedCount } = revealCellAndFlood(board, 1, 1)
    expect(revealedCount).toBeGreaterThan(1)
    expect(next[1][1].isShown).toBe(true)
    expect(next[0][0].isShown).toBe(true)
  })

  it('toggleCellMark flips the marked flag', () => {
    const board = toggleCellMark(createEmptyBoard(2), 0, 0)
    expect(board[0][0].isMarked).toBe(true)
    const again = toggleCellMark(board, 0, 0)
    expect(again[0][0].isMarked).toBe(false)
  })
})
