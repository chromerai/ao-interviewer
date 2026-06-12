import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const DEFAULT_STEPS = [
  { text: "Capturing your submission..." },
  { text: "Analyzing language structure..." },
  { text: "Evaluating grading criteria..." },
  { text: "Calculating final score..." },
  { text: "Generating custom feedback..." }
];

export function MultiStepLoader({ loading, steps = DEFAULT_STEPS }) {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentState((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [loading, steps.length]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
        >
          <div className="w-full max-w-md p-6 flex flex-col items-start justify-center relative">
            <h3 className="text-zinc-400 text-xs tracking-wider uppercase mb-6 font-mono font-semibold">
              Evaluation In Progress
            </h3>

            <div className="space-y-6">
              {steps.map((step, index) => {
                const isCompleted = index < currentState;
                const isLoading = index === currentState;
                const isPending = index > currentState;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 text-left"
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-emerald-500 rounded-full p-1"
                        >
                          <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />
                        </motion.div>
                      )}
                      {isLoading && (
                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                      )}
                      {isPending && (
                        <div className="w-2.5 h-2.5 bg-zinc-700 rounded-full" />
                      )}
                    </div>
                    
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        isCompleted && "text-zinc-400 line-through decoration-zinc-700/50",
                        isLoading && "text-zinc-100 font-semibold",
                        isPending && "text-zinc-600"
                      )}
                    >
                      {step.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Visual Progress Line */}
            <div className="w-full bg-zinc-800 h-[2px] mt-10 rounded-full overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full"
                animate={{ width: `${((currentState + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
