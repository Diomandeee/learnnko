"use client"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function CoffeeShopHeader() {
   const router = useRouter()
   
   return (
     <div className="flex items-center justify-between">
       <div className="flex items-center gap-4">
         <div>
           <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Coffee Shops</h1>
           <p className="text-sm text-muted-foreground">
             Manage and track coffee shops in your network
           </p>
         </div>
       </div>
       <Button
          onClick={() => router.push("/dashboard/coffee-shops/new")}
          className="flex md:flex"  // Changed from 'hidden md:flex' to 'flex md:flex'
       >
         <PlusCircle className="mr-2 h-4 w-4" />
         Add Shop
       </Button>
     </div>
   )
}