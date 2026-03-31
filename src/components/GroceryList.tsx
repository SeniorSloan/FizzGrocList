"use client";

import { useState } from "react";
import { GroceryItem } from "@/app/page";
import { FAVORITES } from "@/lib/staples";

const AISLE_EMOJI: Record<string, string> = {
  "Produce": "🥬", "Meat & Protein": "🥩", "Dairy & Eggs": "🧀",
  "Pantry & Grains": "🫘", "Frozen": "🧊", "Bakery": "🍞",
  "Sauces & Condiments": "🫙", "Drinks": "🥤", "Snacks": "🍿",
  "Household": "🧹", "Other": "📦",
};

export default function GroceryList({ items, onToggle, onClear, onAddItem }: {
  items: GroceryItem[]; onToggle: (i: number) => void; onClear: () => void;
  onAddItem: (item: GroceryItem) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [customItem, setCustomItem] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center mb-5">
          <span className="text-4xl">🛒</span>
        </div>
        <h2 className="text-lg font-bold mb-1">Your list is empty</h2>
        <p className="text-muted text-sm max-w-[260px] mb-6">
          Pick meals from the Plan tab or add your go-to items below
        </p>
        <button onClick={() => setShowAdd(true)}
          className="bg-accent text-white px-8 py-3.5 rounded-full text-sm font-semibold shadow-button active:scale-[0.98] transition-transform">
          + Start Adding Items
        </button>
        {showAdd && (
          <div className="mt-5 w-full max-w-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Your Favorites</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {FAVORITES.map((fav, i) => (
                <button key={i} onClick={() => onAddItem({ ...fav, checked: false })}
                  className="text-xs bg-card shadow-soft text-foreground px-3 py-1.5 rounded-full hover:shadow-lifted hover:text-accent transition-all">
                  + {fav.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const unchecked = items.map((item, index) => ({ item, index })).filter(({ item }) => !item.checked);
  const checked = items.map((item, index) => ({ item, index })).filter(({ item }) => item.checked);
  const grouped: Record<string, { item: GroceryItem; index: number }[]> = {};
  unchecked.forEach(({ item, index }) => {
    const cat = item.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ item, index });
  });
  const existingNames = new Set(items.map((i) => i.name.toLowerCase()));
  const progress = items.length > 0 ? (checked.length / items.length) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold">Grocery List</h2>
          <p className="text-xs text-muted mt-0.5">
            {unchecked.length} to get{checked.length > 0 ? ` · ${checked.length} in cart` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(!showAdd)}
            className="text-xs bg-accent-light text-accent px-3 py-1.5 rounded-full font-semibold hover:bg-accent hover:text-white transition-all active:scale-95">
            + Add
          </button>
          <button onClick={onClear} className="text-xs text-muted hover:text-danger font-medium px-2 py-1.5">Clear</button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-2xl p-4 mb-5 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted">Shopping progress</span>
          <span className="text-xs font-bold text-accent">{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 bg-sand rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent to-pink-300 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Quick add */}
      {showAdd && (
        <div className="bg-card rounded-2xl p-4 mb-5 shadow-soft">
          {/* Toggle between single add and paste */}
          <div className="flex gap-2 mb-3">
            <button onClick={() => setPasteMode(false)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${!pasteMode ? "bg-accent text-white" : "bg-sand text-muted"}`}>
              Single Item
            </button>
            <button onClick={() => setPasteMode(true)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${pasteMode ? "bg-accent text-white" : "bg-sand text-muted"}`}>
              Paste a List
            </button>
          </div>

          {!pasteMode ? (
            <>
              <div className="flex gap-2 mb-3">
                <input type="text" value={customItem} onChange={(e) => setCustomItem(e.target.value)}
                  placeholder="Add anything..."
                  className="flex-1 text-sm bg-sand rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/30"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter" && customItem.trim()) { onAddItem({ name: customItem.trim(), category: "Other", checked: false }); setCustomItem(""); } }}
                />
                <button onClick={() => { if (customItem.trim()) { onAddItem({ name: customItem.trim(), category: "Other", checked: false }); setCustomItem(""); } }}
                  className="bg-accent text-white px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FAVORITES.filter((f) => !existingNames.has(f.name.toLowerCase())).slice(0, 10).map((fav, i) => (
                  <button key={i} onClick={() => onAddItem({ ...fav, checked: false })}
                    className="text-[11px] bg-sand text-muted px-2.5 py-1 rounded-full hover:text-accent transition-colors">
                    + {fav.name}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)}
                placeholder={"Paste a grocery list here...\ne.g.\nchicken breast\nbroccoli\nrice\navocados"}
                className="w-full h-32 text-sm bg-sand rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 mb-3"
                autoFocus />
              <button onClick={() => {
                if (!pasteText.trim()) return;
                const parsed = pasteText
                  .split(/[\n,]+/)
                  .map((line) => line.replace(/^[-•*\[\]x\s]+/i, "").trim())
                  .filter((line) => line.length > 0 && line.length < 80);
                for (const item of parsed) {
                  if (!existingNames.has(item.toLowerCase())) {
                    onAddItem({ name: item, category: "Other", checked: false });
                  }
                }
                setPasteText("");
                setPasteMode(false);
              }}
                className="w-full bg-accent text-white py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform">
                Add All Items
              </button>
            </>
          )}
        </div>
      )}

      {/* Items by aisle */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([category, entries]) => (
          <div key={category}>
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <span className="text-sm">{AISLE_EMOJI[category] || "📦"}</span>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted">{category}</h3>
              <span className="text-[10px] text-muted ml-auto">{entries.length}</span>
            </div>
            <div className="bg-card rounded-2xl shadow-soft overflow-hidden divide-y divide-border">
              {entries.map(({ item, index }) => (
                <button key={index} onClick={() => onToggle(index)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-sand/50 active:bg-sand">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  <span className="text-[15px]">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Checked */}
      {checked.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <span className="text-sm">✅</span>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted">In Cart</h3>
            <span className="text-[10px] text-muted ml-auto">{checked.length}</span>
          </div>
          <div className="bg-card/60 rounded-2xl shadow-soft overflow-hidden divide-y divide-border">
            {checked.map(({ item, index }) => (
              <button key={index} onClick={() => onToggle(index)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-sand/30">
                <div className="w-6 h-6 rounded-full bg-sage border-2 border-sage flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[15px] text-muted line-through">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
