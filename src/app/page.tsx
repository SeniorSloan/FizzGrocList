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
import { buildGroceryList } from "@/lib/build-grocery-list";
import seedLists from "@/data/past-lists.json";
import pantryDefaults from "@/data/pantry-defaults.json";

export type GroceryItem = {
  name: string;
  category: string;
  checked: boolean;
};

export type MealPlan = {
  name: string;
  description: string;
  ingredients: string[];
};

export type PastList = {
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
    oils_and_vinegars: "Oils & Sauces",
    pantry_staples: "Pantry Staples",
    baking: "Baking",
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
  const [dinnerPlans, setDinnerPlans] = useState<MealPlan[]>([]);
  const [lunchPlans, setLunchPlans] = useState<MealPlan[]>([]);
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
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState<string | null>(null);
  const [addedToList, setAddedToList] = useState(false);
  const [plannedDinners, setPlannedDinners] = useState<string[]>([]);
  const [plannedLunches, setPlannedLunches] = useState<string[]>([]);
  const [dinnerStyle, setDinnerStyle] = useState<string | null>(null);
  const [lunchStyle, setLunchStyle] = useState<string | null>(null);

  const allItems = pastLists.flatMap((l) => l.items);
  const inStockPantry = pantryItems.filter((p) => p.inStock).map((p) => p.name);

  useEffect(() => {
    if (pastLists.length > 0) { fetchDinners(); fetchLunches(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMeals = async (type: "dinner" | "lunch", styleOverride?: string | null) => {
    const setLoading = type === "dinner" ? setLoadingDinners : setLoadingLunches;
    const setPlans = type === "dinner" ? setDinnerPlans : setLunchPlans;
    const setSelected = type === "dinner" ? setSelectedDinners : setSelectedLunches;
    const currentStyle = styleOverride !== undefined
      ? styleOverride
      : type === "dinner" ? dinnerStyle : lunchStyle;

    // Find the style prompt
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
    } catch (e) { console.error(e); }
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

  const handleMealClick = async (meal: MealPlan) => {
    setLoadingRecipe(meal.name); setAddedToList(false);
    try {
      const res = await fetch("/api/get-recipe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal }),
      });
      const data = await res.json();
      if (data.recipe) setActiveRecipe(data.recipe);
    } catch (e) { console.error(e); }
    setLoadingRecipe(null);
  };

  const handleAddRecipeToList = () => {
    if (!activeRecipe) return;
    // Build a fresh list from just this recipe, then merge with existing
    const recipeItems = buildGroceryList([activeRecipe], inStockPantry);
    const existingNames = new Set(groceryList.map((i) => i.name.toLowerCase()));
    const newItems = recipeItems.filter((item) => !existingNames.has(item.name.toLowerCase()));
    setGroceryList((prev) => [...prev, ...newItems]);
    const alreadySaved = savedRecipes.some((r) => r.recipe.title === activeRecipe.title);
    if (!alreadySaved) {
      setSavedRecipes((prev) => [...prev, { recipe: activeRecipe, mealName: activeRecipe.title, addedAt: new Date().toISOString() }]);
    }
    setAddedToList(true);
  };

  const handleCravingSearch = async (query: string) => {
    setLoadingSearch(true);
    try {
      const res = await fetch("/api/search-recipe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, shoppingHistory: allItems }),
      });
      const data = await res.json();
      if (data.recipe) {
        setActiveRecipe(data.recipe);
        setAddedToList(false);
      }
    } catch (e) { console.error(e); }
    setLoadingSearch(false);
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
      // Step 1: Fetch all recipes in parallel (the only Claude calls needed)
      const recipePromises = selectedMeals.map(async (meal) => {
        try {
          const res = await fetch("/api/get-recipe", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ meal }),
          });
          const data = await res.json();
          if (data.recipe) return { recipe: data.recipe as Recipe, mealName: meal.name, addedAt: new Date().toISOString() };
        } catch { /* skip */ }
        return null;
      });
      const newRecipes = (await Promise.all(recipePromises)).filter(Boolean) as SavedRecipe[];

      // Step 2: Build grocery list CLIENT-SIDE from recipe ingredients (no Claude call!)
      const recipes = newRecipes.map((r) => r.recipe);
      const newList = buildGroceryList(recipes, inStockPantry);
      setGroceryList(newList);

      // Step 3: Save recipes
      setSavedRecipes((prev) => {
        const existingTitles = new Set(prev.map((r) => r.recipe.title));
        return [...prev, ...newRecipes.filter((r) => !existingTitles.has(r.recipe.title))];
      });

      // Step 4: Mark meals as planned and clear selections
      setPlannedDinners(Array.from(selectedDinners).map((i) => dinnerPlans[i].name));
      setPlannedLunches(Array.from(selectedLunches).map((i) => lunchPlans[i].name));
      setSelectedDinners(new Set());
      setSelectedLunches(new Set());
      setActiveTab("grocery");
    } catch (e) { console.error(e); }
    setLoadingList(false);
  };

  const uncheckedCount = groceryList.filter((i) => !i.checked).length;

  const tabs: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: "home", label: "Plan", icon: "✨" },
    { key: "grocery", label: "List", icon: "🛒", badge: uncheckedCount || undefined },
    { key: "recipes", label: "Recipes", icon: "📖", badge: (savedRecipes.length + favoriteRecipes.length) || undefined },
    { key: "pantry", label: "Pantry", icon: "🏠" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-soft px-5 pt-5 pb-3">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-foreground tracking-tight">FizzGrocList</h1>
          <p className="text-xs text-muted mt-0.5">Smart grocery planning</p>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-card/80 backdrop-blur-xl shadow-soft sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-around h-14">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors ${
                activeTab === tab.key ? "text-accent" : "text-muted"
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className={`text-[10px] font-semibold ${activeTab === tab.key ? "text-accent" : ""}`}>
                {tab.label}
              </span>
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {tab.badge > 9 ? "9+" : tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {loadingList && (
        <div className="h-1 bg-accent-light overflow-hidden">
          <div className="h-full bg-accent rounded-full animate-[pulse_1s_ease-in-out_infinite] w-2/3" />
        </div>
      )}

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {activeTab === "home" && (
          <div className="pb-24">
            {/* Craving search */}
            <CravingSearch onRecipeFound={handleCravingSearch} loading={loadingSearch} />

            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-tight">Plan Your Week</h2>
              <p className="text-xs text-muted mt-1">
                Pick meals, then build your grocery list. Tap any meal for the full recipe.
              </p>
            </div>

            {/* Dinner style picker */}
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">What kind of dinners?</h3>
              <StylePicker
                styles={DINNER_STYLES}
                selected={dinnerStyle}
                onSelect={(id) => { setDinnerStyle(id); setPlannedDinners([]); fetchDinners(id); }}
                loading={loadingDinners}
              />
            </div>

            <MealSection
              title="Dinners" subtitle={dinnerStyle ? DINNER_STYLES.find((s) => s.id === dinnerStyle)?.label || "" : "Meal prep — cook once, eat for days"}
              meals={dinnerPlans} selectedMeals={selectedDinners} plannedMeals={plannedDinners}
              onToggle={(i) => setSelectedDinners((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; })}
              onMealClick={handleMealClick} onDismiss={(i) => handleDismiss("dinner", i)}
              onRefresh={() => { setPlannedDinners([]); fetchDinners(); }} loading={loadingDinners} loadingRecipe={loadingRecipe}
            />

            {/* Lunch style picker */}
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">What kind of lunches?</h3>
              <StylePicker
                styles={LUNCH_STYLES}
                selected={lunchStyle}
                onSelect={(id) => { setLunchStyle(id); setPlannedLunches([]); fetchLunches(id); }}
                loading={loadingLunches}
              />
            </div>

            <MealSection
              title="Lunches" subtitle={lunchStyle ? LUNCH_STYLES.find((s) => s.id === lunchStyle)?.label || "" : "Quick assembly — throw together in minutes"}
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
        <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl px-4 py-3 z-40">
          <div className="max-w-lg mx-auto">
            <button onClick={handleBuildList} disabled={loadingList}
              className="w-full bg-accent text-white py-4 rounded-full text-sm font-bold hover:bg-accent-dark transition-all disabled:opacity-50 shadow-button active:scale-[0.98]"
            >
              {loadingList ? "Building list & saving recipes..." : `Build Grocery List & Save Recipes (${totalSelected})`}
            </button>
          </div>
        </div>
      )}

      {activeRecipe && (
        <RecipeModal recipe={activeRecipe} onClose={() => setActiveRecipe(null)}
          onAddToList={handleAddRecipeToList} addedToList={addedToList}
          isFavorite={isRecipeFavorited(activeRecipe)}
          onToggleFavorite={() => toggleFavorite(activeRecipe)} />
      )}
    </div>
  );
}
