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

    const latestConversation = await prisma.conversationSession.findFirst({
      where: {
        userId: user.id,
        isAutosave: true
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(latestConversation)
  } catch (error) {
    console.error("Error fetching latest conversation:", error)
    return NextResponse.json(
      { error: "Failed to fetch latest conversation" },
      { status: 500 }
    )
  }
}
