import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { makeT, DEFAULT_LANG, LANGUAGE_SELECTOR_ENABLED } from './i18n.js';
import { audio, buttonSoundProps } from './audio.js';
import TopControls from './components/TopControls.jsx';
import MainMenu from './screens/MainMenu.jsx';
import TeacherIntro from './screens/TeacherIntro.jsx';
import Intro from './screens/Intro.jsx';
import Stage1 from './screens/Stage1.jsx';
import QuizPlaceholder from './screens/QuizPlaceholder.jsx';
import Stage2 from './screens/Stage2.jsx';
import classroomBgUrl from './assets/classroom-background.jpg';

// Must match the classroom scene durations in App.css (scene-rise /
// scene-drop). The game-frame exit (0.45s) finishes within both.
const SCENE_RISE_MS = 800;
const SCENE_DROP_MS = 600;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function App() {
  const [langState, setLang] = useState(DEFAULT_LANG);
  // English-only while the language selector is hidden: no stored or browser
  // setting can land on ru/ur — dir is derived from this same value (ltr).
  const lang = LANGUAGE_SELECTOR_ENABLED ? langState : 'en';
  // menu | teacher | levelIntro (Stage 1 start) | lesson (Stage 1) |
  // quiz (Stage 1) | stage2Intro (Stage 2 start) | stage (Stage 2 gameplay)
  const [screen, setScreen] = useState('menu');
  const [menuExiting, setMenuExiting] = useState(false);
  const [panelExiting, setPanelExiting] = useState(false); // game-frame slide-out
  // Stage 1 classroom layer over the park background: hidden | in | out.
  const [classroom, setClassroom] = useState('hidden');
  const panelGuardRef = useRef(false);
  const timersRef = useRef([]);
  const [blurred, setBlurred] = useState(false); // background blur, latched on Begin
  const [musicOn, setMusicOn] = useState(true);
  const beginGuardRef = useRef(false);
  const frameRef = useRef(null);
  const t = useMemo(() => makeT(lang), [lang]);
  // Begin sound factory: the guard ref is only read when the returned
  // handlers run (at event time), so a rapid double press sounds exactly
  // once. Built in useCallback like handleBegin; invoked from event handlers.
  const makeBeginSound = useCallback(
    () => buttonSoundProps({ blocked: () => beginGuardRef.current }),
    [],
  );
  // Fit mode: menu, teacher and the Stage 1 lesson — locks these screens to
  // the dynamic viewport so they can never scroll. Panel screens keep scrolling.
  const fitViewport = screen === 'menu' || screen === 'teacher' || screen === 'lesson';

  // Focus the panel screen's primary control after a transition.
  useEffect(() => {
    if (screen === 'levelIntro' || screen === 'quiz' || screen === 'stage2Intro') {
      frameRef.current?.querySelector('button')?.focus();
    }
    // Warm the cache so the Stage 1 classroom rises in fully drawn.
    if (screen === 'levelIntro') new Image().src = classroomBgUrl;
  }, [screen]);

  useEffect(() => () => timersRef.current.forEach((id) => window.clearTimeout(id)), []);

  const later = useCallback((fn, ms) => {
    timersRef.current.push(window.setTimeout(fn, prefersReducedMotion() ? 0 : ms));
  }, []);

  // Stage 1 start -> lesson: the panel slides away while the classroom rises
  // over the park. The lesson (and its teacher's rise) mounts only once the
  // classroom has fully arrived; the exited panel stays hidden until then.
  const handleStartLevel = useCallback(() => {
    if (panelGuardRef.current) return;
    panelGuardRef.current = true;
    audio.playButton();
    audio.playSwoosh();
    setPanelExiting(true);
    setClassroom('in');
    later(() => {
      setPanelExiting(false);
      panelGuardRef.current = false;
      setScreen('lesson');
    }, SCENE_RISE_MS);
  }, [later]);

  // Quiz finished (report closed) -> Stage 2 start screen: the classroom drops
  // away to reveal the park, then the Stage 2 intro panel enters.
  // Task 2: the quiz's final report calls this; QuizPlaceholder stands in.
  const handleQuizComplete = useCallback(() => {
    if (panelGuardRef.current) return;
    panelGuardRef.current = true;
    audio.playButton();
    audio.playSwoosh();
    setPanelExiting(true);
    setClassroom('out');
    later(() => {
      setClassroom('hidden');
      setPanelExiting(false);
      panelGuardRef.current = false;
      setScreen('stage2Intro');
    }, SCENE_DROP_MS);
  }, [later]);

  const panelScreen =
    screen === 'levelIntro' || screen === 'quiz' || screen === 'stage2Intro' || screen === 'stage';

  const handleBegin = useCallback(() => {
    if (beginGuardRef.current) return; // rapid double clicks
    beginGuardRef.current = true;
    // Button sound comes from the button's own pointerdown/keyboard handlers
    // (guarded, exactly once) — only the transition sounds play here.
    audio.startMusic();
    audio.playSwoosh();
    setBlurred(true); // background blurs while the menu drops away
    setMenuExiting(true);
    window.setTimeout(
      () => setScreen('teacher'),
      prefersReducedMotion() ? 0 : 600,
    );
  }, []);

  const handleToggleMusic = useCallback(() => {
    setMusicOn((on) => {
      audio.setEnabled(!on);
      return !on;
    });
  }, []);

  return (
    <div className={'app' + (fitViewport ? ' app--fit' : '')} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      <div
        className={'app__bg' + (blurred ? ' app__bg--blurred' : '')}
        aria-hidden="true"
      />
      {classroom !== 'hidden' && (
        <div className={'app__scene app__scene--classroom is-' + classroom} aria-hidden="true" />
      )}
      <TopControls t={t} musicOn={musicOn} onToggleMusic={handleToggleMusic} />
      {screen === 'menu' && (
        <MainMenu
          t={t}
          lang={lang}
          setLang={setLang}
          exiting={menuExiting}
          onBegin={handleBegin}
          beginSound={makeBeginSound}
        />
      )}
      {screen === 'teacher' && (
        <TeacherIntro t={t} onDone={() => setScreen('levelIntro')} />
      )}
      {screen === 'lesson' && (
        // Task 2: onDone is the quiz entry point.
        <Stage1 t={t} onDone={() => setScreen('quiz')} />
      )}
      {panelScreen && (
        <div
          className={
            'game-frame' +
            (screen !== 'stage' ? ' game-frame--intro' : '') +
            (panelExiting ? ' game-frame--exiting' : '')
          }
          ref={frameRef}
        >
          <header className="app-header">
            <h1 className="app-header__title">{t('app.title')}</h1>
          </header>
          {screen === 'levelIntro' && <Intro t={t} copy="intro" onStart={handleStartLevel} />}
          {/* TEMPORARY: Task 2 replaces QuizPlaceholder with the real quiz +
              final report, which must call handleQuizComplete when done. */}
          {screen === 'quiz' && <QuizPlaceholder t={t} onContinue={handleQuizComplete} />}
          {screen === 'stage2Intro' && (
            <Intro
              t={t}
              copy="stage2Intro"
              onStart={() => {
                audio.playButton();
                setScreen('stage');
              }}
            />
          )}
          {screen === 'stage' && <Stage2 t={t} lang={lang} />}
        </div>
      )}
    </div>
  );
}
