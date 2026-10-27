import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { makeT, DEFAULT_LANG, LANGUAGE_SELECTOR_ENABLED } from './i18n.js';
import { audio, buttonSoundProps } from './audio.js';
import TopControls from './components/TopControls.jsx';
import MainMenu from './screens/MainMenu.jsx';
import TeacherIntro from './screens/TeacherIntro.jsx';
import Intro from './screens/Intro.jsx';
import Stage1 from './screens/Stage1.jsx';
import Quiz from './screens/Quiz.jsx';
import QuizReport from './screens/QuizReport.jsx';
import Stage2 from './screens/Stage2.jsx';
import classroomBgUrl from './assets/classroom-background.jpg';
import { INTRO_VOICE_SPANS } from './introVoiceTiming.js';
import introTeacherEn1 from './assets/audio/voice/introduction/introduction_teacher_eng_line1.mp3';
import introTeacherEn2 from './assets/audio/voice/introduction/introduction_teacher_eng_line2.mp3';
import introTeacherEn3 from './assets/audio/voice/introduction/introduction_teacher_eng_line3.mp3';
import introTeacherEn4 from './assets/audio/voice/introduction/introduction_teacher_eng_line4.mp3';
import introTeacherEn5 from './assets/audio/voice/introduction/introduction_teacher_eng_line5.mp3';
import introTeacherEn6 from './assets/audio/voice/introduction/introduction_teacher_eng_line6.mp3';
import introTeacherEn7 from './assets/audio/voice/introduction/introduction_teacher_eng_line7.mp3';
import introTeacherEn8 from './assets/audio/voice/introduction/introduction_teacher_eng_line8.mp3';
import introTeacherUr1 from './assets/audio/voice/introduction/introduction_teacher_urdu_line1.mp3';
import introTeacherUr2 from './assets/audio/voice/introduction/introduction_teacher_urdu_line2.mp3';
import introTeacherUr3 from './assets/audio/voice/introduction/introduction_teacher_urdu_line3.mp3';
import introTeacherUr4 from './assets/audio/voice/introduction/introduction_teacher_urdu_line4.mp3';
import introTeacherUr5 from './assets/audio/voice/introduction/introduction_teacher_urdu_line5.mp3';
import introTeacherUr6 from './assets/audio/voice/introduction/introduction_teacher_urdu_line6.mp3';
import introTeacherUr7 from './assets/audio/voice/introduction/introduction_teacher_urdu_line7.mp3';
import introTeacherUr8 from './assets/audio/voice/introduction/introduction_teacher_urdu_line8.mp3';
import introRoboEn1 from './assets/audio/voice/introduction/introduction_robot_eng_line1.mp3';
import introRoboEn2 from './assets/audio/voice/introduction/introduction_robot_eng_line2.mp3';
import introRoboEn3 from './assets/audio/voice/introduction/introduction_robot_eng_line3.mp3';
import introRoboEn4 from './assets/audio/voice/introduction/introduction_robot_eng_line4.mp3';
import introRoboEn5 from './assets/audio/voice/introduction/introduction_robot_eng_line5.mp3';
import introRoboEn6 from './assets/audio/voice/introduction/introduction_robot_eng_line6.mp3';
import introRoboUr1 from './assets/audio/voice/introduction/introduction_robot_urdu_line1.mp3';
import introRoboUr2 from './assets/audio/voice/introduction/introduction_robot_urdu_line2.mp3';
import introRoboUr3 from './assets/audio/voice/introduction/introduction_robot_urdu_line3.mp3';
import introRoboUr4 from './assets/audio/voice/introduction/introduction_robot_urdu_line4.mp3';
import introRoboUr5 from './assets/audio/voice/introduction/introduction_robot_urdu_line5.mp3';
import introRoboUr6 from './assets/audio/voice/introduction/introduction_robot_urdu_line6.mp3';

// Must match the classroom scene durations in App.css (scene-rise /
// scene-drop). The game-frame exit (0.45s) finishes within both.
const SCENE_RISE_MS = 800;
const SCENE_DROP_MS = 600;
const PANEL_EXIT_MS = 450; // game-frame--exiting (panel-exit) in App.css

// Level 1 introduction voice, one recording per turn (assets/audio/voice/
// introduction/). Each speaker's lines are in that speaker's turn order: the
// teacher's 8 play at turns 1, 3, 5, 6, 8, 10, 12, 14 and Robo's 6 at turns
// 2, 4, 7, 9, 11, 13 (matched by order, duration and the pauses between
// sentences, in both languages).
const INTRO_VOICES = {
  en: {
    teacher: [introTeacherEn1, introTeacherEn2, introTeacherEn3, introTeacherEn4,
      introTeacherEn5, introTeacherEn6, introTeacherEn7, introTeacherEn8],
    robo: [introRoboEn1, introRoboEn2, introRoboEn3, introRoboEn4, introRoboEn5, introRoboEn6],
  },
  ur: {
    teacher: [introTeacherUr1, introTeacherUr2, introTeacherUr3, introTeacherUr4,
      introTeacherUr5, introTeacherUr6, introTeacherUr7, introTeacherUr8],
    robo: [introRoboUr1, introRoboUr2, introRoboUr3, introRoboUr4, introRoboUr5, introRoboUr6],
  },
};
// Roman Urdu ('ru') is the same Urdu written in Latin letters, so it uses
// the Urdu recordings.
const INTRO_VOICE_LANG = { en: 'en', ur: 'ur', ru: 'ur' };
// The intro recordings play a little faster than recorded, in every language.
const INTRO_VOICE_RATE = 1.2;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function App() {
  const [langState, setLang] = useState(DEFAULT_LANG);
  // English-only while the language selector is hidden: no stored or browser
  // setting can land on ru/ur — dir is derived from this same value (ltr).
  const lang = LANGUAGE_SELECTOR_ENABLED ? langState : 'en';
  // menu | teacher | levelIntro (Stage 1 start) | lesson (Stage 1) |
  // quiz -> quizTeacher -> quizReport (Stage 1 quiz) | stage2Intro (Stage 2
  // start) | stage (Stage 2 gameplay)
  const [screen, setScreen] = useState('menu');
  // The finished quiz attempt (recorded answers) for the report. Kept apart
  // from Stage 2's training/prediction state.
  const [quizAnswers, setQuizAnswers] = useState([]);
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
  const quizTeacherLines = useMemo(() => [t('quiz.wellDone')], [t]);
  // Level 1 intro conversation: who speaks each turn of introTalk.1..14
  // (T = teacher, R = Robo): machine learning in general first, then cats
  // and dogs, which Robo doesn't know yet.
  const introTurns = useMemo(() => {
    const voices = INTRO_VOICES[INTRO_VOICE_LANG[lang]];
    const spans = INTRO_VOICE_SPANS[INTRO_VOICE_LANG[lang]];
    const spoken = { teacher: 0, robo: 0 }; // lines used so far, per speaker
    return [...'TRTRTTRTRTRTRT'].map((who, i) => {
      const speaker = who === 'R' ? 'robo' : 'teacher';
      const n = spoken[speaker]++;
      return {
        speaker,
        text: t(`introTalk.${i + 1}`),
        voice: voices?.[speaker][n] ?? null,
        voiceSpans: spans?.[speaker][n] ?? null,
      };
    });
  }, [t, lang]);
  // Begin sound factory: the guard ref is only read when the returned
  // handlers run (at event time), so a rapid double press sounds exactly
  // once. Built in useCallback like handleBegin; invoked from event handlers.
  const makeBeginSound = useCallback(
    () => buttonSoundProps({ blocked: () => beginGuardRef.current }),
    [],
  );
  // Fit mode: menu, teacher and the Stage 1 lesson — locks these screens to
  // the dynamic viewport so they can never scroll. Panel screens keep scrolling.
  const fitViewport =
    screen === 'menu' || screen === 'teacher' || screen === 'lesson' || screen === 'quizTeacher';

  // Focus the panel screen's primary control after a transition (the quiz
  // focuses its own question).
  useEffect(() => {
    if (screen === 'levelIntro' || screen === 'quizReport' || screen === 'stage2Intro') {
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

  // Last quiz question answered: the quiz panel drops away, then the teacher
  // rises in the classroom to introduce the report.
  const handleQuizAnswered = useCallback(
    (answers) => {
      if (panelGuardRef.current) return;
      panelGuardRef.current = true;
      audio.playSwoosh();
      setQuizAnswers(answers);
      setPanelExiting(true);
      later(() => {
        setPanelExiting(false);
        panelGuardRef.current = false;
        setScreen('quizTeacher');
      }, PANEL_EXIT_MS);
    },
    [later],
  );

  // Report closed -> Stage 2 start screen: the classroom drops away to reveal
  // the park, then the Stage 2 intro panel enters.
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
    screen === 'levelIntro' ||
    screen === 'quiz' ||
    screen === 'quizReport' ||
    screen === 'stage2Intro' ||
    screen === 'stage';

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
        // Level 1 introduction: the teacher teaches Robo; the student watches.
        <TeacherIntro
          t={t}
          turns={introTurns}
          voiceRate={INTRO_VOICE_RATE}
          finalLabel={t('train.guideContinue')}
          onDone={() => setScreen('levelIntro')}
        />
      )}
      {screen === 'lesson' && (
        // The lesson's last line and its Skip both lead to the quiz.
        <Stage1 t={t} onDone={() => setScreen('quiz')} />
      )}
      {screen === 'quizTeacher' && (
        // Same grounded classroom teacher and rise as the lesson.
        <TeacherIntro
          t={t}
          lines={quizTeacherLines}
          finalLabel={t('quiz.seeResults')}
          className="teacher-screen--lesson"
          onDone={() => setScreen('quizReport')}
        />
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
          {screen === 'quiz' && <Quiz t={t} lang={lang} onFinish={handleQuizAnswered} />}
          {screen === 'quizReport' && (
            <QuizReport t={t} answers={quizAnswers} onContinue={handleQuizComplete} />
          )}
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
