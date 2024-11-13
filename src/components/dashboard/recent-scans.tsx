"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scan, ArrowRight } from "lucide-react"
import Link from "next/link"

interface RecentScansProps {
  className?: string
}

export function RecentScans({ className }: RecentScansProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Recent Scans</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Track your latest QR code activity
          </p>
        </div>
        <Link href="/scans">
          <Button variant="ghost" size="sm" className="text-sm">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-blue-500/10 p-4 mb-4">
            <Scan className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Recent Scans</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
            Create your first QR code to start tracking scans and analyze performance
          </p>
          <Link href="/qr/new">
            <Button>
              Create Your First QR Code
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
