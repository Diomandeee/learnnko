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

    const { topic, messages, stats } = await req.json()

    // Create new conversation session
    const conversationSession = await prisma.conversationSession.create({
      data: {
        userId: user.id,
        topic,
        endedAt: new Date(),
        duration: stats.timeSpent,
        stats: stats,
        messages: {
          create: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            translation: msg.translation,
            audioUrl: msg.audioUrl,
            timestamp: new Date(msg.timestamp),
            mood: msg.mood,
            correctedContent: msg.correctedContent,
            grammarNotes: msg.grammarNotes || [],
          }))
        }
      },
      include: {
        messages: true
      }
    })

    return NextResponse.json(conversationSession)
  } catch (error) {
    console.error("Error saving conversation:", error)
    return NextResponse.json(
      { error: "Failed to save conversation" },
      { status: 500 }
    )
  }
}

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

    const conversations = await prisma.conversationSession.findMany({
      where: {
        userId: user.id
      },
      include: {
        messages: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}
