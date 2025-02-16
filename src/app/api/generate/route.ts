import { NextResponse } from "next/server";
import { generateSimilarSentences } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { text, depth = 0, maxDepth = 2 } = await req.json();
    
    if (depth >= maxDepth) {
      return NextResponse.json({ sentences: [] });
    }

    const sentences = await generateSimilarSentences(text);
    
    return NextResponse.json({ sentences });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate sentences" },
      { status: 500 }
    );
  }
}
