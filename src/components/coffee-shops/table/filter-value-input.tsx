// src/components/coffee-shops/table/filter-value-input.tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { 
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger, 
 SelectValue 
} from "@/components/ui/select"
import {
 Popover,
 PopoverContent,
 PopoverTrigger
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { FilterDataType } from "./filter-configs"

interface FilterValueInputProps {
 type: FilterDataType
 operator: string
 value: any
 onChange: (value: any) => void
 className?: string
 disabled?: boolean
 placeholder?: string
}

export function FilterValueInput({
 type,
 operator,
 value,
 onChange,
 className,
 disabled,
 placeholder
}: FilterValueInputProps) {
 const [isOpen, setIsOpen] = useState(false)

 if (type === 'boolean') {
   return (
     <Select
       value={String(value)}
       onValueChange={(val) => onChange(val === 'true')}
       disabled={disabled}
     >
       <SelectTrigger>
         <SelectValue placeholder="Select..." />
       </SelectTrigger>
       <SelectContent>
         <SelectItem value="true">Yes</SelectItem>
         <SelectItem value="false">No</SelectItem>
       </SelectContent>
     </Select>
   )
 }

 if (type === 'date') {
   if (operator === 'between') {
     return (
       <div className="space-y-2">
         <div className="flex items-center gap-2">
           <Popover>
             <PopoverTrigger asChild>
               <Button
                 variant="outline"
                 className={cn(
                   "justify-start text-left font-normal",
                   !value?.min && "text-muted-foreground"
                 )}
                 disabled={disabled}
               >
                 <CalendarIcon className="mr-2 h-4 w-4" />
                 {value?.min ? format(value.min, "PPP") : "Start date"}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-auto p-0">
               <Calendar
                 mode="single"
                 selected={value?.min}
                 onSelect={(date) => 
                   onChange({ ...value, min: date })
                 }
                 disabled={disabled}
                 initialFocus
               />
             </PopoverContent>
           </Popover>
           <span>to</span>
           <Popover>
             <PopoverTrigger asChild>
               <Button
                 variant="outline"
                 className={cn(
                   "justify-start text-left font-normal",
                   !value?.max && "text-muted-foreground"
                 )}
                 disabled={disabled}
               >
                 <CalendarIcon className="mr-2 h-4 w-4" />
                 {value?.max ? format(value.max, "PPP") : "End date"}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-auto p-0">
               <Calendar
                 mode="single"
                 selected={value?.max}
                 onSelect={(date) => 
                   onChange({ ...value, max: date })
                 }
                 disabled={(date) => 
                   value?.min ? date < value.min : false
                 }
                 initialFocus
               />
             </PopoverContent>
           </Popover>
         </div>
       </div>
     )
   }

   return (
     <Popover open={isOpen} onOpenChange={setIsOpen}>
       <PopoverTrigger asChild>
         <Button
           variant="outline"
           className={cn(
             "justify-start text-left font-normal",
             !value && "text-muted-foreground"
           )}
           disabled={disabled}
         >
           <CalendarIcon className="mr-2 h-4 w-4" />
           {value ? format(value, "PPP") : "Pick a date"}
         </Button>
       </PopoverTrigger>
       <PopoverContent className="w-auto p-0">
         <Calendar
           mode="single"
           selected={value}
           onSelect={(date) => {
             onChange(date)
             setIsOpen(false)
           }}
           disabled={disabled}
           initialFocus
         />
       </PopoverContent>
     </Popover>
   )
 }

 if (operator === 'between') {
   return (
     <div className="space-y-2">
       <div>
         <Label>From</Label>
         <Input
           type={type === 'number' || type === 'volume' ? 'number' : 'text'}
           value={value?.min || ''}
           onChange={(e) => onChange({ ...value, min: e.target.value })}
           className={className}
           disabled={disabled}
           placeholder={placeholder}
         />
       </div>
       <div>
         <Label>To</Label>
         <Input
           type={type === 'number' || type === 'volume' ? 'number' : 'text'}
           value={value?.max || ''}
           onChange={(e) => onChange({ ...value, max: e.target.value })}
           className={className}
           disabled={disabled}
           placeholder={placeholder}
         />
       </div>
     </div>
   )
 }

 // Default text/number input
 return (
   <Input
     type={type === 'number' || type === 'volume' ? 'number' : 'text'}
     value={value || ''}
     onChange={(e) => onChange(e.target.value)}
     className={className}
     disabled={disabled}
     placeholder={placeholder}
   />
 )
}