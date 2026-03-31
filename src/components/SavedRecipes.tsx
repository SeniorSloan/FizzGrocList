"use client";

import { Recipe } from "@/components/RecipeModal";

export type SavedRecipe = { recipe: Recipe; mealName: string; addedAt: string; };

export default function SavedRecipes({ recipes, onViewRecipe, onRemove, onClearAll }: {
  recipes: SavedRecipe[]; onViewRecipe: (r: Recipe) => void; onRemove: (i: number) => void; onClearAll: () => void;
}) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center mb-5">
          <span className="text-4xl">📖</span>
        </div>
        <h2 className="text-lg font-bold mb-1">No saved recipes</h2>
        <p className="text-muted text-sm max-w-[260px]">
          When you pick meals and build your grocery list, recipes get saved here for the week.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">This Week&apos;s Recipes</h2>
          <p className="text-xs text-muted mt-0.5">{recipes.length} meal{recipes.length !== 1 ? "s" : ""} planned</p>
        </div>
        <button onClick={onClearAll} className="text-xs text-muted hover:text-danger font-medium">Clear Week</button>
      </div>

      <div className="space-y-3">
        {recipes.map((saved, i) => (
          <div key={i} className="bg-card rounded-2xl shadow-soft overflow-hidden">
            <button onClick={() => onViewRecipe(saved.recipe)}
              className="w-full text-left p-4 hover:bg-sand/30 transition-colors active:bg-sand/50">
              <div className="flex items-start justify-between">
                <div className="min-w-0 pr-3">
                  <h3 className="font-semibold text-[15px] leading-snug">{saved.recipe.title}</h3>
                  <div className="flex gap-3 mt-2">
                    {[
                      { label: "Prep", value: saved.recipe.prepTime },
                      { label: "Cook", value: saved.recipe.cookTime },
                      { label: "Serves", value: String(saved.recipe.servings) },
                    ].map((m) => (
                      <span key={m.label} className="text-[11px] text-muted">
                        <span className="font-semibold">{m.value}</span> {m.label.toLowerCase()}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {saved.recipe.ingredients.slice(0, 4).map((ing, j) => (
                      <span key={j} className="text-[11px] bg-sand text-muted px-2 py-0.5 rounded-full">{ing}</span>
                    ))}
                    {saved.recipe.ingredients.length > 4 && (
                      <span className="text-[11px] text-muted">+{saved.recipe.ingredients.length - 4}</span>
                    )}
                  </div>
                </div>
                <svg className="w-4 h-4 text-muted flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <div className="border-t border-border px-4 py-2.5 flex justify-end">
              <button onClick={() => onRemove(i)} className="text-xs text-muted hover:text-danger font-medium">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
