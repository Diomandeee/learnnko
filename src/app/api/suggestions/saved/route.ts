import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
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

    const savedSuggestions = await prisma.savedSuggestion.findMany({
      where: {
        userId: user.id
      },
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
