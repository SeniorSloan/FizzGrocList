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

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold">My Pantry</h2>
          <p className="text-xs text-muted mt-0.5">{inStockCount} items in stock</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="text-xs bg-accent-light text-accent px-3 py-1.5 rounded-full font-semibold hover:bg-accent hover:text-white transition-all active:scale-95">
          + Add Item
        </button>
      </div>

      <div className="bg-warm rounded-2xl p-4 mb-6">
        <p className="text-xs leading-relaxed">
          <span className="font-bold">How it works:</span> Items marked in stock won&apos;t appear on your grocery list. Toggle off when you run out.
        </p>
      </div>

      {adding && (
        <div className="bg-card rounded-2xl shadow-soft p-4 mb-5 flex gap-2">
          <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Item name..."
            className="flex-1 text-sm bg-sand rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/30" autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && newItem.trim()) { onAddCustom(newItem.trim(), "Other"); setNewItem(""); setAdding(false); } }}
          />
          <button onClick={() => { if (newItem.trim()) { onAddCustom(newItem.trim(), "Other"); setNewItem(""); setAdding(false); } }}
            className="bg-accent text-white px-4 py-2.5 rounded-xl text-sm font-semibold">Add</button>
          <button onClick={() => { setAdding(false); setNewItem(""); }} className="text-muted text-sm px-2">Cancel</button>
        </div>
      )}

      <div className="space-y-5">
        {Object.entries(grouped).map(([category, entries]) => (
          <div key={category}>
            <div className="flex items-center gap-1.5 mb-2.5 px-1">
              <span className="text-sm">{EMOJI[category] || "📦"}</span>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted">{category}</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {entries.map(({ item, index }) => (
                <button key={index} onClick={() => onToggle(index)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm transition-all active:scale-[0.98] ${
                    item.inStock
                      ? "bg-sage-light text-foreground shadow-soft font-medium"
                      : "bg-card text-muted shadow-soft opacity-60"
                  }`}>
                  <div className={`w-4.5 h-4.5 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                    item.inStock ? "bg-sage" : "border-2 border-gray-300"
                  }`}>
                    {item.inStock && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
