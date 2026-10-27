# ML Playground: frontend

The React game for ML Playground. See the [project README](../README.md) for
what the game is, how the pieces fit together, and how to run the backend.

React 19, Vite 8, plain CSS, linted with Oxlint.

## Run

```bash
npm install
npm run dev     # http://localhost:5173
```

The backend must be running at `http://localhost:8000`, or set
`VITE_API_BASE` to its address. The backend only accepts requests from
`http://localhost:5173`, so keep the dev server on that port.

## Check

```bash
npm run lint
npm run build
```

## Where things are

| Path | What |
| --- | --- |
| `src/App.jsx` | screen flow, language, intro voice lines |
| `src/screens/` | MainMenu, TeacherIntro (dialogue), Intro, Stage1 (lesson), Quiz, QuizReport, Stage2 (sort, train, predict) |
| `src/components/` | TopControls, StageGuide, TrainSequence (Robo's scan) |
| `src/quiz/` | question bank, Urdu/Roman Urdu translations, picking and scoring |
| `src/i18n.js` | all on-screen text in English, Urdu (`ur`) and Roman Urdu (`ru`) |
| `src/api.js` | calls to the backend |
| `src/audio.js` | music, sound effects and voice lines |
| `src/introVoiceTiming.js` | speech timings of the intro voice lines (generated) |
| `scripts/voice_timing.py` | regenerates `introVoiceTiming.js` (needs ffmpeg) |
