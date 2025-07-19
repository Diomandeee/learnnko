import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const { french, english, context, category } = await req.json()

    const savedSuggestion = await prisma.savedSuggestion.create({
      data: {
        // Remove userId requirement - make suggestions global
        french,
        english,
        context: context || null,
        category: category || "general"
      },
    })

    return NextResponse.json(savedSuggestion)
  } catch (error) {
    console.error("Error saving suggestion:", error)
    return NextResponse.json(
      { error: "Failed to save suggestion" },
      { status: 500 }
    )
  }
}
