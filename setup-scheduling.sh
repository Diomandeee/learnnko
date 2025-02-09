#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
  echo -e "${BLUE}$1${NC}"
}

print_success() {
  echo -e "${GREEN}$1${NC}"
}

print_error() {
  echo -e "${RED}$1${NC}"
}

# Create necessary directories
print_status "Creating directories..."
mkdir -p src/components/follow-ups
mkdir -p src/app/api/follow-ups/generate
mkdir -p src/lib/follow-ups

# Create initial follow-ups generator
print_status "Creating follow-ups generator..."
cat > src/lib/follow-ups/generate-initial.ts << 'EOF'
import { CoffeeShop, FollowUpType } from "@prisma/client"
import { addBusinessDays } from "date-fns"

interface FollowUpSuggestion {
  coffeeShopId: string
  type: FollowUpType
  priority: number
  dueDate: Date
  notes: string
  contactMethod: string
}

export async function generateInitialFollowUps(shops: CoffeeShop[]): Promise<FollowUpSuggestion[]> {
  const followUps: FollowUpSuggestion[] = []
  const today = new Date()

  for (const shop of shops) {
    if (shop.isPartner) continue

    switch (shop.stage) {
      case 'PROSPECTING':
        if (!shop.visited) {
          followUps.push({
            coffeeShopId: shop.id,
            type: 'INITIAL_CONTACT',
            priority: 3,
            dueDate: addBusinessDays(today, 1),
            notes: `Initial contact needed for ${shop.title}. Located in ${shop.area}.`,
            contactMethod: 'visit'
          })
        }
        break

      case 'QUALIFICATION':
        followUps.push({
          coffeeShopId: shop.id,
          type: 'SAMPLE_DELIVERY',
          priority: 4,
          dueDate: addBusinessDays(today, 2),
          notes: `Schedule sample delivery for ${shop.title}. Contact: ${shop.contact_name || 'TBD'}`,
          contactMethod: 'call'
        })
        break

      case 'MEETING':
        followUps.push({
          coffeeShopId: shop.id,
          type: 'TEAM_MEETING',
          priority: 4,
          dueDate: addBusinessDays(today, 1),
          notes: `Schedule meeting with ${shop.decisionMaker || 'team'} at ${shop.title}`,
          contactMethod: shop.communicationPreference || 'call'
        })
        break

      case 'PROPOSAL':
        followUps.push({
          coffeeShopId: shop.id,
          type: 'PROPOSAL_FOLLOW',
          priority: 5,
          dueDate: addBusinessDays(today, 2),
          notes: `Follow up on proposal with ${shop.title}. Volume potential: ${shop.volume || 'TBD'}`,
          contactMethod: 'call'
        })
        break

      case 'NEGOTIATION':
        followUps.push({
          coffeeShopId: shop.id,
          type: 'TEAM_MEETING',
          priority: 5,
          dueDate: addBusinessDays(today, 1),
          notes: `Close deal with ${shop.title}. Budget: ${shop.budget ? `$${shop.budget}` : 'TBD'}`,
          contactMethod: 'visit'
        })
        break
    }

    if (shop.potential && shop.potential >= 4) {
      followUps.push({
        coffeeShopId: shop.id,
        type: 'CHECK_IN',
        priority: 5,
        dueDate: addBusinessDays(today, 1),
        notes: `High potential lead (${shop.potential}/5). Priority follow-up needed.`,
        contactMethod: shop.communicationPreference || 'visit'
      })
    }

    if (shop.visited && !shop.second_visit) {
      followUps.push({
        coffeeShopId: shop.id,
        type: 'SAMPLE_DELIVERY',
        priority: 4,
        dueDate: addBusinessDays(today, 3),
        notes: `Follow up on first visit to ${shop.title}. Discuss sample delivery.`,
        contactMethod: 'call'
      })
    }
  }

  return followUps
}
EOF

# Create generate button component
print_status "Creating generate button component..."
cat > src/components/follow-ups/generate-button.tsx << 'EOF'
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw } from "lucide-react"

interface GenerateFollowUpsButtonProps {
  onGenerated: () => void
}

export function GenerateFollowUpsButton({ onGenerated }: GenerateFollowUpsButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/follow-ups/generate', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to generate follow-ups')
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: `Generated ${data.count} follow-ups`
      })

      onGenerated()
    } catch (error) {
      console.error('Error generating follow-ups:', error)
      toast({
        title: "Error",
        description: "Failed to generate follow-ups",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      Generate Follow-ups
    </Button>
  )
}
EOF

# Create generation API route
print_status "Creating generation API route..."
cat > src/app/api/follow-ups/generate/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { generateInitialFollowUps } from "@/lib/follow-ups/generate-initial"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
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

    const shops = await prisma.coffeeShop.findMany()
    const suggestions = await generateInitialFollowUps(shops)

    const createdFollowUps = await Promise.all(
      suggestions.map(suggestion =>
        prisma.followUp.create({
          data: {
            ...suggestion,
            assignedTo: user.id,
            status: 'PENDING'
          }
        })
      )
    )

    await Promise.all(
      suggestions.map(suggestion =>
        prisma.coffeeShop.update({
          where: { id: suggestion.coffeeShopId },
          data: {
            followUpCount: { increment: 1 },
            lastFollowUp: new Date(),
            nextFollowUpDate: suggestion.dueDate
          }
        })
      )
    )

    return NextResponse.json({
      data: createdFollowUps,
      count: createdFollowUps.length
    })
  } catch (error) {
    console.error("[FOLLOW_UPS_GENERATE]", error)
    return NextResponse.json(
      { error: "Failed to generate follow-ups" },
      { status: 500 }
    )
  }
}
EOF

# Update FollowUpManager component
print_status "Updating FollowUpManager component..."
cat > src/components/follow-ups/follow-up-manager.tsx << 'EOF'
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { GenerateFollowUpsButton } from "./generate-button"
// ... rest of the imports

export function FollowUpManager() {
  // ... existing code

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Follow-ups</h2>
            <p className="text-sm text-muted-foreground">
              Manage and track your follow-ups
            </p>
          </div>
          <div className="flex items-center gap-2">
            <GenerateFollowUpsButton onGenerated={fetchFollowUps} />
            <FollowUpCreateDialog 
              shops={shops} 
              onFollowUpCreated={fetchFollowUps} 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* ... rest of the component */}
      </CardContent>
    </Card>
  )
}
EOF

# Run Prisma commands
print_status "Running Prisma commands..."
npx prisma generate

print_success "Setup complete!"
print_status "Next steps:"
echo "1. Click 'Generate Follow-ups' to create initial follow-ups"
echo "2. Follow-ups will be created based on each shop's stage"
echo "3. Check the follow-ups table to see the generated items"