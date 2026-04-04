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
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        {/* Skeleton cards */}
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-card rounded-2xl shadow-card p-4 animate-shimmer" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-sand flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-sand rounded-lg w-3/4" />
                  <div className="h-3 bg-sand rounded-lg w-full" />
                  <div className="flex gap-1.5 mt-1">
                    <div className="h-5 bg-sand rounded-full w-16" />
                    <div className="h-5 bg-sand rounded-full w-12" />
                    <div className="h-5 bg-sand rounded-full w-14" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (meals.length === 0) return null;

  const plannedSet = new Set(plannedMeals);
  const allPlanned = meals.every((m) => plannedSet.has(m.name));

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <p className="text-[12px] text-muted mt-0.5">{subtitle}</p>
        </div>
        <button onClick={onRefresh} disabled={loading}
          className="text-[13px] bg-card text-muted px-3.5 py-2 rounded-2xl font-semibold shadow-card hover:shadow-lifted hover:text-accent transition-all disabled:opacity-50 active:scale-95">
          <span className="mr-1">↻</span> Refresh
        </button>
      </div>

      {/* All planned banner */}
      {allPlanned && plannedMeals.length > 0 && (
        <div className="bg-sage-light rounded-2xl p-4 mb-4 flex items-center gap-3 animate-fade-up">
          <div className="w-10 h-10 bg-sage rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-sage">{title} are set!</p>
            <p className="text-[12px] text-muted mt-0.5">Recipes saved, list built. You&apos;re good to go.</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {meals.map((meal, i) => {
          const sel = selectedMeals.has(i);
          const planned = plannedSet.has(meal.name);

          return (
            <div key={i}
              className={`bg-card rounded-2xl shadow-card transition-all duration-200 animate-fade-up ${
                planned ? "opacity-50" :
                sel ? "shadow-lifted ring-2 ring-accent/20" : "hover:shadow-lifted"
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start gap-3.5 p-4">
                {/* Checkbox */}
                <button onClick={() => !planned && onToggle(i)} className="mt-0.5 flex-shrink-0" disabled={planned}>
                  <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                    planned ? "bg-sage border-sage" :
                    sel ? "bg-accent border-accent shadow-glow" : "border-border hover:border-accent/40"
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
                    {meal.emoji && <span className="text-lg">{meal.emoji}</span>}
                    <h4 className={`font-bold text-[15px] leading-snug ${planned ? "text-muted" : "text-foreground"}`}>
                      {meal.name}
                    </h4>
                    {planned && (
                      <span className="text-[10px] bg-sage-light text-sage font-bold px-2 py-0.5 rounded-full">Done</span>
                    )}
                  </div>
                  <p className="text-[12px] text-muted mt-1 leading-relaxed line-clamp-2">{meal.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {meal.ingredients.slice(0, 5).map((ing, j) => (
                      <span key={j} className="text-[11px] bg-sand text-muted px-2.5 py-1 rounded-lg font-medium">{ing}</span>
                    ))}
                    {meal.ingredients.length > 5 && (
                      <span className="text-[11px] text-muted/50 px-1 py-1">+{meal.ingredients.length - 5}</span>
                    )}
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
                          className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all active:scale-90">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <button onClick={() => onDismiss(i)}
                          className="w-9 h-9 rounded-xl bg-sand flex items-center justify-center text-muted/50 hover:bg-danger-light hover:text-danger transition-all active:scale-90">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
