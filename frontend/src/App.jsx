import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Play, 
  Send, 
  RefreshCw, 
  Award, 
  AlertCircle, 
  ChevronRight,
  BookOpen,
  HelpCircle,
  MessageSquare
} from "lucide-react";
import { GridBackground } from "./components/ui/GridBackground";
import { HoverBorderGradient } from "./components/ui/HoverBorderGradient";
import { GlowingCard } from "./components/ui/GlowingCard";
import { MultiStepLoader } from "./components/ui/MultiStepLoader";

const API_BASE = "http://127.0.0.1:8000";

const SUBJECTS_TOPICS = {
  Frontend: ["React", "JavaScript", "CSS"],
  Backend: ["Node.js", "Databases"]
};

export default function App() {
  const [screen, setScreen] = useState("setup");
  
  const [subject, setSubject] = useState("Frontend");
  const [topic, setTopic] = useState("React");
  const [difficulty, setDifficulty] = useState("Medium");
  
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [answerText, setAnswerText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState(null);

  useEffect(() => {
    const topics = SUBJECTS_TOPICS[subject];
    if (topics && !topics.includes(topic)) {
      setTopic(topics[0]);
    }
  }, [subject]);

  const handleStartInterview = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/start-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, difficulty })
      });
      
      if (!response.ok) {
        throw new Error("Failed to start session. Make sure the backend server is running.");
      }
      
      const data = await response.json();
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setQuestionNumber(data.question_number);
      setTotalQuestions(data.total_questions);
      setAnswerText("");
      setScreen("interview");
    } catch (err) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      setErrorMsg("Answer cannot be empty.");
      return;
    }
    
    setErrorMsg("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/submit-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, answer: answerText })
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit answer. Please try again.");
      }
      
      const data = await response.json();
      
      if (data.done) {
        await fetchResults();
      } else {
        setCurrentQuestion(data.next_question);
        setQuestionNumber(data.question_number);
        setTotalQuestions(data.total_questions);
        setAnswerText("");
      }
    } catch (err) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch(`${API_BASE}/results/${sessionId}`);
      if (!response.ok) {
        throw new Error("Failed to retrieve interview results.");
      }
      const data = await response.json();
      setResults(data);
      setScreen("results");
    } catch (err) {
      setErrorMsg(err.message || "An error occurred fetching results.");
    }
  };

  const handleRestart = () => {
    setScreen("setup");
    setSessionId("");
    setCurrentQuestion("");
    setQuestionNumber(1);
    setAnswerText("");
    setResults(null);
    setErrorMsg("");
  };

  return (
    <GridBackground>
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleRestart}>
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Brain className="w-6 h-6 animate-pulse-slow" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              InterviewerAI
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase font-semibold">
              MVP Phase 1
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-mono text-zinc-400">System Ready</span>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center relative z-10">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Action Failed</h4>
              <p className="text-xs opacity-90 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {screen === "setup" && (
          <div className="max-w-xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Configure Your Session
              </h2>
              <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                Set your path, test your skills, and receive instant generative grading and feedback.
              </p>
            </div>

            <GlowingCard>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" /> Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  >
                    {Object.keys(SUBJECTS_TOPICS).map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5" /> Topic
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  >
                    {SUBJECTS_TOPICS[subject]?.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                    <Award className="w-3.5 h-3.5" /> Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  >
                    <option value="Easy">Easy (Lenient Grading)</option>
                    <option value="Medium">Medium (Balanced Grading)</option>
                    <option value="Hard">Hard (Strict Grading)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <HoverBorderGradient 
                    onClick={handleStartInterview} 
                    containerClassName="w-full"
                    disabled={loading}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Play className="w-4 h-4 fill-current" /> Start Interview Session
                    </span>
                  </HoverBorderGradient>
                </div>
              </div>
            </GlowingCard>
          </div>
        )}

        {screen === "interview" && (
          <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/40 px-5 py-3 rounded-2xl border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                <span>{subject}</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                <span>{topic}</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-indigo-400 font-semibold">{difficulty}</span>
              </div>
              <span className="text-xs font-mono font-bold bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full border border-white/5">
                Question {questionNumber} of {totalQuestions}
              </span>
            </div>

            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500" 
                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              />
            </div>

            <GlowingCard>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                    Question Prompt
                  </h3>
                  <p className="text-lg font-bold text-zinc-100 leading-relaxed">
                    {currentQuestion}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Your Answer
                  </label>
                  <textarea
                    rows={6}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your comprehensive explanation here..."
                    className="w-full bg-zinc-900/80 border border-white/10 rounded-xl p-4 text-zinc-100 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition placeholder-zinc-600 leading-relaxed resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <HoverBorderGradient 
                    onClick={handleSubmitAnswer}
                    disabled={!answerText.trim() || loading}
                    containerClassName="w-full sm:w-auto"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" /> Submit Answer
                    </span>
                  </HoverBorderGradient>
                </div>
              </div>
            </GlowingCard>
            
            <MultiStepLoader loading={loading} />
          </div>
        )}

        {screen === "results" && results && (
          <div className="w-full space-y-8 animate-in fade-in duration-500">
            <GlowingCard containerClassName="w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                    <span>{results.subject}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                    <span>{results.topic}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-indigo-400 font-semibold">{results.difficulty}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                    Interview Evaluation Report
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Calculated using generative strictness models matching {results.difficulty} difficulty.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-white/5 shrink-0">
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                      Overall Score
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-extrabold font-mono ${results.overall_score >= 7.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {results.overall_score.toFixed(1)}
                      </span>
                      <span className="text-zinc-600 text-sm font-semibold">/ 10.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlowingCard>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono pl-1">
                Question Breakdown
              </h3>
              
              {results.questions.map((q, idx) => {
                const isPassed = q.score >= 7;
                return (
                  <GlowingCard key={idx} containerClassName="w-full">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase">
                            Question {idx + 1}
                          </p>
                          <h4 className="text-sm font-bold text-zinc-100 leading-snug">
                            {q.question}
                          </h4>
                        </div>
                        <div className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono ${
                          isPassed 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}>
                          Score: {q.score}/10
                        </div>
                      </div>

                      <div className="p-3.5 bg-zinc-900/50 rounded-xl border border-white/5 space-y-1.5">
                        <h5 className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider">
                          Your Answer
                        </h5>
                        <p className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                          {q.answer || "(No response provided)"}
                        </p>
                      </div>

                      <div className="p-3.5 bg-zinc-900/30 rounded-xl border border-dashed border-white/5 space-y-1.5">
                        <h5 className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider">
                          AI Evaluator Feedback
                        </h5>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {q.feedback}
                        </p>
                      </div>
                    </div>
                  </GlowingCard>
                );
              })}
            </div>

            <div className="flex justify-center pt-4">
              <HoverBorderGradient onClick={handleRestart} containerClassName="w-full sm:w-auto">
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Start New Interview Session
                </span>
              </HoverBorderGradient>
            </div>
          </div>
        )}
      </main>
      
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center border-t border-white/5 mt-auto relative z-10">
        <p className="text-[11px] text-zinc-600 font-mono tracking-wider uppercase">
          Build for Scaler AI module • Powered by Anthropic Claude API
        </p>
      </footer>
    </GridBackground>
  );
}
