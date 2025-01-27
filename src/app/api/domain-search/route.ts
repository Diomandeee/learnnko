// app/api/domain-search/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { z } from "zod"

const domainSearchSchema = z.object({
  company: z.string(),
  limit: z.number().optional(),
  email_type: z.enum(['all', 'generic', 'professional']).optional(),
  company_enrichment: z.boolean().optional()
})

// Named export for POST method
export async function POST(request: Request) {
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const body = await request.json()
    const validatedData = domainSearchSchema.parse(body)

    // 3. Make request to Prospeo API
    const prospeoResponse = await fetch("https://api.prospeo.io/domain-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-KEY": process.env.PROSPEO_API_KEY || ""
      },
      body: JSON.stringify({
        ...validatedData,
        limit: validatedData.limit || 50,
        email_type: validatedData.email_type || 'all',
        company_enrichment: validatedData.company_enrichment || false
      })
    })

    // 4. Handle API response
    const data = await prospeoResponse.json()

    if (!prospeoResponse.ok) {
      console.error("[DOMAIN_SEARCH] Prospeo API error:", data)
      return NextResponse.json(
        { error: data.message || "Failed to search domain" },
        { status: prospeoResponse.status }
      )
    }

    // 5. Return successful response
    return NextResponse.json(data)

  } catch (error) {
    // 6. Error handling
    console.error("[DOMAIN_SEARCH] Error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    )
  }
}

// Optional: Add GET method if you need to support pagination
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const searchId = searchParams.get('search_id')

  if (!searchId) {
    return NextResponse.json(
      { error: "Search ID is required" },
      { status: 400 }
    )
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const prospeoResponse = await fetch("https://api.prospeo.io/domain-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-KEY": process.env.PROSPEO_API_KEY || ""
      },
      body: JSON.stringify({ search_id: searchId })
    })

    const data = await prospeoResponse.json()

    if (!prospeoResponse.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch results" },
        { status: prospeoResponse.status }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error("[DOMAIN_SEARCH_GET] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 }
    )
  }
}