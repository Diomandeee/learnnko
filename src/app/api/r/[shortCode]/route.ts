import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(
 request: NextRequest,
 { params }: { params: { shortCode: string } }
) {
 try {
   const qrCode = await prisma.qRCode.findUnique({
     where: { shortCode: params.shortCode }
   })

   if (!qrCode || !qrCode.isActive) {
     return NextResponse.redirect(new URL('/404', request.url))
   }

   // Log the scan
   await prisma.scan.create({
     data: {
       qrCodeId: qrCode.id,
       userAgent: request.headers.get('user-agent') || undefined,
       device: request.headers.get('sec-ch-ua-platform') || undefined,
       browser: request.headers.get('sec-ch-ua') || undefined,
     }
   })

   // Clean up the target URL
   let targetUrl = qrCode.defaultUrl
   if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
     targetUrl = `https://${targetUrl}`
   }

   console.log(`Redirecting ${params.shortCode} to ${targetUrl}`)
   return NextResponse.redirect(targetUrl)
 } catch (error) {
   console.error("[QR_REDIRECT_ERROR]", error)
   return NextResponse.redirect(new URL('/404', request.url))
 }
}
