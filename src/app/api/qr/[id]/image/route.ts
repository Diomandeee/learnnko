// src/app/api/qr/[id]/image/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import QRCode from 'qrcode' // Import QRCode library

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split("/").slice(-2, -1)[0]

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
    })

    if (!qrCode) {
      return new NextResponse("QR Code not found", { status: 404 })
    }

    // Generate the URL directly here for debugging
    const SITE_URL = "https://bufbarista-crm.vercel.app"
    const redirectUrl = `${SITE_URL}/r/${qrCode.shortCode}`
    
    console.log('Generated QR URL:', redirectUrl) // Debug log

    // Use the QRCode library to generate the image
    const qrDataUrl = await QRCode.toDataURL(redirectUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    return NextResponse.json({ imageData: qrDataUrl })
  } catch (error) {
    console.error("[QR_CODE_IMAGE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}