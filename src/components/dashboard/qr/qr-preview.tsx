"use client"

import QRCode from "react-qr-code"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface QRPreviewProps {
  url: string
  name: string
}

export function QRPreview({ url, name }: QRPreviewProps) {
  const downloadQR = () => {
    const svg = document.getElementById("qr-preview")
    const svgData = new XMLSerializer().serializeToString(svg!)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)

    const link = document.createElement("a")
    link.href = svgUrl
    link.download = `${name}-qr.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(svgUrl)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCode
              id="qr-preview"
              value={url}
              level="M"
              size={200}
            />
          </div>
          <Button variant="outline" onClick={downloadQR}>
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


// src/components/dashboard/qr/qr-preview.tsx