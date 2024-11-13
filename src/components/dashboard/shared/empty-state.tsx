import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
  icon?: React.ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="rounded-full bg-muted p-3 mb-4">{icon}</div>}
      <CardHeader className="space-y-1 p-0 mb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && (
        <CardContent className="p-0">
          <Link href={action.href}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  )
}
