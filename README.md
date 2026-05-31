# Minesweeper — Vanilla to React Migration

A full-featured Minesweeper game, refactored from vanilla JavaScript into a modern React application. This repository documents an incremental migration: each milestone is a focused commit you can review in git history.

## Overview

- **Original app:** [`legacy/`](legacy/) — global state, DOM-driven rendering, single `game.js` module.
- **Target app:** `src/` (React + Vite) — pure domain logic separated from UI components.

## Migration status

| Milestone | Status |
|-----------|--------|
| M0 — Archive vanilla under `legacy/` | Done |
| M1 — Vite + React scaffold | Done |
| M2+ — Domain, UI, styling | Pending |

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
