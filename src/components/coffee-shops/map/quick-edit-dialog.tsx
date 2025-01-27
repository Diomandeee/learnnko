"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Settings2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function QuickEditDialog({ shop, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    manager_present: shop.manager_present || "",
    contact_name: shop.contact_name || "",
    contact_email: shop.contact_email || "",
    volume: shop.volume || "",
    first_visit: shop.first_visit ? new Date(shop.first_visit) : null,
    second_visit: shop.second_visit ? new Date(shop.second_visit) : null,
    third_visit: shop.third_visit ? new Date(shop.third_visit) : null,
  })
  const { toast } = useToast()

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await onUpdate(formData)
      setIsOpen(false)
      toast({
        title: "Updated successfully",
        description: "Shop details have been updated."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update shop details.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (field) => (date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Edit - {shop.title}</DialogTitle>
          <DialogDescription>
            Update key information for this location
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Manager Present</Label>
            <Input
              value={formData.manager_present}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                manager_present: e.target.value
              }))}
              placeholder="Manager's name"
            />
          </div>

          <div className="space-y-2">
            <Label>Contact Name</Label>
            <Input
              value={formData.contact_name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contact_name: e.target.value
              }))}
              placeholder="Contact person's name"
            />
          </div>

          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contact_email: e.target.value
              }))}
              placeholder="contact@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Volume (Weekly)</Label>
            <Input
              type="number"
              value={formData.volume}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                volume: e.target.value
              }))}
              placeholder="Weekly volume"
            />
            {formData.volume && (
              <p className="text-sm text-muted-foreground">
                ARR: ${((parseFloat(formData.volume) * 52) * 18).toLocaleString()}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Label>Visit Dates</Label>
            
            {/* First Visit */}
            <div className="flex items-center gap-4">
              <Label className="w-24">First Visit</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.first_visit ? (
                      format(formData.first_visit, 'PPP')
                    ) : (
                      <span>Not set</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.first_visit}
                    onSelect={handleDateSelect('first_visit')}
                    disabled={(date) =>
                      date > new Date() ||
                      (formData.second_visit && date > formData.second_visit)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Second Visit */}
            <div className="flex items-center gap-4">
              <Label className="w-24">Second Visit</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.second_visit ? (
                      format(formData.second_visit, 'PPP')
                    ) : (
                      <span>Not set</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.second_visit}
                    onSelect={handleDateSelect('second_visit')}
                    disabled={(date) =>
                      date > new Date() ||
                      (formData.first_visit && date < formData.first_visit) ||
                      (formData.third_visit && date > formData.third_visit)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Third Visit */}
            <div className="flex items-center gap-4">
              <Label className="w-24">Third Visit</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.third_visit ? (
                      format(formData.third_visit, 'PPP')
                    ) : (
                      <span>Not set</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.third_visit}
                    onSelect={handleDateSelect('third_visit')}
                    disabled={(date) =>
                      date > new Date() ||
                      (formData.second_visit && date < formData.second_visit)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}