"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Smartphone, Monitor, Globe, Map } from "lucide-react"
import { format } from "date-fns"

interface ScanDetailsDialogProps {
  scan: {
    id: string
    qrCode: string
    device: string
    browser: string
    location: string
    timestamp: Date
    ipAddress?: string
    userAgent?: string
    referrer?: string
    duration?: number
  }
}

export function ScanDetailsDialog({ scan }: ScanDetailsDialogProps) {
  const details = [
    { label: "Device", value: scan.device, icon: scan.device === "Mobile" ? Smartphone : Monitor },
    { label: "Browser", value: scan.browser, icon: Globe },
    { label: "Location", value: scan.location, icon: Map },
    { label: "Time", value: format(scan.timestamp, 'PPpp') },
    { label: "Duration", value: scan.duration ? `${scan.duration}s` : "N/A" },
    { label: "IP Address", value: scan.ipAddress || "N/A" },
    { label: "Referrer", value: scan.referrer || "Direct" },
    { label: "User Agent", value: scan.userAgent || "N/A" },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Scan Details</DialogTitle>
          <DialogDescription>
            Details for scan of &quot;{scan.qrCode}&quot;
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] mt-4 pr-4">
          <div className="space-y-4">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="flex items-start justify-between border-b pb-2 last:border-0"
              >
                <div className="flex items-center space-x-2">
                  {detail.icon && <detail.icon className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm font-medium">{detail.label}</span>
                </div>
                <span className="text-sm text-muted-foreground break-all">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
