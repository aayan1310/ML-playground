// Stage 1 quiz report: score and counts computed from the recorded answers,
// then a review of every missed (wrong or skipped) question with the right
// answer and why. Continue goes on to the Stage 2 start screen.

import { scoreQuiz } from '../quiz/pickQuiz.js';

export default function QuizReport({ t, answers, onContinue }) {
  const score = scoreQuiz(answers);
  const missed = answers.filter((a) => !a.isCorrect);

  return (
    <section className="screen quiz-report">
      <h2 className="quiz-report__title">{t('report.title')}</h2>
      <p className="quiz-report__score">
        {t('report.score', { score: score.correct, total: score.total })}
      </p>
      <ul className="quiz-report__stats">
        <li className="quiz-report__stat quiz-report__stat--correct">
          {t('report.correct', { count: score.correct })}
        </li>
        <li className="quiz-report__stat quiz-report__stat--incorrect">
          {t('report.incorrect', { count: score.incorrect })}
        </li>
        <li className="quiz-report__stat quiz-report__stat--skipped">
          {t('report.skipped', { count: score.skipped })}
        </li>
      </ul>
      {missed.length === 0 ? (
        <p className="quiz-report__all">{t('report.allCorrect')}</p>
      ) : (
        <>
          <h3 className="quiz-report__review-title">{t('report.reviewTitle')}</h3>
          <ol className="quiz-review">
            {missed.map((a) => (
              <li key={a.id} className="quiz-review__item">
                <p className="quiz-review__prompt">{a.prompt}</p>
                <p className="quiz-review__yours">
                  {a.skipped
                    ? t('report.skippedAnswer')
                    : t('report.yourAnswer', { answer: a.selectedText })}
                </p>
                <p className="quiz-review__correct">
                  {t('report.correctAnswer', { answer: a.correctText })}
                </p>
                <p className="quiz-review__why">{a.explanation}</p>
              </li>
            ))}
          </ol>
        </>
      )}
      <button type="button" className="btn btn--primary btn--big" onClick={onContinue}>
        {t('report.continue')}
      </button>
    </section>
  );
}
