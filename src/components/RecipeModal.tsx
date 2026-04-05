"use client";

import { useState } from "react";

export type Recipe = {
  title: string;
  emoji?: string;
  imageUrl?: string;
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
  return ing.replace(/^([\d]+(?:\.[\d]+)?(?:\s*\/\s*[\d]+)?)\s*/, (match, num) => {
    const parts = num.trim().split("/");
    let value: number;
    if (parts.length === 2) {
      value = parseFloat(parts[0]) / parseFloat(parts[1]);
    } else {
      value = parseFloat(parts[0]);
    }
    const scaled = value * ratio;
    if (scaled === Math.floor(scaled)) return `${scaled} `;
    return `${Math.round(scaled * 10) / 10} `;
  });
}

export default function RecipeModal({ recipe, onClose, onAddToList, addedToList, isFavorite, onToggleFavorite }: {
  recipe: Recipe; onClose: () => void; onAddToList: (scaledIngredients: string[]) => void; addedToList: boolean;
  isFavorite: boolean; onToggleFavorite: () => void;
}) {
  const [servings, setServings] = useState(recipe.servings);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [justAdded, setJustAdded] = useState(false);
  const ratio = servings / recipe.servings;
  const scaledIngredients = recipe.ingredients.map((ing) => scaleIngredient(ing, ratio));

  const stepsProgress = recipe.steps.length > 0
    ? Math.round((completedSteps.size / recipe.steps.length) * 100)
    : 0;

  const toggleStep = (i: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleAddToList = () => {
    onAddToList(scaledIngredients);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 overlay-blur" />

      {/* Bottom sheet */}
      <div
        className="relative bg-card rounded-t-[28px] w-full max-w-lg max-h-[92vh] overflow-y-auto animate-slide-up safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero banner — photo or emoji gradient */}
        <div className="relative rounded-t-[28px] overflow-hidden">
          {recipe.imageUrl ? (
            /* Real food photo */
            <div className="relative h-52">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
              <div className="absolute top-3 left-0 right-0 flex justify-center">
                <div className="w-10 h-1 bg-white/50 rounded-full" />
              </div>
            </div>
          ) : (
            /* Emoji fallback */
            <div className="relative bg-gradient-to-br from-accent-light via-pink-50 to-warm pt-5 pb-10 text-center">
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-accent/5 rounded-full" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-warm-dark/5 rounded-full" />
              <div className="w-10 h-1 bg-white/50 rounded-full mx-auto mb-5" />
              <div className={`text-7xl mb-3 drop-shadow-sm ${justAdded ? "animate-bounce-in" : ""}`}>
                {recipe.emoji || "🍽️"}
              </div>
            </div>
          )}

          {/* Close + fav buttons — 44px minimum */}
          <div className="absolute top-4 left-4">
            <button onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center text-muted hover:bg-white/90 transition-all active:scale-90">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="absolute top-4 right-4">
            <button onClick={onToggleFavorite}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 backdrop-blur-sm ${
                isFavorite ? "bg-white/90" : "bg-white/60 hover:bg-white/90"
              }`}>
              <svg className={`w-5 h-5 transition-all ${isFavorite ? "text-accent fill-accent scale-110" : "text-muted"}`}
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                fill={isFavorite ? "currentColor" : "none"}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content card overlapping hero */}
        <div className="bg-card -mt-5 rounded-t-[24px] relative z-10 pt-6">
          <div className="px-5 pb-5">
            <h2 className="text-xl font-extrabold leading-tight tracking-tight">{recipe.title}</h2>
            {recipe.description && (
              <p className="text-[14px] text-muted mt-2 leading-relaxed">{recipe.description}</p>
            )}

            {/* Meta chips — more spacious */}
            <div className="flex gap-3 mt-5">
              <div className="flex-1 bg-sand rounded-2xl py-3.5 px-3 text-center">
                <div className="text-xl mb-1">🕐</div>
                <div className="text-[14px] font-bold">{recipe.prepTime}</div>
                <div className="text-[11px] text-muted font-medium mt-0.5">Prep</div>
              </div>
              <div className="flex-1 bg-sand rounded-2xl py-3.5 px-3 text-center">
                <div className="text-xl mb-1">🔥</div>
                <div className="text-[14px] font-bold">{recipe.cookTime}</div>
                <div className="text-[11px] text-muted font-medium mt-0.5">Cook</div>
              </div>
              {/* Adjustable servings — much larger tap targets */}
              <div className="flex-1 bg-accent-light rounded-2xl py-3 px-2 text-center">
                <div className="text-xl mb-1">👩‍🍳</div>
                <div className="flex items-center justify-center gap-1.5">
                  <button onClick={() => setServings(Math.max(1, servings - 1))}
                    className="w-8 h-8 rounded-xl bg-card shadow-soft flex items-center justify-center text-accent font-bold active:scale-90 transition-all text-lg leading-none">
                    &minus;
                  </button>
                  <span className="text-[16px] font-extrabold min-w-[20px] text-center text-accent-dark">{servings}</span>
                  <button onClick={() => setServings(Math.min(12, servings + 1))}
                    className="w-8 h-8 rounded-xl bg-card shadow-soft flex items-center justify-center text-accent font-bold active:scale-90 transition-all text-lg leading-none">
                    +
                  </button>
                </div>
                <div className="text-[11px] text-accent-dark font-semibold mt-1">Servings</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-8">
          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold uppercase tracking-widest text-accent">Ingredients</h3>
              {ratio !== 1 && (
                <span className="text-[11px] text-accent font-bold bg-accent-light px-2.5 py-1 rounded-lg">
                  Scaled for {servings}
                </span>
              )}
            </div>
            <div className="bg-sand rounded-2xl p-4 space-y-3.5">
              {scaledIngredients.map((ing, i) => (
                <div key={i} className="flex items-start gap-3 text-[15px]">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{ing}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold uppercase tracking-widest text-accent">Steps</h3>
              {completedSteps.size > 0 && (
                <span className="text-[11px] text-sage font-bold bg-sage-light px-2.5 py-1 rounded-lg">
                  {stepsProgress}% done
                </span>
              )}
            </div>
            <div className="space-y-3">
              {recipe.steps.map((step, i) => {
                const done = completedSteps.has(i);
                return (
                  <button key={i} onClick={() => toggleStep(i)}
                    className={`flex gap-3.5 w-full text-left p-4 rounded-2xl transition-all active:scale-[0.99] min-h-[56px] ${
                      done ? "bg-sage-light/50" : "bg-card shadow-soft hover:shadow-card"
                    }`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      done ? "bg-sage" : "bg-accent-light"
                    }`}>
                      {done ? (
                        <svg className="w-4 h-4 text-white animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-[14px] font-bold text-accent">{i + 1}</span>
                      )}
                    </div>
                    <p className={`text-[15px] leading-relaxed pt-1 transition-colors flex-1 ${done ? "text-muted line-through decoration-muted/30" : ""}`}>
                      {step}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {recipe.tips && (
            <div className="bg-warm rounded-2xl p-4 flex gap-3">
              <span className="text-xl flex-shrink-0">💡</span>
              <p className="text-[14px] leading-relaxed">
                <span className="font-bold">Pro tip: </span>{recipe.tips}
              </p>
            </div>
          )}
        </div>

        {/* Sticky actions — proper safe-area padding */}
        <div className="sticky bottom-0 bg-gradient-to-t from-card via-card to-card/0 px-5 pt-8 pb-6 space-y-3">
          <button onClick={handleAddToList} disabled={addedToList}
            className={`w-full py-4 rounded-2xl text-[16px] font-bold transition-all active:scale-[0.98] min-h-[52px] ${
              addedToList
                ? "bg-sage-light text-sage"
                : "bg-accent text-white hover:bg-accent-dark shadow-button"
            }`}>
            {addedToList ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Added to list ({servings} servings)
              </span>
            ) : (
              `Add to Grocery List (${servings} servings)`
            )}
          </button>
          <button onClick={onToggleFavorite}
            className={`w-full py-3.5 rounded-2xl text-[14px] font-semibold transition-all active:scale-[0.98] min-h-[48px] ${
              isFavorite ? "bg-accent-light text-accent" : "bg-sand text-muted hover:text-accent"
            }`}>
            {isFavorite ? "♥ Saved to Favorites" : "♡ Save to Favorites"}
          </button>
        </div>
      </div>
    </div>
  );
}
