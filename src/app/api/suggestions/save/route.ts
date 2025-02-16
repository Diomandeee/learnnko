import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const suggestion = await req.json()

    const existingSuggestion = await prisma.savedSuggestion.findFirst({
      where: {
        userId: user.id,
        text: suggestion.text
      }
    })

    if (existingSuggestion) {
      return NextResponse.json(
        { error: "Suggestion already saved" },
        { status: 400 }
      )
    }

    const savedSuggestion = await prisma.savedSuggestion.create({
      data: {
        userId: user.id,
        text: suggestion.text,
        translation: suggestion.translation,
        category: suggestion.category,
        context: suggestion.context
      }
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
