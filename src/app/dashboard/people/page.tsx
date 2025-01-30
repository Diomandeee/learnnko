import { ResponsivePeopleTable } from "@/components/people/responsive-people-table"
import { PeopleHeader } from "@/components/people/people-header"
import { PeopleStats } from "@/components/people/people-stats"
import { PageContainer } from "@/components/layout/page-container"

export const metadata = {
  title: "People | Milk Man CRM",
  description: "Manage your people",
}

export default function PeoplePage() {
  return (
    <PageContainer>
      <div className="flex flex-col space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="w-full -mx-4 px-4 sm:mx-0 sm:px-0">
          <PeopleHeader />
        </div>
        
        <div className="w-full -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="overflow-hidden rounded-none sm:rounded-lg">
            <PeopleStats />
          </div>
        </div>
        
        <div className="w-full -mx-4 sm:mx-0">
          <div className="overflow-hidden rounded-none sm:rounded-lg">
            <ResponsivePeopleTable />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}