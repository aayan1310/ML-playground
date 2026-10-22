import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { audio, buttonSoundProps } from '../audio.js';
import teacherUrl from '../assets/teacher.png';
import robotUrl from '../assets/robot.png';

// The successful-training sequence. It mounts only after the backend has
// confirmed that training succeeded (Stage2 validates first, then sets the
// training phase), so the robot scan and the teacher praise always run on a
// real model. The failed-validation path never reaches this component: it goes
// straight to the corrective teacher dialogue in Stage2.
const PRAISE_MS = 2000;
const CALL_MS = 2200;
const EXIT_MS = 600; // also the robot's entrance (train-robot-in in App.css)
const MIN_SCAN_MS = 2600;
const COMPLETE_MS = 2600;
const EXPLAIN_MS = 3800;
const SWEEP_MS = 1300; // one pass of the beam across the trays

// Eye centres in robot.png (371x673), measured from the artwork's cyan
// pupils. The image has almost no transparent padding (opaque box 7..353 x
// 12..666), so fractions of the rendered <img> box land on the real eyes.
const EYE_L = { x: 128 / 371, y: 103 / 673 };
const EYE_R = { x: 218 / 371, y: 104 / 673 };

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Convex hull (monotone chain) of [x, y] points, so the cone outline is
// correct whichever direction the trays lie from the robot.
function convexHull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => {
    const out = [];
    for (const p of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop();
      out.push(p);
    }
    out.pop();
    return out;
  };
  return [...half(pts), ...half([...pts].reverse())];
}

export default function TrainSequence({
  t,
  dir = 'ltr',
  onScanStart,
  onScanEnd,
  onContinue,
  scanTargetRef,
}) {
  const [step, setStep] = useState('praise');
  const [reducedMotion] = useState(prefersReducedMotion);
  const continueRef = useRef(null);
  const busyRef = useRef(false);
  const robotImgRef = useRef(null);
  const coneRef = useRef(null);
  const haloRef = useRef(null);
  const gradRef = useRef(null);
  const eyeLRef = useRef(null);
  const eyeRRef = useRef(null);
  const sound = useCallback(() => buttonSoundProps({ blocked: () => busyRef.current }), []);
  const exitMs = reducedMotion ? 0 : EXIT_MS;

  useEffect(() => {
    let id;
    if (step === 'praise') id = window.setTimeout(() => setStep('call'), PRAISE_MS);
    else if (step === 'call') id = window.setTimeout(() => setStep('teacher-exit'), CALL_MS);
    else if (step === 'teacher-exit') id = window.setTimeout(() => setStep('robot-enter'), exitMs);
    // The beam and the tray glow start only once Robo has finished arriving.
    else if (step === 'robot-enter') id = window.setTimeout(() => setStep('scanning'), exitMs);
    else if (step === 'complete') id = window.setTimeout(() => setStep('robot-exit'), COMPLETE_MS);
    else if (step === 'robot-exit') id = window.setTimeout(() => setStep('explain'), exitMs);
    else if (step === 'explain') id = window.setTimeout(() => setStep('teacher-exit-2'), EXPLAIN_MS);
    else if (step === 'teacher-exit-2') id = window.setTimeout(() => setStep('continue'), exitMs);
    return () => window.clearTimeout(id);
  }, [step, exitMs]);

  useEffect(() => {
    if (step !== 'scanning') return undefined;
    onScanStart();
    const startedAt = Date.now();
    let timer;
    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      const remaining = MIN_SCAN_MS - (Date.now() - startedAt);
      if (remaining > 0) {
        timer = window.setTimeout(check, remaining);
        return;
      }
      // The request already succeeded before the scan started; hold the scan
      // for the minimum readable time, then finish.
      onScanEnd();
      setStep('complete');
    };
    check();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [step, onScanStart, onScanEnd]);

  // Eye beam: every frame, measure Robo's eyes and the sorted trays, then
  // draw a cone from the eyes to a stripe that sweeps back and forth across
  // the trays. Slots inside the stripe get .is-scanned (the green glow).
  // Measuring each frame keeps the beam on the eyes and the trays through
  // scrolling and resizing. Reduced motion: no sweep, the cone covers every
  // picture and all of them glow.
  useEffect(() => {
    if (step !== 'scanning') return undefined;
    const target = scanTargetRef?.current;
    const img = robotImgRef.current;
    if (!target || !img) return undefined;
    const box = target.getBoundingClientRect();
    if (box.top < 0 || box.bottom > window.innerHeight) {
      target.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
    }
    const startedAt = performance.now();
    let frame;
    const draw = (now) => {
      const ib = img.getBoundingClientRect();
      const tb = target.getBoundingClientRect();
      const left = [ib.left + ib.width * EYE_L.x, ib.top + ib.height * EYE_L.y];
      const right = [ib.left + ib.width * EYE_R.x, ib.top + ib.height * EYE_R.y];
      const width = reducedMotion ? tb.width : Math.max(tb.width * 0.34, 60);
      // Eased ping-pong: 0 -> 1 -> 0 every 2 * SWEEP_MS, starting at the left.
      const phase = reducedMotion
        ? 0
        : (1 - Math.cos((Math.PI * (now - startedAt)) / SWEEP_MS)) / 2;
      const x0 = tb.left + phase * (tb.width - width);
      const points = convexHull([
        left,
        right,
        [x0, tb.top],
        [x0 + width, tb.top],
        [x0 + width, tb.bottom],
        [x0, tb.bottom],
      ])
        .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
        .join(' ');
      coneRef.current?.setAttribute('points', points);
      haloRef.current?.setAttribute('points', points);
      const grad = gradRef.current;
      if (grad) {
        grad.setAttribute('x1', (left[0] + right[0]) / 2);
        grad.setAttribute('y1', (left[1] + right[1]) / 2);
        grad.setAttribute('x2', x0 + width / 2);
        grad.setAttribute('y2', tb.top + tb.height / 2);
      }
      const eyeR = Math.max(ib.height * 0.035, 5);
      [
        [eyeLRef.current, left],
        [eyeRRef.current, right],
      ].forEach(([el, [x, y]]) => {
        if (!el) return;
        el.setAttribute('cx', x);
        el.setAttribute('cy', y);
        el.setAttribute('r', eyeR);
      });
      target.querySelectorAll('.slot--filled').forEach((slot) => {
        const sb = slot.getBoundingClientRect();
        const cx = sb.left + sb.width / 2;
        slot.classList.toggle('is-scanned', cx >= x0 && cx <= x0 + width);
      });
      frame = window.requestAnimationFrame(draw);
    };
    frame = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frame);
      target.querySelectorAll('.is-scanned').forEach((slot) => slot.classList.remove('is-scanned'));
    };
  }, [step, scanTargetRef, reducedMotion]);

  useEffect(() => {
    if (step === 'continue') continueRef.current?.focus();
  }, [step]);

  if (typeof document === 'undefined') return null;

  const teacherVisible =
    step === 'praise' || step === 'call' || step === 'teacher-exit' ||
    step === 'explain' || step === 'teacher-exit-2';
  const teacherLeaving = step === 'teacher-exit' || step === 'teacher-exit-2';
  const robotVisible =
    step === 'robot-enter' || step === 'scanning' || step === 'complete' || step === 'robot-exit';
  const robotLeaving = step === 'robot-exit';

  const teacherExplaining = step === 'explain' || step === 'teacher-exit-2';
  const teacherText = step === 'praise' ? t('train.praise') : t('train.callRobot');

  return createPortal(
    <div
      className="train-sequence"
      dir={dir}
      role="dialog"
      aria-modal="true"
      aria-label={t('train.sequenceLabel')}
    >
      <div className="train-sequence__blocker" aria-hidden="true" />
      {teacherVisible && (
        <div
          className={
            'train-sequence__actor train-sequence__actor--teacher' +
            (teacherLeaving ? ' is-leaving' : '')
          }
        >
          <img className="train-sequence__character" src={teacherUrl} alt="" aria-hidden="true" />
          <div className="teacher-bubble train-sequence__bubble" aria-live="polite">
            {teacherExplaining ? (
              <>
                <p className="train-sequence__text">{t('train.explain1')}</p>
                <p className="train-sequence__text">{t('train.explain2')}</p>
              </>
            ) : (
              <p className="train-sequence__text">{teacherText}</p>
            )}
          </div>
        </div>
      )}
      {robotVisible && (
        <div
          className={
            'train-sequence__actor train-sequence__actor--robot' +
            (robotLeaving ? ' is-leaving' : '')
          }
        >
          <div
            className="teacher-bubble train-sequence__bubble train-sequence__bubble--robot"
            aria-live="polite"
          >
            <p className="train-sequence__text">
              {step === 'complete' ? t('train.scanComplete') : t('train.scanningLine')}
            </p>
          </div>
          <div className="train-sequence__robot-wrap">
            <img
              ref={robotImgRef}
              className="train-sequence__character train-sequence__character--robot"
              src={robotUrl}
              alt=""
              aria-hidden="true"
            />
          </div>
        </div>
      )}
      {/* Drawn over the robot so the cone visibly leaves its eyes; geometry
          is set every frame by the eye-beam effect above. */}
      {step === 'scanning' && (
        <svg className="train-sequence__beam" aria-hidden="true">
          <defs>
            <linearGradient id="train-beam-fill" ref={gradRef} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#b9fbff" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#5ef2a0" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0.22" />
            </linearGradient>
            <radialGradient id="train-beam-eye">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="45%" stopColor="#7df9ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
            </radialGradient>
            <filter id="train-beam-soften" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>
          <polygon ref={haloRef} className="train-sequence__beam-halo" fill="url(#train-beam-fill)" filter="url(#train-beam-soften)" />
          <polygon ref={coneRef} className="train-sequence__beam-cone" fill="url(#train-beam-fill)" />
          <circle ref={eyeLRef} fill="url(#train-beam-eye)" />
          <circle ref={eyeRRef} fill="url(#train-beam-eye)" />
        </svg>
      )}
      {step === 'continue' && (
        <div className="train-sequence__continue">
          <button
            ref={continueRef}
            type="button"
            className="btn btn--primary train-sequence__continue-btn"
            onPointerDown={(e) => sound().onPointerDown(e)}
            onClick={(e) => {
              sound().onClick(e);
              if (busyRef.current) return;
              busyRef.current = true;
              audio.playSwoosh();
              onContinue();
            }}
          >
            {t('train.guideContinue')}
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}
