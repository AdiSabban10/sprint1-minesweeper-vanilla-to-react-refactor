import { useEffect } from 'react'
import {
  HINT_PEEK_MS,
  MEGA_HINT_PEEK_MS,
  SAFE_CLICK_PEEK_MS,
} from '../domain/constants.js'
import { gameActions } from '../domain/reducer.js'

/**
 * Clears temporary hint / mega-hint / safe-click highlights after legacy timeouts.
 *
 * @param {import('../domain/reducer.js').ReducerState} state
 * @param {React.Dispatch<{ type: string }>} dispatch
 */
export function usePeekClear(state, dispatch) {
  useEffect(() => {
    const hasPeek = state.peekCellKeys.length > 0
    const hasSafe = state.safeHighlightKey != null
    if (!hasPeek && !hasSafe) return

    let delayMs = HINT_PEEK_MS
    if (hasSafe) delayMs = SAFE_CLICK_PEEK_MS
    else if (state.peekKind === 'mega') delayMs = MEGA_HINT_PEEK_MS

    const timerId = setTimeout(() => {
      dispatch(gameActions.clearPeek())
    }, delayMs)

    return () => clearTimeout(timerId)
  }, [
    state.peekCellKeys,
    state.safeHighlightKey,
    state.peekKind,
    dispatch,
  ])
}
