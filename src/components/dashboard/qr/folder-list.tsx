"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Folder, Plus, Loader2 } from "lucide-react"

interface Folder {
  id: string
  name: string
  _count: {
    qrCodes: number
  }
}

interface FolderListProps {
  className?: string
  selectedFolderId?: string | null
  onFolderSelect: (folderId: string | null) => void
}

export function FolderList({ className, selectedFolderId, onFolderSelect }: FolderListProps) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")

  async function fetchFolders() {
    try {
      const response = await fetch('/api/folders')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch folders')
      }
      const data = await response.json()
      setFolders(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch folders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFolders()
  }, [])

  async function createFolder() {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      })
      return
    }

    setCreateLoading(true)
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create folder')
      }

      const folder = await response.json()
      setFolders(prev => [folder, ...prev])
      setIsCreating(false)
      setNewFolderName("")
      
      toast({
        title: "Success",
        description: "Folder created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create folder",
        variant: "destructive",
      })
    } finally {
      setCreateLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Folders</h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Folder</DialogTitle>
              <DialogDescription>
                Create a new folder to organize your QR codes
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="My Folder"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreating(false)}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={createFolder}
                disabled={createLoading}
              >
                {createLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Folder"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            !selectedFolderId && "bg-accent"
          )}
          onClick={() => onFolderSelect(null)}
        >
          <Folder className="mr-2 h-4 w-4" />
          All QR Codes
        </Button>
        {folders.map((folder) => (
          <Button
            key={folder.id}
            variant="ghost"
            className={cn(
              "w-full justify-start",
              selectedFolderId === folder.id && "bg-accent"
            )}
            onClick={() => onFolderSelect(folder.id)}
          >
            {folder.name}
            <span className="ml-auto text-xs text-muted-foreground">
              {folder._count.qrCodes}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
