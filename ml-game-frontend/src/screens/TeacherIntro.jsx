// Teacher introduction: asset character slides up, chat bubble with a
// word-by-word typewriter. Next completes/advances; Skip jumps straight to
// the Level 1 start screen. Timers stop cleanly on skip and unmount.
// Optional props let the Stage 1 classroom lesson reuse the same dialogue:
// its own lines, a caption above the text, a label for the final button,
// and a modifier class for its own entrance and layout. Skip and finishing
// the last line both call onDone, exactly once.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { audio, buttonSoundProps } from '../audio.js';
import teacherUrl from '../assets/teacher.png';

const WORD_MS = 110; // per-word typewriter delay

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function TeacherIntro({
  t,
  onDone,
  lines: linesProp,
  caption,
  finalLabel,
  className = '',
}) {
  const defaultLines = useMemo(
    () => [t('teacher.line1'), t('teacher.line2'), t('teacher.line3'), t('teacher.line4')],
    [t],
  );
  const lines = linesProp ?? defaultLines;
  const [lineIndex, setLineIndex] = useState(0);
  const [wordsShown, setWordsShown] = useState(0);
  const [reducedMotion] = useState(prefersReducedMotion);
  const [exiting, setExiting] = useState(false);
  const busyRef = useRef(false);
  const doneTimerRef = useRef(null);
  const nextBtnRef = useRef(null);
  // Sound factory: the busy ref is only read when the returned handlers run
  // (at event time) — silent while the exit transition is running.
  const makeSound = useCallback(
    () => buttonSoundProps({ blocked: () => busyRef.current }),
    [],
  );

  const current = lines[lineIndex];
  const words = useMemo(() => current.split(' '), [current]);
  // Reduced motion: the line is always shown in full; no typing timer runs.
  const shown = reducedMotion ? words.length : wordsShown;
  const typing = shown < words.length;
  const onFinalStep = !typing && lineIndex === lines.length - 1;

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
    if (reducedMotion || exiting || wordsShown >= words.length) return undefined;
    const id = window.setTimeout(() => setWordsShown((n) => n + 1), WORD_MS);
    return () => window.clearTimeout(id);
  }, [reducedMotion, exiting, wordsShown, words.length]);

  // Cleanup any pending exit timer (no updates after unmount).
  useEffect(() => () => window.clearTimeout(doneTimerRef.current), []);

  const finish = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    audio.playSwoosh();
    setExiting(true);
    doneTimerRef.current = window.setTimeout(
      () => onDone(),
      prefersReducedMotion() ? 0 : 600,
    );
  }, [onDone]);

  const handleNext = useCallback(() => {
    if (busyRef.current) return;
    if (shown < words.length) {
      setWordsShown(words.length); // reveal the rest of this line now
      return;
    }
    if (lineIndex < lines.length - 1) {
      setLineIndex((i) => i + 1);
      setWordsShown(0);
      return;
    }
    finish(); // last line done -> Level 1 start screen
  }, [shown, words.length, lineIndex, lines.length, finish]);

  const handleSkip = useCallback(() => {
    if (busyRef.current) return;
    finish();
  }, [finish]);

  return (
    <section
      className={
        'teacher-screen' + (className ? ' ' + className : '') + (exiting ? ' teacher-screen--exiting' : '')
      }
    >
      <div className="teacher-screen__stage">
        <img className="teacher-screen__character" src={teacherUrl} alt="" aria-hidden="true" />
        <div className="teacher-bubble">
          {caption && <p className="teacher-bubble__caption">{caption}</p>}
          {/* Full line for screen readers; animated copy is decorative. */}
          <p className="visually-hidden">{current}</p>
          <p className="teacher-bubble__text" aria-hidden="true">
            {words.slice(0, shown).join(' ')}
            {typing && <span className="teacher-bubble__caret" />}
          </p>
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
        </div>
      </div>
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
    </section>
  );
}
