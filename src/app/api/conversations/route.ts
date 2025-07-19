import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const { topic, messages, stats } = await req.json()

    const conversationSession = await prisma.conversationSession.create({
      data: {
        // Remove userId requirement - will need to update schema to make this optional
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
    const conversations = await prisma.conversationSession.findMany({
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc'
          }
        }
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
