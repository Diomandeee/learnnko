"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
 DropdownMenuRadioGroup,
 DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"

type FilterDataType = 'text' | 'number' | 'boolean' | 'date' | 'rating' | 'followers' | 'volume'
type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'startsWith'

interface FilterValueInputProps {
 type: FilterDataType
 value: any
 onChange: (value: any) => void
 operator: FilterOperator
}

export function FilterValueInput({ 
 type, 
 value, 
 onChange, 
 operator 
}: FilterValueInputProps) {
 const [rangeValue, setRangeValue] = useState<{min?: string | number, max?: string | number}>({})

 switch (type) {
   case 'date':
     return (
       <div className="flex flex-col space-y-2">
         <Calendar
           mode={operator === 'between' ? "range" : "single"}
           selected={value}
           onSelect={onChange}
           className="rounded-md border"
         />
       </div>
     )
   
   case 'boolean':
     return (
       <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
         <DropdownMenuRadioItem value="true">Yes</DropdownMenuRadioItem>
         <DropdownMenuRadioItem value="false">No</DropdownMenuRadioItem>
       </DropdownMenuRadioGroup>
     )
   
   case 'number':
   case 'rating':
   case 'followers':
   case 'volume':
     return operator === 'between' ? (
       <div className="flex items-center space-x-2">
         <Input
           type="number"
           value={rangeValue.min ?? ''}
           onChange={e => {
             const newValue = { ...rangeValue, min: e.target.value }
             setRangeValue(newValue)
             onChange(newValue)
           }}
           className="w-20"
           placeholder="Min"
         />
         <span>to</span>
         <Input
           type="number"
           value={rangeValue.max ?? ''}
           onChange={e => {
             const newValue = { ...rangeValue, max: e.target.value }
             setRangeValue(newValue)
             onChange(newValue)
           }}
           className="w-20"
           placeholder="Max"
         />
       </div>
     ) : (
       <Input
         type="number"
         value={value ?? ''}
         onChange={e => onChange(e.target.value)}
         className="w-full"
         placeholder={type === 'rating' ? "0-5" : type === 'followers' ? "Number of followers" : "Enter number"}
       />
     )
   
   default:
     return (
       <Input
         type="text"
         value={value ?? ''}
         onChange={e => onChange(e.target.value)}
         className="w-full"
         placeholder={`Enter ${type}`}
       />
     )
 }
}
