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
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
        <div className="w-24 h-24 bg-accent-light rounded-3xl flex items-center justify-center mb-6 shadow-card">
          <span className="text-5xl">📖</span>
        </div>
        <h2 className="text-xl font-extrabold mb-2">No recipes yet</h2>
        <p className="text-muted text-[14px] max-w-[260px] mb-6 leading-relaxed">
          Plan some meals or search for a craving to get started
        </p>
        <div className="bg-warm rounded-2xl p-4 max-w-[300px] text-left">
          <p className="text-[13px] leading-relaxed">
            <span className="font-bold">How to save recipes: </span>
            Go to the Plan tab, tap any meal, then tap the heart to save it as a favorite.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight">Recipes</h2>
        <p className="text-[13px] text-muted mt-1 font-medium">
          {favorites.length > 0 ? `${favorites.length} favorite${favorites.length !== 1 ? "s" : ""}` : ""}
          {favorites.length > 0 && recipes.length > 0 ? " \u00b7 " : ""}
          {recipes.length > 0 ? `${recipes.length} this week` : ""}
        </p>
      </div>

      {/* Favorites section */}
      {favorites.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-accent text-base">♥</span>
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-accent">Favorites</h3>
            <span className="text-[12px] font-bold text-accent bg-accent-light px-2.5 py-0.5 rounded-full">{favorites.length}</span>
            <div className="flex-1 h-px bg-accent-light ml-2" />
          </div>
          <div className="space-y-3">
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
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-base">📋</span>
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-muted">This Week</h3>
              <span className="text-[12px] font-bold text-muted bg-sand px-2.5 py-0.5 rounded-full">{recipes.length}</span>
            </div>
            <button onClick={onClearAll}
              className="text-[12px] text-muted hover:text-danger font-semibold transition-colors min-h-[36px] px-2 flex items-center">
              Clear All
            </button>
          </div>
          <div className="space-y-3">
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
    <div className="bg-card rounded-2xl shadow-card overflow-hidden transition-all hover:shadow-lifted animate-fade-up">
      <button onClick={onView}
        className="w-full text-left p-4 active:bg-sand/30 transition-colors min-h-[80px]">
        <div className="flex items-start justify-between gap-3">
          {/* Image or emoji preview */}
          {saved.recipe.imageUrl ? (
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={saved.recipe.imageUrl} alt={saved.recipe.title} className="w-full h-full object-cover" />
            </div>
          ) : saved.recipe.emoji ? (
            <div className="w-14 h-14 rounded-2xl bg-accent-light/60 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">{saved.recipe.emoji}</span>
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[15px] leading-snug">{saved.recipe.title}</h3>
              {isFavorite && <span className="text-accent text-sm">♥</span>}
            </div>
            {saved.recipe.description && (
              <p className="text-[12px] text-muted mt-1 line-clamp-1 leading-relaxed">{saved.recipe.description}</p>
            )}
            <div className="flex gap-4 mt-2.5">
              {[
                { icon: "🕐", value: saved.recipe.prepTime, label: "prep" },
                { icon: "🔥", value: saved.recipe.cookTime, label: "cook" },
                { icon: "👩‍🍳", value: String(saved.recipe.servings), label: "servings" },
              ].map((m) => (
                <span key={m.label} className="text-[11px] text-muted font-medium">
                  <span className="mr-0.5">{m.icon}</span> {m.value}
                </span>
              ))}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>
      <div className="border-t border-border/50 px-4 py-2.5 flex justify-end">
        <button onClick={onRemove}
          className="text-[12px] text-muted hover:text-danger font-semibold transition-colors min-h-[36px] px-2 flex items-center">
          {removeLabel}
        </button>
      </div>
    </div>
  );
}
