"use client";

import { useState, useRef } from "react";
import { GroceryItem, categorizeIngredient } from "@/lib/build-grocery-list";
import { FAVORITES } from "@/lib/staples";

const AISLE_EMOJI: Record<string, string> = {
  "Produce": "🥬", "Meat & Protein": "🥩", "Dairy & Eggs": "🧀",
  "Pantry & Grains": "🫘", "Frozen": "🧊", "Bakery": "🍞",
  "Sauces & Condiments": "🫙", "Drinks": "🥤", "Snacks": "🍿",
  "Household": "🧹", "Other": "📦",
};

// Preferred aisle order for a natural shopping flow
const AISLE_ORDER = [
  "Produce", "Bakery", "Deli", "Meat & Protein", "Dairy & Eggs",
  "Pantry & Grains", "Sauces & Condiments", "Frozen", "Drinks",
  "Snacks", "Household", "Other",
];

export default function GroceryList({ items, onToggle, onClear, onAddItem, onDelete, onEditName }: {
  items: GroceryItem[]; onToggle: (i: number) => void; onClear: () => void;
  onAddItem: (item: GroceryItem) => void; onDelete: (i: number) => void; onEditName: (i: number, name: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [customItem, setCustomItem] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [showChecked, setShowChecked] = useState(true);
  const [recentlyChecked, setRecentlyChecked] = useState<Set<number>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCheck = (index: number) => {
    setRecentlyChecked((prev) => new Set(prev).add(index));
    setTimeout(() => {
      onToggle(index);
      setRecentlyChecked((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 300);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
        <div className="w-24 h-24 bg-accent-light rounded-3xl flex items-center justify-center mb-6 shadow-card">
          <span className="text-5xl">🛒</span>
        </div>
        <h2 className="text-xl font-extrabold mb-2">Your list is empty</h2>
        <p className="text-muted text-[14px] max-w-[260px] mb-8 leading-relaxed">
          Head to the Plan tab to pick meals, or add items manually below
        </p>
        <div className="w-full max-w-sm">
          <div className="flex gap-2">
            <input type="text" value={customItem} onChange={(e) => setCustomItem(e.target.value)}
              placeholder="Add an item..."
              className="flex-1 text-[15px] bg-card shadow-card rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:shadow-lifted transition-all"
              onKeyDown={(e) => { if (e.key === "Enter" && customItem.trim()) { onAddItem({ name: customItem.trim(), category: categorizeIngredient(customItem.trim()), checked: false }); setCustomItem(""); } }}
            />
            <button onClick={() => { if (customItem.trim()) { onAddItem({ name: customItem.trim(), category: categorizeIngredient(customItem.trim()), checked: false }); setCustomItem(""); } }}
              className="bg-accent text-white px-5 py-3.5 rounded-2xl text-sm font-bold shadow-button active:scale-95 transition-all min-h-[44px]">
              Add
            </button>
          </div>
          {/* Quick favorites */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {FAVORITES.slice(0, 8).map((fav, i) => (
              <button key={i} onClick={() => onAddItem({ ...fav, checked: false })}
                className="text-[13px] bg-card text-muted px-3.5 py-2 rounded-xl shadow-soft font-medium hover:text-accent hover:shadow-card transition-all active:scale-95 min-h-[36px]">
                + {fav.name}
              </button>
            ))}
          </div>
        </div>
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

  // Sort aisles by preferred shopping order
  const sortedAisles = Object.entries(grouped).sort(([a], [b]) => {
    const aIdx = AISLE_ORDER.indexOf(a);
    const bIdx = AISLE_ORDER.indexOf(b);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  const existingNames = new Set(items.map((i) => i.name.toLowerCase()));
  const progress = items.length > 0 ? (checked.length / items.length) * 100 : 0;
  const allDone = progress === 100;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Grocery List</h2>
          <p className="text-[13px] text-muted mt-1 font-medium">
            {unchecked.length} item{unchecked.length !== 1 ? "s" : ""} to get
            {checked.length > 0 ? ` \u00b7 ${checked.length} done` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowAdd(!showAdd); if (!showAdd) setTimeout(() => inputRef.current?.focus(), 100); }}
            className={`text-[13px] px-4 py-2.5 rounded-2xl font-semibold transition-all active:scale-95 min-h-[44px] ${
              showAdd ? "bg-accent text-white shadow-button" : "bg-card text-accent shadow-card"
            }`}>
            + Add
          </button>
          {items.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowClearConfirm(!showClearConfirm)}
                className="text-[13px] text-muted hover:text-danger font-semibold px-3 py-2.5 min-h-[44px] transition-colors">
                Clear
              </button>
              {showClearConfirm && (
                <div className="absolute top-full right-0 mt-1 bg-card rounded-2xl shadow-lifted p-3 z-10 animate-fade-up w-48">
                  <p className="text-[12px] text-muted mb-2 font-medium">Clear all {items.length} items?</p>
                  <div className="flex gap-2">
                    <button onClick={() => { onClear(); setShowClearConfirm(false); }}
                      className="flex-1 bg-danger text-white text-[12px] font-bold py-2 rounded-xl active:scale-95 transition-all">
                      Yes, clear
                    </button>
                    <button onClick={() => setShowClearConfirm(false)}
                      className="flex-1 bg-sand text-muted text-[12px] font-bold py-2 rounded-xl active:scale-95 transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className={`bg-card rounded-2xl p-4 mb-6 shadow-card transition-all duration-500 ${allDone ? "animate-celebrate progress-complete" : ""}`}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[13px] font-semibold text-muted">
            {allDone ? "All done! 🎉" : progress > 75 ? "Almost there! 💪" : "Shopping progress"}
          </span>
          <span className={`text-[14px] font-extrabold transition-colors ${allDone ? "text-sage" : "text-accent"}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-3.5 bg-sand rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              allDone
                ? "bg-gradient-to-r from-sage to-emerald-400"
                : progress > 75
                ? "bg-gradient-to-r from-accent via-pink-400 to-pink-300"
                : "bg-gradient-to-r from-accent to-pink-300"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-muted/60 mt-2 font-medium">
          {checked.length} of {items.length} items in cart
        </p>
      </div>

      {/* Quick add panel */}
      {showAdd && (
        <div className="bg-card rounded-2xl p-4 mb-6 shadow-card animate-fade-up">
          {/* Mode toggle */}
          <div className="flex gap-2 mb-3">
            <button onClick={() => setPasteMode(false)}
              className={`text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all min-h-[40px] ${!pasteMode ? "bg-accent text-white shadow-button" : "bg-sand text-muted"}`}>
              Single Item
            </button>
            <button onClick={() => setPasteMode(true)}
              className={`text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all min-h-[40px] ${pasteMode ? "bg-accent text-white shadow-button" : "bg-sand text-muted"}`}>
              Paste List
            </button>
          </div>

          {!pasteMode ? (
            <>
              <div className="flex gap-2 mb-3">
                <input ref={inputRef} type="text" value={customItem} onChange={(e) => setCustomItem(e.target.value)}
                  placeholder="What do you need?"
                  className="flex-1 text-[16px] bg-sand rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent/20"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter" && customItem.trim()) { onAddItem({ name: customItem.trim(), category: categorizeIngredient(customItem.trim()), checked: false }); setCustomItem(""); } }}
                />
                <button onClick={() => { if (customItem.trim()) { onAddItem({ name: customItem.trim(), category: categorizeIngredient(customItem.trim()), checked: false }); setCustomItem(""); } }}
                  className="bg-accent text-white px-5 py-3.5 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-button min-h-[44px] min-w-[44px]">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {FAVORITES.filter((f) => !existingNames.has(f.name.toLowerCase())).slice(0, 10).map((fav, i) => (
                  <button key={i} onClick={() => onAddItem({ ...fav, checked: false })}
                    className="text-[13px] bg-sand text-muted px-3.5 py-2 rounded-lg font-medium hover:text-accent hover:bg-accent-light transition-all active:scale-95 min-h-[36px]">
                    + {fav.name}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)}
                placeholder={"Paste your list here...\ne.g.\nchicken breast\nbroccoli\nrice\navocados"}
                className="w-full h-36 text-[15px] bg-sand rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 mb-3 leading-relaxed"
                autoFocus />
              <button onClick={() => {
                if (!pasteText.trim()) return;
                const parsed = pasteText
                  .split(/[\n,]+/)
                  .map((line) => line.replace(/^[-\u2022*\[\]x\s]+/i, "").trim())
                  .filter((line) => line.length > 0 && line.length < 80);
                for (const item of parsed) {
                  if (!existingNames.has(item.toLowerCase())) {
                    onAddItem({ name: item, category: categorizeIngredient(item), checked: false });
                  }
                }
                setPasteText("");
                setPasteMode(false);
                setShowAdd(false);
              }}
                className="w-full bg-accent text-white py-4 rounded-xl text-[15px] font-bold active:scale-[0.98] transition-all shadow-button min-h-[48px]">
                Add All Items
              </button>
            </>
          )}
        </div>
      )}

      {/* Items by aisle */}
      <div className="space-y-8">
        {sortedAisles.map(([category, entries]) => (
          <div key={category} className="animate-fade-up">
            {/* Aisle header */}
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <span className="text-lg">{AISLE_EMOJI[category] || "📦"}</span>
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-muted">{category}</h3>
              <div className="flex-1 h-px bg-border ml-2" />
              <span className="text-[11px] text-muted/50 font-bold bg-sand px-2 py-0.5 rounded-full">{entries.length}</span>
            </div>

            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              {entries.map(({ item, index }, entryIdx) => {
                const isChecking = recentlyChecked.has(index);
                return (
                  <div key={index}
                    className={`grocery-item-check flex items-center gap-4 px-4 py-4 ${
                      entryIdx < entries.length - 1 ? "border-b border-border/40" : ""
                    } ${isChecking ? "checking" : ""}`}>
                    {/* Checkbox — 44px tap target */}
                    <button onClick={() => handleCheck(index)}
                      className="w-11 h-11 flex items-center justify-center flex-shrink-0 -ml-1">
                      <div className={`w-7 h-7 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                        isChecking
                          ? "bg-sage border-sage scale-110"
                          : "border-border/80 hover:border-accent/50 active:scale-90"
                      }`}>
                        {isChecking && (
                          <svg className="w-3.5 h-3.5 text-white animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>

                    {/* Name — tap to edit, large text for shopping */}
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => { if (editText.trim()) onEditName(index, editText.trim()); setEditingIndex(null); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { if (editText.trim()) onEditName(index, editText.trim()); setEditingIndex(null); }
                          if (e.key === "Escape") setEditingIndex(null);
                        }}
                        className="flex-1 text-[16px] font-medium bg-sand rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/20"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => { setEditingIndex(index); setEditText(item.name); }}
                        className="flex-1 text-left text-[16px] font-medium min-w-0 py-1 active:text-accent transition-colors"
                      >
                        <span className="line-clamp-2">{item.name}</span>
                      </button>
                    )}

                    {/* Delete — 44px tap target */}
                    <button onClick={() => onDelete(index)}
                      className="w-11 h-11 flex items-center justify-center flex-shrink-0 -mr-1 rounded-xl text-muted/30 hover:text-danger hover:bg-danger-light transition-all active:scale-90">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Checked / In Cart */}
      {checked.length > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setShowChecked(!showChecked)}
            className="flex items-center gap-2.5 mb-3 px-1 w-full min-h-[44px]"
          >
            <div className="w-7 h-7 rounded-full bg-sage/10 flex items-center justify-center">
              <svg className={`w-3.5 h-3.5 text-sage transition-transform duration-200 ${showChecked ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-sage">In Cart</h3>
            <span className="text-[12px] font-bold text-sage bg-sage-light px-2.5 py-0.5 rounded-full">{checked.length}</span>
            <div className="flex-1 h-px bg-sage/10 ml-2" />
          </button>
          {showChecked && (
            <div className="bg-card/60 rounded-2xl shadow-soft overflow-hidden">
              {checked.map(({ item, index }, entryIdx) => (
                <button key={index} onClick={() => onToggle(index)}
                  className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-all active:bg-sand/50 min-h-[52px] ${
                    entryIdx < checked.length - 1 ? "border-b border-border/30" : ""
                  }`}>
                  <div className="w-7 h-7 rounded-xl bg-sage flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[15px] text-muted line-through decoration-muted/30 flex-1">{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
