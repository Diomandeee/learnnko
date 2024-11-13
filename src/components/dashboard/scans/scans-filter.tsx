"use client"

import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarIcon, Download } from "lucide-react"
// import { useState } from "react"

export function ScansFilter() {
  // const [date, setDate] = useState<Date>()

  return (
    <div className="flex items-center space-x-2">
      <Select defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select QR Code" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All QR Codes</SelectItem>
          <SelectItem value="website">Website QR</SelectItem>
          <SelectItem value="menu">Menu QR</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {/* {date ? format(date, "PPP") : "Pick a date"} */}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          {/* <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          /> */}
        </PopoverContent>
      </Popover>

      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  )
}
