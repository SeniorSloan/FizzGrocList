export type MealStyle = {
  id: string;
  label: string;
  icon: string;
  prompt: string;
};

export const DINNER_STYLES: MealStyle[] = [
  { id: "high-protein", label: "High Protein", icon: "💪", prompt: "HIGH PROTEIN dinners only. Every meal must have 30g+ protein per serving. Center each meal around a big portion of lean protein — think double chicken breast, turkey meatballs, protein-packed chili. No carb-heavy dishes like plain pasta or mac and cheese." },
  { id: "low-carb", label: "Low Carb", icon: "🥗", prompt: "STRICTLY LOW CARB dinners. ZERO rice, ZERO pasta, ZERO bread, ZERO tortillas, ZERO potatoes. Use cauliflower rice, zucchini noodles, lettuce wraps, or just meat + veggies. Think: stuffed peppers, chicken lettuce wraps, turkey zucchini boats, stir fry over cauliflower rice." },
  { id: "one-pot", label: "One Pot / Pan", icon: "🍳", prompt: "ONE POT or ONE PAN meals ONLY. Everything must cook in a single vessel — one skillet, one sheet pan, one pot, or one slow cooker. Think: turkey chili, chicken fajita sheet pan, one-pot pasta, skillet enchiladas. She should only have to wash ONE thing." },
  { id: "mexican", label: "Mexican Night", icon: "🌮", prompt: "100% MEXICAN / TEX-MEX dinners. Every single suggestion must be Mexican-inspired: tacos, burritos, enchiladas, quesadillas, fajitas, taco soup, Mexican rice bowls, chilaquiles, tostadas. Use her taco seasoning, black beans, green chilies, tortillas." },
  { id: "comfort", label: "Comfort Food", icon: "🫕", prompt: "COZY COMFORT FOOD dinners only. Think: baked mac and cheese with ground turkey, chicken pot pie skillet, turkey meatloaf, cheesy enchilada casserole, creamy chicken soup, loaded baked potato bowls. Warm, hearty, soul-satisfying meals — NOT salads or light bowls." },
  { id: "light", label: "Light & Fresh", icon: "🥒", prompt: "LIGHT AND FRESH dinners only. Every meal should be under 450 calories. Think: big salads with grilled chicken, turkey lettuce cups, zucchini noodle bowls, light chicken stir fry with lots of veggies. NO heavy sauces, NO cheese-heavy dishes, NO fried anything." },
  { id: "quick", label: "Under 30 Min", icon: "⚡", prompt: "SPEED MEALS — every dinner must take UNDER 30 MINUTES total from start to eating. No marinating, no slow cooking, no oven roasting. Think: quick stir fry, ground turkey tacos, quesadillas, scrambled egg bowls, chicken sausage + veggies skillet." },
];

export const LUNCH_STYLES: MealStyle[] = [
  { id: "high-protein", label: "High Protein", icon: "💪", prompt: "HIGH PROTEIN lunches only. Every lunch must pack 25g+ protein. Think: double-meat turkey wraps, chicken salad on sourdough, egg + deli meat combos, Greek yogurt parfait with nuts. Protein is the star of every meal." },
  { id: "low-carb", label: "Low Carb", icon: "🥗", prompt: "STRICTLY LOW CARB lunches. NO bread, NO tortillas, NO rice, NO crackers. Use lettuce wraps, cucumber rounds, bell pepper boats, or just containers of meat + cheese + veggies. Think: turkey + cheese lettuce rolls, egg salad in bell pepper halves." },
  { id: "snack-plate", label: "Snack Plates", icon: "🧀", prompt: "SNACK PLATE and BENTO BOX style lunches ONLY. No sandwiches, no wraps, no cooked meals. Think: cheese sticks + deli meat rolls + crackers + veggies + hummus, arranged in compartments. Adult lunchables basically. Mix of protein, crunch, dip, something savory." },
  { id: "wraps", label: "Wraps & Sandwiches", icon: "🌯", prompt: "WRAPS and SANDWICHES only. Every lunch must be bread or tortilla-based. Think: loaded turkey club on sourdough, chicken caesar wrap, BLT with avocado, hummus veggie wrap, egg salad sandwich. Portable, handheld, satisfying." },
  { id: "salads", label: "Big Salads", icon: "🥬", prompt: "BIG HEARTY SALADS only — not sad desk salads. Every salad must have protein, crunch, and a good dressing. Think: southwest chicken salad, Greek salad with turkey, Asian chopped salad, taco salad with ground turkey. Make them sound delicious." },
  { id: "no-cook", label: "No Cook", icon: "❄️", prompt: "ZERO COOKING required. Every lunch must be 100% cold assembly — no stove, no microwave, no toaster. Just open, assemble, eat. Think: deli roll-ups, cold veggie + hummus boxes, overnight-prepped items, cheese + fruit + nut combos." },
];
