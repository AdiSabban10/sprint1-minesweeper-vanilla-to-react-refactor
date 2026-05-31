# Minesweeper — Vanilla to React Migration

A full-featured Minesweeper game, refactored from vanilla JavaScript into a modern React + Vite application. This repository is structured as a progressive migration project: the original game lives under `legacy/`, while `src/` implements the modernized version with a clean separation between pure domain logic and UI components.

Each milestone maps to a focused git commit, providing a transparent, step-by-step history of the architectural decisions and refactoring process.

**Play online:** [https://sprint1-minesweeper-vanilla-to-reac.vercel.app/](https://sprint1-minesweeper-vanilla-to-reac.vercel.app/)

---

## Run locally

```bash
npm install
npm run dev
```

Open **http://localhost:5173**

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Run domain unit tests (Vitest) |
| `npm run test:watch` | Tests in watch mode |

**Legacy version:** open [`legacy/index.html`](legacy/index.html) in a browser (or serve the `legacy/` folder). Audio files live in [`legacy/sound/`](legacy/sound/); the React app uses copies in [`public/sound/`](public/sound/).

---

## Features

- Three difficulty levels (4×4 / 8×8 / 12×12)
- First-click-safe mine placement
- Lives system (1 on Beginner, 3 on Medium/Expert)
- Hints, mega-hint (rectangle peek), safe-click highlight
- Undo, timer, dark mode, mine counter
- Victory / game-over detection (same rules as legacy)
- Sound effects (explosion / victory)

---

## Migration story

### Before (`legacy/`)

- One large [`legacy/js/game.js`](legacy/js/game.js) (~600 lines)
- Global mutable state (`gGame`, `gBoard`, `gLevel`)
- Direct DOM updates (`innerHTML`, `querySelector`, `setInterval`)
- HTML `onclick` handlers wired in [`legacy/index.html`](legacy/index.html)

### After (`src/`)

- **Pure domain layer** — testable functions, no React, no DOM
- **Reducer** — all player actions as `{ type, ... }` transitions
- **React components** — render from state; user input calls `dispatch`
- **Side-effect hooks** — timer, audio, theme, temporary hint highlights

### Why migrate incrementally?

- Safer than a big-bang rewrite
- Git history shows engineering judgment
- Easy to compare behavior against `legacy/` at any time

---

## Architecture

```text
User input (click, buttons)
        ↓
  React components          hooks/useMinesweeper.js  →  useReducer(gameReducer)
        ↓                            ↓
  Board, Cell, Controls      domain/reducer.js
                                    ↓
                             domain/board.js, rules.js
                                    ↓
                             New immutable state → re-render
```

### Folder structure

```text
src/
  domain/           Pure game logic (no React imports)
    board.js        Grid, mines, flood fill
    rules.js        Victory, cell display, initial state
    reducer.js      Actions + undo snapshots
    levels.js       Beginner / Medium / Expert presets
    constants.js    Symbols, timing constants
    types.js        JSDoc data shapes
  hooks/
    useMinesweeper.js   React ↔ reducer bridge
    useTimer.js         Elapsed seconds
    useAudio.js         Mine / victory sounds
    useTheme.js         Dark mode on <body>
    usePeekClear.js     Hint / safe-click timeouts
  components/       Presentational UI
  styles/app.css    Legacy visual design
  utils/            Small helpers (matrix, mode hints)

legacy/             Original vanilla app (reference)
public/sound/       Audio assets for Vite
```

### Data flow (example: left-click a cell)

1. `Cell` calls `actions.revealCell(row, col)`
2. `dispatch({ type: 'REVEAL_CELL', row, col })`
3. `gameReducer` runs `handleRevealCell` (first click → place mines, reveal, check win)
4. React receives new `state` and re-renders the board

---

## Key design decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | `useReducer` | Single game tree; predictable transitions; no Redux boilerplate |
| Domain vs UI | Strict split under `src/domain/` | Testable, framework-agnostic logic; interview-friendly |
| Board updates | Immutable copies | Matches React model; supports undo snapshots |
| Mine placement | Shuffle all cells (not repeated random picks) | Addresses code-review feedback in legacy |
| Styling | Port of `legacy/css/app.css` | Visual continuity; same class names (`cell`, `shown`, `hint`) |
| Type documentation | JSDoc in `types.js` | JavaScript project with documented contracts |
| Hint UX | Short mode messages + yellow highlights | Mega-hint rules are non-obvious; optional improvement over silent legacy |

---

## Milestone map (git history)

| Milestone | Commit focus |
|-----------|----------------|
| M0 | Archive vanilla under `legacy/` |
| M1 | Vite + React scaffold |
| M2 | Constants, levels, matrix/random utils |
| M3 | Pure `board.js` (mines, flood fill) |
| M4 | `rules.js` (victory, display) |
| M5 | `reducer.js` + undo |
| M6 | `useMinesweeper` hook |
| M7 | Board, Cell, GameOver modal |
| M8 | Controls + status bar |
| M9 | Timer, audio |
| M10 | Hint / mega-hint / safe-click parity |
| M11 | CSS + dark mode |
| M12 | This README |
| M13 | Vitest domain tests + GitHub Actions CI |

Browse with: `git log --oneline`

### Tests

Domain logic is covered by Vitest (no React DOM required):

- [`src/domain/board.test.js`](src/domain/board.test.js) — mines, neighbors, flood fill
- [`src/domain/reducer.test.js`](src/domain/reducer.test.js) — actions, undo, hint mode, invalid reset payloads

---

## Refactoring Summary

1. **Problem:** Legacy Minesweeper mixed game rules, DOM, and globals in one file — hard to test and extend.

2. **Approach:** Strangler-style migration — archive original, extract pure functions, introduce a reducer, then rebuild UI in React one milestone at a time.

3. **Highlight:** `reducer.js` centralizes behavior that was scattered across `onCellClicked`, `onCellMarked`, hint handlers, and undo — same features, clearer boundaries.

4. **Trade-off:** Kept JavaScript + JSDoc instead of TypeScript for faster migration; types live in `types.js` and `@param` comments.

5. **Proof:** `legacy/` still runs; React app aims for feature parity with a commit per milestone.

---

## Working with AI on this project

AI was used as a **development partner**, not a black box:

| AI helped with | I owned |
|----------------|---------|
| Scaffolding Vite/React, boilerplate | Milestone boundaries and commit messages |
| Extracting patterns from `legacy/js/game.js` | Verifying game rules (win condition, lives, hints) |
| Reducer/hook structure suggestions | Manual testing, smiley-reset bugfix, layout order vs vanilla |
| README and architecture docs | Final UX choices (mode hints, game-over styling) |

This mirrors real teams: AI accelerates implementation; the developer validates behavior and history.

---

## Known differences from legacy

- React adds brief **hint / mega-hint instructions** (yellow banner) — legacy relied on trial and error.
- **Game over** uses the same `VICTORY` / `GAME OVER` text with slightly enhanced CSS for readability.
- **Dark mode** uses a single `body.dark-mode` class (legacy used `.dark` on buttons and `.dark-mode` on body).

---

## Author

**Adi Sabban**

---

## License

Personal portfolio project. Add a license here if you publish publicly.
