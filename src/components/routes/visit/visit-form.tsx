"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { useVisitStore } from "@/store/use-visit"
import { VisitFormData } from "@/types/visit"

const visitFormSchema = z.object({
  date: z.date(),
  managerPresent: z.boolean(),
  managerName: z.string().optional(),
  managerContact: z.string().optional(),
  samplesDropped: z.boolean(),
  sampleDetails: z.string().optional(),
  notes: z.string().optional(),
  nextVisitDate: z.date().optional(),
  photos: z.array(z.instanceof(File)).optional(),
})

interface VisitFormProps {
  shopId: string;
  onComplete: () => void;
}

export function VisitForm({ shopId, onComplete }: VisitFormProps) {
  const [loading, setLoading] = useState(false)
  const { addVisit } = useVisitStore()

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      date: new Date(),
      managerPresent: false,
      samplesDropped: false,
    },
  })

  async function onSubmit(data: VisitFormData) {
    setLoading(true)
    try {
      await addVisit(shopId, data)
      onComplete()
    } catch (error) {
      console.error("Failed to save visit:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visit Date</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date > new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="managerPresent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Manager Present</FormLabel>
                <FormDescription>
                  Was the manager present during the visit?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("managerPresent") && (
          <>
            <FormField
              control={form.control}
              name="managerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager Contact</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="samplesDropped"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Samples Dropped</FormLabel>
                <FormDescription>
                  Did you leave any samples during this visit?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("samplesDropped") && (
          <FormField
            control={form.control}
            name="sampleDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Details</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="List the samples provided..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visit Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Add any notes about the visit..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    field.onChange(files)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextVisitDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Visit Date</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date <= new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onComplete}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Visit"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
