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
import { QRDesigner } from "./designer/qr-designer"
import { QRDesignerConfig } from "./designer/types"
import { DeviceRuleForm } from "./device-rule-form"
import { ScheduleRuleForm } from "./schedule-rule-form"
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

type Step = {
 id: "info" | "design" | "device" | "schedule"
 label: string
 isRequired: boolean
}

const STEPS: Step[] = [
 { id: "info", label: "Basic Info", isRequired: true },
 { id: "design", label: "Design", isRequired: false },
 { id: "device", label: "Device Rules", isRequired: false },
 { id: "schedule", label: "Schedule Rules", isRequired: false },
]

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  defaultUrl: z.string()
    .min(1, "URL is required")
    .transform(val => {
      const url = val.trim()
      if (!url.match(/^https?:\/\//i)) {
        return `https://${url}`
      }
      return url
    })
    .refine(
      (val) => {
        try {
          // Add www if needed for validation
          const urlToValidate = val.includes('://') ? val : `https://${val}`
          new URL(urlToValidate)
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
 const [currentStep, setCurrentStep] = useState<Step["id"]>("info")
 const [completedSteps, setCompletedSteps] = useState<Set<Step["id"]>>(new Set())
 const [skippedSteps, setSkippedSteps] = useState<Set<Step["id"]>>(new Set())
 const [progress, setProgress] = useState(0)
 const [isLoading, setIsLoading] = useState(false)
 const [folders, setFolders] = useState<Folder[]>([])
 const [foldersLoading, setFoldersLoading] = useState(true)
 const [createFolderOpen, setCreateFolderOpen] = useState(false)
 const [newFolderName, setNewFolderName] = useState("")
 const [createFolderLoading, setCreateFolderLoading] = useState(false)
 const [shortCode, setShortCode] = useState<string>("")
 
 const [qrConfig, setQRConfig] = useState<QRDesignerConfig>({
   size: 300,
   backgroundColor: '#FFFFFF',
   foregroundColor: '#000000',
   logoWidth: 100,
   logoHeight: 100,
   dotStyle: 'squares',
   margin: 20,
   errorCorrectionLevel: 'M',
   imageRendering: 'auto',
   style: {
     opacity: 100,
     blurRadius: 0,
     brightness: 100,
     contrast: 100,
     borderRadius: 0,
     borderWidth: 0,
     borderColor: '#000000',
     shadowColor: 'rgba(0, 0, 0, 0.5)',
     shadowBlur: 0,
     shadowOffsetX: 0,
     shadowOffsetY: 0,
     gradientType: 'none',
     gradientStart: '#000000',
     gradientEnd: '#FFFFFF',
     gradientRotation: 0,
     padding: 0,
     blend: false,
     blendMode: 'normal'
   },
   logoStyle: {
     opacity: 100,
     blurRadius: 0,
     brightness: 100,
     contrast: 100,
     borderRadius: 0,
     borderWidth: 0,
     borderColor: '#000000',
     shadowColor: 'rgba(0, 0, 0, 0.5)',
     shadowBlur: 0,
     shadowOffsetX: 0,
     shadowOffsetY: 0,
     padding: 0,
     backgroundColor: '#FFFFFF',
     removeBackground: false,
     position: 'center',
     rotation: 0,
     blend: false,
     blendMode: 'normal',
     scale: 1
   }
 })

 const form = useForm<z.infer<typeof formSchema>>({
   resolver: zodResolver(formSchema),
   defaultValues: {
     name: initialData?.name || "",
     defaultUrl: initialData?.defaultUrl ? initialData.defaultUrl.replace(/^https?:\/\//i, '') : "",
     folderId: initialData?.folderId || null,
   },
 })

 useEffect(() => {
   const calculatedProgress = calculateProgress()
   setProgress(calculatedProgress)
 }, [completedSteps, skippedSteps])

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

 const calculateProgress = () => {
   const totalSteps = STEPS.length
   const completed = completedSteps.size
   const skipped = skippedSteps.size
   return ((completed + skipped) / totalSteps) * 100
 }

 const canProceed = () => {
   const currentStepObj = STEPS.find(s => s.id === currentStep)
   if (!currentStepObj) return false

   if (currentStepObj.isRequired) {
     if (currentStepObj.id === "info") {
       return form.formState.isValid
     }
     return completedSteps.has(currentStepObj.id)
   }

   return true
 }

 const handleStepComplete = async (stepId: Step["id"]) => {
   if (stepId === "info") {
     const isValid = await form.trigger()
     if (!isValid) return false
   }

   setCompletedSteps(prev => {
     const next = new Set(prev)
     next.add(stepId)
     return next
   })
   
   return true
 }

 const handleStepSkip = (stepId: Step["id"]) => {
   const step = STEPS.find(s => s.id === stepId)
   if (step && !step.isRequired) {
     setSkippedSteps(prev => {
       const next = new Set(prev)
       next.add(stepId)
       return next
     })
   }
 }

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

 const goToNextStep = async () => {
   const currentIndex = STEPS.findIndex(s => s.id === currentStep)
   const completed = await handleStepComplete(currentStep)
   
   if (completed && currentIndex < STEPS.length - 1) {
     setCurrentStep(STEPS[currentIndex + 1].id)
   }
 }

 const goToPrevStep = () => {
   const currentIndex = STEPS.findIndex(s => s.id === currentStep)
   if (currentIndex > 0) {
     setCurrentStep(STEPS[currentIndex - 1].id)
   }
 }

 const onSubmit = async () => {
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
                       placeholder="" 
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
                        placeholder="" 
                        {...field}
                        value={field.value.replace(/^https?:\/\//i, '')}
                        onChange={(e) => {
                          let value = e.target.value.trim()
                          // Remove protocol if user types it
                          value = value.replace(/^https?:\/\//i, '')
                          // Remove www. if user types it
                          value = value.replace(/^www\./i, '')
                          field.onChange(value)
                        }}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Enter the destination website URL (e.g., example.com)
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
              value={shortCode 
                ? `${SITE_URL}/r/${shortCode}`
                : form.getValues("defaultUrl")
              }
              onConfigChange={setQRConfig}
              defaultConfig={qrConfig}
            />
          </div>
        );
     case "device":
       return <DeviceRuleForm qrCodeId={initialData?.id} />
     case "schedule":
       return <ScheduleRuleForm qrCodeId={initialData?.id} />
     default:
       return null
   }
 }

 return (
   <div className="space-y-6 p-6">
     <div>
       <h3 className="text-lg font-medium">Create QR Code</h3>
       <p className="text-sm text-muted-foreground">
         Complete the required basic information. Other steps are optional.
       </p>
     </div>

     <Progress value={progress} className="h-2" />

     <div className="flex justify-between mb-8">
       {STEPS.map((step) => (
         <button
           key={step.id}
           onClick={() => {
             if (currentStep === "info" && !completedSteps.has("info")) return
             setCurrentStep(step.id)
           }}
           className={`flex flex-col items-center ${
             currentStep === step.id
               ? "text-primary"
               : completedSteps.has(step.id)
               ? "text-green-500"
               : skippedSteps.has(step.id)
               ? "text-orange-500"
               : "text-gray-400"
           }`}
           disabled={!completedSteps.has("info")}
         >
           <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2">
             {completedSteps.has(step.id) ? (
               <CheckCircle2 className="h-4 w-4" />
             ) : skippedSteps.has(step.id) ? (
               "⤍"
             ) : (
               step.id[0].toUpperCase()
             )}
           </div>
           <span className="text-sm">{step.label}</span>
           {step.isRequired && <span className="text-xs text-red-500">*Required</span>}
         </button>
       ))}
     </div>

     <div className="min-h-[400px] border rounded-lg p-6 bg-background">
       {renderStepContent()}
     </div>

     <div className="flex justify-between mt-6">
       <Button
         variant="outline"
         onClick={goToPrevStep}
         disabled={currentStep === "info"}
       >
         Previous
       </Button>

       <div className="space-x-2">
         {!STEPS.find(s => s.id === currentStep)?.isRequired && currentStep !== "info" && (
           <Button
             variant="ghost"
             onClick={() => {
               handleStepSkip(currentStep)
               goToNextStep()
             }}
           >
             Skip this step
           </Button>
         )}
         
         <Button
           onClick={() => {
             if (currentStep === STEPS[STEPS.length - 1].id) {
               onSubmit()
             } else {
               goToNextStep()
             }
           }}
           disabled={!canProceed() || isLoading}
         >
           {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
           {isLoading 
             ? "Creating..." 
             : currentStep === STEPS[STEPS.length - 1].id
             ? "Create QR Code"
             : "Next"}
         </Button>
       </div>
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

// src/components/dashboard/qr/qr-form.tsx