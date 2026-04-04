"use client";

import { useState } from "react";
import { GroceryItem, categorizeIngredient } from "@/lib/build-grocery-list";
import { FAVORITES } from "@/lib/staples";

const AISLE_EMOJI: Record<string, string> = {
  "Produce": "🥬", "Meat & Protein": "🥩", "Dairy & Eggs": "🧀",
  "Pantry & Grains": "🫘", "Frozen": "🧊", "Bakery": "🍞",
  "Sauces & Condiments": "🫙", "Drinks": "🥤", "Snacks": "🍿",
  "Household": "🧹", "Other": "📦",
};

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

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
        <div className="w-24 h-24 bg-accent-light rounded-3xl flex items-center justify-center mb-6 shadow-card">
          <span className="text-5xl">🛒</span>
        </div>
        <h2 className="text-xl font-extrabold mb-2">List is empty</h2>
        <p className="text-muted text-[14px] max-w-[260px] mb-8 leading-relaxed">
          Plan some meals or add items below to get started
        </p>
        <div className="w-full max-w-sm">
          <div className="flex gap-2">
            <input type="text" value={customItem} onChange={(e) => setCustomItem(e.target.value)}
              placeholder="Add an item..."
              className="flex-1 text-[15px] bg-card shadow-card rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:shadow-lifted transition-all"
              onKeyDown={(e) => { if (e.key === "Enter" && customItem.trim()) { onAddItem({ name: customItem.trim(), category: categorizeIngredient(customItem.trim()), checked: false }); setCustomItem(""); } }}
            />
            <button onClick={() => { if (customItem.trim()) { onAddItem({ name: customItem.trim(), category: categorizeIngredient(customItem.trim()), checked: false }); setCustomItem(""); } }}
              className="bg-accent text-white px-5 py-3.5 rounded-2xl text-sm font-bold shadow-button active:scale-95 transition-all">
              Add
            </button>
          </div>
          {/* Quick favorites */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {FAVORITES.slice(0, 6).map((fav, i) => (
              <button key={i} onClick={() => onAddItem({ ...fav, checked: false })}
                className="text-[12px] bg-card text-muted px-3 py-1.5 rounded-xl shadow-soft font-medium hover:text-accent hover:shadow-card transition-all active:scale-95">
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
  const existingNames = new Set(items.map((i) => i.name.toLowerCase()));
  const progress = items.length > 0 ? (checked.length / items.length) * 100 : 0;

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
          <button onClick={() => setShowAdd(!showAdd)}
            className={`text-[13px] px-4 py-2 rounded-2xl font-semibold transition-all active:scale-95 ${
              showAdd ? "bg-accent text-white shadow-button" : "bg-card text-accent shadow-card"
            }`}>
            + Add
          </button>
          {items.length > 0 && (
            <button onClick={onClear} className="text-[13px] text-muted hover:text-danger font-semibold px-2 py-2 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card rounded-2xl p-4 mb-6 shadow-card">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[12px] font-semibold text-muted">
            {progress === 100 ? "All done! 🎉" : "Shopping progress"}
          </span>
          <span className="text-[13px] font-extrabold text-accent">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-sand rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              progress === 100
                ? "bg-gradient-to-r from-sage to-emerald-400"
                : "bg-gradient-to-r from-accent to-pink-300"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quick add panel */}
      {showAdd && (
        <div className="bg-card rounded-2xl p-4 mb-6 shadow-card animate-fade-up">
          {/* Mode toggle */}
          <div className="flex gap-2 mb-3">
            <button onClick={() => setPasteMode(false)}
              className={`text-[13px] font-semibold px-4 py-2 rounded-xl transition-all ${!pasteMode ? "bg-accent text-white shadow-button" : "bg-sand text-muted"}`}>
              Single Item
            </button>
            <button onClick={() => setPasteMode(true)}
              className={`text-[13px] font-semibold px-4 py-2 rounded-xl transition-all ${pasteMode ? "bg-accent text-white shadow-button" : "bg-sand text-muted"}`}>
              Paste List
            </button>
          </div>

          {!pasteMode ? (
            <>
              <div className="flex gap-2 mb-3">
                <input type="text" value={customItem} onChange={(e) => setCustomItem(e.target.value)}
                  placeholder="What do you need?"
                  className="flex-1 text-[15px] bg-sand rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/20"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter" && customItem.trim()) { onAddItem({ name: customItem.trim(), category: categorizeIngredient(customItem.trim()), checked: false }); setCustomItem(""); } }}
                />
                <button onClick={() => { if (customItem.trim()) { onAddItem({ name: customItem.trim(), category: categorizeIngredient(customItem.trim()), checked: false }); setCustomItem(""); } }}
                  className="bg-accent text-white px-5 py-3 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-button">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FAVORITES.filter((f) => !existingNames.has(f.name.toLowerCase())).slice(0, 10).map((fav, i) => (
                  <button key={i} onClick={() => onAddItem({ ...fav, checked: false })}
                    className="text-[12px] bg-sand text-muted px-3 py-1.5 rounded-lg font-medium hover:text-accent hover:bg-accent-light transition-all active:scale-95">
                    + {fav.name}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)}
                placeholder={"Paste your list here...\ne.g.\nchicken breast\nbroccoli\nrice\navocados"}
                className="w-full h-36 text-[14px] bg-sand rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 mb-3 leading-relaxed"
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
                className="w-full bg-accent text-white py-3.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-all shadow-button">
                Add All Items
              </button>
            </>
          )}
        </div>
      )}

      {/* Items by aisle */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, entries]) => (
          <div key={category} className="animate-fade-up">
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <span className="text-base">{AISLE_EMOJI[category] || "📦"}</span>
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-muted">{category}</h3>
              <div className="flex-1 h-px bg-border ml-2" />
              <span className="text-[11px] text-muted/60 font-semibold">{entries.length}</span>
            </div>
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              {entries.map(({ item, index }, entryIdx) => (
                <div key={index}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    entryIdx < entries.length - 1 ? "border-b border-border/50" : ""
                  }`}>
                  {/* Checkbox */}
                  <button onClick={() => onToggle(index)}
                    className="w-7 h-7 rounded-xl border-2 border-border flex-shrink-0 transition-all hover:border-accent/40 active:scale-90" />

                  {/* Name — tap to edit */}
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
                      className="flex-1 text-[15px] font-medium bg-sand rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent/20"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => { setEditingIndex(index); setEditText(item.name); }}
                      className="flex-1 text-left text-[15px] font-medium min-w-0 truncate"
                    >
                      {item.name}
                    </button>
                  )}

                  {/* Delete */}
                  <button onClick={() => onDelete(index)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted/40 hover:text-danger hover:bg-danger-light transition-all active:scale-90 flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Checked / In Cart */}
      {checked.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowChecked(!showChecked)}
            className="flex items-center gap-2 mb-3 px-1 w-full"
          >
            <div className="w-6 h-6 rounded-full bg-sage/10 flex items-center justify-center">
              <svg className={`w-3 h-3 text-sage transition-transform duration-200 ${showChecked ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-sage">In Cart</h3>
            <span className="text-[12px] font-bold text-sage bg-sage-light px-2 py-0.5 rounded-full">{checked.length}</span>
            <div className="flex-1 h-px bg-sage/10 ml-2" />
          </button>
          {showChecked && (
            <div className="bg-card/60 rounded-2xl shadow-soft overflow-hidden">
              {checked.map(({ item, index }, entryIdx) => (
                <button key={index} onClick={() => onToggle(index)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-all active:bg-sand/50 ${
                    entryIdx < checked.length - 1 ? "border-b border-border/30" : ""
                  }`}>
                  <div className="w-7 h-7 rounded-xl bg-sage flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[15px] text-muted line-through decoration-muted/30">{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
