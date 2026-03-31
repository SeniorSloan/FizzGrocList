"use client";

import { useState } from "react";

export default function CravingSearch({
  onRecipeFound,
  loading,
}: {
  onRecipeFound: (query: string) => void;
  loading: boolean;
}) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim() && !loading) {
      onRecipeFound(query.trim());
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-soft p-4 mb-6">
      <h3 className="text-sm font-bold mb-1">Craving something?</h3>
      <p className="text-[11px] text-muted mb-3">
        Type what you&apos;re in the mood for and we&apos;ll find a healthy recipe
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "something spicy" or "chicken tacos"'
          className="flex-1 text-sm bg-sand rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-accent/30"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <button
          onClick={handleSearch}
          disabled={!query.trim() || loading}
          className="bg-accent text-white px-4 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Go"
          )}
        </button>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {["chicken tacos", "something spicy", "pasta night", "stir fry", "soup", "salad bowl", "breakfast for dinner"].map((s) => (
          <button
            key={s}
            onClick={() => { setQuery(s); onRecipeFound(s); }}
            disabled={loading}
            className="text-[11px] bg-sand text-muted px-2.5 py-1 rounded-full hover:text-accent transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
