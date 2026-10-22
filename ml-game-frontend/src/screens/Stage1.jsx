// Level 1, Stage 1: the classroom theory lesson. The teacher rises into the
// classroom scene (App switches the background) and explains the basics of
// machine learning through the same typewriter dialogue as TeacherIntro.
// onDone is the quiz entry point (Task 2); Skip and the last line both lead
// there, never straight to Stage 2.

import { useMemo } from 'react';
import TeacherIntro from './TeacherIntro.jsx';

const LESSON_LINE_COUNT = 14; // lesson.line1 ... lesson.line14 in i18n.js

export default function Stage1({ t, onDone }) {
  const lines = useMemo(
    () => Array.from({ length: LESSON_LINE_COUNT }, (_, i) => t(`lesson.line${i + 1}`)),
    [t],
  );
  return (
    <TeacherIntro
      t={t}
      onDone={onDone}
      lines={lines}
      caption={t('lesson.stage')}
      finalLabel={t('lesson.toQuiz')}
      className="teacher-screen--lesson"
    />
  );
}
