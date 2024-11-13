"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Smartphone, 
  Monitor, 
  Chrome as ChromeIcon,
  Globe,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ScansListProps {
  className?: string
}

export function ScansList({ className }: ScansListProps) {
  const scans = [
    {
      id: "1",
      qrCode: "Website QR",
      device: "Mobile",
      browser: "Chrome",
      location: "United States",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
      id: "2",
      qrCode: "Menu QR",
      device: "Desktop",
      browser: "Other",
      location: "Canada",
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    },
    {
      id: "3",
      qrCode: "Product QR",
      device: "Mobile",
      browser: "Chrome",
      location: "United Kingdom",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    },
    // Add more mock data as needed
  ]

  const getBrowserIcon = (browser: string) => {
    switch (browser.toLowerCase()) {
      case 'chrome':
        return ChromeIcon
      default:
        return Globe
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Scans</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {scans.map((scan) => {
              const BrowserIcon = getBrowserIcon(scan.browser)
              const DeviceIcon = scan.device === "Mobile" ? Smartphone : Monitor
              
              return (
                <div
                  key={scan.id}
                  className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {scan.qrCode}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="mr-1 h-3 w-3" />
                      {scan.location}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                    <BrowserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(scan.timestamp, { addSuffix: true })}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
