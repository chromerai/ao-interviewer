import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Mail, User, AlertCircle, Sparkles, ShieldCheck, RefreshCw } from "lucide-react";
import { GlowingCard } from "./ui/GlowingCard";
import { HoverBorderGradient } from "./ui/HoverBorderGradient";

const OTP_TTL = 15 * 60; // 15 minutes in seconds

export function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [step, setStep] = useState("email"); // "email" | "otp"

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [displayOtp, setDisplayOtp] = useState(""); // shown on-screen since no email service

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(OTP_TTL);

  const digitRefs = useRef([]);
  const timerRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (step !== "otp") return;
    setCountdown(OTP_TTL);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step, displayOtp]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const switchMode = (m) => {
    setMode(m);
    setStep("email");
    setError("");
    setName("");
    setEmail("");
    setOtpDigits(["", "", "", "", "", ""]);
    setDisplayOtp("");
    clearInterval(timerRef.current);
  };

  // ── Step 1: request OTP ──
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = mode === "register" ? { email: email.trim(), name: name.trim() } : { email: email.trim() };
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send OTP");
      setOtpDigits(["", "", "", "", "", ""]);
      setStep("otp");
      setTimeout(() => digitRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP ──
  const handleVerifyOtp = async () => {
    const code = otpDigits.join("");
    if (code.length < 6) { setError("Enter the full 6-digit code."); return; }
    if (countdown === 0) { setError("OTP has expired. Please request a new one."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp_code: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid OTP");
      onAuth(data.token, data.user);
    } catch (err) {
      setError(err.message);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => digitRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  // OTP digit input handling
  const handleDigitChange = (idx, val) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[idx] = digit;
    setOtpDigits(next);
    if (digit && idx < 5) digitRefs.current[idx + 1]?.focus();
    if (next.every((d) => d !== "")) {
      setTimeout(() => handleVerifyOtpRef.current?.(), 50);
    }
  };

  const handleDigitKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      digitRefs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter") handleVerifyOtpRef.current?.();
  };

  const handleDigitPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      setTimeout(() => handleVerifyOtpRef.current?.(), 50);
    }
  };

  // Stable ref so digit auto-submit can call latest handleVerifyOtp
  const handleVerifyOtpRef = useRef(null);
  handleVerifyOtpRef.current = handleVerifyOtp;

  const handleResend = () => {
    setStep("email");
    setOtpDigits(["", "", "", "", "", ""]);
    setDisplayOtp("");
    setError("");
    clearInterval(timerRef.current);
  };

  return (
    <div className="min-h-screen w-full bg-[#030303] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#16161d_1px,transparent_1px),linear-gradient(to_bottom,#16161d_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_50%,transparent_100%)] opacity-50" />
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <Brain className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              InterviewerAI
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-1">AI-Powered Technical Assessment</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="text-[10px] text-indigo-400 font-mono font-semibold">Powered by OpenAI</span>
          </div>
        </div>

        <GlowingCard>
          <AnimatePresence mode="wait">

            {/* ── Step 1: Email ── */}
            {step === "email" && (
              <motion.div key="email-step"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.22 }}
              >
                {/* Tab switcher */}
                <div className="flex bg-zinc-900 rounded-xl p-1 mb-6">
                  {[["login", "Sign In"], ["register", "Create Account"]].map(([m, label]) => (
                    <button key={m} onClick={() => switchMode(m)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        mode === m ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <AnimatePresence>
                    {mode === "register" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                      >
                        <InputField icon={<User className="w-4 h-4" />} placeholder="Full name"
                          value={name} onChange={setName} type="text" required />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <InputField icon={<Mail className="w-4 h-4" />} placeholder="Email address"
                    value={email} onChange={setEmail} type="email" required />

                  <ErrorBox msg={error} />

                  <div className="pt-1">
                    <HoverBorderGradient as="button" type="submit" containerClassName="w-full" disabled={loading}>
                      <span className="text-sm">{loading ? "Please wait…" : "Send OTP →"}</span>
                    </HoverBorderGradient>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── Step 2: OTP ── */}
            {step === "otp" && (
              <motion.div key="otp-step"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
                className="space-y-5"
              >
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-100">Verify your identity</h3>
                  <p className="text-xs text-zinc-500">Enter the 6-digit code for <span className="text-zinc-300 font-medium">{email}</span></p>
                </div>

                {/* Email sent confirmation */}
                <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-center space-y-1">
                  <p className="text-xs text-indigo-300 font-medium">Code sent to <span className="font-bold">{email}</span></p>
                  <p className="text-[10px] text-zinc-500">Check your inbox (and spam folder)</p>
                </div>

                {/* 6-digit input boxes */}
                <div className="flex justify-center gap-2" onPaste={handleDigitPaste}>
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => (digitRefs.current[i] = el)}
                      type="text" inputMode="numeric" maxLength={1}
                      value={d}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(i, e)}
                      className={`w-10 h-12 text-center text-lg font-bold font-mono rounded-xl border bg-zinc-900 transition-all duration-150 outline-none
                        ${d ? "border-indigo-500 text-indigo-300" : "border-white/10 text-zinc-100"}
                        focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40`}
                    />
                  ))}
                </div>

                {/* Countdown */}
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono font-semibold ${countdown < 60 ? "text-red-400" : "text-zinc-500"}`}>
                    Expires in {formatTime(countdown)}
                  </span>
                  <button onClick={handleResend}
                    className="flex items-center gap-1 text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend
                  </button>
                </div>

                <ErrorBox msg={error} />

                <HoverBorderGradient onClick={handleVerifyOtp} containerClassName="w-full" disabled={loading || countdown === 0}>
                  <span className="text-sm">{loading ? "Verifying…" : "Confirm OTP"}</span>
                </HoverBorderGradient>
              </motion.div>
            )}

          </AnimatePresence>
        </GlowingCard>

        <p className="text-center text-[10px] text-zinc-600 font-mono mt-6 uppercase tracking-wider">
          InterviewerAI MVP · All rights reserved
        </p>
      </div>
    </div>
  );
}

function InputField({ icon, placeholder, value, onChange, type, required }) {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">{icon}</div>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required} autoComplete="off"
        className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-zinc-100 text-sm placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition"
      />
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs">{msg}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
