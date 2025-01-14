"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShiftType } from "@prisma/client";
import { format } from "date-fns";

const shiftFormSchema = z.object({
  type: z.enum(['COFFEE', 'WINE']),
  startTime: z.string(),
  endTime: z.string(),
  date: z.date(),
  requiredRoles: z.array(z.object({
    roleId: z.string(),
    name: z.string(),
    requiredCertifications: z.array(z.string()),
    minStaffCount: z.number().min(1),
  })),
  notes: z.string().optional(),
});

type ShiftFormValues = z.infer<typeof shiftFormSchema>;

interface ShiftFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function ShiftForm({ initialData, onSubmit, onCancel }: ShiftFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: initialData || {
      type: 'COFFEE' as ShiftType,
      date: new Date(),
      startTime: format(new Date(), 'HH:mm'),
      endTime: format(new Date(), 'HH:mm'),
      requiredRoles: [],
      notes: '',
    },
  });

  const handleSubmit = async (data: ShiftFormValues) => {
    try {
      setLoading(true);
      // Combine date and time for startTime and endTime
      const [startHour, startMinute] = data.startTime.split(':');
      const [endHour, endMinute] = data.endTime.split(':');
      
      const startTime = new Date(data.date);
      startTime.setHours(parseInt(startHour), parseInt(startMinute));
      
      const endTime = new Date(data.date);
      endTime.setHours(parseInt(endHour), parseInt(endMinute));

      const shiftData = {
        ...data,
        startTime,
        endTime,
      };

      await onSubmit(shiftData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="COFFEE">Coffee Service</SelectItem>
                  <SelectItem value="WINE">Wine Service</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={format(field.value, 'yyyy-MM-dd')}
                    onChange={e => field.onChange(new Date(e.target.value))}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={loading}
                  placeholder="Add any additional notes about this shift..."
                  className="h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Update Shift" : "Create Shift"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
