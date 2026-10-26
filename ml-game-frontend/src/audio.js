// App-level audio controller: one shared music element + UI sound effects.
// Short SFX are fetched and decoded into AudioBuffers at app load so button
// presses play instantly (the old HTMLAudioElement path needed a fetch +
// decode inside the click, which is what made presses feel delayed).
// Survives screen changes because it is a module singleton (not React state).

import buttonSfxUrl from './assets/audio/button_press_sound.mp3';
import swooshSfxUrl from './assets/audio/menu_swoosh_sound.mp3';
import musicUrl from './assets/audio/background_music.mp3';

class AudioController {
  constructor() {
    this.enabled = true;
    this._music = null; // lazy: created on first start/toggle after a user gesture
    this._voice = null; // the one dialogue voice line playing, if any

    // Fallback path: pre-created Audio elements (used when Web Audio is
    // unavailable or decoding fails). Kept intentionally.
    this._sfx = {
      button: new Audio(buttonSfxUrl),
      swoosh: new Audio(swooshSfxUrl),
    };
    this._sfx.button.preload = 'auto';
    this._sfx.swoosh.preload = 'auto';
    this._sfx.swoosh.volume = 0.5;

    // Fast path: one AudioContext created at load (suspended until the first
    // user gesture resumes it), buffers decoded in the background.
    this._ctx = null;
    this._buffers = {}; // name -> { buffer, volume }
    const AudioCtx =
      typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;
    if (AudioCtx) {
      try {
        this._ctx = new AudioCtx();
        this._loadBuffer('button', buttonSfxUrl, 1);
        this._loadBuffer('swoosh', swooshSfxUrl, 0.5);
      } catch {
        this._ctx = null; // fallback path stays in charge
      }
    }
  }

  _loadBuffer(name, url, volume) {
    fetch(url)
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(res.status))))
      .then((ab) => this._ctx.decodeAudioData(ab))
      .then((buffer) => {
        this._buffers[name] = { buffer, volume };
      })
      .catch(() => {
        /* keep the Audio-element fallback for this sound */
      });
  }

  _ensureMusic() {
    if (!this._music) {
      this._music = new Audio(musicUrl);
      this._music.loop = true;
      this._music.volume = 0.3;
      this._music.preload = 'auto';
    }
    return this._music;
  }

  /** Called on Begin Lesson (user gesture satisfies autoplay policies). */
  startMusic() {
    if (!this.enabled) return;
    const m = this._ensureMusic();
    m.play().catch(() => {});
  }

  setEnabled(on) {
    this.enabled = on;
    if (!this._music) return;
    if (on) this._music.play().catch(() => {});
    else this._music.pause(); // paused, not reset: toggling on resumes
  }

  _playBuffer(name) {
    const ctx = this._ctx;
    const entry = this._buffers[name];
    if (!ctx || !entry) return false;
    try {
      // resume() is called first, inside the user-gesture handler; the source
      // starts at the context's current time, which only advances once the
      // context is running — so playback begins the moment it unlocks, with
      // nothing lost and no added latency.
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const source = ctx.createBufferSource();
      source.buffer = entry.buffer;
      const gain = ctx.createGain();
      gain.gain.value = entry.volume;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Voice lines (dialogue narration): a single channel, so starting a line
   * always stops the previous one and two lines can never overlap. Not tied
   * to the music toggle. Failures (missing file, autoplay refusal) are
   * swallowed so the dialogue keeps working without sound.
   * Returns the element so the caller can stop exactly its own line.
   * `rate` speeds the line up (or slows it down) without changing the
   * voice's pitch, where the browser supports that.
   */
  playVoice(url, rate = 1) {
    this.stopVoice();
    if (!url) return null;
    try {
      const voice = new Audio(url);
      voice.preservesPitch = true;
      voice.webkitPreservesPitch = true; // older Safari
      // Both: loading the file resets playbackRate to defaultPlaybackRate.
      voice.defaultPlaybackRate = rate;
      voice.playbackRate = rate;
      this._voice = voice;
      voice.play().catch(() => {
        if (this._voice === voice) this._voice = null;
      });
      return voice;
    } catch {
      this._voice = null;
      return null;
    }
  }

  /** Stops the current voice line (only if it is `voice`, when given). */
  stopVoice(voice) {
    const current = this._voice;
    if (!current || (voice && voice !== current)) return;
    this._voice = null;
    try {
      current.pause();
      current.currentTime = 0;
    } catch {
      /* ignore */
    }
  }

  /**
   * Warms the browser cache so a voice line can start without a fetch gap,
   * and reports the line's length (seconds) to `onDuration` once known.
   * Returns a cancel function that stops the report.
   */
  preloadVoice(url, onDuration) {
    if (!url) return () => {};
    try {
      const el = new Audio();
      el.preload = 'auto';
      const report = () => {
        if (onDuration && Number.isFinite(el.duration)) onDuration(el.duration);
      };
      el.addEventListener('loadedmetadata', report);
      el.src = url;
      return () => el.removeEventListener('loadedmetadata', report);
    } catch {
      return () => {};
    }
  }

  playButton() {
    if (!this._playBuffer('button')) this._replay(this._sfx.button);
  }

  playSwoosh() {
    if (!this._playBuffer('swoosh')) this._replay(this._sfx.swoosh);
  }

  _replay(sound) {
    try {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    } catch {
      /* ignore */
    }
  }
}

export const audio = new AudioController();

/**
 * Returns event props that play the button sound exactly once per action:
 *  - pointerdown: mouse/touch/pen, primary button only (button === 0),
 *    skipped when the target button is disabled or `blocked()` reports a
 *    guard is blocking the action (called at event time);
 *  - click: only keyboard activation (detail === 0, e.g. Enter/Space) —
 *    pointer activations already sounded on pointerdown, so a press+release
 *    (or rapid double press) can never produce two button sounds.
 */
export function buttonSoundProps({ blocked } = {}) {
  const allowed = (e) => {
    const el = e.currentTarget;
    if (el && typeof el === 'object' && 'disabled' in el && el.disabled) return false;
    if (blocked && blocked()) return false;
    return true;
  };
  return {
    onPointerDown: (e) => {
      if (e.button !== 0) return; // primary button only
      if (!allowed(e)) return;
      audio.playButton();
    },
    onClick: (e) => {
      if (e.detail !== 0) return; // pointer clicks already sounded on pointerdown
      if (!allowed(e)) return;
      audio.playButton();
    },
  };
}

// Free the audio device when the tab goes away.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (audio._music) audio._music.pause();
  });
}
