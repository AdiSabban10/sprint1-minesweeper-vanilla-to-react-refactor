import { HINT } from '../domain/constants.js'

/**
 * @param {Object} props
 * @param {number} props.remainingMines
 * @param {number} props.elapsedTime Seconds on timer (M9 will drive this live)
 * @param {number} props.livesCount
 * @param {number} props.hintsCount
 * @param {boolean} props.hasStarted
 * @param {boolean} props.isHintOn
 * @param {() => void} props.onActivateHint
 */
export function StatusBar({
  remainingMines,
  elapsedTime,
  livesCount,
  hintsCount,
  hasStarted,
  isHintOn,
  onActivateHint,
}) {
  const hintDisabled = !hasStarted || hintsCount === 0 || isHintOn

  return (
    <>
      <div>
        Mines: <span className="mines">{remainingMines}</span>
        {' | '}
        Time: <span className="time">{elapsedTime}</span>
      </div>
      <div>
        Lives: <span className="lives">{' ❤'.repeat(livesCount)}</span>
        {' | '}
        Hints:{' '}
        <span className={`hints${isHintOn ? ' hints-armed' : ''}`}>
          {Array.from({ length: hintsCount }, (_, index) => (
            <button
              key={index}
              type="button"
              className="hint-click"
              disabled={hintDisabled}
              onClick={() => onActivateHint()}
              aria-label="Activate hint"
            >
              {HINT}
            </button>
          ))}
        </span>
      </div>
    </>
  )
}
