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

    // Find existing autosave
    const existingAutosave = await prisma.conversationSession.findFirst({
      where: {
        userId: user.id,
        isAutosave: true
      }
    })

    let autosave;

    if (existingAutosave) {
      // Update existing autosave
      autosave = await prisma.conversationSession.update({
        where: { id: existingAutosave.id },
        data: {
          topic,
          stats,
          updatedAt: new Date(),
          messages: {
            deleteMany: {},
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
    } else {
      // Create new autosave
      autosave = await prisma.conversationSession.create({
        data: {
          userId: user.id,
          topic,
          isAutosave: true,
          stats,
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
    }

    return NextResponse.json(autosave)
  } catch (error) {
    console.error("Autosave error:", error)
    return NextResponse.json(
      { error: "Failed to autosave", details: error },
      { status: 500 }
    )
  }
}
