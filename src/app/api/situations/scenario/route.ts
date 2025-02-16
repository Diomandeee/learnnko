import { NextResponse } from "next/server"
import { openai } from "@/lib/openai"

export async function POST(req: Request) {
  try {
    const { situationId } = await req.json()

    if (!situationId) {
      return NextResponse.json(
        { error: "Situation ID is required" },
        { status: 400 }
      )
    }

    // Define situation-specific prompts
    const situationPrompts: Record<string, string> = {
      cafe: "Create a scenario for ordering at a French café",
      shopping: "Create a scenario for shopping in a French store",
      restaurant: "Create a scenario for dining at a French restaurant",
      hotel: "Create a scenario for checking into a French hotel",
      transport: "Create a scenario for using French public transport",
      business: "Create a scenario for a French business meeting"
    }

    const basePrompt = `
Create a realistic French conversation scenario for: ${situationPrompts[situationId]}.

The response should be a dialogue that includes:
1. A natural conversation between 2-3 people
2. English translations for each line
3. Cultural tips specific to France
4. Common useful phrases
5. Multiple response options for the learner

Conversation rules:
- Keep sentences short and clear
- Use common, everyday vocabulary
- Include both formal and informal options
- Add cultural context where relevant

Return the response in this exact JSON format:
{
  "scenario": [
    {
      "role": "system",
      "content": "Cultural context or tip in English",
      "translation": null
    },
    {
      "role": "assistant",
      "content": "French dialogue line",
      "translation": "English translation",
      "suggestions": null
    },
    {
      "role": "user",
      "content": "French response",
      "translation": "English translation",
      "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
    }
  ],
  "phrases": [
    {
      "french": "Useful French phrase",
      "english": "English translation",
      "context": "When to use this phrase",
      "formalLevel": "formal"
    }
  ]
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a French language teaching assistant specializing in practical, real-world conversations."
        },
        {
          role: "user",
          content: basePrompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    let response
    try {
      response = JSON.parse(completion.choices[0].message.content || "{}")
      
      // Validate response structure
      if (!response.scenario || !response.phrases) {
        throw new Error("Invalid response structure")
      }
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error)
      return NextResponse.json(
        { error: "Failed to generate valid scenario" },
        { status: 500 }
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Scenario generation error:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate scenario",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
