"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShiftForm } from "@/components/scheduling/forms/shift-form";

interface ShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
}

export function ShiftDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: ShiftDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      await onSubmit(data);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Shift" : "Create New Shift"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the shift details below"
              : "Fill in the shift details below"}
          </DialogDescription>
        </DialogHeader>
        <ShiftForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
