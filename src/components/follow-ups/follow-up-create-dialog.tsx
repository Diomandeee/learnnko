"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { CoffeeShop } from "@prisma/client"

interface FollowUpCreateDialogProps {
  shops: CoffeeShop[]
  onFollowUpCreated: () => void
}

const formSchema = z.object({
  coffeeShopId: z.string({
    required_error: "Please select a coffee shop",
  }),
  type: z.enum(['INITIAL_CONTACT', 'SAMPLE_DELIVERY', 'PROPOSAL_FOLLOW', 'TEAM_MEETING', 'CHECK_IN', 'GENERAL'], {
    required_error: "Please select a follow-up type",
  }),
  priority: z.number().min(1).max(5),
  dueDate: z.date({
    required_error: "Please select a due date",
  }),
  contactMethod: z.enum(['call', 'email', 'visit', 'text'], {
    required_error: "Please select a contact method",
  }),
  notes: z.string().optional(),
})

export function FollowUpCreateDialog({ shops, onFollowUpCreated }: FollowUpCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: 3,
      type: 'GENERAL',
      contactMethod: 'call',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error('Failed to create follow-up')

      toast({
        title: "Success",
        description: "Follow-up created successfully",
      })

      onFollowUpCreated()
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error creating follow-up:', error)
      toast({
        title: "Error",
        description: "Failed to create follow-up",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Follow-up</DialogTitle>
          <DialogDescription>
            Create a new follow-up task for a coffee shop
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="coffeeShopId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coffee Shop</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a coffee shop" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.title}
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-up Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INITIAL_CONTACT">Initial Contact</SelectItem>
                      <SelectItem value="SAMPLE_DELIVERY">Sample Delivery</SelectItem>
                      <SelectItem value="PROPOSAL_FOLLOW">Proposal Follow-up</SelectItem>
                      <SelectItem value="TEAM_MEETING">Team Meeting</SelectItem>
                      <SelectItem value="CHECK_IN">Check In</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority (1-5)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={5} 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    5 is highest priority, 1 is lowest
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="visit">Visit</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any relevant notes..."
                      className="resize-none"
                      {...field}
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
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Follow-up"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}