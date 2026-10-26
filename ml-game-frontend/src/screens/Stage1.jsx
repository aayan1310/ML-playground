// Level 1, Stage 1: the classroom theory lesson, as a conversation. Once the
// classroom has risen (App switches the background), the teacher and Robo
// rise in and the teacher teaches Robo the basics of machine learning while
// the student watches - the same TeacherIntro conversation mode as the
// Level 1 introduction (teacher left, Robo right).
// onDone is the quiz entry point; Skip and the last line both lead there,
// never straight to Stage 2.

import { useMemo } from 'react';
import TeacherIntro from './TeacherIntro.jsx';

// Who speaks each turn of lessonTalk.1 ... lessonTalk.24 in i18n.js.
// T = teacher, R = Robo. Six exchanges: machine learning, examples and
// labels, the model, mistakes and checking, good data, then the quiz.
const LESSON_SPEAKERS = 'TRTRT' + 'TRTRT' + 'RTRT' + 'RTRT' + 'RTRT' + 'RT';

export default function Stage1({ t, onDone }) {
  const turns = useMemo(
    () =>
      [...LESSON_SPEAKERS].map((who, i) => ({
        speaker: who === 'R' ? 'robo' : 'teacher',
        text: t(`lessonTalk.${i + 1}`),
      })),
    [t],
  );
  return (
    <TeacherIntro
      t={t}
      onDone={onDone}
      turns={turns}
      finalLabel={t('lesson.toQuiz')}
      className="teacher-screen--lesson"
    />
  );
}
