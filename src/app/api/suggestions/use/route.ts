import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const { suggestionId } = await req.json()

    const updatedSuggestion = await prisma.savedSuggestion.update({
      where: {
        id: suggestionId,
      },
      data: {
        useCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json(updatedSuggestion)
  } catch (error) {
    console.error("Error updating use count:", error)
    return NextResponse.json(
      { error: "Failed to update use count" },
      { status: 500 }
    )
  }
}
