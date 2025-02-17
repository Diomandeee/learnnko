
import { NextResponse } from "next/server"
import { openai } from "@/lib/openai"

interface Suggestion {
  text: string
  translation: string
  category: 'response' | 'question' | 'clarification'
}

export async function POST(req: Request) {
  try {
    const { lastMessage, count = 5 } = await req.json()

    if (!lastMessage) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const prompt = `Given this message in a French conversation: "${lastMessage}"

Please generate ${count} natural French responses without any asterisks or formatting symbols.
Each response should be on its own line, followed by its English translation.
Make responses conversational and natural.

Format each response exactly like this:
French: (French text)
Translation: (English translation)
Category: (response/question/clarification)

Generate ${count} different responses with varying styles and intents.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })

    const response = completion.choices[0].message.content
    let suggestions: Suggestion[] = []

    try {
      // Split into groups of 3 lines
      const lines = response?.split('\n').filter(line => line.trim())
      
      for (let i = 0; i < lines.length; i += 3) {
        if (i + 2 < lines.length) {
          const frenchLine = lines[i].replace(/^French:\s*/, '').trim()
          const translationLine = lines[i + 1].replace(/^Translation:\s*/, '').trim()
          const categoryLine = lines[i + 2].replace(/^Category:\s*/, '').trim()

          suggestions.push({
            text: frenchLine,
            translation: translationLine,
            category: categoryLine as 'response' | 'question' | 'clarification'
          })
        }
      }

      if (!suggestions.length) {
        throw new Error("No valid suggestions generated")
      }

      // Ensure we have the requested number of suggestions
      suggestions = suggestions.slice(0, count)

    } catch (parseError) {
      console.error("Failed to parse suggestions:", parseError)
      throw new Error("Invalid response format from AI")
    }

    return NextResponse.json({ 
      suggestions: suggestions.map((s, i) => ({
        ...s,
        id: `suggestion-${i + 1}`
      }))
    })

  } catch (error) {
    console.error("Suggestions generation error:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate suggestions",
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}
