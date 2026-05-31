import { useMinesweeper } from './hooks/useMinesweeper.js'

function App() {
  const { level, meta, remainingMines, smiley, actions } = useMinesweeper()

  return (
    <main className="app">
      <h1>Minesweeper</h1>
      <p className="tagline">
        M6: game state is live via <code>useMinesweeper</code> — board UI comes in
        M7.
      </p>
      <p className="status-preview">
        {smiley} {level.label} · mines left: {remainingMines} · revealed:{' '}
        {meta.shownCount}
      </p>
      <button type="button" onClick={() => actions.newGame()}>
        New game
      </button>
    </main>
  )
}

export default App
