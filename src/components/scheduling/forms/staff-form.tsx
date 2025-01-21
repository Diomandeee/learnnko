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
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { StaffRole } from "@prisma/client";

const staffFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["BARISTA", "SOMMELIER", "MANAGER", "EXECUTIVE"]),
  certifications: z.array(z.string()),
  maxHoursPerWeek: z.number().min(1).max(40),
  hourlyRate: z.number().min(1),
  availability: z.array(z.object({
    dayOfWeek: z.number(),
    startTime: z.string(),
    endTime: z.string(),
    recurring: z.boolean(),
  })),
});

type FormValues = z.infer<typeof staffFormSchema>;

interface StaffFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const CERTIFICATIONS = [
  "Barista Level 1",
  "Barista Level 2",
  "Wine Service Level 1",
  "Wine Service Level 2",
  "Food Safety",
  "First Aid",
];

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function StaffForm({ initialData, onSubmit, onCancel }: StaffFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      role: "BARISTA",
      certifications: [],
      maxHoursPerWeek: 40,
      hourlyRate: 20,
      availability: DAYS_OF_WEEK.map((_, index) => ({
        dayOfWeek: index,
        startTime: "09:00",
        endTime: "17:00",
        recurring: true,
      })),
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Doe"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(StaffRole).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxHoursPerWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Hours per Week</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
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
          name="hourlyRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hourly Rate ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="certifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certifications</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                {CERTIFICATIONS.map((cert) => (
                  <div key={cert} className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value?.includes(cert)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...(field.value || []), cert]
                          : field.value?.filter((c) => c !== cert) || [];
                        field.onChange(newValue);
                      }}
                      disabled={loading}
                    />
                    <span className="text-sm">{cert}</span>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="font-medium">Availability</h3>
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={day} className="grid grid-cols-3 gap-4 items-center">
              <div className="text-sm font-medium">{day}</div>
              <FormField
                control={form.control}
                name={`availability.${index}.startTime`}
                render={({ field }) => (
                  <FormItem>
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
                name={`availability.${index}.endTime`}
                render={({ field }) => (
                  <FormItem>
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
          ))}
        </div>

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
            {loading ? "Saving..." : initialData ? "Update Staff" : "Add Staff"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
