import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getServerSession } from "next-auth"
import { z } from "zod"

// Define schema for updating QR codes
const updateQRCodeSchema = z.object({
  name: z.string().min(2).optional(),
  defaultUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
})

// PATCH handler for updating a QR code
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.pathname.split("/").slice(-2, -1)[0]

    const json = await req.json()
    const body = updateQRCodeSchema.parse(json)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
    })

    if (!qrCode) {
      return new NextResponse("QR Code not found", { status: 404 })
    }

    if (qrCode.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const updatedQRCode = await prisma.qRCode.update({
      where: { id },
      data: body,
      include: {
        deviceRules: true,
        scheduleRules: true,
      },
    })

    return NextResponse.json(updatedQRCode)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("[QR_CODE_UPDATE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// DELETE handler for deleting a QR code
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.pathname.split("/").slice(-2, -1)[0]

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
    })

    if (!qrCode) {
      return new NextResponse("QR Code not found", { status: 404 })
    }

    if (qrCode.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.qRCode.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[QR_CODE_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// GET handler for fetching a QR code
export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.pathname.split("/").slice(-2, -1)[0]

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
      include: {
        deviceRules: true,
        scheduleRules: true,
      },
    })

    if (!qrCode) {
      return new NextResponse("QR Code not found", { status: 404 })
    }

    if (qrCode.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error("[QR_CODE_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// src/app/api/qr/[id]/route.ts