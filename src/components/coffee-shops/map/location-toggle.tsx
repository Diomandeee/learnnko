import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface LocationToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export function LocationToggle({ enabled, onChange }: LocationToggleProps) {
  return (
    <div className="flex items-center justify-between space-x-2">
      <Label htmlFor="location-tracking" className="text-sm font-medium">
        Use My Location
      </Label>
      <Switch
        id="location-tracking"
        checked={enabled}
        onCheckedChange={onChange}
      />
    </div>
  )
}
