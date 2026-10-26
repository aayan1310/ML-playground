// Stage 1 theory quiz: 5 random questions from the bank, one at a time,
// inside the translucent game panel. Confirm locks in the selected answer;
// Skip moves on and counts as incorrect. No answer is revealed until the
// final report. Every answer is recorded and handed to onFinish(answers).

import { useCallback, useEffect, useRef, useState } from 'react';
import { buttonSoundProps } from '../audio.js';
import { QUESTION_BANK } from '../quiz/questionBank.js';
import { pickQuiz } from '../quiz/pickQuiz.js';

export default function Quiz({ t, onFinish }) {
  // One attempt: picked once when the quiz opens.
  const [questions] = useState(() => pickQuiz(QUESTION_BANK));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const answersRef = useRef([]);
  // Blocks a second Confirm/Skip until the next question is on screen, so a
  // double-click can never record or skip two questions at once.
  const busyRef = useRef(false);
  const promptRef = useRef(null);
  // Sound factory (as in TeacherIntro): the busy ref is only read when the
  // returned handlers run, at event time.
  const makeSound = useCallback(
    () => buttonSoundProps({ blocked: () => busyRef.current }),
    [],
  );

  const question = questions[index];
  const total = questions.length;

  useEffect(() => {
    busyRef.current = false;
    promptRef.current?.focus({ preventScroll: true });
  }, [index]);

  const record = (selectedKey) => {
    if (busyRef.current) return;
    busyRef.current = true;
    const chosen = question.options.find((o) => o.key === selectedKey) ?? null;
    const correct = question.options.find((o) => o.key === question.correctKey);
    answersRef.current = [
      ...answersRef.current,
      {
        id: question.id,
        prompt: question.prompt,
        explanation: question.explanation,
        selectedText: chosen ? chosen.text : null,
        correctText: correct.text,
        skipped: chosen === null,
        isCorrect: chosen !== null && chosen.key === question.correctKey,
      },
    ];
    if (index + 1 >= total) {
      onFinish(answersRef.current); // stays busy: the quiz is over
      return;
    }
    setSelected(null);
    setIndex((i) => i + 1);
  };

  const promptId = 'quiz-prompt-' + question.id;

  return (
    <section className="screen quiz-screen" aria-label={t('quiz.label')}>
      <div className="quiz-screen__progress">
        <p className="quiz-screen__count">{t('quiz.progress', { current: index + 1, total })}</p>
        <ol className="quiz-screen__dots" aria-hidden="true">
          {questions.map((q, i) => (
            <li
              key={q.id}
              className={
                'quiz-screen__dot' +
                (i < index ? ' is-done' : '') +
                (i === index ? ' is-current' : '')
              }
            />
          ))}
        </ol>
      </div>
      <h2 id={promptId} ref={promptRef} tabIndex={-1} className="quiz-question__prompt">
        {question.prompt}
      </h2>
      <div className="quiz-options" role="radiogroup" aria-labelledby={promptId} key={question.id}>
        {question.options.map((option) => (
          <label
            key={option.key}
            className={'quiz-option' + (selected === option.key ? ' is-selected' : '')}
          >
            <input
              type="radio"
              className="quiz-option__input"
              name={'quiz-' + question.id}
              value={option.key}
              checked={selected === option.key}
              onChange={() => setSelected(option.key)}
            />
            <span className="quiz-option__radio" aria-hidden="true" />
            <span className="quiz-option__text">{option.text}</span>
          </label>
        ))}
      </div>
      <div className="quiz-actions">
        <button
          type="button"
          className="btn btn--primary btn--big quiz-actions__confirm"
          disabled={selected === null}
          onPointerDown={(e) => makeSound().onPointerDown(e)}
          onClick={(e) => {
            makeSound().onClick(e);
            record(selected);
          }}
        >
          {t('quiz.confirm')}
        </button>
        <button
          type="button"
          className="btn btn--ghost quiz-actions__skip"
          onPointerDown={(e) => makeSound().onPointerDown(e)}
          onClick={(e) => {
            makeSound().onClick(e);
            record(null);
          }}
        >
          {t('quiz.skip')}
        </button>
      </div>
    </section>
  );
}
