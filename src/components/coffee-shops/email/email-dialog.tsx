"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { CoffeeShop } from "@prisma/client"

interface EmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedShops: CoffeeShop[]
}

export function EmailDialog({
  open,
  onOpenChange,
  selectedShops = []
}: EmailDialogProps) {
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  // Filter valid emails
  const validEmails = selectedShops
    .filter(shop => shop?.contact_email)
    .map(shop => shop.contact_email) as string[]

  const DebugInfo = () => (
    <div className="mb-4 p-2 bg-muted rounded-md text-xs space-y-1">
      <div>Selected Shops: {selectedShops.length}</div>
      <div>With Email Field: {validEmails.length}</div>
      {validEmails.length > 0 && (
        <div>Valid Emails: {validEmails.join(', ')}</div>
      )}
    </div>
  )

  const handleSend = async () => {
    if (!subject || !body) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    if (!validEmails.length) {
      toast({
        title: "Error",
        description: "No valid email addresses found",
        variant: "destructive"
      })
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/coffee-shops/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: validEmails,
          subject,
          body,
          shopIds: selectedShops.map(shop => shop.id)
        })
      })

      if (!response.ok) throw new Error("Failed to send emails")

      toast({
        title: "Success",
        description: `Emails sent to ${validEmails.length} recipients`
      })

      onOpenChange(false)
      setSubject("")
      setBody("")
    } catch (error) {
      console.error("Email sending error:", error)
      toast({
        title: "Error",
        description: "Failed to send emails",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Email to Selected Partners</DialogTitle>
          <DialogDescription>
            {validEmails.length > 0 ? (
              <>
                Sending to {validEmails.length} recipient{validEmails.length === 1 ? '' : 's'}
                <div className="mt-1 text-xs text-muted-foreground">
                  Recipients: {validEmails.join(", ")}
                </div>
              </>
            ) : (
              <>
                No valid email addresses found in selected shops
                <div className="mt-2 text-xs text-muted-foreground">
                  Selected shops must have valid contact_email fields.
                </div>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DebugInfo />

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter your message..."
              className="min-h-[200px]"
              disabled={sending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSend}
            disabled={sending || validEmails.length === 0}
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Email'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
