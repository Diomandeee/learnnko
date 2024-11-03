"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Contact } from "@/types/contacts";

interface DataExportProps {
  contacts: Contact[];
}

export function DataExport({ contacts }: DataExportProps) {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    setExporting(true);
    try {
      // Create CSV headers
      const headers = [
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Company",
        "Status",
        "Notes",
        "Created At",
      ].join(",");

      // Create CSV rows
      const rows = contacts.map(contact => [
        contact.firstName,
        contact.lastName,
        contact.email,
        contact.phone || "",
        contact.company || "",
        contact.status,
        (contact.notes || "").replace(/,/g, ";"), // Replace commas in notes
        new Date(contact.createdAt!).toISOString(),
      ].join(","));

      // Combine headers and rows
      const csv = [headers, ...rows].join("\n");

      // Create and download file
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportToCSV}
      disabled={exporting || contacts.length === 0}
    >
      <Download className="h-4 w-4 mr-2" />
      {exporting ? "Exporting..." : "Export"}
    </Button>
  );
}
