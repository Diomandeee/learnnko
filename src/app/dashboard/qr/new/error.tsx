"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">
          Failed to create QR code. Please try again.
        </p>
        <Link href="/dashboard/qr">
          <Button>Back to QR Codes</Button>
        </Link>
      </div>
    </div>
  )
}
