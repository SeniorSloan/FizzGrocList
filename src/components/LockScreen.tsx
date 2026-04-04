"use client";

import { useState } from "react";

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDigit = (d: string) => {
    setError(false);
    const next = code + d;
    if (next.length === 4) {
      if (next === "3333") {
        setSuccess(true);
        setTimeout(() => onUnlock(), 500);
      } else {
        setError(true);
        setTimeout(() => setCode(""), 400);
      }
    } else {
      setCode(next);
    }
  };

  const handleDelete = () => {
    setCode((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      {/* Logo area */}
      <div className="text-center mb-12">
        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-pink-300 flex items-center justify-center mx-auto mb-5 shadow-button transition-all duration-500 ${success ? "scale-125 rotate-[10deg]" : ""}`}>
          <span className="text-3xl">{success ? "✅" : "🛒"}</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight gradient-text">FizzGrocList</h1>
        <p className="text-sm text-muted mt-2 font-medium">
          {success ? "Welcome back!" : "Enter your pin to continue"}
        </p>
      </div>

      {/* Dots */}
      <div className={`flex gap-5 mb-10 ${error ? "animate-shake" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="relative">
            <div
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                error
                  ? "bg-danger scale-75"
                  : success
                  ? "bg-sage scale-125"
                  : i < code.length
                  ? "bg-accent scale-125"
                  : "bg-border"
              }`}
            />
            {i < code.length && !error && !success && (
              <div className="absolute inset-0 rounded-full bg-accent/20 animate-[pulse-ring_0.6s_ease-out_forwards]" />
            )}
            {success && i < 4 && (
              <div className="absolute inset-0 rounded-full bg-sage/30 animate-[pulse-ring_0.6s_ease-out_forwards]"
                style={{ animationDelay: `${i * 0.08}s` }} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs text-danger font-semibold mb-5 animate-fade-up">Nope, try again</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-4 w-72">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map(
          (key) =>
            key === "" ? (
              <div key="empty" />
            ) : key === "del" ? (
              <button
                key="del"
                onClick={handleDelete}
                className="h-[68px] min-w-[68px] rounded-2xl bg-sand text-muted flex items-center justify-center active:scale-90 active:bg-border transition-all duration-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l-7-7 7-7M19 12H5" />
                </svg>
              </button>
            ) : (
              <button
                key={key}
                onClick={() => handleDigit(key)}
                disabled={success}
                className="h-[68px] min-w-[68px] rounded-2xl bg-card shadow-card text-2xl font-semibold text-foreground active:scale-90 active:bg-accent-light transition-all duration-100 select-none disabled:opacity-50"
              >
                {key}
              </button>
            )
        )}
      </div>
    </div>
  );
}
