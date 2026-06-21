import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Plus, ChevronRight, Award, LogOut, Calendar,
  CheckCircle2, XCircle, Sparkles, TrendingUp, Target, Clock,
  ArrowLeft, BookOpen,
} from "lucide-react";
import { GlowingCard } from "./ui/GlowingCard";
import { HoverBorderGradient } from "./ui/HoverBorderGradient";

const OPTION_LABELS = ["A", "B", "C", "D"];
const DIFF_COLORS = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard: "text-red-400 bg-red-500/10 border-red-500/20",
};

function ScoreBadge({ score }) {
  const color = score >= 7 ? "text-emerald-400" : score >= 4 ? "text-amber-400" : "text-red-400";
  return <span className={`text-xl font-extrabold font-mono ${color}`}>{score.toFixed(1)}<span className="text-xs text-zinc-600">/10</span></span>;
}

function MiniCircle({ score, size = 52 }) {
  const radius = 18;
  const circ = 2 * Math.PI * radius;
  const color = score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#27272a" strokeWidth="4" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 10) }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold font-mono" style={{ color }}>{score.toFixed(1)}</span>
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Assessment Detail View ──
function AssessmentDetail({ assessmentId, token, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/assessments/${assessmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [assessmentId, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!data) return <p className="text-zinc-500 text-sm">Assessment not found.</p>;

  const correct = data.questions.filter((q) => q.is_correct).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-zinc-800 border border-white/10 text-zinc-400 hover:text-zinc-200 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
            <span>{data.subject}</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span>{data.topic}</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className={`font-semibold ${data.difficulty === "Easy" ? "text-emerald-400" : data.difficulty === "Hard" ? "text-red-400" : "text-amber-400"}`}>
              {data.difficulty}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-100">Assessment Review</h2>
        </div>
      </div>

      {/* Score summary */}
      <GlowingCard containerClassName="w-full">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                ✓ {correct}/{data.questions.length} Correct
              </span>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold">
                {Math.round((correct / data.questions.length) * 100)}% Accuracy
              </span>
              <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 text-[10px] font-mono">
                <Calendar className="w-2.5 h-2.5 inline mr-1" />
                {formatDate(data.completed_at || data.created_at)}
              </span>
            </div>
          </div>
          <MiniCircle score={data.overall_score} size={64} />
        </div>
      </GlowingCard>

      {/* AI Feedback */}
      <GlowingCard containerClassName="w-full">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider mb-1">
              AI Mentor Feedback
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">{data.ai_feedback}</p>
          </div>
        </div>
      </GlowingCard>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pl-1">
          <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Question Breakdown</h3>
        </div>
        {data.questions.map((q, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
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
                        {isCorrect && <span className="ml-1.5 text-emerald-400/70">✓</span>}
                        {isUser && !isCorrect && <span className="ml-1.5 text-red-400/70">✗</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-zinc-900/40 rounded-xl border border-dashed border-white/5">
                  <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider mb-1">Explanation</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            </GlowingCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ──
export function Dashboard({ user, token, onNewSession, onLogout }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const loadDashboard = () => {
    setLoading(true);
    fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setAssessments(d.assessments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDashboard(); }, [token]);

  const avgScore = assessments.length
    ? (assessments.reduce((s, a) => s + a.overall_score, 0) / assessments.length).toFixed(1)
    : null;
  const totalCorrect = assessments.reduce((s, a) => s + (a.correct_count || 0), 0);
  const totalQs = assessments.reduce((s, a) => s + (a.question_count || 0), 0);

  return (
    <div className="min-h-screen w-full bg-[#030303] relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#16161d_1px,transparent_1px),linear-gradient(to_bottom,#16161d_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_50%,transparent_100%)] opacity-50" />
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-[120px]" />

      {/* Nav */}
      <header className="relative z-10 w-full border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-bold text-base bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">InterviewerAI</h1>
              <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">MVP Phase 1</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-xl border border-white/5">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                {user.name[0].toUpperCase()}
              </div>
              <span className="text-xs text-zinc-300 font-medium">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {selectedId ? (
            <AssessmentDetail
              key={selectedId}
              assessmentId={selectedId}
              token={token}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
              {/* Welcome */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-zinc-100">
                    Welcome back, {user.name.split(" ")[0]} 👋
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    {assessments.length === 0
                      ? "Start your first AI-powered assessment below."
                      : `You've completed ${assessments.length} assessment${assessments.length !== 1 ? "s" : ""}.`}
                  </p>
                </div>
                <HoverBorderGradient onClick={onNewSession} containerClassName="shrink-0">
                  <span className="flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> New Assessment
                  </span>
                </HoverBorderGradient>
              </div>

              {/* Stats row */}
              {assessments.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Assessments", value: assessments.length, icon: <BookOpen className="w-4 h-4" />, color: "text-indigo-400" },
                    { label: "Avg Score", value: `${avgScore}/10`, icon: <Award className="w-4 h-4" />, color: Number(avgScore) >= 7 ? "text-emerald-400" : "text-amber-400" },
                    { label: "Accuracy", value: totalQs ? `${Math.round((totalCorrect / totalQs) * 100)}%` : "—", icon: <Target className="w-4 h-4" />, color: "text-purple-400" },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <GlowingCard>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-zinc-800 border border-white/5 ${s.color}`}>{s.icon}</div>
                          <div>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{s.label}</p>
                            <p className={`text-lg font-extrabold font-mono ${s.color}`}>{s.value}</p>
                          </div>
                        </div>
                      </GlowingCard>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Assessment list */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pl-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Past Assessments</h3>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <motion.div
                      className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                ) : assessments.length === 0 ? (
                  <GlowingCard containerClassName="w-full">
                    <div className="py-12 flex flex-col items-center gap-4 text-center">
                      <div className="p-4 bg-zinc-800 rounded-2xl border border-white/5">
                        <Brain className="w-8 h-8 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-zinc-300 font-semibold">No assessments yet</p>
                        <p className="text-sm text-zinc-500 mt-1">Click "New Assessment" to get started.</p>
                      </div>
                    </div>
                  </GlowingCard>
                ) : (
                  assessments.map((a, i) => {
                    const accuracy = a.question_count ? Math.round((a.correct_count / a.question_count) * 100) : 0;
                    return (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => setSelectedId(a.id)}
                        className="cursor-pointer"
                      >
                        <GlowingCard containerClassName="w-full">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                              <MiniCircle score={a.overall_score} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                  <span className="text-sm font-bold text-zinc-100">{a.topic}</span>
                                  <span className="text-zinc-600 text-xs">·</span>
                                  <span className="text-xs text-zinc-400">{a.subject}</span>
                                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${DIFF_COLORS[a.difficulty] || "text-zinc-400 bg-zinc-800 border-white/5"}`}>
                                    {a.difficulty}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono flex-wrap">
                                  <span className="text-emerald-400/80">✓ {a.correct_count}/{a.question_count} correct</span>
                                  <span>{accuracy}% accuracy</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {formatDate(a.completed_at || a.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
                          </div>
                        </GlowingCard>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
