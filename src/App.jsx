import { Board } from './components/Board.jsx'
import { GameControls } from './components/GameControls.jsx'
import { GameOverModal } from './components/GameOverModal.jsx'
import { StatusBar } from './components/StatusBar.jsx'
import { useGameAudio } from './hooks/useAudio.js'
import { useMinesweeper } from './hooks/useMinesweeper.js'
import { useTheme } from './hooks/useTheme.js'
import { useTimer } from './hooks/useTimer.js'

function App() {
  const {
    board,
    meta,
    level,
    remainingMines,
    smiley,
    isPlaying,
    hasStarted,
    canUndo,
    gameOverMessage,
    actions,
    getCellUiState,
  } = useMinesweeper()

  const { darkModeLabel, toggleTheme } = useTheme()
  const elapsedTime = useTimer(meta.isTimerRunning, hasStarted)

  useGameAudio(meta)

  return (
    <>
      <h1>Minesweeper game</h1>

      <div className="controls">
        <GameControls
          level={level}
          safeCount={meta.safeCount}
          hasStarted={hasStarted}
          megaHintIsUsable={meta.megaHintIsUsable}
          canUndo={canUndo}
          smiley={smiley}
          darkModeLabel={darkModeLabel}
          onSetLevelBySize={actions.setLevelBySize}
          onMegaHint={actions.activateMegaHint}
          onSafeClick={actions.useSafeClick}
          onUndo={actions.undo}
          onNewGame={actions.newGame}
          onToggleDark={toggleTheme}
        />

        <StatusBar
          remainingMines={remainingMines}
          elapsedTime={elapsedTime}
          livesCount={meta.livesCount}
          hintsCount={meta.hintsCount}
          hasStarted={hasStarted}
          isHintOn={meta.isHintOn}
          onActivateHint={actions.activateHint}
        />
      </div>

      <GameOverModal message={gameOverMessage} />

      <div className="board-container">
        <Board
          board={board}
          isPlaying={isPlaying}
          getCellUiState={getCellUiState}
          onReveal={actions.revealCell}
          onToggleMark={actions.toggleMark}
        />
      </div>

      <footer>Adi Sabban</footer>
    </>
  )
}

export default App
