"use client";

import { useState, useEffect } from "react";
import MealSection from "@/components/MealSection";
import GroceryList from "@/components/GroceryList";
import Pantry, { PantryItem } from "@/components/Pantry";
import SavedRecipes, { SavedRecipe } from "@/components/SavedRecipes";
import RecipeModal, { Recipe } from "@/components/RecipeModal";
import CravingSearch from "@/components/CravingSearch";
import LockScreen from "@/components/LockScreen";
import StylePicker from "@/components/StylePicker";
import { DINNER_STYLES, LUNCH_STYLES } from "@/lib/meal-styles";
import { useLocalStorage } from "@/lib/use-local-storage";
import { buildGroceryList, GroceryItem } from "@/lib/build-grocery-list";
import seedLists from "@/data/past-lists.json";
import pantryDefaults from "@/data/pantry-defaults.json";

export type MealPlan = {
  name: string;
  emoji?: string;
  description: string;
  ingredients: string[];
};

type PastList = {
  id: string;
  date: string;
  items: string[];
  raw: string;
};

type Tab = "home" | "grocery" | "recipes" | "pantry";

function buildInitialPantry(): PantryItem[] {
  const items: PantryItem[] = [];
  const categoryMap: Record<string, string> = {
    spices: "Spices & Seasonings",
    oils_and_sauces: "Oils & Sauces",
    baking_and_sweeteners: "Baking & Sweeteners",
    kitchen_supplies: "Kitchen Supplies",
  };
  for (const [key, list] of Object.entries(pantryDefaults)) {
    for (const name of list) {
      items.push({ name, category: categoryMap[key] || "Other", inStock: true });
    }
  }
  return items;
}

export default function Home() {
  const [unlocked, setUnlocked] = useLocalStorage("fizz-unlocked", false);

  if (!unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return <App />;
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [pastLists] = useState<PastList[]>(seedLists);

  // Cached meal suggestions
  const [dinnerPlans, setDinnerPlans] = useLocalStorage<MealPlan[]>("fizz-cached-dinners", []);
  const [lunchPlans, setLunchPlans] = useLocalStorage<MealPlan[]>("fizz-cached-lunches", []);
  const [selectedDinners, setSelectedDinners] = useState<Set<number>>(new Set());
  const [selectedLunches, setSelectedLunches] = useState<Set<number>>(new Set());

  const [groceryList, setGroceryList] = useLocalStorage<GroceryItem[]>("fizz-grocery-list", []);
  const [pantryItems, setPantryItems] = useLocalStorage<PantryItem[]>("fizz-pantry", buildInitialPantry());
  const [savedRecipes, setSavedRecipes] = useLocalStorage<SavedRecipe[]>("fizz-saved-recipes", []);
  const [dismissedMeals, setDismissedMeals] = useLocalStorage<string[]>("fizz-dismissed", []);
  const [favoriteRecipes, setFavoriteRecipes] = useLocalStorage<SavedRecipe[]>("fizz-favorites", []);

  const [loadingDinners, setLoadingDinners] = useState(false);
  const [loadingLunches, setLoadingLunches] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState<string | null>(null);
  const [loadingFullRecipe, setLoadingFullRecipe] = useState(false);
  const [addedToList, setAddedToList] = useState(false);
  const [plannedDinners, setPlannedDinners] = useState<string[]>([]);
  const [plannedLunches, setPlannedLunches] = useState<string[]>([]);
  const [dinnerStyle, setDinnerStyle] = useState<string | null>(null);
  const [lunchStyle, setLunchStyle] = useState<string | null>(null);

  const allItems = pastLists.flatMap((l) => l.items);
  const inStockPantry = pantryItems.filter((p) => p.inStock).map((p) => p.name);

  useEffect(() => {
    if (pastLists.length > 0 && dinnerPlans.length === 0) fetchDinners();
    if (pastLists.length > 0 && lunchPlans.length === 0) fetchLunches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMeals = async (type: "dinner" | "lunch", styleOverride?: string | null) => {
    const setLoading = type === "dinner" ? setLoadingDinners : setLoadingLunches;
    const setPlans = type === "dinner" ? setDinnerPlans : setLunchPlans;
    const setSelected = type === "dinner" ? setSelectedDinners : setSelectedLunches;
    const currentStyle = styleOverride !== undefined
      ? styleOverride
      : type === "dinner" ? dinnerStyle : lunchStyle;

    const styles = type === "dinner" ? DINNER_STYLES : LUNCH_STYLES;
    const stylePrompt = currentStyle ? styles.find((s) => s.id === currentStyle)?.prompt : null;

    setLoading(true); setSelected(new Set());
    try {
      const res = await fetch("/api/suggest-meals", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: allItems, type, dismissed: dismissedMeals, style: stylePrompt }),
      });
      const data = await res.json();
      setPlans(data.meals);
    } catch { /* fetch failed */ }
    setLoading(false);
  };
  const fetchDinners = (style?: string | null) => fetchMeals("dinner", style);
  const fetchLunches = (style?: string | null) => fetchMeals("lunch", style);

  const handleDismiss = (type: "dinner" | "lunch", index: number) => {
    const plans = type === "dinner" ? dinnerPlans : lunchPlans;
    const setPlans = type === "dinner" ? setDinnerPlans : setLunchPlans;
    const setSelected = type === "dinner" ? setSelectedDinners : setSelectedLunches;
    setDismissedMeals((prev) => [...prev, plans[index].name]);
    setPlans((prev) => prev.filter((_, i) => i !== index));
    setSelected((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => { if (i < index) next.add(i); else if (i > index) next.add(i - 1); });
      return next;
    });
  };

  const [recipeCache, setRecipeCache] = useLocalStorage<Record<string, Recipe>>("fizz-recipe-cache", {});

  const handleMealClick = async (meal: MealPlan) => {
    setAddedToList(false);
    const cached = recipeCache[meal.name]
      || savedRecipes.find((r) => r.mealName === meal.name)?.recipe
      || favoriteRecipes.find((r) => r.mealName === meal.name)?.recipe;

    if (cached) {
      setActiveRecipe(cached);
      return;
    }

    // Show loading modal immediately
    setLoadingRecipe(meal.name);
    setLoadingFullRecipe(true);
    try {
      const res = await fetch("/api/get-recipe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal }),
      });
      const data = await res.json();
      if (data.recipe) {
        setActiveRecipe(data.recipe);
        setRecipeCache((prev) => ({ ...prev, [meal.name]: data.recipe }));
      }
    } catch { /* fetch failed */ }
    setLoadingRecipe(null);
    setLoadingFullRecipe(false);
  };

  const handleAddRecipeToList = (scaledIngredients?: string[]) => {
    if (!activeRecipe) return;
    const recipeToAdd = scaledIngredients
      ? { ...activeRecipe, ingredients: scaledIngredients }
      : activeRecipe;
    const recipeItems = buildGroceryList([recipeToAdd], inStockPantry);
    const existingNames = new Set(groceryList.map((i) => i.name.toLowerCase()));
    const newItems = recipeItems.filter((item) => !existingNames.has(item.name.toLowerCase()));
    setGroceryList((prev) => [...prev, ...newItems]);
    const alreadySaved = savedRecipes.some((r) => r.recipe.title === activeRecipe.title);
    if (!alreadySaved) {
      setSavedRecipes((prev) => [...prev, { recipe: activeRecipe, mealName: activeRecipe.title, addedAt: new Date().toISOString() }]);
    }
    setAddedToList(true);
  };

  const handleSearchOptionPicked = async (option: { name: string; description: string; ingredients: string[] }) => {
    setAddedToList(false);

    // Check cache first
    const cached = recipeCache[option.name];
    if (cached) {
      setActiveRecipe(cached);
      return;
    }

    // Show modal immediately with loading state
    setActiveRecipe(null);
    setLoadingFullRecipe(true);

    try {
      const res = await fetch("/api/get-recipe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal: option }),
      });
      const data = await res.json();
      if (data.recipe) {
        setActiveRecipe(data.recipe);
        setRecipeCache((prev) => ({ ...prev, [option.name]: data.recipe }));
      }
    } catch { /* fetch failed */ }
    setLoadingFullRecipe(false);
  };

  const isRecipeFavorited = (recipe: Recipe) =>
    favoriteRecipes.some((f) => f.recipe.title === recipe.title);

  const toggleFavorite = (recipe: Recipe) => {
    if (isRecipeFavorited(recipe)) {
      setFavoriteRecipes((prev) => prev.filter((f) => f.recipe.title !== recipe.title));
    } else {
      setFavoriteRecipes((prev) => [...prev, {
        recipe, mealName: recipe.title, addedAt: new Date().toISOString(),
      }]);
    }
  };

  const totalSelected = selectedDinners.size + selectedLunches.size;

  const handleBuildList = async () => {
    const selectedMeals = [
      ...Array.from(selectedDinners).map((i) => dinnerPlans[i]),
      ...Array.from(selectedLunches).map((i) => lunchPlans[i]),
    ];
    if (selectedMeals.length === 0) return;
    setLoadingList(true);
    try {
      const recipePromises = selectedMeals.map(async (meal) => {
        const cached = recipeCache[meal.name]
          || savedRecipes.find((r) => r.mealName === meal.name)?.recipe
          || favoriteRecipes.find((r) => r.mealName === meal.name)?.recipe;

        if (cached) {
          return { recipe: cached, mealName: meal.name, addedAt: new Date().toISOString() };
        }
        try {
          const res = await fetch("/api/get-recipe", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ meal }),
          });
          const data = await res.json();
          if (data.recipe) {
            setRecipeCache((prev) => ({ ...prev, [meal.name]: data.recipe }));
            return { recipe: data.recipe as Recipe, mealName: meal.name, addedAt: new Date().toISOString() };
          }
        } catch { /* skip */ }
        return null;
      });
      const newRecipes = (await Promise.all(recipePromises)).filter(Boolean) as SavedRecipe[];
      const recipes = newRecipes.map((r) => r.recipe);
      const newList = buildGroceryList(recipes, inStockPantry);
      setGroceryList(newList);
      setSavedRecipes((prev) => {
        const existingTitles = new Set(prev.map((r) => r.recipe.title));
        return [...prev, ...newRecipes.filter((r) => !existingTitles.has(r.recipe.title))];
      });
      setPlannedDinners(Array.from(selectedDinners).map((i) => dinnerPlans[i].name));
      setPlannedLunches(Array.from(selectedLunches).map((i) => lunchPlans[i].name));
      setSelectedDinners(new Set());
      setSelectedLunches(new Set());
      setActiveTab("grocery");
    } catch { /* fetch failed */ }
    setLoadingList(false);
  };

  const uncheckedCount = groceryList.filter((i) => !i.checked).length;

  const tabs: { key: Tab; label: string; icon: string; activeIcon: string; badge?: number }[] = [
    { key: "home", label: "Plan", icon: "✨", activeIcon: "✨" },
    { key: "grocery", label: "List", icon: "🛒", activeIcon: "🛒", badge: uncheckedCount || undefined },
    { key: "recipes", label: "Recipes", icon: "📖", activeIcon: "📖", badge: (savedRecipes.length + favoriteRecipes.length) || undefined },
    { key: "pantry", label: "Pantry", icon: "🏠", activeIcon: "🏠" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Loading bar */}
      {loadingList && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-accent-light overflow-hidden z-50">
          <div className="h-full bg-gradient-to-r from-accent to-pink-300 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]"
            style={{ width: "70%", backgroundSize: "200% 100%" }} />
        </div>
      )}

      <main className="flex-1 max-w-md mx-auto w-full px-5 pt-6 pb-28">
        {activeTab === "home" && (
          <div>
            {/* Page title */}
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight">Plan Your Week</h1>
              <p className="text-[13px] text-muted mt-1 font-medium">
                Pick meals, build your list. Tap any meal for the recipe.
              </p>
            </div>

            {/* Craving search */}
            <CravingSearch onOptionPicked={handleSearchOptionPicked} />

            {/* Dinner style picker */}
            <div className="mb-4">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-muted mb-3 px-1">Dinner Vibe</h3>
              <StylePicker
                styles={DINNER_STYLES}
                selected={dinnerStyle}
                onSelect={(id) => { setDinnerStyle(id); setPlannedDinners([]); fetchDinners(id); }}
                loading={loadingDinners}
              />
            </div>

            <MealSection
              title="Dinners" subtitle={dinnerStyle ? DINNER_STYLES.find((s) => s.id === dinnerStyle)?.label || "" : "Cook once, eat for days"}
              meals={dinnerPlans} selectedMeals={selectedDinners} plannedMeals={plannedDinners}
              onToggle={(i) => setSelectedDinners((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; })}
              onMealClick={handleMealClick} onDismiss={(i) => handleDismiss("dinner", i)}
              onRefresh={() => { setPlannedDinners([]); fetchDinners(); }} loading={loadingDinners} loadingRecipe={loadingRecipe}
            />

            {/* Lunch style picker */}
            <div className="mb-4">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-muted mb-3 px-1">Lunch Vibe</h3>
              <StylePicker
                styles={LUNCH_STYLES}
                selected={lunchStyle}
                onSelect={(id) => { setLunchStyle(id); setPlannedLunches([]); fetchLunches(id); }}
                loading={loadingLunches}
              />
            </div>

            <MealSection
              title="Lunches" subtitle={lunchStyle ? LUNCH_STYLES.find((s) => s.id === lunchStyle)?.label || "" : "Quick assembly, throw together in minutes"}
              meals={lunchPlans} selectedMeals={selectedLunches} plannedMeals={plannedLunches}
              onToggle={(i) => setSelectedLunches((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; })}
              onMealClick={handleMealClick} onDismiss={(i) => handleDismiss("lunch", i)}
              onRefresh={() => { setPlannedLunches([]); fetchLunches(); }} loading={loadingLunches} loadingRecipe={loadingRecipe}
            />
          </div>
        )}

        {activeTab === "grocery" && (
          <GroceryList items={groceryList}
            onToggle={(i) => setGroceryList((prev) => prev.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item))}
            onClear={() => setGroceryList([])}
            onAddItem={(item) => { if (!groceryList.some((g) => g.name.toLowerCase() === item.name.toLowerCase())) setGroceryList((prev) => [...prev, item]); }}
            onDelete={(i) => setGroceryList((prev) => prev.filter((_, idx) => idx !== i))}
            onEditName={(i, name) => setGroceryList((prev) => prev.map((item, idx) => idx === i ? { ...item, name } : item))}
          />
        )}

        {activeTab === "recipes" && (
          <SavedRecipes recipes={savedRecipes} favorites={favoriteRecipes}
            onViewRecipe={(recipe) => { setActiveRecipe(recipe); setAddedToList(false); }}
            onRemove={(i) => setSavedRecipes((prev) => prev.filter((_, idx) => idx !== i))}
            onClearAll={() => setSavedRecipes([])}
            onRemoveFavorite={(i) => setFavoriteRecipes((prev) => prev.filter((_, idx) => idx !== i))}
          />
        )}

        {activeTab === "pantry" && (
          <Pantry items={pantryItems}
            onToggle={(i) => setPantryItems((prev) => prev.map((item, idx) => idx === i ? { ...item, inStock: !item.inStock } : item))}
            onAddCustom={(name, category) => setPantryItems((prev) => [...prev, { name, category, inStock: true }])}
          />
        )}
      </main>

      {/* Sticky build button */}
      {activeTab === "home" && totalSelected > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-5 z-40 animate-fade-up">
          <div className="max-w-md mx-auto">
            <button onClick={handleBuildList} disabled={loadingList}
              className="w-full bg-accent text-white py-4 rounded-2xl text-[15px] font-bold hover:bg-accent-dark transition-all disabled:opacity-50 shadow-button active:scale-[0.98]"
            >
              {loadingList ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Building list...
                </span>
              ) : (
                `Build List & Save Recipes (${totalSelected})`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-glass backdrop-blur-xl border-t border-border/50 z-30 safe-bottom">
        <div className="max-w-md mx-auto flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex flex-col items-center gap-0.5 px-5 py-2 transition-all active:scale-90"
              >
                <div className="relative">
                  <span className={`text-xl leading-none transition-all ${isActive ? "scale-110" : "grayscale-[30%] opacity-70"}`}
                    style={{ display: "inline-block", transform: isActive ? "scale(1.1)" : "scale(1)" }}>
                    {isActive ? tab.activeIcon : tab.icon}
                  </span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce-in">
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] font-semibold transition-colors ${
                  isActive ? "text-accent" : "text-muted/70"
                }`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-0.5 w-6 h-1 bg-accent rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Recipe modal — show loading skeleton or full recipe */}
      {(activeRecipe || loadingFullRecipe) && (
        activeRecipe ? (
          <RecipeModal recipe={activeRecipe} onClose={() => { setActiveRecipe(null); setLoadingFullRecipe(false); }}
            onAddToList={handleAddRecipeToList} addedToList={addedToList}
            isFavorite={isRecipeFavorited(activeRecipe)}
            onToggleFavorite={() => toggleFavorite(activeRecipe)} />
        ) : (
          <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setLoadingFullRecipe(false)}>
            <div className="absolute inset-0 bg-black/40 overlay-blur" />
            <div className="relative bg-card rounded-t-[28px] w-full max-w-lg max-h-[92vh] animate-slide-up safe-bottom p-6"
              onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
              <div className="space-y-4 animate-shimmer">
                <div className="h-6 bg-sand rounded-xl w-3/4" />
                <div className="h-4 bg-sand rounded-lg w-full" />
                <div className="flex gap-3 mt-4">
                  <div className="flex-1 h-20 bg-sand rounded-2xl" />
                  <div className="flex-1 h-20 bg-sand rounded-2xl" />
                  <div className="flex-1 h-20 bg-sand rounded-2xl" />
                </div>
                <div className="h-4 bg-sand rounded-lg w-1/2 mt-6" />
                <div className="space-y-3 mt-2">
                  <div className="h-3 bg-sand rounded-lg w-full" />
                  <div className="h-3 bg-sand rounded-lg w-5/6" />
                  <div className="h-3 bg-sand rounded-lg w-4/5" />
                  <div className="h-3 bg-sand rounded-lg w-full" />
                  <div className="h-3 bg-sand rounded-lg w-3/4" />
                </div>
              </div>
              <p className="text-center text-sm text-muted mt-8 font-medium">Loading recipe...</p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
