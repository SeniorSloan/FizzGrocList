"use client";

import { MealStyle } from "@/lib/meal-styles";

export default function StylePicker({
  styles,
  selected,
  onSelect,
  loading,
}: {
  styles: MealStyle[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  loading: boolean;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      {/* "All" chip */}
      <button
        onClick={() => onSelect(null)}
        disabled={loading}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 ${
          selected === null
            ? "bg-accent text-white shadow-button"
            : "bg-card text-muted shadow-soft hover:text-foreground"
        }`}
      >
        ✨ All Ideas
      </button>

      {styles.map((style) => (
        <button
          key={style.id}
          onClick={() => onSelect(selected === style.id ? null : style.id)}
          disabled={loading}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 ${
            selected === style.id
              ? "bg-accent text-white shadow-button"
              : "bg-card text-muted shadow-soft hover:text-foreground"
          }`}
        >
          <span>{style.icon}</span>
          {style.label}
        </button>
      ))}
    </div>
  );
}
