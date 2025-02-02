import { Metadata } from "next"
import { NewPersonForm } from "@/components/people/new-person-form"
import { PageContainer } from "@/components/layout/page-container"

export const metadata: Metadata = {
  title: "Add Person | Milk Man CRM",
  description: "Add a new person to your network",
}

export default function NewPersonPage() {
  return (
    <PageContainer>
    <div className="flex-1 space-y-4 p-8 pt-6">
     <NewPersonForm />
    </div>
    </PageContainer>

  )
}
