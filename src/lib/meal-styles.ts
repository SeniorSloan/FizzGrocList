export type MealStyle = {
  id: string;
  label: string;
  icon: string;
  prompt: string;
};

export const DINNER_STYLES: MealStyle[] = [
  { id: "high-protein", label: "High Protein", icon: "💪", prompt: "Focus on HIGH PROTEIN meals (30g+ per serving). Lean meats, eggs, beans, Greek yogurt as key components." },
  { id: "low-carb", label: "Low Carb", icon: "🥗", prompt: "Focus on LOW CARB meals. No rice, pasta, bread, or tortillas. Use veggies as the base instead." },
  { id: "one-pot", label: "One Pot / Pan", icon: "🍳", prompt: "ALL meals should be ONE POT or ONE PAN — minimal dishes, everything cooks together. Soups, stir fries, sheet pan meals, skillet dinners." },
  { id: "mexican", label: "Mexican Night", icon: "🌮", prompt: "Focus on MEXICAN-INSPIRED meals — tacos, burritos, enchiladas, taco bowls, quesadillas, fajitas." },
  { id: "comfort", label: "Comfort Food", icon: "🫕", prompt: "Focus on COMFORT FOOD — mac and cheese with protein, casseroles, hearty soups, pasta bakes. Cozy and satisfying." },
  { id: "light", label: "Light & Fresh", icon: "🥒", prompt: "Focus on LIGHT and FRESH meals — salads with protein, grain bowls, light soups, lots of veggies. Under 500 calories per serving." },
  { id: "quick", label: "Under 30 Min", icon: "⚡", prompt: "ALL meals must take UNDER 30 MINUTES total. Quick-cooking proteins, pre-cooked ingredients, simple assembly." },
];

export const LUNCH_STYLES: MealStyle[] = [
  { id: "high-protein", label: "High Protein", icon: "💪", prompt: "Focus on HIGH PROTEIN lunches (25g+ per serving). Deli meat wraps, egg-based meals, chicken salads." },
  { id: "low-carb", label: "Low Carb", icon: "🥗", prompt: "Focus on LOW CARB lunches. Lettuce wraps instead of tortillas, no bread, no rice. Veggie-heavy." },
  { id: "snack-plate", label: "Snack Plates", icon: "🧀", prompt: "Focus on SNACK PLATE / BENTO style lunches — cheese, crackers, veggies, dips, hard boiled eggs, deli meat. No cooking needed." },
  { id: "wraps", label: "Wraps & Sandwiches", icon: "🌯", prompt: "Focus on WRAPS and SANDWICHES — tortilla wraps, sourdough sandwiches, bagel sandwiches. Portable and packable." },
  { id: "salads", label: "Big Salads", icon: "🥬", prompt: "Focus on BIG HEARTY SALADS with protein — not sad salads. Think chopped salads, taco salads, Mediterranean bowls." },
  { id: "no-cook", label: "No Cook", icon: "❄️", prompt: "Focus on NO-COOK lunches — everything is assembled cold. Perfect for busy mornings. Zero cooking required." },
];
