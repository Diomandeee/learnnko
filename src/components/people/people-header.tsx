"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function PeopleHeader() {
  const router = useRouter()

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">People</h1>
        <p className="text-sm text-muted-foreground">
          Manage and track people in your network
        </p>
      </div>
      <Button 
        onClick={() => router.push("/dashboard/people/new")}
        className="w-full sm:w-auto"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Person
      </Button>
    </div>
  )
}
