import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { parseJsonResponse } from "@/lib/parse-json";

const client = new Anthropic();

export async function POST(req: Request) {
  const { meal } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Give me a simple, easy-to-follow recipe for: "${meal.name}" - ${meal.description}

Key ingredients: ${meal.ingredients.join(", ")}

Keep it practical and approachable. This person shops at HEB and Trader Joe's, prefers high-protein and health-conscious meals, and likes things that aren't too complicated.

IMPORTANT: Default to 4 servings so she can meal prep. Include quantities appropriate for 4 servings.

Return a JSON object with:
- "title": recipe name
- "emoji": a single food emoji that best represents this dish (e.g. "🌮", "🍝", "🥗", "🍲", "🥘", "🍗", "🐟", "🥑", "🧀")
- "prepTime": prep time string (e.g. "10 min")
- "cookTime": cook time string (e.g. "20 min")
- "servings": number (default 4)
- "ingredients": array of strings with quantities (e.g. "1 lb ground turkey")
- "steps": array of instruction strings (clear, numbered steps)
- "tips": one short tip or variation idea

Only return the JSON object, no other text.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  try {
    const recipe = parseJsonResponse(text);
    return NextResponse.json({ recipe });
  } catch {
    console.error("Failed to parse recipe response:", text);
    return NextResponse.json({ recipe: null });
  }
}
