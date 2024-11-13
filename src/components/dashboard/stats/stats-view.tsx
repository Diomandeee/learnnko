import { StatsCards } from "./stats-cards"
import { StatsChart } from "./stats-chart"
import { OverviewChart } from "./overview-chart"
import { StatsBreakdown } from "./stats-breakdown"

export function StatsView() {
  return (
    <div className="space-y-8">
      <StatsCards />
      <div className="grid gap-8 md:grid-cols-2">
        <StatsChart />
        <StatsBreakdown />
      </div>
      <OverviewChart />
    </div>
  )
}
