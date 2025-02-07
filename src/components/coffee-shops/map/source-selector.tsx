import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPin } from "lucide-react"

interface SourceSelectorProps {
  shops: any[]
  currentSource: any
  onSourceChange: (shop: any) => void
}

export function SourceSelector({ shops, currentSource, onSourceChange }: SourceSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Select
        value={currentSource?.id}
        onValueChange={(value) => {
          const selected = shops.find(shop => shop.id === value)
          if (selected) onSourceChange(selected)
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select starting point">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {currentSource?.title || "Select starting point"}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {shops.map((shop) => (
            <SelectItem key={shop.id} value={shop.id}>
              {shop.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
