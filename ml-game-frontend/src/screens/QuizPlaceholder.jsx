// TEMPORARY quiz entry point for Stage 1 (Task 2 replaces this screen with
// the real quiz, scoring and report). It only explains that the quiz is on
// its way and moves the player on to Stage 2; there are no fake questions.

import teacherUrl from '../assets/teacher.png';

export default function QuizPlaceholder({ t, onContinue }) {
  return (
    <section className="screen intro-screen">
      <h1 className="intro-screen__title">{t('quizPlaceholder.title')}</h1>
      <p className="intro-screen__stage">{t('lesson.stage')}</p>
      <div className="intro-screen__teacher">
        <img
          className="intro-screen__character"
          src={teacherUrl}
          alt=""
          aria-hidden="true"
        />
        <div className="teacher-bubble intro-screen__bubble">
          <p className="teacher-bubble__text">{t('quizPlaceholder.text')}</p>
        </div>
      </div>
      <button type="button" className="btn btn--primary btn--big" onClick={onContinue}>
        {t('quizPlaceholder.continue')}
      </button>
    </section>
  );
}
