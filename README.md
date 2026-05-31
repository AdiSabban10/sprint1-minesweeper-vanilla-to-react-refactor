# Minesweeper — Vanilla to React Migration

A full-featured Minesweeper game, refactored from vanilla JavaScript into a modern React application. This repository documents an incremental migration: each milestone is a focused commit you can review in git history.

## Overview

- **Original app:** [`legacy/`](legacy/) — global state, DOM-driven rendering, single `game.js` module.
- **Target app:** `src/` (React + Vite) — pure domain logic separated from UI components.
- **Visual design:** React UI reuses the legacy look ([`legacy/css/app.css`](legacy/css/app.css) → [`src/styles/app.css`](src/styles/app.css)), same class names (`cell`, `shown`, `hint`, etc.).

## Migration status

| Milestone | Status |
|-----------|--------|
| M0 — Archive vanilla under `legacy/` | Done |
| M1 — Vite + React scaffold | Done |
| M2 — Constants, levels, matrix/random utils | Done |
| M3 — Pure board engine (`board.js`) | Done |
| M4 — Rules (`rules.js`) — victory, display, initial state | Done |
| M5 — Reducer (`reducer.js`) + undo / actions | Done |
| M6 — `useMinesweeper` hook | Done |
| M7 — Board, Cell, GameOver modal | Done |
| M8 — GameControls + StatusBar | Done |
| M9+ — Timer, audio, polish | Pending |

## Running the legacy version

Open [`legacy/index.html`](legacy/index.html) in a browser (or serve the `legacy/` folder with any static file server). Paths to `js/` and `css/` are relative inside `legacy/`.

> **Note:** Sound files (`sound/explode.wav`, `sound/victory.wav`) are referenced in code but may need to be added under `legacy/sound/` for audio to work.

## Architecture (target)

```
src/domain/     Pure game logic (board, rules, reducer) — no React imports
src/hooks/      useMinesweeper, timer, theme, audio
src/components/ Board, Cell, controls, modals
legacy/         Original vanilla implementation (reference)
```

## Scripts

From the project root (React app):

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview  # preview production build
```

## Author

Adi Sabban
