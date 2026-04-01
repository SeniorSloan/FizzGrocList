"use client";

import { useState } from "react";

export type PantryItem = { name: string; category: string; inStock: boolean; };

const EMOJI: Record<string, string> = {
  "Spices & Seasonings": "🌶️", "Oils & Sauces": "🫒", "Pantry Staples": "🫘", "Baking": "🧁", "Other": "📦",
};

export default function Pantry({ items, onToggle, onAddCustom }: {
  items: PantryItem[]; onToggle: (i: number) => void; onAddCustom: (name: string, category: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState("");

  const grouped: Record<string, { item: PantryItem; index: number }[]> = {};
  items.forEach((item, index) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push({ item, index });
  });
  const inStockCount = items.filter((i) => i.inStock).length;
  const totalCount = items.length;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Pantry</h2>
          <p className="text-[13px] text-muted mt-1 font-medium">
            {inStockCount} of {totalCount} items in stock
          </p>
        </div>
        <button onClick={() => setAdding(true)}
          className="text-[13px] bg-card text-accent px-4 py-2 rounded-2xl font-semibold shadow-card hover:shadow-lifted transition-all active:scale-95">
          + Add Item
        </button>
      </div>

      {/* Info card */}
      <div className="bg-warm rounded-2xl p-4 mb-6 flex gap-3">
        <span className="text-lg flex-shrink-0">💡</span>
        <p className="text-[13px] leading-relaxed">
          <span className="font-bold">How it works: </span>
          Items you have in stock won&apos;t show up on your grocery list. Toggle them off when you run out.
        </p>
      </div>

      {/* Add item */}
      {adding && (
        <div className="bg-card rounded-2xl shadow-card p-4 mb-6 animate-fade-up">
          <div className="flex gap-2">
            <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Item name..."
              className="flex-1 text-[15px] bg-sand rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/20" autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && newItem.trim()) { onAddCustom(newItem.trim(), "Other"); setNewItem(""); setAdding(false); } }}
            />
            <button onClick={() => { if (newItem.trim()) { onAddCustom(newItem.trim(), "Other"); setNewItem(""); setAdding(false); } }}
              className="bg-accent text-white px-5 py-3 rounded-xl text-sm font-bold shadow-button active:scale-95 transition-all">Add</button>
            <button onClick={() => { setAdding(false); setNewItem(""); }} className="text-muted text-sm font-semibold px-2">Cancel</button>
          </div>
        </div>
      )}

      {/* Pantry grid by category */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, entries]) => (
          <div key={category} className="animate-fade-up">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-base">{EMOJI[category] || "📦"}</span>
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-muted">{category}</h3>
              <div className="flex-1 h-px bg-border ml-2" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {entries.map(({ item, index }) => (
                <button key={index} onClick={() => onToggle(index)}
                  className={`flex items-center gap-2.5 px-3.5 py-3.5 rounded-2xl text-[13px] transition-all active:scale-[0.97] ${
                    item.inStock
                      ? "bg-sage-light text-foreground shadow-card font-semibold"
                      : "bg-card text-muted/60 shadow-soft"
                  }`}>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    item.inStock ? "bg-sage" : "border-2 border-border"
                  }`}>
                    {item.inStock && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
