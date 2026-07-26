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

  // Group by "core" item name so the same ingredient across recipes lands together
  const groups = new Map<string, string[]>(); // coreName -> every ingredient string for it

  for (const ing of validIngredients) {
    const core = extractCoreName(ing);
    const group = groups.get(core);
    if (group) {
      group.push(ing);
    } else {
      groups.set(core, [ing]);
    }
  }

  // Build final list — convert recipe measurements to shopping-friendly names,
  // adding up quantities when an item shows up in more than one recipe
  const items: GroceryItem[] = Array.from(groups.values()).map((entries) => {
    // Most detailed string wins for naming and categorizing (longest usually has quantity)
    const rep = entries.reduce((a, b) => (b.length > a.length ? b : a));
    return {
      name: mergedShoppingName(entries, rep),
      category: categorizeIngredient(rep),
      checked: false,
    };
  });

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

// Measurements used while cooking — these never become a shopping quantity.
// You buy a jar of mayo, not "6 tbsp".
const COOKING_UNIT = /^(tbsp|tsp|tablespoons?|teaspoons?|cups?|cloves?|pinch(?:es)?|dash(?:es)?|splash(?:es)?)$/i;

// Units worth counting, normalized to a single spelling so "lbs" and "pounds" add together
const SHOPPING_UNITS: Record<string, string> = {
  lb: "lb", lbs: "lb", pound: "lb", pounds: "lb",
  oz: "oz", ounce: "oz", ounces: "oz",
  can: "can", cans: "can",
  bag: "bag", bags: "bag",
  box: "box", boxes: "box",
  bunch: "bunch", bunches: "bunch",
  head: "head", heads: "head",
  pack: "pack", packs: "pack", package: "pack", packages: "pack",
  container: "container", containers: "container",
  jar: "jar", jars: "jar",
  bottle: "bottle", bottles: "bottle",
};

type ParsedIngredient = {
  /** null when there's no countable quantity (plain item, or a cooking measurement) */
  quantity: { value: number; unit: string | null } | null;
  item: string;
};

/** Parse "1 1/2", "1/2", "2", "1.5" into a number */
function parseAmount(raw: string): number | null {
  const mixed = raw.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);

  const fraction = raw.match(/^(\d+)\/(\d+)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);

  if (/^\d+(?:\.\d+)?$/.test(raw)) return Number(raw);
  return null;
}

/** Split an ingredient into its countable quantity and its item name */
function splitIngredient(ing: string): ParsedIngredient {
  const cleaned = ing.replace(/,\s*.*$/, "").trim();
  const match = cleaned.match(
    /^((?:\d+\s+\d+\/\d+)|(?:\d+\/\d+)|(?:\d+(?:\.\d+)?))\s*([a-zA-Z]+)?\s*(?:of\s+)?(.*)$/
  );
  if (!match) return { quantity: null, item: cleaned };

  const value = parseAmount(match[1]);
  if (value === null) return { quantity: null, item: cleaned };

  const unitToken = match[2];
  const rest = (match[3] ?? "").trim();

  // "1/2 cup rice" — cooking measurement, so no shopping quantity to add up
  if (unitToken && COOKING_UNIT.test(unitToken)) {
    return { quantity: null, item: rest || cleaned };
  }

  if (unitToken) {
    const unit = SHOPPING_UNITS[unitToken.toLowerCase()];
    if (unit) return { quantity: { value, unit }, item: rest };
    // Not a unit at all — "2 chicken breasts" means the word belongs to the item
    return { quantity: { value, unit: null }, item: `${unitToken} ${rest}`.trim() };
  }

  return { quantity: { value, unit: null }, item: rest };
}

function formatAmount(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/**
 * Name for a grocery line, adding quantities together when the same item came
 * from several recipes. Falls back to single-item formatting whenever the
 * amounts can't be combined confidently (mixed units, missing quantities).
 */
function mergedShoppingName(entries: string[], rep: string): string {
  if (entries.length === 1) return toShoppingName(rep);

  const withQuantity = entries
    .map(splitIngredient)
    .filter((p): p is ParsedIngredient & { quantity: NonNullable<ParsedIngredient["quantity"]> } =>
      p.quantity !== null
    );

  // Nothing to add up — one or zero recipes gave a real quantity
  if (withQuantity.length < 2) return toShoppingName(rep);

  // Mixed units ("1 lb chicken" + "2 chicken breasts") — don't invent a number
  const units = new Set(withQuantity.map((p) => p.quantity.unit));
  if (units.size > 1) return toShoppingName(rep);

  const unit = withQuantity[0].quantity.unit;
  const total = withQuantity.reduce((sum, p) => sum + p.quantity.value, 0);
  const item = splitIngredient(rep).item || rep;
  const name = item.charAt(0).toUpperCase() + item.slice(1);

  return unit ? `${name} (${formatAmount(total)} ${unit})` : `${name} (${formatAmount(total)})`;
}

/** Extract the "core" ingredient name for dedup (strips quantities, prep instructions) */
function extractCoreName(ing: string): string {
  // Reuse the quantity parser so grouping and summing always agree on where
  // the amount ends and the item begins (handles decimals, fractions, "1 1/2")
  return splitIngredient(ing)
    .item
    .toLowerCase()
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
