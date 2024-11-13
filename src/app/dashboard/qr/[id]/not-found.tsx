// src/app/(app)/qr/[id]/not-found.tsx
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex-1 p-8">
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">QR Code Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The QR code you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Link href="/qr" className="mt-4 inline-block">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to QR Codes
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}