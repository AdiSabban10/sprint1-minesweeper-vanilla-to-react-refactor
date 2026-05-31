import { getCellDisplay } from '../domain/rules.js'

/**
 * @param {Object} props
 * @param {import('../domain/types.js').Cell} props.cell
 * @param {number} props.row
 * @param {number} props.col
 * @param {boolean} props.isPlaying
 * @param {boolean} props.isPeek
 * @param {boolean} props.isSafeHighlight
 * @param {(row: number, col: number) => void} props.onReveal
 * @param {(row: number, col: number) => void} props.onToggleMark
 */
export function Cell({
  cell,
  row,
  col,
  isPlaying,
  isPeek,
  isSafeHighlight,
  onReveal,
  onToggleMark,
}) {
  const display = getCellDisplay(cell, {
    isGameOn: isPlaying,
    forceReveal: isPeek,
  })

  const classNames = ['cell']
  if (cell.isShown) classNames.push('shown')
  if (cell.isMarked) classNames.push('marked')
  if (isPeek || isSafeHighlight) classNames.push('hint')

  function handleContextMenu(event) {
    event.preventDefault()
    onToggleMark(row, col)
  }

  return (
    <td
      className={classNames.join(' ')}
      onClick={() => onReveal(row, col)}
      onContextMenu={handleContextMenu}
      role="gridcell"
      aria-label={`Cell ${row + 1}, ${col + 1}`}
    >
      {display}
    </td>
  )
}
