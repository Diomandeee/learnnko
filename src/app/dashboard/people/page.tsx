// src/app/dashboard/people/page.tsx
import { PeopleTable } from "@/components/people/people-table"
import { PeopleHeader } from "@/components/people/people-header"
import { PeopleStats } from "@/components/people/people-stats"
import { PageContainer } from "@/components/layout/page-container";
export const metadata = {
  title: "People | BUF BARISTA CRM",
  description: "Manage your people",
}

export default function PeoplePage() {
  return (
    <PageContainer>

    <div className="container mx-auto max-w-[95%] py-10 space-y-8">
      <PeopleHeader />
      <PeopleStats />
      <PeopleTable />
    </div>
    </PageContainer>

  )
}