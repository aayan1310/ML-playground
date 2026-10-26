// Teacher dialogue screen: character(s) slide up, chat bubble with a
// word-by-word typewriter. Next completes/advances; Skip ends the dialogue.
// Timers stop cleanly on skip and unmount. Skip and finishing the last line
// both call onDone, exactly once.
// Two modes:
//  - `lines`: the teacher alone (Stage 1 classroom lesson, quiz report intro),
//    with an optional caption, final-button label and modifier class.
//  - `turns` ([{ speaker: 'teacher' | 'robo', text, voice? }]): a
//    conversation, the teacher on the left and Robo on the right, the bubble
//    on the side of whoever is speaking (Level 1 introduction). A turn's
//    optional `voice` (audio URL) plays with the line, and the text types
//    along with it: from the voice's playback position, across the line's
//    `voiceSpans` (when it is speaking, see introVoiceTiming.js). Next during
//    typing stops the voice; finishing or leaving the screen stops it. If
//    the voice cannot play, the line types at the normal speed instead.
//    `voiceRate` is the voice playback speed (1 = as recorded).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { audio, buttonSoundProps } from '../audio.js';
import teacherUrl from '../assets/teacher.png';
import robotUrl from '../assets/robot.png';

const WORD_MS = 110; // per-word typewriter delay (lines without a voice)
// A voice line that has not started this long after its turn began (blocked
// autoplay, missing file) gives way to normal typing.
const VOICE_START_TIMEOUT_MS = 1500;
const SYNC_MS = 50; // how often a voiced line's text catches up with the voice
// Conversation only: ignore a second click this soon after one was handled,
// so a double-click cannot finish a line and skip the next turn unread.
const TURN_LOCK_MS = 350;
const SENTENCE_END = /[.!?۔؟]$/; // English and Urdu

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Typing plan for a voiced line: groups of words, each typed across its own
// speech spans. When the recording has one span per sentence, each sentence
// gets its span, so the text waits through the pauses between sentences;
// otherwise the whole line is spread over all of the speech.
function makeVoicePlan(words, spans) {
  const sentences = [];
  let group = [];
  words.forEach((word) => {
    group.push(word);
    if (SENTENCE_END.test(word)) {
      sentences.push(group);
      group = [];
    }
  });
  if (group.length) sentences.push(group);
  const groups =
    sentences.length === spans.length
      ? sentences.map((ws, i) => ({ ws, spans: [spans[i]] }))
      : [{ ws: words, spans }];
  return groups.map(({ ws, spans: own }) => {
    let chars = 0;
    const starts = ws.map((word) => {
      const at = chars;
      chars += word.length + 1;
      return at;
    });
    return { starts, chars, spans: own };
  });
}

// How many words have begun to be spoken `time` seconds into the recording
// (by characters, so long words take longer).
function wordsAtTime(plan, time) {
  let shown = 0;
  for (const { starts, chars, spans } of plan) {
    const speech = spans.reduce((sum, [s, e]) => sum + (e - s), 0);
    const spoken = spans.reduce((sum, [s, e]) => sum + Math.min(Math.max(time - s, 0), e - s), 0);
    if (spoken <= 0) break;
    const at = (spoken / speech) * chars;
    const count = starts.filter((start) => start < at).length;
    shown += count;
    if (count < starts.length) break;
  }
  return shown;
}

export default function TeacherIntro({
  t,
  onDone,
  lines,
  turns: turnsProp,
  caption,
  finalLabel,
  className = '',
  voiceRate = 1,
}) {
  const conversation = Boolean(turnsProp);
  const turns = useMemo(
    () => turnsProp ?? lines.map((text) => ({ speaker: 'teacher', text })),
    [turnsProp, lines],
  );
  const [lineIndex, setLineIndex] = useState(0);
  const [wordsShown, setWordsShown] = useState(0);
  const [reducedMotion] = useState(prefersReducedMotion);
  const [exiting, setExiting] = useState(false);
  const [fallbackLine, setFallbackLine] = useState(-1); // voiced line typing without its voice
  const busyRef = useRef(false);
  const doneTimerRef = useRef(null);
  const nextBtnRef = useRef(null);
  const lastClickRef = useRef(0);
  // Sound factory: the busy ref is only read when the returned handlers run
  // (at event time) — silent while the exit transition is running.
  const makeSound = useCallback(
    () => buttonSoundProps({ blocked: () => busyRef.current }),
    [],
  );

  const current = turns[lineIndex].text;
  const speaker = turns[lineIndex].speaker;
  const voice = turns[lineIndex].voice ?? null;
  const voiceSpans = turns[lineIndex].voiceSpans ?? null;
  const words = useMemo(() => current.split(' '), [current]);
  const voicePlan = useMemo(
    () => (voiceSpans ? makeVoicePlan(words, voiceSpans) : null),
    [words, voiceSpans],
  );
  // The timer types lines without a voice, and voiced lines whose voice
  // could not play; otherwise the voice drives the typing (see below).
  const timerTyping = !voice || fallbackLine === lineIndex;
  // Reduced motion: the line is always shown in full; no typing timer runs.
  const shown = reducedMotion ? words.length : wordsShown;
  const typing = shown < words.length;
  const onFinalStep = !typing && lineIndex === turns.length - 1;

  // Focus Next when the screen appears (addendum condition 5). preventScroll:
  // the button is still translated below the fold by the entrance animation,
  // and a plain focus() would scroll the overflow-hidden .app to reach it,
  // making the teacher start mid-screen and then jump.
  useEffect(() => {
    nextBtnRef.current?.focus({ preventScroll: true });
  }, []);

  // Typing timer: one word at a time; reduced motion skips the timer entirely.
  // Stops once the screen is leaving (Skip or the last line finished).
  useEffect(() => {
    if (!timerTyping || reducedMotion || exiting || wordsShown >= words.length) return undefined;
    const id = window.setTimeout(() => setWordsShown((n) => n + 1), WORD_MS);
    return () => window.clearTimeout(id);
  }, [timerTyping, reducedMotion, exiting, wordsShown, words.length]);

  // Cleanup any pending exit timer (no updates after unmount).
  useEffect(() => () => window.clearTimeout(doneTimerRef.current), []);

  // Fetch every voice line up front so each starts without a fetch gap.
  useEffect(() => {
    const cancels = turns.map((turn) => audio.preloadVoice(turn.voice));
    return () => cancels.forEach((cancel) => cancel());
  }, [turns]);

  // Voice: the active turn's line starts with the turn, and every SYNC_MS the
  // text shows the words spoken so far (never fewer than already shown); the
  // whole line once the voice ends. Next during typing pauses the voice,
  // which stops the sync. A voice that never starts hands the line to the
  // timer. Leaving the turn (advance, Skip/finish via `exiting`, unmount)
  // stops exactly this line and its sync, so a stale line can never start,
  // keep playing or type into the next turn - including under Strict Mode's
  // mount/cleanup/mount, where the first line is stopped at once.
  useEffect(() => {
    if (!voice || exiting) return undefined;
    const line = audio.playVoice(voice, voiceRate);
    let started = false;
    let ticker = 0;
    const fallBack = () => {
      if (!started) setFallbackLine(lineIndex);
    };
    const timeout = window.setTimeout(fallBack, VOICE_START_TIMEOUT_MS);
    if (!line) return () => window.clearTimeout(timeout);
    const tick = () => {
      if (line.paused) {
        window.clearInterval(ticker); // stopped (Next, Skip) or ended
        return;
      }
      if (!Number.isFinite(line.duration)) return;
      const plan = voicePlan ?? makeVoicePlan(words, [[0, line.duration]]);
      const spoken = wordsAtTime(plan, line.currentTime);
      setWordsShown((n) => Math.max(n, spoken));
    };
    const onPlaying = () => {
      started = true;
      window.clearInterval(ticker);
      ticker = window.setInterval(tick, SYNC_MS);
    };
    const onEnded = () => setWordsShown(words.length);
    line.addEventListener('playing', onPlaying);
    line.addEventListener('ended', onEnded);
    line.addEventListener('error', fallBack);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(ticker);
      line.removeEventListener('playing', onPlaying);
      line.removeEventListener('ended', onEnded);
      line.removeEventListener('error', fallBack);
      audio.stopVoice(line);
    };
  }, [voice, voiceRate, lineIndex, exiting, words, voicePlan]);

  const finish = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    audio.stopVoice();
    audio.playSwoosh();
    setExiting(true);
    doneTimerRef.current = window.setTimeout(
      () => onDone(),
      prefersReducedMotion() ? 0 : 600,
    );
  }, [onDone]);

  const handleNext = useCallback(() => {
    if (busyRef.current) return;
    if (conversation) {
      const now = Date.now();
      if (now - lastClickRef.current < TURN_LOCK_MS) return;
      lastClickRef.current = now;
    }
    if (shown < words.length) {
      setWordsShown(words.length); // reveal the rest of this line now
      audio.stopVoice(); // and cut its voice; the turn does not advance yet
      return;
    }
    if (lineIndex < turns.length - 1) {
      setLineIndex((i) => i + 1);
      setWordsShown(0);
      return;
    }
    finish(); // last line done
  }, [conversation, shown, words.length, lineIndex, turns.length, finish]);

  const handleSkip = useCallback(() => {
    if (busyRef.current) return;
    finish();
  }, [finish]);

  const nextButton = (
    <button
      ref={nextBtnRef}
      type="button"
      className="btn btn--primary teacher-bubble__next"
      onPointerDown={(e) => makeSound().onPointerDown(e)}
      onClick={(e) => {
        makeSound().onClick(e); // keyboard activation (Enter/Space) sound
        handleNext();
      }}
    >
      {onFinalStep && finalLabel ? finalLabel : t('teacher.next')}
    </button>
  );

  const lineText = (
    <>
      {/* Full line for screen readers; animated copy is decorative. */}
      <p className="visually-hidden">{current}</p>
      <p className="teacher-bubble__text" aria-hidden="true">
        {words.slice(0, shown).join(' ')}
        {typing && <span className="teacher-bubble__caret" />}
      </p>
    </>
  );

  const skipButton = (
    <button
      type="button"
      className="btn btn--ghost teacher-screen__skip"
      onPointerDown={(e) => makeSound().onPointerDown(e)}
      onClick={(e) => {
        makeSound().onClick(e); // keyboard activation (Enter/Space) sound
        handleSkip();
      }}
    >
      {t('teacher.skip')}
    </button>
  );

  const sectionClass =
    'teacher-screen' +
    (conversation ? ' teacher-screen--conversation' : '') +
    (className ? ' ' + className : '') +
    (exiting ? ' teacher-screen--exiting' : '');

  if (conversation) {
    const role = (who) => (speaker === who ? ' is-speaking' : ' is-listening');
    return (
      <section className={sectionClass}>
        <div className="convo">
          <img
            className={'convo__character convo__character--teacher' + role('teacher')}
            src={teacherUrl}
            alt=""
            aria-hidden="true"
          />
          <div className={'convo__slot convo__slot--' + speaker}>
            {/* One bubble that moves to the speaker's side; the button stays
                mounted so keyboard focus is never lost between turns. */}
            <div className={'teacher-bubble convo__bubble convo__bubble--' + speaker}>
              <p className="teacher-bubble__caption convo__name">
                {speaker === 'robo' ? t('convo.roboName') : t('convo.teacherName')}
              </p>
              <div className="convo__line" key={lineIndex}>
                {lineText}
              </div>
              {nextButton}
            </div>
          </div>
          <img
            className={'convo__character convo__character--robo' + role('robo')}
            src={robotUrl}
            alt=""
            aria-hidden="true"
          />
        </div>
        {skipButton}
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      <div className="teacher-screen__stage">
        <img className="teacher-screen__character" src={teacherUrl} alt="" aria-hidden="true" />
        <div className="teacher-bubble">
          {caption && <p className="teacher-bubble__caption">{caption}</p>}
          {lineText}
          {nextButton}
        </div>
      </div>
      {skipButton}
    </section>
  );
}
