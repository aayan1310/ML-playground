import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { audio, buttonSoundProps } from '../audio.js';
import teacherUrl from '../assets/teacher.png';

const WORD_MS = 90;
const EXIT_MS = 600;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// `character` swaps the speaker (e.g. Robo instead of the teacher) and
// `side` places it: 'left' (teacher, enters from the left) or 'right' (Robo,
// enters from the right like everywhere else in the game).
// `finalLabel` replaces the button text on the last line.
export default function StageGuide({
  t,
  dir = 'ltr',
  onFinished,
  lines: linesProp,
  nextLabel,
  finalLabel,
  label,
  character = teacherUrl,
  side = 'left',
}) {
  const defaultLines = useMemo(
    () => [t('stageGuide.line1'), t('stageGuide.line2'), t('stageGuide.line3')],
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
  const makeSound = useCallback(
    () => buttonSoundProps({ blocked: () => busyRef.current }),
    [],
  );

  const current = lines[lineIndex];
  const words = useMemo(() => current.split(' '), [current]);
  const shown = reducedMotion ? words.length : wordsShown;
  const typing = shown < words.length;
  const onFinalStep = !typing && lineIndex === lines.length - 1;

  useEffect(() => {
    nextBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    if (reducedMotion || wordsShown >= words.length) return undefined;
    const id = window.setTimeout(() => setWordsShown((n) => n + 1), WORD_MS);
    return () => window.clearTimeout(id);
  }, [reducedMotion, wordsShown, words.length]);

  useEffect(() => () => window.clearTimeout(doneTimerRef.current), []);

  const finish = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    audio.playSwoosh();
    setExiting(true);
    doneTimerRef.current = window.setTimeout(
      () => onFinished(),
      prefersReducedMotion() ? 0 : EXIT_MS,
    );
  }, [onFinished]);

  const handleNext = useCallback(() => {
    if (busyRef.current) return;
    if (shown < words.length) {
      setWordsShown(words.length);
      return;
    }
    if (lineIndex < lines.length - 1) {
      setLineIndex((i) => i + 1);
      setWordsShown(0);
      return;
    }
    finish();
  }, [shown, words.length, lineIndex, lines.length, finish]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={
        'stage-guide' +
        (side === 'right' ? ' stage-guide--right' : '') +
        (exiting ? ' stage-guide--exiting' : '')
      }
      dir={dir}
      role="dialog"
      aria-modal="true"
      aria-label={label ?? t('stageGuide.label')}
    >
      <div className="stage-guide__blocker" aria-hidden="true" />
      <div className="stage-guide__stage">
        <img className="stage-guide__character" src={character} alt="" aria-hidden="true" />
        <div className="teacher-bubble stage-guide__bubble">
          <p className="visually-hidden" aria-live="polite">
            {current}
          </p>
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
              makeSound().onClick(e);
              handleNext();
            }}
          >
            {onFinalStep && finalLabel ? finalLabel : (nextLabel ?? t('teacher.next'))}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
