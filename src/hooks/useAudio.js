import { useEffect, useRef } from 'react'

const MINE_SOUND_URL = '/sound/explode.wav'
const VICTORY_SOUND_URL = '/sound/victory.wav'

function playSound(url) {
  try {
    const audio = new Audio(url)
    void audio.play()
  } catch {
    // Missing file or autoplay blocked — game still works
  }
}

/**
 * Play mine / victory sounds when meta changes (replaces legacy playSound calls).
 * @param {import('../domain/types.js').GameMeta} meta
 */
export function useGameAudio(meta) {
  const prevMetaRef = useRef(meta)

  useEffect(() => {
    const prev = prevMetaRef.current

    if (meta.shownMinesCount > prev.shownMinesCount) {
      playSound(MINE_SOUND_URL)
    }

    if (meta.isVictory === true && prev.isVictory !== true) {
      playSound(VICTORY_SOUND_URL)
    }

    prevMetaRef.current = meta
  }, [meta])
}
