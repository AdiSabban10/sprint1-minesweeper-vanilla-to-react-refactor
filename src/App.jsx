import { Board } from './components/Board.jsx'
import { GameOverModal } from './components/GameOverModal.jsx'
import { useMinesweeper } from './hooks/useMinesweeper.js'

function App() {
  const {
    board,
    meta,
    remainingMines,
    smiley,
    isPlaying,
    gameOverMessage,
    actions,
    getCellUiState,
  } = useMinesweeper()

  return (
    <>
      <h1>Minesweeper game</h1>

      <div className="controls">
        <div>
          Mines: <span className="mines">{remainingMines}</span>
          {' | '}
          Time: <span className="time">0</span>
        </div>
        <div>
          Lives: <span className="lives">{' ❤'.repeat(meta.livesCount)}</span>
        </div>
        <button
          type="button"
          className="smiley"
          onClick={() => actions.newGame()}
          aria-label="New game"
        >
          {smiley}
        </button>
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
