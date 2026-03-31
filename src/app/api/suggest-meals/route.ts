import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { parseJsonResponse } from "@/lib/parse-json";

const client = new Anthropic();

export async function POST(req: Request) {
  const { items, type, dismissed, style } = await req.json();
  const dismissedList = (dismissed || []) as string[];
  const stylePrompt = (style || null) as string | null;

  const freq: Record<string, number> = {};
  for (const item of items) {
    const key = item.toLowerCase().trim();
    freq[key] = (freq[key] || 0) + 1;
  }

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const shuffled = sorted.slice(0, 30).sort(() => Math.random() - 0.5);
  const topItems = shuffled
    .map(([name, count]) => `${name} (bought ${count}x)`)
    .join(", ");

  const dinnerThemes = [
    "Try an Asian-inspired option.",
    "Include a soup or chili.",
    "Try a breakfast-for-dinner idea.",
    "Include a sheet pan meal.",
    "Include a slow cooker or one-pot meal.",
    "Try a Mediterranean twist.",
    "Include a stir-fry or skillet meal.",
    "Try a casserole or bake.",
  ];

  const lunchThemes = [
    "Include a grain bowl option.",
    "Try a lettuce wrap idea.",
    "Include a snack plate / bento style lunch.",
    "Try a soup + sandwich combo.",
    "Include a mason jar salad idea.",
    "Try a loaded toast or bagel idea.",
  ];

  const themes = type === "dinner" ? dinnerThemes : lunchThemes;
  const theme = themes[Math.floor(Math.random() * themes.length)];

  const prompt =
    type === "dinner"
      ? `Suggest 4-5 DINNER ideas for a health-conscious woman. These should be meal-prep friendly — cook once, eat for 3-4 days. She shops at HEB and Trader Joe's.

Her style:
- Loves Mexican-inspired food (tacos, enchiladas, taco bowls, burritos)
- Big on lean protein: ground turkey, chicken breast, salmon pouches
- Buys Annie's/Goodles protein mac, cauliflower pizza for easy nights
- NOT a fancy cook — keep it simple, practical, and satisfying
- Likes big batch meals she can portion out

CRITICAL RULES — read carefully:
- Every meal must be a REAL recipe that a normal person would actually cook and enjoy eating
- Do NOT randomly combine items from her shopping history. Just because she buys yogurt AND chicken does NOT mean they go in the same dish.
- Stick to proven dinner formats: tacos/burritos, stir fry, pasta, sheet pan, soup/chili, casserole, rice bowls
- These are DINNER meal preps. Think one-pot, sheet pan, casseroles, bowls
- Be creative and varied — don't just suggest taco bowls every time
${stylePrompt ? `\nSPECIAL REQUEST: ${stylePrompt}` : `- ${theme}`}

Her frequently purchased items: ${topItems}
${dismissedList.length > 0 ? `\nDO NOT suggest these meals (she already dismissed them): ${dismissedList.join(", ")}` : ""}`
      : `Suggest 4-5 LUNCH ideas for a health-conscious woman. These should be easy to throw together in the morning (under 10 min) or grab-and-go.

Her style:
- Buys lots of deli meat, cheese sticks, hard boiled eggs, tortillas, sourdough bread
- Likes salad kits, hummus, dipping veggies, yogurt
- Shops at HEB and Trader Joe's
- NOT into complicated recipes — needs fast, practical, packable lunches

CRITICAL RULES — read carefully:
- Every meal must taste good as a REAL combination. Ask yourself: would a normal person actually eat this together?
- Do NOT randomly combine items from her shopping history into one meal. Just because she buys raspberries AND white beans does NOT mean they go together.
- NEVER put fruit in savory bowls. Fruit is for snacking or breakfast, not lunch bowls.
- NEVER combine beans/legumes with yogurt or eggs in the same dish unless it's a well-known real recipe.
- Stick to proven lunch formats: deli wraps/sandwiches, salads with protein, snack/bento plates, grain bowls, soup + side
- Think about what a real person would pack for work lunch
- Be creative and varied — don't just suggest turkey wraps every time
${stylePrompt ? `\nSPECIAL REQUEST: ${stylePrompt}` : `- ${theme}`}

Her frequently purchased items: ${topItems}
${dismissedList.length > 0 ? `\nDO NOT suggest these meals (she already dismissed them): ${dismissedList.join(", ")}` : ""}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    temperature: 0.9,
    messages: [
      {
        role: "user",
        content: `${prompt}

Return a JSON array of objects with: "name" (meal name), "description" (one short sentence about the meal), "ingredients" (array of key ingredients that actually go in this meal). Only return the JSON array, no other text.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  try {
    const meals = parseJsonResponse(text);
    return NextResponse.json({ meals });
  } catch {
    console.error("Failed to parse meals response:", text);
    return NextResponse.json({ meals: [] });
  }
}
