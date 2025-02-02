"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { 
  MoreHorizontal, 
  Trash2, 
  Mail, 
  Share2, 
  Download,
  Loader2
} from "lucide-react";
import { Contact } from "@/types/contacts";
import { EmailDialog } from "./email/email-dialog";

interface BulkActionsProps {
  selectedIds: string[];
  onSuccess: () => void;
  selectedContacts: Contact[];
}

export function BulkActions({ selectedIds, onSuccess, selectedContacts }: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/contacts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      );

      toast({
        title: "Success",
        description: `Updated ${selectedIds.length} contacts`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contacts",
        variant: "destructive",
      });
      console.error("Failed to update contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteContacts = async () => {
    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/contacts/${id}`, {
            method: "DELETE",
          })
        )
      );

      toast({
        title: "Success",
        description: `Deleted ${selectedIds.length} contacts`,
      });
      setDeleteDialogOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contacts",
        variant: "destructive",
      });
      console.error("Failed to delete contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={selectedIds.length === 0}>
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => updateStatus("NEW")}>
            Mark as New
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => updateStatus("CONTACTED")}>
            Mark as Contacted
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => updateStatus("QUALIFIED")}>
            Mark as Qualified
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => updateStatus("CONVERTED")}>
            Mark as Converted
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => updateStatus("LOST")}>
            Mark as Lost
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => setEmailDialogOpen(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Email Selected
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Share2 className="h-4 w-4 mr-2" />
            Share List
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onSelect={() => setDeleteDialogOpen(true)} 
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contacts</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.length} contacts? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteContacts} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <EmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        selectedContacts={selectedContacts}
      />
    </>
  );
}
