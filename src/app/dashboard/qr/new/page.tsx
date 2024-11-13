import { Metadata } from "next"
import { QRForm } from "@/components/dashboard/qr/qr-form"
import { PageContainer } from "@/components/layout/page-container"

export const metadata: Metadata = {
  title: "Create QR Code | Chain Works",
  description: "Create a new QR code",
}

export default function NewQRCodePage() {
  return (
    <PageContainer>
    <div className="flex-1">
      <QRForm />
    </div>
  </PageContainer>
  )
}
