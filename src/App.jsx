import { useMinesweeper } from './hooks/useMinesweeper.js'

function App() {
  const { meta, remainingMines, smiley, actions } = useMinesweeper()

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
        <p className="board-placeholder">
          Board and full controls (levels, hints, undo) — next milestone (M7–M8).
        </p>
      </div>

      <div className="board-container" />

      <footer>Adi Sabban</footer>
    </>
  )
}

export default App
