import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const { word, translation, definition } = await req.json()

    const savedWord = await prisma.wordBank.create({
      data: {
        // Remove userId requirement - make it optional or use a default
        word,
        translation,
        definition: definition || "",
      },
    })

    return NextResponse.json(savedWord)
  } catch (error) {
    console.error("[WORDBANK_POST]", error)
    return NextResponse.json(
      { error: "Failed to save word" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const words = await prisma.wordBank.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(words)
  } catch (error) {
    console.error("[WORDBANK_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    )
  }
}
