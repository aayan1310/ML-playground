// Builds one quiz attempt from the question bank: `count` different
// questions in random order, each with its four answers shuffled. The
// correct answer is tracked by option key, never by position, so the
// shuffle can never mark the wrong option as correct.

export const QUESTIONS_PER_QUIZ = 5;

// Fisher-Yates shuffle on a copy; `random` is injectable for testing.
function shuffled(items, random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickQuiz(bank, count = QUESTIONS_PER_QUIZ, random = Math.random) {
  if (bank.length < count) {
    throw new Error(`Question bank has ${bank.length} questions; the quiz needs ${count}.`);
  }
  return shuffled(bank, random)
    .slice(0, count)
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      explanation: q.explanation,
      correctKey: 'correct',
      options: shuffled(
        [
          { key: 'correct', text: q.correct },
          ...q.wrong.map((text, i) => ({ key: 'wrong' + i, text })),
        ],
        random,
      ),
    }));
}

// Score from the recorded answers (never stored separately).
export function scoreQuiz(answers) {
  const correct = answers.filter((a) => a.isCorrect).length;
  const skipped = answers.filter((a) => a.skipped).length;
  return {
    total: answers.length,
    correct,
    skipped,
    incorrect: answers.length - correct - skipped,
  };
}
