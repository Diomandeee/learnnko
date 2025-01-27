"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Mail, Pencil, UserPlus, X } from "lucide-react"

interface Owner {
 id: string
 name: string
 email: string
}

interface OwnerCellProps {
 owners: Owner[]
 onUpdate: (owners: Owner[]) => Promise<void>
}

export function OwnerCell({ owners, onUpdate }: OwnerCellProps) {
 const [isEditing, setIsEditing] = useState(false)
 const [editingOwners, setEditingOwners] = useState(owners)
 const [isUpdating, setIsUpdating] = useState(false)

 const addOwner = () => {
   setEditingOwners([...editingOwners, { id: Date.now().toString(), name: '', email: '' }])
 }

 const removeOwner = (index: number) => {
   const newOwners = editingOwners.filter((_, i) => i !== index)
   setEditingOwners(newOwners)
 }

 const updateOwner = (index: number, field: 'name' | 'email', value: string) => {
   const newOwners = [...editingOwners]
   newOwners[index] = { ...newOwners[index], [field]: value }
   setEditingOwners(newOwners)
 }

 const handleSave = async () => {
   setIsUpdating(true)
   try {
     await onUpdate(editingOwners)
     setIsEditing(false)
   } catch (error) {
     toast({
       title: "Error",
       description: "Failed to update owners",
       variant: "destructive"
     })
   } finally {
     setIsUpdating(false)
   }
 }

 if (isEditing) {
   return (
     <div className="space-y-2">
       {editingOwners.map((owner, index) => (
         <div key={index} className="flex items-center gap-2">
           <Input
             placeholder="Name"
             value={owner.name}
             onChange={(e) => updateOwner(index, 'name', e.target.value)}
             className="w-[120px]"
           />
           <Input
             placeholder="Email"
             value={owner.email}
             onChange={(e) => updateOwner(index, 'email', e.target.value)}
             className="w-[180px]"
           />
           <Button
             variant="ghost"
             size="sm"
             onClick={() => removeOwner(index)}
             disabled={isUpdating}
           >
             <X className="h-4 w-4" />
           </Button>
         </div>
       ))}
       <div className="flex items-center gap-2 mt-2">
         <Button
           variant="outline"
           size="sm"
           onClick={addOwner}
           disabled={isUpdating}
         >
           <UserPlus className="h-4 w-4 mr-2" />
           Add Owner
         </Button>
         <Button
           size="sm"
           onClick={handleSave}
           disabled={isUpdating}
         >
           Save
         </Button>
         <Button
           variant="ghost"
           size="sm"
           onClick={() => {
             setIsEditing(false)
             setEditingOwners(owners)
           }}
           disabled={isUpdating}
         >
           Cancel
         </Button>
       </div>
     </div>
   )
 }

 return (
   <div className="space-y-1">
     {owners.map((owner, index) => (
       <div key={index} className="flex items-center gap-2">
         <span className="text-sm">{owner.name}</span>
         <a
           href={`mailto:${owner.email}`}
           className="text-blue-600 hover:underline text-sm flex items-center gap-1"
           onClick={(e) => e.stopPropagation()}
         >
           <Mail className="h-3 w-3" />
           {owner.email}
         </a>
       </div>
     ))}
     <Button
       variant="ghost"
       size="sm"
       onClick={() => setIsEditing(true)}
     >
       <Pencil className="h-3 w-3" />
     </Button>
   </div>
 )
}
