"use client";

import { Recipe } from "@/components/RecipeModal";

export type SavedRecipe = { recipe: Recipe; mealName: string; addedAt: string; };

export default function SavedRecipes({ recipes, favorites, onViewRecipe, onRemove, onClearAll, onRemoveFavorite }: {
  recipes: SavedRecipe[];
  favorites: SavedRecipe[];
  onViewRecipe: (r: Recipe) => void;
  onRemove: (i: number) => void;
  onClearAll: () => void;
  onRemoveFavorite: (i: number) => void;
}) {
  const hasNothing = recipes.length === 0 && favorites.length === 0;

  if (hasNothing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center mb-5">
          <span className="text-4xl">📖</span>
        </div>
        <h2 className="text-lg font-bold mb-1">No recipes yet</h2>
        <p className="text-muted text-sm max-w-[260px]">
          Build a grocery list from the Plan tab or search for something you&apos;re craving. Recipes and favorites show up here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Favorites section */}
      {favorites.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">♥</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-accent">Favorites</h2>
            <span className="text-[10px] text-muted ml-auto">{favorites.length}</span>
          </div>
          <div className="space-y-2.5">
            {favorites.map((saved, i) => (
              <RecipeCard key={`fav-${i}`} saved={saved} onView={() => onViewRecipe(saved.recipe)}
                onRemove={() => onRemoveFavorite(i)} removeLabel="Unfavorite" isFavorite />
            ))}
          </div>
        </div>
      )}

      {/* This Week */}
      {recipes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">📋</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted">This Week</h2>
              <span className="text-[10px] text-muted">{recipes.length}</span>
            </div>
            <button onClick={onClearAll} className="text-xs text-muted hover:text-danger font-medium">Clear Week</button>
          </div>
          <div className="space-y-2.5">
            {recipes.map((saved, i) => (
              <RecipeCard key={`week-${i}`} saved={saved} onView={() => onViewRecipe(saved.recipe)}
                onRemove={() => onRemove(i)} removeLabel="Remove" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeCard({ saved, onView, onRemove, removeLabel, isFavorite }: {
  saved: SavedRecipe; onView: () => void; onRemove: () => void; removeLabel: string; isFavorite?: boolean;
}) {
  return (
    <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
      <button onClick={onView}
        className="w-full text-left p-4 hover:bg-sand/30 transition-colors active:bg-sand/50">
        <div className="flex items-start justify-between">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[15px] leading-snug">{saved.recipe.title}</h3>
              {isFavorite && <span className="text-accent text-xs">♥</span>}
            </div>
            {saved.recipe.description && (
              <p className="text-[11px] text-muted mt-0.5 line-clamp-1">{saved.recipe.description}</p>
            )}
            <div className="flex gap-3 mt-1.5">
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
          </div>
          <svg className="w-4 h-4 text-muted flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
      <div className="border-t border-border px-4 py-2 flex justify-end">
        <button onClick={onRemove} className="text-xs text-muted hover:text-danger font-medium">{removeLabel}</button>
      </div>
    </div>
  );
}
