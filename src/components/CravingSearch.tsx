"use client";

import { useState } from "react";

type SearchOption = {
  name: string;
  description: string;
  ingredients: string[];
};

export default function CravingSearch({
  onOptionPicked,
}: {
  onOptionPicked: (option: SearchOption) => void;
}) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q: string) => {
    if (!q.trim() || searching) return;
    setSearching(true);
    setOptions([]);
    try {
      const res = await fetch("/api/search-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.options?.length > 0) {
        setOptions(data.options);
      }
    } catch { /* fetch failed */ }
    setSearching(false);
  };

  const quickIdeas = [
    { label: "chicken tacos", emoji: "🌮" },
    { label: "something spicy", emoji: "🌶" },
    { label: "pasta", emoji: "🍝" },
    { label: "stir fry", emoji: "🥘" },
    { label: "soup", emoji: "🍲" },
    { label: "comfort food", emoji: "🫕" },
    { label: "salad", emoji: "🥗" },
  ];

  return (
    <div className="mb-8">
      {/* Search bar */}
      <div className="relative">
        <div className="flex items-center gap-3 bg-card rounded-2xl shadow-card px-4 py-1 transition-all focus-within:shadow-lifted focus-within:ring-2 focus-within:ring-accent/10">
          <svg className="w-5 h-5 text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you craving?"
            className="flex-1 text-[15px] bg-transparent py-3.5 focus:outline-none placeholder:text-muted/60"
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(query); }}
          />
          {query.trim() && (
            <button
              onClick={() => handleSearch(query)}
              disabled={searching}
              className="bg-accent text-white px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50 shadow-button"
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Go"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Quick suggestions */}
      {options.length === 0 && !searching && (
        <div className="flex gap-2 overflow-x-auto mt-3 pb-1 scrollbar-hide -mx-1 px-1">
          {quickIdeas.map((s) => (
            <button
              key={s.label}
              onClick={() => { setQuery(s.label); handleSearch(s.label); }}
              disabled={searching}
              className="flex-shrink-0 text-[13px] bg-card text-muted px-3.5 py-2 rounded-2xl shadow-soft font-medium hover:text-accent hover:shadow-card transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="mr-1">{s.emoji}</span> {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {searching && (
        <div className="flex items-center gap-3 py-8 justify-center animate-fade-up">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted font-medium">Finding &quot;{query}&quot; recipes...</span>
        </div>
      )}

      {/* Results */}
      {options.length > 0 && (
        <div className="mt-4 space-y-2.5 animate-fade-up">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted px-1">Pick one</p>
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => { onOptionPicked(opt); setOptions([]); setQuery(""); }}
              disabled={searching}
              className="w-full text-left bg-card rounded-2xl p-4 shadow-card hover:shadow-lifted transition-all active:scale-[0.98] disabled:opacity-50 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[15px] group-hover:text-accent transition-colors">{opt.name}</h4>
                  <p className="text-[12px] text-muted mt-0.5 leading-relaxed">{opt.description}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0 group-hover:bg-accent transition-colors">
                  <svg className="w-4 h-4 text-accent group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {opt.ingredients.slice(0, 6).map((ing, j) => (
                  <span key={j} className="text-[11px] bg-sand text-muted px-2.5 py-0.5 rounded-full">{ing}</span>
                ))}
                {opt.ingredients.length > 6 && (
                  <span className="text-[11px] text-muted/60 px-1">+{opt.ingredients.length - 6}</span>
                )}
              </div>
            </button>
          ))}
          <button onClick={() => setOptions([])}
            className="text-xs text-muted hover:text-accent font-semibold w-full text-center py-2 transition-colors">
            Clear results
          </button>
        </div>
      )}
    </div>
  );
}
