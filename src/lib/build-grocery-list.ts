import { ALWAYS_BUY } from "./staples";

export type GroceryItem = {
  name: string;
  category: string;
  checked: boolean;
};

type Recipe = {
  ingredients: string[];
};

// Match whole-word spices/pantry items — use word boundaries carefully to avoid false positives
// "pepper" alone would match "bell pepper" so we use more specific patterns
const SPICE_PATTERN = /^(salt|black pepper|olive oil|cooking oil|cooking spray|cumin|paprika|garlic powder|onion powder|chili powder|italian seasoning|red pepper flakes|cinnamon|soy sauce|hot sauce|buffalo sauce|flour|baking powder|vanilla extract|oregano|dried oregano|brown sugar|honey|sugar|water|ice)$/i;
const SPICE_CONTAINS = /(^|\s)(salt and pepper|salt & pepper|olive oil|cooking spray|nonstick spray)(\s|$)/i;

const SKIP_PHRASES = [
  "salt and pepper",
  "salt & pepper",
  "to taste",
  "as needed",
  "for serving",
  "for garnish",
  "optional",
  "cup of water",
  "cups of water",
  "water",
  "ice cubes",
  "ice",
  "nonstick spray",
  "cooking spray",
  "parchment paper",
  "aluminum foil",
  "toothpicks",
];

/**
 * Build a grocery list from recipe ingredients, client-side.
 * No Claude call needed.
 */
export function buildGroceryList(
  recipes: Recipe[],
  pantryItems: string[]
): GroceryItem[] {
  const pantryLower = pantryItems.map((p) => p.toLowerCase());

  // Collect all ingredients, filter out pantry/spices
  const validIngredients: string[] = [];

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const lower = ing.toLowerCase();
      // Strip quantities to get the core item name for matching
      const coreName = lower.replace(/^[\d\s\/\.]+(?:lb|lbs|oz|cup|cups|tbsp|tsp|tablespoons?|teaspoons?|can|cans|bag|bunch|head|cloves?|pack|packs|container|box|jar|pound|pounds|ounce|ounces)?\s*/i, "").replace(/[,\(].*$/, "").trim();

      // Skip if core name exactly matches a pantry item
      if (pantryLower.some((p) => coreName === p || p === coreName)) continue;

      // Skip exact spice matches (checks core name, not the full string with quantities)
      if (SPICE_PATTERN.test(coreName)) continue;

      // Skip spice-containing phrases
      if (SPICE_CONTAINS.test(lower)) continue;

      // Skip filler phrases
      if (SKIP_PHRASES.some((phrase) => lower.includes(phrase))) continue;

      // Skip water specifically but not "watermelon" etc
      if (/^\d*\s*(?:\/\d+\s*)?(?:cup|cups|tbsp|tsp)?\s*water$/i.test(lower.trim())) continue;

      validIngredients.push(ing);
    }
  }

  // Deduplicate by extracting the "core" item name and keeping the one with best quantity info
  const seen = new Map<string, string>(); // coreName -> full ingredient string

  for (const ing of validIngredients) {
    const core = extractCoreName(ing);
    const existing = seen.get(core);

    if (!existing) {
      seen.set(core, ing);
    } else {
      // Keep whichever has more detail (longer string usually has quantity)
      if (ing.length > existing.length) {
        seen.set(core, ing);
      }
    }
  }

  // Build final list — convert recipe measurements to shopping-friendly names
  const items: GroceryItem[] = Array.from(seen.values()).map((ing) => ({
    name: toShoppingName(ing),
    category: categorizeIngredient(ing),
    checked: false,
  }));

  // Append always-buy staples
  const existingNames = new Set(items.map((i) => i.name.toLowerCase()));
  const staples = ALWAYS_BUY
    .filter((s) => !existingNames.has(s.name.toLowerCase()))
    .map((s) => ({ ...s, checked: false }));

  return [...items, ...staples];
}

/**
 * Convert recipe ingredient to a shopping-friendly name.
 * "4 tbsp mayonnaise" → "Mayonnaise"
 * "1 lb ground turkey" → "Ground turkey (1 lb)"
 * "2 chicken breasts, boneless" → "Chicken breasts (2)"
 * Keeps real shopping quantities (lb, oz, bag, can) but strips cooking measurements (tbsp, tsp, cup).
 */
function toShoppingName(ing: string): string {
  // Cooking measurements to strip entirely
  const cookingMeasure = /^[\d\s\/\.]+(?:tbsp|tsp|tablespoons?|teaspoons?|cups?|cloves?|pinch(?:es)?|dash(?:es)?|splash(?:es)?)\s+(?:of\s+)?/i;

  if (cookingMeasure.test(ing)) {
    // Strip the measurement, capitalize the item
    const cleaned = ing.replace(cookingMeasure, "").replace(/,\s*.*$/, "").trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Shopping quantities to keep — reformat as "Item (quantity)"
  const shoppingQuantity = /^([\d\s\/\.]+(?:lb|lbs|oz|pound|pounds|ounce|ounces|can|cans|bag|bags|box|boxes|bunch|bunches|head|heads|pack|packs|container|jar|jars|bottle|bottles|package|packages)?)\s+(.+)/i;
  const match = ing.match(shoppingQuantity);
  if (match) {
    const qty = match[1].trim();
    const item = match[2].replace(/,\s*.*$/, "").trim();
    const capitalized = item.charAt(0).toUpperCase() + item.slice(1);
    return `${capitalized} (${qty})`;
  }

  // Just a number + item like "2 avocados"
  const simpleCount = /^(\d+)\s+(.+)/;
  const simpleMatch = ing.match(simpleCount);
  if (simpleMatch) {
    const count = simpleMatch[1];
    const item = simpleMatch[2].replace(/,\s*.*$/, "").trim();
    const capitalized = item.charAt(0).toUpperCase() + item.slice(1);
    return `${capitalized} (${count})`;
  }

  // No quantity — just capitalize
  const cleaned = ing.replace(/,\s*.*$/, "").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/** Extract the "core" ingredient name for dedup (strips quantities, prep instructions) */
function extractCoreName(ing: string): string {
  return ing
    .toLowerCase()
    .replace(/^\d[\d\/\s]*(?:lb|lbs|oz|cup|cups|tbsp|tsp|tablespoon|teaspoon|can|cans|bag|bunch|head|clove|cloves|piece|pieces|count|pack|packs|container|box|jar|pound|pounds|ounce|ounces|slice|slices)?s?\b/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/,.*$/, "")
    .replace(/\b(diced|sliced|chopped|minced|shredded|grated|crushed|fresh|frozen|dried|canned|boneless|skinless|lean|plain|small|medium|large|whole|cut into|drained|rinsed)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function categorizeIngredient(ing: string): string {
  const l = ing.toLowerCase();
  if (/chicken|turkey|beef|salmon|tuna|meat|sausage|shrimp|tilapia|cod|pork|bacon|ham|deli\s/.test(l)) return "Meat & Protein";
  if (/milk|cheese|yogurt|cream cheese|sour cream|egg|butter|half and half|creamer/.test(l)) return "Dairy & Eggs";
  if (/lettuce|romaine|spinach|kale|arugula|greens|tomato|onion|garlic|pepper|bell pepper|avocado|cucumber|carrot|zucchini|cilantro|lime|lemon|jalapeno|berry|berries|raspberry|blueberr|strawberr|blackberr|apple|orange|grape|fruit|celery|broccoli|asparagus|corn|mushroom|potato|sweet potato|green bean|snap pea|cabbage|cauliflower|squash|pea|radish|beet|eggplant|scallion|green onion|parsley|basil|mint|ginger|sprout|mango|pineapple|banana|peach|pear|melon|watermelon|cantaloupe|plum|cherry|fig|pomegranate|cranberr|edamame|pico|guac|salsa fresca|jicama/.test(l)) return "Produce";
  if (/frozen/.test(l)) return "Frozen";
  if (/bread|tortilla|bagel|sourdough|pita|bun|roll|wrap|english muffin|croissant|naan/.test(l)) return "Bakery";
  if (/rice|pasta|mac |bean|grain|quinoa|oat|cereal|granola|cracker|chip|pretzel|nut |nuts|peanut|almond|protein bar|can of/.test(l)) return "Pantry & Grains";
  if (/sauce|broth|stock|dressing|salsa|mustard|enchilada|guac|mayo|mayonnaise|ketchup|sriracha|vinaigrette|marinade|pesto|hummus|dip/.test(l)) return "Sauces & Condiments";
  if (/energy drink|olipop|bloom|soda|juice|coffee|cold brew|tea|kombucha/.test(l)) return "Drinks";
  if (/detergent|paper|towel|soap|wipe|trash bag|sponge|tissue/.test(l)) return "Household";
  return "Other";
}
