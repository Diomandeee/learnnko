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
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { generateFollowUpSuggestions } from "./follow-up-suggestions"
import { CalendarCheck, CalendarX } from "lucide-react"

interface FollowUpCreateDialogProps {
  shops: any[]
  onFollowUpCreated: () => void
}

export function FollowUpCreateDialog({ 
  shops,
  onFollowUpCreated 
}: FollowUpCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const createFollowUp = async (suggestion: any) => {
    try {
      setLoading(true)
      const response = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(suggestion)
      })

      if (!response.ok) throw new Error('Failed to create follow-up')

      toast({
        title: "Follow-up created",
        description: `Follow-up scheduled for ${format(new Date(suggestion.dueDate), 'MMM d, yyyy')}`
      })

      onFollowUpCreated()
      setOpen(false)
    } catch (error) {
      console.error('Error creating follow-up:', error)
      toast({
        title: "Error",
        description: "Failed to create follow-up",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Get suggestions for all shops
  const allSuggestions = shops.flatMap(shop => {
    const suggestions = generateFollowUpSuggestions(shop)
    return suggestions.map(suggestion => ({
      ...suggestion,
      shopName: shop.title
    }))
  })

  // Sort suggestions by priority and due date
  const sortedSuggestions = allSuggestions.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarCheck className="mr-2 h-4 w-4" />
          New Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Follow-up</DialogTitle>
          <DialogDescription>
            Suggested follow-ups based on shop visit history and stages
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {sortedSuggestions.length > 0 ? (
            sortedSuggestions.map((suggestion, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{suggestion.shopName}</CardTitle>
                  <CardDescription>
                    {suggestion.type.split('_').join(' ').toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Due Date:</span>{' '}
                      {format(new Date(suggestion.dueDate), 'MMM d, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Contact Method:</span>{' '}
                      {suggestion.contactMethod}
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>{' '}
                      {'★'.repeat(suggestion.priority)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {suggestion.notes}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => createFollowUp(suggestion)}
                    disabled={loading}
                  >
                    Schedule Follow-up
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <CalendarX className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 font-semibold">No Follow-ups Suggested</h3>
              <p className="text-sm text-muted-foreground">
                There are no suggested follow-ups based on current shop data.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}