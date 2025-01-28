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

export async function POST(request: Request) {
  try {
    // Log for debugging
    console.log("[DOMAIN_SEARCH] Starting domain search request")

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
    console.log("[DOMAIN_SEARCH] Request body:", body)

    const validatedData = domainSearchSchema.parse(body)

    // Check if we have an API key
    const apiKey = "d8760477650b3972f49fb99f3c6a4c4c"
    if (!apiKey) {
      console.error("[DOMAIN_SEARCH] Missing PROSPEO_API_KEY")
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      )
    }

    // 3. Make request to Prospeo API
    console.log("[DOMAIN_SEARCH] Making request to Prospeo API")
    const prospeoResponse = await fetch("https://api.prospeo.io/domain-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-KEY": apiKey
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
    console.log("[DOMAIN_SEARCH] Prospeo API response status:", prospeoResponse.status)

    if (!prospeoResponse.ok) {
      console.error("[DOMAIN_SEARCH] Prospeo API error:", data)
      return NextResponse.json(
        { error: data.message || "Failed to search domain" },
        { status: prospeoResponse.status }
      )
    }

    console.log("[DOMAIN_SEARCH] Successful response")
    return NextResponse.json(data)

  } catch (error) {
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