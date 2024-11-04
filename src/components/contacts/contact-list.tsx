"use client";

import { useEffect, useState } from "react";
import { Contact } from "@/types/contacts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Mail,
  Pencil,
  Trash2,
  UserCheck,
  ChevronUp,
  ChevronDown,
  Users,
  UserPlus,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ContactListProps {
  searchQuery?: string;
  statusFilter?: string;
  sortOrder?: string;
  page?: number;
}

const statusColors = {
  NEW: "blue",
  CONTACTED: "yellow",
  QUALIFIED: "green",
  CONVERTED: "purple",
  LOST: "red",
};

export function ContactList({
  searchQuery,
  statusFilter,
  sortOrder,
}: ContactListProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Contact;
    direction: "asc" | "desc";
  }>({
    key: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    async function fetchContacts() {
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set("search", searchQuery);
        if (statusFilter) queryParams.set("status", statusFilter);
        if (sortOrder) queryParams.set("sort", sortOrder);

        const response = await fetch(`/api/contacts?${queryParams}`);
        if (!response.ok) throw new Error("Failed to fetch contacts");

        const data: Contact[] = await response.json();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast({
          title: "Error",
          description: "Failed to load contacts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, [searchQuery, statusFilter, sortOrder]);

  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((contact) => contact.id!));
    }
  };

  const toggleSelectContact = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const handleSort = (key: keyof Contact) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const getSortedContacts = () => {
    return [...contacts].sort((a, b) => {
      if (sortConfig.key && a[sortConfig.key] && b[sortConfig.key]) {
        if (a[sortConfig.key]! < b[sortConfig.key]!) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key]! > b[sortConfig.key]!) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
      }
      return 0;
    });
  };

  const handleDeleteContact = async (contactId: string) => {
    setContactToDelete(contactId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/contacts/${contactToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete contact");

      setContacts(contacts.filter(contact => contact.id !== contactToDelete));
      
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });

      router.refresh();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedContacts.length > 0 && (
        <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
          <p className="text-sm">{selectedContacts.length} contact(s) selected</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Email Selected
            </Button>
            <Button size="sm" variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedContacts.length === contacts.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("firstName")}>
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {sortConfig.key === "firstName" && (
                    sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  {sortConfig.key === "createdAt" && (
                    sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getSortedContacts().map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedContacts.includes(contact.id!)}
                    onCheckedChange={() => toggleSelectContact(contact.id!)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {contact.firstName} {contact.lastName}
                </TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.company || "-"}</TableCell>
                <TableCell>
                  <Badge color={statusColors[contact.status as keyof typeof statusColors]}>
                    {contact.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(contact.createdAt!), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/contacts/${contact.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Update Status
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteContact(contact.id!)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {contacts.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-3">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No contacts found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by adding your first contact.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/contacts/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Contact
            </Link>
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {contacts.length} of {contacts.length} contacts
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled={true}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={true}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}