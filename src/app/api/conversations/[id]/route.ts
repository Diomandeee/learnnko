import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const conversation = await prisma.conversationSession.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc'
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(conversation)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch conversation", details: errorMessage },
      { status: 500 }
    )
  }
}
