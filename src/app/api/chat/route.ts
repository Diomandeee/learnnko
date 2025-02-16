import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: Request) {
  try {
    const { message, language = 'fr' } = await req.json()

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `
        You are a friendly French language conversation partner and helpful translator.
        Your primary role is to respond in French, keeping sentences simple and clear, using common everyday vocabulary. 
        Be patient and supportive, like a helpful tutor.
        After responding in French, ALWAYS provide a direct translation of your response into English.
        Enclose the English translation within <translation> tags.
        Example:
        User: Bonjour
        Assistant: Bonjour! Comment ça va? <translation>Hello! How are you?</translation>
      `
    })

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Bonjour! Comment ça va?" }],
        },
        {
          role: "model",
          parts: [{ text: "Bonjour! Je vais très bien, merci. Comment puis-je vous aider aujourd'hui? <translation>Hello! I'm doing very well, thank you. How can I help you today?</translation>" }],
        },
      ],
    })

    const result = await chat.sendMessage(message)
    const fullResponse = result.response.text();

    // Extract the French response and the English translation using regex.
    const frenchResponse = fullResponse.split('<translation>')[0].trim();
    const translationMatch = fullResponse.match(/<translation>(.*?)<\/translation>/);
    const translation = translationMatch ? translationMatch[1].trim() : "";

    return NextResponse.json({ response: frenchResponse, translation })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: "Chat failed" },
      { status: 500 }
    )
  }
}