import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { prisma } from "@/lib/db/prisma"

// Initialize Google's Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

export async function POST(req: Request) {
  try {
    const { text, from, to } = await req.json()
    
    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      )
    }
    
    // Generate the translation with Gemini
    const prompt = `
      Translate this ${from} text to ${to}:
      
      "${text}"
      
      ${to === 'nko' ? 'Return only the N\'Ko script translation, nothing else.' : 
        'Return only the translation, nothing else.'}
    `
    
    const result = await model.generateContent(prompt)
    const translation = result.response.text().trim()
    
    // Save to translation history globally (without user association)
    try {
      await prisma.nkoTranslationHistory.create({
        data: {
          sourceText: text,
          translation,
          sourceLang: from,
          targetLang: to
        }
      })
    } catch (error) {
      console.error("Error saving translation history:", error)
      // Continue even if saving history fails
    }
    
    return NextResponse.json({
      translation,
      sourceText: text,
      sourceLang: from,
      targetLang: to
    })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    )
  }
}
