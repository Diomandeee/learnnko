import { NextResponse } from "next/server"

const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY as string
const TRANSLATE_API_URL = "https://translation.googleapis.com/language/translate/v2"

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    const response = await fetch(`${TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'fr',
        target: 'en',
        format: 'text'
      })
    })

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`)
    }

    const data = await response.json()
    const translation = data.data.translations[0].translatedText

    return NextResponse.json({ translation })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    )
  }
}
