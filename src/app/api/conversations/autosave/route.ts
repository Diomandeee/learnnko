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

    // Create or update autosave conversation globally
    const autosaveConversation = await prisma.conversationSession.upsert({
      where: {
        // Find the most recent autosave conversation
        id: 'autosave-global' // Use a fixed ID for global autosave
      },
      update: {
        topic: topic || 'N\'Ko Practice',
        updatedAt: new Date(),
        stats: stats || {},
        messages: {
          deleteMany: {}, // Clear existing messages
          create: messages.map((msg: any, index: number) => ({
            role: msg.role,
            content: msg.content,
            translation: msg.translation,
            timestamp: new Date(msg.timestamp || Date.now()),
            mood: msg.mood,
            correctedContent: msg.correctedContent,
            grammarNotes: msg.grammarNotes || []
          }))
        }
      },
      create: {
        id: 'autosave-global',
        topic: topic || 'N\'Ko Practice',
        isAutosave: true,
        stats: stats || {},
        messages: {
          create: messages.map((msg: any, index: number) => ({
            role: msg.role,
            content: msg.content,
            translation: msg.translation,
            timestamp: new Date(msg.timestamp || Date.now()),
            mood: msg.mood,
            correctedContent: msg.correctedContent,
            grammarNotes: msg.grammarNotes || []
          }))
        }
      },
      include: {
        messages: true
      }
    })

    return NextResponse.json(autosaveConversation)
  } catch (error) {
    console.error("Error autosaving conversation:", error)
    return NextResponse.json(
      { error: "Failed to autosave conversation" },
      { status: 500 }
    )
  }
}
