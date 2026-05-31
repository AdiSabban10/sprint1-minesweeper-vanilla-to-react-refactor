/**
 * Difficulty presets — mirrors legacy onLevelClicked + resetGame lives rules.
 * @type {Record<string, import('./types.js').LevelConfig>}
 */
export const LEVELS = {
  beginner: {
    id: 'beginner',
    label: 'Beginner',
    size: 4,
    mines: 2,
    lives: 1,
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    size: 8,
    mines: 14,
    lives: 3,
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    size: 12,
    mines: 32,
    lives: 3,
  },
}

/** Ordered list for UI level buttons */
export const LEVEL_LIST = [LEVELS.beginner, LEVELS.medium, LEVELS.expert]

/**
 * @param {number} size Board dimension (4, 8, or 12)
 * @returns {import('./types.js').LevelConfig}
 */
export function getLevelBySize(size) {
  return LEVEL_LIST.find((level) => level.size === size) ?? LEVELS.beginner
}
