import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { parseJsonResponse } from "@/lib/parse-json";

const client = new Anthropic();

export async function POST(req: Request) {
  const { query, shoppingHistory } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    temperature: 0.8,
    messages: [
      {
        role: "user",
        content: `A health-conscious woman is craving: "${query}"

She shops at HEB and Trader Joe's. She typically buys: ${(shoppingHistory || []).slice(0, 25).join(", ")}

Suggest 4 DIFFERENT recipe options that satisfy this craving. Each should be a distinctly different take — vary the protein, cooking style, or cuisine. Make them practical and healthy-ish.

IMPORTANT: These should be REAL well-known recipes, not weird mashups. If she says "chicken salad" she means an actual chicken salad recipe — not just chicken placed on lettuce. If she says "tacos" give her real taco recipes with proper seasoning and toppings.

Return a JSON array of 4 objects, each with:
- "name": recipe name
- "description": one sentence about what makes this version unique
- "ingredients": array of 4-6 key ingredients (just names, no quantities)

Only return the JSON array, no other text.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  try {
    const options = parseJsonResponse(text);
    return NextResponse.json({ options });
  } catch {
    console.error("Failed to parse search results:", text);
    return NextResponse.json({ options: [] });
  }
}
