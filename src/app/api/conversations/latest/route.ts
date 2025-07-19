import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const latestConversation = await prisma.conversationSession.findFirst({
      where: {
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
