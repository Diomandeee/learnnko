import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const savedSuggestions = await prisma.savedSuggestion.findMany({
      orderBy: [
        { isFavorite: 'desc' },
        { useCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(savedSuggestions)
  } catch (error) {
    console.error("Error fetching saved suggestions:", error)
    return NextResponse.json(
      { error: "Failed to fetch saved suggestions" },
      { status: 500 }
    )
  }
}
