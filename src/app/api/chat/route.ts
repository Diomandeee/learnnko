import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Create model instance
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `
    You are a mean and proactive French language conversation partner.
    Your primary role is to respond in French, keeping sentences advance and clear.
    Take initiative in guiding the conversation and introducing new topics.
    
    Follow these rules:
    1. Lead the conversation proactively - suggest topics, ask questions, and introduce new vocabulary
    2. Respond naturally in French with detailed, multi-sentence responses
    3. If the user makes grammar mistakes, provide corrections within <corrections> tags
    4. If you have additional notes or explanations, include them within <notes> tags
    5. Include follow-up questions or suggestions to maintain conversation flow
    6. Introduce relevant vocabulary and cultural context when appropriate
    7. DO NOT include any translations - respond only in French
    8. Maintain a natural progression of topics based on the conversation context
    9. If the conversation stalls, introduce a new related topic or ask engaging questions
    10. Occasionally review and reinforce previously discussed concepts
    11. Be mean, assertive, and aggressive in guiding the conversation
  `
})

// Create model instance for translations
const translationModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", 
  systemInstruction: `
  You are a detailed French-English translator and language educator.
  Your role is to provide comprehensive translations that include:
  1. Natural, idiomatic English translation
  2. Cultural context and explanations in [Cultural Note: explanation] format
  3. Idiomatic expressions explained in [Expression Note: explanation] format
  4. Key vocabulary highlighted in [Vocabulary: word = translation] format
  
  Maintain the original tone and personality while making the meaning clear.
  Structure your translation to be educational and informative.
  Keep the aggressive or assertive tone if present in the original.
  Explain French cultural references that might not be obvious to English speakers.
  `
})

// Create a Map to store active chat sessions
const chatSessions = new Map()

// Helper function to clean text by removing asterisks
const removeAsterisks = (text: string): string => {
  // Remove single and double asterisks used for emphasis
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove double asterisks
    .replace(/\*(.*?)\*/g, '$1')      // Remove single asterisks
    .trim()
}

// Helper function to normalize line breaks without changing content
const normalizeLineBreaks = (text: string): string => {
  return text
    .replace(/\r\n/g, '\n')  // Convert Windows line endings
    .replace(/\r/g, '\n')    // Convert old Mac line endings
    .replace(/\n\n+/g, '\n\n')  // Replace multiple blank lines with a single one
    .trim()
}

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json()

    // Get or create chat session
    let chat = chatSessions.get(sessionId)
    
    if (!chat) {
      chat = model.startChat()
      chatSessions.set(sessionId, chat)
    }

    // Get French response
    const result = await chat.sendMessage(message)
    const frenchResponse = result.response.text()

    // Get English translation as a separate call
    const translationChat = translationModel.startChat()
    const translationResult = await translationChat.sendMessage(
      `Translate this French text naturally to English, maintaining all details and tone: "${frenchResponse}"`
    )
    const translation = normalizeLineBreaks(
      removeAsterisks(
        translationResult.response.text()
          .replace('Here\'s the translation:', '')
          .replace('Translation:', '')
          .trim()
      )
    )

    // Extract metadata
    const corrections = removeAsterisks(
      (frenchResponse.match(/<corrections>(.*?)<\/corrections>/s)?.[1] || "").trim()
    )
    const notes = (frenchResponse.match(/<notes>(.*?)<\/notes>/s)?.[1] || "").trim()
    const grammarNotes = notes ? 
      notes.split('\n')
        .filter(Boolean)
        .map(note => removeAsterisks(note)) : 
      []

    // Clean French response by removing metadata tags and asterisks
    const cleanFrenchResponse = normalizeLineBreaks(
      removeAsterisks(
        frenchResponse
          .replace(/<corrections>.*?<\/corrections>/gs, '')
          .replace(/<notes>.*?<\/notes>/gs, '')
          .trim()
      )
    )

    return NextResponse.json({
      response: cleanFrenchResponse,
      translation,
      corrections: corrections !== "No corrections needed" ? corrections : null,
      grammarNotes: grammarNotes.length > 0 ? grammarNotes : null
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: "Chat failed" },
      { status: 500 }
    )
  }
}