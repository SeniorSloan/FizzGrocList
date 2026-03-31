import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { parseJsonResponse } from "@/lib/parse-json";

const client = new Anthropic();

export async function POST(req: Request) {
  const { query, shoppingHistory } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `A health-conscious woman is craving: "${query}"

She shops at HEB and Trader Joe's. She typically buys: ${(shoppingHistory || []).slice(0, 25).join(", ")}

Create a recipe that satisfies her craving while keeping it relatively healthy and using ingredients she'd normally buy. Make it practical and not too complicated.

Return a JSON object with:
- "title": recipe name
- "description": one sentence about the dish
- "prepTime": prep time (e.g. "10 min")
- "cookTime": cook time (e.g. "20 min")
- "servings": number
- "ingredients": array of strings with quantities (e.g. "1 lb ground turkey")
- "steps": array of instruction strings
- "tips": one short tip or variation

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
    console.error("Failed to parse search recipe:", text);
    return NextResponse.json({ recipe: null });
  }
}
