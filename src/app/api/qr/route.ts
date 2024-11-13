
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { z } from "zod"

const createQRCodeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  defaultUrl: z.string().url("Invalid URL format"),
  folderId: z.string().nullable().optional(),
  design: z.object({
    size: z.number(),
    backgroundColor: z.string(),
    foregroundColor: z.string(),
    dotStyle: z.string(),
    margin: z.number(),
    errorCorrectionLevel: z.string(),
  }).optional().nullable(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

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

    const qrCodes = await prisma.qRCode.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        folder: true,
      },
    })

    return NextResponse.json(qrCodes)
  } catch (error) {
    console.error("[QR_CODES_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

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

    const body = await req.json()
    console.log("Received request body:", body)

    // Parse and validate the input data
    const data = createQRCodeSchema.parse(body)

    // Generate a unique short code
    const generateShortCode = (length: number = 6): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    // Create the QR code - Note the capital 'QRCode' here
    const qrCode = await prisma.qRCode.create({
      data: {
        name: data.name,
        defaultUrl: data.defaultUrl,
        shortCode: generateShortCode(),
        isActive: true,
        userId: user.id,
        folderId: data.folderId || null,
      },
      include: {
        folder: true,
      },
    })

    console.log("Created QR code:", qrCode)

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error("[QR_CODE_CREATE]", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation error", 
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create QR code" },
      { status: 500 }
    )
  }
}
