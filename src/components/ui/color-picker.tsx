"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChromePicker, ColorResult } from 'react-color'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleChange = (color: ColorResult) => {
    onChange(color.hex)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className="h-10 rounded-md border cursor-pointer"
          style={{ backgroundColor: color }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none">
        <ChromePicker
          color={color}
          onChange={handleChange}
          disableAlpha
        />
      </PopoverContent>
    </Popover>
  )
}
