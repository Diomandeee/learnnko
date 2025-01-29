// editable-cell.tsx
import { useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Pencil, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string | null;
  onUpdate: (value: string | null) => Promise<void>;
  type?: "text" | "number" | "instagram" | "email" | "manager" | "owners" | "notes" | "volume";
  className?: string;
}

export function EditableCell({ value, onUpdate, type = "text", className }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await onUpdate(editValue || null);
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        {type === "notes" ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px] w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSave();
              }
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditValue(value || "");
              }
            }}
            disabled={isUpdating}
            autoFocus
          />
        ) : (
          <Input
            type={type === "number" || type === "volume" ? "number" : "text"}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={cn("w-full", className)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditValue(value || "");
              }
            }}
            disabled={isUpdating}
            autoFocus
          />
        )}
        <Button size="sm" onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <span className="animate-spin">...</span>
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsEditing(false);
            setEditValue(value || "");
          }}
          disabled={isUpdating}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between group cursor-pointer p-2 rounded hover:bg-muted/50",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      {type === "instagram" && value ? (
        <a
          href={`https://instagram.com/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          @{value}
        </a>
      ) : type === "email" && value ? (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      ) : (
        <span>{value || "-"}</span>
      )}
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
    </div>
  );
}

interface DateCellProps {
  date: Date | null;
  onUpdate: (date: Date | null) => Promise<void>;
  onRemove: () => Promise<void>;
}

export function DateCell({ date, onUpdate, onRemove }: DateCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDateSelect = async (newDate: Date | undefined) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await onUpdate(newDate || null);
      setIsOpen(false);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await onRemove();
      setIsOpen(false);
    } catch (error) {
      console.error("Remove error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[120px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={isUpdating}
        >
          {date ? format(date, "MMM d, yyyy") : "Not set"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
        {date && (
          <Button
            variant="destructive"
            size="sm"
            className="mt-2 w-full"
            onClick={handleRemove}
            disabled={isUpdating}
          >
            Remove Date
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface StarRatingProps {
  value: number;
  onUpdate: (value: number) => Promise<void>;
  className?: string;
}

export function StarRating({ value, onUpdate, className }: StarRatingProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (newValue: number) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      await onUpdate(newValue);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4 cursor-pointer transition-colors",
            star <= value ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
          )}
          onClick={() => handleUpdate(star)}
        />
      ))}
    </div>
  );
}