"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
 Form,
 FormControl,
 FormDescription,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from "@/components/ui/form"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeviceRuleForm } from "./device-rule-form"
import { ScheduleRuleForm } from "./schedule-rule-form"
import { QRDesigner } from "./designer/qr-designer"
import { QRDesignerConfig } from "./designer/types"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, ArrowRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog"


const SITE_URL = "https://bufbarista-crm.vercel.app"

interface Folder {
 id: string
 name: string
}

const formSchema = z.object({
 name: z.string().min(2, {
   message: "Name must be at least 2 characters.",
 }),
 defaultUrl: z.string()
   .min(1, "URL is required")
   .transform(val => {
     // Remove any protocol and trim
     const url = val.trim().replace(/^https?:\/\//i, '')
     // Add https:// protocol
     return `https://${url}`
   })
   .refine(
     (val) => {
       try {
         new URL(val)
         return true
       } catch {
         return false
       }
     },
     "Please enter a valid URL"
   ),
 folderId: z.string().nullable(),
})
interface QRFormProps {
  initialData?: {
    name: string
    defaultUrl: string
    folderId: string | null
    id?: string
  }
 }
 
 export function QRForm({ initialData }: QRFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [foldersLoading, setFoldersLoading] = useState(true)
  const [qrConfig, setQRConfig] = useState<QRDesignerConfig | null>(null)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [createFolderLoading, setCreateFolderLoading] = useState(false)
  const [shortCode, setShortCode] = useState<string>("")

 const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: initialData?.name || "",
    defaultUrl: initialData?.defaultUrl ? initialData.defaultUrl.replace(/^https?:\/\//i, '') : "",
    folderId: initialData?.folderId || null,
  },
})

 useEffect(() => {
   async function loadFolders() {
     try {
       const response = await fetch('/api/folders')
       if (!response.ok) {
         const error = await response.json()
         throw new Error(error.message || 'Failed to fetch folders')
       }
       const data = await response.json()
       setFolders(data)
     } catch (error) {
       console.error('Error loading folders:', error)
       toast({
         title: "Error",
         description: "Failed to load folders",
         variant: "destructive",
       })
     } finally {
       setFoldersLoading(false)
     }
   }

   loadFolders()
 }, [])

 const createFolder = async () => {
   if (!newFolderName.trim()) {
     toast({
       title: "Error",
       description: "Please enter a folder name",
       variant: "destructive",
     })
     return
   }

   setCreateFolderLoading(true)
   try {
     const response = await fetch('/api/folders', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         name: newFolderName.trim(),
       }),
     })

     if (!response.ok) {
       const error = await response.json()
       throw new Error(error.error || 'Failed to create folder')
     }

     const newFolder = await response.json()
     
     setFolders(prev => [...prev, newFolder])
     form.setValue('folderId', newFolder.id)
     setCreateFolderOpen(false)
     setNewFolderName("")
     
     toast({
       title: "Success",
       description: "Folder created and selected",
     })
   } catch (error) {
     console.error('Error creating folder:', error)
     toast({
       title: "Error",
       description: error instanceof Error ? error.message : "Failed to create folder",
       variant: "destructive",
     })
   } finally {
     setCreateFolderLoading(false)
   }
 }

 const onSubmit = async (values: z.infer<typeof formSchema>) => {
   setIsLoading(true)
   
   try {
     // Here we pass the already transformed URL from the schema
     const payload = {
       name: values.name,
       defaultUrl: values.defaultUrl, // Schema has already added https://
       folderId: values.folderId,
       design: qrConfig
     }

     console.log('Submitting payload:', payload)

     const response = await fetch('/api/qr', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(payload)
     })

     if (!response.ok) {
       const error = await response.json()
       throw new Error(error.error || 'Failed to create QR code')
     }

     const data = await response.json()
     setShortCode(data.shortCode)

     toast({
       title: "Success!",
       description: "QR code created successfully.",
     })

     router.push('/dashboard/qr')
     router.refresh()
   } catch (error) {
     console.error("Error creating QR code:", error)
     toast({
       title: "Error",
       description: error instanceof Error ? error.message : "Failed to create QR code",
       variant: "destructive",
     })
   } finally {
     setIsLoading(false)
   }
 }

 return (
   <div className="space-y-6 p-6">
     <div>
       <h3 className="text-lg font-medium">Create QR Code</h3>
       <p className="text-sm text-muted-foreground">
         Fill in the details below to create your QR code.
       </p>
     </div>

     <Tabs defaultValue="basic" className="space-y-4">
       <TabsList>
         <TabsTrigger value="basic">Basic Info</TabsTrigger>
         <TabsTrigger value="design">Design</TabsTrigger>
         <TabsTrigger value="device">Device Rules</TabsTrigger>
         <TabsTrigger value="schedule">Schedule Rules</TabsTrigger>
       </TabsList>

       <TabsContent value="basic">
         <Form {...form}>
           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
               control={form.control}
               name="name"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Name</FormLabel>
                   <FormControl>
                     <Input 
                       placeholder="My QR Code" 
                       {...field} 
                       disabled={isLoading}
                     />
                   </FormControl>
                   <FormDescription>
                     A name to help you identify this QR code.
                   </FormDescription>
                   <FormMessage />
                 </FormItem>
               )}
             />

             <FormField
               control={form.control}
               name="defaultUrl"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Destination URL</FormLabel>
                   <FormControl>
                     <div className="flex flex-col space-y-2">
                       <div className="flex items-center space-x-2">
                         <span className="text-sm text-muted-foreground">https://</span>
                         <Input 
                           placeholder="example.com" 
                           {...field}
                           value={field.value.replace(/^https?:\/\//i, '')}
                           disabled={isLoading}
                         />
                       </div>
                       {field.value && (
                         <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                           <span>Redirect URL:</span>
                           <span className="bg-muted px-2 py-1 rounded flex items-center">
                             {SITE_URL}/r/{shortCode}
                             <ArrowRight className="h-4 w-4 mx-1" />
                           </span>
                         </div>
                       )}
                     </div>
                   </FormControl>
                   <FormDescription>
                     Enter the destination website URL without the protocol
                   </FormDescription>
                   <FormMessage />
                 </FormItem>
               )}
             />

             <FormField
               control={form.control}
               name="folderId"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Folder (Optional)</FormLabel>
                   <Select
                     disabled={foldersLoading}
                     onValueChange={(value) => {
                       if (value === "new") {
                         setCreateFolderOpen(true)
                         return;
                       }
                       field.onChange(value === "none" ? null : value)
                     }}
                     value={field.value || "none"}
                   >
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Select a folder">
                           {field.value === null
                             ? "No folder"
                             : folders.find(f => f.id === field.value)?.name || "Select a folder"}
                         </SelectValue>
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       <SelectItem value="none">No folder</SelectItem>
                       <Separator className="my-2" />
                       {folders.map((folder) => (
                         <SelectItem key={folder.id} value={folder.id}>
                           {folder.name}
                         </SelectItem>
                       ))}
                       <Separator className="my-2" />
                       <Button
                         variant="ghost"
                         className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                         onClick={(e) => {
                           e.preventDefault()
                           setCreateFolderOpen(true)
                         }}
                       >
                         <Plus className="mr-2 h-4 w-4" />
                         Create New Folder
                       </Button>
                     </SelectContent>
                   </Select>
                   <FormDescription>
                     Organize your QR code in a folder
                   </FormDescription>
                   <FormMessage />
                 </FormItem>
               )}
             />

             <Button 
               type="submit" 
               disabled={isLoading}
               className="w-full"
             >
               {isLoading ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Creating...
                 </>
               ) : (
                 "Create QR Code"
               )}
             </Button>
           </form>
         </Form>
       </TabsContent>

       <TabsContent value="design">
      <QRDesigner
        value={`${SITE_URL}/r/${shortCode || "example-code"}`}
        onConfigChange={setQRConfig}
        defaultConfig={{
          size: 300,
          backgroundColor: '#ffffff',
          foregroundColor: '#000000',
          dotStyle: 'squares',
          margin: 10,
          errorCorrectionLevel: 'M',
        }}
      />
    </TabsContent>

       <TabsContent value="device">
         <DeviceRuleForm qrCodeId={initialData?.id} />
       </TabsContent>

       <TabsContent value="schedule">
         <ScheduleRuleForm qrCodeId={initialData?.id} />
       </TabsContent>
     </Tabs>

     <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>Create New Folder</DialogTitle>
           <DialogDescription>
             Enter a name for your new folder.
           </DialogDescription>
         </DialogHeader>
         <div className="grid gap-4 py-4">
           <div className="grid gap-2">
             <Label>Folder Name</Label>
             <Input
               id="folderName"
               value={newFolderName}
               onChange={(e) => setNewFolderName(e.target.value)}
               placeholder="My Folder"
               autoComplete="off"
               onKeyDown={(e) => {
                 if (e.key === 'Enter') {
                   e.preventDefault()
                   createFolder()
                 }
               }}
             />
           </div>
         </div>
         <DialogFooter>
           <Button
             variant="outline"
             onClick={() => {
               setCreateFolderOpen(false)
               setNewFolderName("")
             }}
             disabled={createFolderLoading}
           >
             Cancel
           </Button>
           <Button
             onClick={createFolder}
             disabled={createFolderLoading || !newFolderName.trim()}
           >
             {createFolderLoading ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 Creating...
               </>
             ) : (
               "Create Folder"
             )}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   </div>
 )
}