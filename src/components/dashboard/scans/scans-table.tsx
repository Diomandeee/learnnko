"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScanDetailsDialog } from "./scan-details-dialog"
import { 
  Smartphone, 
  Monitor, 
  Chrome as ChromeIcon,
  Globe 
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ScansTableProps {
  className?: string
}

export function ScansTable({ className }: ScansTableProps) {
  const scans = [
    {
      id: "1",
      qrCode: "Website QR",
      device: "Mobile",
      browser: "Chrome",
      location: "United States",
      timestamp: new Date(),
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0...",
      referrer: "https://example.com",
      duration: 45,
    },
    // Add more scans...
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
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>QR Code</TableHead>
            <TableHead>Device</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scans.map((scan) => {
            const BrowserIcon = getBrowserIcon(scan.browser)
            const DeviceIcon = scan.device === "Mobile" ? Smartphone : Monitor

            return (
              <TableRow key={scan.id}>
                <TableCell className="font-medium">{scan.qrCode}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                    <BrowserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell>{scan.location}</TableCell>
                <TableCell>
                  {formatDistanceToNow(scan.timestamp, { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <ScanDetailsDialog scan={scan} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
