import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { 
  Loader2, 
  Pencil, 
  Save, 
  X,
  FolderEdit,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface QRCode {
  id: string
  name: string
  shortCode: string
  defaultUrl: string
  isActive: boolean
  createdAt: string
  folderId: string | null
  folder?: {
    id: string
    name: string
  }
}

interface Folder {
  id: string
  name: string
}

interface QRCodesTableProps {
  folderId?: string | null
}

export function QRCodesTable({ folderId }: QRCodesTableProps) {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQRs, setSelectedQRs] = useState<Set<string>>(new Set())
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set())
  const [editedValues, setEditedValues] = useState<Record<string, Partial<QRCode>>>({})
  const [bulkEditDialog, setBulkEditDialog] = useState(false)
  const [bulkEditValues, setBulkEditValues] = useState<{
    defaultUrl?: string
    folderId?: string | null
  }>({})
  const [savingBulk, setSavingBulk] = useState(false)

  // Fetch QR codes and folders
  useEffect(() => {
    async function fetchData() {
      try {
        const [qrResponse, folderResponse] = await Promise.all([
          fetch('/api/qr'),
          fetch('/api/folders')
        ])

        if (!qrResponse.ok || !folderResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const qrData = await qrResponse.json()
        const folderData = await folderResponse.json()

        const filteredQRs = folderId
          ? qrData.filter((qr: QRCode) => qr.folderId === folderId)
          : qrData

        setQrCodes(filteredQRs)
        setFolders(folderData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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

  const startEditing = (id: string) => {
    setEditingRows(new Set([...editingRows, id]))
    const qr = qrCodes.find(q => q.id === id)
    if (qr) {
      setEditedValues(prev => ({
        ...prev,
        [id]: {
          defaultUrl: qr.defaultUrl,
          folderId: qr.folderId
        }
      }))
    }
  }

  const stopEditing = (id: string) => {
    const newEditingRows = new Set(editingRows)
    newEditingRows.delete(id)
    setEditingRows(newEditingRows)
    setEditedValues(prev => {
      const newValues = { ...prev }
      delete newValues[id]
      return newValues
    })
  }

  const updateEditedValue = (id: string, field: keyof QRCode, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  const saveRow = async (id: string) => {
    const values = editedValues[id]
    if (!values) return

    try {
      const response = await fetch(`/api/qr/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (!response.ok) throw new Error('Failed to update QR code')

      const updatedQR = await response.json()
      setQrCodes(prev => prev.map(qr => qr.id === id ? updatedQR : qr))
      stopEditing(id)
      toast({
        title: "Success",
        description: "QR code updated successfully"
      })
    } catch (error) {
      console.error('Error updating QR code:', error)
      toast({
        title: "Error",
        description: "Failed to update QR code",
        variant: "destructive"
      })
    }
  }

  const saveBulkEdit = async () => {
    if (!selectedQRs.size || !Object.keys(bulkEditValues).length) return

    setSavingBulk(true)
    try {
      const updatePromises = Array.from(selectedQRs).map(id =>
        fetch(`/api/qr/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bulkEditValues)
        })
      )

      const results = await Promise.allSettled(updatePromises)
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failCount = results.filter(r => r.status === 'rejected').length

      const response = await fetch('/api/qr')
      if (response.ok) {
        const data = await response.json()
        setQrCodes(folderId ? data.filter((qr: QRCode) => qr.folderId === folderId) : data)
      }

      setBulkEditDialog(false)
      setSelectedQRs(new Set())
      setBulkEditValues({})

      if (failCount === 0) {
        toast({
          title: "Success",
          description: `Updated ${successCount} QR codes successfully`
        })
      } else {
        toast({
          title: "Partial Success",
          description: `Updated ${successCount} QR codes, failed to update ${failCount}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error in bulk update:', error)
      toast({
        title: "Error",
        description: "Failed to update QR codes",
        variant: "destructive"
      })
    } finally {
      setSavingBulk(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-background/95 sticky top-0 z-10 py-4">
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
          {selectedQRs.size > 0 && (
            <Button
              variant="outline"
              onClick={() => setBulkEditDialog(true)}
            >
              <FolderEdit className="h-4 w-4 mr-2" />
              Bulk Edit
            </Button>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <span className="sr-only">Selection</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Default URL</TableHead>
                <TableHead>Folder</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.map(qr => (
                <TableRow key={qr.id}>
                  <TableCell className="p-0 text-center">
                    <Checkbox
                      checked={selectedQRs.has(qr.id)}
                      onCheckedChange={() => toggleQRSelection(qr.id)}
                      aria-label={`Select QR code ${qr.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{qr.name}</span>
                    <br />
                    <Badge className="mt-0.5">
                      /{qr.shortCode}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {editingRows.has(qr.id) ? (
                      <Input
                        type="url"
                        value={editedValues[qr.id]?.defaultUrl || ""}
                        onChange={(e) =>
                          updateEditedValue(qr.id, "defaultUrl", e.target.value)
                        }
                        placeholder="https://example.com"
                      />
                    ) : (
                      qr.defaultUrl
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRows.has(qr.id) ? (
                      <Select
                        onValueChange={(value) =>
                          updateEditedValue(
                            qr.id,
                            "folderId",
                            value === "none" ? null : value
                          )
                        }
                        value={
                          editedValues[qr.id]?.folderId || qr.folderId || "none"
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No folder</SelectItem>
                          {folders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      qr.folder?.name || <span className="italic">No folder</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={qr.isActive ? "outline" : "secondary"}>
                      {qr.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(qr.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="p-0 text-center">
                    {editingRows.has(qr.id) ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => saveRow(qr.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => stopEditing(qr.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditing(qr.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={bulkEditDialog} onOpenChange={setBulkEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Edit QR Codes</DialogTitle>
            <DialogDescription>
              Apply changes to the selected QR codes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default URL</label>
              <Input
                type="url"
                value={bulkEditValues.defaultUrl || ""}
                onChange={(e) =>
                  setBulkEditValues((prev) => ({
                    ...prev,
                    defaultUrl: e.target.value,
                  }))
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Folder</label>
              <Select
                onValueChange={(value) =>
                  setBulkEditValues((prev) => ({
                    ...prev,
                    folderId: value === "none" ? null : value,
                  }))
                }
                value={bulkEditValues.folderId || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveBulkEdit} disabled={savingBulk}>
              {savingBulk && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
