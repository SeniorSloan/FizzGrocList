"use client";

import { useState } from "react";

export type Recipe = {
  title: string;
  description?: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: string[];
  steps: string[];
  tips: string;
};

/** Scale a quantity string like "1 lb" or "2 cups" by a ratio */
function scaleIngredient(ing: string, ratio: number): string {
  if (ratio === 1) return ing;
  // Match leading number (including fractions like 1/2, decimals like 1.5)
  return ing.replace(/^([\d]+(?:\.[\d]+)?(?:\s*\/\s*[\d]+)?)\s*/, (match, num) => {
    const parts = num.trim().split("/");
    let value: number;
    if (parts.length === 2) {
      value = parseFloat(parts[0]) / parseFloat(parts[1]);
    } else {
      value = parseFloat(parts[0]);
    }
    const scaled = value * ratio;
    // Format nicely
    if (scaled === Math.floor(scaled)) return `${scaled} `;
    return `${Math.round(scaled * 10) / 10} `;
  });
}

export default function RecipeModal({ recipe, onClose, onAddToList, addedToList, isFavorite, onToggleFavorite }: {
  recipe: Recipe; onClose: () => void; onAddToList: (scaledIngredients: string[]) => void; addedToList: boolean;
  isFavorite: boolean; onToggleFavorite: () => void;
}) {
  const [servings, setServings] = useState(recipe.servings);
  const ratio = servings / recipe.servings;
  const scaledIngredients = recipe.ingredients.map((ing) => scaleIngredient(ing, ratio));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card rounded-t-3xl sm:rounded-3xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-card px-5 pt-5 pb-4 rounded-t-3xl z-10">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-bold leading-tight tracking-tight flex-1">{recipe.title}</h2>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={onToggleFavorite}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  isFavorite ? "bg-accent-light" : "bg-sand hover:bg-accent-light"
                }`}>
                <svg className={`w-4 h-4 transition-colors ${isFavorite ? "text-accent fill-accent" : "text-muted"}`}
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  fill={isFavorite ? "currentColor" : "none"}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-muted hover:text-foreground transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {recipe.description && (
            <p className="text-xs text-muted mt-1 leading-relaxed">{recipe.description}</p>
          )}

          {/* Meta with adjustable servings */}
          <div className="flex gap-3 mt-3">
            <div className="flex-1 bg-sand rounded-xl py-2.5 px-3 text-center">
              <div className="text-sm mb-0.5">🕐</div>
              <div className="text-xs font-bold">{recipe.prepTime}</div>
              <div className="text-[10px] text-muted">Prep</div>
            </div>
            <div className="flex-1 bg-sand rounded-xl py-2.5 px-3 text-center">
              <div className="text-sm mb-0.5">🍳</div>
              <div className="text-xs font-bold">{recipe.cookTime}</div>
              <div className="text-[10px] text-muted">Cook</div>
            </div>
            {/* Adjustable servings */}
            <div className="flex-1 bg-accent-light rounded-xl py-2 px-2 text-center">
              <div className="text-sm mb-0.5">👤</div>
              <div className="flex items-center justify-center gap-1.5">
                <button onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-5 h-5 rounded-full bg-card shadow-soft flex items-center justify-center text-accent text-xs font-bold active:scale-90 transition-transform">
                  -
                </button>
                <span className="text-xs font-bold w-4 text-center">{servings}</span>
                <button onClick={() => setServings(Math.min(12, servings + 1))}
                  className="w-5 h-5 rounded-full bg-card shadow-soft flex items-center justify-center text-accent text-xs font-bold active:scale-90 transition-transform">
                  +
                </button>
              </div>
              <div className="text-[10px] text-accent-dark font-medium">Servings</div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-4 space-y-5">
          {/* Ingredients — scaled */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Ingredients</h3>
              {ratio !== 1 && (
                <span className="text-[10px] text-accent font-semibold bg-accent-light px-2 py-0.5 rounded-full">
                  Scaled to {servings} servings
                </span>
              )}
            </div>
            <div className="bg-sand rounded-2xl p-4 space-y-2.5">
              {scaledIngredients.map((ing, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span>{ing}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Instructions</h3>
            <div className="space-y-4">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-3.5">
                  <div className="w-7 h-7 bg-accent-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-accent">{i + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {recipe.tips && (
            <div className="bg-warm rounded-2xl p-4">
              <p className="text-xs leading-relaxed">
                <span className="font-bold">💡 Tip: </span>{recipe.tips}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-card px-5 py-4 space-y-2">
          <button onClick={() => onAddToList(scaledIngredients)} disabled={addedToList}
            className={`w-full py-3.5 rounded-full text-sm font-bold transition-all active:scale-[0.98] ${
              addedToList
                ? "bg-sage-light text-sage"
                : "bg-accent text-white hover:bg-accent-dark shadow-button"
            }`}>
            {addedToList ? `✓ Added (${servings} servings)` : `Add to Grocery List (${servings} servings)`}
          </button>
          <button onClick={onToggleFavorite}
            className={`w-full py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.98] ${
              isFavorite ? "bg-accent-light text-accent" : "bg-sand text-muted hover:text-accent"
            }`}>
            {isFavorite ? "♥ Saved to Favorites" : "♡ Save to Favorites"}
          </button>
        </div>
      </div>
    </div>
  );
}
