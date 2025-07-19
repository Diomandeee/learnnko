import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const { text, translation, notes } = await req.json();
    
    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Save text globally (without user association)
    const savedText = await prisma.nkoSavedText.create({
      data: {
        text,
        translation,
        notes
      }
    });

    return NextResponse.json(savedText);
  } catch (error) {
    console.error("Error saving text:", error);
    return NextResponse.json(
      { error: "Failed to save text" },
      { status: 500 }
    );
  }
}
