"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  MoreHorizontal, 
  Trash2, 
  Mail, 
  Share2, 
  Download,
  Edit,
  Star,
  UserCheck,
  Shield,
  Tag,
  Calendar,
  RefreshCw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CoffeeShop } from "@prisma/client"
import { EmailDialog } from "../email/email-dialog"

interface BulkActionsProps {
  selectedIds: string[]
  onDeleteSelected: () => Promise<void>
  onUpdateSelected?: (field: keyof CoffeeShop, value: any) => Promise<void>
  onExportSelected?: () => Promise<void>
  disabled?: boolean
  selectedCount?: number
  selectedShops: CoffeeShop[]
}

export function BulkActions({
  selectedIds,
  onDeleteSelected,
  onUpdateSelected,
  onExportSelected,
  disabled = false,
  selectedCount = 0,
  selectedShops = []
}: BulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await onDeleteSelected()
      setShowDeleteDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailClick = () => {
    console.group('Bulk Actions - Email Click')
    console.log('Selected IDs:', selectedIds)
    console.log('Selected Shops:', selectedShops)
    console.log('Shops with emails:', selectedShops.filter(shop => shop?.contact_email))
    console.log('Email addresses:', selectedShops.map(shop => shop?.contact_email).filter(Boolean))
    console.groupEnd()
    setShowEmailDialog(true)
  }

  const shopsWithEmailCount = selectedShops.filter(shop => shop?.contact_email).length

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            disabled={selectedIds.length === 0 || disabled}
          >
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Bulk Actions
            {selectedIds.length > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2"
              >
                {selectedIds.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          {/* Visit Status */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              Visit Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => onUpdateSelected?.('visited', true)}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark as Visited
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateSelected?.('visited', false)}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark as Not Visited
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Partner Status */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Shield className="h-4 w-4 mr-2" />
              Partner Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => onUpdateSelected?.('isPartner', true)}
              >
                Mark as Partner
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateSelected?.('isPartner', false)}
              >
                Mark as Not Partner
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Lead Status */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Tag className="h-4 w-4 mr-2" />
              Lead Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => 
                  onUpdateSelected?.('parlor_coffee_leads', true)
                }
              >
                Mark as Lead
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => 
                  onUpdateSelected?.('parlor_coffee_leads', false)
                }
              >
                Remove Lead Status
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Priority */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Star className="h-4 w-4 mr-2" />
              Set Priority
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {[1, 2, 3, 4, 5].map((priority) => (
                <DropdownMenuItem
                  key={priority}
                  onClick={() => onUpdateSelected?.('priority', priority)}
                >
                  {Array(priority)
                    .fill('★')
                    .join('')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleEmailClick}>
            <Mail className="h-4 w-4 mr-2" />
            Email Selected
            <span className="ml-2 text-xs text-muted-foreground">
              ({shopsWithEmailCount} with email)
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => alert('Share feature coming soon')}>
            <Share2 className="h-4 w-4 mr-2" />
            Share List
          </DropdownMenuItem>

          {onExportSelected && (
            <DropdownMenuItem onClick={onExportSelected}>
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected items? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Dialog */}
      {showEmailDialog && (
        <EmailDialog
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          selectedShops={selectedShops}
        />
      )}
    </>
  )
}
