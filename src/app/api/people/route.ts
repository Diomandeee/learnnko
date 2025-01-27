// app/api/people/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { authOptions } from "@/lib/auth/options"
import { z } from "zod"

// In your /api/people/route.ts
const personSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),  // Add this
  emailType: z.enum(["generic", "professional"]),
  verificationStatus: z.string(),
  lastVerifiedAt: z.string().nullable(),
  notes: z.string().optional(),
  coffeeShopId: z.string()
})
export async function POST(request: Request) {
  try {
    // 1. Get and validate session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // 3. Parse and validate request data
    const body = await request.json()
    const data = personSchema.parse(body)

    // 4. Check if coffee shop exists
    const coffeeShop = await prisma.coffeeShop.findUnique({
      where: { id: data.coffeeShopId }
    })

    if (!coffeeShop) {
      return NextResponse.json(
        { error: "Coffee shop not found" },
        { status: 404 }
      )
    }

    // 5. Check if person already exists
    const existingPerson = await prisma.person.findFirst({
      where: {
        email: data.email,
        userId: user.id
      }
    })

    if (existingPerson) {
      return NextResponse.json(
        { error: "Person with this email already exists" },
        { status: 400 }
      )
    }

    // 6. Create person
    const person = await prisma.person.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        emailType: data.emailType,
        verificationStatus: data.verificationStatus,
        lastVerifiedAt: data.lastVerifiedAt ? new Date(data.lastVerifiedAt) : null,
        notes: data.notes,
        userId: user.id,
        coffeeShopId: data.coffeeShopId
      }
    })

    return NextResponse.json(person, { status: 201 })

  } catch (error) {
    console.error("[PEOPLE_POST] Error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create person" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const coffeeShopId = searchParams.get('coffeeShopId')

    const people = await prisma.person.findMany({
      where: {
        ...(coffeeShopId ? { coffeeShopId } : {}),
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(people)
  } catch (error) {
    console.error("[PEOPLE_GET] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch people" },
      { status: 500 }
    )
  }
}