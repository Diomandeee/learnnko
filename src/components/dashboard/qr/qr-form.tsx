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
import { DeviceRuleForm } from "./device-rule-form"
import { ScheduleRuleForm } from "./schedule-rule-form"
import { QRDesigner } from "./designer/qr-designer"
import { QRDesignerConfig } from "./designer/types"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, CheckCircle2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

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
    const url = val.trim().replace(/^https?:\/\//i, '')
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

type Step = "info" | "design" | "device" | "schedule" | "review"
const STEPS: Step[] = ["info", "design", "device", "schedule", "review"]

export function QRForm({ initialData }: QRFormProps) {
 const router = useRouter()
 const [currentStep, setCurrentStep] = useState<Step>("info")
 const [isLoading, setIsLoading] = useState(false)
 const [folders, setFolders] = useState<Folder[]>([])
 const [foldersLoading, setFoldersLoading] = useState(true)
 const [qrConfig, setQRConfig] = useState<QRDesignerConfig | null>(null)
 const [createFolderOpen, setCreateFolderOpen] = useState(false)
 const [newFolderName, setNewFolderName] = useState("")
 const [createFolderLoading, setCreateFolderLoading] = useState(false)
 const [shortCode, setShortCode] = useState<string>("")
 const [progress, setProgress] = useState(0)

 const form = useForm<z.infer<typeof formSchema>>({
   resolver: zodResolver(formSchema),
   defaultValues: {
     name: initialData?.name || "",
     defaultUrl: initialData?.defaultUrl ? initialData.defaultUrl.replace(/^https?:\/\//i, '') : "",
     folderId: initialData?.folderId || null,
   },
 })

 useEffect(() => {
   const stepIndex = STEPS.indexOf(currentStep)
   setProgress((stepIndex / (STEPS.length - 1)) * 100)
 }, [currentStep])

 const handleNext = async () => {
   const currentIndex = STEPS.indexOf(currentStep)
   
   if (currentStep === "info") {
     const isValid = await form.trigger(["name", "defaultUrl"])
     if (!isValid) return
   }

   if (currentStep === "design" && !qrConfig) {
     toast({
       title: "Error",
       description: "Please design your QR code first",
       variant: "destructive",
     })
     return
   }

   if (currentIndex < STEPS.length - 1) {
     setCurrentStep(STEPS[currentIndex + 1])
   }
 }

 const handleBack = () => {
   const currentIndex = STEPS.indexOf(currentStep)
   if (currentIndex > 0) {
     setCurrentStep(STEPS[currentIndex - 1])
   }
 }

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

 const onSubmit = async () => {
   if (currentStep !== "review") {
     return handleNext()
   }

   setIsLoading(true)
   
   try {
     const values = form.getValues()
     const payload = {
       name: values.name,
       defaultUrl: values.defaultUrl,
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

 const renderStepContent = () => {
   switch (currentStep) {
     case "info":
       return (
         <Form {...form}>
           <form className="space-y-4">
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
           </form>
         </Form>
       )

     case "design":
       return (
        <div className="space-y-4">
        {form.getValues("defaultUrl") && (
          <div className="p-4 rounded-lg bg-muted mb-4">
            <p className="text-sm text-muted-foreground">
              Your QR code will use a short URL that redirects to your destination URL.
            </p>
            <p className="text-sm mt-2">
              <span className="font-medium">Destination URL:</span>{" "}
              <code className="px-2 py-1 rounded bg-background">
                {form.getValues("defaultUrl")}
              </code>
            </p>
          </div>
        )}
         <QRDesigner
           value={form.getValues("defaultUrl")}
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
          </div>

       )

     case "device":
       return <DeviceRuleForm qrCodeId={initialData?.id} />

     case "schedule":
       return <ScheduleRuleForm qrCodeId={initialData?.id} />

     case "review":
       return (
         <div className="space-y-4">
           <div className="rounded-lg border p-4">
             <h4 className="font-medium mb-2">Basic Information</h4>
             <dl className="space-y-2">
               <div>
                 <dt className="text-sm text-muted-foreground">Name</dt>
                 <dd>{form.getValues("name")}</dd>
               </div>
               <div>
                 <dt className="text-sm text-muted-foreground">URL</dt>
                 <dd>{form.getValues("defaultUrl")}</dd>
               </div>
             </dl>
           </div>
           <QRDesigner
             value={form.getValues("defaultUrl")}
             onConfigChange={setQRConfig}
             defaultConfig={qrConfig || {
               size: 300,
               backgroundColor: '#ffffff',
               foregroundColor: '#000000',
               dotStyle: 'squares',
               margin: 10,
               errorCorrectionLevel: 'M',
             }}
           />
         </div>
       )
   }
 }

 return (
   <div className="space-y-6 p-6">
     <div>
       <h3 className="text-lg font-medium">Create QR Code</h3>
       <p className="text-sm text-muted-foreground">
         Follow the steps below to create your QR code.
       </p>
     </div>

     <Progress value={progress} className="h-2" />

     <div className="flex items-center justify-between">
       {STEPS.map((step, index) => (
         <div
           key={step}
           className={`flex items-center ${
             STEPS.indexOf(currentStep) >= index ? "text-primary" : "text-muted-foreground"
           }`}
         >
           <div className="flex items-center justify-center w-8 h-8 rounded-full border">
             {STEPS.indexOf(currentStep) > index ? (
               <CheckCircle2 className="h-5 w-5" />
             ) : (
               <span>{index + 1}</span>
             )}
           </div>
           <span className="ml-2 capitalize">{step}</span>
         </div>
       ))}
     </div>

     <div className="mt-6">
       {renderStepContent()}
     </div>

     <div className="flex justify-between mt-6">
       <Button
         variant="outline"
         onClick={handleBack}
         disabled={currentStep === "info"}
       >
         Back
       </Button>
       <Button
         onClick={currentStep === "review" ? onSubmit : handleNext}
         disabled={isLoading}
       >
         {isLoading ? (
           <>
           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             Creating...
           </>
         ) : currentStep === "review" ? (
           "Create QR Code"
         ) : (
           "Next"
         )}
       </Button>
     </div>

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