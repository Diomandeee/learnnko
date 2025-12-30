import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const { messages, topic, stats } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      )
    }

    // Find existing autosave conversation or create new one
    let autosaveConversation = await prisma.conversationSession.findFirst({
      where: {
        isAutosave: true
      },
      include: {
        messages: true
      }
    })

    if (autosaveConversation) {
      // Delete existing messages and update the conversation
      await prisma.message.deleteMany({
        where: {
          sessionId: autosaveConversation.id
        }
      })

      // Update the conversation
      autosaveConversation = await prisma.conversationSession.update({
        where: {
          id: autosaveConversation.id
        },
        data: {
          topic: topic || 'N\'Ko Practice',
          stats: stats || {},
          updatedAt: new Date()
        },
        include: {
          messages: true
        }
      })

      // Create new messages
      const createdMessages = await Promise.all(
        messages.map((msg: any, index: number) =>
          prisma.message.create({
            data: {
              sessionId: autosaveConversation!.id,
              role: msg.role,
              content: msg.content,
              translation: msg.translation || null,
              timestamp: new Date(msg.timestamp || Date.now()),
              mood: msg.mood || null,
              correctedContent: msg.correctedContent || null,
              grammarNotes: msg.grammarNotes || []
            }
          })
        )
      )

      autosaveConversation.messages = createdMessages
    } else {
      // Create new autosave conversation
      autosaveConversation = await prisma.conversationSession.create({
        data: {
          topic: topic || 'N\'Ko Practice',
          isAutosave: true,
          stats: stats || {}
        },
        include: {
          messages: true
        }
      })

      // Create messages
      const createdMessages = await Promise.all(
        messages.map((msg: any, index: number) =>
          prisma.message.create({
            data: {
              sessionId: autosaveConversation!.id,
              role: msg.role,
              content: msg.content,
              translation: msg.translation || null,
              timestamp: new Date(msg.timestamp || Date.now()),
              mood: msg.mood || null,
              correctedContent: msg.correctedContent || null,
              grammarNotes: msg.grammarNotes || []
            }
          })
        )
      )

      autosaveConversation.messages = createdMessages
    }

    return NextResponse.json({
      id: autosaveConversation.id,
      topic: autosaveConversation.topic,
      messages: autosaveConversation.messages,
      stats: autosaveConversation.stats,
      timestamp: autosaveConversation.updatedAt
    })
  } catch (error) {
    console.error("Error autosaving conversation:", error)
    return NextResponse.json(
      { error: "Failed to autosave conversation" },
      { status: 500 }
    )
  }
}
