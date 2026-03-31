"use client";

import { useState } from "react";

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    setError(false);
    const next = code + d;
    if (next.length === 4) {
      if (next === "3333") {
        onUnlock();
      } else {
        setError(true);
        setCode("");
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <div className="text-4xl mb-3">🛒</div>
        <h1 className="text-2xl font-bold tracking-tight">FizzGrocList</h1>
        <p className="text-sm text-muted mt-1">Enter code to continue</p>
      </div>

      {/* Dots */}
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              error
                ? "bg-danger animate-[shake_0.3s_ease-in-out]"
                : i < code.length
                ? "bg-accent scale-110"
                : "bg-sand"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs text-danger font-medium mb-4">Wrong code, try again</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map(
          (key) =>
            key === "" ? (
              <div key="empty" />
            ) : key === "del" ? (
              <button
                key="del"
                onClick={handleDelete}
                className="h-16 rounded-2xl bg-sand text-muted flex items-center justify-center text-sm font-semibold active:scale-95 transition-transform"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l-7-7 7-7M19 12H5" />
                </svg>
              </button>
            ) : (
              <button
                key={key}
                onClick={() => handleDigit(key)}
                className="h-16 rounded-2xl bg-card shadow-soft text-xl font-semibold text-foreground active:scale-95 active:bg-sand transition-all"
              >
                {key}
              </button>
            )
        )}
      </div>
    </div>
  );
}
