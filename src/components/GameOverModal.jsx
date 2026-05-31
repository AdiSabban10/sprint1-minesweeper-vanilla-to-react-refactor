/**
 * @param {{ message: string | null }} props
 */
export function GameOverModal({ message }) {
  return (
    <div className={`game-over${message ? '' : ' hide'}`}>
      <h3>
        <span className="msg">{message ?? ''}</span>
      </h3>
    </div>
  )
}
