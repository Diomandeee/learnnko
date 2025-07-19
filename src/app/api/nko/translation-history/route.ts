import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    // Get global translation history (no user authentication)
    const history = await prisma.nkoTranslationHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Format for the frontend
    const formattedHistory = history.map(item => ({
      input: item.sourceText,
      output: item.translation,
      fromLang: item.sourceLang,
      toLang: item.targetLang,
      timestamp: item.createdAt
    }))

    return NextResponse.json({ history: formattedHistory })
  } catch (error) {
    console.error("Error fetching translation history:", error)
    return NextResponse.json(
      { error: "Failed to fetch translation history" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { sourceText, translation, sourceLang, targetLang } = await req.json()

    if (!sourceText || !translation) {
      return NextResponse.json(
        { error: "Source text and translation are required" },
        { status: 400 }
      )
    }

    // Save translation to global history
    const historyItem = await prisma.nkoTranslationHistory.create({
      data: {
        sourceText,
        translation,
        sourceLang: sourceLang || 'french',
        targetLang: targetLang || 'nko'
      }
    })

    return NextResponse.json(historyItem)
  } catch (error) {
    console.error("Error saving translation history:", error)
    return NextResponse.json(
      { error: "Failed to save translation history" },
      { status: 500 }
    )
  }
}
