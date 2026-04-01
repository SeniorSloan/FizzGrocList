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

  let prompt: string;

  if (type === "dinner" && stylePrompt) {
    // Style-driven dinner prompt — style is the MAIN instruction
    prompt = `You are a meal planning assistant. Suggest 4-5 DINNER ideas that STRICTLY follow this theme:

>>> ${stylePrompt} <<<

This is the #1 priority. EVERY meal you suggest MUST fit this theme. Do not suggest generic meals.

Context about the person:
- Shops at HEB and Trader Joe's
- Prefers simple, practical cooking — not a chef
- Likes meal prep (cook once, eat 3-4 days)
- Her commonly purchased items: ${topItems}

Rules:
- Every meal must be a REAL recipe people actually cook
- Do NOT randomly mash ingredients together
- Be creative — give her something she hasn't thought of
${dismissedList.length > 0 ? `- DO NOT suggest: ${dismissedList.join(", ")}` : ""}`;
  } else if (type === "dinner") {
    prompt = `Suggest 4-5 DINNER ideas for a health-conscious woman. Meal-prep friendly — cook once, eat 3-4 days. She shops at HEB and Trader Joe's.

Her style:
- Loves Mexican-inspired food (tacos, enchiladas, taco bowls, burritos)
- Big on lean protein: ground turkey, ground beef, chicken breast, salmon, tilapia, shrimp, tuna
- Buys Annie's/Goodles protein mac, cauliflower pizza for easy nights
- NOT a fancy cook — simple, practical, satisfying
- Likes big batch meals she can portion out
- Include some fish/seafood options sometimes — she buys salmon, tilapia, shrimp, cod

Rules:
- Every meal must be a REAL recipe a normal person would cook
- Do NOT randomly combine shopping history items into one dish
- Stick to proven formats: tacos, stir fry, pasta, sheet pan, soup/chili, casserole, rice bowls
- Be creative and varied
- ${theme}

Her frequently purchased items: ${topItems}
${dismissedList.length > 0 ? `\nDO NOT suggest: ${dismissedList.join(", ")}` : ""}`;
  } else if (type === "lunch" && stylePrompt) {
    // Style-driven lunch prompt
    prompt = `You are a meal planning assistant. Suggest 4-5 LUNCH ideas that STRICTLY follow this theme:

>>> ${stylePrompt} <<<

This is the #1 priority. EVERY lunch you suggest MUST fit this theme. Do not suggest generic lunches.

Context about the person:
- Shops at HEB and Trader Joe's
- Needs lunches she can pack for work — fast, practical
- Her commonly purchased items: ${topItems}

Rules:
- Every lunch must taste good as a REAL combination
- Do NOT randomly mash ingredients together
- No fruit in savory dishes
- Be creative — give her something she hasn't thought of
${dismissedList.length > 0 ? `- DO NOT suggest: ${dismissedList.join(", ")}` : ""}`;
  } else {
    prompt = `Suggest 4-5 LUNCH ideas for a health-conscious woman. Easy to throw together in the morning (under 10 min) or grab-and-go.

Her style:
- Buys deli meat, cheese sticks, hard boiled eggs, tortillas, sourdough bread
- Likes salad kits, hummus, dipping veggies, yogurt
- Shops at HEB and Trader Joe's
- Needs fast, practical, packable lunches

Rules:
- Every meal must taste good as a REAL combination
- Do NOT randomly combine shopping history items
- No fruit in savory bowls, no beans with yogurt
- Stick to proven formats: wraps, salads, snack plates, grain bowls, sandwiches
- Be creative and varied
- ${theme}

Her frequently purchased items: ${topItems}
${dismissedList.length > 0 ? `\nDO NOT suggest: ${dismissedList.join(", ")}` : ""}`;
  }

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
