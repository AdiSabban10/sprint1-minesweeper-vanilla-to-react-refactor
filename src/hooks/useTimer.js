import { useEffect, useState } from 'react'

/**
 * Elapsed seconds while the game timer is running (legacy used ~37ms interval).
 * Resets when the game has not started; freezes when timer stops (game over).
 *
 * @param {boolean} isTimerRunning From game meta after first click
 * @param {boolean} hasStarted meta.shownCount > 0
 */
export function useTimer(isTimerRunning, hasStarted) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!hasStarted) {
      setElapsedSeconds(0)
      return
    }

    if (!isTimerRunning) return

    const startTime = Date.now()
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime
      setElapsedSeconds(Math.floor(elapsed / 1000))
    }, 37)

    return () => clearInterval(intervalId)
  }, [isTimerRunning, hasStarted])

  return elapsedSeconds
}
