import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, Plus } from "lucide-react"
import Link from "next/link"

export function QRCodeEmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <QrCode className="h-12 w-12 text-muted-foreground" />
      </div>
      <CardTitle className="mb-2">No QR Codes Yet</CardTitle>
      <CardDescription className="mb-4 max-w-sm">
        Create your first QR code to get started with dynamic redirects and analytics.
      </CardDescription>
      <Link href="/qr/new">
        <Button size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create Your First QR Code
        </Button>
      </Link>
    </Card>
  )
}
