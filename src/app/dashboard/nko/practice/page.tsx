"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardNkoPracticePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Client-side redirect to the new N'Ko practice page
    router.replace("/nko/practice")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Redirecting to N'Ko Practice...</span>
      </div>
    </div>
  )
}
