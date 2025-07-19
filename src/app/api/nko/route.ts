import { NextResponse } from "next/server"
import { NkoContentGenerator } from "@/lib/nko/content-generator"

export async function GET() {
  try {
    // Return basic information about the NKO API endpoints
    return NextResponse.json({
      endpoints: [
        { path: "/api/nko/progress", description: "Get or update user progress" },
        { path: "/api/nko/lessons", description: "Get lesson list or specific lesson content" },
        { path: "/api/nko/dictionary/search", description: "Search the NKO dictionary" },
        { path: "/api/nko/save-text", description: "Save NKO text" },
        { path: "/api/nko/saved-texts", description: "Get saved NKO texts" },
        { path: "/api/nko/tts", description: "Text-to-speech for NKO" }
      ],
      status: "operational"
    })
  } catch (error) {
    console.error("Error in NKO API:", error)
    return NextResponse.json(
      { error: "API error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { action, data } = await req.json()

    switch (action) {
      case "generate-exercises":
        const { topic, level, count } = data
        const exercises = await NkoContentGenerator.generateExercises(topic, level, count)
        return NextResponse.json(exercises)
      
      case "generate-examples":
        const { vocabulary, grammarPoint, exampleCount } = data
        const examples = await NkoContentGenerator.generateExampleSentences(vocabulary, grammarPoint, exampleCount)
        return NextResponse.json(examples)
      
      case "translate":
        const { text, from, to } = data
        const translation = await NkoContentGenerator.translateText(text, from, to)
        return NextResponse.json(translation)
      
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error in NKO API:", error)
    return NextResponse.json(
      { error: "API error" },
      { status: 500 }
    )
  }
}
