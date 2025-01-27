import { Metadata } from "next"
import { NewPersonForm } from "@/components/people/new-person-form"

export const metadata: Metadata = {
  title: "Add Person | BUF BARISTA CRM",
  description: "Add a new person to your network",
}

export default function NewPersonPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h1 className="text-3xl font-bold tracking-tight">Add New Person</h1>
      <NewPersonForm />
    </div>
  )
}
