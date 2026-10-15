# ML Learning Game — Project Plan

## 1. Project Goal

We are building a **2D, web-based educational game that teaches Machine Learning (ML) through gameplay**. The game will connect to the existing **Next.js / React study website**. Development and testing will happen locally first, followed by online deployment.

Supported languages:
- Urdu / Roman Urdu
- English
- The AI teacher will explain concepts using both text and voice.

## 2. Game Experience

Students will be able to:

1. Enter their name.
2. Choose a 2D boy or girl character.
3. Explore the game world and visit learning locations.
4. Ask the AI teacher questions through text or voice.
5. Complete short lessons and missions.
6. Collect and label data.
7. Train an ML model and test its predictions.
8. Understand accuracy and model errors.
9. Earn XP, coins, badges, and progress rewards.
10. View their progress on the study website.

## 3. Initial Game Levels

### Level 1 — The World of AI
Learn the basic differences between AI, Machine Learning, and Deep Learning.

### Level 2 — Data Collector
Collect images and other sample data.

### Level 3 — Data Labeling
Assign correct labels to sample images, such as cats and dogs.

### Level 4 — Train Your First Model
Learn how a model finds patterns from training data.

### Level 5 — Prediction Challenge
Give new examples to a model and check its predictions.

### Level 6 — Accuracy Detective
Understand accuracy, incorrect predictions, training data, and test data.

### Level 7 — Regression Mission
Predict values such as prices or temperatures from numerical data.

### Level 8 — Neural Network Lab
Learn introductory concepts about neural networks and Deep Learning.

### Final Project
The student completes a small ML project and reviews the result.

This is the initial roadmap. Each level will include a lesson, playable activity, hint, quiz, and completion reward.

## 4. Recommended Technology Stack

### Frontend and 2D Game

| Library / Technology | Purpose |
|---|---|
| Next.js | Existing study website and game page |
| React | UI components and character/settings screens |
| TypeScript | Type safety and catching errors earlier |
| Phaser 3 | 2D world, movement, sprites, collisions, and animations |
| @phaserjs/react (if suitable for the project setup) | Helps integrate Phaser with React; otherwise use a simple React client component |
| Tailwind CSS | Menus, dashboards, chat panel, and responsive UI |
| Lucide React | UI icons |

**Important:** Phaser is a game engine; it does not train ML models by itself. A separate Python backend will handle ML exercises.

### Backend and Machine Learning

| Library / Technology | Purpose |
|---|---|
| Python | ML exercises and backend logic |
| FastAPI | API between the frontend and ML engine |
| Uvicorn | Local development server for FastAPI |
| scikit-learn | Beginner-friendly ML models and training |
| NumPy | Numerical calculations |
| Pandas | Handling tabular data |
| Pydantic | API request/response validation |

We will initially use small, safe educational datasets. The game will receive model-training results through the API.

### AI Teacher and Voice

Voice features will be integrated in a separate phase because Urdu speech quality and hardware performance need to be tested.

| Tool / Library | Possible purpose |
|---|---|
| A suitable open-source instruction model, such as a Qwen-family model | Answer student questions and explain concepts in Urdu and English |
| Transformers | Load and run supported language models |
| faster-whisper or Whisper | Speech-to-text; Urdu performance must be tested in practice |
| Piper or another suitable open-source TTS model | Convert text to speech; Urdu support must be verified |
| Web Audio API | Capture and play audio in the browser |
| MediaRecorder API | Record student microphone input with permission |

**Voice note:** Not every open-source TTS model supports Urdu well. We will test Urdu and English samples before choosing a model. ChatGPT-like naturalness and low latency cannot be guaranteed; they depend on the model, streaming setup, and hardware. Local models can avoid API charges but still require computer resources.

### Website Integration and Data

| Technology | Purpose |
|---|---|
| Existing study website authentication | Identify students, if already available |
| Existing database | Store course progress and completed missions |
| PostgreSQL (if a new database is needed) | Store students, progress, scores, and badges |
| REST API | Connect the game with the website/backend |

We will inspect the existing database and authentication before replacing anything.

### Testing and Code Quality

| Tool | Purpose |
|---|---|
| ESLint | Frontend code quality |
| Prettier (optional) | Code formatting |
| Vitest (optional) | Testing React components and utilities |
| Pytest | Testing the Python backend and ML API |
| Git | Track changes and roll back when needed |

## 5. High-Level Architecture

```text
Existing Next.js / React Study Website
                  |
                  v
          Game Page / React UI
                  |
                  v
             Phaser 3
       2D world, player, missions
                  |
          HTTP API requests
                  |
                  v
           FastAPI Backend
             /         \
            v           v
        ML Engine     AI Teacher
      scikit-learn    Open-source LLM
      NumPy/Pandas    STT + TTS
            \           /
             v         v
       Progress / Database
```

This is a logical architecture. The AI teacher and ML training may eventually run as separate services, but the first prototype can use one simple backend.

## 6. Suggested Folder Structure

The actual paths will be adjusted after inspecting the existing website.

```text
study-website/
├── app/
│   └── game/
│       └── page.tsx
├── components/
│   └── game/
│       ├── GameCanvas.tsx
│       ├── CharacterSelect.tsx
│       ├── GameHUD.tsx
│       ├── MissionPanel.tsx
│       └── AITeacherPanel.tsx
├── game/
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── MenuScene.ts
│   │   ├── WorldScene.ts
│   │   └── DataMissionScene.ts
│   ├── entities/
│   │   └── Player.ts
│   └── config.ts
├── public/
│   └── game-assets/
│       ├── characters/
│       ├── backgrounds/
│       ├── tiles/
│       └── audio/
└── ...
```

If the website uses the Pages Router instead of the App Router, the game page path will be adjusted accordingly. If the project is a monorepo, we will follow its existing conventions.

It may be easiest to keep the backend in a separate folder or repository initially:

```text
ml-game-backend/
├── app/
│   ├── main.py
│   ├── api/
│   ├── ml/
│   ├── ai_teacher/
│   └── schemas/
├── tests/
├── requirements.txt
└── README.md
```

## 7. Development Phases

### Phase 1 — Inspect the Existing Project
- Check the website folder and `package.json`.
- Identify the Next.js version and routing system.
- Inspect existing login, database, and styling.
- Avoid overwriting files unnecessarily.

### Phase 2 — Playable 2D Prototype
- Install Phaser and set up a React client component.
- Build the game screen, character selection, and keyboard movement.
- Use temporary or free placeholder assets for testing.
- Run the game in a local browser.

### Phase 3 — World and Missions
- Create AI Lab, Library, Data Center, and ML Playground locations.
- Add mission instructions, hints, quizzes, and rewards.
- Handle game state and progress.

### Phase 4 — Real ML Exercises
- Add a beginner classification example, such as cats versus dogs.
- Teach labels and train/test splits.
- Show model training, predictions, and accuracy.
- Explain incorrect predictions in simple language.

### Phase 5 — Website Integration
- Integrate with existing authentication.
- Save mission progress and scores.
- Display progress on the study dashboard.

### Phase 6 — AI Teacher (Text)
- Support Urdu and English prompts.
- Provide beginner-friendly explanations related to the current lesson.
- Keep AI responses aligned with the learning goals and safety boundaries.
- Test a local model or another available open-source runtime.

### Phase 7 — Voice
- Request microphone permission.
- Add speech-to-text.
- Add Urdu/English text-to-speech.
- Test response time and pronunciation.
- Keep text chat available as a fallback.

### Phase 8 — Polish and Testing
- Improve responsive UI, accessibility, and performance.
- Test frontend and backend.
- Test saving and loading progress.
- Add clear error messages and loading indicators.

### Phase 9 — Deployment
- Stabilize the local setup first.
- Configure frontend/backend hosting and environment variables.
- Review privacy, microphone permissions, and model-hosting costs before public deployment.

## 8. What “Free / Open Source” Means in Practice

- Phaser, React, Next.js, FastAPI, and scikit-learn are open-source tools.
- An open-source model does not guarantee unlimited speed or zero hardware costs on every device.
- Local AI voice and LLMs may require RAM, CPU/GPU, and disk space.
- We will first build the game and a text-based AI teacher, then add voice.
- No paid API will be mandatory. Any optional hosted service and its limits or costs must be made clear in advance.

## 9. Privacy and Safety

- The microphone will only be used with the student's permission.
- Do not permanently store voice recordings without clear permission.
- Do not expose student names or progress publicly.
- If voice cloning is added later, use only the user's own voice or a clearly authorized voice through a consent-based workflow.
- Keep the AI teacher as an educational helper and verify its answers against lesson content.

## 10. First Implementation Step

Open the **existing study website folder** in VS Code. Run these commands one at a time in the terminal:

```powershell
Get-Location
Get-ChildItem
Get-Content package.json
```

These commands will:
- `Get-Location`: show the current folder.
- `Get-ChildItem`: list files and folders.
- `Get-Content package.json`: show project dependencies and scripts.

If `package.json` is not found, the terminal may not be in the project root. Navigate to the correct folder and verify the structure before creating a new project or installing packages.

**Next milestone:** inspect the actual website structure, install Phaser, create the `/game` page, and make the first 2D character move.

---

## Short Project Description

**ML Learning Game** is a 2D web-based educational game that teaches students Machine Learning through interactive missions. It will feature customizable boy/girl characters, an Urdu-English AI teacher, voice interaction, data labeling, model training, prediction challenges, and progress tracking. The game will integrate with the existing Next.js / React study website. The first goal is a locally running playable prototype; the ML backend, AI voice, and online deployment will be added step by step.
