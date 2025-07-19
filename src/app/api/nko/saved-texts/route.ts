import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    // Get all saved texts globally with explicit field selection
    const savedTexts = await prisma.nkoSavedText.findMany({
      select: {
        id: true,
        text: true,
        translation: true,
        notes: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      texts: savedTexts.map(item => item.text),
      savedTexts: savedTexts
    });
  } catch (error) {
    console.error("Error fetching saved texts:", error);
    // Return empty array instead of error to prevent UI breaking
    return NextResponse.json({
      texts: [],
      savedTexts: []
    });
  }
}
