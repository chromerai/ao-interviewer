import React, { useState, useEffect } from "react";
import {
  Brain, Play, RefreshCw, Award, AlertCircle,
  ChevronRight, BookOpen, HelpCircle, Sparkles,
  TrendingUp, Target, CheckCircle2, XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GridBackground } from "./components/ui/GridBackground";
import { HoverBorderGradient } from "./components/ui/HoverBorderGradient";
import { GlowingCard } from "./components/ui/GlowingCard";
import { MultiStepLoader } from "./components/ui/MultiStepLoader";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";

const API_BASE = "/api";
const OPTION_LABELS = ["A", "B", "C", "D"];

const SUBJECTS_TOPICS = {
  Frontend: ["React", "JavaScript", "TypeScript", "CSS", "Next.js", "Vue.js"],
  Backend: ["Node.js", "Python", "Databases", "System Design", "REST APIs", "Docker"],
};

const EXPERIENCE_LEVELS = [
  { value: "Junior", label: "Junior", desc: "0–2 yrs", color: "emerald" },
  { value: "Mid-Level", label: "Mid-Level", desc: "2–5 yrs", color: "indigo" },
  { value: "Senior", label: "Senior", desc: "5+ yrs", color: "purple" },
];

const QUESTION_COUNTS = [5, 10, 15];

// ---------- Helpers ----------

function apiCall(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

function AnimatedCounter({ value, duration = 1400 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(parseFloat(start.toFixed(1)));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{display.toFixed(1)}</span>;
}

function CircularProgress({ score, size = 110 }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const color = score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth="8" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 10) }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold font-mono" style={{ color }}>
          <AnimatedCounter value={score} />
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">/10</span>
      </div>
    </div>
  );
}

function OptionButton({ label, text, selected, disabled, onClick }) {
  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.01, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left
        ${selected
          ? "border-indigo-500/70 bg-indigo-500/10"
          : "border-white/10 bg-zinc-900/60 hover:border-indigo-500/40 hover:bg-zinc-800/60"}
        ${disabled ? "cursor-default" : "cursor-pointer"}`}
    >
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-all duration-200
        ${selected ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>
        {label}
      </span>
      <span className={`text-sm font-medium flex-1 leading-snug transition-colors duration-200
        ${selected ? "text-indigo-200" : "text-zinc-200"}`}>
        {text}
      </span>
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
          <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
        </motion.div>
      )}
    </motion.button>
  );
}

// ---------- App ----------

export default function App() {
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem("ai_token") || null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Screen: "auth" | "dashboard" | "setup" | "interview" | "results"
  const [screen, setScreen] = useState("auth");

  // Setup
  const [subject, setSubject] = useState("Frontend");
  const [topic, setTopic] = useState("React");
  const [difficulty, setDifficulty] = useState("Medium");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level");
  const [numQuestions, setNumQuestions] = useState(5);

  // Interview
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentOptions, setCurrentOptions] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [selectedOption, setSelectedOption] = useState(null);
  const [pendingNext, setPendingNext] = useState(null); // { next_question, next_options, question_number }
  const [answered, setAnswered] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);

  // Results
  const [results, setResults] = useState(null);

  // UI
  const [loading, setLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState("generation");
  const [errorMsg, setErrorMsg] = useState("");

  // Restore session on mount
  useEffect(() => {
    if (!token) { setAuthLoading(false); setScreen("auth"); return; }
    apiCall("/auth/me", {}, token)
      .then((r) => r.ok ? r.json() : null)
      .then((u) => {
        if (u) { setUser(u); setScreen("dashboard"); }
        else { localStorage.removeItem("ai_token"); setToken(null); setScreen("auth"); }
      })
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    const topics = SUBJECTS_TOPICS[subject];
    if (topics && !topics.includes(topic)) setTopic(topics[0]);
  }, [subject]);

  // ---------- Auth handlers ----------

  const handleAuth = (tok, usr) => {
    localStorage.setItem("ai_token", tok);
    setToken(tok);
    setUser(usr);
    setScreen("dashboard");
  };

  const handleLogout = async () => {
    await apiCall("/auth/logout", { method: "POST" }, token).catch(() => {});
    localStorage.removeItem("ai_token");
    setToken(null);
    setUser(null);
    setScreen("auth");
  };

  // ---------- Interview handlers ----------

  const handleStartInterview = async () => {
    setErrorMsg("");
    setLoadingMode("generation");
    setLoading(true);
    try {
      const res = await apiCall("/start-interview", {
        method: "POST",
        body: JSON.stringify({ subject, topic, difficulty, experience_level: experienceLevel, num_questions: numQuestions }),
      }, token);
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Failed to start session"); }
      const data = await res.json();
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setCurrentOptions(data.options);
      setQuestionNumber(data.question_number);
      setTotalQuestions(data.total_questions);
      setSelectedOption(null);
      setAnswered(false);
      setPendingNext(null);
      setQuestionKey(0);
      setScreen("interview");
    } catch (err) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption) { setErrorMsg("Please select an answer first."); return; }
    setErrorMsg("");
    setLoadingMode("evaluation");
    setLoading(true);
    try {
      const res = await apiCall("/submit-answer", {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, answer: selectedOption }),
      }, token);
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Failed to submit"); }
      const data = await res.json();
      setAnswered(true);

      if (data.done) {
        // Fetch results (reveals all answers)
        await fetchResults();
      } else {
        // Queue up next question, show "Next" button — no feedback revealed
        setPendingNext({
          next_question: data.next_question,
          next_options: data.next_options,
          question_number: data.question_number,
        });
      }
    } catch (err) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (!pendingNext) return;
    setCurrentQuestion(pendingNext.next_question);
    setCurrentOptions(pendingNext.next_options);
    setQuestionNumber(pendingNext.question_number);
    setSelectedOption(null);
    setAnswered(false);
    setPendingNext(null);
    setQuestionKey((k) => k + 1);
  };

  const fetchResults = async () => {
    try {
      const res = await apiCall(`/results/${sessionId}`, {}, token);
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Failed to fetch results"); }
      const data = await res.json();
      setResults(data);
      setScreen("results");
    } catch (err) {
      setErrorMsg(err.message || "Could not retrieve results.");
    }
  };

  const handleRestart = () => {
    setScreen("dashboard");
    setSessionId("");
    setCurrentQuestion("");
    setCurrentOptions([]);
    setSelectedOption(null);
    setAnswered(false);
    setPendingNext(null);
    setResults(null);
    setErrorMsg("");
    setQuestionNumber(1);
  };

  // ---------- Loading screen ----------

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // ---------- Auth ----------

  if (screen === "auth") return <AuthScreen onAuth={handleAuth} />;

  // ---------- Dashboard ----------

  if (screen === "dashboard") {
    return (
      <Dashboard
        user={user}
        token={token}
        onNewSession={() => setScreen("setup")}
        onLogout={handleLogout}
      />
    );
  }

  const progressPct = ((questionNumber - 1) / totalQuestions) * 100;

  // ---------- Setup + Interview + Results (shared layout) ----------

  return (
    <GridBackground>
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleRestart}>
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              InterviewerAI
            </h1>
            <p className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase font-semibold">MVP Phase 1</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:block text-xs text-zinc-500 font-medium">{user.name}</span>
          )}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono text-zinc-500">System Ready</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-3xl mx-auto px-6 py-10 flex-1 flex flex-col justify-center relative z-10">
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{errorMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ── SETUP ── */}
          {screen === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}
              className="max-w-lg mx-auto w-full space-y-6">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-semibold">
                  <Sparkles className="w-3 h-3" /> AI-Powered MCQ Assessment
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                  Configure Your Session
                </h2>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                  AI crafts questions specifically for your level. Correct answers are revealed only after you finish.
                </p>
              </div>

              <GlowingCard>
                <div className="space-y-6">

                  {/* Subject + Topic row */}
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField icon={<BookOpen className="w-3.5 h-3.5" />} label="Subject" value={subject} onChange={setSubject}>
                      {Object.keys(SUBJECTS_TOPICS).map((s) => <option key={s} value={s}>{s}</option>)}
                    </SelectField>
                    <SelectField icon={<HelpCircle className="w-3.5 h-3.5" />} label="Topic" value={topic} onChange={setTopic}>
                      {SUBJECTS_TOPICS[subject]?.map((t) => <option key={t} value={t}>{t}</option>)}
                    </SelectField>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                      <Award className="w-3.5 h-3.5" /> Difficulty
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "Easy", emoji: "🟢", desc: "Lenient" },
                        { value: "Medium", emoji: "🟡", desc: "Balanced" },
                        { value: "Hard", emoji: "🔴", desc: "Strict" },
                      ].map((d) => (
                        <motion.button
                          key={d.value}
                          onClick={() => setDifficulty(d.value)}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all duration-200 ${
                            difficulty === d.value
                              ? "border-indigo-500/60 bg-indigo-500/10"
                              : "border-white/8 bg-zinc-900/60 hover:border-white/15"
                          }`}
                        >
                          <span className="text-base">{d.emoji}</span>
                          <span className={`text-xs font-bold ${difficulty === d.value ? "text-indigo-300" : "text-zinc-300"}`}>{d.value}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{d.desc}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5" /> Experience Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {EXPERIENCE_LEVELS.map((lvl) => (
                        <motion.button
                          key={lvl.value}
                          onClick={() => setExperienceLevel(lvl.value)}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all duration-200 ${
                            experienceLevel === lvl.value
                              ? "border-indigo-500/60 bg-indigo-500/10"
                              : "border-white/8 bg-zinc-900/60 hover:border-white/15"
                          }`}
                        >
                          <span className={`text-xs font-bold ${experienceLevel === lvl.value ? "text-indigo-300" : "text-zinc-300"}`}>
                            {lvl.label}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">{lvl.desc}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Questions */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                      <Target className="w-3.5 h-3.5" /> Number of Questions
                    </label>
                    <div className="flex gap-2">
                      {QUESTION_COUNTS.map((n) => (
                        <motion.button
                          key={n}
                          onClick={() => setNumQuestions(n)}
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 ${
                            numQuestions === n
                              ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300"
                              : "border-white/8 bg-zinc-900/60 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                          }`}
                        >
                          {n}
                          <span className="text-[10px] font-normal block text-zinc-500">
                            {n === 5 ? "Quick" : n === 10 ? "Standard" : "Deep Dive"}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <HoverBorderGradient onClick={handleStartInterview} containerClassName="w-full" disabled={loading}>
                      <span className="flex items-center justify-center gap-2">
                        <Play className="w-4 h-4 fill-current" /> Start {numQuestions}-Question Session
                      </span>
                    </HoverBorderGradient>
                  </div>
                </div>
              </GlowingCard>
            </motion.div>
          )}

          {/* ── INTERVIEW ── */}
          {screen === "interview" && (
            <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}
              className="max-w-2xl mx-auto w-full space-y-5">

              {/* Breadcrumb */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/40 px-4 py-2.5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span>{subject}</span>
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>{topic}</span>
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span className={difficulty === "Easy" ? "text-emerald-400 font-semibold" : difficulty === "Hard" ? "text-red-400 font-semibold" : "text-amber-400 font-semibold"}>
                    {difficulty}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full border border-white/5">
                  {questionNumber} / {totalQuestions}
                </span>
              </div>

              {/* Progress */}
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={questionKey}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.28 }}
                >
                  <GlowingCard>
                    <div className="space-y-5">
                      <div>
                        <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider mb-2">
                          Question {questionNumber}
                        </p>
                        <p className="text-base font-bold text-zinc-100 leading-relaxed">{currentQuestion}</p>
                      </div>

                      <div className="space-y-2.5">
                        {currentOptions.map((opt, i) => (
                          <OptionButton
                            key={i}
                            label={OPTION_LABELS[i]}
                            text={opt}
                            selected={selectedOption === opt}
                            disabled={answered}
                            onClick={() => { setSelectedOption(opt); setErrorMsg(""); }}
                          />
                        ))}
                      </div>

                      {/* After submitting — no correct answer shown, just a confirmation */}
                      <AnimatePresence>
                        {answered && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-center gap-2.5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                            <p className="text-xs text-indigo-300 font-medium">
                              Answer recorded! {pendingNext ? "Continue to the next question." : "Loading your results..."}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex justify-end pt-1">
                        {!answered ? (
                          <HoverBorderGradient
                            onClick={handleSubmitAnswer}
                            disabled={!selectedOption || loading}
                            containerClassName="w-full sm:w-auto"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <Target className="w-4 h-4" /> Submit Answer
                            </span>
                          </HoverBorderGradient>
                        ) : pendingNext ? (
                          <HoverBorderGradient onClick={handleNextQuestion} containerClassName="w-full sm:w-auto">
                            <span className="flex items-center justify-center gap-2">
                              Next Question <ChevronRight className="w-4 h-4" />
                            </span>
                          </HoverBorderGradient>
                        ) : null}
                      </div>
                    </div>
                  </GlowingCard>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── RESULTS ── */}
          {screen === "results" && results && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="w-full space-y-6">

              {/* Score header */}
              <GlowingCard containerClassName="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <span>{results.subject}</span>
                      <ChevronRight className="w-3 h-3 text-zinc-600" />
                      <span>{results.topic}</span>
                      <ChevronRight className="w-3 h-3 text-zinc-600" />
                      <span className={results.difficulty === "Easy" ? "text-emerald-400 font-semibold" : results.difficulty === "Hard" ? "text-red-400 font-semibold" : "text-amber-400 font-semibold"}>
                        {results.difficulty}
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                      Assessment Complete
                    </h2>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(() => {
                        const correct = results.questions.filter((q) => q.is_correct).length;
                        const total = results.questions.length;
                        return (
                          <>
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                              ✓ {correct}/{total} Correct
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold">
                              {Math.round((correct / total) * 100)}% Accuracy
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <CircularProgress score={results.overall_score} />
                </div>
              </GlowingCard>

              {/* AI Feedback */}
              <GlowingCard containerClassName="w-full">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shrink-0">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider mb-1.5">
                      AI Mentor Feedback
                    </p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{results.ai_feedback}</p>
                  </div>
                </div>
              </GlowingCard>

              {/* Question breakdown — answers revealed here */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pl-1">
                  <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Question Breakdown</h3>
                </div>

                {results.questions.map((q, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + idx * 0.07 }}>
                    <GlowingCard containerClassName="w-full">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Q{idx + 1}</p>
                            <p className="text-sm font-bold text-zinc-100 leading-snug mt-1">{q.question}</p>
                          </div>
                          <span className={`shrink-0 px-2.5 py-1 rounded-xl border text-[10px] font-bold font-mono ${q.is_correct ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                            {q.is_correct ? "✓ Correct" : "✗ Wrong"}
                          </span>
                        </div>

                        {/* Options with correct/wrong highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oi) => {
                            const isUser = opt === q.user_answer;
                            const isCorrect = opt === q.correct_answer;
                            let cls = "px-3 py-2 rounded-lg border text-xs font-medium ";
                            if (isCorrect) cls += "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
                            else if (isUser && !isCorrect) cls += "bg-red-500/10 border-red-500/30 text-red-300";
                            else cls += "bg-zinc-900/40 border-white/5 text-zinc-500";
                            return (
                              <div key={oi} className={cls}>
                                <span className="font-mono font-bold mr-1.5 opacity-60">{OPTION_LABELS[oi]}.</span>
                                {opt}
                                {isCorrect && <span className="ml-1 text-emerald-400/70">✓</span>}
                                {isUser && !isCorrect && <span className="ml-1 text-red-400/70">✗</span>}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        <div className="p-3 bg-zinc-900/40 rounded-xl border border-dashed border-white/5">
                          <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider mb-1">Explanation</p>
                          <p className="text-xs text-zinc-400 leading-relaxed">{q.explanation}</p>
                        </div>
                      </div>
                    </GlowingCard>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3 justify-center pt-2 flex-wrap">
                <HoverBorderGradient onClick={() => setScreen("setup")} containerClassName="w-full sm:w-auto">
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-4 h-4 fill-current" /> Try Again
                  </span>
                </HoverBorderGradient>
                <HoverBorderGradient onClick={handleRestart} containerClassName="w-full sm:w-auto">
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Back to Dashboard
                  </span>
                </HoverBorderGradient>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="w-full max-w-6xl mx-auto px-6 py-5 text-center border-t border-white/5 mt-auto relative z-10">
        <p className="text-[10px] text-zinc-600 font-mono tracking-wider uppercase">
          Powered by OpenAI GPT-4o-mini · InterviewerAI MVP
        </p>
      </footer>

      <MultiStepLoader loading={loading} mode={loadingMode} />
    </GridBackground>
  );
}

// Small helper component
function SelectField({ icon, label, value, onChange, children }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
        {icon} {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition"
      >
        {children}
      </select>
    </div>
  );
}
