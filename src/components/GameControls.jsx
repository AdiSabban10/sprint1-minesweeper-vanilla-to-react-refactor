import { LEVEL_LIST } from '../domain/levels.js'

/**
 * @param {Object} props
 * @param {import('../domain/types.js').LevelConfig} props.level
 * @param {number} props.safeCount
 * @param {boolean} props.hasStarted
 * @param {boolean} props.megaHintIsUsable
 * @param {boolean} props.canUndo
 * @param {string} props.smiley
 * @param {string} props.darkModeLabel
 * @param {(size: number) => void} props.onSetLevelBySize
 * @param {() => void} props.onMegaHint
 * @param {() => void} props.onSafeClick
 * @param {() => void} props.onUndo
 * @param {() => void} props.onNewGame
 * @param {() => void} props.onToggleDark
 */
export function GameControls({
  level,
  safeCount,
  hasStarted,
  megaHintIsUsable,
  canUndo,
  smiley,
  darkModeLabel,
  onSetLevelBySize,
  onMegaHint,
  onSafeClick,
  onUndo,
  onNewGame,
  onToggleDark,
}) {
  const megaDisabled = !hasStarted || !megaHintIsUsable
  const safeDisabled = safeCount === 0

  return (
    <div className="game-controls">
      <div>
        Game Level:
        {LEVEL_LIST.map((lvl) => (
          <button
            key={lvl.id}
            type="button"
            className="btn level"
            onClick={() => onSetLevelBySize(lvl.size)}
            aria-pressed={level.size === lvl.size}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      <div className="action-row">
        <button
          type="button"
          className="btn"
          disabled={megaDisabled}
          onClick={onMegaHint}
        >
          Mega Hint
        </button>
        <button
          type="button"
          className="btn"
          disabled={safeDisabled}
          onClick={onSafeClick}
        >
          Safe Click- <span className="safe-click">{safeCount}</span>
        </button>
        <button type="button" className="btn" disabled={!canUndo} onClick={onUndo}>
          UNDO
        </button>
        <button type="button" className="btn" onClick={onToggleDark}>
          {darkModeLabel}
        </button>
      </div>

      <button
        type="button"
        className="smiley"
        onClick={onNewGame}
        aria-label="New game"
      >
        {smiley}
      </button>
    </div>
  )
}
