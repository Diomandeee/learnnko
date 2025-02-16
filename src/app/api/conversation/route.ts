import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "")

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as Blob
    
    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      )
    }

    // Convert Blob to Buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload file using File API
    const uploadResult = await fileManager.uploadFile(buffer, {
      mimeType: "audio/webm",
      displayName: `audio_${Date.now()}.webm`,
    })

    // Wait for processing
    let file = await fileManager.getFile(uploadResult.file.name)
    while (file.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      file = await fileManager.getFile(uploadResult.file.name)
    }

    if (file.state === FileState.FAILED) {
      throw new Error("Audio processing failed")
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Generate content using the uploaded file
    const result = await model.generateContent([
      {
        fileData: {
          fileUri: file.uri,
          mimeType: file.mimeType,
        }
      },
      {
        text: `
          Please process this French audio and provide:
          1. The transcription of the French speech
          2. The English translation
          3. A natural French response
          4. The English translation of your response

          Format your response exactly as:
          Transcription: [French transcription]
          Translation: [English translation]
          Response: [Your French response]
          Response Translation: [English translation of response]
        `
      }
    ])

    // Clean up the uploaded file
    await fileManager.deleteFile(file.name)

    // Process the response
    const responseText = await result.response.text()
    
    // Parse the response
    const sections = {
      transcription: '',
      translation: '',
      response: '',
      responseTranslation: ''
    }

    const lines = responseText.split('\n')
    let currentSection = ''

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('Transcription:')) {
        currentSection = 'transcription'
        sections.transcription = trimmedLine.replace('Transcription:', '').trim()
      } else if (trimmedLine.startsWith('Translation:')) {
        currentSection = 'translation'
        sections.translation = trimmedLine.replace('Translation:', '').trim()
      } else if (trimmedLine.startsWith('Response:')) {
        currentSection = 'response'
        sections.response = trimmedLine.replace('Response:', '').trim()
      } else if (trimmedLine.startsWith('Response Translation:')) {
        currentSection = 'responseTranslation'
        sections.responseTranslation = trimmedLine.replace('Response Translation:', '').trim()
      } else if (trimmedLine && currentSection) {
        sections[currentSection] += ' ' + trimmedLine
      }
    }

    return NextResponse.json(sections)
  } catch (error) {
    console.error('Conversation error:', error)
    return NextResponse.json(
      { 
        error: "Failed to process conversation",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
