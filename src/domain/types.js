/**
 * @typedef {Object} Cell
 * @property {number} minesAroundCount Neighbor mine count (0–8)
 * @property {boolean} isShown Revealed to the player
 * @property {boolean} isMine
 * @property {boolean} isMarked Flagged by the player
 */

/** @typedef {Cell[][]} Board */

/**
 * @typedef {Object} LevelConfig
 * @property {string} id
 * @property {string} label
 * @property {number} size Rows and columns
 * @property {number} mines
 * @property {number} lives
 */

/**
 * @typedef {Object} Position
 * @property {number} row
 * @property {number} col
 */

/**
 * Game meta-state (board stored separately). Used by reducer in later milestones.
 * @typedef {Object} GameMeta
 * @property {boolean} isOn
 * @property {number} shownCount
 * @property {number} markedCount
 * @property {number} shownMinesCount Mines revealed after hitting them (with lives left)
 * @property {number} livesCount
 * @property {number} hintsCount
 * @property {boolean} isHintOn
 * @property {number} safeCount
 * @property {boolean} isMegaHintOn
 * @property {Position[]} megaHintLocations
 * @property {boolean} megaHintIsUsable
 * @property {boolean} isTimerRunning
 * @property {boolean | null} isVictory null while playing; true/false when game ends
 */

/**
 * @typedef {Object} GameState
 * @property {LevelConfig} level
 * @property {Board} board
 * @property {GameMeta} meta
 */

export {}
