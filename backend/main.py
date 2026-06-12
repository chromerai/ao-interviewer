import uuid
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="AI Interview Taker MVP API")

# Enable CORS for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
sessions = {}

# Mock questions for different combinations
MOCK_QUESTIONS_POOL = {
    ("Frontend", "React"): [
        "What is the purpose of state in React, and how does it differ from props?",
        "What are React Hooks, and what rules must you follow when using them?",
        "Explain the Virtual DOM and how React reconciles updates to the real DOM.",
        "How does the useEffect hook work, and how do you clean up side effects in it?",
        "What is the difference between controlled and uncontrolled components in React?"
    ],
    ("Frontend", "JavaScript"): [
        "What is the difference between 'let', 'const', and 'var' in JavaScript?",
        "Explain the concept of closures in JavaScript and provide a practical use case.",
        "What is the difference between '==' and '===' operators in JavaScript?",
        "Explain how the JavaScript Event Loop works and how it handles asynchronous operations.",
        "What are Promises, and how do they compare to async/await syntax?"
    ],
    ("Frontend", "CSS"): [
        "What is the difference between Flexbox and CSS Grid layout systems?",
        "Explain the CSS Box Model and how 'box-sizing: border-box' affects it.",
        "What are CSS custom properties (variables) and how do they differ from preprocessor variables?",
        "Explain CSS specificity and how the cascade determines styling application rules.",
        "What is the purpose of media queries and how do you implement mobile-first design?"
    ],
    ("Backend", "Node.js"): [
        "Explain the single-threaded event loop architecture of Node.js.",
        "What is the difference between 'require' (CommonJS) and 'import' (ES Modules) in Node.js?",
        "How does middleware work in Express, and what is its role in request processing?",
        "What is the difference between stream-based and buffer-based file processing in Node.js?",
        "Explain how error handling is typically implemented in asynchronous Node.js operations."
    ],
    ("Backend", "Databases"): [
        "What is the difference between SQL and NoSQL databases, and when would you use each?",
        "Explain the ACID properties of relational database transactions.",
        "What is database indexing, and how does it improve query performance? Are there downsides?",
        "Explain the difference between inner join, left join, and outer join in SQL.",
        "What is database normalization, and why is it important in relational database design?"
    ]
}

DEFAULT_MOCK_QUESTIONS = [
    "What is the primary technical concept behind this topic, and why is it important?",
    "Explain a common problem or challenge associated with this topic and how you would solve it.",
    "Describe the difference between two competing approaches or features in this area.",
    "How do you optimize or write efficient code/systems related to this topic?",
    "Explain how you would debug or troubleshoot an issue related to this topic."
]

# Request/Response Pydantic Models
class StartInterviewRequest(BaseModel):
    subject: str
    topic: str
    difficulty: str

class StartInterviewResponse(BaseModel):
    session_id: str
    question: str
    question_number: int
    total_questions: int

class SubmitAnswerRequest(BaseModel):
    session_id: str
    answer: str

class SubmitAnswerResponse(BaseModel):
    score: int
    feedback: str
    done: bool
    next_question: Optional[str] = None
    question_number: int
    total_questions: int

class QuestionDetail(BaseModel):
    question: str
    answer: str
    score: int
    feedback: str

class ResultsResponse(BaseModel):
    subject: str
    topic: str
    difficulty: str
    overall_score: float
    questions: List[QuestionDetail]


@app.post("/start-interview", response_model=StartInterviewResponse)
def start_interview(payload: StartInterviewRequest):
    session_id = str(uuid.uuid4())
    
    key = (payload.subject, payload.topic)
    questions = MOCK_QUESTIONS_POOL.get(key, DEFAULT_MOCK_QUESTIONS).copy()
    
    difficulty_prefix = f"[{payload.difficulty} level] "
    questions = [difficulty_prefix + q for q in questions]
    
    sessions[session_id] = {
        "subject": payload.subject,
        "topic": payload.topic,
        "difficulty": payload.difficulty,
        "current_index": 0,
        "questions": questions,
        "qa_log": []
    }
    
    return StartInterviewResponse(
        session_id=session_id,
        question=questions[0],
        question_number=1,
        total_questions=5
    )


@app.post("/submit-answer", response_model=SubmitAnswerResponse)
def submit_answer(payload: SubmitAnswerRequest):
    session_id = payload.session_id
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session = sessions[session_id]
    current_index = session["current_index"]
    questions = session["questions"]
    
    if current_index >= 5:
        raise HTTPException(status_code=400, detail="Interview is already completed")
        
    current_question = questions[current_index]
    
    answer_len = len(payload.answer.strip())
    if answer_len == 0:
        score = 0
        feedback = "You did not provide an answer. Please attempt the question next time to receive credit."
    elif answer_len < 15:
        score = 4
        feedback = f"Your answer is too short. At the {session['difficulty']} difficulty level, we expect a more detailed explanation of the concepts."
    else:
        score = 6 + (answer_len % 5)
        score = min(score, 10)
        feedback = (
            f"Good effort. Your response correctly identifies some core aspects. "
            f"Under {session['difficulty']} criteria, you could improve by elaborating on edge cases and deep-dive mechanics."
        )
        
    session["qa_log"].append({
        "question": current_question,
        "answer": payload.answer,
        "score": score,
        "feedback": feedback
    })
    
    session["current_index"] += 1
    next_index = session["current_index"]
    done = next_index >= 5
    
    next_question = None
    if not done:
        next_question = questions[next_index]
        
    return SubmitAnswerResponse(
        score=score,
        feedback=feedback,
        done=done,
        next_question=next_question,
        question_number=next_index + 1 if not done else 5,
        total_questions=5
    )


@app.get("/results/{session_id}", response_model=ResultsResponse)
def get_results(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session = sessions[session_id]
    qa_log = session["qa_log"]
    
    if len(qa_log) == 0:
        overall_score = 0.0
    else:
        overall_score = round(sum(q["score"] for q in qa_log) / len(qa_log), 1)
        
    return ResultsResponse(
        subject=session["subject"],
        topic=session["topic"],
        difficulty=session["difficulty"],
        overall_score=overall_score,
        questions=[
            QuestionDetail(
                question=q["question"],
                answer=q["answer"],
                score=q["score"],
                feedback=q["feedback"]
            )
            for q in qa_log
        ]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
