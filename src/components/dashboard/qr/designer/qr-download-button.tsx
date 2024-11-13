import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import html2canvas from 'html2canvas'
import { toast } from "@/components/ui/use-toast"

interface QRDownloadButtonProps {
  qrRef: React.RefObject<HTMLDivElement>
  format: 'svg' | 'png'
}

export function QRDownloadButton({ qrRef, format }: QRDownloadButtonProps) {
  const downloadQRCode = async () => {
    if (!qrRef.current) return

    try {
      if (format === 'svg') {
        // Download as SVG
        const svg = qrRef.current.querySelector('svg')
        if (!svg) throw new Error('SVG element not found')

        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const svgUrl = URL.createObjectURL(svgBlob)

        const link = document.createElement('a')
        link.href = svgUrl
        link.download = `qr-code-${Date.now()}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(svgUrl)
      } else {
        // Download as PNG
        const canvas = await html2canvas(qrRef.current, {
          backgroundColor: null,
          scale: 4,
          logging: false,
          useCORS: true,
          allowTaint: true,
        })

        const pngUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = pngUrl
        link.download = `qr-code-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      toast({
        title: 'Success',
        description: `QR code downloaded as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Error downloading QR code:', error)
      toast({
        title: 'Error',
        description: 'Failed to download QR code',
        variant: 'destructive',
      })
    }
  }

  return (
    <Button variant="outline" onClick={downloadQRCode}>
      <Download className="mr-2 h-4 w-4" />
      Download {format.toUpperCase()}
    </Button>
  )
}
