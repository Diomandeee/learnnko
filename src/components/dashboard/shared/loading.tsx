import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function CardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-4">
        <div className="h-4 w-1/3 bg-muted rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-20 bg-muted rounded" />
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function QRCodeSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 w-2/3 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-24 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
