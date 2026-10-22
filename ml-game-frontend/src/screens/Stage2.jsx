// Level 1, Stage 2 (shown to the player; Stage 1 is the classroom lesson).
// Round 1: sort 1 cat + 1 dog -> train -> 1 prediction with a mandatory
// reveal -> the teacher explains why one example each is not enough.
// Round 2: sort 5 + 5 from a fresh pool -> train -> the round-1 picture is
// predicted again automatically and compared -> 2 more free predictions ->
// completion summary. Counts come from the backend's per-stage config;
// every model action hits the real backend (docs/data-contract.md).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as api from '../api.js';
import { buttonSoundProps } from '../audio.js';
import StageGuide from '../components/StageGuide.jsx';
import TrainSequence from '../components/TrainSequence.jsx';
import teacherUrl from '../assets/teacher.png';
import robotUrl from '../assets/robot.png';

const LEVEL_ID = '1';
// Each round uses the backend stage of the same number: round 1 -> stage 1
// (1 per category, 1 prediction), round 2 -> stage 2 (5 per category, 3
// predictions). The player sees both rounds as Stage 2.
const LAST_ROUND = 2;
const DEFAULT_CATEGORIES = ['cat', 'dog'];
const TRAIN_COOLDOWN_MS = 2000;
const LEAVE_MS = 450;
// Matches the robot/teacher slide-in duration in App.css (train-robot-in /
// train-teacher-in plus the bubble fade-in delay).
const CHAR_ENTER_MS = 620;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function makeLoadError(e) {
  return { code: e?.code ?? 'network', isNetwork: e instanceof api.NetworkError };
}

function validatePayload(setup, pool, stage) {
  const ok =
    setup &&
    Array.isArray(setup.categories) &&
    setup.categories.length === 2 &&
    Array.isArray(setup.stage_totals_per_category) &&
    Number.isInteger(setup.stage_totals_per_category[stage - 1]) &&
    Array.isArray(setup.predictions_per_stage) &&
    Number.isInteger(setup.predictions_per_stage[stage - 1]) &&
    Array.isArray(setup.test_images) &&
    setup.test_images.length >= setup.predictions_per_stage[stage - 1] &&
    Array.isArray(pool?.candidates) &&
    pool.candidates.length === setup.categories.length * setup.candidates_per_category &&
    pool.candidates.every((c) => typeof c?.id === 'string' && typeof c?.url === 'string');
  if (!ok) throw new api.ApiError('invalid_payload', 'Stage data failed validation.', 500);
}

function CategoryTray({ t, category, slots, wrongIds, onRemove, onDropImage, disabled, sound }) {
  const titleKey = category === 'cat' ? 'category.cats' : 'category.dogs';
  const mascot = category === 'cat' ? '\u{1F431}' : '\u{1F436}';
  const filled = slots.filter(Boolean).length;
  return (
    <section
      className={'tray tray--' + category}
      aria-label={t(titleKey)}
      onDragOver={(e) => {
        if (!disabled) e.preventDefault();
      }}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (id) onDropImage(id, category);
      }}
    >
      <header className="tray__header">
        <span className="tray__mascot" aria-hidden="true">{mascot}</span>
        <h2 className="tray__title">{t(titleKey)}</h2>
        <span className="tray__counter">{t('sort.slots', { filled, total: slots.length })}</span>
      </header>
      <ul className="tray__slots">
        {slots.map((imageId, i) => {
          if (!imageId) {
            return (
              <li key={i} className="slot slot--empty" aria-label={t('sort.emptySlotLabel')}>
                <span className="slot__placeholder">{t('sort.emptySlot')}</span>
              </li>
            );
          }
          const wrong = wrongIds.includes(imageId);
          return (
            <li key={i} className={'slot slot--filled' + (wrong ? ' is-wrong' : '')}>
              <button
                type="button"
                className="slot__remove"
                disabled={disabled}
                onPointerDown={sound.onPointerDown}
                onClick={(e) => {
                  sound.onClick(e);
                  onRemove(imageId);
                }}
                aria-label={t('sort.imageAlt', { id: imageId }) + ' - ' + t('sort.remove')}
              >
                <img src={api.imageUrl('images/' + imageId + '.jpg')} alt="" draggable={false} />
                <span className="slot__badge" aria-hidden="true">x</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Stage2({ t, lang = 'en' }) {
  const sound = useMemo(() => buttonSoundProps(), []);
  // Plays the button sound for keyboard activation and runs the action; for
  // pointer presses the sound already fired on pointerdown, so onClick's
  // detail guard keeps it at exactly one sound per action.
  const soundClick = (action) => (e) => {
    sound.onClick(e);
    action();
  };
  const [phase, setPhase] = useState('loading');
  const [round, setRound] = useState(1);
  // Round-1 prediction, kept so round 2 can re-test the same picture and
  // compare: { testId, category, percent, match, trueCategory }.
  const [firstResult, setFirstResult] = useState(null);
  // 'intro' | 'help' | 'wrong' (sorting) | 'retry' | 'compare' (predicting)
  const [guide, setGuide] = useState('intro');
  const [leaving, setLeaving] = useState(false);
  const leaveTimerRef = useRef(null);
  const cooldownTimerRef = useRef(null);
  const attemptActiveRef = useRef(false);
  const attemptTokenRef = useRef(0);
  const traysRef = useRef(null); // the robot's eye beam aims at these
  const finishGuide = useCallback(() => setGuide(null), []);
  const [reloadToken, setReloadToken] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [setup, setSetup] = useState(null);
  const [candidates, setCandidates] = useState([]);

  const [placements, setPlacements] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [wrongIds, setWrongIds] = useState([]);
  const [notice, setNotice] = useState(null);
  const [trainBusy, setTrainBusy] = useState(false);
  const [trainCooldown, setTrainCooldown] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [stageLocked, setStageLocked] = useState(false);
  const [sortError, setSortError] = useState(null);
  const [modelId, setModelId] = useState(null);

  const [testImages, setTestImages] = useState([]);
  const [usedIds, setUsedIds] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [revealResult, setRevealResult] = useState(null);
  const [predictBusy, setPredictBusy] = useState(null);
  const [predictError, setPredictError] = useState(null);
  const [results, setResults] = useState([]);
  // Character-led prediction flow. 'ready' = pick + Ask model; 'robo' = the
  // robot slides in and speaks its prediction; 'teacher' = the teacher slides
  // in and reveals the true answer; then the next prediction resets to 'ready'.
  const [predictStep, setPredictStep] = useState('ready');
  // True once the current character's entrance animation has settled, so the
  // follow-up button only becomes available after the character has arrived.
  const [charReady, setCharReady] = useState(false);
  const charSettleRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const setupData = await api.getSetup(LEVEL_ID);
        const pool = await api.getPool(LEVEL_ID, round, []);
        if (cancelled) return;
        validatePayload(setupData, pool, round);
        setSetup(setupData);
        setCandidates(pool.candidates);
        setTestImages(setupData.test_images);
        setPhase('sorting');
      } catch (e) {
        if (cancelled) return;
        setLoadError(makeLoadError(e));
        setPhase('loadError');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadToken, round]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setSelectedId(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(
    () => () => {
      attemptTokenRef.current += 1;
      window.clearTimeout(leaveTimerRef.current);
      window.clearTimeout(cooldownTimerRef.current);
      window.clearTimeout(charSettleRef.current);
    },
    [],
  );

  // Gate the follow-up button on the character entrance finishing: when the
  // robot or teacher arrives, wait for its slide-in (immediately when the user
  // prefers reduced motion) before enabling the next step. charReady is reset in
  // the handlers that switch predictStep, so this effect only schedules the
  // reveal-to-true.
  useEffect(() => {
    window.clearTimeout(charSettleRef.current);
    if (predictStep !== 'robo' && predictStep !== 'teacher') return undefined;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    charSettleRef.current = window.setTimeout(
      () => setCharReady(true),
      reduced ? 0 : CHAR_ENTER_MS,
    );
    return () => window.clearTimeout(charSettleRef.current);
  }, [predictStep]);


  // Both come from the backend's per-stage config for the current round.
  const slotTotal = setup?.stage_totals_per_category?.[round - 1] ?? 1;
  const predictionsPerStage = setup?.predictions_per_stage?.[round - 1] ?? 1;
  // Round 2 starts by re-testing the round-1 picture; it stays locked in.
  const fixedPickActive = round === LAST_ROUND && firstResult !== null && usedIds.length === 0;
  const categories = setup?.categories ?? DEFAULT_CATEGORIES;

  const placedIdsByCategory = useMemo(() => {
    const byCat = Object.fromEntries(categories.map((c) => [c, []]));
    for (const [id, cat] of Object.entries(placements)) {
      if (byCat[cat]) byCat[cat].push(id);
    }
    return byCat;
  }, [placements, categories]);

  const poolImages = useMemo(
    () => candidates.filter((c) => !(c.id in placements)),
    [candidates, placements],
  );

  const filledCount = Object.keys(placements).length;
  const neededCount = slotTotal * categories.length - filledCount;

  const place = useCallback(
    (id, category) => {
      if (trainBusy || stageLocked) return;
      if (id in placements) return;
      if ((placedIdsByCategory[category] ?? []).length >= slotTotal) {
        setNotice(t('sort.boxFull'));
        return;
      }
      setNotice(null);
      setSortError(null);
      setWrongIds((prev) => prev.filter((w) => w !== id));
      setPlacements((prev) => ({ ...prev, [id]: category }));
      setSelectedId((cur) => (cur === id ? null : cur));
    },
    [trainBusy, stageLocked, placements, placedIdsByCategory, slotTotal, t],
  );

  const removeFromSlot = useCallback(
    (id) => {
      if (trainBusy || stageLocked) return;
      setPlacements((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [trainBusy, stageLocked],
  );

  const resetStage = useCallback(() => {
    if (trainBusy || stageLocked) return;
    setPlacements({});
    setSelectedId(null);
    setWrongIds([]);
    setNotice(null);
    setSortError(null);
  }, [trainBusy, stageLocked]);

  const sortedReady = categories.every((c) => (placedIdsByCategory[c] ?? []).length === slotTotal);

  // Guides the failed-validation path: the teacher shows the corrective
  // dialogue once, with its own Next button, and the bottom bar names the
  // wrong pictures that remain highlighted. No robot, no scan, no overlay.
  const showWrongGuide = useCallback((ids) => {
    setWrongIds(ids);
    setSelectedId(null);
    setSortError(null);
    setGuide('wrong');
  }, []);

  const handleTrain = useCallback(() => {
    if (attemptActiveRef.current || trainBusy || trainCooldown || stageLocked || !sortedReady) return;
    attemptActiveRef.current = true;
    const token = (attemptTokenRef.current += 1);
    setScanning(false);
    setTrainCooldown(true);
    window.clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = window.setTimeout(
      () => setTrainCooldown(false),
      TRAIN_COOLDOWN_MS,
    );
    setTrainBusy(true);
    setSortError(null);
    setNotice(null);
    // Validate + train with the real backend. The robot scan lives entirely on
    // the success path: a validation failure never mounts the training overlay
    // or the robot. It goes straight to the corrective teacher dialogue.
    const choices = Object.entries(placements).map(([id, category]) => ({ id, category }));
    (async () => {
      try {
        const res = await api.train(LEVEL_ID, round, choices);
        if (attemptTokenRef.current !== token) return;
        setModelId(res.model_id);
        setWrongIds([]);
        setSelectedId(null);
        setStageLocked(true);
        setPhase('training');
      } catch (e) {
        if (attemptTokenRef.current !== token) return;
        attemptActiveRef.current = false;
        setTrainBusy(false);
        if (e instanceof api.ApiError && e.code === 'wrong_labels' && Array.isArray(e.detail?.wrong_ids)) {
          showWrongGuide(e.detail.wrong_ids);
        } else {
          setSortError(makeLoadError(e));
        }
      }
    })();
  }, [trainBusy, trainCooldown, stageLocked, sortedReady, placements, showWrongGuide, round]);

  // Called once the robot actually starts scanning. The training request has
  // already succeeded by this point, so this only drives the visual scan.
  const startScanning = useCallback(() => setScanning(true), []);

  const handleScanEnd = useCallback(() => setScanning(false), []);

  const handleSequenceDone = useCallback(() => {
    attemptActiveRef.current = false;
    setScanning(false);
    setTrainBusy(false);
    const enterPredicting = () => {
      setPhase('predicting');
      // Round 2 re-tests the round-1 picture first: pre-select it and let the
      // teacher introduce it before Robo predicts.
      if (round === LAST_ROUND && firstResult) {
        setSelectedTestId(firstResult.testId);
        setGuide('compare');
      }
    };
    if (prefersReducedMotion()) {
      enterPredicting();
      return;
    }
    setLeaving(true);
    leaveTimerRef.current = window.setTimeout(() => {
      setLeaving(false);
      enterPredicting();
    }, LEAVE_MS);
  }, [round, firstResult]);

  const handleAsk = useCallback(async () => {
    if (!selectedTestId || !modelId || predictBusy) return;
    if (usedIds.length + (prediction ? 1 : 0) >= predictionsPerStage) return;
    setPredictBusy('predict');
    setPredictError(null);
    try {
      const res = await api.predict(LEVEL_ID, modelId, selectedTestId);
      setPrediction(res);
      setCharReady(false);
      setPredictStep('robo');
    } catch (e) {
      setPredictError(makeLoadError(e));
    } finally {
      setPredictBusy(null);
    }
  }, [selectedTestId, modelId, predictBusy, usedIds.length, prediction, predictionsPerStage]);

  // The teacher asked Robo about the fixed picture: Robo answers on its own
  // (the same real /predict call the Ask button makes; the picture was
  // selected when the screen opened). If it fails, Ask stays available.
  const beginFixedPrediction = useCallback(() => {
    setGuide(null);
    handleAsk();
  }, [handleAsk]);

  // After the round-1 explanation: back to sorting with a fresh stage-2 pool
  // and 5 slots per box. The load effect refetches when `round` changes.
  const startNextRound = useCallback(() => {
    setGuide(null);
    setPlacements({});
    setSelectedId(null);
    setWrongIds([]);
    setNotice(null);
    setSortError(null);
    setStageLocked(false);
    setModelId(null);
    setUsedIds([]);
    setResults([]);
    setSelectedTestId(null);
    setPrediction(null);
    setRevealResult(null);
    setPredictError(null);
    setPredictStep('ready');
    setCandidates([]);
    setPhase('loading');
    setRound(LAST_ROUND);
  }, []);

  const handleReveal = useCallback(async () => {
    if (!selectedTestId || !modelId || predictBusy) return;
    setPredictBusy('reveal');
    setPredictError(null);
    try {
      const res = await api.reveal(LEVEL_ID, modelId, selectedTestId);
      setRevealResult(res);
      setCharReady(false);
      setPredictStep('teacher');
    } catch (e) {
      setPredictError(makeLoadError(e));
    } finally {
      setPredictBusy(null);
    }
  }, [selectedTestId, modelId, predictBusy]);

  const handleNextRound = useCallback(() => {
    if (!revealResult || !prediction || !selectedTestId) return;
    const roundResult = {
      testId: selectedTestId,
      predicted: prediction.category,
      trueCategory: revealResult.true_category,
      match: revealResult.match,
    };
    const nextResults = [...results, roundResult];
    const nextUsed = [...usedIds, selectedTestId];
    setResults(nextResults);
    setUsedIds(nextUsed);
    setSelectedTestId(null);
    setPrediction(null);
    setRevealResult(null);
    setPredictError(null);
    setPredictStep('ready');
    if (nextUsed.length < predictionsPerStage) return;
    if (round < LAST_ROUND) {
      // End of round 1: remember the result, then the teacher explains why
      // one example each is not enough and sends the player back to sort.
      setFirstResult({
        testId: roundResult.testId,
        category: roundResult.predicted,
        percent: Math.round(prediction.confidence * 100),
        match: roundResult.match,
        trueCategory: roundResult.trueCategory,
      });
      setGuide('retry');
    } else {
      setPhase('complete');
    }
  }, [revealResult, prediction, selectedTestId, results, usedIds, predictionsPerStage, round]);

  if (phase === 'loadError') {
    return (
      <section className="screen">
        <h1 className="screen__title">{t('error.title')}</h1>
        <p className="error-panel__text">
          {loadError?.isNetwork ? t('error.connection') : t('error.title')}
        </p>
        {loadError?.code && !loadError.isNetwork && (
          <p className="error-panel__code">{t('error.code', { code: loadError.code })}</p>
        )}
        <button
          type="button"
          className="btn btn--primary"
          onPointerDown={sound.onPointerDown}
          onClick={soundClick(() => {
            setLoadError(null);
            setPhase('loading');
            setReloadToken((n) => n + 1);
          })}
        >
          {t('error.retry')}
        </button>
      </section>
    );
  }

  if (phase === 'loading' || !setup) {
    return (
      <section className="screen screen--center" aria-busy="true">
        <div className="spinner" aria-hidden="true" />
        <p className="loading-text">{t('loading.stage')}</p>
      </section>
    );
  }

  if (phase === 'complete') {
    const right = results.filter((r) => r.match).length;
    return (
      <section className="screen">
        <div className="panel complete-panel">
          <h2 className="panel__title">{t('complete.title')}</h2>
          <p className="complete-panel__score">{t('complete.score', { right, total: results.length })}</p>
          <p>{t('complete.lesson')}</p>
          <p className="complete-panel__note">{t('complete.stageNote')}</p>
          <p className="complete-panel__end">{t('complete.end')}</p>
        </div>
      </section>
    );
  }

  if (phase === 'predicting') {
    const completedPredictions = Math.min(
      usedIds.length + (prediction ? 1 : 0),
      predictionsPerStage,
    );
    const lastPrediction = usedIds.length + 1 >= predictionsPerStage;
    // Teacher dialogue on this screen: why round 1 was weak, or the intro to
    // re-testing the same picture in round 2.
    let predictGuideLines = null;
    let onPredictGuideDone = null;
    if (guide === 'retry' && firstResult) {
      predictGuideLines = [
        firstResult.match
          ? t('retry.right', { percent: firstResult.percent })
          : t('retry.wrong', {
              percent: firstResult.percent,
              category: t('category.' + firstResult.trueCategory),
            }),
        t('retry.why'),
        t('retry.again', { count: setup.stage_totals_per_category[LAST_ROUND - 1] }),
        t('retry.better'),
      ];
      onPredictGuideDone = startNextRound;
    } else if (guide === 'compare') {
      predictGuideLines = [t('compare.intro'), t('compare.ask')];
      onPredictGuideDone = beginFixedPrediction;
    }
    // Round 2's first reveal compares with the round-1 guess on the same picture.
    const comparing =
      round === LAST_ROUND && firstResult !== null && selectedTestId === firstResult.testId;
    let compareLine = null;
    if (comparing && revealResult && prediction) {
      const now = Math.round(prediction.confidence * 100);
      const params = {
        category: t('category.' + revealResult.true_category),
        before: firstResult.percent,
        now,
      };
      if (!revealResult.match) compareLine = t('compare.stillWrong', params);
      else if (!firstResult.match) compareLine = t('compare.fixed', params);
      else if (now > firstResult.percent) compareLine = t('compare.moreSure', params);
      else compareLine = t('compare.sameRight', params);
    }
    return (
      <section className="screen predict-screen">
        {predictGuideLines && (
          <StageGuide
            key={guide}
            t={t}
            dir={lang === 'ur' ? 'rtl' : 'ltr'}
            onFinished={onPredictGuideDone}
            lines={predictGuideLines}
            label={t('stageGuide.label')}
            nextLabel={t('teacher.next')}
          />
        )}
        <header className="predict-header">
          <h2 className="predict-header__title">{t('predict.title')}</h2>
          <p className="predict-header__intro">{t('predict.intro')}</p>
          {completedPredictions > 0 && (
            <p className="predict-header__round">
              {t('predict.round', { current: completedPredictions, total: predictionsPerStage })}
            </p>
          )}
        </header>
        <div className="predict-pool">
          <ul className="test-grid" aria-label={t('predict.pick')}>
            {testImages.map((img) => {
              const isUsed = usedIds.includes(img.id);
              const isCurrent = img.id === selectedTestId;
              return (
                <li key={img.id} className="test-grid__item">
                  <button
                    type="button"
                    className={
                      'image-card' + (isCurrent ? ' is-selected' : '') + (isUsed ? ' is-used' : '')
                    }
                    disabled={
                      isUsed ||
                      Boolean(predictBusy) ||
                      predictStep !== 'ready' ||
                      fixedPickActive ||
                      guide !== null
                    }
                    aria-pressed={isCurrent}
                    onPointerDown={sound.onPointerDown}
                    onClick={soundClick(() => {
                      setSelectedTestId(img.id);
                      setPrediction(null);
                      setRevealResult(null);
                      setPredictError(null);
                      setPredictStep('ready');
                    })}
                  >
                    <img
                      src={api.imageUrl('images/' + img.id + '.jpg')}
                      alt={t('sort.imageAlt', { id: img.id })}
                      draggable={false}
                    />
                    {isUsed && <span className="image-card__mark">{t('predict.used')}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        {selectedTestId && (
          <figure className="predict-preview">
            <img
              src={api.imageUrl('images/' + selectedTestId + '.jpg')}
              alt={t('sort.imageAlt', { id: selectedTestId })}
              draggable={false}
            />
          </figure>
        )}
        {predictStep === 'robo' && prediction && (
          createPortal(
            <div className="predict-characters">
              <div
                className="predict-actor predict-actor--robo"
                role="status"
                aria-live="polite"
                aria-label={t('predict.roboLabel')}
              >
                <div className="teacher-bubble predict-bubble predict-bubble--robo">
                  <p className="predict-bubble__text">
                    {t('predict.roboLine', {
                      category: t('category.' + prediction.category),
                      percent: Math.round(prediction.confidence * 100),
                    })}
                  </p>
                  <div className="predict-bubble__meter">
                    <div
                      className="confidence-bar"
                      role="img"
                      aria-label={t('predict.confidence', {
                        percent: Math.round(prediction.confidence * 100),
                      })}
                    >
                      <div
                        className="confidence-bar__fill"
                        style={{ width: Math.round(prediction.confidence * 100) + '%' }}
                      />
                    </div>
                    <p className="predict-bubble__confidence">
                      {t('predict.confidence', {
                        percent: Math.round(prediction.confidence * 100),
                      })}
                    </p>
                  </div>
                </div>
                <img className="predict-actor__character" src={robotUrl} alt="" aria-hidden="true" />
              </div>
            </div>,
            document.body,
          )
        )}
        {predictStep === 'teacher' && revealResult && prediction && (
          createPortal(
            <div className="predict-characters">
              <div
                className="predict-actor predict-actor--teacher"
                role="status"
                aria-live="polite"
                aria-label={t('predict.teacherLabel')}
              >
                <img className="predict-actor__character" src={teacherUrl} alt="" aria-hidden="true" />
                <div
                  className={
                    'teacher-bubble predict-bubble predict-bubble--teacher predict-bubble--' +
                    (revealResult.match ? 'right' : 'wrong')
                  }
                >
                  <p className="predict-bubble__text">
                    {compareLine ??
                      (revealResult.match
                        ? t('predict.teacherRight', {
                            category: t('category.' + revealResult.true_category),
                          })
                        : t('predict.teacherWrong', {
                            category: t('category.' + revealResult.true_category),
                            percent: Math.round(prediction.confidence * 100),
                          }))}
                  </p>
                  {compareLine && (
                    <p className="predict-bubble__text">
                      {t('compare.next', { count: predictionsPerStage - 1 })}
                    </p>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        )}
        <div className="predict-actions">
          <button
            type="button"
            className={
              'btn predict-progress-btn ' +
              (predictStep === 'robo' ? 'btn--reveal' : 'btn--primary')
            }
            disabled={
              (predictStep === 'ready' && !selectedTestId) ||
              (predictStep !== 'ready' && !charReady) ||
              Boolean(predictBusy) ||
              guide !== null
            }
            onPointerDown={sound.onPointerDown}
            onClick={soundClick(
              predictStep === 'robo'
                ? handleReveal
                : predictStep === 'teacher'
                  ? handleNextRound
                  : handleAsk,
            )}
          >
            {predictStep === 'robo'
              ? predictBusy === 'reveal'
                ? t('predict.revealing')
                : t('predict.reveal')
              : predictStep === 'teacher'
                ? lastPrediction
                  ? round < LAST_ROUND
                    ? t('predict.continue')
                    : t('predict.finish')
                  : t('predict.askNext')
                : predictBusy === 'predict'
                  ? t('predict.thinking')
                  : t('predict.ask')}
          </button>
        </div>
        {predictError && (
          <div className="error-panel" role="alert">
            <p className="error-panel__text">
              {predictError.isNetwork ? t('error.connection') : t('error.title')}
            </p>
            <p className="error-panel__code">{t('error.code', { code: predictError.code })}</p>
            <p className="error-panel__hint">{t('error.retryHint')}</p>
          </div>
        )}
      </section>
    );
  }

  // phase is 'sorting' or 'training'
  const isBusy = phase === 'training' || trainBusy;
  const guideActive = guide !== null;
  const controlsLocked = isBusy || stageLocked || leaving || guideActive;
  const guideLines =
    guide === 'help'
      ? [t('help.line1'), t('help.line2'), t('help.line3')]
      : guide === 'wrong'
        ? [t('train.guideWrong1'), t('train.guideWrong2')]
        : undefined;
  const guideLabel = guide === 'help' ? t('help.label') : t('stageGuide.label');
  const guideNextLabel = guide === 'help' ? t('help.done') : t('teacher.next');
  return (
    <section className="screen">
      {guideActive && (
        <StageGuide
          t={t}
          dir={lang === 'ur' ? 'rtl' : 'ltr'}
          onFinished={finishGuide}
          lines={guideLines}
          label={guideLabel}
          nextLabel={guideNextLabel}
        />
      )}
      {phase === 'training' && trainBusy && (
        <TrainSequence
          t={t}
          dir={lang === 'ur' ? 'rtl' : 'ltr'}
          onScanStart={startScanning}
          onScanEnd={handleScanEnd}
          onContinue={handleSequenceDone}
          scanTargetRef={traysRef}
        />
      )}
      <div
        className={
          'stage-live' +
          (leaving ? ' stage-live--leaving' : '') +
          (scanning ? ' stage-live--scanning' : '')
        }
        inert={guideActive || leaving || trainBusy || undefined}
      >
        <div className="stage-topbar">
          <p className="stage-header">{t('sort.header')}</p>
          <button
            type="button"
            className="btn btn--ghost help-button"
            disabled={controlsLocked}
            onPointerDown={sound.onPointerDown}
            onClick={soundClick(() => setGuide('help'))}
          >
            {t('help.button')}
          </button>
        </div>
        <p className="stage-instruction">
          {round === 1 ? t('sort.instruction') : t('sort.instructionRetry', { count: slotTotal })}
        </p>
        <div className="sort-layout">
          <section className="panel pool-panel" aria-label={t('sort.poolTitle')}>
            <header className="pool-panel__header">
              <h2 className="pool-panel__title">{t('sort.poolTitle')}</h2>
              <span className="pool-panel__count">{t('sort.unsorted', { count: poolImages.length })}</span>
            </header>
            <ul className="pool-grid">
              {poolImages.map((img) => {
                const isSelected = img.id === selectedId;
                return (
                  <li key={img.id} className="pool-grid__item">
                    <button
                      type="button"
                      className={'image-card' + (isSelected ? ' is-selected' : '')}
                      draggable={!controlsLocked}
                      aria-pressed={isSelected}
                      disabled={controlsLocked}

                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', img.id);
                        setSelectedId(img.id);
                      }}
                      onPointerDown={sound.onPointerDown}
                      onClick={soundClick(() => setSelectedId(isSelected ? null : img.id))}
                    >
                      <img
                        src={api.imageUrl('images/' + img.id + '.jpg')}
                        alt={t('sort.imageAlt', { id: img.id })}
                        draggable={false}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="pool-panel__actions">
              <p className="pool-panel__hint" aria-live="polite">
                {selectedId ? t('sort.selectedHint') : ''}
              </p>
              <button
                type="button"
                className="btn btn--cat"
                disabled={!selectedId || controlsLocked}
                onPointerDown={sound.onPointerDown}
                onClick={soundClick(() => place(selectedId, 'cat'))}
              >
                {t('sort.toCats')}
              </button>
              <button
                type="button"
                className="btn btn--dog"
                disabled={!selectedId || controlsLocked}
                onPointerDown={sound.onPointerDown}
                onClick={soundClick(() => place(selectedId, 'dog'))}
              >
                {t('sort.toDogs')}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                disabled={!selectedId || controlsLocked}
                onPointerDown={sound.onPointerDown}
                onClick={soundClick(() => setSelectedId(null))}
              >
                {t('sort.deselect')}
              </button>
            </div>
          </section>
          <div className="trays" ref={traysRef}>
            {categories.map((category) => {
              const ids = placedIdsByCategory[category] ?? [];
              const slots = Array.from({ length: slotTotal }, (_, i) => ids[i] ?? null);
              return (
                <CategoryTray
                  key={category}
                  t={t}
                  category={category}
                  slots={slots}
                  wrongIds={wrongIds}
                  onRemove={removeFromSlot}
                  onDropImage={place}
                  disabled={controlsLocked}
                  sound={sound}
                />
              );
            })}
          </div>
        </div>
        <div className="train-bar">
          {isBusy ? (
            <p className="train-bar__status" aria-live="polite">
              {t('train.scanning')}
            </p>
          ) : (
            <>
              <p className="train-bar__status" aria-live="polite">
                {wrongIds.length > 0
                  ? t('sort.wrongTitle', { count: wrongIds.length }) + ' ' + t('sort.wrongBody')
                  : neededCount > 0
                    ? t('sort.trainNeedMore', { count: neededCount })
                    : t('sort.trainReady')}
              </p>
              <div className="train-bar__buttons">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onPointerDown={sound.onPointerDown}
                  onClick={soundClick(resetStage)}
                  disabled={filledCount === 0 || controlsLocked}
                >
                  {t('sort.reset')}
                </button>
                <button
                  type="button"
                  className="btn btn--train"
                  onPointerDown={sound.onPointerDown}
                  onClick={(e) => {
                    sound.onClick(e);
                    handleTrain();
                  }}
                  disabled={!sortedReady || controlsLocked || trainCooldown}
                >
                  {t('sort.train')}
                </button>
              </div>
            </>
          )}
          {notice && (
            <p className="train-bar__notice" role="alert">
              {notice}
            </p>
          )}
          {sortError && (
            <div className="error-panel" role="alert">
              <p className="error-panel__text">
                {sortError.isNetwork ? t('error.connection') : t('error.title')}
              </p>
              <p className="error-panel__code">{t('error.code', { code: sortError.code })}</p>
              <button
                type="button"
                className="btn btn--primary"
                disabled={controlsLocked || trainCooldown}
                onPointerDown={sound.onPointerDown}
                onClick={(e) => {
                  sound.onClick(e);
                  handleTrain();
                }}
              >
                {t('error.retry')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
