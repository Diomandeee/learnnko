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

    const { suggestionId } = await req.json()

    const updatedSuggestion = await prisma.savedSuggestion.update({
      where: {
        id: suggestionId,
        userId: user.id
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
