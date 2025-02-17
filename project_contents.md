### /Users/mohameddiomande/Desktop/french-connect/src/app/api/chat/route.ts
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
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/translate/route.ts
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

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = registerSchema.parse(json);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(body.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/auth/[...nextauth]/route.ts
import { authOptions } from "@/lib/auth/options";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/situations/scenario/route.ts
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

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/conversations/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const { topic, messages, stats } = await req.json()

    // Create new conversation session
    const conversationSession = await prisma.conversationSession.create({
      data: {
        userId: user.id,
        topic,
        endedAt: new Date(),
        duration: stats.timeSpent,
        stats: stats,
        messages: {
          create: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            translation: msg.translation,
            audioUrl: msg.audioUrl,
            timestamp: new Date(msg.timestamp),
            mood: msg.mood,
            correctedContent: msg.correctedContent,
            grammarNotes: msg.grammarNotes || [],
          }))
        }
      },
      include: {
        messages: true
      }
    })

    return NextResponse.json(conversationSession)
  } catch (error) {
    console.error("Error saving conversation:", error)
    return NextResponse.json(
      { error: "Failed to save conversation" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const conversations = await prisma.conversationSession.findMany({
      where: {
        userId: user.id
      },
      include: {
        messages: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/conversations/autosave/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const { topic, messages, stats } = await req.json()

    // Find existing autosave
    const existingAutosave = await prisma.conversationSession.findFirst({
      where: {
        userId: user.id,
        isAutosave: true
      }
    })

    let autosave;

    if (existingAutosave) {
      // Update existing autosave
      autosave = await prisma.conversationSession.update({
        where: { id: existingAutosave.id },
        data: {
          topic,
          stats,
          updatedAt: new Date(),
          messages: {
            deleteMany: {},
            create: messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
              translation: msg.translation,
              audioUrl: msg.audioUrl,
              timestamp: new Date(msg.timestamp),
              mood: msg.mood,
              correctedContent: msg.correctedContent,
              grammarNotes: msg.grammarNotes || [],
            }))
          }
        },
        include: {
          messages: true
        }
      })
    } else {
      // Create new autosave
      autosave = await prisma.conversationSession.create({
        data: {
          userId: user.id,
          topic,
          isAutosave: true,
          stats,
          messages: {
            create: messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
              translation: msg.translation,
              audioUrl: msg.audioUrl,
              timestamp: new Date(msg.timestamp),
              mood: msg.mood,
              correctedContent: msg.correctedContent,
              grammarNotes: msg.grammarNotes || [],
            }))
          }
        },
        include: {
          messages: true
        }
      })
    }

    return NextResponse.json(autosave)
  } catch (error) {
    console.error("Autosave error:", error)
    return NextResponse.json(
      { error: "Failed to autosave", details: error },
      { status: 500 }
    )
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/conversations/[id]/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const conversation = await prisma.conversationSession.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc'
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(conversation)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch conversation", details: errorMessage },
      { status: 500 }
    )
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/tts/route.ts
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

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { generateSimilarSentences } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { text, depth = 0, maxDepth = 2 } = await req.json();
    
    if (depth >= maxDepth) {
      return NextResponse.json({ sentences: [] });
    }

    const sentences = await generateSimilarSentences(text);
    
    return NextResponse.json({ sentences });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate sentences" },
      { status: 500 }
    );
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/suggestions/route.ts
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
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/suggestions/saved/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const savedSuggestions = await prisma.savedSuggestion.findMany({
      where: {
        userId: user.id
      },
      orderBy: [
        { isFavorite: 'desc' },
        { useCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(savedSuggestions)
  } catch (error) {
    console.error("Error fetching saved suggestions:", error)
    return NextResponse.json(
      { error: "Failed to fetch saved suggestions" },
      { status: 500 }
    )
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/suggestions/use/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const { suggestionId } = await req.json()

    const updatedSuggestion = await prisma.savedSuggestion.update({
      where: {
        id: suggestionId,
        userId: user.id
      },
      data: {
        useCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json(updatedSuggestion)
  } catch (error) {
    console.error("Error updating use count:", error)
    return NextResponse.json(
      { error: "Failed to update use count" },
      { status: 500 }
    )
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/suggestions/save/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const suggestion = await req.json()

    const existingSuggestion = await prisma.savedSuggestion.findFirst({
      where: {
        userId: user.id,
        text: suggestion.text
      }
    })

    if (existingSuggestion) {
      return NextResponse.json(
        { error: "Suggestion already saved" },
        { status: 400 }
      )
    }

    const savedSuggestion = await prisma.savedSuggestion.create({
      data: {
        userId: user.id,
        text: suggestion.text,
        translation: suggestion.translation,
        category: suggestion.category,
        context: suggestion.context
      }
    })

    return NextResponse.json(savedSuggestion)
  } catch (error) {
    console.error("Error saving suggestion:", error)
    return NextResponse.json(
      { error: "Failed to save suggestion" },
      { status: 500 }
    )
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/translations/history/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const history = await prisma.translationHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error("Error fetching history:", error)
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const { sourceText, translation } = await req.json()

    const saved = await prisma.translationHistory.create({
      data: {
        userId: user.id,
        sourceText,
        translation,
      }
    })

    return NextResponse.json(saved)
  } catch (error) {
    console.error("Error saving translation:", error)
    return NextResponse.json(
      { error: "Failed to save translation" },
      { status: 500 }
    )
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/wordbank/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const { word, translation, definition } = await req.json()

    const savedWord = await prisma.wordBank.create({
      data: {
        userId: user.id,
        word,
        translation,
        definition: definition || "",
      },
    })

    return NextResponse.json(savedWord)
  } catch (error) {
    console.error("[WORDBANK_POST]", error)
    return NextResponse.json(
      { error: "Failed to save word" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const words = await prisma.wordBank.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(words)
  } catch (error) {
    console.error("[WORDBANK_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    )
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/stt/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { promises as fsPromises, createReadStream } from 'fs'; // Import fs using ES modules
import os from 'os'; // For temporary directory

export async function POST(req: Request) {
  try {
    const { audio } = await req.json();

    if (!audio) {
      return NextResponse.json({ error: "No audio data provided" }, { status: 400 });
    }

    const audioBuffer = Buffer.from(audio, 'base64');

    // More robust temporary file handling using os.tmpdir()
    const tempFileName = `temp-${Date.now()}.webm`;
    const tempFilePath = `${os.tmpdir()}/${tempFileName}`; // Use os.tmpdir()

    await fsPromises.writeFile(tempFilePath, audioBuffer);

    const audioFileStream = createReadStream(tempFilePath); // Use createReadStream

    const transcription = await openai.audio.transcriptions.create({
      file: audioFileStream,
      model: "whisper-1",
      response_format: "text",
    });

    await fsPromises.unlink(tempFilePath); // Clean up

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error("STT error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe speech" },
      { status: 500 }
    );
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/app/api/conversation/route.ts
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

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/audio-player.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Volume2, VolumeX } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AudioPlayerProps {
  text: string
  language?: string
}

export function AudioPlayer({ text, language = 'fr-FR' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }
  
  const playAudio = async () => {
    try {
      setIsLoading(true)
      setError(false)

      // Stop any playing audio
      stopAudio()
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, languageCode: language })
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Create new audio element
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      // Set up event listeners
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      })

      audio.addEventListener('error', () => {
        setError(true)
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
        toast({
          title: "Error",
          description: "Failed to play audio",
          variant: "destructive"
        })
      })

      setIsPlaying(true)
      await audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
      setError(true)
      toast({
        title: "Error",
        description: "Failed to generate speech",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={isPlaying ? stopAudio : playAudio}
            disabled={isLoading}
            className={`h-8 w-8 p-0 ${error ? 'text-destructive' : ''}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : error ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {error ? "Failed to load audio" : isPlaying ? "Stop" : "Play"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/conversation-tab.tsx
"use client"

import { useState, useRef, useEffect , useCallback} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import dynamic from 'next/dynamic'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { 
  Mic, 
  MicOff, 
  Bot, 
  Info, 
  User, 
  Loader2, 
  Volume,
  Save,
  RefreshCcw,
  Book,
  MessageCircle,
  BookOpen,
  Check,
  BrainCircuit,
  BarChart,
  PlayCircle,
  Copy,
  Trash2,
  Plus,
  Download,
  AlertCircle
} from "lucide-react"
import { convertAudioToBase64, createAudioRecorder } from "@/lib/audio-utils"

// Dynamically import the SuggestionPanel to avoid hydration issues
const SuggestionPanel = dynamic(
  () => import('./suggestions/suggestion-panel').then(mod => mod.SuggestionPanel),
  { ssr: false }
)

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  translation?: string
  audioUrl?: string
  timestamp: Date
  mood?: 'positive' | 'neutral' | 'negative'
  correctedContent?: string
  grammarNotes?: string[]
}

interface ConversationStats {
  totalMessages: number
  correctSentences: number
  grammarMistakes: number
  vocabularyUsed: Set<string>
  timeSpent: number
  accuracy?: number
}

interface SavedConversation {
  id: string
  topic: string
  startedAt: string
  duration: number
  messages: Message[]
  stats: ConversationStats
}

export function ConversationTab() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<Date | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [currentTab, setCurrentTab] = useState('chat')
  const [autosaveError, setAutosaveError] = useState<string | null>(null)
  const [lastAutosaveAttempt, setLastAutosaveAttempt] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<ConversationStats>({
    totalMessages: 0,
    correctSentences: 0,
    grammarMistakes: 0,
    vocabularyUsed: new Set(),
    timeSpent: 0,
    accuracy: 0
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionStartRef = useRef<Date>(new Date())
  const { toast } = useToast()

  // Add autosave function
  const autoSaveMessages = useCallback(async () => {
    if (!selectedTopic || messages.length < 2 || isSaving) return

    setIsSaving(true)
    setLastAutosaveAttempt(new Date())
    setAutosaveError(null)

    try {
      const response = await fetch('/api/conversations/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          messages,
          stats: {
            ...stats,
            vocabularyUsed: Array.from(stats.vocabularyUsed)
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Autosave failed')
      }

      const data = await response.json()
      setLastSavedTimestamp(new Date(data.timestamp))
    } catch (error) {
      setAutosaveError(error instanceof Error ? error.message : 'Failed to autosave')
      console.error('Autosave error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [messages, selectedTopic, stats, isSaving])

// Add autosave effect
useEffect(() => {
  if (messages.length > 1) {
    const saveTimer = setTimeout(autoSaveMessages, 30000) // Autosave every 30 seconds
    return () => clearTimeout(saveTimer)
  }
}, [messages, autoSaveMessages])

// Add state recovery effect
useEffect(() => {
  const recoverState = async () => {
    try {
      const response = await fetch('/api/conversations/latest')
      if (!response.ok) return
      
      const data = await response.json()
      if (data && data.messages && data.messages.length > 1) {
        setMessages(data.messages)
        setStats(data.stats)
        setSelectedTopic(data.topic)
        setLastSavedTimestamp(new Date(data.updatedAt))
        
        toast({
          title: "Session recovered",
          description: "Your previous conversation has been restored",
        })
      }
    } catch (error) {
      console.error('State recovery error:', error)
    }
  }

  recoverState()
}, [])

  const conversationTopics = [
    { id: 'daily', name: 'Daily Life', icon: MessageCircle },
    { id: 'travel', name: 'Travel', icon: Book },
    { id: 'culture', name: 'Culture', icon: BookOpen },
    { id: 'business', name: 'Business', icon: BrainCircuit },
  ]

  const moodEmojis = {
    positive: '😊',
    neutral: '😐',
    negative: '😕'
  }

  // Initialize conversation and load history
  useEffect(() => {
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: "Bonjour! Je suis votre partenaire de conversation en français. Choisissez un sujet et commençons!",
        translation: "Hello! I'm your French conversation partner. Choose a topic and let's begin!",
        timestamp: new Date(),
        mood: 'positive'
      }
    ])

    loadConversationHistory()

    const timer = setInterval(() => {
      setStats(prev => ({
        ...prev,
        timeSpent: Math.floor((new Date().getTime() - sessionStartRef.current.getTime()) / 1000)
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversation history
  const loadConversationHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch('/api/conversations')
      if (!response.ok) throw new Error('Failed to fetch conversations')
      const data = await response.json()
      setSavedConversations(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive"
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Load a specific conversation
  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`)
      if (!response.ok) throw new Error('Failed to fetch conversation')
      const data = await response.json()
      
      setMessages(data.messages)
      setStats(data.stats)
      setSelectedTopic(data.topic)
      setCurrentTab('chat')
      
      toast({
        title: "Conversation loaded",
        description: "Previous conversation restored successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive"
      })
    }
  }

  // Clone a conversation
  const cloneConversation = (conv: SavedConversation) => {
    try {
      setMessages([messages[0]]) // Keep welcome message
      setSelectedTopic(conv.topic)
      setStats({
        totalMessages: 0,
        correctSentences: 0,
        grammarMistakes: 0,
        vocabularyUsed: new Set(),
        timeSpent: 0,
        accuracy: 0
      })
      sessionStartRef.current = new Date()
      setCurrentTab('chat')
      
      toast({
        title: "Conversation cloned",
        description: "Started new conversation with same topic",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clone conversation",
        variant: "destructive"
      })
    }
  }

  // Save current conversation
  const saveConversation = async () => {
    try {
      if (!selectedTopic || messages.length < 2) {
        toast({
          title: "Cannot save",
          description: "Please select a topic and have at least one exchange",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          messages,
          stats: {
            ...stats,
            vocabularyUsed: Array.from(stats.vocabularyUsed)
          }
        })
      })

      if (!response.ok) throw new Error('Failed to save conversation')

      await loadConversationHistory()
      
      toast({
        title: "Success",
        description: "Conversation saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save conversation",
        variant: "destructive"
      })
    }
  }

  // Delete a conversation
  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete conversation')

      await loadConversationHistory()
      
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      })
    }
  }

  // Export conversation
  const exportConversation = (conv?: SavedConversation) => {
    try {
      const conversationData = conv || {
        topic: selectedTopic,
        messages,
        stats: {
          ...stats,
          vocabularyUsed: Array.from(stats.vocabularyUsed)
        }
      }

      const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
        type: 'application/json'
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `conversation-${new Date().toISOString()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Conversation exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export conversation",
        variant: "destructive"
      })
    }
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format date display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const startRecording = async () => {
    try {
      const mediaRecorder = await createAudioRecorder()
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        })
        const base64Audio = await convertAudioToBase64(audioBlob)
        await processAudioInput(base64Audio)
      }

      mediaRecorder.start(100)
      setIsRecording(true)


    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive"
      })
    }
  }

  const handleLoadConversation = async (id: string) => {
    try {
      setIsLoading(true)
      const { messages, stats, topic } = await loadConversation(id)
      
      setMessages(messages)
      setStats(stats)
      setSelectedTopic(topic)
      setCurrentTab('chat')
      
      toast({
        title: "Success",
        description: "Conversation loaded successfully",
      })
    } catch (error) {
      // Error is already handled by the helper
    } finally {
      setIsLoading(false)
    }
  }
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())

    }
  }
  // Process recorded audio
  const processAudioInput = async (base64Audio: string) => {
    if (!selectedTopic) {
      toast({
        title: "No topic selected",
        description: "Please select a conversation topic first.",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      // Speech to text
      const sttResponse = await fetch('/api/stt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio })
      })

      if (!sttResponse.ok) throw new Error('Speech to text failed')
      const { text } = await sttResponse.json()

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])

      // Update stats
      const words = text.toLowerCase().split(/\s+/)
      setStats(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        vocabularyUsed: new Set([...prev.vocabularyUsed, ...words])
      }))

      // Get AI response
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          topic: selectedTopic,
          language: 'fr'
        })
      })

      if (!chatResponse.ok) throw new Error('Chat response failed')
      const { 
        response, 
        translation, 
        corrections, 
        grammarNotes,
        mood 
      } = await chatResponse.json()

      // Text to speech
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: response,
          languageCode: 'fr-FR'
        })
      })

      if (!ttsResponse.ok) throw new Error('Text to speech failed')
      const audioBlob = await ttsResponse.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        translation,
        audioUrl,
        timestamp: new Date(),
        mood,
        correctedContent: corrections,
        grammarNotes
      }
      setMessages(prev => [...prev, assistantMessage])

      // Update stats
      setStats(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        correctSentences: prev.correctSentences + (corrections ? 0 : 1),
        grammarMistakes: prev.grammarMistakes + (grammarNotes?.length || 0),
        accuracy: (prev.correctSentences / prev.totalMessages) * 100
      }))

      // Auto-play response
      const audio = new Audio(audioUrl)
      await audio.play()

    } catch (error) {
      console.error('Error processing audio:', error)
      toast({
        title: "Error",
        description: "Failed to process audio. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Play audio from text
  const playAudioFromText = async (text: string) => { 
    try {
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          languageCode: 'fr-FR'
        })
      })

      if (!ttsResponse.ok) throw new Error('Text to speech failed')
      const audioBlob = await ttsResponse.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      const audio = new Audio(audioUrl)
      await audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
      toast({
        title: "Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive"
      })
    }
  }

  const formatTimeAgo = (date: Date) => {
    const diff = new Date().getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return `${seconds}s ago`
  }
  
  return (
    <div className="flex flex-col h-[800px]">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Library
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Progress
          </TabsTrigger>

          
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat">
          {/* Topic Selection */}
          <div className="flex gap-2 mb-4">

            {conversationTopics.map(topic => (
              <TooltipProvider key={topic.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedTopic === topic.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTopic(topic.id)}
                    >
                      <topic.icon className="h-4 w-4 mr-2" />
                      {topic.name}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Start a conversation about {topic.name.toLowerCase()}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Stats Panel */}
          <Card className="mb-4">
            <CardContent className="py-4">
              <div className="grid grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{stats.totalMessages}</div>
                  <div className="text-xs text-muted-foreground">Messages</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.vocabularyUsed.size}</div>
                  <div className="text-xs text-muted-foreground">Unique Words</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stats.accuracy ? Math.round(stats.accuracy) : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.grammarMistakes}</div>
                  <div className="text-xs text-muted-foreground">Mistakes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatTime(stats.timeSpent)}</div>
                  <div className="text-xs text-muted-foreground">Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages Container */}
          <Card className="flex-1 mb-4 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>French Conversation</CardTitle>
                <CardDescription>
                  {selectedTopic 
                    ? `Topic: ${conversationTopics.find(t => t.id === selectedTopic)?.name}`
                    : "Select a topic to begin"}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={saveConversation}
                        disabled={!selectedTopic || messages.length < 2}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save conversation</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportConversation()}
                        disabled={!selectedTopic || messages.length < 2}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export as JSON</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {message.role === 'assistant' ? (
                          <Bot className="h-8 w-8 text-primary" />
                        ) : (
                          <User className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div
                        className={`flex flex-col space-y-2 max-w-[80%] ${
                          message.role === 'assistant' ? 'items-start' : 'items-end'
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg ${
                            message.role === 'assistant'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">{message.content}</p>
                            {message.mood && (
                              <span className="text-sm">{moodEmojis[message.mood]}</span>
                            )}
                          </div>
                          {message.translation && (
                            <p className="text-xs mt-1 opacity-80">
                              {message.translation}
                            </p>
                          )}
                          {message.correctedContent && (
                            <div className="mt-2 p-2 bg-background/10 rounded text-xs">
                              <p className="font-medium">Correction:</p>
                              <p>{message.correctedContent}</p>
                              {message.grammarNotes && message.grammarNotes.length > 0 && (
                                <div className="mt-1">
                                  <p className="font-medium">Grammar Notes:</p>
                                  <ul className="list-disc list-inside">
                                    {message.grammarNotes.map((note, index) => (
                                      <li key={index}>{note}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {message.audioUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => new Audio(message.audioUrl).play()}
                            >
                              <Volume className="h-4 w-4" />
                              Replay
                            </Button>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <div className="grid grid-cols-3 gap-4">

    </div>
    <div className="col-span-1">
      <SuggestionPanel
        lastMessage={messages[messages.length - 1]?.content || ""}
        onSelectSuggestion={(text) => {
          // Start recording with this text
          // Or you could add it directly to the conversation
          navigator.clipboard.writeText(text)
          toast({
            title: "Suggestion copied",
            description: "The text has been copied to your clipboard"
          })
        }}
        onPlayAudio={(text) => {
          // Play audio of the suggestion
          playAudioFromText(text)
        }}
      />

  </div>
          </Card>

          {/* Recording Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Progress 
                    value={isRecording ? 100 : 0} 
                    className={`h-2 ${isRecording ? 'animate-pulse' : ''}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isRecording ? "destructive" : "default"}
                    size="lg"
                    className="w-40 gap-2"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing || !selectedTopic}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isRecording ? (
                      <>
                        <MicOff className="h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    onClick={() => {
                      setMessages([messages[0]])
                      setStats({
                        totalMessages: 0,
                        correctSentences: 0,
                        grammarMistakes: 0,
                        vocabularyUsed: new Set(),
                        timeSpent: 0,
                        accuracy: 0
                      })
                      sessionStartRef.current = new Date()
                    }}
                    disabled={isRecording || isProcessing || messages.length < 2}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
                <div className="flex items-center justify-between px-4 py-2 text-sm">
    <div className="flex items-center gap-2">
      {isSaving ? (
        <div className="flex items-center text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin mr-2" />
          Saving...
        </div>
      ) : autosaveError ? (
        <div className="flex items-center text-destructive">
          <AlertCircle className="h-3 w-3 mr-2" />
          {autosaveError}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={autoSaveMessages}
          >
            Retry
          </Button>
        </div>
      ) : lastSavedTimestamp ? (
        <div className="flex items-center text-muted-foreground">
          <Check className="h-3 w-3 mr-2 text-green-500" />
          {`Saved ${formatTimeAgo(lastSavedTimestamp)}`}
        </div>
      ) : null}
    </div>
    {lastAutosaveAttempt && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-3 w-3 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Last autosave attempt: {formatTimeAgo(lastAutosaveAttempt)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Conversations</h2>
              <Button onClick={loadConversationHistory}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {isLoadingHistory ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="opacity-50">
                    <CardHeader>
                      <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {savedConversations.map((conv) => (
                  <Card key={conv.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {conversationTopics.find(t => t.id === conv.topic)?.name}
                          </CardTitle>
                          <CardDescription>
                            {formatDate(conv.startedAt)}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {conv.messages.length} messages
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Last message:
                        </div>
                        <div className="text-sm italic">
                          "{conv.messages[conv.messages.length - 1].content}"
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                        <div>
                          <div className="font-bold">
                            {conv.stats.vocabularyUsed.size}
                          </div>
                          <div className="text-muted-foreground">Words</div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {conv.stats.accuracy}%
                          </div>
                          <div className="text-muted-foreground">Accuracy</div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {Math.floor(conv.duration / 60)}m
                          </div>
                          <div className="text-muted-foreground">Duration</div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleLoadConversation(conv.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Continue
                                </>
                              )}
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>Continue this conversation</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => cloneConversation(conv)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Clone
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Start new with same topic</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => exportConversation(conv)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export conversation</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteConversation(conv.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete conversation</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoadingHistory && savedConversations.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                  <Book className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No saved conversations
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your saved conversations will appear here
                </p>
                <Button onClick={() => setCurrentTab('chat')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start a conversation
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>
                  Your French learning journey statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Add progress visualization here */}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/history.tsx
"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AudioPlayer } from "./audio-player"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

interface TranslationHistory {
  id: string
  sourceText: string
  translation: string
  createdAt: string
}

export function History() {
  const [history, setHistory] = useState<TranslationHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/translations/history")
        if (!response.ok) throw new Error("Failed to fetch history")
        const data = await response.json()
        setHistory(data)
      } catch (error) {
        console.error("Error fetching history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No translation history yet
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {history.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium">Original Text</div>
              <AudioPlayer text={item.sourceText} language="fr-FR" />
            </div>
            <p className="whitespace-pre-wrap">{item.sourceText}</p>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium">Translation</div>
              <AudioPlayer text={item.translation} language="en-US" />
            </div>
            <p className="whitespace-pre-wrap">{item.translation}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/translate-container.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, RotateCw, Wand2 } from "lucide-react"
import { TranslatedText } from "./translation/translated-text"
import { TextSelection } from "./translation/text-selection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export function TranslateContainer() {
  const [text, setText] = useState("")
  const [selectedText, setSelectedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedData, setTranslatedData] = useState<{
    sourceText: string;
    translation: string;
  } | null>(null)
  const { toast } = useToast()

  const handleTextSelect = () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setSelectedText(selection.toString().trim())
    }
  }

  const handleTranslate = async () => {
    if (!text.trim()) return
    
    setIsTranslating(true)
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      
      if (!response.ok) throw new Error("Translation failed")
      
      const data = await response.json()
      const translationData = {
        sourceText: text,
        translation: data.translation
      }
      setTranslatedData(translationData)

      // Save to history
      await fetch("/api/translations/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(translationData),
      })
    } catch (error) {
      console.error("Translation error:", error)
      toast({
        title: "Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsTranslating(false)
    }
  }

  const handleGenerated = (sentences: string[]) => {
    if (sentences.length) {
      const newText = text + "\n\n" + sentences.join("\n")
      setText(newText)
      handleTranslate()
    }
  }

  const handleClear = () => {
    setText("")
    setSelectedText("")
    setTranslatedData(null)
  }

  return (
    <Tabs defaultValue="translate" className="space-y-6">
      <TabsContent value="translate" className="space-y-4">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-4 space-y-4">
              <Textarea
                placeholder="Enter French text here..."
                className="min-h-[300px] text-lg leading-relaxed"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onMouseUp={handleTextSelect}
              />
              <div className="flex flex-wrap gap-2">
                <TextSelection 
                  selectedText={selectedText}
                  onGenerated={handleGenerated}
                />
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={!text.trim() || isTranslating}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={handleTranslate}
                  disabled={!text.trim() || isTranslating}
                  className="ml-auto"
                >
                  {isTranslating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isTranslating ? "Translating..." : "Translate"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              {translatedData ? (
                <TranslatedText
                  sourceText={translatedData.sourceText}
                  translation={translatedData.translation}
                />
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  Translation will appear here
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/word-bank-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Book } from "lucide-react"

interface WordBankEntry {
  id: string
  word: string
  translation: string
  definition: string
  createdAt: string
}

export function WordBankDialog() {
  const [words, setWords] = useState<WordBankEntry[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchWords()
    }
  }, [isOpen])

  const fetchWords = async () => {
    try {
      const response = await fetch("/api/wordbank")
      if (!response.ok) throw new Error("Failed to fetch words")
      const data = await response.json()
      setWords(data)
    } catch (error) {
      console.error("Error fetching words:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Book className="mr-2 h-4 w-4" />
          Word Bank
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Word Bank</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {words.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div>
                <h4 className="font-medium">{entry.word}</h4>
                <p className="text-sm text-muted-foreground">
                  {entry.translation}
                </p>
                <p className="text-sm mt-1">{entry.definition}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(entry.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {words.length === 0 && (
            <div className="text-center text-muted-foreground p-8">
              No saved words yet
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/saved/save-to-wordbank.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Save, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

interface SaveToWordBankProps {
  word: string
  translation: string
  definition?: string
}

export function SaveToWordBank({ word, translation, definition = "" }: SaveToWordBankProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [customDefinition, setCustomDefinition] = useState(definition)

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/wordbank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word,
          translation,
          definition: customDefinition,
        }),
      })

      if (!response.ok) throw new Error("Failed to save word")

      toast({
        title: "Word saved",
        description: `"${word}" has been added to your word bank.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save word to word bank.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Save to Word Bank
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to Word Bank</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Word</Label>
            <div className="p-2 border rounded-md bg-muted">{word}</div>
          </div>
          <div className="space-y-2">
            <Label>Translation</Label>
            <div className="p-2 border rounded-md bg-muted">{translation}</div>
          </div>
          <div className="space-y-2">
            <Label>Definition (optional)</Label>
            <Textarea
              value={customDefinition}
              onChange={(e) => setCustomDefinition(e.target.value)}
              placeholder="Add a custom definition..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/saved/saved-suggestions.tsx
// src/components/translate/saved-suggestions.tsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AudioPlayer } from "../audio-player"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { SaveIcon, Star, Trash2, BookOpen } from "lucide-react"

interface SavedSuggestion {
  id: string
  text: string
  translation: string
  category: string
  isFavorite: boolean
  createdAt: string
}

export function SavedSuggestions() {
  const [suggestions, setSuggestions] = useState<SavedSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadSavedSuggestions()
  }, [])

  const loadSavedSuggestions = async () => {
    try {
      const response = await fetch("/api/suggestions/saved")
      if (!response.ok) throw new Error("Failed to load saved suggestions")
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load saved suggestions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (id: string) => {
    try {
      const response = await fetch(`/api/suggestions/saved/${id}/favorite`, {
        method: "POST"
      })
      if (!response.ok) throw new Error("Failed to update favorite status")
      
      setSuggestions(prev =>
        prev.map(s =>
          s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
        )
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive"
      })
    }
  }

  const deleteSuggestion = async (id: string) => {
    try {
      const response = await fetch(`/api/suggestions/saved/${id}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("Failed to delete suggestion")
      
      setSuggestions(prev => prev.filter(s => s.id !== id))
      toast({
        title: "Success",
        description: "Suggestion deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete suggestion",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-20 w-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Saved Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">
                          {suggestion.category}
                        </Badge>
                        {suggestion.isFavorite && (
                          <Badge variant="default">
                            Favorite
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium mb-1">{suggestion.text}</p>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.translation}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AudioPlayer text={suggestion.text} language="fr-FR" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(suggestion.id)}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            suggestion.isFavorite ? "fill-yellow-400" : ""
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSuggestion(suggestion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-8">
              No saved suggestions yet
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/saved/saved-translations.tsx
"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AudioPlayer } from "../audio-player"
import { Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface SavedWord {
  id: string
  word: string
  translation: string
  definition: string
}

export function SavedTranslations() {
  const [savedWords, setSavedWords] = useState<SavedWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSavedWords()
  }, [])

  const fetchSavedWords = async () => {
    try {
      const response = await fetch("/api/wordbank")
      if (!response.ok) throw new Error("Failed to fetch saved words")
      const data = await response.json()
      setSavedWords(data)
    } catch (error) {
      console.error("Error fetching saved words:", error)
      toast({
        title: "Error",
        description: "Failed to load saved words",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/wordbank/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete word")
      
      setSavedWords(prev => prev.filter(word => word.id !== id))
      toast({
        title: "Success",
        description: "Word deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting word:", error)
      toast({
        title: "Error",
        description: "Failed to delete word",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[200px]" />
        ))}
      </div>
    )
  }

  if (savedWords.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No saved words yet. Select text while translating to save words.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {savedWords.map((word) => (
        <Card key={word.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">
              {word.word}
            </CardTitle>
            <div className="flex items-center gap-2">
              <AudioPlayer text={word.word} language="fr-FR" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(word.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Translation</span>
                  <AudioPlayer text={word.translation} language="en-US" />
                </div>
                <p className="text-sm mt-1">{word.translation}</p>
              </div>
              {word.definition && (
                <div>
                  <span className="text-sm font-medium">Definition</span>
                  <p className="text-sm mt-1">{word.definition}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/translation/text-selection.tsx
"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioPlayer } from "../audio-player"
import { SaveToWordBank } from "../saved/save-to-wordbank"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Loader2, Wand2, Save, Copy, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface GeneratedSentence {
  original: string
  generated: string[]
  translations: string[]
}

export function TextSelection({ 
  selectedText,
  onGenerated
}: { 
  selectedText: string
  onGenerated: (sentences: string[]) => void 
}) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSentences, setGeneratedSentences] = useState<GeneratedSentence[]>([])
  const [currentDepth, setCurrentDepth] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to your clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard",
        variant: "destructive"
      })
    }
  }

  const generateSimilar = useCallback(async (text: string) => {
    if (currentDepth >= 2) {
      toast({
        title: "Maximum depth reached",
        description: "You've reached the maximum generation depth (2 levels).",
      })
      return
    }

    setIsGenerating(true)
    try {
      // Generate similar sentences
      const genResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          depth: currentDepth,
          maxDepth: 2
        }),
      })

      if (!genResponse.ok) {
        const error = await genResponse.json()
        throw new Error(error.message || "Generation failed")
      }

      const { sentences } = await genResponse.json()

      // Translate generated sentences
      const transResponse = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sentences.join('\n') }),
      })

      if (!transResponse.ok) {
        const error = await transResponse.json()
        throw new Error(error.message || "Translation failed")
      }

      const transData = await transResponse.json()
      
      const newGeneration = {
        original: text,
        generated: sentences,
        translations: transData.translation.split('\n')
      }

      setGeneratedSentences(prev => [...prev, newGeneration])
      onGenerated(sentences)
      setCurrentDepth(prev => prev + 1)

      // Save to history
      await fetch("/api/translations/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText: sentences.join('\n'),
          translation: transData.translation
        }),
      })

      toast({
        title: "Generated successfully",
        description: `Generated ${sentences.length} similar sentences`,
      })
    } catch (error) {
      console.error("Generation error:", error)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate similar sentences",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }, [currentDepth, onGenerated, toast])

  const handleDialogClose = () => {
    if (!isGenerating) {
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!selectedText}
          className={cn(
            "relative transition-all duration-200",
            selectedText && "shadow-md hover:shadow-lg"
          )}
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Similar
          {selectedText && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-semibold">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            Similar Sentence Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selected Text Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Selected Text</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <p className="text-lg font-medium">{selectedText}</p>
                <div className="flex items-center gap-2">
                  <AudioPlayer text={selectedText} language="fr-FR" />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedText)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy to clipboard</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Sentences */}
          {generatedSentences.map((item, index) => (
            <Card key={index} className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Generation {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.generated.map((sentence, sIndex) => (
                  <div key={sIndex} className="space-y-2">
                    {/* French Sentence */}
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-lg">{sentence}</p>
                        <div className="flex items-center gap-2">
                          <AudioPlayer text={sentence} language="fr-FR" />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(sentence)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy to clipboard</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {currentDepth < 2 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => generateSimilar(sentence)}
                                    disabled={isGenerating}
                                  >
                                    <Wand2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Generate more similar sentences</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* English Translation */}
                    <div className="p-4 border rounded-lg bg-background">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-lg">{item.translations[sIndex]}</p>
                        <div className="flex items-center gap-2">
                          <AudioPlayer 
                            text={item.translations[sIndex]} 
                            language="en-US" 
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(item.translations[sIndex])}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy to clipboard</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>

                    {/* Save to Word Bank */}
                    <div className="flex justify-between items-center px-4">
                      <SaveToWordBank
                        word={sentence}
                        translation={item.translations[sIndex]}
                      />
                      <span className="text-sm text-muted-foreground">
                        {currentDepth < 2 ? `${2 - currentDepth} generations remaining` : 'Max depth reached'}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Loading State */}
          {isGenerating && (
            <div className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Generating similar sentences...
                </p>
              </div>
            </div>
          )}

          {/* Initial Generate Button */}
          {!generatedSentences.length && !isGenerating && (
            <Button
              onClick={() => generateSimilar(selectedText)}
              disabled={!selectedText}
              className="w-full"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Similar Sentences
            </Button>
          )}
        </div>

        {/* Dialog Actions */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            {currentDepth}/2 generation depths used
          </span>
          <DialogClose asChild>
            <Button 
              variant="outline" 
              onClick={handleDialogClose}
              disabled={isGenerating}
            >
              Done
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/translation/translated-text.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AudioPlayer } from "../audio-player"
import { SaveToWordBank } from "../saved/save-to-wordbank"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface TranslatedTextProps {
  sourceText: string
  translation: string
}

export function TranslatedText({ sourceText, translation }: TranslatedTextProps) {
  const [selectedText, setSelectedText] = useState("")
  const [selectedTranslation, setSelectedTranslation] = useState("")
  const { toast } = useToast()

  const handleTextSelection = async () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim()
      setSelectedText(selectedText)

      // Translate the selected text
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: selectedText }),
        })

        if (!response.ok) throw new Error("Translation failed")
        
        const data = await response.json()
        setSelectedTranslation(data.translation)
      } catch (error) {
        toast({
          title: "Translation Error",
          description: "Failed to translate selected text",
          variant: "destructive",
        })
      }
    }
  }

  // Clear selection when source text changes
  useEffect(() => {
    setSelectedText("")
    setSelectedTranslation("")
  }, [sourceText])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Original Text</CardTitle>
          <AudioPlayer text={sourceText} language="fr-FR" />
        </CardHeader>
        <CardContent>
          <div 
            className="text-lg leading-relaxed whitespace-pre-wrap"
            onMouseUp={handleTextSelection}
          >
            {sourceText}
          </div>
          {selectedText && selectedTranslation && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Selected Text:</span>
                <AudioPlayer text={selectedText} language="fr-FR" />
              </div>
              <p className="text-base">{selectedText}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Translation:</span>
                <AudioPlayer text={selectedTranslation} language="en-US" />
              </div>
              <p className="text-base">{selectedTranslation}</p>
              <div className="flex justify-end mt-2">
                <SaveToWordBank
                  word={selectedText}
                  translation={selectedTranslation}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Translation</CardTitle>
          <AudioPlayer text={translation} language="en-US" />
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{translation}</p>
        </CardContent>
      </Card>
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/situations/situation-generator.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Wand2, Plus } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "@/components/ui/use-toast"

const situationFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  categories: z.string(),
  context: z.string().min(20, "Context must be at least 20 characters"),
})

interface SituationGeneratorProps {
  onSituationGenerated: (situation: any) => void
}

export function SituationGenerator({ onSituationGenerated }: SituationGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const form = useForm<z.infer<typeof situationFormSchema>>({
    resolver: zodResolver(situationFormSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "beginner",
      categories: "",
      context: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof situationFormSchema>) => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/situations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Failed to generate situation")
      
      const situation = await response.json()
      onSituationGenerated(situation)
      setIsOpen(false)
      
      toast({
        title: "Situation created",
        description: "Your custom situation has been generated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate situation",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Custom Situation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Custom Situation</DialogTitle>
          <DialogDescription>
            Describe your desired situation and let AI generate a complete practice scenario
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., At the Train Station" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the situation..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., travel, transport"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate multiple categories with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Context</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe any specific details or requirements for this situation..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate Situation
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/situations/situations-tab.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Coffee, 
  Plane, 
  ShoppingBag, 
  UtensilsCrossed,
  Phone,
  Hotel,
  Train,
  Map,
  Users,
  Wand2,
  Loader2,
  PlayCircle,
  Volume2,
  Lightbulb,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {SituationGenerator} from "./situation-generator"

interface Situation {
  id: string
  title: string
  description: string
  icon: any
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  categories: string[]
}

interface Phrase {
  french: string
  english: string
  context: string
  formalLevel: 'formal' | 'informal' | 'both'
}

interface ScenarioStep {
  role: 'system' | 'user' | 'assistant'
  content: string
  translation?: string
  suggestions?: string[]
}

const SITUATIONS: Situation[] = [
  {
    id: 'cafe',
    title: 'At the Café',
    description: 'Order drinks and food at a French café',
    icon: Coffee,
    difficulty: 'beginner',
    categories: ['dining', 'daily life']
  },
  {
    id: 'shopping',
    title: 'Shopping',
    description: 'Navigate stores and make purchases',
    icon: ShoppingBag,
    difficulty: 'beginner',
    categories: ['retail', 'daily life']
  },
  {
    id: 'restaurant',
    title: 'Restaurant Dining',
    description: 'Fine dining and restaurant etiquette',
    icon: UtensilsCrossed,
    difficulty: 'intermediate',
    categories: ['dining', 'formal']
  },
  {
    id: 'hotel',
    title: 'Hotel Check-in',
    description: 'Book a room and handle hotel services',
    icon: Hotel,
    difficulty: 'intermediate',
    categories: ['travel', 'accommodation']
  },
  {
    id: 'transport',
    title: 'Public Transport',
    description: 'Navigate trains, buses, and tickets',
    icon: Train,
    difficulty: 'beginner',
    categories: ['travel', 'daily life']
  },
  {
    id: 'business',
    title: 'Business Meeting',
    description: 'Professional interactions and etiquette',
    icon: Building2,
    difficulty: 'advanced',
    categories: ['business', 'formal']
  },
]

export function SituationsTab() {
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null)
  const [scenario, setScenario] = useState<ScenarioStep[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [commonPhrases, setCommonPhrases] = useState<Phrase[]>([])
  const [customSituations, setCustomSituations] = useState<Situation[]>([])

  const handleSituationGenerated = (situation: any) => {
    const newSituation = {
      id: Date.now().toString(),
      title: situation.situation.title,
      description: situation.situation.description,
      icon: Wand2,
      difficulty: situation.situation.difficulty,
      categories: situation.situation.categories,
      isCustom: true,
      content: situation.situation
    }
    
    setCustomSituations(prev => [...prev, newSituation])
  }

  const loadScenario = async (situation: Situation) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/situations/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situationId: situation.id })
      })

      if (!response.ok) throw new Error('Failed to load scenario')
      const data = await response.json()
      
      setScenario(data.scenario)
      setCommonPhrases(data.phrases)
      setSelectedSituation(situation)
    } catch (error) {
      console.error('Error loading scenario:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-yellow-500'
      case 'advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
  
        <Button variant="outline">
          <Lightbulb className="h-4 w-4 mr-2" />
          Tips & Tricks
        </Button>
      </div>

      {/* Situations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SITUATIONS.map((situation) => (
          <Card 
            key={situation.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => loadScenario(situation)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <situation.icon className="h-5 w-5 text-primary" />
                  <CardTitle>{situation.title}</CardTitle>
                </div>
                <Badge className={getDifficultyColor(situation.difficulty)}>
                  {situation.difficulty}
                </Badge>
              </div>
              <CardDescription>{situation.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {situation.categories.map((category) => (
                  <Badge key={category} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scenario Dialog */}
      {selectedSituation && (
        <Dialog open={!!selectedSituation} onOpenChange={() => setSelectedSituation(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <selectedSituation.icon className="h-5 w-5 text-primary" />
                <DialogTitle>{selectedSituation.title}</DialogTitle>
              </div>
              <DialogDescription>
                Practice this scenario with common phrases and cultural tips
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-4">
              {/* Scenario */}
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Scenario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {scenario.map((step, index) => (
                            <div
                              key={index}
                              className={`flex items-start gap-3 ${
                                step.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                              }`}
                            >
                              <div
                                className={`p-3 rounded-lg ${
                                  step.role === 'assistant'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="font-medium">{step.content}</p>
                                {step.translation && (
                                  <p className="text-sm mt-1 opacity-80">
                                    {step.translation}
                                  </p>
                                )}
                                {step.suggestions && (
                                  <div className="mt-2 space-x-2">
                                    {step.suggestions.map((suggestion, i) => (
                                      <Button
                                        key={i}
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                          // Handle suggestion selection
                                        }}
                                      >
                                        {suggestion}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Common Phrases */}
              <div className="col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Common Phrases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {commonPhrases.map((phrase, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg border hover:bg-muted transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{phrase.french}</p>
                                <p className="text-sm text-muted-foreground">
                                  {phrase.english}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {phrase.context}
                                </p>
                              </div>
                              <Badge variant="outline">{phrase.formalLevel}</Badge>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button variant="ghost" size="sm">
                                <Volume2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/suggestions/saved-panel.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Star, Trash2, SaveIcon } from "lucide-react"

interface SavedSuggestion {
  id: string
  text: string
  translation: string
  category: string
  isFavorite: boolean
}

export function SavedSuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<SavedSuggestion[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadSavedSuggestions()
  }, [])

  const loadSavedSuggestions = async () => {
    try {
      const response = await fetch("/api/suggestions/saved")
      if (!response.ok) throw new Error("Failed to load saved suggestions")
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load saved suggestions",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="p-4">
      <ScrollArea className="h-[300px]">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="p-4 border rounded-lg mb-2">
            <div className="flex items-center justify-between">
              <div>
                <Badge>{suggestion.category}</Badge>
                <p className="font-medium mt-2">{suggestion.text}</p>
                <p className="text-sm text-muted-foreground">{suggestion.translation}</p>
              </div>
              <Button variant="ghost" size="sm">
                {suggestion.isFavorite ? (
                  <Star className="h-4 w-4 fill-yellow-400" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
    </Card>
  )
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/suggestions/suggestion-panel-with-save.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Lightbulb, Volume2, Loader2, SaveIcon, Star } from "lucide-react"

interface Suggestion {
  id: string
  text: string
  translation: string
  category: 'response' | 'question' | 'clarification'
  isSaved?: boolean
  isFavorite?: boolean
}

interface SuggestionPanelProps {
  lastMessage: string
  onSelectSuggestion: (suggestion: string) => void
  onPlayAudio: (text: string) => void
}

export function SuggestionPanelWithSave({
  lastMessage,
  onSelectSuggestion,
  onPlayAudio
}: SuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedSuggestionId, setHighlightedSuggestionId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (lastMessage) {
      loadSuggestions()
    }
  }, [lastMessage])

  const loadSuggestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastMessage })
      })

      if (!response.ok) throw new Error('Failed to load suggestions')
      const data = await response.json()
      setSuggestions(data.suggestions)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load suggestions",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSuggestion = async (suggestion: Suggestion) => {
    try {
      const response = await fetch('/api/suggestions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion)
      })

      if (!response.ok) throw new Error('Failed to save suggestion')

      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestion.id ? { ...s, isSaved: true } : s
        )
      )

      toast({
        title: "Success",
        description: "Suggestion saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save suggestion",
        variant: "destructive"
      })
    }
  }

  const toggleFavorite = async (suggestion: Suggestion) => {
    try {
      const response = await fetch(`/api/suggestions/${suggestion.id}/favorite`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to update favorite status')

      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestion.id ? { ...s, isFavorite: !s.isFavorite } : s
        )
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <h3 className="font-medium">Response Suggestions</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSuggestions}
          disabled={isLoading || !lastMessage}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`p-4 rounded-lg mb-2 transition-colors ${
              highlightedSuggestionId === suggestion.id
                ? "bg-accent"
                : "hover:bg-accent/50"
            }`}
            onMouseEnter={() => setHighlightedSuggestionId(suggestion.id)}
            onMouseLeave={() => setHighlightedSuggestionId(null)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">
                    {suggestion.category}
                  </Badge>
                  {suggestion.isSaved && (
                    <Badge variant="outline">Saved</Badge>
                  )}
                </div>
                <button
                  onClick={() => onSelectSuggestion(suggestion.text)}
                  className="text-left w-full"
                >
                  <p className="font-medium mb-1">{suggestion.text}</p>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.translation}
                  </p>
                </button>
              </div>
              <div className="flex items-start gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPlayAudio(suggestion.text)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => saveSuggestion(suggestion)}
                  disabled={suggestion.isSaved}
                >
                  <SaveIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(suggestion)}
                >
                  <Star
                    className={`h-4 w-4 ${
                      suggestion.isFavorite ? "fill-yellow-400" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </Card>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/components/translate/suggestions/suggestion-panel.tsx
"use client"

// Add missing imports for shadcn/ui components
// Import components
import { useState, useEffect } from "react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Lightbulb,
  Volume2,
  Loader2,
  RefreshCcw,
  MessageSquare,
  HelpCircle,
  Info
} from "lucide-react"

// First, make sure these components exist and are working
interface Suggestion {
  text: string
  translation: string
  category: 'response' | 'question' | 'clarification'
}

interface SuggestionPanelProps {
  lastMessage: string
  onSelectSuggestion: (suggestion: string) => void
  onPlayAudio: (text: string) => void
}

// Create these as React components
const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'response':
      return <MessageSquare className="h-3 w-3 mr-1" />
    case 'question':
      return <HelpCircle className="h-3 w-3 mr-1" />
    case 'clarification':
      return <Info className="h-3 w-3 mr-1" />
    default:
      return null
  }
}

export function SuggestionPanel({ 
  lastMessage, 
  onSelectSuggestion,
  onPlayAudio 
}: SuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const loadSuggestions = async () => {
    if (!lastMessage) {
      toast({
        title: "No message",
        description: "Wait for a message to get suggestions",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lastMessage,
          count: 5 
        })
      })

      if (!response.ok) throw new Error('Failed to load suggestions')
      const data = await response.json()

      if (!data.suggestions || !Array.isArray(data.suggestions)) {
        throw new Error('Invalid suggestions format')
      }

      setSuggestions(data.suggestions)
    } catch (error) {
      console.error('Error loading suggestions:', error)
      toast({
        title: "Error",
        description: "Failed to load suggestions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load suggestions when last message changes
  useEffect(() => {
    if (lastMessage) {
      loadSuggestions()
    }
  }, [lastMessage])

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <h3 className="font-medium">Response Suggestions</h3>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSuggestions}
                  disabled={isLoading || !lastMessage}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Get new suggestions
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 border rounded-lg animate-pulse"
                >
                  <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="group p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          <CategoryIcon category={suggestion.category} />
                          {suggestion.category}
                        </Badge>
                      </div>
                      <button
                        onClick={() => onSelectSuggestion(suggestion.text)}
                        className="text-left w-full"
                      >
                        <p className="font-medium mb-1">{suggestion.text}</p>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.translation}
                        </p>
                      </button>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onPlayAudio(suggestion.text)}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Listen to pronunciation
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Lightbulb className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {lastMessage 
                  ? "Click refresh to get suggestions"
                  : "Suggestions will appear here"}
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/audio-converter.ts
export async function convertToWav(audioBlob: Blob): Promise<Blob> {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Create buffer source
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Create WAV buffer
    const wavBuffer = audioBufferToWav(audioBuffer)
    
    // Convert to blob
    return new Blob([wavBuffer], { type: 'audio/wav' })
  } catch (error) {
    console.error('Error converting audio:', error)
    throw error
  }
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample

  const dataLength = buffer.length * blockAlign
  const bufferLength = 44 + dataLength

  const arrayBuffer = new ArrayBuffer(bufferLength)
  const view = new DataView(arrayBuffer)

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')

  // Format chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)

  // Data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  // Write audio data
  const channels = []
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }

  let offset = 44
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }
  }

  return arrayBuffer
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/audio-utils.ts
export const convertAudioToBase64 = async (audioBlob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      const base64Data = base64Audio.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
};

export const createAudioRecorder = async (): Promise<MediaRecorder> => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      sampleRate: 48000,
    }
  });

  return new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
  });
};

// Utility for handling audio playback
export const playAudio = async (audioBuffer: ArrayBuffer): Promise<void> => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioSource = audioContext.createBufferSource();
  
  const buffer = await audioContext.decodeAudioData(audioBuffer);
  audioSource.buffer = buffer;
  audioSource.connect(audioContext.destination);
  
  return new Promise((resolve) => {
    audioSource.onended = () => {
      audioContext.close();
      resolve();
    };
    audioSource.start(0);
  });
};
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/contacts.ts
import { prisma } from "./db/prisma";
import { Contact, ContactStats } from "@/types/contacts";

export async function getContacts(): Promise<Contact[]> {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return contacts as Contact[]; // Add type assertion to fix the type error
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
}

export async function getContactById(id: string): Promise<Contact | null> {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });
    return contact as Contact | null; // Add type assertion to fix the type error
  } catch (error) {
    console.error("Error fetching contact:", error);
    return null;
  }
}

export async function getContactStats(): Promise<ContactStats> {
  try {
    // Get total contacts
    const totalContacts = await prisma.contact.count();

    // Get contacts created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await prisma.contact.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get contacts created last month for comparison
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    const endOfLastMonth = new Date(startOfMonth);
    endOfLastMonth.setMilliseconds(-1);

    const lastMonthContacts = await prisma.contact.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth,
        },
      },
    });

    // Calculate percentage change
    const percentageChange = lastMonthContacts === 0
      ? newThisMonth === 0 ? "0.0" : "100.0"
      : ((newThisMonth - lastMonthContacts) / lastMonthContacts * 100).toFixed(1);

    // Get contacts by status
    const statusCounts = await prisma.contact.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    // Convert status counts to record
    const byStatus = statusCounts.reduce((acc, curr) => {
      acc[curr.status as keyof typeof acc] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalContacts,
      newThisMonth,
      percentageChange,
      byStatus,
    };
  } catch (error) {
    console.error("Error fetching contact stats:", error);
    return {
      total: 0,
      newThisMonth: 0,
      percentageChange: "0.0",
      byStatus: {},
    };
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateSimilarSentences(text: string, count: number = 3) {
  const prompt = `Generate ${count} new French sentences that are similar in structure and theme to this French text, but with different vocabulary: "${text}". Return only the French sentences, one per line.`;

  try {
    const result = await model.generateContent(prompt);
    const sentences = result.response.text().split('\n').filter(Boolean);
    return sentences;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}




________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/generate-uuid.ts
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/openai.ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/prompts.ts
export const CONVERSATION_PROMPT = `
As a French language conversation partner, please:
1. Transcribe the French audio
2. Translate it to English
3. Generate a natural French response
4. Translate your response to English

Format your response exactly like this:
Transcription: [French transcription]
Translation: [English translation]
Response: [Your French response]
Response Translation: [English translation of your response]
`.trim()

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/situations-service.ts
import { openai } from "@/lib/openai"
import { 
  Situation, 
  DialogueStep, 
  UserResponse, 
  ScenarioProgress 
} from "@/types/situations"

export class SituationsService {
  private static instance: SituationsService
  private progressCache: Map<string, ScenarioProgress>
  private audioCache: Map<string, string>

  private constructor() {
    this.progressCache = new Map()
    this.audioCache = new Map()
  }

  static getInstance(): SituationsService {
    if (!SituationsService.instance) {
      SituationsService.instance = new SituationsService()
    }
    return SituationsService.instance
  }

  async generateScenario(situationId: string): Promise<DialogueStep[]> {
    const prompt = `Create an immersive French learning scenario for: ${situationId}.
Include:
1. Multiple conversation paths
2. Cultural context and regional variations
3. Common idioms and expressions
4. Grammar explanations
5. Pronunciation guides
6. Different formality levels
7. Expected user responses
8. Progressive difficulty

The scenario should adapt based on user performance and choices.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      response_format: { type: "json_object" }
    })

    return JSON.parse(completion.choices[0].message.content || "[]")
  }

  async evaluateResponse(
    response: string, 
    expectedResponses: UserResponse[],
    context: DialogueStep
  ): Promise<UserResponse> {
    const prompt = `Evaluate this French response: "${response}"
Expected responses: ${JSON.stringify(expectedResponses)}
Context: ${JSON.stringify(context)}

Provide:
1. Accuracy score (0-100)
2. Grammar corrections
3. Pronunciation tips
4. Cultural appropriateness
5. Alternative expressions
6. Improvement suggestions`

    const evaluation = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    })

    return JSON.parse(evaluation.choices[0].message.content || "{}")
  }

  async generateAudio(text: string): Promise<string> {
    if (this.audioCache.has(text)) {
      return this.audioCache.get(text)!
    }

    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "echo",
      input: text,
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())
    const audioUrl = `data:audio/mp3;base64,${buffer.toString('base64')}`
    this.audioCache.set(text, audioUrl)
    
    return audioUrl
  }

  async saveProgress(progress: ScenarioProgress): Promise<void> {
    this.progressCache.set(progress.situationId, progress)
    // Also save to database
    await fetch('/api/situations/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress)
    })
  }

  getProgress(situationId: string): ScenarioProgress | undefined {
    return this.progressCache.get(situationId)
  }

  async getMetrics(situationId: string): Promise<SituationMetrics> {
    const response = await fetch(`/api/situations/metrics/${situationId}`)
    return response.json()
  }
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/auth/options.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials");
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user || !user.password) {
            throw new Error("No user found");
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "development" ? "next-auth.session-token" : "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/db/db-utils.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "./prisma";

export const dbUtils = {
  async createOrder(data: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return await prisma.order.create({
      data
    });
  },

  async getOrders() {
    return await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async getMenuItems() {
    return await prisma.menuItem.findMany({
      where: {
        active: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  },

  async createQuickNote(content: string, userId: string) {
    return await prisma.quickNote.create({
      data: {
        content,
        userId
      }
    });
  },

  async getQuickNotes(userId: string) {
    return await prisma.quickNote.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async updateMenuItem(id: string, data: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return await prisma.menuItem.update({
      where: { id },
      data
    });
  },

  async deleteMenuItem(id: string) {
    return await prisma.menuItem.update({
      where: { id },
      data: { active: false }
    });
  }
};

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/src/lib/db/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


export async function getQRCodeById(id: string) {
  try {
    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      include: {
        folder: true,
        deviceRules: true,
        scheduleRules: true,
      },
    })
    
    if (!qrCode) {
      return null
    }

    return qrCode
  } catch (error) {
    console.error("Error fetching QR code:", error)
    throw new Error("Failed to fetch QR code")
  }
}
________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/prisma/analytics.prisma
model AnalyticsSnapshot {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  date          DateTime
  metrics       Json
  type          String   // UTILIZATION, LABOR_COST, COVERAGE
  filters       Json?
  createdAt     DateTime @default(now())
}

model Report {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  description   String?
  type          String
  filters       Json
  schedule      Json?    // For automated reports
  lastRun       DateTime?
  createdBy     String   @db.ObjectId
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Alert {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  type          String
  severity      String
  message       String
  metadata      Json?
  isRead        Boolean  @default(false)
  createdAt     DateTime @default(now())
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/prisma/schema.prisma
generator client {
 provider = "prisma-client-js"
}

datasource db {
 provider = "mongodb"
 url      = env("DATABASE_URL")
}

enum Stage {
  PROSPECTING
  QUALIFICATION
  MEETING
  PROPOSAL
  NEGOTIATION
  PAUSED
  WON
  LOST
}

model User {
  id            String       @id @default(auto()) @map("_id") @db.ObjectId
  email         String      @unique
  name          String?
  password      String
  role          Role        @default(USER)
  contacts      Contact[]
  bio           String?
  phoneNumber   String?
  preferences   Json?
  notifications Json?
  activities    Activity[]
  orders        Order[]
  quickNotes    QuickNote[]
  menuItems     MenuItem[]
  visits        Visit[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  qrCodes       QRCode[]
  folders       Folder[]
  coffeeShops   CoffeeShop[] // Add this line to complete the relation
  people        Person[]    // Add relation to Person model
  filterHistory   FilterHistory[]
  savedFilters    SavedFilter[]
  followUps        FollowUp[]
  WordBank        WordBank[]
  translations    Translation[]
  generatedSentences GeneratedSentence[]
  translationHistory TranslationHistory[]
  conversations   ConversationSession[]
  todos           Todo[]
  savedSuggestions   SavedSuggestion[]
  suggestionHistory  SuggestionHistory[]

}


model SavedFilter {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  filters     Json
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model FilterHistory {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  filters     Json
  results     Int
  userId      String    @db.ObjectId
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
}

model Activity {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  contactId   String   @db.ObjectId
  type        String
  description String
  metadata    Json?
  createdAt   DateTime @default(now())
  contact     Contact  @relation(fields: [contactId], references: [id])
}

model Contact {
  id          String     @id @default(auto()) @map("_id") @db.ObjectId
  firstName   String
  lastName    String
  email       String
  phone       String?
  company     String?
  notes       String?
  status      Status     @default(NEW)
  userId      String     @db.ObjectId
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  activities  Activity[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  shop        Shop?      @relation(fields: [shopId], references: [id])
  shopId      String?    @db.ObjectId
}

model Person {
  id                String     @id @default(auto()) @map("_id") @db.ObjectId
  firstName         String?
  lastName          String?
  email             String
  phone             String?
  emailType         String?    // "professional" or "generic"
  verificationStatus String?   // "VALID", "INVALID", etc.
  lastVerifiedAt    DateTime?
  notes             String?
  userId            String     @db.ObjectId
  user              User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  coffeeShop        CoffeeShop @relation(fields: [coffeeShopId], references: [id])
  coffeeShopId      String     @db.ObjectId
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
  company     String?

}


model MenuItem {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  price       Float
  category    String
  popular     Boolean     @default(false)
  active      Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  userId      String      @db.ObjectId
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  orderItems  OrderItem[]
}

model Order {
  id              String      @id @default(auto()) @map("_id") @db.ObjectId
  orderNumber     Int
  customerName    String
  status          OrderStatus @default(PENDING)
  timestamp       DateTime    @default(now())
  total          Float
  isComplimentary Boolean     @default(false)
  queueTime      Float
  preparationTime Float?
  startTime      DateTime?
  customerEmail  String?
  customerPhone  String?
  leadInterest   Boolean?
  notes          String?
  items          OrderItem[]
  userId         String      @db.ObjectId
  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model OrderItem {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  menuItem    MenuItem  @relation(fields: [menuItemId], references: [id])
  menuItemId  String    @db.ObjectId
  order       Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId     String    @db.ObjectId
  quantity    Int
  price       Float
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model QuickNote {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  content   String
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Folder {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  color     String?  @default("#94a3b8")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  qrCodes   QRCode[]
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model QRCode {
  id            String         @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  defaultUrl    String
  shortCode     String         @unique
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  userId        String         @db.ObjectId
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  folderId      String?        @db.ObjectId
  folder        Folder?        @relation(fields: [folderId], references: [id], onDelete: SetNull)
  deviceRules   DeviceRule[]
  scheduleRules ScheduleRule[]
  design        QRDesign?
  scans         Scan[]
}

model QRDesign {
  id                    String   @id @default(auto()) @map("_id") @db.ObjectId
  size                  Int      @default(300)
  backgroundColor       String   @default("#FFFFFF")
  foregroundColor       String   @default("#000000")
  logoImage            String?
  logoWidth            Int?
  logoHeight           Int?
  dotStyle             String    @default("squares")
  margin               Int       @default(20)
  errorCorrectionLevel String    @default("M")
  style                Json
  logoStyle            Json?
  imageRendering       String    @default("auto")
  qrCodeId             String    @unique @db.ObjectId
  qrCode               QRCode    @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

model Scan {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId    String   @db.ObjectId
  qrCode      QRCode   @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  userAgent   String?
  ipAddress   String?
  location    String?
  device      String?
  browser     String?
  os          String?
  timestamp   DateTime @default(now())
}

model DeviceRule {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId   String   @db.ObjectId
  qrCode     QRCode   @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  deviceType String
  browsers   String[]
  os         String[]
  targetUrl  String
  priority   Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model ScheduleRule {
  id         String    @id @default(auto()) @map("_id") @db.ObjectId
  qrCodeId   String    @db.ObjectId
  qrCode     QRCode    @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)
  startDate  DateTime
  endDate    DateTime?
  timeZone   String
  daysOfWeek Int[]
  startTime  String?
  endTime    String?
  targetUrl  String
  priority   Int
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model Staff {
  id                String            @id @default(auto()) @map("_id") @db.ObjectId
  email             String            @unique
  name              String
  role              StaffRole         @default(BARISTA)
  certifications    String[]
  maxHoursPerWeek   Int               @default(40)
  hourlyRate        Float
  shifts           ShiftAssignment[]
  availability     Availability[]
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  shiftPreferences Json?
  maxShiftsPerWeek Int               @default(5)
  preferredShiftLength Int           @default(8)
  preferredDays    Int[]
  blackoutDates    DateTime[]
  timeOff          TimeOff[]
  emergencyContact String?
  address          String?
  preferredShifts  String[]
  maxHoursPerDay   Int               @default(8)
  notes            String?
}

model Shift {
  id            String            @id @default(auto()) @map("_id") @db.ObjectId
  type          ShiftType
  startTime     DateTime
  endTime       DateTime
  status        ShiftStatus       @default(DRAFT)
  notes         String?
  requiredRoles Json
  assignedStaff ShiftAssignment[]
  breaks        Break[]
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

model ShiftAssignment {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  shiftId   String   @db.ObjectId
  staffId   String   @db.ObjectId
  status    String   @default("SCHEDULED")
  shift     Shift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Break {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  shiftId   String   @db.ObjectId
  staffId   String   @db.ObjectId
  startTime DateTime
  duration  Int
  shift     Shift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Availability {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  staffId   String   @db.ObjectId
  dayOfWeek Int
  startTime String
  endTime   String
  recurring Boolean  @default(true)
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SchedulingRule {
  id                   String   @id @default(auto()) @map("_id") @db.ObjectId
  name                 String
  description          String?
  isActive             Boolean  @default(true)
  ruleType             RuleType @default(BASIC)
  minStaffPerShift     Int?
  maxStaffPerShift     Int?
  requireCertification Boolean  @default(false)
  requiredCertifications String[]
  minHoursBetweenShifts Int?
  maxWeeklyHours       Int?
  preferredDays        Int[]
  preferredHours       String[]
  roleRequirements     Json?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model TimeOff {
  id          String       @id @default(auto()) @map("_id") @db.ObjectId
  staffId     String       @db.ObjectId
  staff       Staff        @relation(fields: [staffId], references: [id])
  startDate   DateTime
  endDate     DateTime
  type        TimeOffType
  status      TimeOffStatus @default(PENDING)
  notes       String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}


model FollowUp {
  id              String       @id @default(auto()) @map("_id") @db.ObjectId
  coffeeShopId    String       @db.ObjectId
  coffeeShop      CoffeeShop   @relation(fields: [coffeeShopId], references: [id])
  type            FollowUpType
  status          FollowUpStatus @default(PENDING)
  priority        Int          @default(3) // 1-5 scale
  dueDate         DateTime
  completedDate   DateTime?
  notes           String?
  contactMethod   String?      // email, text, visit, call
  contactDetails  String?      // phone number, email address
  assignedTo      String       @db.ObjectId
  user            User         @relation(fields: [assignedTo], references: [id])
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

enum FollowUpType {
  INITIAL_CONTACT
  SAMPLE_DELIVERY
  PROPOSAL_FOLLOW
  TEAM_MEETING
  CHECK_IN
  GENERAL
}

enum FollowUpStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
  RESCHEDULED
}

model DeliveryHistory {
  id              String      @id @default(auto()) @map("_id") @db.ObjectId
  coffeeShopId    String      @db.ObjectId
  coffeeShop      CoffeeShop  @relation(fields: [coffeeShopId], references: [id])
  weekNumber      Int
  year            Int
  volume          Float
  revenue         Float
  isCurrentWeek   Boolean     @default(false)
  delivered       Boolean     @default(false)
  deliveryDate    DateTime?
  notes           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@unique([coffeeShopId, weekNumber, year], name: "delivery_period")
}

model WeeklyVolumeSnapshot {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  weekNumber    Int
  year          Int
  totalVolume   Float
  partnerCount  Int
  averageVolume Float
  metadata      Json?
  createdAt     DateTime  @default(now())
}



model DeliverySchedule {
  id              String      @id @default(auto()) @map("_id") @db.ObjectId
  coffeeShopId    String      @db.ObjectId
  coffeeShop      CoffeeShop  @relation(fields: [coffeeShopId], references: [id])
  startDate       DateTime
  frequency       String      // WEEKLY, BIWEEKLY, etc.
  volume          Float
  isActive        Boolean     @default(true)
  lastUpdated     DateTime    @updatedAt
  createdAt       DateTime    @default(now())
}

model CoffeeShop {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  title                 String
  address               String
  website               String?
  manager_present       String?
  contact_name          String?
  contact_email         String?
  phone                 String?
  visited               Boolean   @default(false)
  instagram            String?
  followers            Int?
  store_doors          String?
  volume               String?
  first_visit          DateTime?
  second_visit         DateTime?
  third_visit          DateTime?
  rating               Float?
  reviews              Int?
  price_type           String?
  type                 String?
  types                String[]
  service_options      Json?
  hours                String?
  operating_hours      Json?
  gps_coordinates      Json?
  latitude             Float
  longitude            Float
  area                 String?
  is_source            Boolean   @default(false)
  quality_score        Float?
  parlor_coffee_leads  Boolean   @default(false)
  visits               Visit[]
  userId               String?   @db.ObjectId
  user                 User?     @relation(fields: [userId], references: [id])
  owners               Owner[]
  notes                String?
  priority             Int       @default(0)
  isPartner            Boolean   @default(false)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  priorityLastUpdated  DateTime?
  // Add these fields
  emails               Json?     // Stores array of discovered emails
  company_data         Json?     // Stores company enrichment data
  people               Person[]  // Relation to people discovered from emails
  stage     Stage     @default(PROSPECTING)
  delivery_frequency String? // Values: "WEEKLY", "BIWEEKLY", "THREE_WEEKS", "FOUR_WEEKS", "FIVE_WEEKS", "SIX_WEEKS"
  first_delivery_week Int?
  followUps         FollowUp[]
  lastFollowUp      DateTime?
  nextFollowUpDate  DateTime?
  followUpCount     Int         @default(0)
  relationshipStage String?     // INITIAL, SAMPLES_DELIVERED, PROPOSAL_SENT, etc.
  potential         Int?        // 1-5 scale
  interest          Int?        // 1-5 scale
  decisionMaker     String?     // Name of the decision maker
  decisionMakerRole String?     // Role of the decision maker
  communicationPreference String? // email, phone, in-person
  bestTimeToVisit   String?
  competitors       String[]    // Other coffee suppliers they work with
  budget           Float?      // Estimated monthly budget
  closingNotes     String?     // Notes about closing strategy
  deliveryHistory    DeliveryHistory[]
deliverySchedule   DeliverySchedule[]
  currentVolume      Float?
  averageVolume      Float?
  revenueYTD         Float?
  growthRate         Float?
  lastDelivery       DateTime?
  nextDelivery       DateTime?
  weeklyVolumes     Json?          // Stores current week's volume data
  historicalVolumes Json?          // Stores previous weeks' volume data
  volumeLastUpdated DateTime?      // Tracks when volume was last modified
  weekNumber        Int?           // Current week number
  yearNumber        Int?           // Current year
  volumeStats       Json?          // Aggregated volume statistics
 delivery_day String? @default("TUESDAY")

}



model Owner {
 id            String      @id @default(auto()) @map("_id") @db.ObjectId
 name          String
 email         String
 coffeeShopId  String      @db.ObjectId
 coffeeShop    CoffeeShop  @relation(fields: [coffeeShopId], references: [id], onDelete: Cascade)
 createdAt     DateTime    @default(now())
 updatedAt     DateTime    @updatedAt
}

model Visit {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  coffeeShopId    String      @db.ObjectId
  shopId        String    @db.ObjectId
  userId        String    @db.ObjectId
  visitNumber   Int
  date          DateTime
  managerPresent Boolean  @default(false)
  managerName   String?
  managerContact String?
  samplesDropped Boolean  @default(false)
  sampleDetails String?
  notes         String?
  nextVisitDate DateTime?
  photos        Photo[]   
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  shop          Shop      @relation(fields: [shopId], references: [id])
  user          User      @relation(fields: [userId], references: [id])
  coffeeShop    CoffeeShop  @relation(fields: [coffeeShopId], references: [id])

}

model Photo {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  visitId   String   @db.ObjectId
  url       String
  caption   String?
  createdAt DateTime @default(now())
  visit     Visit    @relation(fields: [visitId], references: [id])
}

model Shop {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  address     String
  latitude    Float
  longitude   Float
  rating      Float?
  reviews     Int?
  website     String?
  phone       String?
  visited     Boolean   @default(false)
  visits      Visit[]
  contacts    Contact[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Role {
  USER
  ADMIN
}

enum Status {
  NEW
  CONTACTED
  QUALIFIED
  CONVERTED
  LOST
}

enum OrderStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum StaffRole {
  BARISTA
  SOMMELIER
  MANAGER
  EXECUTIVE
}

enum ShiftType {
  COFFEE
  WINE
}

enum ShiftStatus {
  DRAFT
  PUBLISHED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum RuleType {
  BASIC
  ADVANCED
  CERTIFICATION
  TIME_CONSTRAINT
  ROLE_BASED
}

enum TimeOffType {
  VACATION
  SICK
  PERSONAL
  OTHER
}

enum TimeOffStatus {
  PENDING
  APPROVED
  REJECTED
}




model WordBank {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  userId      String    @db.ObjectId
  user        User      @relation(fields: [userId], references: [id])
  word        String
  translation String
  definition  String
  context     String?
  language    String    @default("fr")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Translation {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  userId      String    @db.ObjectId
  user        User      @relation(fields: [userId], references: [id])
  sourceText  String
  translation String
  similar     String[]  @default([])
  createdAt   DateTime  @default(now())
}



model GeneratedSentence {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  original    String
  generated   String[]
  translations String[]
  createdAt   DateTime @default(now())
}

model TranslationHistory {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  sourceText  String
  translation String
  audioUrl    String?
  createdAt   DateTime @default(now())
}



model ConversationSession {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  userId        String    @db.ObjectId
  user          User      @relation(fields: [userId], references: [id])
  topic         String
  isAutosave    Boolean   @default(false)
  messages      Message[]
  stats         Json?
  startedAt     DateTime  @default(now())
  endedAt       DateTime?
  duration      Int?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Create a compound index for userId and isAutosave
  @@index([userId, isAutosave])
}

model Message {
  id                String              @id @default(auto()) @map("_id") @db.ObjectId
  sessionId         String              @db.ObjectId
  session           ConversationSession @relation(fields: [sessionId], references: [id])
  role              String
  content           String
  translation       String?
  audioUrl          String?
  timestamp         DateTime            @default(now())
  mood              String?
  correctedContent  String?
  grammarNotes      String[]
  createdAt         DateTime            @default(now())
}


model Todo {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  description String?
  status      TodoStatus @default(PENDING)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  tags        String[]
  userId      String    @db.ObjectId
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  attachments String[]
  subtasks    Subtask[]
  category    String?
}

model Subtask {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  completed Boolean  @default(false)
  todoId    String   @db.ObjectId
  todo      Todo     @relation(fields: [todoId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum TodoStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  ARCHIVED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}


model SavedSuggestion {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  userId        String    @db.ObjectId
  user          User      @relation(fields: [userId], references: [id])
  text          String
  translation   String
  category      String    // 'response', 'question', 'clarification'
  context       String?   // Original message that prompted this suggestion
  isFavorite    Boolean   @default(false)
  useCount      Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model SuggestionHistory {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  userId        String    @db.ObjectId
  user          User      @relation(fields: [userId], references: [id])
  prompt        String    // The message that triggered the suggestion
  suggestions   Json      // Array of generated suggestions
  selectedId    String?   // ID of the suggestion that was selected
  createdAt     DateTime  @default(now())
}

________________________________________________________________________________
### /Users/mohameddiomande/Desktop/french-connect/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { INITIAL_MENU_ITEMS } from '../src/constants/pos-data';

const prisma = new PrismaClient();

async function main() {
 console.log('Starting seeding...');

 // Seed menu items
 for (const item of INITIAL_MENU_ITEMS) {
   const existingItem = await prisma.menuItem.findFirst({
     where: {
       name: item.name,
     },
   });

   if (!existingItem) {
     await prisma.menuItem.create({
       data: item,
     });
     console.log(`Created menu item: ${item.name}`);
   } else {
     console.log(`Menu item already exists: ${item.name}`);
   }
 }

 console.log('Seeding finished.');
}

main()
 .catch((e) => {
   console.error(e);
   process.exit(1);
 })
 .finally(async () => {
   await prisma.$disconnect();
 });

________________________________________________________________________________
