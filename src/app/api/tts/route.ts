import { NextResponse } from "next/server"

const TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY as string
const TTS_API_URL = "https://texttospeech.googleapis.com/v1/text:synthesize"

export async function POST(req: Request) {
  try {
    const { text, languageCode = 'fr-FR' } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      )
    }

    // Configure voice based on language
    const voiceConfig = {
      'fr-FR': { name: 'fr-FR-Neural2-A', ssmlGender: 'FEMALE' },
      'en-US': { name: 'en-US-Neural2-C', ssmlGender: 'FEMALE' },
    }[languageCode]

    const response = await fetch(`${TTS_API_URL}?key=${TTS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: {
          ...voiceConfig,
          languageCode,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: 0,
          speakingRate: 1,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('TTS API error:', error)
      throw new Error(error.error?.message || 'Failed to generate speech')
    }

    const data = await response.json()
    const audioContent = data.audioContent

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioContent, 'base64')

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    )
  }
}
