import teacherUrl from '../assets/teacher.png';

// Stage start screen. `copy` picks the i18n key prefix: 'intro' (Level 1,
// Stage 1 classroom lesson) or 'stage2Intro' (Level 1, Stage 2 gameplay).
export default function Intro({ t, copy = 'intro', onStart }) {
  return (
    <section className="screen intro-screen">
      <h1 className="intro-screen__title">{t(`${copy}.title`)}</h1>
      <p className="intro-screen__stage">{t(`${copy}.stage`)}</p>
      <div className="intro-screen__teacher">
        <img
          className="intro-screen__character"
          src={teacherUrl}
          alt=""
          aria-hidden="true"
        />
        <div className="teacher-bubble intro-screen__bubble">
          <p className="teacher-bubble__text">{t(`${copy}.bubble`)}</p>
        </div>
      </div>
      <p className="intro-screen__text">{t(`${copy}.text`)}</p>
      <button type="button" className="btn btn--primary btn--big" onClick={onStart}>
        {t(`${copy}.start`)}
      </button>
    </section>
  );
}
