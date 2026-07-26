import type { ContentBlock } from "@anthropic-ai/sdk/resources/messages";

/** Pull the text out of a Claude response, ignoring any non-text blocks */
export function textFromContent(content: ContentBlock[]): string {
  return content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

/** Extract JSON from Claude's response, stripping markdown code fences if present */
export function parseJsonResponse(text: string): unknown {
  // Strip markdown code fences like ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  const cleaned = fenceMatch ? fenceMatch[1] : text.trim();
  return JSON.parse(cleaned);
}
