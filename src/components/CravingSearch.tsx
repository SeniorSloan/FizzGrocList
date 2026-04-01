"use client";

import { useState } from "react";

type SearchOption = {
  name: string;
  description: string;
  ingredients: string[];
};

export default function CravingSearch({
  onOptionPicked,
  loading,
}: {
  onOptionPicked: (option: SearchOption) => void;
  loading: boolean;
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
    } catch (e) {
      console.error(e);
    }
    setSearching(false);
  };

  return (
    <div className="bg-card rounded-2xl shadow-soft p-4 mb-6">
      <h3 className="text-sm font-bold mb-1">Craving something?</h3>
      <p className="text-[11px] text-muted mb-3">
        Search for anything and we&apos;ll find healthy recipe options
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "chicken tacos" or "something cozy"'
          className="flex-1 text-sm bg-sand rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-accent/30"
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(query); }}
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={!query.trim() || searching}
          className="bg-accent text-white px-4 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
        >
          {searching ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Search"
          )}
        </button>
      </div>

      {/* Quick suggestions */}
      {options.length === 0 && !searching && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {["chicken tacos", "something spicy", "pasta", "stir fry", "soup", "salad", "comfort food"].map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); handleSearch(s); }}
              disabled={searching}
              className="text-[11px] bg-sand text-muted px-2.5 py-1 rounded-full hover:text-accent transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {searching && (
        <div className="flex items-center gap-2 py-6 justify-center">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted">Finding recipes for &quot;{query}&quot;...</span>
        </div>
      )}

      {/* Results */}
      {options.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Pick a recipe</p>
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => { onOptionPicked(opt); setOptions([]); setQuery(""); }}
              disabled={loading}
              className="w-full text-left bg-sand rounded-xl p-3 hover:bg-accent-light transition-colors active:scale-[0.99] disabled:opacity-50"
            >
              <h4 className="font-semibold text-sm">{opt.name}</h4>
              <p className="text-[11px] text-muted mt-0.5">{opt.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {opt.ingredients.map((ing, j) => (
                  <span key={j} className="text-[10px] bg-card text-muted px-2 py-0.5 rounded-full">{ing}</span>
                ))}
              </div>
            </button>
          ))}
          <button onClick={() => setOptions([])}
            className="text-xs text-muted hover:text-foreground font-medium w-full text-center py-1">
            Clear results
          </button>
        </div>
      )}
    </div>
  );
}
