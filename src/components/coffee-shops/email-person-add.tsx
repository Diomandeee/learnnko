"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { 
  UserPlus, 
  Loader2, 
  Mail,
  Phone,
  Tag 
} from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Form validation schema
const personFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

type PersonFormValues = z.infer<typeof personFormSchema>

interface EmailPersonAddProps {
  email: {
    email: string
    email_type: "generic" | "professional"
    first_name: string | null
    last_name: string | null
    verification: {
      status: string
      last_verified_at: string | null
    }
  }
  coffeeShopId: string
  onPersonAdded?: () => void
  disabled?: boolean
}

export function EmailPersonAdd({ 
  email, 
  coffeeShopId, 
  onPersonAdded,
  disabled = false 
}: EmailPersonAddProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Initialize form with email data
  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues: {
      firstName: email.first_name || "",
      lastName: email.last_name || "",
      email: email.email,
      phone: "",
      notes: "",
    },
  })

  async function onSubmit(values: PersonFormValues) {
    if (!coffeeShopId) {
      toast({
        title: "Error",
        description: "Coffee shop ID is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          emailType: email.email_type,
          verificationStatus: email.verification.status,
          lastVerifiedAt: email.verification.last_verified_at,
          coffeeShopId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to add person")
      }

      toast({
        title: "Success",
        description: "Person added successfully",
      })

      setIsOpen(false)
      onPersonAdded?.()
    } catch (error) {
      console.error("Failed to add person:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add person",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="h-8 w-8 p-0"
        title="Add as person"
      >
        <UserPlus className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Person</DialogTitle>
            <DialogDescription>
              Add this email address as a new person
            </DialogDescription>
          </DialogHeader>

          {/* Email verification info */}
          <div className="flex items-center gap-2 my-4">
            <Badge variant={email.email_type === "professional" ? "default" : "secondary"}>
              <Mail className="mr-2 h-4 w-4" />
              {email.email_type}
            </Badge>
            <Badge variant={email.verification.status === "VALID" ? "success" : "secondary"}>
              <Tag className="mr-2 h-4 w-4" />
              {email.verification.status}
            </Badge>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="First name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Last name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input {...field} readOnly className="bg-muted" />
                        <Badge variant="outline">
                          {email.verification.status}
                        </Badge>
                      </div>
                    </FormControl>
                    <FormDescription>
                      This email was discovered through domain search
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Input {...field} type="tel" placeholder="+1 (555) 000-0000" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Optional phone number for contact
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes field */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Add any additional notes about this person..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form actions */}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Person...
                    </>
                  ) : (
                    "Add Person"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}