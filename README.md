# InterviewerAI - Phase 1 MVP

An AI-driven technical interview preparation tool built with a **FastAPI** Python backend and a **React (Vite)** frontend using **Tailwind CSS**, **Framer Motion**, and custom-coded **Aceternity UI** components.

## Features (Phase 1)
- **Interactive Setup**: Configure the interview subject, topic, and grading difficulty level.
- **Guided Interview Flow**: Answer 5 topic-specific technical questions step-by-step.
- **Aceternity UI Premium Styling**: Grid background, custom glowing card components, hover border gradients, and an animated multi-step loading experience.
- **Evaluation Report**: Instantly review overall scores and detailed AI-generated feedback per question.

---

## Getting Started

### 1. Backend Setup (FastAPI)
Navigate to the `backend` folder, set up your Python virtual environment, install requirements, and run the FastAPI server:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```
The server will start on [http://127.0.0.1:8000](http://127.0.0.1:8000).

*Note: Create a `.env` file from `.env.example` if integrating LLM APIs in the future.*

### 2. Frontend Setup (React + Vite)
Navigate to the `frontend` folder, install the npm modules, and start the development server:

```bash
cd frontend
npm install
npm run dev
```
The Vite development server will start, typically on [http://localhost:5173](http://localhost:5173).

---

## Folder Structure
```
ai-interviewer/
├── backend/
│   ├── .env.example
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── components/
│       │   └── ui/
│       │       ├── GlowingCard.jsx
│       │       ├── GridBackground.jsx
│       │       ├── HoverBorderGradient.jsx
│       │       └── MultiStepLoader.jsx
│       └── lib/
│           └── utils.js
└── README.md
```

## Custom Components
- **`GridBackground`**: Interactive styling providing a layout structure with radial background glow and subtle grid patterns.
- **`HoverBorderGradient`**: Custom button wrapper rendering dynamic glowing transitions on hover.
- **`GlowingCard`**: Card panel containing a sleek glassmorphic container with micro-glow animation.
- **`MultiStepLoader`**: A realistic loading overlay showing evaluation status step progress.
