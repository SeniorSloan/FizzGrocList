"use client";

import { MealPlan } from "@/app/page";

export default function MealSection({
  title, subtitle, meals, selectedMeals, plannedMeals, onToggle, onMealClick, onDismiss, onRefresh, loading, loadingRecipe,
}: {
  title: string; subtitle: string; meals: MealPlan[]; selectedMeals: Set<number>; plannedMeals: string[];
  onToggle: (i: number) => void; onMealClick: (m: MealPlan) => void; onDismiss: (i: number) => void;
  onRefresh: () => void; loading: boolean; loadingRecipe: string | null;
}) {
  if (loading && meals.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{title}</h3>
        <div className="flex items-center gap-2 py-10 justify-center">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted">Finding ideas...</span>
        </div>
      </div>
    );
  }
  if (meals.length === 0) return null;

  const plannedSet = new Set(plannedMeals);
  const allPlanned = meals.every((m) => plannedSet.has(m.name));

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{title}</h3>
          <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>
        </div>
        <button onClick={onRefresh} disabled={loading}
          className="text-xs bg-accent-light text-accent px-3 py-1.5 rounded-full font-semibold hover:bg-accent hover:text-white transition-all disabled:opacity-50 active:scale-95">
          ↻ New Ideas
        </button>
      </div>

      {/* All planned banner */}
      {allPlanned && plannedMeals.length > 0 && (
        <div className="bg-sage-light rounded-2xl p-4 mb-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-sage">{title} planned!</p>
            <p className="text-[11px] text-muted">List built and recipes saved. Tap &quot;New Ideas&quot; to start fresh.</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {meals.map((meal, i) => {
          const sel = selectedMeals.has(i);
          const planned = plannedSet.has(meal.name);

          return (
            <div key={i}
              className={`bg-card rounded-2xl shadow-soft transition-all duration-200 ${
                planned ? "opacity-60" :
                sel ? "shadow-lifted ring-2 ring-accent/30" : ""
              }`}>
              <div className="flex items-start gap-3.5 p-4">
                {/* Checkbox or planned indicator */}
                <button onClick={() => !planned && onToggle(i)} className="mt-0.5 flex-shrink-0" disabled={planned}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    planned ? "bg-sage border-sage" :
                    sel ? "bg-accent border-accent scale-110" : "border-gray-300 hover:border-accent/50"
                  }`}>
                    {(sel || planned) && (
                      <svg className="w-3.5 h-3.5 text-white animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Meal info */}
                <button onClick={() => onMealClick(meal)} disabled={loadingRecipe === meal.name}
                  className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold text-[15px] leading-snug ${planned ? "text-muted" : "text-foreground"}`}>
                      {meal.name}
                    </h4>
                    {planned && (
                      <span className="text-[10px] bg-sage-light text-sage font-bold px-2 py-0.5 rounded-full">Planned</span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{meal.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {meal.ingredients.map((ing, j) => (
                      <span key={j} className="text-[11px] bg-sand text-muted px-2 py-0.5 rounded-full">{ing}</span>
                    ))}
                  </div>
                </button>

                {/* Actions */}
                {!planned && (
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    {loadingRecipe === meal.name ? (
                      <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <button onClick={() => onMealClick(meal)}
                          className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all active:scale-95">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <button onClick={() => onDismiss(i)}
                          className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-muted hover:bg-danger-light hover:text-danger transition-all active:scale-95">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
