import { Metadata } from "next"
import { notFound } from "next/navigation"
import { QRForm } from "@/components/dashboard/qr/qr-form"
import { getQRCodeById } from "@/lib/db/prisma"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { PageContainer } from "@/components/layout/page-container"

// @ts-expect-error Set up the metadata type
export default async function QRCodePage({ params }) {
  let qrCode = null
  
  try {
    qrCode = await getQRCodeById(params.id)
  } catch {
    if (process.env.NODE_ENV === 'production') {
      console.error("Error loading QR code:", params.id)
    }
  }

  if (!qrCode) {
    notFound()
  }

  return (
    <PageContainer>
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit QR Code</h2>
          <p className="text-muted-foreground">
            Update your QR code settings and rules
          </p>
        </div>
        <Link href="/qr">
          <Button variant="outline" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to QR Codes
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <QRForm initialData={qrCode} />
      </Card>
    </div>
  </PageContainer>
  )
}

// @ts-expect-error Set up the metadata type
export async function generateMetadata({ params }): Promise<Metadata> {
  let qrCode = null
  
  try {
    qrCode = await getQRCodeById(params.id)
  } catch {
    return {
      title: "QR Code Not Found | Chain Works",
      description: "The requested QR code could not be found.",
    }
  }

  if (!qrCode) {
    return {
      title: "QR Code Not Found | Chain Works",
      description: "The requested QR code could not be found.",
    }
  }

  return {
    title: `Edit ${qrCode.name} | Chain Works`,
    description: `Update settings and rules for QR code: ${qrCode.name}`,
    openGraph: {
      title: `Edit ${qrCode.name} | Chain Works`,
      description: `Update settings and rules for QR code: ${qrCode.name}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Edit ${qrCode.name} | Chain Works`,
      description: `Update settings and rules for QR code: ${qrCode.name}`,
    },
  }
}