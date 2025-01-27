"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Save,
  Map,
  Phone,
  Mail,
  Building,
  DollarSign,
} from "lucide-react"

export function NavigationControls({
  currentLocation,
  canMoveNext,
  canMovePrevious,
  onMoveNext,
  onMovePrevious,
  onLocationUpdate,
  transportMode,
  currentStep,
  totalSteps,
}) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editedLocation, setEditedLocation] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setEditedLocation(currentLocation)
  }, [currentLocation])

  const handleLocationUpdate = async () => {
    setIsUpdating(true)
    try {
      await onLocationUpdate(editedLocation)
      setShowEditDialog(false)
      toast({
        title: "Success",
        description: "Location information updated successfully."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update location information.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const generateGoogleMapsUrl = () => {
    if (!currentLocation) return null;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${currentLocation.latitude},${currentLocation.longitude}&travelmode=${transportMode.toLowerCase()}`;
    window.open(url, '_blank');
  }

  return (
    <div className="space-y-4">
      {/* Current Location Info */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Current Location</h3>
          <Badge variant="outline">
            {currentStep + 1} of {totalSteps}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{currentLocation?.title}</span>
          </div>
          <p className="text-sm text-muted-foreground">{currentLocation?.address}</p>
          
          {currentLocation?.volume && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Volume: {currentLocation.volume} | ARR: ${((parseFloat(currentLocation.volume) * 52) * 18).toLocaleString()}</span>
            </div>
          )}
          
          {currentLocation?.manager_present && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>Manager: {currentLocation.manager_present}</span>
            </div>
          )}

          {currentLocation?.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{currentLocation.phone}</span>
            </div>
          )}

          {currentLocation?.contact_email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{currentLocation.contact_email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={onMovePrevious}
          disabled={!canMovePrevious}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={onMoveNext}
          disabled={!canMoveNext}
          className="w-full"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full">
              <Edit2 className="mr-2 h-4 w-4" />
              Update Info
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Location Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Manager Present</Label>
                <Input
                  value={editedLocation?.manager_present || ""}
                  onChange={(e) => setEditedLocation({
                    ...editedLocation,
                    manager_present: e.target.value
                  })}
                  placeholder="Manager's name"
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={editedLocation?.contact_email || ""}
                  onChange={(e) => setEditedLocation({
                    ...editedLocation,
                    contact_email: e.target.value
                  })}
                  placeholder="Contact email"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editedLocation?.phone || ""}
                  onChange={(e) => setEditedLocation({
                    ...editedLocation,
                    phone: e.target.value
                  })}
                  placeholder="Phone number"
                />
              </div>

              <div className="space-y-2">
                <Label>Volume (Weekly)</Label>
                <Input
                  type="number"
                  value={editedLocation?.volume || ""}
                  onChange={(e) => setEditedLocation({
                    ...editedLocation,
                    volume: e.target.value
                  })}
                  placeholder="Weekly volume"
                />
                {editedLocation?.volume && (
                  <p className="text-sm text-muted-foreground">
                    ARR: ${((parseFloat(editedLocation.volume) * 52) * 18).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editedLocation?.notes || ""}
                  onChange={(e) => setEditedLocation({
                    ...editedLocation,
                    notes: e.target.value
                  })}
                  placeholder="Add notes about this location..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLocationUpdate}
                disabled={isUpdating}
              >
                <Save className="mr-2 h-4 w-4" />
                {isUpdating ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="secondary" onClick={generateGoogleMapsUrl} className="w-full">
          <Map className="mr-2 h-4 w-4" />
          Open in Maps
        </Button>
      </div>
    </div>
  )
}