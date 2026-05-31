import { Cell } from './Cell.jsx'

/**
 * @param {Object} props
 * @param {import('../domain/types.js').Board} props.board
 * @param {boolean} props.isPlaying
 * @param {(row: number, col: number) => { isPeek: boolean, isSafeHighlight: boolean }} props.getCellUiState
 * @param {(row: number, col: number) => void} props.onReveal
 * @param {(row: number, col: number) => void} props.onToggleMark
 */
export function Board({
  board,
  isPlaying,
  getCellUiState,
  onReveal,
  onToggleMark,
}) {
  return (
    <table role="grid">
      <tbody>
        {board.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((cell, colIdx) => {
              const { isPeek, isSafeHighlight } = getCellUiState(rowIdx, colIdx)

              return (
                <Cell
                  key={`${rowIdx}-${colIdx}`}
                  cell={cell}
                  row={rowIdx}
                  col={colIdx}
                  isPlaying={isPlaying}
                  isPeek={isPeek}
                  isSafeHighlight={isSafeHighlight}
                  onReveal={onReveal}
                  onToggleMark={onToggleMark}
                />
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
