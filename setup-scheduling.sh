#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create necessary directories
print_status "Creating API route directories..."
mkdir -p src/app/api/suggestions
mkdir -p src/app/api/suggestions/save
mkdir -p src/app/api/suggestions/saved
mkdir -p src/app/api/suggestions/saved/{id}/favorite
mkdir -p src/app/api/suggestions/use

# Create base suggestions API route
print_status "Creating base suggestions route..."
cat > src/app/api/suggestions/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

interface GeneratedSuggestion {
  text: string
  translation: string
  category: 'response' | 'question' | 'clarification'
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

    const { lastMessage } = await req.json()

    // Get user's saved suggestions for context
    const savedSuggestions = await prisma.savedSuggestion.findMany({
      where: {
        userId: user.id,
        isFavorite: true
      },
      take: 5,
      orderBy: {
        useCount: 'desc'
      }
    })

    const prompt = `
      Generate natural French responses to: "${lastMessage}"
      Include different types: direct responses, questions, clarifications.
      Format as JSON array:
      {
        "text": "French response",
        "translation": "English translation",
        "category": "response|question|clarification"
      }
      ${savedSuggestions.length > 0 ? `
      Consider user's preferred responses:
      ${savedSuggestions.map(s => s.text).join('\n')}
      ` : ''}
    `

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent(prompt)
    const response = await result.response.text()

    let suggestions: GeneratedSuggestion[]
    try {
      suggestions = JSON.parse(response)
    } catch (error) {
      console.error("Error parsing Gemini response:", error)
      throw new Error("Invalid response format")
    }

    const suggestionsWithMeta = await Promise.all(
      suggestions.map(async (suggestion) => {
        const isSaved = await prisma.savedSuggestion.findFirst({
          where: {
            userId: user.id,
            text: suggestion.text
          }
        })

        return {
          ...suggestion,
          id: crypto.randomUUID(),
          isSaved: !!isSaved
        }
      })
    )

    await prisma.suggestionHistory.create({
      data: {
        userId: user.id,
        prompt: lastMessage,
        suggestions: suggestionsWithMeta
      }
    })

    return NextResponse.json({ suggestions: suggestionsWithMeta })
  } catch (error) {
    console.error("Error generating suggestions:", error)
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    )
  }
}
EOF

# Create save suggestion route
print_status "Creating save suggestion route..."
cat > src/app/api/suggestions/save/route.ts << 'EOF'
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
EOF

# Create saved suggestions route
print_status "Creating saved suggestions route..."
cat > src/app/api/suggestions/saved/route.ts << 'EOF'
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
EOF

# Create delete saved suggestion route
print_status "Creating delete suggestion route..."
cat > src/app/api/suggestions/saved/[id]/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export async function DELETE(
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

    await prisma.savedSuggestion.delete({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting suggestion:", error)
    return NextResponse.json(
      { error: "Failed to delete suggestion" },
      { status: 500 }
    )
  }
}
EOF

# Create toggle favorite route
print_status "Creating toggle favorite route..."
cat > src/app/api/suggestions/saved/[id]/favorite/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export async function POST(
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

    const suggestion = await prisma.savedSuggestion.findUnique({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      )
    }

    const updatedSuggestion = await prisma.savedSuggestion.update({
      where: {
        id: params.id,
        userId: user.id
      },
      data: {
        isFavorite: !suggestion.isFavorite
      }
    })

    return NextResponse.json(updatedSuggestion)
  } catch (error) {
    console.error("Error updating favorite status:", error)
    return NextResponse.json(
      { error: "Failed to update favorite status" },
      { status: 500 }
    )
  }
}
EOF

# Create use suggestion route
print_status "Creating use suggestion route..."
cat > src/app/api/suggestions/use/route.ts << 'EOF'
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
EOF

# Update Prisma schema
print_status "Creating Prisma models for suggestions..."
cat >> prisma/schema.prisma << 'EOF'

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
EOF

# Run Prisma migration
print_status "Running Prisma migration..."
npx prisma generate
npx prisma db push

print_success "Suggestion API setup complete!"
print_status "API routes created:"
echo "  - /api/suggestions"
echo "  - /api/suggestions/save"
echo "  - /api/suggestions/saved"
echo "  - /api/suggestions/saved/[id]"
echo "  - /api/suggestions/saved/[id]/favorite"
echo "  - /api/suggestions/use"

# Make script executable
chmod +x setup-suggestions-api.sh