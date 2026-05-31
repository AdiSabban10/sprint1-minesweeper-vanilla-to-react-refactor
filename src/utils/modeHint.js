/**
 * User-facing hint while hint / mega-hint modes are armed (legacy had no text; helps React UX).
 * @param {import('../domain/types.js').GameMeta} meta
 * @returns {string | null}
 */
export function getModeHintMessage(meta) {
  if (meta.isHintOn) {
    return 'Hint mode: click a cell to briefly reveal its 3×3 neighborhood.'
  }

  if (meta.isMegaHintOn) {
    if (meta.megaHintLocations.length === 0) {
      return 'Mega Hint: click the first corner of the area to reveal.'
    }
    return 'Mega Hint: click the second corner (must be down and right of the first).'
  }

  return null
}
