import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function QRCodeSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded w-4/5" />
          <div className="flex justify-end space-x-2 pt-2">
            <div className="h-8 w-8 bg-muted rounded" />
            <div className="h-8 w-8 bg-muted rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
