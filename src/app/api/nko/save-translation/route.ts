import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const { sourceText, translation, sourceLang, targetLang, notes } = await req.json()

    if (!sourceText || !translation) {
      return NextResponse.json(
        { error: "Source text and translation are required" },
        { status: 400 }
      )
    }

    // Save translation globally (no user association)
    const savedTranslation = await prisma.nkoTranslationHistory.create({
      data: {
        sourceText,
        translation,
        sourceLang: sourceLang || 'french',
        targetLang: targetLang || 'nko',
        notes: notes || null
      }
    })

    return NextResponse.json(savedTranslation)
  } catch (error) {
    console.error("Error saving translation:", error)
    return NextResponse.json(
      { error: "Failed to save translation" },
      { status: 500 }
    )
  }
}
