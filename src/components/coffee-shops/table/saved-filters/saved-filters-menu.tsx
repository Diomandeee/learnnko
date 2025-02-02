"use client"

import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Filter, Save, Star, Trash2, BookMarked } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SavedFilter {
  id: string
  name: string
  filters: any[]
  isDefault: boolean
}

interface SavedFiltersMenuProps {
  activeFilters: any[]
  onLoadFilter: (filters: any[]) => void
  disabled?: boolean
}

export function SavedFiltersMenu({
  activeFilters,
  onLoadFilter,
  disabled = false
}: SavedFiltersMenuProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Load saved filters
  useEffect(() => {
    const fetchSavedFilters = async () => {
      try {
        const response = await fetch('/api/coffee-shops/filters')
        if (!response.ok) throw new Error('Failed to fetch saved filters')
        const data = await response.json()
        setSavedFilters(data)
      } catch (error) {
        console.error('Error fetching saved filters:', error)
      }
    }

    fetchSavedFilters()
  }, [])

  // Load default filter if exists
  useEffect(() => {
    const defaultFilter = savedFilters.find(filter => filter.isDefault)
    if (defaultFilter && activeFilters.length === 0) {
      onLoadFilter(defaultFilter.filters)
    }
  }, [savedFilters, activeFilters.length, onLoadFilter])

  const handleSave = async () => {
    if (!saveName) {
      toast({
        title: "Error",
        description: "Please enter a name for your filter",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/coffee-shops/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName,
          filters: activeFilters,
          isDefault
        })
      })

      if (!response.ok) throw new Error('Failed to save filter')

      const savedFilter = await response.json()
      setSavedFilters(prev => [savedFilter, ...prev])
      setShowSaveDialog(false)
      setSaveName("")
      setIsDefault(false)

      toast({
        title: "Success",
        description: "Filter saved successfully"
      })
    } catch (error) {
      console.error('Error saving filter:', error)
      toast({
        title: "Error",
        description: "Failed to save filter",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/coffee-shops/filters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (!response.ok) throw new Error('Failed to delete filter')

      setSavedFilters(prev => prev.filter(filter => filter.id !== id))
      
      toast({
        title: "Success",
        description: "Filter deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting filter:', error)
      toast({
        title: "Error",
        description: "Failed to delete filter",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2" disabled={disabled}>
            <BookMarked className="h-4 w-4" />
            Saved Filters
            {savedFilters.length > 0 && (
              <Badge variant="secondary">
                {savedFilters.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Saved Filters</DropdownMenuLabel>
          
          {savedFilters.length > 0 ? (
            <>
              {savedFilters.map(filter => (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => onLoadFilter(filter.filters)}
                >
                  <span className="flex-1">{filter.name}</span>
                  {filter.isDefault && (
                    <Star className="h-4 w-4 text-yellow-500 ml-2" />
                  )}
                  <Trash2
                    className="h-4 w-4 text-destructive ml-2 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(filter.id)
                    }}
                  />
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          ) : (
            <DropdownMenuItem disabled>
              No saved filters
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => setShowSaveDialog(true)}
            disabled={activeFilters.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Current Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter</DialogTitle>
            <DialogDescription>
              Save your current filter configuration for quick access later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Filter Name</Label>
              <Input
                id="name"
                placeholder="Enter a name for your filter"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
              <Label htmlFor="default">Set as default filter</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Filter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
