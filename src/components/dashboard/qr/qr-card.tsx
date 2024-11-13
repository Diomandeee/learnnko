// src/components/dashboard/qr/qr-card.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import QRCode from "react-qr-code"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
 Edit, 
 FileDown, 
 ExternalLink, 
 Trash2, 
 MoreHorizontal,
 Loader2 
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
 DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const SITE_URL = "https://bufbarista-crm.vercel.app"

interface QRCodeData {
 id: string
 name: string
 shortCode: string
 defaultUrl: string
 scans: number
 isActive: boolean
 createdAt: Date
 folderId: string | null
}

interface QRCardProps {
 qrCode: QRCodeData
 onDelete?: (qrCode: QRCodeData) => Promise<void>
 selected?: boolean
 onSelect?: () => void
 className?: string
}
export function QRCard({ 
  qrCode, 
  onDelete, 
  selected,
  onSelect,
  className 
}: QRCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const qrUrl = `${SITE_URL}/r/${qrCode.shortCode}`

  const downloadQRAsImage = async () => {
    try {
      setDownloadLoading(true)
      const svg = document.getElementById(`qr-${qrCode.id}`) as unknown as SVGElement | null
      if (!svg) throw new Error('QR code element not found')

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error('Could not get canvas context')
      
      const multiplier = 4
      canvas.width = 150 * multiplier
      canvas.height = 150 * multiplier
      
      const svgData = new XMLSerializer().serializeToString(svg)
      const img = new Image()
      
      img.onload = () => {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        const pngFile = canvas.toDataURL("image/png")
        
        const downloadLink = document.createElement("a")
        downloadLink.download = `${qrCode.name}-qr.png`
        downloadLink.href = pngFile
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        setDownloadLoading(false)
        
        toast({
          title: "Success",
          description: "QR code downloaded as PNG",
        })
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
      
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      })
      setDownloadLoading(false)
    }
  }

  const downloadQRAsSVG = async () => {
    try {
      setDownloadLoading(true)
      const svg = document.getElementById(`qr-${qrCode.id}`) as unknown as SVGElement | null
      if (!svg) throw new Error('QR code element not found')

      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      const downloadLink = document.createElement("a")
      downloadLink.href = svgUrl
      downloadLink.download = `${qrCode.name}-qr.svg`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(svgUrl)
      setDownloadLoading(false)

      toast({
        title: "Success",
        description: "QR code downloaded as SVG",
      })
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      })
      setDownloadLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleteLoading(true)
    try {
      await onDelete(qrCode)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting QR code:", error)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <Card 
        className={cn(
          "transition-all duration-200",
          selected && "ring-2 ring-primary",
          "cursor-pointer hover:shadow-md",
          className
        )}
        onClick={(e) => {
          // Don't trigger selection when clicking interactive elements
          if (
            (e.target as HTMLElement).closest('button') ||
            (e.target as HTMLElement).closest('a')
          ) {
            return;
          }
          onSelect?.();
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{qrCode.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant={qrCode.isActive ? "default" : "secondary"}>
                {qrCode.isActive ? "Active" : "Inactive"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/qr/${qrCode.id}`} className="flex items-center">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/r/${qrCode.shortCode}`} 
                      target="_blank"
                      className="flex items-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View live
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={downloadQRAsImage}
                    disabled={downloadLoading}
                  >
                    {downloadLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="mr-2 h-4 w-4" />
                    )}
                    Download PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={downloadQRAsSVG}
                    disabled={downloadLoading}
                  >
                    {downloadLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="mr-2 h-4 w-4" />
                    )}
                    Download SVG
                  </DropdownMenuItem>
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center bg-white p-4 rounded-lg">
            <QRCode
              id={`qr-${qrCode.id}`}
              value={qrUrl}
              level="M"
              size={150}
            />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Short Code</span>
              <span className="font-medium">{qrCode.shortCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scans</span>
              <span className="font-medium">{qrCode.scans || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(qrCode.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete QR Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this QR code? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


// src/components/dashboard/qr/qr-card.tsx