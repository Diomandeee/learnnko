import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google's Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { messages, level, topic, focusArea } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Create context for N'Ko learning conversation
    const systemPrompt = `You are a helpful N'Ko language learning assistant. You help users practice N'Ko through conversation.

Context:
- User's level: ${level || 'beginner'}
- Topic: ${topic || 'general'}
- Focus area: ${focusArea || 'vocabulary'}

Instructions:
1. Respond in a helpful, encouraging way
2. Provide N'Ko text when appropriate
3. Offer corrections and grammar tips
4. Suggest new vocabulary words
5. Keep responses conversational but educational

Respond with a JSON object containing:
- response: Your main response in French/English
- nkoText: The same response in N'Ko script (if applicable)
- translation: Translation if different from response
- corrections: Any corrections to user's input
- grammarNotes: Array of grammar tips
- newWords: Array of new N'Ko vocabulary introduced`;

    // Format messages for Gemini
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add system prompt as first message
    const fullConversation = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...conversationHistory
    ];

    // Generate response with Gemini
    const chat = model.startChat({
      history: fullConversation.slice(0, -1), // All except the last message
    });

    const lastMessage = conversationHistory[conversationHistory.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = await result.response;
    const text = response.text();

    // Try to parse as JSON, fallback to simple response
    let aiResponse;
    try {
      aiResponse = JSON.parse(text);
    } catch {
      // If not JSON, create a simple response structure
      aiResponse = {
        response: text,
        nkoText: "", // Would need actual N'Ko translation
        translation: "",
        corrections: "",
        grammarNotes: [],
        newWords: []
      };
    }

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error("Error in N'Ko AI conversation:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
