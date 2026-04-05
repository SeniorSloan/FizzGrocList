import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { query } = await req.json();
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ imageUrl: null });
  }

  try {
    const searchQuery = `${query} food recipe meal`;
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape&size=small`,
      { headers: { Authorization: apiKey } }
    );
    const data = await res.json();

    if (data.photos && data.photos.length > 0) {
      // Use the medium size — good quality, fast loading
      const imageUrl = data.photos[0].src.medium;
      return NextResponse.json({ imageUrl });
    }
  } catch {
    // Pexels unavailable, fall back to no image
  }

  return NextResponse.json({ imageUrl: null });
}
