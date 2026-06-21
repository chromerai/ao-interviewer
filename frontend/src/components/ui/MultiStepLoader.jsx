import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

const AI_GENERATION_STEPS = [
  { text: "Analyzing skill requirements...", icon: "🧠" },
  { text: "Generating assessment blueprint...", icon: "📐" },
  { text: "Crafting personalized questions...", icon: "✍️" },
  { text: "Validating answer quality...", icon: "🔍" },
  { text: "Finalizing assessment...", icon: "✅" },
];

const EVALUATION_STEPS = [
  { text: "Capturing your submission...", icon: "📥" },
  { text: "Analyzing language structure...", icon: "🔬" },
  { text: "Evaluating grading criteria...", icon: "📊" },
  { text: "Calculating final score...", icon: "🧮" },
  { text: "Generating custom feedback...", icon: "💬" },
];

function FloatingParticle({ delay }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-indigo-400/60"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
        x: [0, (Math.random() - 0.5) * 120],
        y: [0, -80 - Math.random() * 60],
      }}
      transition={{
        duration: 2 + Math.random(),
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
      style={{
        left: `${20 + Math.random() * 60}%`,
        bottom: "20%",
      }}
    />
  );
}

function NeuralPulse() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center mb-6">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-indigo-500/40"
          initial={{ width: 20, height: 20, opacity: 0.8 }}
          animate={{ width: 64, height: 64, opacity: 0 }}
          transition={{
            duration: 1.5,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg shadow-indigo-500/50" />
    </div>
  );
}

export function MultiStepLoader({ loading, mode = "evaluation" }) {
  const steps = mode === "generation" ? AI_GENERATION_STEPS : EVALUATION_STEPS;
  const title = mode === "generation" ? "AI Generating Questions" : "Evaluating Response";

  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentState((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, mode === "generation" ? 1200 : 700);
    return () => clearInterval(interval);
  }, [loading, steps.length, mode]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg"
        >
          {/* Floating particles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <FloatingParticle key={i} delay={i * 0.2} />
          ))}

          {/* Scan line effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(transparent 0%, rgba(99,102,241,0.03) 50%, transparent 100%)",
              backgroundSize: "100% 4px",
            }}
            animate={{ backgroundPositionY: ["0%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          <div className="w-full max-w-md px-8 flex flex-col items-center relative z-10">
            <NeuralPulse />

            <motion.h3
              className="text-zinc-300 text-xs tracking-[0.2em] uppercase mb-8 font-mono font-semibold"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {title}
            </motion.h3>

            <div className="w-full space-y-5">
              {steps.map((step, index) => {
                const isCompleted = index < currentState;
                const isLoading = index === currentState;
                const isPending = index > currentState;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-7 h-7 flex items-center justify-center shrink-0">
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm shadow-emerald-500/50"
                        >
                          <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />
                        </motion.div>
                      )}
                      {isLoading && (
                        <motion.div
                          className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                      {isPending && (
                        <div className="w-2 h-2 bg-zinc-700 rounded-full mx-auto" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-1">
                      <span className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        isCompleted && "text-zinc-500 line-through decoration-zinc-700/50",
                        isLoading && "text-zinc-100 font-semibold",
                        isPending && "text-zinc-600"
                      )}>
                        {step.text}
                      </span>
                      {isLoading && (
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-xs text-indigo-400"
                        >
                          {step.icon}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-800 h-[2px] mt-10 rounded-full overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full"
                animate={{ width: `${((currentState + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            <p className="text-zinc-600 text-[10px] font-mono mt-4 tracking-wider">
              {currentState + 1} / {steps.length} stages
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
