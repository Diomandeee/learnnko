import { NextRequest, NextResponse } from "next/server"
import { getQRCodeById } from "@/lib/db/prisma"
import { generateQRCode } from "@/lib/qr"

export async function GET(request: NextRequest) {
  try {
    // Extract `id` from the URL path
    const url = new URL(request.url)
    const id = url.pathname.split("/").slice(-2, -1)[0] // grabs the second last part of the path

    const qrCode = await getQRCodeById(id)

    if (!qrCode) {
      return new NextResponse("QR Code not found", { status: 404 })
    }

    const imageData = await generateQRCode(qrCode.shortCode)

    return NextResponse.json({ imageData })
  } catch (error) {
    console.error("[QR_CODE_IMAGE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
