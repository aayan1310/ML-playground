// Friendly guide character (CSS robot placeholder) with a speech bubble.
// Static artwork for Stage 5a; the robot doubles as the reserved training
// visual (no fake scanning/progress animation - the text carries the meaning).

export default function Guide({ message, scanning = false }) {
  return (
    <div className="guide" role="status" aria-live="polite">
      <div className={`guide-robot${scanning ? ' guide-robot--scanning' : ''}`} aria-hidden="true">
        <div className="guide-robot__antenna" />
        <div className="guide-robot__head">
          <div className="guide-robot__eyes">
            <span className="guide-robot__eye" />
            <span className="guide-robot__eye" />
          </div>
          <div className="guide-robot__mouth" />
        </div>
      </div>
      <div className="guide-bubble">
        <p className="guide-bubble__text">{message}</p>
      </div>
    </div>
  );
}
