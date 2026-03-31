"use client";

export type Recipe = {
  title: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: string[];
  steps: string[];
  tips: string;
};

export default function RecipeModal({ recipe, onClose, onAddToList, addedToList }: {
  recipe: Recipe; onClose: () => void; onAddToList: () => void; addedToList: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card rounded-t-3xl sm:rounded-3xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-card px-5 pt-5 pb-4 rounded-t-3xl">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold leading-tight pr-4 tracking-tight">{recipe.title}</h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-muted hover:text-foreground transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Meta */}
          <div className="flex gap-3 mt-3">
            {[
              { icon: "🕐", label: "Prep", value: recipe.prepTime },
              { icon: "🍳", label: "Cook", value: recipe.cookTime },
              { icon: "👤", label: "Serves", value: String(recipe.servings) },
            ].map((m) => (
              <div key={m.label} className="flex-1 bg-sand rounded-xl py-2.5 px-3 text-center">
                <div className="text-sm mb-0.5">{m.icon}</div>
                <div className="text-xs font-bold">{m.value}</div>
                <div className="text-[10px] text-muted">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-4 space-y-5">
          {/* Ingredients */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Ingredients</h3>
            <div className="bg-sand rounded-2xl p-4 space-y-2.5">
              {recipe.ingredients.map((ing, i) => (
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

          {/* Tips */}
          {recipe.tips && (
            <div className="bg-warm rounded-2xl p-4">
              <p className="text-xs leading-relaxed">
                <span className="font-bold">💡 Tip: </span>{recipe.tips}
              </p>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="sticky bottom-0 bg-card px-5 py-4">
          <button onClick={onAddToList} disabled={addedToList}
            className={`w-full py-4 rounded-full text-sm font-bold transition-all active:scale-[0.98] ${
              addedToList
                ? "bg-sage-light text-sage"
                : "bg-accent text-white hover:bg-accent-dark shadow-button"
            }`}>
            {addedToList ? "✓ Added to List & Saved" : "Add to Grocery List & Save Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
