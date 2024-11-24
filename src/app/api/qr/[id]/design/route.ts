import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Verify QR code ownership
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: params.id }
    })

    if (!qrCode || qrCode.userId !== user.id) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      )
    }

    const design = await req.json()

    // Update or create design
    const qrDesign = await prisma.qRDesign.upsert({
      where: {
        qrCodeId: params.id,
      },
      update: {
        ...design,
        updatedAt: new Date(),
      },
      create: {
        ...design,
        qrCodeId: params.id,
      },
    })

    return NextResponse.json(qrDesign)
  } catch (error) {
    console.error("[QR_DESIGN_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to save QR design" },
      { status: 500 }
    )
  }
}
