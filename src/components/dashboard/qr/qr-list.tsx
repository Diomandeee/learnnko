"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRCard } from "./qr-card"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Trash2, Plus } from "lucide-react"
import Link from "next/link"

// Update interface to match QRCard's QRCodeData interface
interface QRCode {
  id: string
  name: string
  shortCode: string
  defaultUrl: string
  isActive: boolean
  createdAt: Date
  folderId: string | null
  scans: number
}

interface QRCodeListProps {
  folderId?: string | null
  className?: string
}

export function QRCodeList({ folderId }: QRCodeListProps) {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQRs, setSelectedQRs] = useState<Set<string>>(new Set())
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false)
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)

  useEffect(() => {
    async function fetchQRCodes() {
      try {
        const response = await fetch('/api/qr')
        if (!response.ok) {
          throw new Error('Failed to fetch QR codes')
        }

        const data = await response.json()
        
        // Transform the data to match our interface
        const transformedData = data.map((qr: QRCode) => ({
          ...qr,
          createdAt: new Date(qr.createdAt), // Ensure createdAt is a Date object
          scans: qr.scans || 0 // Ensure scans has a default value
        }))
        
        const filteredData = folderId
          ? transformedData.filter((qr: QRCode) => qr.folderId === folderId)
          : transformedData

        setQrCodes(filteredData)
      } catch (error) {
        console.error('Error fetching QR codes:', error)
        toast({
          title: "Error",
          description: "Failed to fetch QR codes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchQRCodes()
  }, [folderId])

  const toggleQRSelection = (id: string) => {
    const newSelected = new Set(selectedQRs)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedQRs(newSelected)
  }

  const toggleAllQRs = () => {
    if (selectedQRs.size === qrCodes.length) {
      setSelectedQRs(new Set())
    } else {
      setSelectedQRs(new Set(qrCodes.map(qr => qr.id)))
    }
  }

  const deleteQRCode = async (qrCode: QRCode) => {
    try {
      const response = await fetch(`/api/qr/${qrCode.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete QR code')

      setQrCodes(prev => prev.filter(qr => qr.id !== qrCode.id))
      setSelectedQRs(prev => {
        const newSet = new Set(prev)
        newSet.delete(qrCode.id)
        return newSet
      })

      toast({
        title: "Success",
        description: "QR code deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting QR code:', error)
      toast({
        title: "Error",
        description: "Failed to delete QR code",
        variant: "destructive",
      })
    }
  }

  const bulkDeleteQRCodes = async () => {
    setBulkDeleteLoading(true)
    try {
      const deletePromises = Array.from(selectedQRs).map(id =>
        fetch(`/api/qr/${id}`, { method: 'DELETE' })
      )
      
      const results = await Promise.allSettled(deletePromises)
      
      const successCount = results.filter(result => result.status === 'fulfilled').length
      const failCount = results.filter(result => result.status === 'rejected').length

      setQrCodes(prevCodes => prevCodes.filter(qr => !selectedQRs.has(qr.id)))
      setSelectedQRs(new Set())
      setBulkDeleteDialog(false)

      if (failCount === 0) {
        toast({
          title: "Success",
          description: `Successfully deleted ${successCount} QR code${successCount !== 1 ? 's' : ''}`
        })
      } else {
        toast({
          title: "Partial Success",
          description: `Deleted ${successCount} QR codes, but failed to delete ${failCount}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error in bulk delete:', error)
      toast({
        title: "Error",
        description: "Failed to delete QR codes",
        variant: "destructive"
      })
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (qrCodes.length === 0) {
    return (
      <Card>
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground">
            {folderId 
              ? "Add QR codes to this folder to see them here."
              : "Create your first QR code to get started with dynamic redirects and analytics."}
          </p>
          <Link href="/qr/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create {folderId ? "a" : "your first"} QR code
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-background/95 sticky top-0 z-10 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="select-all"
              checked={selectedQRs.size === qrCodes.length && qrCodes.length > 0}
              onCheckedChange={toggleAllQRs}
              aria-label="Select all QR codes"
            />
            <label
              htmlFor="select-all"
              className="text-sm text-muted-foreground select-none"
            >
              {selectedQRs.size === 0 
                ? "Select items" 
                : `${selectedQRs.size} selected`}
            </label>
          </div>
          <div className="flex items-center gap-2">
            {selectedQRs.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {qrCodes.map((qrCode) => (
            <div key={qrCode.id} className="relative group">
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  id={`select-${qrCode.id}`}
                  checked={selectedQRs.has(qrCode.id)}
                  onCheckedChange={() => toggleQRSelection(qrCode.id)}
                  aria-label={`Select ${qrCode.name}`}
                />
              </div>
              <QRCard
                qrCode={qrCode}
                onDelete={deleteQRCode}
                selected={selectedQRs.has(qrCode.id)}
                onSelect={() => toggleQRSelection(qrCode.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <Dialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete QR Codes</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedQRs.size} QR code{selectedQRs.size !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialog(false)}
              disabled={bulkDeleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={bulkDeleteQRCodes}
              disabled={bulkDeleteLoading}
            >
              {bulkDeleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Selected"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}