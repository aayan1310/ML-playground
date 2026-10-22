// Persistent top-right music toggle (physical top-right in every language,
// never mirrored). Rendered by App outside all screens so it survives
// every transition.

import { useMemo } from 'react';
import { buttonSoundProps } from '../audio.js';

export default function TopControls({ t, musicOn, onToggleMusic }) {
  const sound = useMemo(() => buttonSoundProps(), []);
  return (
    <div className="top-controls">
      <button
        type="button"
        className={'music-btn' + (musicOn ? ' music-btn--on' : ' music-btn--off')}
        aria-pressed={musicOn}
        aria-label={t(musicOn ? 'music.on' : 'music.off')}
        title={t(musicOn ? 'music.on' : 'music.off')}
        onPointerDown={sound.onPointerDown}
        onClick={(e) => {
          sound.onClick(e); // keyboard activation (Enter/Space) sound
          onToggleMusic();
        }}
      >
        <span className="music-btn__icon" aria-hidden="true">
          {musicOn ? (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.6 3.3 2.1-2.1-1.4-1.4-2.1 2.1-2.1-2.1-1.4 1.4 2.1 2.1-2.1 2.1 1.4 1.4 2.1-2.1 2.1 2.1 1.4-1.4-2.1-2.1z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
