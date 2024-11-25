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
        // Find the canvas element
        const canvas = qrRef.current.querySelector('canvas')
        if (!canvas) throw new Error('Canvas element not found')

        // Convert canvas to base64 PNG
        const canvasData = canvas.toDataURL('image/png').replace(/^data:image\/[^;]+;base64,/, '')
        
        // Create SVG string with the canvas data
        const svgString = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
          <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="${canvas.width}" 
            height="${canvas.height}"
            viewBox="0 0 ${canvas.width} ${canvas.height}"
            version="1.1"
          >
            <image 
              width="100%" 
              height="100%" 
              xlink:href="data:image/png;base64,${canvasData}"
            />`

        // Add logo if it exists
        const logoImg = qrRef.current.querySelector('.logo-wrapper img') as HTMLImageElement
        if (logoImg) {
          const logoWrapper = logoImg.parentElement
          if (logoWrapper) {
            const rect = logoWrapper.getBoundingClientRect()
            const containerRect = qrRef.current.getBoundingClientRect()
            
            // Calculate relative position
            const x = ((rect.left - containerRect.left) / containerRect.width) * canvas.width
            const y = ((rect.top - containerRect.top) / containerRect.height) * canvas.height
            const width = (rect.width / containerRect.width) * canvas.width
            const height = (rect.height / containerRect.height) * canvas.height

            // Convert logo to base64
            const logoCanvas = document.createElement('canvas')
            logoCanvas.width = logoImg.naturalWidth
            logoCanvas.height = logoImg.naturalHeight
            const ctx = logoCanvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(logoImg, 0, 0)
              const logoData = logoCanvas.toDataURL('image/png').replace(/^data:image\/[^;]+;base64,/, '')
              
              svgString + `
                <image
                  x="${x}"
                  y="${y}"
                  width="${width}"
                  height="${height}"
                  xlink:href="data:image/png;base64,${logoData}"
                />`
            }
          }
        }

        const finalSvgString = svgString + '</svg>'

        // Create and download SVG file
        const svgBlob = new Blob([finalSvgString], { type: 'image/svg+xml' })
        const svgUrl = URL.createObjectURL(svgBlob)
        const link = document.createElement('a')
        link.href = svgUrl
        link.download = `qr-code-${Date.now()}.svg`
        link.click()
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

        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `qr-code-${Date.now()}.png`
        link.click()
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