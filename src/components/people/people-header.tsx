"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function PeopleHeader() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">People</h1>
        <p className="text-sm text-muted-foreground">
          Manage and track people in your network
        </p>
      </div>
      <Button onClick={() => router.push("/dashboard/people/new")}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Person
      </Button>
    </div>
  )
}