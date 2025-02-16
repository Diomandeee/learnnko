import { NextResponse } from "next/server"
import { openai } from "@/lib/openai"

export async function POST(req: Request) {
  try {
    const { lastMessage, count = 5 } = await req.json()

    const prompt = `Given this message in a French conversation: "${lastMessage}"

Generate ${count} natural French responses that would be appropriate in this context.
Each response should be different in style and intent.
Include English translations.

Format each suggestion as:
{
  "text": "French response",
  "translation": "English translation",
  "category": "response" | "question" | "clarification"
}

Return only the JSON array of suggestions.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    const suggestions = JSON.parse(completion.choices[0].message.content || "{}").suggestions

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Suggestions error:", error)
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    )
  }
}