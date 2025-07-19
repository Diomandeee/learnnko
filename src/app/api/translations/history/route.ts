import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const translations = await prisma.translation.findMany({
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to recent translations
    })

    return NextResponse.json(translations)
  } catch (error) {
    console.error("[TRANSLATIONS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch translations" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    await prisma.translation.deleteMany({})

    return NextResponse.json({ message: "Translation history cleared" })
  } catch (error) {
    console.error("[TRANSLATIONS_DELETE]", error)
    return NextResponse.json(
      { error: "Failed to clear translation history" },
      { status: 500 }
    )
  }
}
