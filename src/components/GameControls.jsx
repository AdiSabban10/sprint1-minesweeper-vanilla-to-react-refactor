import { LEVEL_LIST } from '../domain/levels.js'

/**
 * Level buttons — first row in legacy layout.
 */
export function LevelPicker({ level, onSetLevelBySize }) {
  return (
    <div className="level-row">
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
  )
}

/**
 * Mega hint, safe click, undo, dark mode — legacy row before smiley.
 */
export function ActionToolbar({
  safeCount,
  hasStarted,
  megaHintIsUsable,
  isMegaHintOn,
  canUndo,
  darkModeLabel,
  onMegaHint,
  onSafeClick,
  onUndo,
  onToggleDark,
}) {
  const megaDisabled = !hasStarted || !megaHintIsUsable
  const safeDisabled = safeCount === 0

  return (
    <div className="action-row">
      <button
        type="button"
        className={`btn${isMegaHintOn ? ' active' : ''}`}
        disabled={megaDisabled}
        onClick={() => onMegaHint()}
        aria-pressed={isMegaHintOn}
      >
        Mega Hint
      </button>
      <button
        type="button"
        className="btn"
        disabled={safeDisabled}
        onClick={() => onSafeClick()}
      >
        Safe Click- <span className="safe-click">{safeCount}</span>
      </button>
      <button
        type="button"
        className="btn"
        disabled={!canUndo}
        onClick={() => onUndo()}
      >
        UNDO
      </button>
      <button type="button" className="btn" onClick={() => onToggleDark()}>
        {darkModeLabel}
      </button>
    </div>
  )
}
