import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const scheduleRuleSchema = z.object({
  startDate: z.string(),
  endDate: z.string().nullable(),
  timeZone: z.string(),
  daysOfWeek: z.array(z.number().min(0).max(6)),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  targetUrl: z.string().url(),
  priority: z.number(),
})

const scheduleRulesSchema = z.array(scheduleRuleSchema)

// Use this utility to retrieve params from the request URL.
function getIdFromUrl(req: NextRequest): string | null {
  return req.nextUrl.pathname.split("/").pop() || null
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 401 })
    }

    const id = getIdFromUrl(req)
    if (!id) {
      return new NextResponse("Invalid QR code ID", { status: 400 })
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      include: { scheduleRules: true }
    })

    if (!qrCode) {
      return new NextResponse("QR code not found", { status: 404 })
    }

    if (qrCode.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    return NextResponse.json(qrCode.scheduleRules)
  } catch (error) {
    console.error("[SCHEDULE_RULES_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 401 })
    }

    const id = getIdFromUrl(req)
    if (!id) {
      return new NextResponse("Invalid QR code ID", { status: 400 })
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { id }
    })

    if (!qrCode) {
      return new NextResponse("QR code not found", { status: 404 })
    }

    if (qrCode.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const rules = scheduleRulesSchema.parse(json)

    // Delete existing rules
    await prisma.scheduleRule.deleteMany({
      where: { qrCodeId: id }
    })

    // Create new rules
    await prisma.scheduleRule.createMany({
      data: rules.map(rule => ({
        ...rule,
        qrCodeId: id,
        startDate: new Date(rule.startDate),
        endDate: rule.endDate ? new Date(rule.endDate) : null,
        timeZone: rule.timeZone || '',
        targetUrl: '', // Add this line to explicitly define targetUrl as required
        priority: 0 // Add this line to explicitly define priority as required
      }))
    })

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("[SCHEDULE_RULES_PUT]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
