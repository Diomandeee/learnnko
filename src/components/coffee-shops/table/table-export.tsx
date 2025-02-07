import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileDown, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Papa from 'papaparse';
import { CoffeeShop } from "@prisma/client";

interface TableExportProps {
  data: CoffeeShop[];
}

// Define available columns and their labels
const AVAILABLE_COLUMNS = [
  { key: 'title', label: 'Name' },
  { key: 'address', label: 'Address' },
  { key: 'area', label: 'Area' },
  { key: 'website', label: 'Website' },
  { key: 'manager_present', label: 'Manager Present' },
  { key: 'contact_name', label: 'Contact Name' },
  { key: 'contact_email', label: 'Contact Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'visited', label: 'Visited' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'followers', label: 'Followers' },
  { key: 'store_doors', label: 'Store Doors' },
  { key: 'volume', label: 'Volume' },
  { key: 'rating', label: 'Rating' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'price_type', label: 'Price Type' },
  { key: 'type', label: 'Type' },
  { key: 'types', label: 'Types' },
  { key: 'first_visit', label: 'First Visit' },
  { key: 'second_visit', label: 'Second Visit' },
  { key: 'third_visit', label: 'Third Visit' },
  { key: 'notes', label: 'Notes' },
  { key: 'priority', label: 'Priority' },
  { key: 'isPartner', label: 'Is Partner' },
  { key: 'stage', label: 'Stage' },
  { key: 'service_options', label: 'Service Options' },
  { key: 'hours', label: 'Hours' },
  { key: 'quality_score', label: 'Quality Score' },
  { key: 'parlor_coffee_leads', label: 'Parlor Coffee Leads' },
] as const;

export function TableExport({ data }: TableExportProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['title', 'address', 'area']);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleColumn = (columnKey: string) => {
    setSelectedColumns(current => {
      const newSelection = new Set(current);
      if (newSelection.has(columnKey)) {
        newSelection.delete(columnKey);
      } else {
        newSelection.add(columnKey);
      }
      return Array.from(newSelection);
    });
  };

  const handleGenerateExport = () => {
    if (selectedColumns.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one column to export",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Format data for export
      const exportData = data.map(shop => {
        const row: Record<string, any> = {};
        selectedColumns.forEach(column => {
          let value = shop[column];
          
          // Format specific fields
          if (column === 'first_visit' || column === 'second_visit' || column === 'third_visit') {
            value = value ? new Date(value).toLocaleDateString() : '';
          } else if (column === 'types') {
            value = Array.isArray(value) ? value.join(', ') : '';
          } else if (column === 'isPartner' || column === 'visited' || column === 'parlor_coffee_leads') {
            value = value ? 'Yes' : 'No';
          } else if (column === 'service_options') {
            value = value ? JSON.stringify(value) : '';
          } else if (column === 'volume' && value) {
            const arr = ((parseFloat(value) * 52) * 18);
            row['ARR'] = arr ? `$${arr.toLocaleString()}` : '';
          }
          
          row[AVAILABLE_COLUMNS.find(col => col.key === column)?.label || column] = value || '';
        });
        return row;
      });

      // Generate CSV
      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `coffee-shops-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast({
        title: "Success",
        description: "Table exported successfully"
      });
    } catch (error) {
      console.error('Error exporting table:', error);
      toast({
        title: "Error",
        description: "Failed to export table",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-[150px] justify-between">
            <FileDown className="mr-2 h-4 w-4" />
            <span>Select Columns</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="end">
          <Command>
            <CommandInput placeholder="Search columns..." />
            <CommandList>
              <CommandEmpty>No columns found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {AVAILABLE_COLUMNS.map((column) => (
                    <CommandItem
                      key={column.key}
                      onSelect={() => toggleColumn(column.key)}
                      className="flex items-center space-x-2 px-4 py-2 cursor-pointer hover:bg-accent"
                    >
                      <Checkbox
                        checked={selectedColumns.includes(column.key)}
                        className="mr-2"
                        onCheckedChange={() => toggleColumn(column.key)}
                      />
                      <span>{column.label}</span>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        onClick={handleGenerateExport}
        size="sm"
        disabled={selectedColumns.length === 0 || isLoading}
      >
        {isLoading ? (
          <>
            <Download className="mr-2 h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Export Table
          </>
        )}
      </Button>
    </div>
  );
}